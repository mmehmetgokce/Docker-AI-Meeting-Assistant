# 💡 Gelecek Proje Geliştirme Yol Haritası ve Özellik Önerileri

**Proje:** AI Meeting Assistant (Yapay Zeka Toplantı ve Karar Destek Platformu)  
**Doküman Tipi:** Ürün Geliştirme, Teknik Mimari ve Yeni Özellikler Yol Haritası  

Bu doküman, uygulamanın mevcut sürümünü **Enterprise (Kurumsal)** seviyeye taşıyacak mimari ve fonksiyonel geliştirmeleri detaylandırır.

---

## 🌟 1. Yapay Zeka & Akıllı İşleme Sistemleri (Advanced AI Systems)

### 1.1 🎙️ MS Teams Transkript Otomasyonu & Yerel Ses Deşifresi (Speech-to-Text Pipeline)
* **Açıklama:** Microsoft Teams toplantılarından çıkan canlı transkript dosyalarını (`.vtt` / `.docx`) veya yüklenen ses kayıtlarını (`.mp3`, `.wav`) otomatik işleme.
* **Teknik Mimari (Önerilen - MS Teams Graph API Entegrasyonu):**
  - Microsoft Teams toplantı bittiğinde bulut ortamında otomatik canlı transkript üretir.
  - n8n otomasyon akışına **Microsoft Graph API / OneDrive Node** eklenerek yeni transkript dosyası otomatik tespit edilir.
  - Transkript metni konuşmacı etiketleriyle (`[00:01:23] Ahmet: ...`) ayrıştırılarak yerel işlem gücü harcanmadan doğrudan AI Meeting Assistant analiz motoruna iletilir.
* **Alternatif Mimari (Yerel Whisper Container):**
  - Çevrimdışı ses dosyaları için Docker Compose ortamına yerel **Faster-Whisper** konteyneri eklenerek deşifre yapılır.

### 1.2 📊 Toplantılar Arası Karşılaştırma & Çelişki Analizi (Historical Comparison)
* **Açıklama:** Birden fazla geçmiş toplantı seçilerek yapay zeka ile karşılaştırmalı analiz yapılır.
* **Teknik Mimari:**
  - Arayüzde "Kayıtlı Veriler" sekmesinde onay kutuları (*checkbox*) ile 2 veya daha fazla toplantı seçilir.
  - Backend, seçilen toplantıların özetlerini ve kararlarını birleştirerek Ollama modeline özel bir istem (*Prompt*) ile gönderir.
  - Çıktı arayüzde kıyaslama tablosu olarak sunulur.

### 1.3 📅 Görevler İçin Otomatik Takvim (.ics) ve Jira / Trello Entegrasyonu
* **Açıklama:** Analiz sonucunda üretilen görevlerin tek tıkla takvimlere eklenmesini ve proje yönetim araçlarına aktarılmasını sağlar.
* **Teknik Mimari:**
  - Her görevin yanına **`[.ics İndir]`** butonu eklenir (İstemci tarafında `icalendar` kütüphanesi ile Outlook/Google Calendar etkinliği oluşturulur).
  - n8n otomasyon akışına **Trello Node** veya **Jira API Node** eklenerek görevler tek tıkla şirket panolarına kart olarak açılır.

### 1.4 🧠 AI Duygu & Mizaç Analizi (Sentiment & Conflict Detection)
* **Açıklama:** Toplantı notlarındaki tartışma tonunu (Pozitif, Gergin, Kararsız, Yapıcı) analiz eder.
* **Teknik Mimari:**
  - Ollama istemine mizaç analizi çıktısı eklenir.
  - Özet kartında toplantının genel atmosferi (*"Yapıcı / Kararlı"*, *"Anlaşmazlık Var"* vb.) renkli rozetler (*Badges*) ile gösterilir.

---

## 🎨 2. Arayüz (UI/UX) & Görsel Analitik Panel

### 2.1 📈 Görsel İstatistik Dashboard (Chart.js / Recharts)
* **Açıklama:** Veritabanındaki tüm toplantı verilerini görsel grafiklerle yöneticilere sunar.
* **Teknik Mimari:**
  - "Kayıtlı Veriler" sekmesinin üstüne **Chart.js** entegre edilir.
  - **Görev Durumu Oranı:** Pasta Grafiği (%60 Tamamlandı, %40 Bekliyor).
  - **Risk Etki Dağılımı:** Çubuk Grafik (Kırmızı Yüksek etki, Sarı Orta etki).
  - **Ekip Yük Dağılımı:** En çok görev atanan kişilerin yatay çubuk grafiği.

---

## 📋 3. Veritabanı & Görev Yönetim Modülleri

### 3.1 📌 Görevler İçin İnteraktif Kanban Pano Görünümü (Kanban Board)
* **Açıklama:** Tüm toplantılardan çıkan görevlerin tek bir panoda Trello stili yönetilmesini sağlar.
* **Teknik Mimari:**
  - Arayüzde "Kanban Pano" sekmesi eklenir.
  - Görevler **`Yapılacak` ➔ `Yapılıyor` ➔ `Tamamlandı`** sütunlarında listelenir.
  - Sürükle-bırak veya tek tıkla durum değiştiğinde arka planda `PATCH /api/tasks/:id` endpoint'i tetiklenerek PostgreSQL verisi güncellenir.

---

## ⚡ 4. n8n & Otomasyon Ekosistemi (n8n Workflows)

### 4.1 💬 Slack / Microsoft Teams / Telegram Bildirim Botu
* **Açıklama:** Toplantı kaydedildiğinde veya yüksek seviyeli bir risk tespit edildiğinde şirket mesajlaşma kanalına anında bildirim atar.
* **Teknik Mimari:**
  - n8n akışına **Slack Webhook Node** veya **MS Teams Incoming Webhook** düğümü eklenir. Toplantı özeti şık bir kart formatında kanala iletilir.

### 4.2 ⏰ Zamanlanmış Görev Hatırlatıcı (Cron Job Task Reminder)
* **Açıklama:** Teslim tarihi yaklaşan görevler için otomatik e-posta gönderir.
* **Teknik Mimari:**
  - n8n içerisine **Cron Node** eklenir (Her sabah saat 09:00'da çalışır).
  - PostgreSQL'den teslim tarihi 2 gün kalan görevleri sorgular ve sorumlu kişilere hatırlatma e-postası yollar.

---

## ✅ 5. Sürüm 1.1 Tamamlanan Özellikler (Implemented Features)
- [x] **2.2 PDF / Word (.docx) / Markdown (.md) Kurumsal Rapor Dışa Aktarma (Export Engine)**
- [x] **2.3 Kayıtlı Verilerde Canlı Arama ve Kategori Filtreleme (Live Search & Tags)**
- [x] **2.4 Koyu / Aydınlık Tema Seçeneği (Light / Dark Mode Switcher)**
- [x] **3.2 PostgreSQL Kategori (`category`) Şema Entegrasyonu**
