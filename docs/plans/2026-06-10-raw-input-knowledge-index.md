# Raw Input — The Knowledge Index

**Date:** 2026-06-10
**What:** Complete news, research, and education infrastructure
**Goal:** Make Raw Input THE resource hub for Black AI & tech — from macro world events down to hyperlocal community impact

---

## 1. The Vision

Raw Input's index isn't just a category list. It's a **macro-to-micro intelligence pipeline** — the user sees the WHOLE landscape of tech news, research, policy, and opportunity, filtered through a cultural lens, with full control over what they see, how deep they go, and how it connects to their city, their career, and their wallet.

Think: Bloomberg Terminal meets The Root meets Craigslist meets a university library — but everything talks to each other and the user controls the zoom level.

---

## 2. The Knowledge Stack (Macro → Micro)

### Layer 1: GLOBAL (Macro View)
*What's happening in the world that affects this community*

| Feed | Sources | What It Covers |
|---|---|---|
| **AI & Tech Headlines** | Hacker News, TechCrunch RSS, The Verge, Ars Technica, Wired | Major releases, acquisitions, funding rounds, product launches |
| **Policy & Regulation** | Congress.gov API, EU AI Act tracker, FTC, NIST | AI bills, regulation, executive orders, compliance deadlines |
| **Scientific Papers** | ArXiv (cs.AI, cs.LG, cs.CL), Semantic Scholar API, PubMed | Peer-reviewed research, preprints, breakthrough findings |
| **White Papers** | NIST, IEEE, ACM, Stanford HAI, MIT CSAIL, Google DeepMind | Industry standards, best practices, safety frameworks |
| **Economic Indicators** | BLS API, FRED, World Bank, IMF | Employment data, inflation, GDP, gig economy stats |
| **Venture Capital** | Crunchbase RSS, PitchBook, Carta | Funding rounds, valuations, who's getting money |
| **Open Source** | GitHub trending, HuggingFace, Papers with Code | New models, tools, repos, community projects |
| **Supply Chain & Hardware** | Tom's Hardware, AnandTech, TSMC updates | Chip shortages, GPU availability, pricing, new hardware |

### Layer 2: COMMUNITY (Filtered View)
*Same news, but filtered for relevance to Black tech community*

| Feed | Filter Logic | What Surfaces |
|---|---|---|
| **Black-Founded Startups** | Crunchbase filtered by founder demographics + manual curation | Funding rounds, launches, acquisitions for Black-founded companies |
| **HBCU Tech** | Google News + RSS for HBCU + tech/AI/CS keywords | Programs, partnerships, research, graduates doing big things |
| **Representation Watch** | AI bias papers, hiring reports, diversity data | Who's in the room, who's not, what the numbers say |
| **Community Voices** | Twitter/X lists, Reddit, HillmanTok, Black tech podcasts | What the community is saying, trending discussions |
| **Diaspora Innovation** | African tech blogs (TechCabal, Disrupt Africa), Caribbean tech | Innovation from Accra, Lagos, Nairobi, Kingston, London |

### Layer 3: PERSONAL (Micro View)
*Filtered to YOUR city, YOUR career, YOUR interests*

| Feed | Personalization | What It Delivers |
|---|---|---|
| **City-Specific News** | User selects home city on profile | Tech news, meetups, jobs, startups in YOUR area |
| **Career Track** | User selects role (developer, designer, PM, founder, etc.) | Relevant jobs, tutorials, tools, salary data for YOUR path |
| **Interest Tags** | User selects topics (AI art, robotics, fintech, gaming, etc.) | Custom feed of only what matters to YOU |
| **Supply Chain Ripple** | AI traces how global events affect local markets | "TSMC chip shortage → GPU prices up → your AI startup costs up 30%" |
| **Salary & Cost Tracker** | BLS + Glassdoor + Indeed data by city | What jobs pay WHERE, cost of living comparison, real purchasing power |

---

## 3. The Index Page — User Interface

### Tab Structure

