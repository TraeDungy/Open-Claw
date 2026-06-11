"use client";
import { useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";

const TABS = [
  { id: "all", label: "All" },
  { id: "trending", label: "Trending AI" },
  { id: "free-alt", label: "Free Alternatives" },
  { id: "creators", label: "Creators of Color" },
  { id: "learning", label: "Learning" },
  { id: "staples", label: "Dev Staples" },
  { id: "honorable", label: "Honorable Mentions" },
  { id: "orgs", label: "Orgs & Communities" },
];

interface Repo {
  tab: string;
  name: string;
  desc: string;
  stars?: string;
  tag: string;
  url: string;
  creator?: string;
  replaces?: string;
}

const REPOS: Repo[] = [
  // ── TRENDING AI ──
  { tab: "trending", name: "ollama/ollama", desc: "Run any LLM locally with one command. Llama 3, DeepSeek, Mistral, Gemma, Qwen. The Docker of AI.", stars: "165K", tag: "local-ai", url: "https://github.com/ollama/ollama" },
  { tab: "trending", name: "open-webui/open-webui", desc: "Beautiful ChatGPT-like interface for local models. Connects to Ollama. Self-hosted.", stars: "60K+", tag: "chat-ui", url: "https://github.com/open-webui/open-webui" },
  { tab: "trending", name: "comfyanonymous/ComfyUI", desc: "Node-based AI image generation. Flux, SDXL, ControlNet. Full pipeline control.", stars: "106K", tag: "image-gen", url: "https://github.com/comfyanonymous/ComfyUI" },
  { tab: "trending", name: "langgenius/dify", desc: "Production agentic workflows. Visual builder, RAG pipeline, multi-model support.", stars: "90K+", tag: "agents", url: "https://github.com/langgenius/dify" },
  { tab: "trending", name: "n8n-io/n8n", desc: "Open source Zapier. 400+ integrations, native AI nodes, self-hosted.", stars: "85K+", tag: "automation", url: "https://github.com/n8n-io/n8n" },
  { tab: "trending", name: "microsoft/autogen", desc: "Multi-agent framework. Agents write code, review it, test it — autonomously.", stars: "45K+", tag: "agents", url: "https://github.com/microsoft/autogen" },
  { tab: "trending", name: "huggingface/transformers", desc: "THE library. NLP, vision, audio, multimodal. Thousands of pretrained models.", stars: "145K+", tag: "ml-framework", url: "https://github.com/huggingface/transformers" },
  { tab: "trending", name: "ggerganov/llama.cpp", desc: "Run LLMs on CPU. No GPU needed. C++ inference engine. Powers Ollama under the hood.", stars: "78K+", tag: "inference", url: "https://github.com/ggerganov/llama.cpp" },
  { tab: "trending", name: "AUTOMATIC1111/stable-diffusion-webui", desc: "OG image generation UI. Stable Diffusion with extensions ecosystem.", stars: "148K+", tag: "image-gen", url: "https://github.com/AUTOMATIC1111/stable-diffusion-webui" },
  { tab: "trending", name: "langchain-ai/langchain", desc: "Framework for building LLM applications. Chains, agents, retrieval, memory.", stars: "100K+", tag: "llm-framework", url: "https://github.com/langchain-ai/langchain" },
  { tab: "trending", name: "anthropics/courses", desc: "Free courses from Anthropic on prompt engineering, tool use, and AI safety.", stars: "10K+", tag: "education", url: "https://github.com/anthropics/courses" },
  { tab: "trending", name: "deepseek-ai/DeepSeek-V3", desc: "Open source model rivaling GPT-4. Free weights, competitive benchmarks.", stars: "30K+", tag: "model", url: "https://github.com/deepseek-ai/DeepSeek-V3" },
  { tab: "trending", name: "browser-use/browser-use", desc: "AI agents that control web browsers. Automate anything with natural language.", stars: "25K+", tag: "agents", url: "https://github.com/browser-use/browser-use" },
  { tab: "trending", name: "crewAI-inc/crewAI", desc: "Multi-agent orchestration. Agents with roles, goals, and backstories.", stars: "28K+", tag: "agents", url: "https://github.com/crewAI-inc/crewAI" },
  { tab: "trending", name: "Significant-Gravitas/AutoGPT", desc: "The original autonomous AI agent. Task decomposition, web browsing, code execution.", stars: "172K+", tag: "agents", url: "https://github.com/Significant-Gravitas/AutoGPT" },
  { tab: "trending", name: "RentAHuman", desc: "The reverse gig economy. AI agents hire humans for physical-world tasks they can't do themselves. Wild concept, actually works.", tag: "agents", url: "https://rentahuman.io" },

  // ── FREE ALTERNATIVES ──
  { tab: "free-alt", name: "open-webui/open-webui", desc: "Self-hosted ChatGPT alternative. Beautiful UI, local models, no subscription.", stars: "60K+", tag: "chat", url: "https://github.com/open-webui/open-webui", replaces: "ChatGPT Plus ($20/mo)" },
  { tab: "free-alt", name: "comfyanonymous/ComfyUI", desc: "Free image generation. Run Flux/SDXL locally or on free GPU.", stars: "106K", tag: "design", url: "https://github.com/comfyanonymous/ComfyUI", replaces: "Midjourney ($30/mo)" },
  { tab: "free-alt", name: "penpot/penpot", desc: "Open source design tool. Figma alternative. Collaborative, self-hosted.", stars: "35K+", tag: "design", url: "https://github.com/penpot/penpot", replaces: "Figma Pro ($15/mo)" },
  { tab: "free-alt", name: "n8n-io/n8n", desc: "Workflow automation with 400+ integrations. Self-hosted, fair-code.", stars: "85K+", tag: "automation", url: "https://github.com/n8n-io/n8n", replaces: "Zapier ($20-70/mo)" },
  { tab: "free-alt", name: "logseq/logseq", desc: "Knowledge management. Markdown, bidirectional links, local-first.", stars: "35K+", tag: "productivity", url: "https://github.com/logseq/logseq", replaces: "Notion ($10/mo)" },
  { tab: "free-alt", name: "RocketChat/Rocket.Chat", desc: "Team chat with channels, DMs, video calls, bots. Self-hosted Slack.", stars: "42K+", tag: "communication", url: "https://github.com/RocketChat/Rocket.Chat", replaces: "Slack Pro ($8/mo/user)" },
  { tab: "free-alt", name: "plausible/analytics", desc: "Privacy-friendly web analytics. Simple, lightweight, GDPR compliant.", stars: "22K+", tag: "analytics", url: "https://github.com/plausible/analytics", replaces: "Google Analytics" },
  { tab: "free-alt", name: "appwrite/appwrite", desc: "Backend-as-a-service. Auth, database, storage, functions. Self-hosted Firebase.", stars: "48K+", tag: "backend", url: "https://github.com/appwrite/appwrite", replaces: "Firebase ($25+/mo)" },
  { tab: "free-alt", name: "supabase/supabase", desc: "Open source Firebase. Postgres, auth, real-time, storage, edge functions.", stars: "78K+", tag: "backend", url: "https://github.com/supabase/supabase", replaces: "Firebase ($25+/mo)" },
  { tab: "free-alt", name: "calcom/cal.com", desc: "Scheduling infrastructure. Calendly alternative. Self-hosted.", stars: "35K+", tag: "scheduling", url: "https://github.com/calcom/cal.com", replaces: "Calendly ($12/mo)" },
  { tab: "free-alt", name: "maybe-finance/maybe", desc: "Personal finance app. Track net worth, investments, spending. Self-hosted.", stars: "40K+", tag: "finance", url: "https://github.com/maybe-finance/maybe", replaces: "Mint / Copilot ($10/mo)" },
  { tab: "free-alt", name: "languagetool-org/languagetool", desc: "Grammar and style checker. 30+ languages. Browser extension + API.", stars: "13K+", tag: "writing", url: "https://github.com/languagetool-org/languagetool", replaces: "Grammarly ($12/mo)" },
  { tab: "free-alt", name: "hoppscotch/hoppscotch", desc: "API development ecosystem. Beautiful UI. Open source Postman.", stars: "68K+", tag: "dev-tools", url: "https://github.com/hoppscotch/hoppscotch", replaces: "Postman ($14/mo)" },
  { tab: "free-alt", name: "jitsi/jitsi-meet", desc: "Video conferencing. No account needed. Self-hosted. End-to-end encrypted.", stars: "24K+", tag: "communication", url: "https://github.com/jitsi/jitsi-meet", replaces: "Zoom ($13/mo)" },
  { tab: "free-alt", name: "immich-app/immich", desc: "Self-hosted Google Photos. Face recognition, maps, sharing, mobile app.", stars: "60K+", tag: "storage", url: "https://github.com/immich-app/immich", replaces: "Google Photos ($3-10/mo)" },

  // ── CREATORS OF COLOR ──
  { tab: "creators", name: "Timnit Gebru / DAIR Institute", desc: "Distributed AI Research Institute. Founded after Google. AI ethics, data documentation, community-centered research.", tag: "research", url: "https://github.com/dair-ai", creator: "Timnit Gebru (Ethiopian-American)" },
  { tab: "creators", name: "dair-ai/Prompt-Engineering-Guide", desc: "THE prompt engineering guide. 50K+ stars. Comprehensive, constantly updated.", stars: "52K+", tag: "education", url: "https://github.com/dair-ai/Prompt-Engineering-Guide", creator: "Elvis Saravia (DAIR)" },
  { tab: "creators", name: "dair-ai/ML-Papers-of-the-Week", desc: "Weekly curated ML paper roundups. Stay current without reading 100 papers.", stars: "10K+", tag: "research", url: "https://github.com/dair-ai/ML-Papers-of-the-Week", creator: "Elvis Saravia (DAIR)" },
  { tab: "creators", name: "Joy Buolamwini / AJL", desc: "Algorithmic Justice League. Facial recognition bias research that changed federal policy.", tag: "research", url: "https://github.com/joybuolamwini", creator: "Joy Buolamwini (Ghanaian-American)" },
  { tab: "creators", name: "microsoft/AI-For-Beginners", desc: "24-lesson AI curriculum. Open source. Covers symbolic AI through modern neural networks.", stars: "36K+", tag: "education", url: "https://github.com/microsoft/AI-For-Beginners", creator: "Microsoft (diverse team)" },
  { tab: "creators", name: "fastai/fastai", desc: "Making deep learning accessible. The library + course that democratized ML.", stars: "27K+", tag: "education", url: "https://github.com/fastai/fastai", creator: "Jeremy Howard & Rachel Thomas" },
  { tab: "creators", name: "masakhane-io", desc: "NLP research for African languages. 50+ languages, community-driven, open datasets.", tag: "nlp", url: "https://github.com/masakhane-io", creator: "Masakhane Community (Pan-African)" },
  { tab: "creators", name: "lelapa-ai", desc: "AI for Africa. Multilingual models, speech recognition for African languages.", tag: "nlp", url: "https://github.com/lelapa-ai", creator: "Lelapa AI (South Africa)" },
  { tab: "creators", name: "AfricaNLP", desc: "NLP datasets and tools for African languages. Bridging the language gap in AI.", tag: "nlp", url: "https://github.com/masakhane-io/masakhane-mt", creator: "African NLP Community" },
  { tab: "creators", name: "BlackInAI", desc: "Programs, workshops, research. Increasing Black presence in AI since 2017.", tag: "community", url: "https://github.com/blackinai", creator: "Black in AI Community" },

  // ── LEARNING ──
  { tab: "learning", name: "anthropics/courses", desc: "Free prompt engineering and tool use courses from Anthropic.", stars: "10K+", tag: "courses", url: "https://github.com/anthropics/courses" },
  { tab: "learning", name: "mlabonne/llm-course", desc: "Complete course on LLMs. From basics to fine-tuning to deployment.", stars: "45K+", tag: "courses", url: "https://github.com/mlabonne/llm-course" },
  { tab: "learning", name: "dair-ai/Prompt-Engineering-Guide", desc: "The definitive guide to prompt engineering. Techniques, papers, tools.", stars: "52K+", tag: "prompts", url: "https://github.com/dair-ai/Prompt-Engineering-Guide" },
  { tab: "learning", name: "microsoft/generative-ai-for-beginners", desc: "18-lesson course on generative AI. Free. From Microsoft.", stars: "72K+", tag: "courses", url: "https://github.com/microsoft/generative-ai-for-beginners" },
  { tab: "learning", name: "karpathy/nn-zero-to-hero", desc: "Andrej Karpathy's neural network course. From zero to building GPT.", stars: "15K+", tag: "courses", url: "https://github.com/karpathy/nn-zero-to-hero" },
  { tab: "learning", name: "freeCodeCamp/freeCodeCamp", desc: "Learn to code for free. Full stack, Python, data science, machine learning.", stars: "410K+", tag: "coding", url: "https://github.com/freeCodeCamp/freeCodeCamp" },
  { tab: "learning", name: "TheOdinProject/curriculum", desc: "Full stack web development. Open source. Project-based. Community-driven.", stars: "10K+", tag: "coding", url: "https://github.com/TheOdinProject/curriculum" },
  { tab: "learning", name: "ossu/computer-science", desc: "Free self-taught CS degree. Curated path through the best free courses.", stars: "180K+", tag: "cs-degree", url: "https://github.com/ossu/computer-science" },
  { tab: "learning", name: "practical-tutorials/project-based-learning", desc: "Learn by building. Tutorials organized by programming language and project type.", stars: "210K+", tag: "projects", url: "https://github.com/practical-tutorials/project-based-learning" },
  { tab: "learning", name: "EbookFoundation/free-programming-books", desc: "300K+ stars. The largest collection of free programming books. Every language.", stars: "350K+", tag: "books", url: "https://github.com/EbookFoundation/free-programming-books" },

  // ── DEV STAPLES ──
  { tab: "staples", name: "vercel/next.js", desc: "React framework. SSR, ISR, API routes, App Router. The standard.", stars: "130K+", tag: "framework", url: "https://github.com/vercel/next.js" },
  { tab: "staples", name: "tailwindlabs/tailwindcss", desc: "Utility-first CSS. Write styles in your markup. The new default.", stars: "85K+", tag: "css", url: "https://github.com/tailwindlabs/tailwindcss" },
  { tab: "staples", name: "shadcn-ui/ui", desc: "Beautiful, accessible components. Copy/paste into your project. Not a library.", stars: "80K+", tag: "components", url: "https://github.com/shadcn-ui/ui" },
  { tab: "staples", name: "denoland/deno", desc: "Modern JS/TS runtime. Secure by default. Built-in tooling. Node alternative.", stars: "100K+", tag: "runtime", url: "https://github.com/denoland/deno" },
  { tab: "staples", name: "python/cpython", desc: "Python itself. The language powering most of AI/ML.", stars: "65K+", tag: "language", url: "https://github.com/python/cpython" },
  { tab: "staples", name: "docker/docker-ce", desc: "Containerization. Package your app + dependencies. Run anywhere.", stars: "N/A", tag: "devops", url: "https://github.com/docker" },
  { tab: "staples", name: "Unitech/pm2", desc: "Node.js process manager. Auto-restart, clustering, monitoring.", stars: "42K+", tag: "devops", url: "https://github.com/Unitech/pm2" },
  { tab: "staples", name: "ohmyzsh/ohmyzsh", desc: "Make your terminal beautiful and productive. 300+ plugins.", stars: "175K+", tag: "terminal", url: "https://github.com/ohmyzsh/ohmyzsh" },

  // ── HONORABLE MENTIONS ──
  { tab: "honorable", name: "mindsdb/mindsdb", desc: "AI tables in your database. SQL for machine learning. No Python needed.", stars: "28K+", tag: "ml-tools", url: "https://github.com/mindsdb/mindsdb" },
  { tab: "honorable", name: "BerriAI/litellm", desc: "Call 100+ LLMs with one interface. OpenAI format. Fallbacks, load balancing.", stars: "18K+", tag: "llm-tools", url: "https://github.com/BerriAI/litellm" },
  { tab: "honorable", name: "HKUDS/LightRAG", desc: "Simple and fast retrieval-augmented generation. Knowledge graphs + LLMs.", stars: "15K+", tag: "rag", url: "https://github.com/HKUDS/LightRAG" },
  { tab: "honorable", name: "lobehub/lobe-chat", desc: "Open source ChatGPT/Claude UI. Plugin system, multi-model, beautiful.", stars: "55K+", tag: "chat-ui", url: "https://github.com/lobehub/lobe-chat" },
  { tab: "honorable", name: "mendableai/firecrawl", desc: "Scrape websites into LLM-ready data. Clean markdown output.", stars: "25K+", tag: "data", url: "https://github.com/mendableai/firecrawl" },
  { tab: "honorable", name: "modelcontextprotocol/servers", desc: "MCP servers. Give AI tools access to databases, APIs, filesystems.", stars: "15K+", tag: "mcp", url: "https://github.com/modelcontextprotocol/servers" },
  { tab: "honorable", name: "excalidraw/excalidraw", desc: "Whiteboard tool. Hand-drawn feel. Collaborative. Open source.", stars: "92K+", tag: "design", url: "https://github.com/excalidraw/excalidraw" },
  { tab: "honorable", name: "nocodb/nocodb", desc: "Open source Airtable. Turn any database into a spreadsheet UI.", stars: "52K+", tag: "database", url: "https://github.com/nocodb/nocodb" },

  // ── ORGS & COMMUNITIES ──
  { tab: "orgs", name: "Black in AI", desc: "Community of Black researchers in AI. Annual workshops at NeurIPS. Research, mentorship, advocacy.", tag: "community", url: "https://blackinai.github.io/" },
  { tab: "orgs", name: "DAIR Institute", desc: "Timnit Gebru's research institute. Community-centered AI research. Data documentation.", tag: "research", url: "https://www.dair-institute.org/" },
  { tab: "orgs", name: "Algorithmic Justice League", desc: "Joy Buolamwini's org. Fighting AI bias. Research, art, policy advocacy.", tag: "advocacy", url: "https://www.ajl.org/" },
  { tab: "orgs", name: "Data & Society", desc: "Research institute studying social implications of data-driven tech.", tag: "research", url: "https://datasociety.net/" },
  { tab: "orgs", name: "HillmanTok University", desc: "400+ free courses from Black educators. Named after A Different World. Netflix partnership.", tag: "education", url: "https://edu.thehillmantok.com/" },
  { tab: "orgs", name: "Black Girls CODE", desc: "Introducing young Black girls to CS and tech. Workshops, hackathons, programs.", tag: "education", url: "https://wearebgc.org/" },
  { tab: "orgs", name: "Code2040", desc: "Creating racial equity in tech. Fellows program, startup partnerships.", tag: "careers", url: "https://www.code2040.org/" },
  { tab: "orgs", name: "/dev/color", desc: "Career development for Black software engineers. Peer support, mentorship.", tag: "careers", url: "https://devcolor.org/" },
  { tab: "orgs", name: "Blacks in Technology", desc: "Largest online community of Black tech professionals. Slack, events, jobs.", tag: "community", url: "https://www.blacksintechnology.net/" },
  { tab: "orgs", name: "Lesbians Who Tech", desc: "Community of LGBTQ+ women and non-binary people in tech. Inclusive, intersectional.", tag: "community", url: "https://lesbianswhotech.org/" },
  { tab: "orgs", name: "AfroTech", desc: "Annual conference for Black tech professionals. Largest event of its kind.", tag: "events", url: "https://afrotech.com/" },
  { tab: "orgs", name: "Google Black Founders Fund", desc: "Non-dilutive grants up to $150K + cloud credits + mentorship.", tag: "funding", url: "https://startup.google.com/programs/black-founders-fund/" },
  { tab: "orgs", name: "Harlem Capital", desc: "Early-stage VC investing in diverse founders. Portfolio of 40+ companies.", tag: "funding", url: "https://www.harlemcapital.com/" },
  { tab: "orgs", name: "Backstage Capital", desc: "Arlan Hamilton's fund. Investing in underrepresented founders.", tag: "funding", url: "https://backstagecapital.com/" },
];

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState("all");

  const filtered = activeTab === "all" ? REPOS : REPOS.filter((r) => r.tab === activeTab);

  return (
    <main className="pt-20 min-h-screen">
      <div className="container-wide py-8">
        <ScrollReveal>
          <div className="mb-8">
            <span className="tag tag-terminal mb-4 inline-block">// fork it — full resources</span>
            <h1 className="text-headline text-raw mb-2">
              The Arsenal. <span className="text-terminal">Everything You Need.</span>
            </h1>
            <p className="text-sub max-w-2xl">
              100+ repos, free tools, creators of color, learning paths, orgs, and communities.
              Bookmark this page. Come back weekly. We update it.
            </p>
          </div>
        </ScrollReveal>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-1 mb-8 pb-2 border-b border-noise">
          {TABS.map((tab) => {
            const count = tab.id === "all" ? REPOS.length : REPOS.filter((r) => r.tab === tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-t-sm transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "text-raw border-terminal bg-static"
                    : "text-chrome border-transparent hover:text-raw hover:border-noise"
                }`}
              >
                {tab.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? "bg-terminal text-void" : "bg-noise text-chrome/60"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Count */}
        <p className="text-mono text-chrome/40 text-xs mb-4">
          {filtered.length} resource{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((repo, i) => (
            <ScrollReveal key={`${repo.tab}-${repo.name}`} delay={Math.min(i * 30, 300)}>
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bento-card p-5 block group hover:border-terminal/40 transition-all h-full flex flex-col"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="tag tag-terminal">{repo.tag}</span>
                  {repo.stars && (
                    <span className="text-mono text-signal text-xs font-bold">
                      {repo.stars}
                    </span>
                  )}
                </div>
                <h4 className="font-mono text-sm text-raw font-bold group-hover:text-terminal transition-colors mb-1">
                  {repo.name}
                </h4>
                {repo.creator && (
                  <p className="text-input text-xs mb-1">{repo.creator}</p>
                )}
                {repo.replaces && (
                  <p className="text-xs mb-1">
                    <span className="text-chrome/40 line-through">{repo.replaces}</span>
                    <span className="text-terminal ml-2">FREE</span>
                  </p>
                )}
                <p className="text-chrome text-xs leading-relaxed mt-auto pt-2">
                  {repo.desc}
                </p>
              </a>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </main>
  );
}
