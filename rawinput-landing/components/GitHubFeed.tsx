"use client";
import Link from "next/link";
import ScrollReveal from "./ScrollReveal";

const TRENDING = [
  { name: "ollama/ollama", stars: "165K", desc: "Run LLMs locally with one command. Llama 3, DeepSeek, Mistral, Gemma.", tag: "local-ai", url: "https://github.com/ollama/ollama" },
  { name: "comfyanonymous/ComfyUI", stars: "106K", desc: "Node-based AI image generation. Full control over every diffusion step.", tag: "image-gen", url: "https://github.com/comfyanonymous/ComfyUI" },
  { name: "langgenius/dify", stars: "90K+", desc: "Production-ready agentic workflows. RAG, multi-model, visual builder.", tag: "agents", url: "https://github.com/langgenius/dify" },
  { name: "n8n-io/n8n", stars: "85K+", desc: "Open source workflow automation with native AI. 400+ integrations.", tag: "automation", url: "https://github.com/n8n-io/n8n" },
  { name: "microsoft/autogen", stars: "45K+", desc: "Multi-agent framework. Agents that code, review, and test autonomously.", tag: "agents", url: "https://github.com/microsoft/autogen" },
  { name: "huggingface/transformers", stars: "145K+", desc: "THE library for NLP, vision, audio. Thousands of pretrained models.", tag: "ml-framework", url: "https://github.com/huggingface/transformers" },
];

const FREE_ALTERNATIVES = [
  { paid: "ChatGPT Plus", free: "Ollama + Open WebUI", repo: "open-webui/open-webui", stars: "60K+" },
  { paid: "Midjourney", free: "ComfyUI + Flux", repo: "comfyanonymous/ComfyUI", stars: "106K" },
  { paid: "Notion AI", free: "Logseq + local LLM", repo: "logseq/logseq", stars: "35K+" },
  { paid: "Grammarly", free: "LanguageTool", repo: "languagetool-org/languagetool", stars: "13K+" },
  { paid: "Zapier", free: "n8n", repo: "n8n-io/n8n", stars: "85K+" },
  { paid: "Canva", free: "Penpot", repo: "penpot/penpot", stars: "35K+" },
  { paid: "Slack", free: "Rocket.Chat", repo: "RocketChat/Rocket.Chat", stars: "42K+" },
  { paid: "Google Analytics", free: "Plausible", repo: "plausible/analytics", stars: "22K+" },
];

export default function GitHubFeed() {
  return (
    <section className="py-24 bg-gradient-to-b from-void via-static to-void">
      <div className="container-wide">
        <ScrollReveal>
          <div className="flex items-center gap-4 mb-4">
            <span className="tag tag-terminal">// fork it</span>
          </div>
          <h2 className="text-headline text-raw mb-2">
            GitHub Essentials. <span className="text-terminal">Stay Sharp.</span>
          </h2>
          <p className="text-sub max-w-2xl mb-10">
            Trending repos, free alternatives to paid tools, and the open source
            projects every Black AI builder should have starred.
          </p>
        </ScrollReveal>

        {/* Trending repos */}
        <ScrollReveal>
          <h3 className="font-heading text-xl font-bold text-raw mb-4 flex items-center gap-2">
            <span className="text-terminal">&#9679;</span> Trending Now
          </h3>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-12">
          {TRENDING.map((repo, i) => (
            <ScrollReveal key={repo.name} delay={i * 60}>
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bento-card p-5 block group hover:border-terminal/40 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="tag tag-terminal">{repo.tag}</span>
                  <span className="text-mono text-signal text-xs font-bold">
                    {repo.stars}
                  </span>
                </div>
                <h4 className="font-mono text-sm text-raw font-bold group-hover:text-terminal transition-colors mb-1">
                  {repo.name}
                </h4>
                <p className="text-chrome text-xs leading-relaxed">
                  {repo.desc}
                </p>
              </a>
            </ScrollReveal>
          ))}
        </div>

        {/* Free alternatives */}
        <ScrollReveal>
          <h3 className="font-heading text-xl font-bold text-raw mb-4 flex items-center gap-2">
            <span className="text-signal">&#9679;</span> Free Alternatives to Paid Tools
          </h3>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-10">
          {FREE_ALTERNATIVES.map((alt, i) => (
            <ScrollReveal key={alt.paid} delay={i * 40}>
              <a
                href={`https://github.com/${alt.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bento-card p-4 flex items-center justify-between group hover:border-signal/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[80px]">
                    <p className="text-chrome/40 text-xs line-through">{alt.paid}</p>
                    <p className="text-terminal text-xs font-bold mt-0.5">{alt.free}</p>
                  </div>
                  <div>
                    <p className="font-mono text-xs text-raw group-hover:text-signal transition-colors">
                      {alt.repo}
                    </p>
                  </div>
                </div>
                <span className="text-mono text-signal/60 text-xs">{alt.stars}</span>
              </a>
            </ScrollReveal>
          ))}
        </div>

        {/* CTA to full resources page */}
        <ScrollReveal delay={200}>
          <div className="text-center">
            <Link
              href="/resources"
              className="border border-terminal text-terminal px-8 py-4 rounded-sm text-sm font-bold uppercase tracking-widest hover:bg-terminal hover:text-void transition-all inline-block"
            >
              View All Resources &amp; Repos
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
