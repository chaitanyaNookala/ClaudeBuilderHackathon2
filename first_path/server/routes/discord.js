const express = require('express');
const router = express.Router();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const PLANS_FILE = path.join(__dirname, '../data/plans.json');

if (!fs.existsSync(path.dirname(PLANS_FILE))) {
  fs.mkdirSync(path.dirname(PLANS_FILE), { recursive: true });
}
if (!fs.existsSync(PLANS_FILE)) {
  fs.writeFileSync(PLANS_FILE, JSON.stringify([]));
}

router.post('/discord-send', async (req, res) => {
  const { discord_user_id, plan, sent_at, phone, career, branch } = req.body;

  if (!discord_user_id || !plan) {
    return res.status(400).json({ error: 'Missing discord_user_id or plan' });
  }

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
  });

  try {
    await client.login(process.env.DISCORD_BOT_TOKEN);
    await new Promise((resolve) => client.once('ready', resolve));

    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const member = await guild.members.fetch(discord_user_id);
    const dmChannel = await member.createDM();

    const embed = new EmbedBuilder()
      .setTitle('Your FirstPath 7-Day Roadmap 🔥')
      .setColor(0xf5c842)
      .setDescription("Your personalized career trial starts today. One action a day — that's all it takes.")
      .setTimestamp();

    plan.forEach((day) => {
      embed.addFields({
        name: `Day ${day.day} — ${day.focus}`,
        value: day.task,
        inline: false
      });
    });

    await dmChannel.send({ embeds: [embed] });

    const plans = JSON.parse(fs.readFileSync(PLANS_FILE, 'utf8'));
    plans.push({
      discord_user_id,
      plan,
      sent_at,
      completed: false,
      phone: phone || null,
      career: career || null,
      branch: branch || null,
    });
    fs.writeFileSync(PLANS_FILE, JSON.stringify(plans, null, 2));

    await client.destroy();
    return res.json({ success: true });

  } catch (err) {
    console.error('Discord send error:', err);
    await client.destroy().catch(() => {});
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
