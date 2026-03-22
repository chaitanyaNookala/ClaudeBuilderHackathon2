const axios = require('axios');

const CAREER_HINTS = {
  'software engineer': 'Ask about debugging a tricky bug, working with a team on a deadline, and what it feels like to ship a feature.',
  'ux designer': 'Ask about presenting a design to skeptical stakeholders, balancing user needs vs business goals.',
  'teacher': 'Ask about a student who finally understood something difficult, and managing classroom energy.',
  'nurse': 'Ask about a high-pressure patient situation and how they stayed calm.',
  'journalist': 'Ask about chasing a story under a tight deadline and ethical decisions in reporting.',
};

const DEFAULT_HINT = 'Ask about a typical challenging day, what they love most, and what surprised them about this career.';

async function generateCallScript(career, dayNumber, branch) {
  const hint = CAREER_HINTS[career?.toLowerCase()] || DEFAULT_HINT;

  const prompt = `You are designing a phone call simulation for FirstPath, a career discovery app.

The user is on Day ${dayNumber} of trialing the career: "${career}".
Branch type: ${branch}

Create a realistic, friendly phone call script where an AI plays a ${career} calling to give the user a taste of this career's real daily life.

Hints for this career: ${hint}

Return ONLY this JSON, no markdown:
{
  "caller_persona": "Short description of who is calling (e.g. Senior Software Engineer at a startup)",
  "scenario": "One sentence describing what the call is about",
  "opening_line": "Exactly what the caller says when the user picks up (natural, warm, 1-2 sentences)",
  "follow_ups": [
    "Question or thing the caller says after user responds",
    "Another follow up that goes deeper into the career reality",
    "A closing reflection question"
  ],
  "closing_line": "How the caller wraps up the call (encouraging, 1-2 sentences)",
  "tone": "warm"
}`;

  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'moonshotai/kimi-k2',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const raw = response.data.choices[0].message.content;
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON in call script response');
  return JSON.parse(match[0]);
}

module.exports = { generateCallScript };
