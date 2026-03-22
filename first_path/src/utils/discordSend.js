const apiBase = (process.env.REACT_APP_BACKEND_URL || '').replace(/\/$/, '');

export async function sendToDiscord(discordUserId, sevenDayPlan) {
  const url = apiBase ? `${apiBase}/journey/discord-send` : '/journey/discord-send';
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      discord_user_id: discordUserId,
      plan: sevenDayPlan,
      sent_at: new Date().toISOString(),
    }),
  });
  if (!response.ok) throw new Error('Discord send failed');
  return response.json();
}
