package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Buka gerbang buat React
	},
}

// Struktur Data Pesan Chat
type ChatMessage struct {
	OrderID  string `json:"order_id"`
	SenderID string `json:"sender_id"`
	Role     string `json:"role"`
	Text     string `json:"text"`
}

// Database sementara di memori buat nyimpen siapa aja yang ada di dalem Room
var rooms = make(map[string]map[*websocket.Conn]bool)
var mutex = sync.Mutex{} // Satpam utama

func handleChat(w http.ResponseWriter, r *http.Request) {
	// 1. Tangkap ID Order dari URL
	orderID := r.URL.Query().Get("order_id")
	if orderID == "" {
		http.Error(w, "Order ID wajib ada!", http.StatusBadRequest)
		return
	}

	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Gagal upgrade:", err)
		return
	}
	defer ws.Close()

	// 2. Masukin User/Worker ke dalam Kamar (Room)
	mutex.Lock()
	if rooms[orderID] == nil {
		rooms[orderID] = make(map[*websocket.Conn]bool)
	}
	rooms[orderID][ws] = true
	mutex.Unlock()

	fmt.Printf("🟢 Client masuk ke room: %s\n", orderID)

	// 3. Looping dengerin pesan dari client ini
	for {
		_, msg, err := ws.ReadMessage()
		if err != nil {
			// Kalau client disconnect, hapus dari kamar
			mutex.Lock()
			delete(rooms[orderID], ws)
			mutex.Unlock()
			fmt.Printf("🔴 Client keluar dari room: %s\n", orderID)
			break
		}

		// Parse JSON pesan dari React
		var chatMsg ChatMessage
		err = json.Unmarshal(msg, &chatMsg)
		if err != nil {
			log.Println("Error parsing JSON:", err)
			continue
		}

		fmt.Printf("📩 Room [%s] %s: %s\n", orderID, chatMsg.Role, chatMsg.Text)

		// 4. BROADCAST: (VERSI ANTI NGE-HANG)
		// Kunci sebentar cuma buat nyatet siapa aja yang ada di kamar
		mutex.Lock()
		var clientsToMessage []*websocket.Conn
		for client := range rooms[orderID] {
			clientsToMessage = append(clientsToMessage, client)
		}
		mutex.Unlock() // Buka kunci secepatnya biar server nggak macet!

		// Kirim pesan satu-satu tanpa nahan pintu gerbang utama
		for _, client := range clientsToMessage {
			err := client.WriteJSON(chatMsg)
			if err != nil {
				client.Close()
				// Hapus client error/putus dari map dengan aman
				mutex.Lock()
				delete(rooms[orderID], client)
				mutex.Unlock()
			}
		}
	}
}

func main() {
	http.HandleFunc("/chat", handleChat)
	fmt.Println("🚀 Server Chat Go (Room System) nyala di port 8080!")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("Server mati:", err)
	}
}
