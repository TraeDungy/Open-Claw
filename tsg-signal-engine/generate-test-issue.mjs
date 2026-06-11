import { writeFileSync } from "fs";
process.env.SITE_URL = "http://5.78.227.123/tsg";
const siteUrl = process.env.SITE_URL;

const { theSignal } = await import("./templates.mjs");

const issue = theSignal({
  issueNum: "007",
  date: "June 10, 2026",
  preheader: "The CIA spent 23 years on psychic spies. Nobody talks about it. Until now.",

  briefing: `Look \u2014 I wasn\u2019t going to write about Project Stargate this week. But a reader in Virginia sent me a document reference I\u2019d never seen, and it changes the timeline. The document is from 1984, references an operation that isn\u2019t in any public index, and was declassified by accident as part of a bulk release in 2017. I\u2019ve been reading it for three days. Stay with me.`,

  mainHeadline: "NAH, FOR REAL \u2014 THE CIA HAD PSYCHIC SPIES FOR 23 YEARS AND Y'ALL STILL SLEEPING ON IT",
  mainBody: `<img src="${siteUrl}/posters/cinematic-05-control-tapes.png" alt="Classified desk" width="504" style="display:block;width:100%;max-width:504px;height:auto;border:1px solid rgba(245,227,179,0.04);margin:0 0 18px;"/>

In 1975, a physicist named Hal Puthoff walked into CIA headquarters with a proposal that should have gotten him laughed out of the building. He wanted the agency to fund research into whether human beings could perceive remote locations using nothing but their minds. The proposal was classified. The budget was approved. The program would run for twenty-three years.<br/><br/>

They called it remote viewing. The subjects \u2014 Ingo Swann, Pat Price, Joseph McMoneagle \u2014 sat in shielded rooms at Stanford Research Institute and described targets they had never seen. Soviet submarine bases. Chinese nuclear facilities. A downed bomber in the African jungle. Their accuracy rates exceeded chance by margins so wide that the statistics alone should have rewritten every neuroscience textbook on the shelf.<br/><br/>

Swann described the rings of Jupiter in 1973. Voyager 1 didn\u2019t confirm they existed until 1979. Six years. That\u2019s not a coincidence you can hand-wave away. That\u2019s a six-year lead on NASA\u2019s best technology, achieved by a man sitting in a chair with his eyes closed.<br/><br/>

The program wasn\u2019t shut down because it failed. The 1995 AIR review concluded that results were <em>\u201Cstatistically significant\u201D</em> but the intelligence value was <em>\u201Cambiguous.\u201D</em> Read that sentence again. They proved it works. They just couldn\u2019t explain it. And when you can\u2019t explain something to a congressional budget committee, you classify it and walk away.`,

  mainDocExcerpt: "Subject demonstrated ability to perceive and describe architectural details of target site with accuracy exceeding statistical expectation (p < 0.001). Perceptual data correlated with satellite imagery obtained 72 hours post-session. Recommend continued funding at current levels. Classification: SECRET/NOFORN.",
  mainDocId: "CIA-RDP96-00788R001700210016-5 (Declassified 2003)",
  mainGrade: "A",
  mainBottomLine: `The U.S. government spent $20 million and 23 years studying psychic phenomena. When they shut the program down, they didn\u2019t say it didn\u2019t work \u2014 they said the results were \u201Cambiguous.\u201D Every one of the 89,000 pages is available through the CIA\u2019s own FOIA reading room. Go read them. Then ask yourself why nobody on the news ever told you about this.`,

  stats: [
    { value: "$20M", label: "Total CIA budget for Project Stargate (1975\u20131995)" },
    { value: "89,000", label: "Declassified pages in the FOIA archive" },
    { value: "23 yrs", label: "Duration of continuous government-funded psi research" },
    { value: "p < .001", label: "Statistical significance of remote viewing results" },
    { value: "0", label: "Official public explanations from the CIA to this day" },
  ],

  articles: [
    {
      title: "U.S. Army Gateway Process \u2014 The Report That Should Not Exist",
      summary: "The Army wrote a formal intelligence assessment concluding that human consciousness can access dimensions beyond spacetime. 29 pages. Classification stamps. Diagrams. Page 25 is where everything changes.",
      tag: "DECLASSIFIED",
      url: "https://www.cia.gov/readingroom/docs/CIA-RDP96-00788R001700210016-5.pdf",
      grade: "A",
      imageUrl: siteUrl + "/posters/cinematic-03-frequency-room.png",
    },
    {
      title: "7.83 Hz \u2014 The Schumann Resonance",
      summary: "The Earth has a heartbeat. It pulses at 7.83 Hz. The same frequency the Gateway Process uses as its baseline. Every binaural beat practitioner in the world is trying to sync with it.",
      tag: "FREQUENCY",
      grade: "B+",
    },
    {
      title: "MKUltra \u2014 The 150,000 Pages They Burned",
      summary: "20,000 pages survived the 1973 shredding order. Subprojects 59 and 136 focused on ESP. The rest \u2014 an estimated 150,000 pages \u2014 were destroyed by CIA Director Richard Helms.",
      tag: "DECLASSIFIED",
      grade: "A",
    },
    {
      title: "PURSUE Release 02 \u2014 The Lake Huron F-16 Footage",
      summary: "222 new files dropped May 22, 2026. First publicly released footage of the February 2023 Lake Huron shootdown. The Pentagon is running out of ways to say they don\u2019t know what this is.",
      tag: "DISCLOSURE",
      url: "https://war.gov/UFO",
      grade: "A+",
    },
  ],

  profile: {
    sectionTitle: "SUBJECT FILE",
    name: "Ingo Swann",
    era: "1933\u20132013",
    origin: "Telluride, CO \u2192 New York, NY",
    bio: `Co-creator of Coordinate Remote Viewing (CRV). Described Jupiter\u2019s rings six years before Voyager 1 confirmed their existence. Participated in hundreds of controlled experiments at Stanford Research Institute from 1972 to 1985. Drew the floor plan of a Soviet submarine base from a chair in Menlo Park. Published 13 books. Never backed down from a single claim. The CIA\u2019s own documents confirm his results.`,
    pullQuote: "Everyone has the ability. The difference is that most people have been trained not to notice.",
  },

  signalTitle: "AARO Gets Expanded Authority to Investigate \u201CNon-Human Intelligence\u201D",
  signalBody: `The All-domain Anomaly Resolution Office received congressional authorization to investigate \u201Ctransmedium\u201D objects. The authorization bill explicitly uses the phrase \u201Cnon-human intelligence.\u201D That phrase is now codified in federal law. CNN did not cover it. Fox did not cover it. The New York Times mentioned it on page 14.`,
  signalUrl: "https://www.congress.gov",

  lastWeek: `Last week we said the PURSUE Release 02 would contain video footage the Pentagon had never publicly acknowledged. <span style="color:#00FFB3;font-weight:700;">\u25B2 HIT.</span> The Lake Huron F-16 footage was included. We also predicted Congress would subpoena David Grusch before July. <span style="color:#FF2A1F;font-weight:700;">\u25BC MISS.</span> No subpoena issued yet. We\u2019re watching.`,

  fieldReport: `A reader in Atlanta wrote: \u201CI\u2019ve been doing the Zener tool daily for 3 weeks. Started at 18%. Last week I hit 34% three sessions in a row. I screenshot every session. I don\u2019t know what to do with this information but I\u2019m not stopping.\u201D \u2014 We don\u2019t know either. But we\u2019re documenting everything. If you\u2019re tracking your numbers, send them. We\u2019re building a dataset.`,

  rabbitTeaser: `If you have 45 minutes and nerves that don\u2019t flinch, read the U.S. Army\u2019s 1983 report. It\u2019s called \u201CAnalysis and Assessment of Gateway Process.\u201D Lt. Col. Wayne McDonnell concluded that human consciousness can access dimensions beyond spacetime. He put it in a government document. With diagrams. Page 25 is where the floor drops out.`,
  rabbitUrl: "https://www.cia.gov/readingroom/docs/CIA-RDP96-00788R001700210016-5.pdf",

  deadDrop: {
    text: "The dead drop is not empty this week. There is a signal hidden in this issue \u2014 a dot, barely visible, that leads somewhere most search engines have never indexed. The document behind it was declassified in a bulk release and has been viewed fewer than 200 times. If you find it, you will understand why we built this newsletter.",
    hiddenUrl: "https://www.cia.gov/readingroom/docs/CIA-RDP96-00789R003800110001-8.pdf",
    coordinates: "REF: 38.9072\u00B0 N, 77.0369\u00B0 W \u2014 SIGNAL ORIGIN: LANGLEY",
  },

  closerQuote: "Reality is more responsive than most people realize. You just have to learn how to ask.",
});

writeFileSync("/tmp/tsg-ultimate.html", issue.html);
console.log("THE SIGNAL #007 \u2014 Ultimate Premium Issue");
console.log("Size:", (issue.html.length / 1024).toFixed(1) + " KB (Gmail safe: " + (issue.html.length < 102400 ? "YES" : "NO") + ")");
console.log("Subject:", issue.subject);