```
THE INDEX
├── [All]           — firehose, everything, chronological
├── [Breaking]      — real-time news, last 24 hours
├── [Deep Dives]    — long-form, research, investigations
├── [Papers]        — scientific papers, white papers, broken down
├── [Learn]         — courses, tutorials, certifications, resources
├── [Jobs]          — full job board with filters
├── [Money]         — The Bag — making money section
├── [Your City]     — personalized to user's selected city
└── [Saved]         — user's bookmarked articles and resources
```

### Filter Controls

The user has MACRO control over WHAT they see:

```
┌──────────────────────────────────────────────────────────┐
│  FILTER BAR                                              │
│                                                          │
│  Topics: [AI ✓] [Robotics] [Fintech ✓] [Gaming] [...]  │
│  Depth:  [Headlines] [Articles ✓] [Deep Dives] [Papers] │
│  Source: [All ✓] [Community] [Academic] [Industry]       │
│  City:   [ATL ✓] [NYC] [LA] [DMV] [All Cities]         │
│  Time:   [Today] [This Week ✓] [This Month] [All Time]  │
│  Voice:  [All ✓] [Maya] [Dex] [OG-PT]                  │
│                                                          │
│  [Reset Filters]                        [Save as Default]│
└──────────────────────────────────────────────────────────┘
```

### Card Formats

Different content types get different visual treatment:

| Content Type | Card Style |
|---|---|
| Breaking news | Red accent, timestamp, compact |
| Article | Standard card, headline + summary + agent byline |
| Deep dive | Large card, cover image, reading time, BLACKBOX tag |
| Scientific paper | Mono font, citation count, "Paper Breakdown" tag |
| Tutorial | Step indicator, difficulty badge, tools listed |
| Job listing | Salary range, remote badge, company logo |
| Money story | Dollar amount highlighted, revenue/earnings callout |
| Event | Date/city badge, RSVP button |

---

## 4. The Learn Tab — Education Hub

### Free Education Sources (Autonomous Ingestion)

| Source | Type | Cost |
|---|---|---|
| **HillmanTok University** | 400+ virtual courses from Black educators, Netflix partnership | Free |
| **MIT OpenCourseWare** | Full university courses with materials | Free |
| **DeepLearning.AI** | 50+ short courses on AI, LLMs, RAG, agents | Free |
| **Google ML Crash Course** | Machine learning fundamentals → production | Free |
| **fast.ai** | Practical deep learning for coders | Free |
| **Coursera (audit mode)** | Stanford, Google, IBM courses (audit free, cert paid) | Free to audit |
| **Khan Academy** | Math, CS foundations, AP Computer Science | Free |
| **freeCodeCamp** | Full stack development, Python, data science | Free |
| **The Odin Project** | Full stack web development curriculum | Free |
| **Harvard CS50** | Intro to CS — the most famous free CS course | Free |
| **Microsoft AI Curriculum** | 24-lesson open-source AI course on GitHub | Free |
| **University of Helsinki Elements of AI** | AI concepts, no code required | Free |
| **Kaggle Learn** | Hands-on ML, data science, Python notebooks | Free |
| **Papers With Code** | Research papers with reproducible code | Free |
| **HuggingFace Courses** | NLP, transformers, diffusion models | Free |

### How the Learn Tab Organizes This

