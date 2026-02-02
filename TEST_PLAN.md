# SwiftShift Edge Scenario Manual Test Plan

Bu dosya SwiftShift eklentisinin dayanıklılığını (robustness) ve kullanıcı deneyimini test etmek için hazırlanmıştır. Testleri gerçekleştirdikçe yanlarına notlar alabilirsin.

---

## 🏗️ 1. Kurulum ve Profil Senaryoları (Onboarding)
- [x] **1. Geçersiz Token:** Yanlış veya eksik bir Bot Token girildiğinde uygulama nasıl tepki veriyor?
- [x] **2. Boş Profil:** Hiç hedef (target) eklenmemiş bir botta Dashboard nasıl görünüyor?
- [-] **3. Çok Uzun Bot İsmi:** Botun ismi 50 karakterden fazlaysa Header'da taşma yapıyor mu?
- [-] **4. Token Güncelleme:** Mevcut bir bot token'ını değiştirdiğinde eski hedefler temizleniyor mu veya uyarılıyor mu?

## 📂 2. Hedef Yönetimi ve Hiyerarşi (Channels/Topics)
- [x] **5. İç İçe Çökme:** Bir kanalı daralttığında (collapse) tüm topicler gizleniyor mu?
- [x] **6. Aynı İsimli Hedefler:** İki farklı kanala aynı ismi verirsen sistem karışıyor mu?
- [x] **7. Düzenleme Sırasında Seçim:** Bir hedefi adlandırırken başka bir hedefe tıklarsan veri kaybı oluyor mu?
- [x] **8. Aşırı Pinleme:** 20+ hedefi aynı anda "Pin"lersen sıralama nasıl davranıyor?
- [x] **9. Grup vs Kanal:** Botun admin olmadığı bir gruba gönderim hatası düzgünce yansıtılıyor mu?

