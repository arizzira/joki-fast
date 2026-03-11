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
// Format: rooms["ID_ORDER"] = { koneksi1: true, koneksi2: true }
var rooms = make(map[string]map[*websocket.Conn]bool)
var mutex = sync.Mutex{} // Satpam biar datanya nggak tabrakan kalau banyak yang chat

func handleChat(w http.ResponseWriter, r *http.Request) {
	// 1. Tangkap ID Order dari URL (Misal: ws://localhost:8080/chat?order_id=ORD-123)
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

	// 2. Masukin User/Worker ke dalam Kamar (Room) yang sesuai ID Order
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

		// 4. BROADCAST: Kirim pesan ini ke SEMUA orang yang ada di kamar yang sama
		mutex.Lock()
		for client := range rooms[orderID] {
			// Kirim balik dalam bentuk JSON
			err := client.WriteJSON(chatMsg)
			if err != nil {
				client.Close()
				delete(rooms[orderID], client)
			}
		}
		mutex.Unlock()
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