```
LEARN
├── [By Skill Level]
│   ├── Absolute Beginner — "I've never coded"
│   ├── Getting Started — "I know basics, what's next?"
│   ├── Intermediate — "I can code, teach me AI"
│   ├── Advanced — "Show me the papers"
│   └── Expert — "I want to contribute to research"
│
├── [By Topic]
│   ├── Programming Fundamentals
│   ├── Web Development
│   ├── Data Science
│   ├── Machine Learning
│   ├── Deep Learning & Neural Networks
│   ├── Natural Language Processing
│   ├── Computer Vision
│   ├── Generative AI & LLMs
│   ├── Prompt Engineering
│   ├── AI Ethics & Bias
│   ├── Robotics
│   ├── Blockchain & Web3
│   ├── Cybersecurity
│   ├── Cloud & DevOps
│   ├── Mobile Development
│   ├── Game Development
│   └── UI/UX Design
│
├── [By Format]
│   ├── Video Courses
│   ├── Interactive (notebooks, labs)
│   ├── Reading (textbooks, docs)
│   ├── Projects (build something)
│   └── Certifications (earn a credential)
│
├── [By Source]
│   ├── HillmanTok University
│   ├── MIT / Stanford / Harvard
│   ├── Google / Microsoft / Meta
│   ├── DeepLearning.AI / fast.ai
│   ├── Community-created
│   └── Raw Input originals
│
└── [Career Paths]
    ├── "I want to become an AI Engineer"
    ├── "I want to become a Data Scientist"
    ├── "I want to build AI products"
    ├── "I want to create AI art"
    ├── "I want to start an AI business"
    └── "I just want to understand AI"
```

### Learning Path Builder (Gamified)

Users can select a career goal and get a curated learning path:

```
CAREER GOAL: "AI Engineer"
├── Step 1: Python Fundamentals (freeCodeCamp) — 20hrs — [Start]
├── Step 2: Math for ML (Khan Academy) — 15hrs
├── Step 3: ML Crash Course (Google) — 15hrs
├── Step 4: Deep Learning Specialization (DeepLearning.AI) — 40hrs
├── Step 5: NLP with Transformers (HuggingFace) — 10hrs
├── Step 6: Build a Project (Raw Input guided) — 20hrs
├── Step 7: Portfolio Review (community feedback) — 5hrs
└── Step 8: Interview Prep (Raw Input resources) — 10hrs

Progress: ████████░░░░░░░░ 47% | Estimated: 3 months
XP Earned: 450 | Badge: "Model in Training"
```

Completing steps earns XP and badges. Finishing a full path earns a "Certified by Raw Input" badge on their profile.

---

## 5. The Papers Tab — Research Broken Down

### The Problem

Scientific papers are dense, jargon-heavy, and inaccessible. The community that's MOST affected by AI research (bias, surveillance, labor displacement) is LEAST likely to read the papers.

### The Solution

Every paper gets a "Raw Input Breakdown" — an AI-generated summary in the brand voice, with:

```
PAPER BREAKDOWN
┌─────────────────────────────────────────────────────┐
│ 📄 "Bias Amplification in Large Language Models"    │
│    ArXiv 2406.12345 | Stanford HAI | June 2026      │
│                                                      │
│ WHAT THEY FOUND (2 sentences):                       │
│ LLMs amplify existing biases by 3-4x compared to    │
│ their training data. The effect is worse for race    │
│ and gender intersections.                            │
│                                                      │
│ WHY YOU SHOULD CARE (Maya):                          │
│ "This paper basically proved what we've been saying  │
│ — the AI isn't just reflecting bias, it's making it  │
│ LOUDER. And the people building these models didn't  │
│ notice because they weren't the ones being affected. │
│ Shocker."                                            │
│                                                      │
│ THE NUMBERS:                                         │
│ • 3.7x amplification for racial stereotypes          │
│ • 4.1x for gender + race intersections               │
│ • Tested across GPT-4, Claude, Gemini, Llama         │
│                                                      │
│ WHAT HAPPENS NEXT:                                   │
│ "If you're building with any of these models, this   │
│ paper is required reading. If you're being AFFECTED   │
│ by these models, this paper is ammunition." — OG-PT  │
│                                                      │
│ [Read Full Paper] [Share] [Save] [Discuss]           │
│                                                      │
│ Tags: #AIBias #LLM #Research #Representation         │
│ Related: 3 more papers on this topic                 │
└─────────────────────────────────────────────────────┘
```

### Paper Sources (Automated via Loop 1)