## 🖱️ 3. Dinamik Sağ-Tık (Context Menu) Uzmanlık Testleri
- [x] **10. Linkli Resimler (Twitter):** Resme sağ tık -> "Send Image" (sadece resim), "Send Link" (sadece link) ayrımı çalışıyor mu?
- [x] **10a. Resim Kalitesi:** Resme sağ tık -> Hedef -> "Send Compressed" (Foto) ve "Send Uncompressed" (Dosya) seçenekleri doğru çalışıyor mu?
- [-] **11. Local Files:** Bilgisayardaki bir dosyayı (`file://`) sağ tık ile göndermeyi dene.
- [-] **12. SVG Formatı:** `.svg` ikonlarını gönderirken Telegram hata veriyor mu? (SVG'ler otomatik olarak Document modunda gönderilir)
- [x] **13. Data-URI Images:** Base64 kodlanmış resimler gönderilebiliyor mu? (Otomatik olarak Blob'a çevrilip gönderilir)
- [-] **14. Yasaklı Sayfalar:** Chrome Web Store veya `chrome://settings` sayfalarında menü pasif mi?

## 📨 4. Gönderim ve Recents (Son Kullanılanlar)
- [x] **15. Aşırı Uzun Yazı:** 4096 karakterden uzun yazılarda hata yönetimi nasıl?
- [x] **16. Emoji Bombası:** Dev emojiler Recents kartında düzgün renderlanıyor mu?
- [x] **17. Hepsini Temizle (Confirm):** "Clear All" iptal edildiğinde veri güvenliği korunuyor mu?
- [-] **18. Offline Gönderim:** İnternet yokken Recents -> Resend denemesi timeout veriyor mu?
- [-] **19. Hızlı Gönderim (Spam):** Saniyede birden fazla tıklama race condition yaratıyor mu?

## ⚡ 5. Teknik ve Performans Sınırları
- [-] **20. Depolama Limiti:** 500+ hedef eklendiğinde scroll performansı nasıl?
- [-] **21. Detached Window:** Popup ayrı penceredeyken odaklama URL'yi doğru alıyor mu?
- [x] **22. Çoklu Pencere:** Birden fazla Chrome penceresi varken doğru URL yakalanıyor mu?
- [x] **23. Yenileme Altında İşlem:** Refresh çarkı dönerken öğe silme/gönderme denemesi.
- [x] **24. Karanlık/Açık Mod Uyumu:** Her iki temada da glassmorphism efektleri okunabilir mi?

## 🧠 6. Bonus: Akıllı Seçim Senaryosu
- [x] **25. URL İçeren Text:** Sadece bir linki metin olarak seçip "Send Text" dersen akıllı dönüşüm (linke çevirme) çalışıyor mu?

## 🖼️ 7. Gelişmiş İçerik ve Medya (Advanced Content)
- [x] **26. GIF Gönderimi:** Bir web sayfasındaki `.gif` dosyasına sağ tıklayıp "Send Image" dediğinde doğru animasyon gidiyor mu?
- [x] **27. WebP Formatı:** Modern `.webp` resim formatlarını gönderirken API uyumsuzluk yaşıyor mu?
- [x] **28. Sağ-tık Audio:** Bir ses dosyasına (`<audio> tagı`) sağ tıklayıp göndermeyi dene, "Send Link" olarak mı algılıyor?
- [x] **29. Özel Linkler:** `mailto:`, `tel:`, veya `magnet:` linklerine sağ tıkladığında "Send Link" başlığı çıkıyor mu?
- [x] **30. Google Haritalar:** Harita üzerindeki bir PIN'e veya koordinata sağ tıklayıp gönderim yapmayı dene.

## 💻 8. Tarayıcı ve Sistem Durumları (Browser & System State)
- [x] **31. Gizli Sekme (Incognito):** Gizli sekmede sağ tık menüsü düzgün çalışıyor mu ve Recents'e kayıt yapıyor mu?
- [-] **32. Sekme Uyutma (Tab Discarding):** Chrome'un uykuya aldığı (hibernated) bir sekmeyi Dashboard üzerinden gönder dersen sekme uyanıyor mu?
- [x] **33. Browser Zoom:** Tarayıcıyı %200 veya %50 zoom yaptığında Popup tasarımı patlıyor mu?
- [-] **34. Çoklu Profil:** İki farklı Chrome profili açıkken bot tokenları birbirine karışıyor mu?
- [x] **35. Sistem Saati Değişimi:** Bilgisayarın saatini 1 saat geri aldığında Recents sıralaması bozuluyor mu?

## 🌐 9. Ağ ve Bağlantı Zorlukları (Network & API)
- [x] **36. VPN/Proxy Aktifken Gönderim:** VPN üzerinden Telegram API'ye erişimde gecikme veya bloklanma oluyor mu?
- [-] **37. DNS Hatası:** DNS cevap vermediğinde uygulama sonsuz döngüde (loading) mi kalıyor?
- [-] **38. Telegram API Downtime:** Global bir kesintide "Sent Successfully" bildirimi sahte bir şekilde çıkıyor mu?
- [-] **39. Slow 3G:** Bağlantı çok yavaşken Recents listesinin yüklenmesi UI'ı donduruyor mu?
- [-] **40. Botun Engellenmesi:** Eğer alıcı kişi botu engellediyse (Private chat için), Telegram hatası kullanıcıya nasıl dönüyor?

## 🛡️ 10. Güvenlik ve Gizlilik (Security & Privacy)
- [x] **41. XSS Denemesi:** Bir channel ismini `<script>alert(1)</script>` yapıp Dashboard'da render etmeyi dene.
- [x] **42. Token Sızıntısı:** Console (F12) açıkken gönderim yapıldığında bot token'ı loglarda görünüyor mu?
- [-] **43. Clipboard Testi:** Kopyalanan bir metni Dashboard'a manuel girmeye çalışırken "Paste" (Yapıştır) fonksiyonu çalışıyor mu?
- [-] **44. SW Cold Start:** Eklenti uzun süre kullanılmadığında Service Worker'ın uyanıp sağ tık menüsünü oluşturma hızı (~1-2 sn olmalı).
- [x] **45. Yetki Kaybı:** Botun adminlikten çıkarıldığı bir kanala gönderim yapmaya çalışınca net bir hata veriliyor mu?

## 📈 11. Uzun Süreli Kullanım (Long-term & Bulk)
- [-] **46. 100+ Recents Öğesi:** Manuel olarak depolamayı zorla, liste hızı hissedilir şekilde düşüyor mu?
- [-] **47. Diğer Eklentilerle Çatışma:** Sayfada başka bir "Right-click" eklentisi (örn. Grammarly) varken menü hiyerarşisi bozuluyor mu?
- [-] **48. Punycode URL'ler:** Türkçe karakterli veya emojili URL'leri (`https://🧪.com`) düzgün gönderiyor mu?
- [-] **49. URL Fragments:** İçinde `#section-1` gibi çapalar olan uzun linkler Recents'te kırılıyor mu?
- [x] **50. Sürüm Geçişi:** Eklentiyi bir önceki sürümden (data v3) yeni sürüme (data v4) güncellediğinde hedefler korunuyor mu?

---

### 📝 Test Notları ve Gözlemler
*(Buraya kendi bulgularını ekleyebilirsin)*
