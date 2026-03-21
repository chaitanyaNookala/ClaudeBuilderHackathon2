require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, REST, Routes } = require('discord.js');
const initSqlJs = require('sql.js');
const cron = require('node-cron');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

let db;
const DB_PATH = path.join(__dirname, 'pulsebot.db');

async function initDatabase() {
    const SQL = await initSqlJs();
    if (fs.existsSync(DB_PATH)) {
        const buffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(buffer);
    } else {
        db = new SQL.Database();
    }
    db.run('CREATE TABLE IF NOT EXISTS users (discord_id TEXT PRIMARY KEY, username TEXT, timezone TEXT DEFAULT \'America/New_York\', wake_time TEXT DEFAULT \'09:00\', branch TEXT, streak_count INTEGER DEFAULT 0, longest_streak INTEGER DEFAULT 0, joined_at TEXT DEFAULT CURRENT_TIMESTAMP)');
    db.run('CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, week_number INTEGER, milestone_title TEXT, task_description TEXT, resource_name TEXT, resource_url TEXT, estimated_hours REAL, deadline_timestamp TEXT, status TEXT DEFAULT \'pending\', created_at TEXT DEFAULT CURRENT_TIMESTAMP, completed_at TEXT)');
    db.run('CREATE TABLE IF NOT EXISTS roadmap_data (user_id TEXT PRIMARY KEY, headline TEXT, summary TEXT, roadmap_json TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP)');
    saveDatabase();
    console.log('Database initialized');
}

function saveDatabase() {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
}

const dbh = {
    get: (sql, p) => { const s = db.prepare(sql); s.bind(p || []); return s.step() ? s.getAsObject() : null; },
    all: (sql, p) => { const s = db.prepare(sql); s.bind(p || []); const r = []; while (s.step()) r.push(s.getAsObject()); s.free(); return r; },
    run: (sql, p) => { db.run(sql, p || []); saveDatabase(); }
};

const app = express();
app.use(cors());
app.use(express.json());

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel, Partials.Message, Partials.User]
});

const CONFIG = { PORT: process.env.PORT || 3000, DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN || '', GEMINI_API_KEY: process.env.GEMINI_API_KEY || '' };

// Health check (not at / — static FirstPath serves index.html there)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', bot: client.isReady() ? 'connected' : 'disconnected' });
});

// Webhook endpoint
app.post('/firstpath-import', async (req, res) => {
    console.log('Received webhook request:', JSON.stringify(req.body, null, 2).substring(0, 500));
    try {
        const { discord_id, branch, roadmap } = req.body;
        if (!roadmap || !roadmap.roadmap_90_days) {
            return res.status(400).json({ error: 'Missing roadmap data. Complete FirstPath first.' });
        }
        let user;
        try { user = await client.users.fetch(discord_id); console.log('Fetched user:', user.tag); } catch (e) { console.log('User fetch error:', e.message); }
        dbh.run('INSERT OR REPLACE INTO users (discord_id, username, branch) VALUES (?, ?, ?)', [discord_id, user ? user.username : 'Unknown', branch]);
        dbh.run('INSERT OR REPLACE INTO roadmap_data (user_id, headline, summary, roadmap_json) VALUES (?, ?, ?, ?)', [discord_id, roadmap.headline, roadmap.summary, JSON.stringify(roadmap.roadmap_90_days)]);
        const startDate = new Date();
        for (const week of roadmap.roadmap_90_days || []) {
            if (week.discord_task) {
                const deadline = new Date(startDate.getTime() + ((week.deadline || 7) * 24 * 60 * 60 * 1000));
                dbh.run('INSERT INTO tasks (user_id, week_number, milestone_title, task_description, resource_name, estimated_hours, deadline_timestamp, status) VALUES (?, ?, ?, ?, ?, ?, ?, \'pending\')', [discord_id, week.week, week.milestone, (week.tasks || []).join(', '), week.resource || null, parseFloat(week.hours) || 5, deadline.toISOString()]);
            }
        }
        try {
            if (user) {
                const embed = new EmbedBuilder().setTitle('Your FirstPath Plan Has Arrived!').setDescription(roadmap.headline + '\n\n' + roadmap.summary).setColor(0x2d6a4f).addFields({ name: 'Duration', value: '90 Days / 12 Weeks' });
                console.log('Attempting to create DM channel with user:', user.tag, '(', discord_id, ')');
                const dm = await user.createDM();
                console.log('DM channel created, sending message...');
                await dm.send({ embeds: [embed] });
                console.log('DM sent successfully to user:', user.tag);
            } else {
                console.log('WARNING: Could not fetch user with ID:', discord_id, '- no DM sent');
            }
        } catch (e) { console.log('DM error:', e.message, e.code); }
        res.json({ success: true, dm_sent: !!user });
    } catch (err) { console.log('Webhook error:', err.message); res.status(500).json({ error: err.message }); }
});