| Source | Focus | Ingestion |
|---|---|---|
| ArXiv cs.AI, cs.LG, cs.CL, cs.CV | AI/ML research | RSS, daily |
| ArXiv cs.CY (Computers & Society) | AI ethics, social impact | RSS, daily |
| Semantic Scholar API | Citation tracking, related papers | API, weekly |
| NIST AI publications | Standards, frameworks, guidelines | RSS, monthly |
| IEEE Xplore | Engineering research | RSS, weekly |
| ACM Digital Library | CS research | RSS, weekly |
| Google Scholar alerts | Keyword-triggered papers | Email → parse, daily |
| Stanford HAI blog | AI policy research | RSS, weekly |
| MIT CSAIL | Computer science research | RSS, weekly |
| DAIR Institute (Timnit Gebru) | AI ethics, community impact | RSS, weekly |
| Algorithmic Justice League | Bias research | RSS, monthly |

### Paper Processing Loop (Loop 10: THE LIBRARIAN)

```
New paper detected (ArXiv RSS, etc.)
  → LLM relevance scoring (1-10 for Black tech community)
  → Score >= 6? Continue. Score < 6? Skip.
  → LLM generates:
    - 2-sentence summary
    - "Why you should care" in Maya voice
    - Key numbers/findings extracted
    - "What happens next" in OG-PT voice
    - Auto-tags (topic, impact area, urgency)
  → Stored in Airtable `papers` table
  → Published to Papers tab
  → High-impact papers (score >= 8) → newsletter inclusion
```

---

## 6. Supply Chain & Ripple Effect Tracker

### What It Is

When something happens at the MACRO level (chip shortage, funding freeze, regulation change), Raw Input automatically traces the RIPPLE EFFECT down to the community level.

### Example Ripple Chain

```
MACRO EVENT: "TSMC delays 2nm chip production by 6 months"
    │
    ├── INDUSTRY IMPACT: "NVIDIA H200 GPUs delayed → cloud GPU prices up 15%"
    │
    ├── STARTUP IMPACT: "AI startups' compute costs jump → smaller companies squeezed"
    │
    ├── CREATOR IMPACT: "RunPod/Lambda prices increase → indie AI artists pay more"
    │
    ├── JOB IMPACT: "Chip companies hiring → semiconductor jobs in Phoenix, Austin up 20%"
    │
    ├── LOCAL IMPACT (ATL): "No direct chip fab, but AWS Atlanta pricing affected"
    │
    └── YOUR WALLET: "If you're training models, budget 15% more for compute this quarter"
```

### How It Works

```
Macro news event detected (via Sourcer loop)
  → LLM classifies: is this a supply chain / systemic event?
  → If yes → LLM generates ripple chain:
    1. Industry impact
    2. Startup/small business impact
    3. Creator/individual impact
    4. Job market impact
    5. City-specific impact (for each active city)
    6. Personal wallet impact
  → Published as "Ripple Report" on The Wire
  → Tagged for relevant City Mode sections
  → High-impact → Telegram alert + newsletter
```

---

## 7. Complete Autonomous Loop Map (Updated)

```
PM2 Process Map (Raw Input):
├── rawinput-sourcer      (4h)     — 30+ sources across all layers
├── rawinput-curator      (30m)    — AI tags, rewrites, scores
├── rawinput-comedy       (daily)  — jokes, roasts, memes
├── rawinput-recruiter    (6h)     — job aggregation + enrichment
├── rawinput-citydesk     (8h)     — local news filtering
├── rawinput-publisher    (2h)     — pushes to R2/site
├── rawinput-mailroom     (weekly) — newsletter compilation
├── rawinput-bouncer      (15m)    — submission moderation
├── rawinput-promoter     (3-5x/d) — social posting
├── rawinput-librarian    (daily)  — paper ingestion + breakdown   ← NEW
├── rawinput-educator     (weekly) — course/resource aggregation   ← NEW
└── rawinput-ripple       (on-event) — supply chain ripple tracer  ← NEW

Total: 12 loops | ~600MB RAM | $0/month
```

---

## 8. Updated Index Tab Structure

