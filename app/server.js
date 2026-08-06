const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});
app.use(express.static(path.join(__dirname, 'public'), { etag: false, maxAge: 0 }));

// PostgreSQL Pool configuration
const pool = new Pool({
    host: process.env.DB_HOST || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'meeting_db',
    user: process.env.DB_USER || 'meeting_user',
    password: process.env.DB_PASSWORD || 'meeting_password',
});

// Ollama and n8n URLs
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://ollama:11434';
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://n8n:5678/webhook/meeting-notes';

// Candidate n8n Webhook URLs (Active & Test Mode)
const N8N_CANDIDATE_URLS = [
    N8N_WEBHOOK_URL,
    'http://n8n:5678/webhook-test/meeting-notes'
];

// Utility: Read prompt markdown files dynamically from /prompts folder
function getPromptFromFile(fileName) {
    try {
        const filePath = path.join(__dirname, '..', 'prompts', fileName);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8').trim();
            console.log(`  ✅ [Prompt] Loaded: ${fileName} (${content.length} chars) from ${filePath}`);
            return content;
        } else {
            console.error(`  ❌ [Prompt] File NOT FOUND: ${filePath}`);
        }
    } catch (err) {
        console.error(`  ❌ [Prompt] Error reading ${fileName}:`, err.message);
    }
    return null;
}

// Utility: get local network IP address
function getLocalIpAddress(req) {
    if (process.env.HOST_IP) return process.env.HOST_IP;
    
    // If client connected via explicit IP in Host header, use that
    if (req && req.headers && req.headers.host) {
        const hostHeader = req.headers.host.split(':')[0];
        if (hostHeader && hostHeader !== 'localhost' && hostHeader !== '127.0.0.1' && hostHeader !== '0.0.0.0') {
            return hostHeader;
        }
    }

    // Try system network interfaces
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && !alias.internal) {
                return alias.address;
            }
        }
    }
    
    return 'localhost';
}

// ----------------------------------------------------
// 1. System Health Check Endpoint
// ----------------------------------------------------
app.get('/api/status', async (req, res) => {
    let dbStatus = false;
    let ollamaStatus = false;
    let n8nStatus = false;

    try {
        await pool.query('SELECT 1');
        dbStatus = true;
    } catch (e) {
        dbStatus = false;
    }

    try {
        const ollamaRes = await fetch(`${OLLAMA_URL}/api/tags`);
        if (ollamaRes.ok) ollamaStatus = true;
    } catch (e) {
        ollamaStatus = false;
    }

    try {
        const n8nRes = await fetch('http://n8n:5678/healthz');
        if (n8nRes.ok) n8nStatus = true;
    } catch (e) {
        n8nStatus = false;
    }

    res.json({
        success: true,
        localIp: getLocalIpAddress(req),
        port: PORT,
        services: {
            database: dbStatus,
            ollama: ollamaStatus,
            n8n: n8nStatus
        }
    });
});