app.post('/api/roadmap', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!CONFIG.GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
        
        const r = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=' + CONFIG.GEMINI_API_KEY, {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.85, maxOutputTokens: 6000 }
        });
        
        res.json(r.data);
    } catch (err) {
        console.error('Roadmap generation error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.use(express.static(path.join(__dirname, '../firstpath')));

function createTaskEmbed(week, streak) {
    const tasks = Array.isArray(week.tasks) ? week.tasks : [week.tasks];
    return new EmbedBuilder().setTitle('Week ' + week.week + ': ' + week.milestone).setDescription(tasks.map((t, i) => (i + 1) + '. ' + t).join('\n')).setColor(0xe85d26).addFields({ name: 'Time', value: (week.hours || 5) + ' hrs' }, { name: 'Streak', value: streak + ' days' });
}

function scheduleTaskAlerts(userId, week) {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + (week.deadline || 7));
    deadline.setHours(9, 0, 0, 0);
    const now = new Date();
    if (deadline > now) setTimeout(() => sendTaskAlert(userId, week), deadline.getTime() - now.getTime());
}

async function sendTaskAlert(userId, week) {
    try {
        const user = await client.users.fetch(userId);
        const streak = dbh.get('SELECT streak_count FROM users WHERE discord_id = ?', [userId]);
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('done_' + week.week).setLabel('Done').setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId('snooze_' + week.week).setLabel('Snooze').setStyle(ButtonStyle.Secondary), new ButtonBuilder().setCustomId('stuck_' + week.week).setLabel('Stuck').setStyle(ButtonStyle.Danger));
        await (await user.createDM()).send({ embeds: [createTaskEmbed(week, streak ? streak.streak_count : 0)], components: [row] });
    } catch (e) { console.log('Alert error:', e.message); }
}

async function generateDailyDigest(userId) {
    const user = dbh.get('SELECT * FROM users WHERE discord_id = ?', [userId]);
    if (!user) return;
    const pending = dbh.all('SELECT * FROM tasks WHERE user_id = ? AND status = ? ORDER BY deadline_timestamp ASC LIMIT 3', [userId, 'pending']);
    const roadmap = dbh.get('SELECT headline, roadmap_json FROM roadmap_data WHERE user_id = ?', [userId]);
    const total = roadmap ? JSON.parse(roadmap.roadmap_json).length : 12;
    const completed = dbh.get('SELECT COUNT(DISTINCT week_number) as c FROM tasks WHERE user_id = ? AND status = ?', [userId, 'completed']);
    const pct = Math.round(((completed ? completed.c : 0) / total) * 100);
    const bar = '\u2588'.repeat(Math.floor(pct / 10)) + '\u2591'.repeat(10 - Math.floor(pct / 10));
    const embed = new EmbedBuilder().setTitle('Good Morning, ' + user.username + '!').setDescription(roadmap ? roadmap.headline : 'Your 90-Day Journey').setColor(0x2d6a4f).addFields({ name: 'Streak', value: user.streak_count + ' days' }, { name: 'Progress', value: bar + ' ' + pct + '%' });
    if (pending.length) embed.addFields({ name: 'Today', value: pending.map((t, i) => (i + 1) + '. ' + t.milestone_title).join('\n') });
    try { await (await client.users.fetch(userId).then(u => u.createDM())).send({ embeds: [embed] }); } catch (e) { }
}