```
THE INDEX (accessible via "Index" tab in nav)
│
├── 📰 ALL            — everything, chronological, filterable
├── 🔴 BREAKING       — real-time, last 24 hours
├── 📊 DEEP DIVES     — BLACKBOX investigations, long-form
├── 📄 PAPERS         — scientific papers, broken down in brand voice
├── 📚 LEARN          — courses, tutorials, certifications, career paths
├── 💼 JOBS           — full board, filters, salary, remote, city
├── 💰 THE BAG        — making money, gig apps, side hustles, audits
├── 🏙️ YOUR CITY      — personalized local tech scene
├── ⛓️ SUPPLY CHAIN   — ripple reports, hardware, infrastructure
├── 🗳️ POLICY         — regulation, bills, government AI activity
├── 🎨 GALLERY        — AI art, creator showcases, visual work
├── 🎭 WHO COOKED?    — social experiment episodes
├── 🎤 THE PANEL      — character persona commentary
├── 🏈 SCOREBOARD     — sports tech only
├── 📈 THE TICKER     — Polymarket roasts, market commentary
├── ☕ BREAK ROOM     — jokes, memes, daily humor
├── 🔧 PLUG & PLAY    — marketplace, templates, domains, SaaS
├── 🔓 ROOT ACCESS    — career resources, interview prep, mentorship
├── 🔄 THE REBOOT     — career change stories, pivot guides
└── 🔖 SAVED          — user's bookmarked content
```

---

## 9. Key Sources Reference

### HillmanTok University
- [400+ free virtual courses from Black educators](https://wschronicle.com/class-is-in-session-hillmantok-black-educators-create-free-online-university/)
- Netflix partnership: "From the Syllabus of HillmanTok" streaming category
- Founded by Dr. Leah Barlow (NC A&T) — went viral on TikTok
- Named after Hillman College from "A Different World"
- Departments: business, computer technology, education, English, film, history
- **Integration:** Ingest HillmanTok course catalog into Learn tab, link to video content, feature educators in Who Trained You?

### DAIR Institute (Timnit Gebru)
- Founded after leaving Google's AI ethics team
- Leading research on AI bias, data documentation, community impact
- **Integration:** Auto-ingest publications into Papers tab, feature in Who Trained You?

### Algorithmic Justice League (Joy Buolamwini)
- Research on facial recognition bias
- Policy advocacy for AI accountability
- **Integration:** Research → Papers tab, policy work → Policy tab

### Other Key Sources
- [MIT OpenCourseWare](https://ocw.mit.edu/) — 2,500+ free courses
- [DeepLearning.AI](https://www.deeplearning.ai/courses) — 50+ free AI short courses
- [fast.ai](https://www.fast.ai/) — Practical deep learning, free
- [Google ML Crash Course](https://developers.google.com/machine-learning/crash-course) — Free ML fundamentals
- [freeCodeCamp](https://www.freecodecamp.org/) — Full stack, free
- [Microsoft AI Curriculum](https://github.com/microsoft/AI-For-Beginners) — 24-lesson open source on GitHub
- [Papers With Code](https://paperswithcode.com/) — Research + reproducible code

---

## 10. Implementation Priority

### Phase 1: Index Page (This Sprint)
- Build the index page with tab structure
- Implement filter bar with topic/depth/source/city/time controls
- Create card components for each content type
- Wire to static sample data for launch

### Phase 2: Learn Tab (Week 2)
- Aggregate course catalog from 15+ free sources
- Build learning path builder with XP integration
- Create "Paper Breakdown" template and AI prompt
- HillmanTok integration

### Phase 3: Supply Chain + Papers (Week 3)
- Build Librarian loop (paper ingestion)
- Build Ripple tracer (supply chain analysis)
- Create Educator loop (course aggregation)
- Wire to ArXiv, Semantic Scholar, NIST APIs

### Phase 4: Personalization (Month 2)
- User profiles with city, career track, interests
- Personalized feed algorithms
- Saved/bookmarked content
- Learning path progress tracking

---

*This document makes Raw Input THE complete resource for Black AI & tech.*
*Companion to: platform-design.md, brand-voice-bible.md, services-expansion.md*