// ----------------------------------------------------
// 2. Fetch All Saved Meetings with Details
// ----------------------------------------------------
app.get('/api/meetings', async (req, res) => {
    try {
        const meetingsQuery = `
            SELECT 
                m.id, 
                m.title, 
                m.category,
                m.meeting_date, 
                m.raw_notes, 
                m.created_at,
                ms.summary,
                ms.key_decisions,
                es.executive_summary,
                es.strategic_recommendations
            FROM meetings m
            LEFT JOIN meeting_summaries ms ON m.id = ms.meeting_id
            LEFT JOIN executive_summaries es ON m.id = es.meeting_id
            ORDER BY m.created_at DESC;
        `;
        const meetingsResult = await pool.query(meetingsQuery);

        const meetings = await Promise.all(meetingsResult.rows.map(async (meeting) => {
            const tasksRes = await pool.query('SELECT * FROM tasks WHERE meeting_id = $1 ORDER BY id ASC', [meeting.id]);
            const risksRes = await pool.query('SELECT * FROM risk_analyses WHERE meeting_id = $1 ORDER BY id ASC', [meeting.id]);
            return {
                ...meeting,
                tasks: tasksRes.rows,
                risks: risksRes.rows
            };
        }));

        res.json({ success: true, meetings });
    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ----------------------------------------------------
// 3. Save Processed Meeting to PostgreSQL & Trigger n8n Email Workflow
// ----------------------------------------------------
app.post('/api/meetings', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { title, category, raw_notes, summary, key_decisions, tasks, risks, executive_summary, strategic_recommendations, email_recipient } = req.body;

        const meetingRes = await client.query(
            'INSERT INTO meetings (title, category, raw_notes) VALUES ($1, $2, $3) RETURNING id',
            [title || 'Başlıksız Toplantı', category || 'Genel', raw_notes || '']
        );
        const meetingId = meetingRes.rows[0].id;

        if (summary) {
            await client.query(
                'INSERT INTO meeting_summaries (meeting_id, summary, key_decisions) VALUES ($1, $2, $3)',
                [meetingId, summary, key_decisions || '']
            );
        }

        if (Array.isArray(tasks)) {
            for (const task of tasks) {
                await client.query(
                    'INSERT INTO tasks (meeting_id, task_description, assignee, deadline, status) VALUES ($1, $2, $3, $4, $5)',
                    [
                        meetingId,
                        task.task_description || task.description || '',
                        task.assignee || 'Unassigned',
                        task.deadline && task.deadline !== '' ? task.deadline : null,
                        task.status || 'Pending'
                    ]
                );
            }
        }

        if (Array.isArray(risks)) {
            for (const risk of risks) {
                await client.query(
                    'INSERT INTO risk_analyses (meeting_id, risk_description, impact_level, mitigation_plan) VALUES ($1, $2, $3, $4)',
                    [
                        meetingId,
                        risk.risk_description || risk.description || '',
                        risk.impact_level || risk.impact || 'Medium',
                        risk.mitigation_plan || risk.mitigation || ''
                    ]
                );
            }
        }

        if (executive_summary) {
            await client.query(
                'INSERT INTO executive_summaries (meeting_id, executive_summary, strategic_recommendations) VALUES ($1, $2, $3)',
                [meetingId, executive_summary, strategic_recommendations || '']
            );
        }

        await client.query('COMMIT');

        // Trigger n8n Email Notification Workflow asynchronously if email recipient provided
        let emailStatusMessage = '';
        if (email_recipient && email_recipient.trim()) {
            emailStatusMessage = ` Ve e-posta bildirimi n8n akışına gönderildi (${email_recipient}).`;
            (async () => {
                const emailPayload = {
                    meetingId,
                    title: title || 'Başlıksız Toplantı',
                    recipient: email_recipient.trim(),
                    summary: summary || '',
                    tasks: tasks || [],
                    risks: risks || [],
                    executive_summary: executive_summary || ''
                };

                for (const url of ['http://n8n:5678/webhook/meeting-email', 'http://n8n:5678/webhook-test/meeting-email']) {
                    try {
                        const mailRes = await fetch(url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(emailPayload)
                        });
                        if (mailRes.ok) {
                            console.log(`  📧 [n8n Email Triggered] Dispatched to ${url} for recipient ${email_recipient}`);
                            break;
                        }
                    } catch (err) {
                        console.log(`  ⚠️ [n8n Email Warning] Unable to reach ${url}: ${err.message}`);
                    }
                }
            })();
        }

        res.json({
            success: true,
            meetingId,
            message: `Toplantı veritabanına başarıyla kaydedildi.${emailStatusMessage}`
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Save meeting error:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
});

// ----------------------------------------------------
// 4. Update & Delete Handlers
// ----------------------------------------------------
app.patch('/api/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const { status } = req.body;
        await pool.query('UPDATE tasks SET status = $1 WHERE id = $2', [status, taskId]);
        res.json({ success: true, message: 'Görev durumu güncellendi.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/meetings/:id', async (req, res) => {
    try {
        const meetingId = req.params.id;
        await pool.query('DELETE FROM meetings WHERE id = $1', [meetingId]);
        res.json({ success: true, message: 'Toplantı kaydı silindi.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ----------------------------------------------------
// 5. Call AI Task with Intelligent n8n Webhook Routing
// ----------------------------------------------------
// Utility: Strip echoed input tags from AI output (server-side safety net)
function cleanAiResult(text) {
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

app.post('/api/ai/analyze', async (req, res) => {
    const { taskType, text, title } = req.body;

    const fileMap = {
        summarize: '01_meeting_summarizer.md',
        extract_tasks: '02_task_extractor.md',
        analyze_risks: '03_risk_analyzer.md',
        executive_brief: '04_manager_assistant.md'
    };

    const promptFileName = fileMap[taskType] || '01_meeting_summarizer.md';
    let systemPromptContent = getPromptFromFile(promptFileName);

    if (!systemPromptContent) {
        systemPromptContent = 'Sen yardımcı bir toplantı asistanısın. Yalnızca Türkçe yanıt ver.';
    }

    const userMessage = text;

    console.log(`\n📋 [AI Analyze] taskType: ${taskType}, prompt dosyası: ${promptFileName}`);

    // Try candidate n8n Webhook URLs (Active & Test Mode)
    for (const url of Array.from(new Set(N8N_CANDIDATE_URLS))) {
        try {
            console.log(`  🔗 [n8n] Trying: ${url}`);
            const n8nRes = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taskType,
                    text: userMessage,
                    title,
                    systemPrompt: systemPromptContent
                })
            });

            if (n8nRes.ok) {
                const n8nData = await n8nRes.json();
                console.log(`  🟢 [n8n Success] taskType: ${taskType} → n8n source: ${n8nData.source || 'n8n'}`);
                const rawResult = n8nData.result || n8nData.response || n8nData;
                return res.json({
                    success: true,
                    result: cleanAiResult(typeof rawResult === 'string' ? rawResult : JSON.stringify(rawResult)),
                    source: n8nData.source || 'n8n Workflow Engine'
                });
            } else {
                console.log(`  ⚠️ [n8n] ${url} returned status ${n8nRes.status}`);
            }
        } catch (n8nErr) {
            console.log(`  ⚠️ [n8n] Failed to connect to ${url}: ${n8nErr.message}`);
        }
    }

    // Direct Ollama call fallback using /api/chat (separates system/user roles)
    try {
        console.log(`  🔄 [Ollama Fallback] n8n unreachable, calling Ollama /api/chat for taskType: ${taskType}`);
        const ollamaRes = await fetch(`${OLLAMA_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3.2',
                messages: [
                    { role: 'system', content: systemPromptContent },
                    { role: 'user', content: userMessage }
                ],
                options: {
                    stop: ["<notlar>", "</notlar>", "Toplantı Detayları ve Alınan Kararlar:"]
                },
                stream: false
            })
        });

        if (!ollamaRes.ok) {
            throw new Error(`Ollama API error: ${ollamaRes.statusText}`);
        }

        const ollamaData = await ollamaRes.json();
        const aiResult = cleanAiResult(ollamaData.message?.content || ollamaData.response || '');
        console.log(`  🟡 [Ollama Direct] taskType: ${taskType} processed successfully`);
        res.json({ success: true, result: aiResult, source: 'Ollama Agent Engine (Direct - n8n Bypass)' });
    } catch (error) {
        console.error('  ❌ [AI Error]', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Ensure chat_sessions and chat_messages tables exist on server start
(async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS chat_sessions (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL DEFAULT 'Yeni Sohbet',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id SERIAL PRIMARY KEY,
                session_id INT REFERENCES chat_sessions(id) ON DELETE CASCADE,
                role VARCHAR(20) NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        // Migration check: Add category column to meetings if missing
        await pool.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='meetings' AND column_name='category') THEN
                    ALTER TABLE meetings ADD COLUMN category VARCHAR(100) DEFAULT 'Genel';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chat_messages' AND column_name='session_id') THEN
                    ALTER TABLE chat_messages ADD COLUMN session_id INT REFERENCES chat_sessions(id) ON DELETE CASCADE;
                END IF;
            END $$;
        `);
    } catch (err) {
        console.error('Error initializing chat tables:', err.message);
    }
})();

// ----------------------------------------------------
// 6. Multi-Session AI Chat Endpoints (ChatGPT-Style Architecture)
// ----------------------------------------------------

// GET /api/ai/chat/sessions - Fetch all chat sessions ordered by latest updated
app.get('/api/ai/chat/sessions', async (req, res) => {
    try {
        const query = `
            SELECT 
                s.id, 
                s.title, 
                s.created_at, 
                s.updated_at,
                COUNT(m.id)::int AS message_count
            FROM chat_sessions s
            LEFT JOIN chat_messages m ON s.id = m.session_id
            GROUP BY s.id
            ORDER BY s.updated_at DESC;
        `;
        const result = await pool.query(query);
        res.json({ success: true, sessions: result.rows });
    } catch (error) {
        console.error('Fetch chat sessions error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/ai/chat/sessions - Create a new chat session
app.post('/api/ai/chat/sessions', async (req, res) => {
    try {
        const title = req.body.title || 'Yeni Sohbet';
        const result = await pool.query(
            'INSERT INTO chat_sessions (title) VALUES ($1) RETURNING id, title, created_at, updated_at',
            [title]
        );
        res.json({ success: true, session: result.rows[0] });
    } catch (error) {
        console.error('Create chat session error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/ai/chat/sessions/:id/messages - Fetch messages for a specific session
app.get('/api/ai/chat/sessions/:id/messages', async (req, res) => {
    try {
        const sessionId = req.params.id;
        const result = await pool.query(
            'SELECT role, content, created_at FROM chat_messages WHERE session_id = $1 ORDER BY id ASC',
            [sessionId]
        );
        res.json({ success: true, messages: result.rows });
    } catch (error) {
        console.error('Fetch session messages error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/ai/chat/sessions/:id - Delete a specific chat session and all its messages
app.delete('/api/ai/chat/sessions/:id', async (req, res) => {
    try {
        const sessionId = req.params.id;
        await pool.query('DELETE FROM chat_sessions WHERE id = $1', [sessionId]);
        res.json({ success: true, message: 'Sohbet oturumu başarıyla silindi.' });
    } catch (error) {
        console.error('Delete chat session error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/ai/chat - Process message within a session
app.post('/api/ai/chat', async (req, res) => {
    let { sessionId, messages, context } = req.body;

    try {
        // Ensure session exists; if not provided, create new session
        if (!sessionId) {
            const newSessionRes = await pool.query("INSERT INTO chat_sessions (title) VALUES ('Yeni Sohbet') RETURNING id");
            sessionId = newSessionRes.rows[0].id;
        }

        const lastUserMsg = messages && messages.length > 0 ? messages[messages.length - 1] : null;

        // Auto-generate short session title from first user message if session is default titled
        if (lastUserMsg && lastUserMsg.role === 'user') {
            const sessionRes = await pool.query('SELECT title FROM chat_sessions WHERE id = $1', [sessionId]);
            if (sessionRes.rows.length > 0 && (sessionRes.rows[0].title === 'Yeni Sohbet' || !sessionRes.rows[0].title)) {
                let autoTitle = lastUserMsg.content.trim().split(/\s+/).slice(0, 5).join(' ');
                if (autoTitle.length > 35) autoTitle = autoTitle.substring(0, 35) + '...';
                if (autoTitle.length > 0) {
                    await pool.query('UPDATE chat_sessions SET title = $1 WHERE id = $2', [autoTitle, sessionId]);
                }
            }

            // Save user message to PostgreSQL
            await pool.query('INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3)', [sessionId, 'user', lastUserMsg.content]);
            await pool.query('UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [sessionId]);
        }

        const formattedContext = context ? `<toplanti_notlari>\n${context}\n</toplanti_notlari>` : '';
        const systemPrompt = {
            role: 'system',
            content: `Sen şirket içi toplantı ve karar destek asistanısın. Türkçe konuşuyorsun. Saygılı, profesyonel, yapıcı ve doğrudan cevaplar veriyorsun. Kullanıcının sorularını toplantı bağlamını veya genel bilgilerini kullanarak yanıtla.\n${formattedContext}`
        };

        const fullMessages = [systemPrompt, ...(messages || [])];

        const ollamaRes = await fetch(`${OLLAMA_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3.2',
                messages: fullMessages,
                stream: false
            })
        });

        if (!ollamaRes.ok) {
            throw new Error(`Ollama Chat Error: ${ollamaRes.statusText}`);
        }

        const data = await ollamaRes.json();

        // Save AI response to PostgreSQL
        if (data.message && data.message.content) {
            await pool.query('INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3)', [sessionId, 'assistant', data.message.content]);
            await pool.query('UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [sessionId]);
        }

        res.json({ success: true, sessionId, message: data.message });
    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Docker AI Meeting Assistant Custom Web UI running on http://0.0.0.0:${PORT}`);
});