// Slash commands
const commands = [
    new SlashCommandBuilder().setName('roadmap').setDescription('View your roadmap'),
    new SlashCommandBuilder().setName('tasks').setDescription('Show tasks'),
    new SlashCommandBuilder().setName('done').setDescription('Complete task').addStringOption(o => o.setName('task').setDescription('Task name').setRequired(true)),
    new SlashCommandBuilder().setName('stuck').setDescription('Get help').addStringOption(o => o.setName('issue').setDescription('What blocks you?')),
    new SlashCommandBuilder().setName('settings').setDescription('Configure').addStringOption(o => o.setName('timezone').setDescription('Timezone')),
    new SlashCommandBuilder().setName('streak').setDescription('View streak'),
    new SlashCommandBuilder().setName('digest').setDescription('Daily summary')
];

client.on('ready', async () => {
    console.log('Bot logged in as', client.user.tag, '| ID:', client.user.id);
    console.log('Bot is in', client.guilds.cache.size, 'server(s)');
    try {
        await new REST({ version: '10' }).setToken(CONFIG.DISCORD_BOT_TOKEN).put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('Global commands registered');
    } catch (e) { console.log('Command error:', e.message); }
    cron.schedule('0 9 * * *', () => { dbh.all('SELECT discord_id FROM users').forEach(u => generateDailyDigest(u.discord_id)); });
});

