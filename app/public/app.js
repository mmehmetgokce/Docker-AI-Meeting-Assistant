document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------------------------------------------
    // 1. Tab Navigation
    // ------------------------------------------------------------------
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`tab-${targetTab}`).classList.add('active');

            if (targetTab === 'database') loadSavedMeetings();
            if (targetTab === 'status') checkSystemStatus();
        });
    });

    // ------------------------------------------------------------------
    // 1a. Theme Switcher (Light / Dark Mode Switcher) - Feature 2.4
    // ------------------------------------------------------------------
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');

    let currentTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(currentTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(currentTheme);
        });
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (theme === 'light') {
            if (themeIcon) themeIcon.className = 'fa-solid fa-moon';
            if (themeText) themeText.innerText = 'Koyu Tema';
        } else {
            if (themeIcon) themeIcon.className = 'fa-solid fa-sun';
            if (themeText) themeText.innerText = 'Açık Tema';
        }
    }

    // ------------------------------------------------------------------
    // 1b. Example Meeting Notes Loader
    // ------------------------------------------------------------------
    const exampleMeetings = {
        '1': {
            title: 'Mobil Uygulama ve Altyapı Modernizasyonu Toplantısı',
            category: 'Yazılım',
            notes: `Tarih: 30 Temmuz 2026\nKatılımcılar: Ahmet (Proje Yöneticisi), Ayşe (Kıdemli Yazılımcı), Mehmet (DevOps Mühendisi), Zeynep (UI/UX Tasarımcısı)\n\nToplantı Detayları ve Alınan Kararlar:\n- Mevcut mobil uygulamanın performans sorunları nedeniyle React Native kullanılarak sıfırdan yeniden yazılmasına karar verildi.\n- Veritabanı altyapısının eski MySQL sunucusundan PostgreSQL 16 versiyonuna taşınması onaylandı.\n- Müşteri arayüzü tasarımlarında koyu tema (Dark Mode) öncelikli hale getirilecek.\n\nGörev Dağılımı ve Teslim Tarihleri:\n1. Ayşe: PostgreSQL veritabanı şema tasarımını ve migrasyon scriptlerini hazırlayacak. (Teslim Tarihi: 5 Ağustos 2026)\n2. Mehmet: Kubernetes ve Docker tabanlı CI/CD test ortamını kuracak. (Teslim Tarihi: 8 Ağustos 2026)\n3. Zeynep: Figma üzerindeki yeni kullanıcı arayüzü tasarımlarını tamamlayıp onay alacak. (Teslim Tarihi: 3 Ağustos 2026)\n4. Ahmet: Müşteri bilgilendirme bültenini hazırlayıp yayınlayacak. (Teslim Tarihi: 10 Ağustos 2026)\n\nProje Riskleri ve Olası Darboğazlar:\n- Eski MySQL sunucusundaki 500.000 kaydın aktarımı sırasında veri tutarsızlığı ve veri kaybı yaşanma riski yüksek. Önlem olarak canlıya geçmeden önce 3 defa deneme migrasyonu (dry-run) yapılacak.\n- Apple App Store inceleme sürecinin uzaması durumunda canlıya çıkış tarihi gecikebilir.`
        },
        '2': {
            title: 'Yapay Zeka Entegrasyonu ve Müşteri Destek Botu Projesi',
            category: 'Yazılım',
            notes: `Tarih: 30 Temmuz 2026\nKatılımcılar: Tolga Bey (Mühendislik Direktörü), Gökçe (Yapay Zeka Mühendisi), Berkay (Backend Geliştirici), Selin (Ürün Yöneticisi)\n\nToplantı Detayları ve Alınan Kararlar:\n- Müşteri destek biletlerinin (tickets) otomatik sınıflandırılması için Ollama üzerinde Llama 3.2 modeli kullanılacaktır.\n- Webhook isteklerinin işlenmesi ve yanıtların PostgreSQL veritabanına otomatik kaydedilmesi için n8n iş akışı otomasyonu kullanılacaktır.\n- Sistemin ön yüzü için ekibin hızlıca kullanabileceği özel bir web arayüzü (Custom Web UI) geliştirilecektir.\n\nGörev Dağılımı ve Teslim Tarihleri:\n1. Gökçe: Ollama için prompt şablonlarını (System Prompts) ve Few-Shot örneklerini hazırlayıp doğrulayacak. (Teslim Tarihi: 4 Ağustos 2026)\n2. Berkay: n8n Webhook ve PostgreSQL bağlantı düğümlerini (nodes) yapılandıracak. (Teslim Tarihi: 6 Ağustos 2026)\n3. Selin: Müşteri destek ekibi için test senaryolarını dokümante edecek. (Teslim Tarihi: 7 Ağustos 2026)\n\nProje Riskleri ve Olası Darboğazlar:\n- Yerel sunucudaki GPU/RAM kapasitesinin aynı anda 50'den fazla istek geldiğinde yetersiz kalması ve yanıt sürelerinin uzaması riski. Önlem olarak kuyruk (queue) yapısı kurulacak.\n- Yapay zekanın beklenmeyen sorularda yanlış bilgi (hallucination) üretme riski. Önlem olarak yanıtların yanına güven skoru eklenecek.`
        },
        '3': {
            title: 'Şirket İçi Siber Güvenlik ve ISO 27001 Denetim Hazırlığı',
            category: 'Siber Güvenlik',
            notes: `Tarih: 30 Temmuz 2026\nKatılımcılar: Can (Bilgi Güvenliği Yöneticisi), Deniz (Sistem Yöneticisi), Burak (İnsan Kaynakları Direktörü)\n\nToplantı Detayları ve Alınan Kararlar:\n- ISO 27001 denetimi öncesinde tüm şirket içi sistemlerde İki Faktörlü Doğrulama (2FA) kullanımı zorunlu hale getirilmiştir.\n- Sunucu ve veritabanı yedekleme periyotları haftalık periyottan günlük periyoda çekilmiştir.\n\nGörev Dağılımı ve Teslim Tarihleri:\n1. Deniz: Tüm VPN ve sunucu girişlerinde 2FA zorunluluğunu aktif edecek. (Teslim Tarihi: 10 Ağustos 2026)\n2. Burak: Şirket personeline yönelik oltalama (phishing) ve şifre güvenliği eğitimini organize edecek. (Teslim Tarihi: 12 Ağustos 2026)\n3. Can: Güvenlik politikaları dokümanını güncelleyip üst yönetimin onayına sunacak. (Teslim Tarihi: 8 Ağustos 2026)\n\nProje Riskleri ve Olası Darboğazlar:\n- 2FA geçiş sürecinde personelin giriş problemleri yaşaması ve IT Destek ekibinde aşırı yoğunluk oluşması riski. Önlem olarak kademeli geçiş yapılacak.`
        },
        '4': {
            title: 'Haftalık Satış Değerlendirmesi ve Bütçe Planlama Notları',
            category: 'Pazarlama',
            notes: `Tarih: 4 Ağustos 2026 salı saat 10:00\nNot alan: Ahmet\nKatılanlar: Ahmet (Satış), Deniz (İK), Selin (Pazarlama), Hakan (Muhasebe)\n\nAhmet bey açılışı yaptı satışlar geçen aya göre ege ve akdenizde %15 düşmüş rakip firma indirim yapmış.\nSelin google reklamlarını durdurup instagram influencer kampanyasına geçelim diyor bütçe 50bin TL ama hakan bey bütçe aşımı olur genel müdür onayı lazım dedi.\nDeniz kıdemli backendçi ve devops için 2 yeni ilan çıkacak haftaya pazartesi ik görüşmeleri başlıyor dedi.\n\nAlınan Karar: Reklam bütçesi artırımı onay için genel müdüre sunulacak.\n\nGörev Dağılımı:\n- Selin influencer tekliflerini pazartesiye kadar toplayacak.\n- Deniz ilanları 10 ağustosa kadar çıkacak.\n- Hakan finansal raporu cuma akşamına kadar ahmet beye atacak.\n\nOlası Risk: Reklam kaydırması gecikirse ağustos satış hedefi tutmayabilir.`
        },
        '5': {
            title: 'Canlıya Çıkış Öncesi Acil Altyapı ve Kriz Toplantısı',
            category: 'Yönetim',
            notes: `Cuma günkü lansman öncesi acil durum toplantısı (3 Ağustos 2026)\nKatılanlar: Erdem (Backend), Ayşe (Frontend), Caner (Güvenlik), Zeynep (PO)\n\nDün akşam yapılan yük testinde ödeme servisi 500 hatası verdi erdem bakıyor. Ödeme altyapısı çalışmadan canlıya çıkamayız riski çok büyük lansman ertelenebilir.\nAyşe frontend tarafında son 2 ekran kaldığını perşembe günü bitireceğini söyledi ama erdemin ödeme apisini beklemesi gerekiyor.\nCaner hoca vpn ve ssl sertifikalarının süresinin dolmak üzere olduğunu fark etti yarın akşama kadar yenilenmezse tüm test ortamı kilitlenecek.\n\nKararlar:\n- Lansman tarihi perşembe akşamı tekrar değerlendirilecek.\n\nGörevler:\n1. Erdem ödeme servisi bugfix teslim: 5 ağustos.\n2. Caner ssl yenileme teslim: 4 ağustos yarın.\n3. Zeynep yönetime gecikme ihtimalini bildirecek teslim: bugün.`
        }
    };

    document.querySelectorAll('.btn-example').forEach(btn => {
        btn.addEventListener('click', () => {
            const exampleId = btn.getAttribute('data-example');
            const example = exampleMeetings[exampleId];
            if (example) {
                document.getElementById('meetingTitle').value = example.title;
                document.getElementById('meetingNotes').value = example.notes;
                if (document.getElementById('meetingCategory')) {
                    document.getElementById('meetingCategory').value = example.category || 'Genel';
                }
                document.querySelectorAll('.btn-example').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });
    });

    // ------------------------------------------------------------------
    // 2. Initial System Check & LAN Info
    // ------------------------------------------------------------------
    checkSystemStatus();
    loadSavedMeetings(); // Load count immediately on page load

    async function checkSystemStatus() {
        try {
            const res = await fetch('/api/status');
            const data = await res.json();

            if (data.success) {
                const lanIpEl = document.getElementById('lanIpText');
                if (lanIpEl) lanIpEl.innerText = `Port: ${data.port} (LAN Aktif)`;

                updateBadge('badgeDb', data.services.database, 'DB Bağlı', 'DB Bağlantısı Yok');
                updateBadge('badgeOllama', data.services.ollama, 'Ollama Aktif (llama3.2)', 'Ollama Çalışmıyor');
                updateBadge('badgeN8n', data.services.n8n, 'n8n Aktif', 'n8n Beklemede');
            }
        } catch (e) {
            const lanIpEl = document.getElementById('lanIpText');
            if (lanIpEl) lanIpEl.innerText = 'Sunucu Bağlantı Hatası';
        }
    }

    function detectWebRtcLanIp(callback) {
        try {
            const pc = new RTCPeerConnection({ iceServers: [] });
            pc.createDataChannel('');
            pc.createOffer().then(offer => pc.setLocalDescription(offer)).catch(() => {});
            pc.onicecandidate = (event) => {
                if (!event || !event.candidate) return;
                const candidate = event.candidate.candidate;
                const ipRegex = /([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/;
                const match = ipRegex.exec(candidate);
                if (match && !match[1].startsWith('127.')) {
                    callback(match[1]);
                    pc.onicecandidate = null;
                }
            };
        } catch (e) {}
    }

    function updateBadge(id, isOnline, onlineText, offlineText) {
        const el = document.getElementById(id);
        if (isOnline) {
            el.className = 'badge online';
            el.innerText = `● ${onlineText}`;
        } else {
            el.className = 'badge offline';
            el.innerText = `✖ ${offlineText}`;
        }
    }

    // ------------------------------------------------------------------
    // 3. AI Analysis Handlers (Summarize, Tasks, Risks, Executive)
    // ------------------------------------------------------------------
    const btnProcessAll = document.getElementById('btnProcessAll');
    const btnSummarize = document.getElementById('btnSummarize');
    const btnTasks = document.getElementById('btnTasks');
    const btnRisks = document.getElementById('btnRisks');
    const btnExec = document.getElementById('btnExec');
    const btnSaveToDb = document.getElementById('btnSaveToDb');
    const aiStatus = document.getElementById('aiStatus');

    let currentAnalysis = {
        title: '',
        raw_notes: '',
        summary: '',
        tasks: [],
        risks: [],
        executive_summary: ''
    };

    btnSummarize.addEventListener('click', () => runSingleTask('summarize', 'outputSummary'));
    btnTasks.addEventListener('click', () => runSingleTask('extract_tasks', 'outputTasks'));
    btnRisks.addEventListener('click', () => runSingleTask('analyze_risks', 'outputRisks'));
    btnExec.addEventListener('click', () => runSingleTask('executive_brief', 'outputExec'));

    async function runSingleTask(taskType, outputElementId) {
        const title = document.getElementById('meetingTitle').value;
        const text = document.getElementById('meetingNotes').value;
        const outputEl = document.getElementById(outputElementId);

        if (!text.trim()) {
            alert('Lütfen analiz edilecek toplantı notlarını girin.');
            return;
        }

        outputEl.contentEditable = "false";
        outputEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Yapay zeka analizi yapılıyor...';
        aiStatus.className = 'status-indicator';
        aiStatus.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> İşleniyor...';

        try {
            const res = await fetch('/api/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskType, text, title })
            });

            const data = await res.json();
            if (data.success) {
                renderResultOutput(taskType, data.result, outputEl);
                aiStatus.className = 'status-indicator';
                aiStatus.innerHTML = `<i class="fa-solid fa-check"></i> Tamamlandı`;
                if (btnSaveToDb) btnSaveToDb.disabled = false;
            } else {
                outputEl.innerText = `Hata: ${data.error}`;
                aiStatus.innerHTML = '<i class="fa-solid fa-xmark"></i> Hata';
            }
        } catch (err) {
            outputEl.innerText = `Sunucu Hatası: ${err.message}`;
            aiStatus.innerHTML = '<i class="fa-solid fa-xmark"></i> Hata';
        }
    }

    // Window scope function for inline redo buttons
    window.runSingleTask = runSingleTask;

    // Strip echoed input tags and thinking blocks from AI output
    function cleanAiOutput(text) {
        if (typeof text !== 'string') return text;
        let cleaned = text;
        // Remove <think>...</think> blocks
        cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
        // Cut off any echoed input starting at <notlar>
        if (cleaned.toLowerCase().includes('<notlar>')) {
            cleaned = cleaned.split(/<notlar>/i)[0];
        }
        cleaned = cleaned.replace(/<\/notlar>/gi, '');
        return cleaned.trim();
    }

    function renderResultOutput(taskType, rawResult, container) {
        const cleanedResult = cleanAiOutput(rawResult);

        if (taskType === 'extract_tasks') {
            try {
                let parsed = typeof cleanedResult === 'string' ? JSON.parse(cleanJsonString(cleanedResult)) : cleanedResult;
                if (!Array.isArray(parsed)) parsed = [parsed];
                currentAnalysis.tasks = parsed;
                container.innerHTML = buildTasksHtmlTable(parsed);
            } catch (e) {
                console.warn(`[Task JSON Parse Warning] error: ${e.message}`);
                currentAnalysis.tasks = [{ task_description: cleanedResult, assignee: 'Unassigned', deadline: null, status: 'Yapılacak' }];
                container.innerText = cleanedResult;
            }
        } else if (taskType === 'analyze_risks') {
            try {
                let parsed = typeof cleanedResult === 'string' ? JSON.parse(cleanJsonString(cleanedResult)) : cleanedResult;
                if (!Array.isArray(parsed)) parsed = [parsed];
                currentAnalysis.risks = parsed;
                container.innerHTML = buildRisksHtmlTable(parsed);
            } catch (e) {
                console.warn(`[Risk JSON Parse Warning] error: ${e.message}`);
                currentAnalysis.risks = [{ risk_description: cleanedResult, impact_level: 'Orta', mitigation_plan: '' }];
                container.innerText = cleanedResult;
            }
        } else if (taskType === 'summarize') {
            currentAnalysis.summary = cleanedResult;
            container.innerText = cleanedResult;
            container.contentEditable = "true";
        } else if (taskType === 'executive_brief') {
            currentAnalysis.executive_summary = cleanedResult;
            container.innerText = cleanedResult;
            container.contentEditable = "true";
        }
    }

    function cleanJsonString(str) {
        let cleaned = str;
        // Remove <think>...</think> tags (some models add thinking)
        cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
        // Remove markdown code fences
        cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/gi, '');
        // Remove any text before the first [ or { 
        const firstBracket = cleaned.search(/[\[{]/);
        if (firstBracket > 0) {
            cleaned = cleaned.substring(firstBracket);
        }
        // Remove any text after the last ] or }
        const lastBracket = Math.max(cleaned.lastIndexOf(']'), cleaned.lastIndexOf('}'));
        if (lastBracket > 0) {
            cleaned = cleaned.substring(0, lastBracket + 1);
        }
        return cleaned.trim();
    }

    // Helper: Date formatters for Turkish Display (DD.MM.YYYY) and ISO storage
    function formatDeadline(dateStr) {
        if (!dateStr || dateStr === 'Belirtilmedi' || dateStr === 'null' || dateStr === '-') return 'Belirtilmedi';
        if (typeof dateStr === 'string' && dateStr.includes('T')) {
            dateStr = dateStr.split('T')[0];
        }
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            const parts = dateStr.split('-');
            return `${parts[2]}.${parts[1]}.${parts[0]}`; // DD.MM.YYYY
        }
        return dateStr;
    }

    function parseTurkishDateToIso(dateStr) {
        if (!dateStr || dateStr === 'Belirtilmedi' || dateStr === '-') return null;
        if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
            const parts = dateStr.split('.');
            return `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
        }
        return dateStr;
    }

    function buildTasksHtmlTable(tasks) {
        if (!Array.isArray(tasks) || tasks.length === 0) return 'Görev tespit edilemedi.';
        return `
            <table class="data-table">
                <thead>
                    <tr><th>Görev</th><th>Sorumlu</th><th>Teslim Tarihi</th><th>Durum</th></tr>
                </thead>
                <tbody>
                    ${tasks.map((t, idx) => {
                        const status = t.status || 'Yapılacak';
                        const isCompleted = status === 'Tamamlandı' || status === 'Completed';
                        const isInProgress = status === 'Yapılıyor' || status === 'In Progress';
                        const isPending = !isCompleted && !isInProgress;

                        let selectClass = 'select-pending';
                        if (isCompleted) selectClass = 'select-completed';
                        else if (isInProgress) selectClass = 'select-inprogress';

                        return `
                        <tr>
                            <td contenteditable="true" class="editable-td" data-field="task_description" data-index="${idx}">${t.task_description || t.description || '-'}</td>
                            <td contenteditable="true" class="editable-td" data-field="assignee" data-index="${idx}"><strong style="color:var(--accent-blue)">${t.assignee || 'Atanmadı'}</strong></td>
                            <td contenteditable="true" class="editable-td" data-field="deadline" data-index="${idx}">${formatDeadline(t.deadline)}</td>
                            <td>
                                <select class="custom-select ${selectClass}" onchange="updateSelectStyle(this)">
                                    <option value="Yapılacak" ${isPending ? 'selected' : ''}>🔵 Yapılacak</option>
                                    <option value="Yapılıyor" ${isInProgress ? 'selected' : ''}>🟡 Yapılıyor</option>
                                    <option value="Tamamlandı" ${isCompleted ? 'selected' : ''}>🟢 Tamamlandı</option>
                                </select>
                            </td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    function buildRisksHtmlTable(risks) {
        if (!Array.isArray(risks) || risks.length === 0) return 'Risk tespit edilemedi.';
        return `
            <table class="data-table">
                <thead>
                    <tr><th>Risk Açıklaması</th><th>Etki Seviyesi</th><th>Önlem Planı</th></tr>
                </thead>
                <tbody>
                    ${risks.map((r, idx) => {
                        const impact = r.impact_level || r.impact || 'Orta';
                        const isHigh = impact.includes('Yüksek') || impact === 'High' || impact === 'Yuksek';
                        const isMedium = impact.includes('Orta') || impact === 'Medium';
                        const isLow = impact.includes('Düşük') || impact === 'Low' || impact === 'Dusuk';

                        let selectClass = 'select-medium';
                        if (isHigh) selectClass = 'select-high';
                        else if (isLow) selectClass = 'select-low';

                        return `
                        <tr>
                            <td contenteditable="true" class="editable-td" data-field="risk_description" data-index="${idx}">${r.risk_description || r.description || '-'}</td>
                            <td>
                                <select class="custom-select ${selectClass}" onchange="updateSelectStyle(this)">
                                    <option value="Yüksek" ${isHigh ? 'selected' : ''}>🔴 Yüksek</option>
                                    <option value="Orta" ${isMedium ? 'selected' : ''}>🟡 Orta</option>
                                    <option value="Düşük" ${isLow ? 'selected' : ''}>🟢 Düşük</option>
                                </select>
                            </td>
                            <td contenteditable="true" class="editable-td" data-field="mitigation_plan" data-index="${idx}">${r.mitigation_plan || r.mitigation || '-'}</td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    // Dynamic Select Background Color Updater
    window.updateSelectStyle = (selectEl) => {
        const val = selectEl.value;
        selectEl.classList.remove('select-pending', 'select-inprogress', 'select-completed', 'select-high', 'select-medium', 'select-low');
        if (val === 'Yapılacak') selectEl.classList.add('select-pending');
        else if (val === 'Yapılıyor') selectEl.classList.add('select-inprogress');
        else if (val === 'Tamamlandı') selectEl.classList.add('select-completed');
        else if (val === 'Yüksek') selectEl.classList.add('select-high');
        else if (val === 'Orta') selectEl.classList.add('select-medium');
        else if (val === 'Düşük') selectEl.classList.add('select-low');
    };

    // Helper functions to read live edited content from DOM tables
    function getLiveTasksFromDom() {
        const rows = document.querySelectorAll('#outputTasks tbody tr');
        if (!rows || rows.length === 0) return currentAnalysis.tasks;
        const tasks = [];
        rows.forEach(row => {
            const tds = row.querySelectorAll('td');
            if (tds.length >= 4) {
                const task_description = tds[0].innerText.trim();
                const assignee = tds[1].innerText.trim();
                const deadline = tds[2].innerText.trim();
                const select = tds[3].querySelector('select');
                const status = select ? select.value : 'Yapılacak';
                tasks.push({
                    task_description,
                    assignee: assignee || 'Unassigned',
                    deadline: parseTurkishDateToIso(deadline),
                    status
                });
            }
        });
        return tasks;
    }

    function getLiveRisksFromDom() {
        const rows = document.querySelectorAll('#outputRisks tbody tr');
        if (!rows || rows.length === 0) return currentAnalysis.risks;
        const risks = [];
        rows.forEach(row => {
            const tds = row.querySelectorAll('td');
            if (tds.length >= 3) {
                const risk_description = tds[0].innerText.trim();
                const select = tds[1].querySelector('select');
                const impact_level = select ? select.value : 'Orta';
                const mitigation_plan = tds[2].innerText.trim();
                risks.push({
                    risk_description,
                    impact_level,
                    mitigation_plan
                });
            }
        });
        return risks;
    }

    // ------------------------------------------------------------------
    // 4. "TÜMÜNÜ ANALİZ ET" Flow (Analyzes, enables save button, does NOT auto-save)
    // ------------------------------------------------------------------
    btnProcessAll.addEventListener('click', async () => {
        const text = document.getElementById('meetingNotes').value;

        if (!text.trim()) {
            alert('Lütfen önce toplantı notlarını girin.');
            return;
        }

        btnProcessAll.disabled = true;
        btnProcessAll.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Toplantı Analiz Ediliyor...';

        await runSingleTask('summarize', 'outputSummary');
        await runSingleTask('extract_tasks', 'outputTasks');
        await runSingleTask('analyze_risks', 'outputRisks');
        await runSingleTask('executive_brief', 'outputExec');

        btnProcessAll.disabled = false;
        btnProcessAll.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> TÜMÜNÜ ANALİZ ET';

        if (btnSaveToDb) {
            btnSaveToDb.disabled = false;
            btnSaveToDb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });

    // ------------------------------------------------------------------
    // 4b. MANUEL "VERİTABANINA KAYDET" Flow (Reads live edited fields)
    // ------------------------------------------------------------------
    if (btnSaveToDb) {
        btnSaveToDb.addEventListener('click', async () => {
            const title = document.getElementById('meetingTitle').value;
            const category = document.getElementById('meetingCategory') ? document.getElementById('meetingCategory').value : 'Genel';
            const text = document.getElementById('meetingNotes').value;

            if (!text.trim()) {
                alert('Lütfen önce toplantı notlarını girin.');
                return;
            }

            // Read live edited values from the DOM elements (texts and tables)
            const summaryText = document.getElementById('outputSummary').innerText.trim();
            const execText = document.getElementById('outputExec').innerText.trim();
            const liveTasks = getLiveTasksFromDom();
            const liveRisks = getLiveRisksFromDom();
            const emailRecipient = document.getElementById('meetingEmailRecipient') ? document.getElementById('meetingEmailRecipient').value.trim() : '';

            btnSaveToDb.disabled = true;
            btnSaveToDb.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Veritabanına Kaydediliyor...';

            try {
                const saveRes = await fetch('/api/meetings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: title || 'Başlıksız Toplantı',
                        category: category || 'Genel',
                        raw_notes: text,
                        summary: summaryText,
                        tasks: liveTasks,
                        risks: liveRisks,
                        executive_summary: execText,
                        email_recipient: emailRecipient
                    })
                });

                const saveData = await saveRes.json();
                if (saveData.success) {
                    alert(`✅ ${saveData.message}`);
                    loadSavedMeetings();
                } else {
                    alert(`⚠️ Veritabanına kaydetme hatası: ${saveData.error}`);
                }
            } catch (err) {
                alert(`Sunucu Hatası: ${err.message}`);
            } finally {
                btnSaveToDb.disabled = false;
                btnSaveToDb.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> İNCELEDİM & KONTROL ETTİM - VERİTABANINA KAYDET';
            }
        });
    }

    // ------------------------------------------------------------------
    // 5. Multi-Session AI Chat Interface (ChatGPT-Style Architecture)
    // ------------------------------------------------------------------
    const btnSendChat = document.getElementById('btnSendChat');
    const btnNewChatSession = document.getElementById('btnNewChatSession');
    const chatInput = document.getElementById('chatInput');
    const chatLog = document.getElementById('chatLog');
    const chatSessionsList = document.getElementById('chatSessionsList');
    const currentSessionTitle = document.getElementById('currentSessionTitle');

    let currentSessionId = null;
    let chatHistory = [];
    let sessionsCache = [];

    // Initialize multi-session chat on startup
    loadChatSessions();

    if (btnNewChatSession) {
        btnNewChatSession.addEventListener('click', () => createNewChatSession());
    }

    btnSendChat.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });

    async function loadChatSessions() {
        try {
            const res = await fetch('/api/ai/chat/sessions');
            const data = await res.json();

            if (data.success) {
                sessionsCache = data.sessions || [];
                renderSessionsList(sessionsCache);

                if (sessionsCache.length === 0) {
                    await createNewChatSession(false);
                } else if (!currentSessionId || !sessionsCache.some(s => s.id === currentSessionId)) {
                    selectChatSession(sessionsCache[0].id);
                }
            }
        } catch (err) {
            console.error('Error loading chat sessions:', err);
            if (chatSessionsList) chatSessionsList.innerHTML = '<div class="chat-session-loading">Sohbetler yüklenemedi.</div>';
        }
    }

    function renderSessionsList(sessions) {
        if (!chatSessionsList) return;

        if (sessions.length === 0) {
            chatSessionsList.innerHTML = '<div class="chat-session-loading">Henüz sohbet yok.</div>';
            return;
        }

        chatSessionsList.innerHTML = sessions.map(s => `
            <div class="chat-session-item ${s.id === currentSessionId ? 'active' : ''}" onclick="selectChatSession(${s.id})">
                <div class="chat-session-title">
                    <i class="fa-regular fa-message"></i>
                    <span>${escapeHtml(s.title || 'Yeni Sohbet')}</span>
                </div>
                <button class="btn-delete-session" onclick="deleteChatSession(${s.id}, '${escapeJsString(s.title)}', event)" title="Sohbeti Sil">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `).join('');
    }

    async function createNewChatSession(autoSelect = true) {
        try {
            const res = await fetch('/api/ai/chat/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'Yeni Sohbet' })
            });

            const data = await res.json();
            if (data.success && data.session) {
                await loadChatSessions();
                if (autoSelect) {
                    selectChatSession(data.session.id);
                }
            }
        } catch (err) {
            console.error('Create new chat session error:', err);
        }
    }

    window.selectChatSession = async (sessionId) => {
        currentSessionId = sessionId;
        const session = sessionsCache.find(s => s.id === sessionId);
        
        if (currentSessionTitle) {
            currentSessionTitle.innerHTML = `<i class="fa-solid fa-comments"></i> ${escapeHtml(session ? session.title : 'Yeni Sohbet')}`;
        }

        renderSessionsList(sessionsCache);
        resetChatLogUI();

        // Load messages for selected session
        try {
            const res = await fetch(`/api/ai/chat/sessions/${sessionId}/messages`);
            const data = await res.json();

            if (data.success && Array.isArray(data.messages)) {
                chatHistory = [];
                data.messages.forEach(msg => {
                    const role = msg.role === 'assistant' ? 'ai' : msg.role;
                    appendChatMessage(role, escapeHtml(msg.content));
                    chatHistory.push({ role: msg.role, content: msg.content });
                });
            }
        } catch (err) {
            console.error('Error fetching session messages:', err);
        }
    };

    window.deleteChatSession = async (sessionId, sessionTitle, event) => {
        if (event) event.stopPropagation();

        const displayTitle = sessionTitle || 'Bu';
        const confirmDelete = confirm(`⚠️ "${displayTitle}" isimli sohbet oturumunu ve tüm mesajlarını silmek istediğinize emin misiniz?`);
        if (!confirmDelete) return;

        try {
            const res = await fetch(`/api/ai/chat/sessions/${sessionId}`, { method: 'DELETE' });
            const data = await res.json();

            if (data.success) {
                if (currentSessionId === sessionId) {
                    currentSessionId = null;
                }
                await loadChatSessions();
            } else {
                alert(`Silme hatası: ${data.error}`);
            }
        } catch (err) {
            alert(`Sunucu hatası: ${err.message}`);
        }
    };

    function resetChatLogUI() {
        chatLog.innerHTML = `
            <div class="message system-msg">
                <i class="fa-solid fa-robot"></i> Merhaba! Ben yerel Yapay Zeka Toplantı
                Asistanınızım. Yukarıdaki toplantı notları, görev dağılımları veya genel teknik konularda soru sorabilirsiniz.
            </div>
        `;
    }

    async function sendChatMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // User message UI
        appendChatMessage('user', escapeHtml(text));
        chatInput.value = '';
        chatHistory.push({ role: 'user', content: text });

        // AI Typing indicator
        const typingEl = appendChatMessage('ai', '<i class="fa-solid fa-spinner fa-spin"></i> Düşünüyor...');

        const meetingContext = document.getElementById('meetingNotes').value;

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: currentSessionId,
                    messages: chatHistory,
                    context: meetingContext
                })
            });

            const data = await res.json();
            if (data.success) {
                typingEl.innerText = data.message.content;
                chatHistory.push(data.message);
                if (data.sessionId) currentSessionId = data.sessionId;

                // Re-fetch sessions to sync auto-generated title in sidebar
                loadChatSessions();
            } else {
                typingEl.innerText = `Hata: ${data.error}`;
            }
        } catch (err) {
            typingEl.innerText = `Bağlantı hatası: ${err.message}`;
        }
    }

    function appendChatMessage(role, htmlContent) {
        const div = document.createElement('div');
        div.className = `message ${role}`;
        div.innerHTML = htmlContent;
        chatLog.appendChild(div);
        chatLog.scrollTop = chatLog.scrollHeight;
        return div;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function escapeJsString(str) {
        if (!str) return '';
        return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
    }

    // ------------------------------------------------------------------
    // 6. Saved Meetings & Database Fetching
    // ------------------------------------------------------------------
    // ------------------------------------------------------------------
    // 6. Saved Meetings & Database Fetching (Feature 2.3 - Live Search & Tags)
    // ------------------------------------------------------------------
    const btnRefreshDb = document.getElementById('btnRefreshDb');
    const searchMeetingInput = document.getElementById('searchMeetingInput');
    const filterCategorySelect = document.getElementById('filterCategorySelect');

    if (btnRefreshDb) btnRefreshDb.addEventListener('click', loadSavedMeetings);

    if (searchMeetingInput) {
        searchMeetingInput.addEventListener('input', () => filterAndRenderMeetings());
    }
    if (filterCategorySelect) {
        filterCategorySelect.addEventListener('change', () => filterAndRenderMeetings());
    }

    async function loadSavedMeetings() {
        const tableBody = document.getElementById('dbTableBody');
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center"><i class="fa-solid fa-spinner fa-spin"></i> Yükleniyor...</td></tr>';

        try {
            const res = await fetch('/api/meetings');
            const data = await res.json();

            if (data.success) {
                window.savedMeetingsCache = data.meetings || [];
                document.getElementById('meetingCount').innerText = window.savedMeetingsCache.length;
                filterAndRenderMeetings();
            }
        } catch (err) {
            tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-red">Yükleme hatası: ${err.message}</td></tr>`;
        }
    }

    function filterAndRenderMeetings() {
        const tableBody = document.getElementById('dbTableBody');
        const query = (document.getElementById('searchMeetingInput')?.value || '').toLowerCase().trim();
        const categoryFilter = document.getElementById('filterCategorySelect')?.value || 'all';

        let list = window.savedMeetingsCache || [];

        // Category Filter
        if (categoryFilter !== 'all') {
            list = list.filter(m => (m.category || 'Genel') === categoryFilter);
        }

        // Live Search Filter across Title, Raw Notes, Summary, Executive Summary
        if (query) {
            list = list.filter(m => {
                const titleMatch = (m.title || '').toLowerCase().includes(query);
                const notesMatch = (m.raw_notes || '').toLowerCase().includes(query);
                const summaryMatch = (m.summary || '').toLowerCase().includes(query);
                const execMatch = (m.executive_summary || '').toLowerCase().includes(query);
                return titleMatch || notesMatch || summaryMatch || execMatch;
            });
        }

        if (list.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center" style="padding: 2rem; color: var(--text-secondary);"><i class="fa-solid fa-folder-open" style="font-size:2rem; margin-bottom:0.5rem; display:block;"></i> Eşleşen kayıtlı toplantı bulunamadı.</td></tr>';
            return;
        }

        tableBody.innerHTML = list.map(m => {
            const cat = m.category || 'Genel';
            let catClass = 'cat-genel';
            if (cat.includes('Yazılım')) catClass = 'cat-yazilim';
            else if (cat.includes('Pazarlama')) catClass = 'cat-pazarlama';
            else if (cat.includes('Siber')) catClass = 'cat-siber';
            else if (cat.includes('Yönetim')) catClass = 'cat-yonetim';
            else if (cat.includes('İnsan Kaynakları')) catClass = 'cat-ik';
            else if (cat.includes('Bütçe')) catClass = 'cat-finans';

            return `
                <tr>
                    <td>#${m.id}</td>
                    <td><strong>${escapeHtml(m.title)}</strong></td>
                    <td><span class="cat-badge ${catClass}">${escapeHtml(cat)}</span></td>
                    <td>${new Date(m.created_at).toLocaleString('tr-TR')}</td>
                    <td>${m.summary ? escapeHtml(m.summary.substring(0, 50)) + '...' : '<i>Özet Yok</i>'}</td>
                    <td><span class="badge online">${m.tasks ? m.tasks.length : 0} Görev</span></td>
                    <td><span class="badge ${m.risks && m.risks.length > 0 ? 'offline' : 'online'}">${m.risks ? m.risks.length : 0} Risk</span></td>
                    <td>
                        <button class="btn btn-secondary btn-sm" onclick="viewMeetingDetail(${m.id})"><i class="fa-solid fa-eye"></i> İncele</button>
                        <button class="btn btn-secondary btn-sm" style="color:var(--accent-red)" onclick="deleteMeeting(${m.id})"><i class="fa-solid fa-trash"></i> Sil</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Modal view handlers
    window.viewMeetingDetail = (id) => {
        const meeting = (window.savedMeetingsCache || []).find(m => m.id === id);
        if (!meeting) return;

        document.getElementById('modalTitle').innerText = `#${meeting.id} - ${meeting.title}`;
        document.getElementById('modalBody').innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; font-size:0.85rem; color:var(--text-secondary); flex-wrap:wrap; gap:0.5rem;">
                <div><strong>Kategori:</strong> ${escapeHtml(meeting.category || 'Genel')} | <strong>Tarih:</strong> ${new Date(meeting.created_at).toLocaleString('tr-TR')}</div>
                <div style="display:flex; gap:0.4rem;">
                    <button class="btn btn-secondary btn-sm" onclick="exportMeetingData(window.savedMeetingsCache.find(m=>m.id===${meeting.id}), 'pdf')"><i class="fa-solid fa-file-pdf" style="color:var(--accent-red)"></i> PDF</button>
                    <button class="btn btn-secondary btn-sm" onclick="exportMeetingData(window.savedMeetingsCache.find(m=>m.id===${meeting.id}), 'word')"><i class="fa-solid fa-file-word" style="color:#38bdf8"></i> Word</button>
                    <button class="btn btn-secondary btn-sm" onclick="exportMeetingData(window.savedMeetingsCache.find(m=>m.id===${meeting.id}), 'markdown')"><i class="fa-solid fa-file-code" style="color:var(--accent-purple)"></i> MD</button>
                </div>
            </div>
            
            <h4 style="color:var(--accent-blue); margin-top:1rem;">📌 Toplantı Özeti</h4>
            <p style="white-space:pre-wrap; background:var(--bg-primary); padding:0.75rem; border-radius:8px;">${meeting.summary || 'Özet bulunmuyor.'}</p>
            
            <h4 style="color:var(--accent-purple); margin-top:1rem;">📋 Görevler (${meeting.tasks ? meeting.tasks.length : 0})</h4>
            ${buildTasksHtmlTable(meeting.tasks)}

            <h4 style="color:var(--accent-amber); margin-top:1rem;">⚠️ Risk Analizi (${meeting.risks ? meeting.risks.length : 0})</h4>
            ${buildRisksHtmlTable(meeting.risks)}

            <h4 style="color:var(--accent-green); margin-top:1rem;">👔 Yönetici Özeti</h4>
            <p style="white-space:pre-wrap; background:var(--bg-primary); padding:0.75rem; border-radius:8px;">${meeting.executive_summary || 'Yönetici özeti bulunmuyor.'}</p>
        `;

        document.getElementById('meetingModal').classList.add('active');
    };

    window.deleteMeeting = async (id) => {
        if (!confirm('Bu toplantı kaydını silmek istediğinize emin misiniz?')) return;
        try {
            await fetch(`/api/meetings/${id}`, { method: 'DELETE' });
            loadSavedMeetings();
        } catch (e) {
            alert('Silme hatası: ' + e.message);
        }
    };

    document.getElementById('btnCloseModal').addEventListener('click', () => {
        document.getElementById('meetingModal').classList.remove('active');
    });

    // ------------------------------------------------------------------
    // 7. Export Engine (Feature 2.2 - PDF / Word / Markdown Export)
    // ------------------------------------------------------------------
    window.exportCurrentMeeting = (format) => {
        const title = document.getElementById('meetingTitle').value || 'Toplantı Raporu';
        const category = document.getElementById('meetingCategory') ? document.getElementById('meetingCategory').value : 'Genel';
        const summary = document.getElementById('outputSummary').innerText.trim();
        const execSummary = document.getElementById('outputExec').innerText.trim();
        const tasks = getLiveTasksFromDom();
        const risks = getLiveRisksFromDom();
        const rawNotes = document.getElementById('meetingNotes').value;

        const data = {
            title,
            category,
            created_at: new Date().toISOString(),
            summary: summary !== 'Toplantı özeti bekleniyor...' ? summary : '',
            executive_summary: execSummary !== 'Yönetici özeti bekleniyor...' ? execSummary : '',
            tasks: Array.isArray(tasks) ? tasks : [],
            risks: Array.isArray(risks) ? risks : [],
            raw_notes: rawNotes
        };

        exportMeetingData(data, format);
    };

    window.exportMeetingData = (data, format) => {
        if (!data) return;
        const cleanTitle = (data.title || 'Toplantı_Raporu').replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ_\- ]/g, '_');
        const filename = `${cleanTitle}_Rapor`;

        if (format === 'markdown') {
            let mdContent = `# 🚀 ${data.title}\n\n`;
            mdContent += `**Kategori:** ${data.category || 'Genel'}  \n`;
            mdContent += `**Tarih:** ${new Date(data.created_at || Date.now()).toLocaleString('tr-TR')}  \n\n`;
            mdContent += `---\n\n`;

            if (data.summary) {
                mdContent += `## 📌 Toplantı Özeti\n${data.summary}\n\n`;
            }
            if (data.tasks && data.tasks.length > 0) {
                mdContent += `## 📋 Görev Analizi\n`;
                mdContent += `| Görev | Sorumlu | Teslim Tarihi | Durum |\n| --- | --- | --- | --- |\n`;
                data.tasks.forEach(t => {
                    mdContent += `| ${t.task_description || t.description || '-'} | ${t.assignee || 'Unassigned'} | ${formatDeadline(t.deadline)} | ${t.status || 'Yapılacak'} |\n`;
                });
                mdContent += `\n`;
            }
            if (data.risks && data.risks.length > 0) {
                mdContent += `## ⚠️ Risk Analizi\n`;
                mdContent += `| Risk Açıklaması | Etki Seviyesi | Önlem Planı |\n| --- | --- | --- |\n`;
                data.risks.forEach(r => {
                    mdContent += `| ${r.risk_description || r.description || '-'} | ${r.impact_level || r.impact || 'Orta'} | ${r.mitigation_plan || r.mitigation || '-'} |\n`;
                });
                mdContent += `\n`;
            }
            if (data.executive_summary) {
                mdContent += `## 👔 Yönetici Özeti\n${data.executive_summary}\n\n`;
            }

            downloadFile(mdContent, `${filename}.md`, 'text/markdown;charset=utf-8;');
        } else if (format === 'word') {
            let docHtml = `<html xmlns:o='urn:schemas-microsoft-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>${escapeHtml(data.title)}</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; margin: 20px; }
                h1 { color: #0284c7; border-bottom: 2px solid #0284c7; padding-bottom: 5px; }
                h2 { color: #334155; margin-top: 20px; }
                table { border-collapse: collapse; width: 100%; margin-top: 10px; margin-bottom: 20px; }
                th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
                th { background-color: #f1f5f9; color: #0f172a; font-weight: bold; }
                .box { background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 12px; margin-bottom: 15px; }
            </style>
            </head>
            <body>
                <h1>${escapeHtml(data.title)}</h1>
                <p><strong>Kategori:</strong> ${escapeHtml(data.category || 'Genel')} | <strong>Tarih:</strong> ${new Date(data.created_at || Date.now()).toLocaleString('tr-TR')}</p>
                <hr/>
                <h2>📌 Toplantı Özeti</h2>
                <div class="box">${escapeHtml(data.summary || 'Özet bulunmuyor.').replace(/\n/g, '<br/>')}</div>
                
                <h2>📋 Görev Analizi</h2>
                ${buildStaticTasksHtmlTable(data.tasks)}
                
                <h2>⚠️ Risk Analizi</h2>
                ${buildStaticRisksHtmlTable(data.risks)}

                <h2>👔 Yönetici Özeti</h2>
                <div class="box">${escapeHtml(data.executive_summary || 'Yönetici özeti bulunmuyor.').replace(/\n/g, '<br/>')}</div>
            </body>
            </html>`;

            downloadFile(docHtml, `${filename}.doc`, 'application/msword;charset=utf-8;');
        } else if (format === 'pdf') {
            const printWin = window.open('', '_blank');
            printWin.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${escapeHtml(data.title)} - Kurumsal Toplantı Raporu</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #0f172a; line-height: 1.6; }
                        .header { border-bottom: 2px solid #0284c7; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
                        .logo { font-size: 22px; font-weight: bold; color: #0284c7; }
                        h1 { font-size: 20px; color: #0f172a; margin: 10px 0 5px 0; }
                        .meta { font-size: 13px; color: #64748b; margin-bottom: 20px; }
                        .section-title { font-size: 15px; font-weight: bold; color: #0284c7; margin-top: 20px; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
                        .box { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #0284c7; padding: 12px; border-radius: 6px; white-space: pre-wrap; margin-bottom: 15px; font-size: 13.5px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; font-size: 13px; }
                        th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
                        th { background: #f1f5f9; font-weight: 600; color: #0f172a; }
                        @media print {
                            body { margin: 15px; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">🤖 AI Meeting Assistant</div>
                        <div style="font-size: 12px; color: #64748b;">Kurumsal Toplantı & Karar Raporu</div>
                    </div>
                    <h1>${escapeHtml(data.title)}</h1>
                    <div class="meta">
                        <strong>Kategori:</strong> ${escapeHtml(data.category || 'Genel')} | 
                        <strong>Tarih:</strong> ${new Date(data.created_at || Date.now()).toLocaleString('tr-TR')}
                    </div>

                    <div class="section-title">📌 Toplantı Özeti</div>
                    <div class="box">${escapeHtml(data.summary || 'Özet bulunmuyor.')}</div>

                    <div class="section-title">📋 Görev Analizi</div>
                    ${buildStaticTasksHtmlTable(data.tasks)}

                    <div class="section-title">⚠️ Risk Analizi</div>
                    ${buildStaticRisksHtmlTable(data.risks)}

                    <div class="section-title">👔 Yönetici Özeti</div>
                    <div class="box">${escapeHtml(data.executive_summary || 'Yönetici özeti bulunmuyor.')}</div>

                    <script>
                        window.onload = function() {
                            window.print();
                        }
                    </script>
                </body>
                </html>
            `);
            printWin.document.close();
        }
    };

    function buildStaticTasksHtmlTable(tasks) {
        if (!Array.isArray(tasks) || tasks.length === 0) return '<p style="color:#64748b; font-style:italic;">Görev tespit edilemedi.</p>';
        return `
            <table>
                <thead>
                    <tr><th>Görev Açıklaması</th><th>Sorumlu</th><th>Teslim Tarihi</th><th>Durum</th></tr>
                </thead>
                <tbody>
                    ${tasks.map(t => {
                        const status = t.status || 'Yapılacak';
                        let badge = '🔵 Yapılacak';
                        if (status === 'Tamamlandı' || status === 'Completed') badge = '🟢 Tamamlandı';
                        else if (status === 'Yapılıyor' || status === 'In Progress') badge = '🟡 Yapılıyor';
                        return `
                        <tr>
                            <td>${escapeHtml(t.task_description || t.description || '-')}</td>
                            <td><strong>${escapeHtml(t.assignee || 'Atanmadı')}</strong></td>
                            <td>${escapeHtml(formatDeadline(t.deadline))}</td>
                            <td><strong>${escapeHtml(badge)}</strong></td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    function buildStaticRisksHtmlTable(risks) {
        if (!Array.isArray(risks) || risks.length === 0) return '<p style="color:#64748b; font-style:italic;">Risk tespit edilemedi.</p>';
        return `
            <table>
                <thead>
                    <tr><th>Risk Açıklaması</th><th>Etki Seviyesi</th><th>Önlem Planı</th></tr>
                </thead>
                <tbody>
                    ${risks.map(r => {
                        const impact = r.impact_level || r.impact || 'Orta';
                        let badge = '🟡 Orta';
                        if (impact.includes('Yüksek') || impact === 'High' || impact === 'Yuksek') badge = '🔴 Yüksek';
                        else if (impact.includes('Düşük') || impact === 'Low' || impact === 'Dusuk') badge = '🟢 Düşük';
                        return `
                        <tr>
                            <td>${escapeHtml(r.risk_description || r.description || '-')}</td>
                            <td><strong>${escapeHtml(badge)}</strong></td>
                            <td>${escapeHtml(r.mitigation_plan || r.mitigation || '-')}</td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    function downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
});
