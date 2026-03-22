# FirstPath + PulseBot

**Find your path. PulseBot walks it with you.**

A two-part system for career discovery and 90-day accountability, built for the Antigravity hackathon (Track 3 — Economic Empowerment & Education).

---

## 🎯 The Vision

For the 185 million first-generation, low-income students who have no guidance counselor, no mentor, and no one to ask — now they have both:

- **FirstPath** finds their path through a scrollable, story-driven journey
- **PulseBot** walks that path with them — every day, in Discord, for 90 days

---

## 🏗️ Project Structure

```
hackasu/
├── firstpath/
│   └── index.html          # Complete FirstPath web app
├── pulsebot/
│   ├── index.js           # Discord bot + Express webhook server
│   ├── package.json       # Dependencies
│   └── .env.example      # Environment configuration template
└── README.md
```

---

## 🚀 Quick Start

### Part 1: FirstPath (Frontend)

Simply open `firstpath/index.html` in a browser.

**Features:**
- 🌅 3 branch paths (Standard / Disability-Aware / First-Generation)
- 📖 5 story chapters with scroll-triggered animations
- 🤖 AI-generated personalized career roadmap via Gemini
- 📢 "Send to Discord" integration
- 📥 Downloadable PNG poster

### Part 2: PulseBot (Backend)

```bash
cd pulsebot
npm install
cp .env.example .env
# Edit .env with your Discord bot token and Gemini API key
npm start
```

**Features:**
- 🤖 Discord.js bot with slash commands
- 🌐 Express webhook receiver for FirstPath imports
- 🗄️ SQLite database for users, tasks, streaks
- ⏰ Scheduled alerts and daily digests
- 💬 Interactive buttons (Done / Snooze / Stuck)
- 🧠 Gemini-powered coaching sessions

---

## 📋 Slash Commands

| Command | Description |
|---------|-------------|
| `/roadmap` | View your 90-day career roadmap |
| `/tasks` | Show all pending tasks |
| `/done [task]` | Mark a task complete |
| `/stuck [issue]` | Get AI coaching when blocked |
| `/settings` | Configure timezone & wake time |
| `/streak` | View current streak stats |
| `/buddy @user` | Link an accountability partner |
| `/digest` | Get daily summary now |

---

## 🔗 Connecting FirstPath → PulseBot

When the user clicks **"Send my plan to Discord"** in FirstPath:

1. Frontend sends roadmap JSON to `http://localhost:3000/firstpath-import`
2. PulseBot creates user in database
3. Imports all 12 weekly milestones as tasks
4. Schedules alerts for each deadline
5. DMs the user: "Your FirstPath plan just arrived!"

---

## 🎬 Demo Sequence

For the hackathon demo:

1. **Open FirstPath** in browser (simulate a 16-year-old first-gen student)
2. Select **"First-Generation"** branch
3. Scroll through and answer all 5 questions
4. Watch AI generate personalized roadmap
5. Click **"Send to Discord"** → Enter Discord User ID
6. **Switch to Discord** — show the DM from PulseBot with roadmap
7. Show `/roadmap` command displaying full 90-day plan
8. Click **"I'm Stuck"** button → show Gemini coaching session
9. Click **"Done"** → show streak increment

---

## 🔧 Configuration

### Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application → Bot
3. Enable **Server Members Intent** and **Message Content Intent**
4. Copy bot token to `.env`

### Gemini API Setup

1. Get API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add to `.env` (optional — bot works without it, just uses fallback responses)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML, CSS (Syne + DM Sans fonts), Vanilla JS |
| AI | Gemini 2.0 Flash |
| Backend | Node.js, Express.js |
| Bot | Discord.js v14 |
| Database | SQLite (better-sqlite3) |
| Scheduler | node-cron |

---

## 📄 License

MIT — Built for good.

---

## 🙏 Acknowledgments

Built for first-generation students everywhere who are figuring it out without a map.
