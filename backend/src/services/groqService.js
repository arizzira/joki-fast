// File: src/services/groqService.js
import Groq from 'groq-sdk';

// Lazy init — supaya dotenv punya waktu load .env dulu
let groq;
export function getGroqClient() {
    if (!groq) {
        groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return groq;
}

/**
 * Validasi chat negosiasi menggunakan Groq AI
 * @param {Array} chatMessages - Array of { role, text, senderId }
 * @param {number} claimedDP - Jumlah DP yang diklaim worker
 * @param {number} claimedPrice - Harga akhir yang diklaim worker
 * @returns {Object} { passed, priceMatch, dpMatch, hasPersonalData, reasons }
 */
export const validateChatNegotiation = async (chatMessages, claimedDP, claimedPrice) => {
    try {
        // Format chat jadi readable text
        const chatText = chatMessages.map(msg => {
            const label = msg.role === 'USER' ? 'Klien' : 'Worker';
            return `[${label}]: ${msg.text}`;
        }).join('\n');

        const prompt = `Kamu adalah validator chat negosiasi di platform JokiFast (platform jasa joki tugas).
Tugasmu adalah menganalisis percakapan negosiasi dan memvalidasi 3 hal:

1. **Harga Akhir**: Worker mengklaim harga akhir deal adalah Rp${claimedPrice.toLocaleString('id-ID')}. Apakah berdasarkan percakapan ini, harga tersebut memang disepakati kedua pihak?
2. **DP (Down Payment)**: Worker mengklaim DP yang disepakati adalah Rp${claimedDP.toLocaleString('id-ID')}. Apakah berdasarkan percakapan, DP tersebut memang disepakati?
3. **Data Pribadi**: Apakah ada data pribadi yang dibagikan dalam chat? Contoh data pribadi yang DILARANG:
   - Nomor telepon/HP (format: 08xx, +62xx, atau variasi lain)
   - Alamat email pribadi
   - Username sosial media (Instagram, Twitter/X, Facebook, Telegram, WhatsApp)
   - Alamat rumah

PENTING: Hanya jawab dalam format JSON berikut, tanpa teks tambahan:
{
  "price_match": true/false,
  "dp_match": true/false,  
  "has_personal_data": true/false,
  "personal_data_found": ["deskripsi data yang ditemukan"] atau [],
  "price_analysis": "penjelasan singkat",
  "dp_analysis": "penjelasan singkat",
  "overall_passed": true/false
}

Catatan:
- "overall_passed" = true HANYA jika price_match=true DAN dp_match=true DAN has_personal_data=false
- Jika chat terlalu singkat atau tidak ada kesepakatan jelas, set price_match dan dp_match ke false
- Untuk data pribadi, analisis SEMUA pesan dari kedua pihak

=== PERCAKAPAN ===
${chatText}
=== END ===`;

        const completion = await getGroqClient().chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1,
            max_tokens: 1000,
            response_format: { type: 'json_object' }
        });

        const responseText = completion.choices[0]?.message?.content || '{}';

        let result;
        try {
            result = JSON.parse(responseText);
        } catch {
            console.error('Gagal parse response Groq:', responseText);
            return {
                passed: false,
                priceMatch: false,
                dpMatch: false,
                hasPersonalData: false,
                reasons: ['AI gagal memvalidasi chat. Coba lagi.'],
                raw: responseText
            };
        }

        const passed = result.overall_passed === true;
        const reasons = [];

        if (!result.price_match) reasons.push(`Harga tidak cocok: ${result.price_analysis}`);
        if (!result.dp_match) reasons.push(`DP tidak cocok: ${result.dp_analysis}`);
        if (result.has_personal_data) {
            reasons.push(`Data pribadi terdeteksi: ${(result.personal_data_found || []).join(', ')}`);
        }

        return {
            passed,
            priceMatch: result.price_match,
            dpMatch: result.dp_match,
            hasPersonalData: result.has_personal_data,
            personalDataFound: result.personal_data_found || [],
            priceAnalysis: result.price_analysis,
            dpAnalysis: result.dp_analysis,
            reasons
        };

    } catch (error) {
        console.error('Error Groq Validation:', error);
        return {
            passed: false,
            priceMatch: false,
            dpMatch: false,
            hasPersonalData: false,
            reasons: [`Error validasi: ${error.message}`],
        };
    }
};
