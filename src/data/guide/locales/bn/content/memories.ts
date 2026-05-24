export const content: Record<string, string> = {
  "how-agent-memory-works": `
## এজেন্ট মেমরি কীভাবে কাজ করে

আপনার এজেন্টরা অতীতের কাজ মনে রাখতে পারে এবং অভিজ্ঞতা থেকে শিখতে পারে। প্রতিবার একটি এজেন্ট চালানোর সময়, এটি দরকারী তথ্য সংরক্ষণ করতে পারে — facts, decisions, patterns, এবং শেখা পাঠ। এটিকে একটি নোটবুক হিসাবে ভাবুন যা আপনার এজেন্ট কাজ থেকে কাজে বহন করে, সময়ের সাথে সাথে জ্ঞান তৈরি করে।

এর মানে হল আপনার এজেন্টরা যত বেশি ব্যবহার করেন তত স্মার্ট হয়। শত শত গ্রাহক জিজ্ঞাসা পরিচালনা করা একটি এজেন্টের সাধারণ সমস্যা, পছন্দসই সমাধান, এবং অতীতের সিদ্ধান্ত সম্পর্কে context থাকবে যা একটি একদম নতুন এজেন্ট জানতে পারবে না।

### মূল পয়েন্ট

- এজেন্টরা তারা সম্পন্ন প্রতিটি কাজ থেকে **স্বয়ংক্রিয়ভাবে শেখে**
- Memories **রানের মধ্যে** স্থায়ী থাকে — আপনার এজেন্ট পূর্ববর্তী কাজ মনে রাখে
- প্রতিটি memory গুরুত্ব দ্বারা **categorized এবং ranked**
- আপনি যেকোনো সময় যেকোনো memory **review, edit, বা delete** করতে পারেন

### এটি কীভাবে কাজ করে

একটি রান চলাকালীন, যদি এজেন্ট মনে রাখার মতো কিছু সম্মুখীন হয় — একটি দরকারী fact, একটি গুরুত্বপূর্ণ decision, বা একটি শেখা পাঠ — এটি একটি memory entry তৈরি করে। পরের বার এজেন্ট চালানোর সময়, এটি ভাল সিদ্ধান্ত নিতে প্রাসঙ্গিক memories স্মরণ করতে পারে। আপনার এজেন্ট কী মনে রাখে তা পর্যালোচনা এবং পরিচালনা করার সম্পূর্ণ নিয়ন্ত্রণ আপনার আছে।

:::tip
Memory সবচেয়ে ভাল কাজ করে যখন এজেন্টদের ধারাবাহিক, ফোকাসড কাজ থাকে। একটি এজেন্ট যা সর্বদা expense reports পরিচালনা করে তা প্রতিবার একটি ভিন্ন কাজ করা একটি এজেন্টের চেয়ে বেশি দরকারী memories তৈরি করবে।
:::
  `,

  "memory-categories": `
## মেমরি বিভাগ

Memories পাঁচটি বিভাগে সংগঠিত, প্রতিটি একটি ভিন্ন উদ্দেশ্য পরিবেশন করে। এই গঠন আপনার এজেন্টকে সঠিক সময়ে সঠিক ধরনের জ্ঞান স্মরণ করতে সাহায্য করে — একটি reference book-এর অধ্যায়ের মতো।

এই বিভাগগুলি বোঝা আপনাকে আপনার এজেন্টের জ্ঞান আরও কার্যকরভাবে পর্যালোচনা এবং পরিচালনা করতে সাহায্য করে। প্রতিটি বিভাগ আপনাকে শুধু এজেন্ট *কী* জানে তাই বলে না, বরং এটি *কী ধরনের* জ্ঞান।

### পাঁচটি বিভাগ

:::compare
**Fact**
কাজ থেকে শেখা concrete information। উদাহরণ: "The client prefers formal language." আপনার এজেন্ট যে জ্ঞানের সরল টুকরো গ্রহণ করে।
---
**Decision**
নেওয়া পছন্দ এবং পিছনের যুক্তি। উদাহরণ: "Chose Express shipping because the order was urgent." কেন রেকর্ড করে, শুধু কী নয়।
---
**Insight**
একাধিক রানে আবিষ্কৃত প্যাটার্ন। উদাহরণ: "Support tickets spike every Monday morning." সময়ের সাথে স্মার্ট হয়।
---
**Learning**
ভুল বা সাফল্য থেকে পাঠ। উদাহরণ: "Shorter subject lines get higher open rates." action-এ ক্রমাগত উন্নতি।
---
**Warning**
সতর্ক থাকার সমস্যা। উদাহরণ: "Never send invoices before contract is signed." আপনার এজেন্টকে অতীতের ভুল পুনরাবৃত্তি থেকে বিরত রাখে।
:::

### এটি কীভাবে কাজ করে

যখন একটি এজেন্ট একটি memory তৈরি করে, এটি content-এর উপর ভিত্তি করে স্বয়ংক্রিয়ভাবে categorizes করে। Facts হল straightforward তথ্যের টুকরো। Decisions reasoning সহ choices রেকর্ড করে। Insights patterns ক্যাপচার করে। Learnings outcomes-এর উপর reflecting থেকে আসে। Warnings এড়াতে জিনিস ফ্ল্যাগ করে।

:::tip
আপনার review-এর সময় Warnings বিভাগে বিশেষ মনোযোগ দিন। এই memories আপনার এজেন্টকে অতীতের ভুল পুনরাবৃত্তি এড়াতে সাহায্য করে — সেগুলি প্রায়ই সবচেয়ে মূল্যবান।
:::
  `,

  "importance-levels": `
## গুরুত্বের স্তর

প্রতিটি memory-র 1 থেকে 5 পর্যন্ত একটি importance score আছে। 1-এর একটি score মানে এটি routine information, যখন 5 মানে এটি critical। গুরুত্বপূর্ণ memories আরও প্রায়ই স্মরণ করা হয়, দীর্ঘ থাকে, এবং এজেন্ট সিদ্ধান্ত নেওয়ার সময় আরও weight দেওয়া হয় — ঠিক যেমন আপনি গত মঙ্গলবার দুপুরে কী খেয়েছিলেন তার চেয়ে বড় life events ভালভাবে মনে রাখেন।

এই ranking সিস্টেম আপনার এজেন্টকে সবচেয়ে গুরুত্বপূর্ণ যা তাতে ফোকাসড রাখে, trivial details-এ ডুবে যাওয়ার পরিবর্তে।

### Scale

| Level | Label | Recall Priority | Description |
|-------|-------|-----------------|-------------|
| 1 | Routine | Low | Minor details যা মাঝে মাঝে দরকারী হতে পারে |
| 2 | Useful | Moderate | Helpful context যা understanding সমৃদ্ধ করে |
| 3 | Important | Standard | জ্ঞান যা নিয়মিত decisions প্রভাবিত করে |
| 4 | Very Important | High | Key information যা এজেন্টের প্রায় সর্বদা বিবেচনা করা উচিত |
| 5 | Critical | Always | অপরিহার্য জ্ঞান যা কখনই ভুলে যাওয়া বা উপেক্ষা করা উচিত নয় |

### এটি কীভাবে কাজ করে

Importance স্বয়ংক্রিয়ভাবে assigned হয় যখন একটি memory তৈরি হয়, factors যেমন information কতবার referenced হয় এবং এটি outcomes কতটা প্রভাবিত করেছে তার উপর ভিত্তি করে। আপনি স্বয়ংক্রিয় assignment-এর সাথে assignment করলেও manually importance levels adjust করতে পারেন।

:::tip
যদি একটি এজেন্ট একই ভুল করতে থাকে, চেক করুন প্রাসঙ্গিক memory বিদ্যমান কিনা এবং এর importance level যথেষ্ট উচ্চ কিনা। এটিকে 4 বা 5-এ bumping করা নিশ্চিত করে এজেন্ট এতে মনোযোগ দেয়।
:::
  `,

  "searching-agent-memories": `
## এজেন্ট মেমরি অনুসন্ধান করা

আপনার এজেন্টরা জ্ঞান সঞ্চয় করার সাথে সাথে, তাদের memories অনুসন্ধান করতে পারা অপরিহার্য হয়ে ওঠে। একটি keyword বা phrase টাইপ করুন এবং আপনার সমস্ত এজেন্ট জুড়ে প্রতিটি সম্পর্কিত memory অবিলম্বে দেখুন। এটি আপনার email অনুসন্ধান করার মতো — দ্রুত, সহজ, এবং আপনি category, importance, বা date দ্বারা ফিল্টার করতে পারেন।

অনুসন্ধান আপনাকে আপনার এজেন্টরা কী জানে তা বুঝতে, তারা সঠিকভাবে শিখেছে কিনা যাচাই করতে, এবং নির্দিষ্ট তথ্য দ্রুত খুঁজে পেতে সাহায্য করে।

### মূল পয়েন্ট

- **Full-text অনুসন্ধান** — তারা ধারণ করে এমন যেকোনো keyword বা phrase দ্বারা memories খুঁজুন
- **category দ্বারা ফিল্টার করুন** — facts, decisions, insights, learnings, বা warnings-এ ফলাফল সংকীর্ণ করুন
- **importance দ্বারা ফিল্টার করুন** — শুধুমাত্র high-priority বা low-priority memories দেখান
- **Cross-agent অনুসন্ধান** — একবারে আপনার সমস্ত এজেন্ট জুড়ে অনুসন্ধান করুন বা একটিতে ফোকাস করুন

### এটি কীভাবে কাজ করে

\`Memories\` বিভাগটি খুলুন এবং অনুসন্ধান বারে আপনার অনুসন্ধান query টাইপ করুন। মিল text হাইলাইট সহ ফলাফল অবিলম্বে প্রদর্শিত হয়। category, importance level, date range, বা specific agent দ্বারা সংকীর্ণ করতে filter buttons ব্যবহার করুন। তার সমস্ত context সহ সম্পূর্ণ memory দেখতে যেকোনো ফলাফলে ক্লিক করুন।

:::tip
একটি manual memory তৈরি করার আগে একটি topic অনুসন্ধান করুন। আপনার এজেন্ট ইতিমধ্যেই জানতে পারে আপনি যা শেখাতে চলেছেন — সেই ক্ষেত্রে, আপনি সহজভাবে বিদ্যমান memory আপডেট করতে পারেন।
:::
  `,

  "creating-memories-manually": `
## ম্যানুয়ালি মেমরি তৈরি করা

কখনও কখনও আপনি চান আপনার এজেন্ট নিজে থেকে শেখার আগে কিছু জানুক — দিন এক-এ একজন নতুন কর্মচারীকে briefing-এর মতো। Manual memories আপনাকে সরাসরি আপনার এজেন্টদের নির্দিষ্ট facts, preferences, বা rules শেখাতে দেয়, তাদের অভিজ্ঞতার মাধ্যমে আবিষ্কার করতে হবে এমন জ্ঞানে head start দেয়।

এটি বিশেষত company-specific information, ব্যক্তিগত preferences, বা critical rules-এর জন্য দরকারী যা trial and error-এর মাধ্যমে শেখা উচিত নয়।

:::steps
1. **Memories বিভাগটি খুলুন** — সাইডবারে \`Memories\` ক্লিক করুন এবং তারপর \`Add Memory\`
2. **category বাছুন** — fact, decision, insight, learning, বা warning নির্বাচন করুন
3. **memory content লিখুন** — সহজ ভাষায় জ্ঞান বর্ণনা করুন
4. **importance level সেট করুন** — 1 (routine) থেকে 5 (critical) পর্যন্ত একটি score assign করুন
5. **একটি এজেন্ট assign করুন** — একটি specific agent বাছুন বা memory সমস্ত এজেন্টদের জন্য উপলব্ধ করুন
:::

### এটি কীভাবে কাজ করে

আপনি যে memory তৈরি করেন তা একটি স্বয়ংক্রিয়ভাবে শেখা memory-র মতো এজেন্টের knowledge base-এ যোগ করা হয়। পরের বার এজেন্ট চালানোর সময়, এটি নিজে থেকে শেখা সবকিছুর পাশাপাশি এই information access করতে পারে। Manual memories একটি ছোট icon দিয়ে চিহ্নিত করা হয় যাতে আপনি সেগুলিকে স্বয়ংক্রিয় থেকে আলাদা করতে পারেন।

:::tip
একটি এজেন্ট live যাওয়ার আগে আপনার সবচেয়ে critical rules-এর জন্য কয়েকটি "Warning" memories তৈরি করুন। উদাহরণস্বরূপ: "Never share pricing information without manager approval."
:::
  `,

  "memory-tiers-explained": `
## মেমরি টিয়ার ব্যাখ্যা

সব memories সমানভাবে তৈরি হয় না, এবং সেগুলির সবগুলি অবিলম্বে accessible হওয়ার প্রয়োজন নেই। Personas memories-কে চারটি tiers-এ সংগঠিত করে কতবার ব্যবহৃত হয় এবং কতটা গুরুত্বপূর্ণ তার উপর ভিত্তি করে। একটি filing system-এর মতো ভাবুন: সবচেয়ে বেশি ব্যবহৃত items আপনার ডেস্কে থাকে, কম ব্যবহৃত drawer-এ যায়, এবং বিরল প্রয়োজনীয়গুলি একটি cabinet-এ ফাইল করা হয়।

এই tiered system আপনার এজেন্টকে দ্রুত এবং efficient রাখে। এটি প্রয়োজনে এখনও পুরানো জ্ঞানে access থাকা সত্ত্বেও সবচেয়ে প্রাসঙ্গিক memories তাৎক্ষণিকভাবে স্মরণ করে।

### চারটি Tiers

:::diagram
[Working (session)] --> [Active (frequent)] --> [Core (pinned)]
:::

:::compare
**Core**
সর্বদা loaded। স্থায়ী critical rules এবং facts। Manually pinned এবং কখনই demoted নয়। আপনার এজেন্টের সবচেয়ে গুরুত্বপূর্ণ জ্ঞান।
---
**Active**
Recall-এ Loaded। ঘন ঘন accessed সাম্প্রতিক memories। ব্যবহারের ফ্রিকোয়েন্সি দ্বারা auto-promoted। দরকারী context-এর "desk drawer"।
---
**Working**
Session-scoped। বর্তমান কাজ বা সাম্প্রতিক sessions থেকে memories। execution-এর সময় তৈরি এবং সময়ের সাথে Active-এ বয়স হয়।
---
**Archive**
শুধুমাত্র On-demand। সাম্প্রতিক accessed না হওয়া পুরানো memories। inactivity পরে auto-demoted কিন্তু অনির্দিষ্টকালের জন্য সংরক্ষিত। কিছুই হারিয়ে যায় না।
:::

### এটি কীভাবে কাজ করে

Memories ব্যবহারের প্যাটার্নের উপর ভিত্তি করে স্বয়ংক্রিয়ভাবে tiers-এর মধ্যে চলে। একটি ঘন ঘন স্মরণ করা memory একটি উচ্চ tier-এ promoted হয়; একটি যা কিছুক্ষণ accessed হয়নি তা ধীরে ধীরে archive-এর দিকে যায়। আপনি Core tier-এ memories manually pin করতে পারেন যাতে নিশ্চিত হয় যে সেগুলি আপনার এজেন্টের জন্য সর্বদা top-of-mind।

:::tip
Core tier-এ আপনার সবচেয়ে গুরুত্বপূর্ণ rules এবং facts pin করুন। এটি গ্যারান্টি দেয় আপনার এজেন্ট সর্বদা সেগুলিকে বিবেচনা করে, সেগুলি কত পুরানো তা নির্বিশেষে।
:::
  `,

  "memory-and-execution": `
## মেমরি এবং এক্সিকিউশন

যখন আপনার এজেন্ট একটি নতুন কাজ শুরু করে, এটি একটি blank slate দিয়ে শুরু হয় না। এটি স্বয়ংক্রিয়ভাবে পূর্ববর্তী রান থেকে প্রাসঙ্গিক memories স্মরণ করে, বর্তমান execution-এ context, preferences, এবং শেখা পাঠ আনে। এটি প্রতিটি রানকে শেষেরটির চেয়ে আরও informed করে তোলে।

Recall প্রক্রিয়া স্মার্ট — এটি একবারে প্রতিটি memory dump করে না। পরিবর্তে, এটি বর্তমান কাজের জন্য সবচেয়ে প্রাসঙ্গিকগুলি নির্বাচন করে, ঠিক যেমন একটি familiar situation-এর মুখোমুখি হলে আপনি স্বাভাবিকভাবে সম্পর্কিত অভিজ্ঞতা স্মরণ করেন।

### মূল পয়েন্ট

- **Automatic recall** — প্রতিটি execution-এর আগে প্রাসঙ্গিক memories loaded হয়
- **Context-aware** — শুধুমাত্র বর্তমান কাজের সাথে সম্পর্কিত memories recalled হয়
- **importance দ্বারা Weighted** — উচ্চ-importance memories স্মরণ করার সম্ভাবনা বেশি
- **Memory creation** — outcomes-এর উপর ভিত্তি করে execution-এর সময় নতুন memories তৈরি হতে পারে

### এটি কীভাবে কাজ করে

আপনার এজেন্ট তার কাজ প্রক্রিয়া করার আগে, memory system task-এর content এবং context-এর উপর ভিত্তি করে প্রাসঙ্গিক entries-এর জন্য scans করে। এই memories আপনার নির্দেশাবলীর পাশাপাশি AI মডেলকে প্রদান করা হয়। কাজ সম্পূর্ণ হওয়ার পরে, এজেন্ট মূল্যায়ন করে নতুন কিছু শেখা হয়েছে কিনা এবং সেই অনুযায়ী memories তৈরি করে।

:::tip
যদি একটি এজেন্ট তার memories কার্যকরভাবে ব্যবহার করছে না, চেক করুন memories সঠিকভাবে categorized এবং scored কিনা। ভালভাবে-organized memories আরও নির্ভরযোগ্যভাবে recalled হয়।
:::
  `,

  "reviewing-and-cleaning-memories": `
## মেমরি পর্যালোচনা এবং পরিষ্কার করা

সময়ের সাথে সাথে, কিছু memories outdated, incorrect, বা redundant হয়ে যায়। নিয়মিত reviews আপনার এজেন্টের knowledge base সঠিক এবং up to date রাখে। আপনার এজেন্টের brain-এর জন্য spring cleaning হিসাবে এটিকে ভাবুন — পুরানো information clearing out করা যাতে আপনার এজেন্ট বর্তমান, সঠিক জ্ঞানের উপর ভিত্তি করে decisions নেয়।

একটি clean memory base আরও ভাল agent performance-এর দিকে নিয়ে যায়। outdated information-এর উপর নির্ভর করা একটি এজেন্ট কেন তা realizing না করেই খারাপ decisions নিতে পারে।

### মূল পয়েন্ট

- sorting এবং filtering options সহ **সমস্ত memories Browse করুন**
- inaccuracies সংশোধন বা outdated information আপডেট করতে যেকোনো memory **Edit করুন**
- আর প্রাসঙ্গিক নয় এমন memories **Delete করুন**
- duplicate বা অনুরূপ memories একটি স্পষ্ট entry-তে **Merge করুন**

### এটি কীভাবে কাজ করে

\`Memories\` বিভাগটি খুলুন এবং আপনার এজেন্টের memory তালিকা browse করুন। আপনার review ফোকাস করতে date, importance, বা category দ্বারা sort করুন। এর content edit, এর importance level পরিবর্তন, বা delete করতে যেকোনো memory-তে ক্লিক করুন। সিস্টেম potential duplicates-ও suggest করে যা merged হতে পারে।

:::tip
আপনার সবচেয়ে সক্রিয় এজেন্টদের memories-এর একটি monthly review schedule করুন। 15 মিনিটের cleanup-ও একটি এজেন্টের decision-making quality লক্ষণীয়ভাবে উন্নত করতে পারে।
:::
  `,

  "exporting-and-importing-memories": `
## মেমরি রপ্তানি এবং আমদানি

আপনি আপনার এজেন্টের সম্পূর্ণ memory base একটি file-এ export করতে পারেন — backups, এজেন্টদের মধ্যে জ্ঞান শেয়ার, বা একটি নতুন কম্পিউটারে যাওয়ার জন্য নিখুঁত। Importing একটি পূর্বে exported file load করে এবং সেই memories target agent-এর knowledge base-এ যোগ করে।

এই বৈশিষ্ট্যটি একটি নতুন এজেন্টকে অন্যের অভিজ্ঞতার সুবিধা দেওয়ার জন্যও দুর্দান্ত। আপনার অভিজ্ঞ এজেন্ট থেকে export করুন, নতুনটিতে import করুন, এবং এটি একটি blank slate-এর পরিবর্তে জ্ঞানের সম্পদ দিয়ে শুরু হয়।

### মূল পয়েন্ট

- **file-এ Export** — একটি portable file হিসাবে সমস্ত memories সংরক্ষণ করুন যা আপনি store বা share করতে পারেন
- **file থেকে Import** — যেকোনো ডিভাইসে যেকোনো এজেন্টে memories load করুন
- **Selective export** — export করতে specific categories বা importance levels বাছুন
- **Conflict handling** — import-এর সময় duplicates সনাক্ত এবং merged হয়

### এটি কীভাবে কাজ করে

একটি এজেন্টের memory settings খুলুন এবং \`Export\` ক্লিক করুন। কোন memories অন্তর্ভুক্ত করতে হবে তা বাছুন (সব, বা category/importance দ্বারা filtered) এবং file সংরক্ষণ করুন। Import করতে, target agent-এর memory settings খুলুন, \`Import\` ক্লিক করুন, এবং আপনার file নির্বাচন করুন। Personas duplicates সনাক্ত করে এবং সেগুলিকে কীভাবে পরিচালনা করবেন তা সিদ্ধান্ত নিতে দেয়।

:::tip
একটি এজেন্টের prompt-এ একটি বড় পরিবর্তনের আগে, একটি backup হিসাবে এর memories export করুন। যদি নতুন prompt confusion তৈরি করে, আপনি মূল memories পুনরুদ্ধার করতে পারেন।
:::
  `,

  "memory-best-practices": `
## মেমরি সেরা অনুশীলন

agent memory থেকে সর্বাধিক পাওয়া কয়েকটি মূল অভ্যাসে নেমে আসে। একজন ছাত্রের জন্য ভাল study habits-এর মতো, আপনি কীভাবে memories গঠন এবং বজায় রাখেন তা আপনার এজেন্টরা কতটা কার্যকরভাবে information শিখে এবং স্মরণ করে তাতে একটি বড় পার্থক্য তৈরি করে।

clutter accumulating করার পরিবর্তে সময়ের সাথে সাথে genuinely উন্নতি করে এমন এজেন্ট তৈরি করতে এই guidelines অনুসরণ করুন।

### Best Practices

- **এজেন্টদের focused রাখুন** — একটি consistent task সহ একটি এজেন্ট একটি generalist-এর চেয়ে বেশি দরকারী memories তৈরি করে
- **নিয়মিত review করুন** — মাসিক memories চেক করুন এবং outdated বা ভুল entries সরান
- **critical rules-এর জন্য manual memories ব্যবহার করুন** — এজেন্টকে hard way-তে কিছু শিখতে অপেক্ষা করবেন না
- **উপযুক্ত importance levels সেট করুন** — সবকিছু critical নয়, এবং এটি ঠিক আছে
- Core tier-এ **essential knowledge Pin করুন** যাতে এটি সর্বদা উপলব্ধ থাকে

### এটি কীভাবে কাজ করে

ভাল memory management একটি ongoing practice, একটি one-time setup নয়। আপনার সবচেয়ে গুরুত্বপূর্ণ rules-এর জন্য কয়েকটি manual memories তৈরি করে শুরু করুন। এজেন্টকে এর রান থেকে স্বাভাবিকভাবে শিখতে দিন। ভুল সংশোধন এবং outdated information সরাতে পর্যায়ক্রমে review করুন। কী গুরুত্বপূর্ণ তা সম্পর্কে আপনার বোঝা evolve হওয়ার সাথে সাথে importance levels adjust করুন।

:::tip
Memory management একটি বাগানের যত্নের মতো ভাবুন। নিয়মিত ছোট প্রচেষ্টা — pruning, watering, replanting — মাঝে মাঝে বড় overhauls-এর চেয়ে অনেক ভাল ফলাফল তৈরি করে।
:::
  `,
};