client.on('interactionCreate', async (i) => {
    console.log('Interaction:', i.commandName || i.customId);
    if (!i.isCommand()) {
        if (i.isButton()) {
            const parts = i.customId.split('_');
            const action = parts[0];
            const week = parseInt(parts[1]);
            const uid = i.user.id;
            if (action === 'done') {
                dbh.run('UPDATE tasks SET status = ?, completed_at = datetime("now") WHERE user_id = ? AND week_number = ?', ['completed', uid, week]);
                const u = dbh.get('SELECT streak_count FROM users WHERE discord_id = ?', [uid]);
                dbh.run('UPDATE users SET streak_count = ? WHERE discord_id = ?', [(u && u.streak_count ? u.streak_count : 0) + 1, uid]);
                await i.reply({ embeds: [new EmbedBuilder().setTitle('Done!').setDescription('Week ' + week + ' complete!').setColor(0x2d6a4f)] });
            }
        }
        return;
    }
    const cmd = i.commandName;
    const uid = i.user.id;
    const opts = i.options;

    if (cmd === 'roadmap') {
        const rd = dbh.get('SELECT headline, summary, roadmap_json FROM roadmap_data WHERE user_id = ?', [uid]);
        if (!rd) { await i.reply({ content: 'No roadmap. Complete FirstPath first!' }); return; }
        const tasks = dbh.all('SELECT week_number, status FROM tasks WHERE user_id = ? ORDER BY week_number', [uid]);
        const done = tasks.filter(t => t.status === 'completed').length;
        const total = JSON.parse(rd.roadmap_json).length;
        const pct = Math.round((done / total) * 100);
        const bar = '\u2588'.repeat(Math.floor(pct / 10)) + '\u2591'.repeat(10 - Math.floor(pct / 10));
        await i.reply({ embeds: [new EmbedBuilder().setTitle(rd.headline).setDescription(rd.summary).setColor(0x2d6a4f).addFields({ name: 'Progress', value: bar + ' ' + pct + '%' }, { name: 'Completed', value: done + '/' + total + ' weeks' })] });
    }
    else if (cmd === 'tasks') {
        const pending = dbh.all('SELECT week_number, milestone_title FROM tasks WHERE user_id = ? AND status = ? ORDER BY week_number', [uid, 'pending']);
        const completed = dbh.all('SELECT week_number, milestone_title FROM tasks WHERE user_id = ? AND status = ? ORDER BY week_number DESC', [uid, 'completed']);
        const emb = new EmbedBuilder().setTitle('Tasks').setColor(0xe85d26);
        if (pending.length) emb.addFields({ name: 'Pending (' + pending.length + ')', value: pending.map((t, x) => (x + 1) + '. ' + t.milestone_title).join('\n') });
        if (completed.length) emb.addFields({ name: 'Done (' + completed.length + ')', value: completed.slice(0, 5).map(t => '✓ ' + t.milestone_title).join('\n') });
        await i.reply({ embeds: [emb] });
    }
    else if (cmd === 'done') {
        const taskDesc = opts.getString('task');
        const likePattern = '%' + taskDesc + '%';
        const task = dbh.get('SELECT * FROM tasks WHERE user_id = ? AND status = ? AND (milestone_title LIKE ? OR task_description LIKE ?) ORDER BY week_number LIMIT 1', [uid, 'pending', likePattern, likePattern]);
        if (!task) { await i.reply({ content: 'Task not found' }); return; }
        dbh.run('UPDATE tasks SET status = ?, completed_at = datetime("now") WHERE id = ?', ['completed', task.id]);
        const u = dbh.get('SELECT streak_count FROM users WHERE discord_id = ?', [uid]);
        dbh.run('UPDATE users SET streak_count = ? WHERE discord_id = ?', [(u && u.streak_count ? u.streak_count : 0) + 1, uid]);
        await i.reply({ content: 'Done: ' + task.milestone_title + '!' });
    }
    else if (cmd === 'stuck') {
        const issue = opts.getString('issue') || 'I am stuck';
        let response = 'Try: 1) Break it into smallest step 2) Ask for help 3) Adjust your plan - it is okay!';
        if (CONFIG.GEMINI_API_KEY) {
            try {
                const r = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=' + CONFIG.GEMINI_API_KEY, { contents: [{ parts: [{ text: 'Help this person on their career journey who is stuck: "' + issue + '". Give 2-3 actionable steps. Keep it brief and encouraging.' }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 300 } });
                if (r.data && r.data.candidates && r.data.candidates[0] && r.data.candidates[0].content && r.data.candidates[0].content.parts && r.data.candidates[0].content.parts[0]) {
                    response = r.data.candidates[0].content.parts[0].text;
                }
            } catch (e) { console.log('Gemini error:', e.message); }
        }
        await i.reply({ embeds: [new EmbedBuilder().setTitle('I am here to help').setDescription(response).setColor(0x2d6a4f)] });
    }
    else if (cmd === 'settings') {
        const tz = opts.getString('timezone');
        if (tz) dbh.run('UPDATE users SET timezone = ? WHERE discord_id = ?', [tz, uid]);
        await i.reply({ content: tz ? 'Settings updated!' : 'Use /settings timezone:America/New_York' });
    }
    else if (cmd === 'streak') {
        const s = dbh.get('SELECT streak_count, longest_streak FROM users WHERE discord_id = ?', [uid]);
        await i.reply({ embeds: [new EmbedBuilder().setTitle('Streak').setDescription('Current: ' + (s && s.streak_count ? s.streak_count : 0) + ' days\nBest: ' + (s && s.longest_streak ? s.longest_streak : 0) + ' days').setColor(0xe85d26)] });
    }
    else if (cmd === 'digest') {
        await generateDailyDigest(uid);
        await i.reply({ content: 'Digest sent!' });
    }
});

app.listen(CONFIG.PORT, () => console.log('Server on port', CONFIG.PORT));

client.on('error', (err) => console.error('Discord client error:', err));
client.on('warn', (msg) => console.warn('Discord client warning:', msg));

if (CONFIG.DISCORD_BOT_TOKEN) {
    initDatabase().then(() => {
        console.log('Logging into Discord...');
        client.login(CONFIG.DISCORD_BOT_TOKEN).catch(err => {
            console.error('FATAL: Failed to login to Discord:', err.message);
        });
    });
} else {
    initDatabase();
    console.log('No bot token - webhook server only');
}
