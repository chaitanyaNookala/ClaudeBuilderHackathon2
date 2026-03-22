const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function callKimi(prompt) {
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
      max_tokens: 3000
    })
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${errText.slice(0, 200)}`);
  }
  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error('Empty model response');
  const match = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) throw new Error('No JSON in response');
  return JSON.parse(match[0]);
}

export async function generateQuestions(profileData, branch) {
  const prompt = `You are FirstPath, a career discovery AI.

User profile:
- Occupation: ${profileData.occupation}
- Age: ${profileData.age}
- Financial situation: ${profileData.financial}
- Hobbies/interests: ${profileData.hobbies.join(', ')}
- Dream career they mentioned: "${profileData.dreamCareer}"
- Path type: ${branch}

Generate exactly 5 story-driven career discovery questions tailored 
specifically to THIS person. Each question should:
- Reference their actual life (their hobbies, age, situation)
- Be a moment in a story (second person, "You are...")
- Reveal values/personality, NOT ask about job titles directly
- Have exactly 4 answer options that are feeling/value based

Return ONLY this JSON array, no markdown:
[
  {
    "num": "01",
    "scene": "Scene title (2-4 words, evocative)",
    "story": "2-3 sentence atmospheric setup referencing their life",
    "question": "One focused question",
    "options": ["option 1", "option 2", "option 3", "option 4"]
  },
  ... 5 total
]`;

  return await callKimi(prompt);
}

export async function generateRoadmap(answers, branch, profileData) {
  const answersText = Object.entries(answers)
    .map(([q, a]) => `Q: ${q}\nA: ${a}`)
    .join('\n\n');

  const prompt = `You are FirstPath career AI.

User profile:
- Occupation: ${profileData.occupation}
- Age: ${profileData.age}  
- Financial situation: ${profileData.financial}
- Hobbies: ${profileData.hobbies.join(', ')}
- Dream career: "${profileData.dreamCareer}"
- Path type: ${branch}

Their journey answers:
${answersText}

Generate a comprehensive career roadmap. Return ONLY this JSON, no markdown:
{
  "careers": [
    {
      "title": "Job Title",
      "description": "2-3 sentences on why it fits THIS person specifically",
      "match_score": 94,
      "salary_range": { "average": 85000, "maximum": 140000, "currency": "USD" },
      "success_rate": 78,
      "time_to_entry": "6-12 months",
      "education_required": "Bachelor's / Bootcamp / No degree",
      "remote_friendly": true
    }
  ],
  "actions": [
    "Specific free action with real program name and why it fits them"
  ],
  "seven_day_plan": [
    {"day": 1, "focus": "Day theme title", "task": "Specific free action", "milestone": "What this achieves"},
    {"day": 2, "focus": "Day theme title", "task": "Specific free action", "milestone": "What this achieves"},
    {"day": 3, "focus": "Day theme title", "task": "Specific free action", "milestone": "What this achieves"},
    {"day": 4, "focus": "Day theme title", "task": "Specific free action", "milestone": "What this achieves"},
    {"day": 5, "focus": "Day theme title", "task": "Specific free action", "milestone": "What this achieves"},
    {"day": 6, "focus": "Day theme title", "task": "Specific free action", "milestone": "What this achieves"},
    {"day": 7, "focus": "Day theme title", "task": "Specific free action", "milestone": "What this achieves"}
  ],
  "market_data": {
    "growth_rate": 15,
    "ai_impact": "low|medium|high",
    "ai_impact_detail": "One sentence on how AI affects this field",
    "demand_trend": [
      {"year": "2022", "demand": 70},
      {"year": "2023", "demand": 78},
      {"year": "2024", "demand": 85},
      {"year": "2025", "demand": 91},
      {"year": "2026", "demand": 95},
      {"year": "2027", "demand": 102}
    ],
    "top_companies": ["Company 1", "Company 2", "Company 3"],
    "key_skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"]
  },
  "encouragement": "One powerful sentence referencing something specific from their answers and profile"
}

Each day's task must be free, specific, and directly relevant to the user's 
financial situation (${profileData.financial}) and starting point (${profileData.occupation}). 
Day 7 should feel like a genuine milestone — something they can show or share.

Include exactly 8 careers, ordered by match_score descending.`;

  return await callKimi(prompt);
}
