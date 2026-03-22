const cron = require('node-cron');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const PLANS_FILE = path.join(__dirname, '../data/plans.json');

function getDayNumber(sentAt) {
  const start = new Date(sentAt);
  const now = new Date();
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
}

async function runDailyCheckins() {
  if (!fs.existsSync(PLANS_FILE)) return;

  const plans = JSON.parse(fs.readFileSync(PLANS_FILE, 'utf8'));
  if (!plans.length) return;

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
  });

  try {
    await client.login(process.env.DISCORD_BOT_TOKEN);
    await new Promise((resolve) => client.once('ready', resolve));

    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    let updated = false;

    for (const planEntry of plans) {
      if (planEntry.completed) continue;

      const currentDay = getDayNumber(planEntry.sent_at);
      if (currentDay < 1 || currentDay > 7) continue;

      const dayData = planEntry.plan.find(d => d.day === currentDay);
      if (!dayData) continue;

      try {
        const member = await guild.members.fetch(planEntry.discord_user_id);
        const dmChannel = await member.createDM();

        const embed = new EmbedBuilder()
          .setTitle(`Day ${currentDay} — ${dayData.focus} 🔥`)
          .setColor(0xf5c842)
          .addFields(
            { name: "Today's Task", value: dayData.task },
            { name: 'Milestone', value: dayData.milestone }
          )
          .setTimestamp();

        if (currentDay === 7) {
          embed.setDescription(
            "You've completed your FirstPath 7-Day Plan! Keep going 🚀\n\nCome back to FirstPath to explore your next path."
          );
          planEntry.completed = true;
          updated = true;
        }

        await dmChannel.send({ embeds: [embed] });

      } catch (userErr) {
        console.error(`Failed to DM user ${planEntry.discord_user_id}:`, userErr.message);
      }
    }

    if (updated) {
      fs.writeFileSync(PLANS_FILE, JSON.stringify(plans, null, 2));
    }

  } catch (err) {
    console.error('Scheduler error:', err);
  } finally {
    await client.destroy().catch(() => {});
  }
}

cron.schedule('0 9 * * *', runDailyCheckins);
console.log('FirstPath daily scheduler started — running at 9:00 AM daily');

module.exports = { runDailyCheckins };
