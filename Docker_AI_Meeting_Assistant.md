# STAJYER ÇALIŞMASI: Docker Tabanlı AI Meeting Assistant

**Katılımcılar:** Berkay, Mehmet  
**Süre:** 2 Hafta  
**Teslim:** Git Repository + Demo Sunumu  

---

## 🎯 Amaç
Docker, Docker Compose, Ollama, Open WebUI, n8n ve PostgreSQL kullanarak yalnızca prompt odaklı çalışan bir **AI Meeting Assistant** (Yapay Zeka Toplantı Asistanı) geliştirmek.

---

## 📖 Senaryo
Kullanıcı toplantı notlarını sisteme girer. Yapay zeka sistemi bu notları işleyerek otomatik olarak aşağıdaki çıktıları üretir:
- Toplantı özeti
- Görevler ve sorumlular
- Teslim tarihleri
- Risk analizi
- Yönetici özeti

---

## 🛠️ Kullanılacak Teknolojiler
- **Konteynerleştirme & Orkestrasyon:** Docker, Docker Compose
- **Yapay Zeka & LLM:** Ollama, Open WebUI
- **İş Akışı Otomasyonu:** n8n
- **Veritabanı & Yönetim:** PostgreSQL, pgAdmin

---

## 📋 Beklenen Çıktılar
- [x] Toplantı özeti
- [x] Yapılacak işler (Task list)
- [x] Sorumlular (Assignees)
- [x] Teslim tarihleri (Deadlines)
- [x] Risk analizi
- [x] Yönetici özeti (Executive Summary)

---

## 🏗️ Docker Mimarisi & Servis Akışı

**Servis Bağlantı Akışı:**
`Open WebUI` ➔ `Ollama` ➔ `n8n` ➔ `PostgreSQL` ➔ `pgAdmin`

> **Not:** Tüm sistem `docker compose up -d` komutu ile tek seferde sorunsuz şekilde çalışmalıdır.

---

## 📂 Proje Dizin Yapısı

```text
meeting-assistant/
├── docker-compose.yml
├── README.md
├── prompts/
├── database/
├── workflows/
└── screenshots/
```

---

## 🤖 AI Agent Görevleri
1. **Meeting Summarizer:** Toplantı metinlerini ve notlarını özetler.
2. **Task Extractor:** Görevleri, sorumluları ve teslim tarihlerini tespit edip ayıklar.
3. **Risk Analyzer:** Proje risklerini ve olası darboğazları analiz eder.
4. **Manager Assistant:** Yöneticilere özel üst düzey özet ve karar desteği sunar.

---

## 📦 Teslim Edilecekler
- Docker Compose konfigürasyon dosyası (`docker-compose.yml`)
- Proje dokümantasyonu (`README.md`)
- Prompt şablonları (`prompts/`)
- n8n iş akışları (`workflows/`)
- SQL başlangıç/kurulum scripti (`database/`)
- Çalışır duruma ait ekran görüntüleri (`screenshots/`)
- Git Repository adresi

---

## 📊 Değerlendirme Kriterleri

| Kriter | Ağırlık (%) |
| :--- | :---: |
| Docker & Docker Compose Yapılandırması | %20 |
| Prompt Mühendisliği ve Tasarımı | %20 |
| Servis Entegrasyonları | %15 |
| AI Çıktı Kalitesi ve Doğruluğu | %15 |
| n8n İş Akışları (Workflow) | %10 |
| PostgreSQL Veritabanı Yapısı | %10 |
| Dokümantasyon Kalitesi | %5 |
| Demo Sunumu | %5 |
| **Toplam** | **%100** |
