# SwiftShift: Future Vision & Power User Paradigms

Bu döküman, SwiftShift'in Telegram'ı bir "İkinci Beyin" (Second Brain) ve "Veri Terminali" olarak kullanan kullanıcılar için gelecekteki gelişim yönlerini tanımlar.

---

## 🧠 1. Notion & Obsidian Modu (Bilgi Yönetimi)
*Hedef: Veriyi sadece kaydetmek değil, bağlamıyla (context) birlikte saklamak.*

*   **Smart Metadata Injection:** Link gönderilirken sayfa başlığı (`<title>`), meta açıklaması ve gönderim tarihi otomatik olarak mesajın başına veya sonuna eklenir.
*   **Quick Note Snippet:** Gönderimden hemen önce kullanıcıya 5-10 saniyelik bir pencere sunularak "Neden kaydediyorum?" notu eklemesi sağlanır.
*   **Automated Tagging:** İçeriğe göre otomatik hashtag (#research, #to_read, #dev) ekleme.

## 📁 2. Google Drive & Photos Modu (Varlık Yönetimi)
*Hedef: Medya ve dosyaları orijinal kalitesinde ve izlenebilir kaynaktan saklamak.*

*   ✅ **Original Quality (Document) Toggle:** Görsellerin Telegram tarafından sıkıştırılmasını engelleyerek "Dosya" formatında gönderilmesi. (v0.2.0 ile eklendi)
*   ✅ **Source Attribution:** Kaydedilen her görselin altına, görselin bulunduğu web sayfası linkinin otomatik açıklama (Caption) olarak yazılması. (v0.2.0 ile eklendi)
*   ✅ **Full Page PDF/Capture:** Web sayfasını o anki haliyle PNG ekran görüntüsü olarak yakalayıp Telegram'a yükleme. *(Görünür alan - Faz 1)*

## 🔐 3. Bitwarden/Password Manager Modu (Hızlı Erişim)
*Hedef: Sık kullanılan hassas olmayan verilere (adres, iban, snippet) ışık hızında erişim.*

*   **Snippet Manager:** Eklenti içinde saklanan metin kalıplarının (kod blokları, şablonlar) tek tıkla hedeflere fırlatılması.
*   **Privacy Masks:** Gönderilen hassas verilerin Recents kısmında yıldızlanarak (`****`) gizlenmesi.

## ⚡ 4. Smart Routing: "The Orchestrator"
*Hedef: Kullanıcının "Hangisine göndereyim?" diye düşünmesine gerek kalmadan veriyi doğru kanala tasnif etmek.*

*   **Domain-Based Rules:**
    *   `youtube.com/*` -> "Watch Later" Kanalı.
    *   `twitter.com/*` -> "Social Archive" Kanalı.
    *   `github.com/*` -> "Dev Resources" Kanalı.
*   **Content-Type Rules:** Tüm resimlerin otomatik olarak "Photos" kanalına, linklerin "Inbox" kanalına gitmesi.

## 📥 5. Personal Inbox 2.0
*Hedef: Telegram'ın "Saved Messages" özelliğini profesyonel bir Inbox'a çevirmek.*

*   **Status Management:** Gönderilen öğelerin Recents sekmesinde "Okundu", "İşlendi" veya "Bekliyor" olarak işaretlenebilmesi.
*   **Batch Action:** Birden fazla sekmeyi paketleyip (Packaging) tek bir Telegram mesajında özet listesi olarak gönderme.

---

*Bu döküman, SwiftShift kullanıcısının Telegram'ı sadece bir mesajlaşma uygulaması değil, bir işletim sistemi gibi kullanmasını sağlamak için oluşturulmuştur.*
