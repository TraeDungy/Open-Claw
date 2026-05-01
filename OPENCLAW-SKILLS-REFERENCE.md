# OpenClaw Skills Reference Guide
**Comprehensive Searchable Skills Documentation**

**Last Updated:** February 20, 2026
**Total Skills:** 198+
**Location:** http://5.78.44.176 (@The_Operatorbot)

---

## 📑 Quick Navigation

- [Film & Content Distribution](#film--content-distribution)
- [Video Production & Streaming](#video-production--streaming)
- [Platform Development](#platform-development)
- [Content Automation](#content-automation)
- [Infrastructure & Deployment](#infrastructure--deployment)
- [Design & Development](#design--development)
- [Testing & Quality](#testing--quality)
- [Data & Analytics](#data--analytics)
- [Complete Skills Index](#complete-skills-index)

---

## 🎬 Film & Content Distribution

### Aspera File Delivery

#### aspera-file-delivery-workflows
**Use When:** Automating high-speed file transfers for content distribution
**Capabilities:**
- Build production-ready Aspera delivery pipelines
- Configure HSTS servers for automated uploads
- Manage multi-destination delivery workflows
- Monitor transfer status and handle failures

**Example Prompts:**
```
"Use aspera-file-delivery-workflows to create a pipeline for delivering content to Pluto TV"
"Set up automated Aspera transfer from our R2 storage to Future Today"
"Create a multi-destination Aspera workflow for FAST channel distribution"
```

**Related Skills:** expert-aspera, trialxfire-content-distribution

---

#### expert-aspera
**Use When:** Working with IBM Aspera transfers, HSTS servers, or high-speed uploads
**Capabilities:**
- Aspera HSTS configuration and management
- Node API integration
- JavaScript/Python SDK usage
- ascli command-line operations

**Example Prompts:**
```
"Use expert-aspera to configure an HSTS server for automated uploads"
"Show me how to use ascli to transfer files to partner servers"
"Set up Aspera Node API for programmatic transfers"
```

**Related Skills:** aspera-file-delivery-workflows, future-today-distribution

---

### Film Plug CMS Management

#### film-plug-cms-admin
**Use When:** Managing Film Plug PHP/MySQL CMS admin panel
**Capabilities:**
- Video management and metadata editing
- Category and collection organization
- User role and permission management
- System configuration

**Example Prompts:**
```
"Use film-plug-cms-admin to add a new video to the catalog"
"Show me how to create a new category in Film Plug"
"Export all videos from Film Plug CMS to CSV"
```

**Related Skills:** film-plug-feed-manager, film-plug-vimeo-integration

---

#### film-plug-feed-manager
**Use When:** Generating, validating, or optimizing OTT platform feeds
**Capabilities:**
- JSON/XML feed generation and validation
- Multi-platform feed formatting (Roku, Fire TV, etc.)
- Feed optimization for performance
- Feed testing and troubleshooting

**Example Prompts:**
```
"Use film-plug-feed-manager to generate a Roku feed from our catalog"
"Validate this Film Plug feed for Fire TV compliance"
"Optimize feed performance for faster app loading"
```

**Related Skills:** film-plug-multiplatform-feeds, roku-film-plug-development

---

#### film-plug-integration
**Use When:** End-to-end OTT platform integration with Film Plug
**Capabilities:**
- API endpoint configuration
- Feed generation and deployment
- Multi-platform app integration
- Webhook setup

**Example Prompts:**
```
"Use film-plug-integration to connect our Roku app to Film Plug CMS"
"Set up API endpoints for mobile app integration"
"Configure webhooks for automatic feed updates"
```

**Related Skills:** film-plug-ott-management, ott-video-streaming

---

#### film-plug-multiplatform-feeds
**Use When:** Managing multi-platform OTT feed generation from Film Plug
**Capabilities:**
- Generate feeds for Roku, Fire TV, iOS, Android
- Platform-specific validation
- Deploy feeds to CDN
- Monitor feed health

**Example Prompts:**
```
"Use film-plug-multiplatform-feeds to generate feeds for all platforms"
"Deploy updated feeds to Roku and Fire TV"
"Check feed health across all platforms"
```

**Related Skills:** film-plug-feed-manager, ott-certification-checklist

---

#### film-plug-ott-management
**Use When:** Managing Film Plug OTT platform via Vimeo OTT API
**Capabilities:**
- Product, video, category, collection management
- Analytics and reporting
- Subscription management
- Revenue tracking

**Example Prompts:**
```
"Use film-plug-ott-management to analyze subscriber growth"
"Create a new product tier in Film Plug"
"Generate revenue report for last quarter"
```

**Related Skills:** film-plug-vimeo-integration, vimeo-airtable-automation

---

#### film-plug-vimeo-integration
**Use When:** Managing Film Plug content using Vimeo tools
**Capabilities:**
- Discover and organize Vimeo content
- Sync metadata to Film Plug
- Manage video assets
- Track upload status

**Example Prompts:**
```
"Use film-plug-vimeo-integration to sync new Vimeo uploads to Film Plug"
"Import metadata from Vimeo for all videos"
"Check upload status for pending videos"
```

**Related Skills:** vimeo-airtable-automation, trialxfire-vimeo-airtable-sync

---

### FAST Channel Distribution

#### future-today-distribution
**Use When:** Distributing Trial X Fire content to Future Today (Fawwesome)
**Capabilities:**
- Metadata generation for Future Today format
- Content delivery automation
- Feed validation
- Status tracking

**Example Prompts:**
```
"Use future-today-distribution to prepare content for Fawwesome"
"Generate Future Today metadata for [MOVIE NAME]"
"Automate delivery workflow to Future Today"
```

**Related Skills:** tubi-metadata, trialxfire-content-distribution

---

#### trialxfire-content-distribution
**Use When:** Distributing Trial X Fire content to FAST channels
**Capabilities:**
- Multi-channel distribution (Tubi, Pluto, Xumo, Plex)
- Aspera HSTS high-speed transfers
- Metadata formatting
- Delivery tracking

**Example Prompts:**
```
"Use trialxfire-content-distribution to distribute [CONTENT] to all FAST channels"
"Set up automated delivery to Pluto TV"
"Track delivery status for recent uploads"
```

**Related Skills:** aspera-file-delivery-workflows, tubi-metadata

---

### Tubi Integration

#### tubi-brand-marketing
**Use When:** Creating content for Tubi with brand guideline compliance
**Capabilities:**
- Tubi 2024 brand guidelines adherence
- Marketing content creation
- Brand identity consistency
- Visual asset guidelines

**Example Prompts:**
```
"Use tubi-brand-marketing to create promotional content for Tubi"
"Ensure this marketing material follows Tubi brand guidelines"
"Generate Tubi-compliant social media assets"
```

**Related Skills:** tubi-metadata

---

#### tubi-metadata
**Use When:** Creating or validating Tubi metadata deliverables
**Capabilities:**
- All 4 Tubi metadata templates (Submission, Movie/Series, Avails)
- Excel file generation and validation
- Title normalization
- Quality checks

**Example Prompts:**
```
"Use tubi-metadata to create a submission template for [MOVIE NAME]"
"Validate this Tubi metadata file for compliance"
"Generate complete Tubi deliverable package"
```

**Related Skills:** tubi-brand-marketing, trialxfire-content-distribution

---

## 🎥 Video Production & Streaming

### Video Encoding

#### video-encoding-pipeline
**Use When:** Building automated video encoding pipelines with FFmpeg
**Capabilities:**
- Multi-platform adaptive bitrate encoding
- HLS stream generation
- Thumbnail and poster extraction
- Batch processing

**Example Prompts:**
```
"Use video-encoding-pipeline to encode [VIDEO] for all OTT platforms"
"Generate HLS stream with multiple bitrates"
"Create thumbnail sheet for video preview"
```

**Related Skills:** ott-video-streaming, trialxfire-r2-migration

---

#### ott-video-streaming
**Use When:** OTT video streaming architecture and best practices
**Capabilities:**
- Video format selection
- Encoding parameters
- Adaptive bitrate streaming
- DRM integration
- CDN delivery

**Example Prompts:**
```
"Use ott-video-streaming to design encoding strategy for our platform"
"Recommend HLS encoding settings for mobile and TV"
"Set up adaptive bitrate streaming workflow"
```

**Related Skills:** video-encoding-pipeline, fire-tv-optimization

---

### DRM Implementation

#### apple-tvos-fairplay-drm
**Use When:** Implementing FairPlay Streaming DRM on iOS/tvOS
**Capabilities:**
- AVContentKeySession API
- FairPlay license server setup
- Certificate management
- Offline playback support

**Example Prompts:**
```
"Use apple-tvos-fairplay-drm to implement FairPlay in our iOS app"
"Set up FairPlay license server"
"Enable offline downloads with FairPlay"
```

**Related Skills:** android-tv-exoplayer, fire-tv-optimization

---

## 📱 Platform Development

### Roku Development

#### roku-brightscript-development
**Use When:** Developing Roku channels with BrightScript
**Capabilities:**
- BrightScript programming
- SceneGraph SDK
- Rebel Upload platform integration
- Channel certification prep

**Example Prompts:**
```
"Use roku-brightscript-development to create a new Roku channel"
"Debug BrightScript error in [FILE]"
"Prepare channel for Roku certification"
```

**Related Skills:** roku-film-plug-development, ott-certification-checklist

---

#### roku-film-plug-development
**Use When:** Developing Roku channel integrated with Film Plug CMS
**Capabilities:**
- Film Plug API integration
- Feed parsing and display
- Video playback
- Category navigation

**Example Prompts:**
```
"Use roku-film-plug-development to connect Roku app to Film Plug"
"Parse Film Plug feed and display content grid"
"Implement video player with Film Plug streams"
```

**Related Skills:** film-plug-integration, roku-brightscript-development

---

### Fire TV Development

#### fire-tv-optimization
**Use When:** Optimizing Fire TV applications
**Capabilities:**
- Vega OS constraints
- Memory management
- Frame rate optimization
- Audio/video codec selection

**Example Prompts:**
```
"Use fire-tv-optimization to improve Fire TV app performance"
"Optimize memory usage for Fire TV Stick"
"Debug frame rate issues on Fire TV"
```

**Related Skills:** android-tv-exoplayer, ott-video-streaming

---

### Android TV Development

#### android-tv-exoplayer
**Use When:** Implementing ExoPlayer Media3 on Android TV/Fire TV
**Capabilities:**
- ExoPlayer v1.8.0+ setup
- Adaptive streaming
- Widevine DRM integration
- Custom UI controls

**Example Prompts:**
```
"Use android-tv-exoplayer to implement adaptive streaming"
"Set up Widevine DRM with ExoPlayer"
"Create custom playback controls for Android TV"
```

**Related Skills:** fire-tv-optimization, apple-tvos-fairplay-drm

---

## 🤖 Content Automation

### Trial X Fire Workflows

#### trial-x-fire-content-automation
**Use When:** Automating Trial X Fire content delivery pipeline
**Capabilities:**
- Multi-source ingestion (FileMail, Dropbox)
- Dual-platform upload (Vimeo + R2)
- Metadata extraction
- Automated delivery

**Example Prompts:**
```
"Use trial-x-fire-content-automation to set up automated ingestion"
"Monitor content pipeline status"
"Configure automated Vimeo and R2 uploads"
```

**Related Skills:** trialxfire-r2-migration, trialxfire-catalog-manager

---

#### trialxfire-airtable-catalog
**Use When:** Managing Trial X Fire content catalog in Airtable
**Capabilities:**
- Catalog organization
- Metadata management
- Content tracking
- Reporting

**Example Prompts:**
```
"Use trialxfire-airtable-catalog to add new content to catalog"
"Generate catalog report by category"
"Update metadata for [TITLE] in Airtable"
```

**Related Skills:** vimeo-airtable-automation, trialxfire-catalog-manager

---

#### trialxfire-catalog-manager
**Use When:** Unified catalog management for Trial X Fire
**Capabilities:**
- R2 storage integration
- Vimeo API integration
- CMS dashboard
- Migration status monitoring

**Example Prompts:**
```
"Use trialxfire-catalog-manager to check migration status"
"Sync catalog between R2 and Vimeo"
"Generate catalog dashboard report"
```

**Related Skills:** trialxfire-r2-migration, trialxfire-airtable-catalog

---

#### trialxfire-r2-migration
**Use When:** Migrating content from Vimeo to R2 storage
**Capabilities:**
- Vimeo-to-R2 migration workflow
- HLS transcoding
- Thumbnail generation
- Metadata extraction

**Example Prompts:**
```
"Use trialxfire-r2-migration to migrate [VIDEO] from Vimeo to R2"
"Check migration status for all pending videos"
"Generate HLS streams during R2 migration"
```

**Related Skills:** video-encoding-pipeline, trialxfire-catalog-manager

---

#### trialxfire-vimeo-airtable-sync
**Use When:** Syncing 734 videos from Vimeo to Airtable
**Capabilities:**
- Autonomous workflow
- Cost-optimized model routing
- 5-subagent pattern
- Metadata synchronization

**Example Prompts:**
```
"Use trialxfire-vimeo-airtable-sync to sync all Vimeo videos"
"Update Airtable with latest Vimeo metadata"
"Check sync status for recent uploads"
```

**Related Skills:** vimeo-airtable-automation, trialxfire-airtable-catalog

---

### Vimeo Integration

#### vimeo-airtable-automation
**Use When:** Automating Vimeo + Airtable workflows
**Capabilities:**
- Native Airtable operations
- Vimeo API integration
- Automated metadata sync
- Batch operations

**Example Prompts:**
```
"Use vimeo-airtable-automation to sync new Vimeo uploads to Airtable"
"Bulk update Airtable from Vimeo metadata"
"Automate daily Vimeo-Airtable sync"
```

**Related Skills:** trialxfire-vimeo-airtable-sync, film-plug-vimeo-integration

---

## 🏗️ Infrastructure & Deployment

#### nano-claw-imac
**Use When:** Controlling the Trial X Fire iMac (192.168.1.151) remotely — browser automation, shell commands, screenshots, file operations, art resizing, subtitle conversion, FTP uploads, and computer use
**Capabilities:**
- Firefox/Playwright browser automation (headless or visible)
- Execute shell commands on iMac
- Capture full desktop screenshots
- Resize images to FT delivery spec (Portrait 2100×2700, Landscape 1920×1080) via sips
- Convert VTT subtitles to SRT via Python3
- Get video metadata via macOS mdls
- Open/connect FileZilla for FTP uploads
- Run arbitrary AppleScript for UI automation
- Send macOS desktop notifications
- Read/write clipboard
- Download files via curl
- System info (CPU/disk/memory/uptime)
- List running apps, kill apps by name
- Fawesome delivery folder audit and FTP status

**Example Prompts:**
```
"Use nano-claw-imac to take a screenshot of the iMac desktop"
"Use nano_claw_art_resize to resize the BlackSheep poster to FT delivery spec"
"Use nano_claw_subtitle_convert to convert BlackSheep.vtt to SRT"
"Use nano_claw_fawesome_audit to check delivery status for all 9 titles"
"Use nano_claw_filezilla to open FileZilla on the iMac"
"Use nano_claw_browser to scrape data from a website using Firefox"
"Use nano_claw_notify to send a notification when the upload is complete"
```

**Related Skills:** future-today-distribution, aspera-file-delivery-workflows, playwright-skill

---

#### hetzner-cloud-deployment
**Use When:** Deploying apps to Hetzner Cloud VPS
**Capabilities:**
- Node.js/Next.js deployment
- PM2 process management
- Nginx reverse proxy
- SSL certificate setup

**Example Prompts:**
```
"Use hetzner-cloud-deployment to deploy Next.js app to Hetzner"
"Set up Nginx reverse proxy for [APP]"
"Configure PM2 for 24/7 operation"
```

**Related Skills:** None (infrastructure)

---

## 🎨 Design & Development

### Design Direction & Orchestration

#### web-design-orchestrator
**Use When:** Planning any web design project — selects the right style, skills, and approach before a single line of code is written
**Capabilities:**
- Analyzes project type and selects optimal design style
- Routes to the right combination of specialist skills
- Covers 11 design systems: Glassmorphism, Neobrutalism, Bold Typography, Y2K, Swiss Grid, Scroll-Driven, View Transitions, 3D, Motion Brand, Neomorphism, Modern CSS
- Generates step-by-step design implementation plans
- Identifies trending features and modern patterns

**Example Prompts:**
```
"Use web-design-orchestrator to plan the design for our new OTT landing page"
"What design style should we use for a fitness app? Use web-design-orchestrator"
"Plan a premium SaaS dashboard design using web-design-orchestrator"
```

**Related Skills:** award-winning-web-design, motion-as-brand-identity, all design skills

---

### Temporal Design — Past

#### web-design-archaeology
**Use When:** Building interfaces that feel genuinely novel by excavating abandoned design movements — skeuomorphism, Flash-era interactivity, CRT/terminal clarity, CD-ROM spatial navigation, Swiss International Style grids, teletext
**Capabilities:**
- **Skeuomorphic depth recovery** — neumorphism, tactile buttons, dark material wells with genuine affordance (not fake leather)
- **Flash-era interactivity** — cursor-following glow, hover-as-revelation panels, entry choreography that makes arriving feel like an event
- **CRT/Terminal clarity** — phosphor text (green/amber/white), CSS scanlines, flicker animation, terminal typing effects, 8-color teletext palette as aesthetic choice
- **Desktop chrome / Window metaphor** — draggable window panels, traffic light buttons, spatial hierarchy made visible
- **CD-ROM spatial navigation** — directional View Transitions, breadcrumb location indicators (pages have address)
- **Swiss International Style** — true 12-column Müller-Brockmann grid, fluid type scale (Perfect Fourth), asymmetric layouts, single accent rule
- **Temporal mash-up recipes** — Ghost in the Terminal, Dead Drop Interface, Brutalist Grid

**Example Prompts:**
```
"Use web-design-archaeology to build a terminal-aesthetic dashboard for the Open Claw admin panel"
"Create a Swiss grid layout for our content library page using web-design-archaeology"
"Build a draggable window panel interface in the Dead Drop style"
"Use web-design-archaeology to apply CRT phosphor styling to our monitoring dashboard"
```

**Related Skills:** speculative-ui-futures, web-design-orchestrator, neobrutalism-design

---

### Temporal Design — Future

#### speculative-ui-futures
**Use When:** Designing interfaces that feel like they arrived from 2028 — spatial depth, AI-native ambient UI, biological/organic morphing, crystalline data aesthetics, solarpunk, liquid physics
**Capabilities:**
- **Spatial depth-layer UI** — CSS perspective + translateZ, pointer-tracked parallax (data-depth system), floating glass panels that pre-empt Vision Pro era on flat screens
- **AI-native / ambient UI** — expanding input fields that grow with intent, thinking pulse animations, streaming shimmer, ghost chrome (appears only when needed), context emergence chips
- **Biological / organic morphing** — breathing blobs (8-phase border-radius morph + `@property` animated gradients), cellular division animation, mycelial network canvas, bioluminescent pointer response
- **Crystalline / mineral data** — prismatic facet CSS, geological strata layout (data as rock layers), faceted cards with `clip-path` polygon, iridescent color shift animation
- **Solarpunk** — `--sol-*` color system (warm earthy greens), organic asymmetric cards and buttons, generative botanical SVG growth patterns
- **Liquid physics UI** — liquid-pour clip-path transitions, ripple touch canvas, magnetic element attraction

**Example Prompts:**
```
"Use speculative-ui-futures to build a spatial depth hero section for our landing page"
"Design an AI-native input interface using speculative-ui-futures ambient patterns"
"Build a crystalline data visualization for our analytics dashboard"
"Apply the Garden Terminal recipe: solarpunk colors + AI-native UI for our chat interface"
"Use speculative-ui-futures to add biological breathing animations to our live metrics panel"
```

**Temporal Synthesis Recipes:**
```
"Ghost in the Terminal"  → Swiss grid + CRT/phosphor + AI-native ambient input
"Garden Terminal"        → Solarpunk + AI-native UI + organic morphing
"Crystal Mind"           → Crystalline data + AI thinking states + iridescent surfaces
"Living Archive"         → Spatial depth + crystalline strata + Flash hover-as-revelation
"Dead Drop Interface"    → Window chrome + biological breathing + dark luxury
"Retro Spatial"          → CD-ROM navigation + spatial depth panels + Swiss grid
```

**Related Skills:** web-design-archaeology, web-design-orchestrator, 3d-product-experiences

---

### Brand Motion & Animation

#### motion-as-brand-identity
**Use When:** Designing motion as a systematic brand language — not ad-hoc animations, but a complete motion design system with tokens, spring physics, and brand-specific signatures
**Capabilities:**
- Motion personality quiz and brand archetype analysis
- CSS motion tokens (5 duration variables, 6 easing variables)
- Framer Motion spring presets (snappy/smooth/bouncy/stiff/wobbly)
- Staggered entrance choreography with blur + y-axis reveal
- Press/click feedback patterns
- Animated number counters with spring physics
- Magnetic button with mouse tracking
- Brand motion signatures: Linear (120ms sharp), Stripe (spring), Apple (slow decelerate), Vercel (200ms clean)
- Reduced motion compliance

**Example Prompts:**
```
"Use motion-as-brand-identity to define our app's motion language before building any components"
"Create a Linear-style fast motion system for our SaaS dashboard"
"Build staggered entrance animations for our content grid"
```

**Related Skills:** micro-interactions-animations, web-design-orchestrator, dopamine-design

---

### AI-Adaptive UI

#### ai-adaptive-ui
**Use When:** Building interfaces that personalize themselves based on user behavior — adaptive navigation, smart defaults, content density auto-detection, learning command palette
**Capabilities:**
- Behavioral signal capture (localStorage-based, no analytics service required)
- Adaptive navigation — surfaces routes users actually use, buries what they never touch
- Smart form defaults — pre-fills from recent history
- Content density auto-detection — compact/comfortable/spacious from session patterns
- Command palette with usage-sorted commands + "Frequent" badge
- Progressive disclosure via `<FeatureGate>` — surface advanced features only when earned
- Contextual suggestions (right tool at the right moment)
- Next.js server-side personalization endpoint

**Example Prompts:**
```
"Use ai-adaptive-ui to build a command palette that learns which commands I use most"
"Add adaptive navigation to our dashboard that surfaces frequently used routes"
"Detect if this user is a power user and switch to compact density"
```

**Related Skills:** web-design-orchestrator, motion-as-brand-identity, dopamine-design

---

### Engagement & Reward Design

#### dopamine-design
**Use When:** Building consumer products where engagement and stickiness are core metrics — habit apps, fitness trackers, learning platforms, gamified tools
**Capabilities:**
- canvas-confetti patterns: standard celebration, streak milestone (multi-burst), subtle task complete, realistic fireworks
- Streak badge with spring animation + confetti trigger on new record
- XP progress bar with animated fill and shimmer CSS animation
- Achievement unlock toast with dark purple gradient + border glow
- Y2K revival CSS: chrome metallic text, holographic rainbow shift, gradient buttons, glass cards
- CSS sparkle effect with animated pseudo-elements
- Sound design with Tone.js: complete (rising chord), error, streak (triumphant), click
- Ethical guardrails: genuine achievements vs dark patterns

**Example Prompts:**
```
"Use dopamine-design to add a streak counter and XP system to our fitness app"
"Build an achievement toast notification for when users complete their first video"
"Add confetti celebration when users hit a goal"
```

**Related Skills:** motion-as-brand-identity, ai-adaptive-ui, micro-interactions-animations

---

### UI Component Systems

#### shadcn-tailwind-builder
**Use When:** Building production-ready React components with shadcn/ui and Tailwind CSS
**Capabilities:**
- shadcn/ui component customization
- Tailwind CSS design system integration
- Radix UI accessibility primitives
- Dark/light mode theming
- Form components with validation

**Example Prompts:**
```
"Use shadcn-tailwind-builder to create a data table with sorting and filtering"
"Build a command menu component with shadcn"
"Create a form with shadcn form components and zod validation"
```

**Related Skills:** ui-design-system, web-design-orchestrator

---

#### neobrutalism-design
**Use When:** Building bold, raw, high-contrast interfaces with hard shadows and visible borders — the anti-minimalism aesthetic
**Capabilities:**
- Hard box-shadow offset system
- Bold border conventions
- Brutalist button and card patterns
- Color theory for neobrutalism
- Typography rules

**Example Prompts:**
```
"Use neobrutalism-design to style our landing page with hard shadows and bold borders"
"Create a neobrutalist card grid for our content library"
```

**Related Skills:** web-design-orchestrator, bold-expressive-typography

---

#### glassmorphism-design
**Use When:** Building frosted glass aesthetics with backdrop blur, transparency layers, and depth
**Capabilities:**
- backdrop-filter blur patterns
- Glass card and panel CSS
- Dark/light glass variants
- Gradient overlays
- Border glow effects

**Example Prompts:**
```
"Use glassmorphism-design to create a frosted glass dashboard panel"
"Build a glassmorphic navigation bar"
```

**Related Skills:** web-design-orchestrator, speculative-ui-futures

---

#### css-scroll-driven-animations
**Use When:** Implementing native browser scroll animations without JavaScript — section reveals, progress bars, parallax, scroll-linked effects
**Capabilities:**
- `animation-timeline: scroll()` and `view()`
- Scroll progress indicators
- Section reveal patterns
- Scroll-snapping
- Performance-safe techniques

**Example Prompts:**
```
"Use css-scroll-driven-animations to add a reading progress bar"
"Animate section headings as they scroll into view"
"Create a scroll-linked hero parallax effect"
```

**Related Skills:** view-transitions-api, scrolling-animations-parallax, web-design-orchestrator

---

#### view-transitions-api
**Use When:** Implementing page-to-page transitions with shared element animations using the native browser View Transitions API
**Capabilities:**
- `document.startViewTransition()` patterns
- Shared element transitions (poster → full player)
- Cross-document navigation transitions
- Fallback handling
- React router integration

**Example Prompts:**
```
"Use view-transitions-api to animate the content card expanding to full view"
"Add smooth page transitions between our catalog and detail pages"
```

**Related Skills:** css-scroll-driven-animations, web-design-orchestrator, advanced-video-ui

---

### Directory & Catalog Websites

#### directory-website-builder

**Use When:** Building any directory, listing, or catalog website — business directories (Yelp-style), people/professional directories (LinkedIn-style), resource/tool directories (Product Hunt-style), or event/venue directories (Eventbrite-style)

**Capabilities:**

- Architecture guidance for all four directory types with Next.js App Router
- Search and filtering (client-side Fuse.js for small scale, server-side URL queries for large)
- Listing submission forms with Zod validation + server-side re-validation
- Admin moderation queue with middleware-based auth
- SEO: `generateMetadata`, Schema.org JSON-LD per directory type, sitemap, robots, ISR
- Data layer selection: Airtable (non-technical operators), Supabase (scale/auth), Static JSON (curated)
- Pagination, ListingCard components, and category filter chips

**Example Prompts:**

```text
"Use directory-website-builder to build a business directory for local restaurants"
"Create a tool directory like Product Hunt using directory-website-builder"
"Build a freelancer directory with submission forms and admin moderation"
"Use directory-website-builder to set up a Supabase-backed event listing site with full-text search"
```

**Related Skills:** shadcn-tailwind-builder, senior-frontend-engineer, hetzner-cloud-deployment

---

### SEO & Discovery

#### website-backlinks
**Use When:** Building or improving any website and wanting to maximize inbound backlinks, SEO link equity, and link-worthy architecture
**Capabilities:**
- Technical SEO foundations (canonical URLs, sitemap, robots.txt)
- Schema markup (Organization, Article, FAQ, Dataset, BreadcrumbList)
- Open Graph and social sharing tags
- Link-attracting content structures (resource pages, stats pages, glossaries, embeddable widgets)
- Press & media page patterns
- Internal link architecture
- Partner/attribution link patterns (rel attributes, credits pages)

**Example Prompts:**
```
"Use website-backlinks to add SEO infrastructure to this site"
"Add a resources page and press kit that will attract backlinks"
"Implement schema markup and OG tags for this landing page"
```

**Related Skills:** llm-search-discovery, web-design-orchestrator, senior-frontend-engineer

---

#### llm-search-discovery
**Use When:** Building or improving any website and wanting content discovered, cited, and recommended by AI search engines (Perplexity, ChatGPT, Google AI Overviews, Bing Copilot)
**Capabilities:**
- llms.txt protocol implementation (AI-readable site manifest)
- Semantic HTML structure for AI crawlers (no JS gates)
- Direct-answer content architecture (lede rule, GEO content formula)
- Named entity disambiguation and Organization schema
- E-E-A-T signals (author profiles, editorial policy, trust footer)
- AI crawler robots.txt configuration (GPTBot, ClaudeBot, PerplexityBot)
- Topical authority / pillar + cluster URL architecture
- Freshness signals and IndexNow submission
- Platform-specific optimization (Perplexity, ChatGPT, Google AI Overviews, Bing Copilot)

**Example Prompts:**
```
"Use llm-search-discovery to optimize this site for AI search engines"
"Add a llms.txt file and GEO content architecture to this project"
"Set up author profiles and E-E-A-T signals so AI systems trust this site"
```

**Related Skills:** website-backlinks, web-design-orchestrator, senior-frontend-engineer

---

## 📋 Platform Requirements

#### ott-certification-checklist
**Use When:** Preparing for platform certification (Roku, Apple TV, Fire TV)
**Capabilities:**
- Spring 2025 Roku criteria
- Apple TV requirements
- Fire TV guidelines
- Certification checklists

**Example Prompts:**
```
"Use ott-certification-checklist to prepare for Roku certification"
"Check our app against Fire TV requirements"
"Generate certification readiness report"
```

**Related Skills:** roku-brightscript-development, fire-tv-optimization

---

## 🔍 Complete Skills Index

### A-C
- **100m-offers-creator** - Create Grand Slam Offers (Alex Hormozi framework)
- **ai-cost-optimization-patterns** - Reduce AI API costs by 85-95%
- **algorithmic-art** - Create algorithmic art with p5.js
- **android-tv-exoplayer** - ExoPlayer Media3 on Android TV
- **apple-tvos-fairplay-drm** - FairPlay DRM for iOS/tvOS
- **artifacts-builder** - Create elaborate HTML artifacts
- **aspera-file-delivery-workflows** - Automated Aspera workflows
- **bento-grid-layouts** - Modern bento grid layouts
- **bold-expressive-typography** - Bold typography designs
- **brainstorming** - Refine ideas before implementation
- **canva-apps-sdk-core** - Build Canva Apps
- **canva-catalog-automation** - Canva Autofill + Airtable
- **canva-connect-apis** - Canva REST API integrations
- **canva-content-apps** - Canva Content Apps
- **canva-data-connectors** - Data-driven Canva automation
- **canva-design-automation** - AI-powered Canva Design API
- **canva-publish-extensions** - Canva Publish Extensions
- **canvas-design** - Visual art creation
- **claude-d3js-skill** - Interactive d3.js visualizations
- **component-library-builder** - Production component libraries

### D-F
- **defense-in-depth** - Multi-layer validation
- **directory-website-builder** - Business, people, resource, and event directory websites with Next.js ⭐ NEW
- **docx** - Document creation and editing
- **energetic-color-palettes** - Bold, vibrant color palettes
- **exec-shell-commands** - Shell command safety: GREEN/YELLOW/RED/BLACK classification, workspace boundary enforcement (/Users/trialxfire/open claw + VPS only), permission prompts for rm/chmod/kill/systemctl/directory deletion ⭐ NEW
- **executing-plans** - Execute implementation plans
- **expert-aspera** - IBM Aspera high-speed transfers
- **expert-aws-video-hosting** - AWS video and content hosting
- **expert-printful** - Printful API integration
- **expert-saas-development** - End-to-end SaaS development
- **expert-shopify** - Shopify Admin API
- **explore-first** - Explore before implementing
- **figma-to-code-workflow** - Figma API integration
- **film-plug-cms-admin** - Film Plug CMS management
- **film-plug-feed-manager** - OTT feed management
- **film-plug-integration** - OTT platform integration
- **film-plug-multiplatform-feeds** - Multi-platform feeds
- **film-plug-ott-management** - Vimeo OTT management
- **film-plug-vimeo-integration** - Vimeo content sync
- **fire-tv-optimization** - Fire TV app optimization
- **future-today-distribution** - Future Today content delivery

### G-M
- **glassmorphism-design** - Frosted glass UI aesthetic
- **hetzner-cloud-deployment** - Hetzner VPS deployment
- **lead-generation-100m** - Lead generation (Hormozi framework)
- **litellm-proxy-routing** - LiteLLM proxy routing
- **llm-search-discovery** - GEO optimization for AI search engines (Perplexity, ChatGPT, Google AI) ⭐ NEW
- **mcp-builder** - MCP server creation
- **micro-interactions-animations** - UI micro-interactions
- **mobile-first-responsive** - Mobile-first development
- **modern-css-architecture** - @layer, container queries, :has(), oklch
- **motion-as-brand-identity** - Brand motion language + spring physics tokens ⭐ NEW

### N-R
- **neobrutalism-design** - Bold borders, hard shadows, raw aesthetic
- **openrouter-model-selection** - OpenRouter model selection
- **ott-certification-checklist** - Platform certification
- **ott-video-streaming** - OTT streaming architecture
- **pdf** - PDF manipulation toolkit
- **playwright-skill** - Browser automation
- **pptx** - Presentation creation
- **roku-brightscript-development** - Roku channel development
- **roku-film-plug-development** - Film Plug Roku integration

### S-Z
- **scrolling-animations-parallax** - Scrolling animations
- **senior-backend-engineer** - Backend development
- **senior-devops-engineer** - DevOps and infrastructure
- **senior-frontend-engineer** - Frontend development
- **senior-software-architect** - Software architecture
- **shadcn-tailwind-builder** - shadcn/ui components
- **skill-creator** - Create effective skills
- **specialized-subagent-design** - Design AI subagents
- **speculative-ui-futures** - Spatial depth, AI-native, biological, crystalline, solarpunk ⭐ NEW
- **systematic-debugging** - Four-phase debugging
- **test-driven-development** - TDD workflow
- **theme-factory** - Artifact styling
- **trial-x-fire-content-automation** - Content pipeline automation
- **trialxfire-airtable-catalog** - Airtable catalog management
- **trialxfire-catalog-manager** - Unified catalog operations
- **trialxfire-content-distribution** - FAST channel distribution
- **trialxfire-r2-migration** - Vimeo-to-R2 migration
- **trialxfire-vimeo-airtable-sync** - Vimeo-Airtable sync
- **tubi-brand-marketing** - Tubi brand guidelines
- **tubi-metadata** - Tubi metadata creation
- **ui-design-system** - UI design system toolkit
- **video-encoding-pipeline** - FFmpeg encoding automation
- **view-transitions-api** - Native browser page transitions
- **vimeo-airtable-automation** - Vimeo-Airtable workflows
- **webapp-testing** - Web app testing with Playwright
- **web-asset-generator** - Favicon and meta image generation
- **web-design-archaeology** - Skeuomorphism, CRT, Flash-era, Swiss grid, CD-ROM ⭐ NEW
- **web-design-orchestrator** - Expert web design planning + style routing
- **website-backlinks** - Backlink architecture, schema markup, and SEO link equity ⭐ NEW
- **xlsx** - Spreadsheet creation and analysis

---

## 🎯 Workflow Templates

### Content Delivery Workflow
1. **Ingest:** trial-x-fire-content-automation
2. **Encode:** video-encoding-pipeline
3. **Catalog:** trialxfire-catalog-manager
4. **Metadata:** tubi-metadata
5. **Deliver:** trialxfire-content-distribution
6. **Transfer:** aspera-file-delivery-workflows

### Web Design Workflow

1. **Direction:** web-design-orchestrator (select style, define constraints)
2. **Motion Language:** motion-as-brand-identity (define spring tokens, timing)
3. **Component Layer:** shadcn-tailwind-builder / neobrutalism-design / glassmorphism-design
4. **Interaction Layer:** micro-interactions-animations / css-scroll-driven-animations
5. **Temporal Layer (optional):** web-design-archaeology + speculative-ui-futures (past × future synthesis)
6. **Adaptive Layer (optional):** ai-adaptive-ui (personalization, density, behavioral signals)
7. **Reward Layer (optional):** dopamine-design (streaks, XP, celebrations)

**Style Selection Guide:**
- Award-winning showcase → web-design-orchestrator → 3d-product-experiences + bold-expressive-typography
- Premium SaaS → ai-adaptive-ui + motion-as-brand-identity + shadcn-tailwind-builder
- Consumer habit app → dopamine-design + mobile-first-responsive + motion-as-brand-identity
- Developer tool → ai-adaptive-ui + modern-css-architecture + shadcn-tailwind-builder
- Temporal / experimental → web-design-archaeology + speculative-ui-futures

### OTT Platform Launch
1. **Design:** web-design-orchestrator
2. **Develop:** roku-brightscript-development / fire-tv-optimization
3. **Integrate:** film-plug-integration
4. **Deploy:** hetzner-cloud-deployment
5. **Certify:** ott-certification-checklist

### Content Migration
1. **Analyze:** trialxfire-catalog-manager
2. **Encode:** video-encoding-pipeline
3. **Migrate:** trialxfire-r2-migration
4. **Sync:** trialxfire-vimeo-airtable-sync
5. **Validate:** Check playback on all platforms

---

## 💡 Tips for Using Skills

### Combining Skills
```
"Use film-plug-feed-manager to generate a feed, then use ott-certification-checklist to validate it"

"Use video-encoding-pipeline to encode content, then use aspera-file-delivery-workflows to deliver it"
```

### Skill Discovery
```
"What skills do you have for [TASK TYPE]?"
"Show me skills related to Roku development"
"Which skill should I use for encoding videos?"
```

### Workflow Automation
```
"Create a workflow using multiple skills to [ACCOMPLISH GOAL]"
"Automate [PROCESS] using the appropriate skills"
```

---

## 📞 Getting Help

### Ask OpenClaw
```
"What's the best skill for [TASK]?"
"How do I use [SKILL NAME]?"
"Show me examples for [SKILL NAME]"
```

### Via Telegram
Message: @The_Operatorbot

### Via Dashboard
http://5.78.44.176

---

**🦞 OpenClaw is ready to assist with any workflow using these 182+ skills!**
