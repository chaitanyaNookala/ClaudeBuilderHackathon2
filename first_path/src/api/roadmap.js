import axios from 'axios';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL + '/api';

export const generateRoadmap = async (answers, branch, token) => {
  try {
    const res = await axios.post(
      `${BACKEND_URL}/journey/generate`,
      { answers, branch },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
        timeout: 30000
      }
    );
    return res.data;
  } catch (backendErr) {
    console.warn('Backend unavailable, calling AI directly');
  }

  const branchLabels = {
    standard: 'Standard Career Path',
    disability: 'Disability-Aware Career Path',
    firstgen: 'First-Generation Career Path'
  };

  const answersText = Object.entries(answers)
    .map(([q, a]) => `- ${q}: ${a}`)
    .join('\n');

  const prompt = `You are FirstPath, a career counselor for the ${branchLabels[branch]}.
Based on these answers:
${answersText}

Return ONLY valid JSON (no markdown, no backticks):
{
  "careers": [
    {"title": "Career Title", "description": "2-3 sentence description", "match_score": 92},
    {"title": "Career Title", "description": "2-3 sentence description", "match_score": 85},
    {"title": "Career Title", "description": "2-3 sentence description", "match_score": 78}
  ],
  "actions": [
    "Specific free action step 1 with real program name",
    "Specific free action step 2 with real program name",
    "Specific free action step 3",
    "Specific free action step 4",
    "Specific free action step 5"
  ],
  "ninety_day_plan": {
    "month1": "Month 1 focus and specific actions",
    "month2": "Month 2 focus and specific actions",
    "month3": "Month 3 milestone and what you can say you achieved"
  },
  "encouragement": "One powerful sentence referencing something specific from their answers"
}`;

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.REACT_APP_KIMI_API_KEY}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'FirstPath'
    },
    body: JSON.stringify({
      model: 'moonshotai/kimi-k2',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000
    })
  });

  const data = await response.json();
  const raw = data.choices[0].message.content;
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) return JSON.parse(match[0]);
  throw new Error('Invalid AI response');
};

export const saveJourney = async (branch, answers, result, token) => {
  try {
    const res = await axios.post(
      `${BACKEND_URL}/journey/save`,
      { branch, answers, result },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true
      }
    );
    return res.data;
  } catch (err) {
    console.warn('Save failed:', err);
    return { saved: false };
  }
};

export const getJourneyHistory = async (token) => {
  const res = await axios.get(`${BACKEND_URL}/journey/history`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    withCredentials: true
  });
  return res.data;
};
