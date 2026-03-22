require('dotenv').config();
const fs = require('fs');
const path = require('path');

const CALL_LOGS_FILE = path.join(__dirname, 'data/call_logs.json');
if (!fs.existsSync(path.dirname(CALL_LOGS_FILE))) {
  fs.mkdirSync(path.dirname(CALL_LOGS_FILE), { recursive: true });
}
if (!fs.existsSync(CALL_LOGS_FILE)) {
  fs.writeFileSync(CALL_LOGS_FILE, JSON.stringify([]));
}

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

const journeyRoutes = require('./routes/discord');
app.use('/journey', journeyRoutes);

require('./bot/scheduler');

app.post('/bland/callback', async (req, res) => {
  try {
    const { transcript, summary, metadata } = req.body;
    const { career, day, discord_user_id } = metadata || {};

    console.log('Bland callback received:', { career, day, summary });

    const logs = JSON.parse(fs.readFileSync(CALL_LOGS_FILE, 'utf8'));
    logs.push({
      career,
      day,
      discord_user_id,
      summary,
      transcript: transcript?.slice(0, 800),
      received_at: new Date().toISOString(),
    });
    fs.writeFileSync(CALL_LOGS_FILE, JSON.stringify(logs, null, 2));

    if (discord_user_id) {
      const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
      const client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
      });

      await client.login(process.env.DISCORD_BOT_TOKEN);
      await new Promise((resolve) => client.once('ready', resolve));

      const guild = await client.guilds.fetch(process.env.GUILD_ID);
      const member = await guild.members.fetch(discord_user_id);
      const dm = await member.createDM();

      const embed = new EmbedBuilder()
        .setTitle(`📞 Call Recap — Day ${day}: ${career}`)
        .setColor(0xf5c842)
        .addFields(
          { name: 'Summary', value: String(summary || 'No summary available').slice(0, 1024) },
          { name: 'Transcript preview', value: String(transcript?.slice(0, 800) || 'No transcript').slice(0, 1024) }
        )
        .setTimestamp();

      await dm.send({ embeds: [embed] });
      await client.destroy();
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Bland callback error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Phase 7 — manual test (remove or protect in production)
app.get('/test-call', async (req, res) => {
  const { generateCallScript } = require('./utils/callScriptGenerator');
  const { placeCall } = require('./utils/blandCaller');
  try {
    const phone =
      (typeof req.query.phone === 'string' && req.query.phone.trim()) ||
      process.env.TEST_PHONE ||
      '+1YOURPHONENUMBER';
    const script = await generateCallScript('software engineer', 1, 'standard');
    const result = await placeCall(phone, script, 'software engineer', 1);
    res.json({ success: true, call: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`FirstPath backend running on port ${PORT}`);
});
