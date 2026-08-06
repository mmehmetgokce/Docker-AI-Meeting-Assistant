# 🚀 Docker Tabanlı AI Meeting Assistant (Yapay Zeka Toplantı Asistanı)

Bu proje; **Docker**, **Docker Compose**, **Ollama**, **Open WebUI**, **n8n** ve **PostgreSQL** teknolojilerini kullanarak yalnızca prompt ve iş akışı odaklı çalışan yerel bir **Yapay Zeka Toplantı Asistanı** sunar.

---

## 🎯 Projenin Amacı

Toplantı notlarının tek bir merkezden işlenerek otomatik olarak aşağıdaki çıktıların üretilmesi ve veritabanında saklanması hedeflenmektedir:
- 📌 **Toplantı Özeti:** Genel değerlendirme ve alınan ana kararlar.
- 📋 **Görevler ve Sorumlular (Task List):** Yapılacak işler, sorumlular ve teslim tarihleri.
- ⚠️ **Risk Analizi:** Projedeki olası darboğazlar, teknik ve operasyonel riskler.
- 👔 **Yönetici Özeti (Executive Brief):** Üst düzey yöneticilere özel hızlı karar desteği.

---

## 🛠️ Mimari ve Kullanılan Teknolojiler

```text
[ Web UI & Express Backend (Port 3000) ]  ───►  [ Ollama LLM (Port 11434) ]
                                                            ▲
                                                            │ API Connection
[ n8n Workflow (Port 5678) ] ───────────────────────────────┼─────────────► [ PostgreSQL DB (Port 5432) ]
                                                                                   ▲
[ pgAdmin UI (Port 5050) ] ────────────────────────────────────────────────────────┘
```

| Servis | Port | Açıklama |
| :--- | :---: | :--- |
| **Web UI & Express App** | `http://localhost:3000` | Kullanıcı dostu toplantı asistanı web arayüzü ve API gateway |
| **n8n** | `http://localhost:5678` | Otomatik iş akışları ve Webhook entegrasyonu |
| **pgAdmin** | `http://localhost:5050` | PostgreSQL veritabanı yönetim paneli |
| **Ollama** | `http://localhost:11434` | Yerel LLM servisi (`llama3.2` vb.) |
| **PostgreSQL** | `localhost:5432` | İlişkisel veritabanı (`meeting_db`) |

---

## 📂 Dizin Yapısı

```text
.
├── docker-compose.yml       # Konteyner orkestrasyon dosyası
├── README.md                # Proje dokümantasyonu
├── app/                     # Web Arayüzü ve Backend Uygulaması (Node.js/Express)
│   ├── Dockerfile           # App Docker imaj yapılandırması
│   ├── package.json         # Bağımlılıklar
│   ├── server.js            # Express API Gateway ve Veritabanı Servisleri
│   └── public/              # Frontend Arayüzü (HTML, CSS, JS)
├── database/
│   └── init.sql             # PostgreSQL şema başlangıç scripti
├── prompts/                 # AI Agent Sistem Prompt'ları
│   ├── 01_meeting_summarizer.md
│   ├── 02_task_extractor.md
│   ├── 03_risk_analyzer.md
│   └── 04_manager_assistant.md
├── workflows/               # n8n İş Akışı şablonları
│   └── meeting_assistant_workflow.json
└── screenshots/             # Çalışır duruma ait ekran görüntüleri
```

---

## 🚀 Hızlı Başlangıç (Kurulum Rehberi)

### 1. Servisleri Çalıştırma

Terminal veya komut satırında proje dizinindeyken aşağıdaki komutu çalıştırın:

```bash
docker compose up -d
```

Servislerin durumunu kontrol etmek için:

```bash
docker compose ps
```

### 2. Ollama İçerisine Yapay Zeka Modeli Yükleme

Ollama servisine hafif ve Türkçe/İngilizce performansı yüksek olan `llama3.2` modelini indirin:

```bash
docker exec -it meeting_assistant_ollama ollama pull llama3.2
```

*(Opsiyonel)* Alternatif olarak `qwen2.5` veya `mistral` modelleri de yüklenebilir:
```bash
docker exec -it meeting_assistant_ollama ollama pull qwen2.5
```

---

## 🤖 AI Agent Prompt'larının Kullanımı (Web Arayüzü)

1. Tarayıcınızdan `http://localhost:3000` adresine gidin.
2. Web arayüzündeki **Toplantı Notları** sekmesinden notlarınızı girin ve işlem türünü seçin (Özet Çıkar, Görevleri Çıkar, Risk Analizi Yap, Yönetici Özeti).
3. Arka planda Node.js uygulaması `prompts/` dizinindeki `.md` dosyalarından ilgili sistem prompt'unu dinamik olarak okuyarak Ollama ve n8n servislerine iletir ve sonuçları veritabanına kaydeder.

---

## 🔄 n8n İş Akışının Aktarılması (Import Workflow)

1. Tarayıcıdan `http://localhost:5678` adresine gidin.
2. Sol menüden **Workflows -> Import from File** seçeneğini tıklayın.
3. Projedeki `workflows/meeting_assistant_workflow.json` dosyasını seçip içeri aktarın.
4. **PostgreSQL Credentials** ayarlarında veritabanı bağlantı bilgilerini tanımlayın:
   - **Host:** `postgres`
   - **Database:** `meeting_db`
   - **User:** `meeting_user`
   - **Password:** `meeting_password`
   - **Port:** `5432`

---

## 🗄️ PostgreSQL & pgAdmin Bağlantısı

- **pgAdmin Arayüzü:** `http://localhost:5050`
- **Giriş Bilgileri:** `admin@admin.com` / `admin`
- **Sunucu Ekleme (Add Server):**
  - **Host Name:** `postgres`
  - **Port:** `5432`
  - **Maintenance database:** `meeting_db`
  - **Username:** `meeting_user`
  - **Password:** `meeting_password`

---

## 📊 Veritabanı Tabloları

`database/init.sql` scripti otomatik çalışarak şu tabloları oluşturur:
- `meetings`: Ham toplantı başlığı ve notları.
- `meeting_summaries`: Üretilen özetler ve alınan kararlar.
- `tasks`: Görev tanımı, sorumlusu, teslim tarihi ve durumu.
- `risk_analyses`: Olası riskler, etki seviyeleri ve önlem planları.
- `executive_summaries`: Yöneticiler için hazırlanan üst düzey raporlar.
