const axios = require('axios');

async function placeCall(userPhone, script, careerName, dayNumber, discordUserId) {
  const taskPrompt = `You are ${script.caller_persona}.

Scenario: ${script.scenario}

Start the call with this opening: "${script.opening_line}"

Then naturally continue with these talking points:
${script.follow_ups.map((f, i) => `${i + 1}. ${f}`).join('\n')}

End the call with: "${script.closing_line}"

Keep the tone ${script.tone}. Sound like a real conversation, not a script reading.
Maximum call length: 2 minutes. Be warm and genuine.`;

  const response = await axios.post(
    'https://api.bland.ai/v1/calls',
    {
      phone_number: userPhone,
      task: taskPrompt,
      voice: 'maya',
      max_duration: 120,
      answered_by_enabled: true,
      webhook: `${process.env.BACKEND_URL}/bland/callback`,
      metadata: {
        career: careerName,
        day: dayNumber,
        ...(discordUserId != null && discordUserId !== '' ? { discord_user_id: discordUserId } : {}),
      },
    },
    {
      headers: {
        authorization: process.env.BLAND_API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );

  console.log(`Call placed — ${careerName} Day ${dayNumber}:`, response.data);
  return response.data;
}

module.exports = { placeCall };
