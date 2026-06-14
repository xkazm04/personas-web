export const content: Record<string, string> = {
  "the-monitoring-dashboard": `
## মনিটরিং ড্যাশবোর্ড

Overview পৃষ্ঠা আপনার এজেন্টদের জুড়ে ঘটে যাওয়া সবকিছুর জন্য আপনার command center। Dashboard ট্যাব ডিফল্টভাবে খোলে এবং KpiTiles-এর একটি গ্রিড দেখায় — প্রতি মেট্রিকে একটি টাইল (success rate, total runs, total cost, average duration, active agents, failures-today, ইত্যাদি)। প্রতিটি টাইলের তিনটি density modes (compact / standard / detail) রয়েছে যা আপনি টাইলে ক্লিক করে স্যুইচ করেন; যখন আপনি একটি দ্রুত সংখ্যা বনাম যখন আপনি trend chart এবং breakdown চান তখন দরকারী।

KpiTiles-এর নীচে, Overview লাইভ কার্যকলাপ, সাম্প্রতিক ব্যর্থতা এবং আপনি সাবস্ক্রাইব করেছেন এমন বিজ্ঞপ্তিগুলি সারফেস করে। এই পৃষ্ঠার সবকিছু এজেন্ট দ্বারা, group দ্বারা এবং time range দ্বারা ফিল্টারযোগ্য — একই filter set প্রতিটি প্যানেল জুড়ে প্রযোজ্য তাই আপনি এক ক্লিকে পুরো dashboard-কে "এই সপ্তাহে, শুধু আমার Marketing এজেন্ট"-এ scope করতে পারেন।

| Panel | এটি কী দেখায় |
|---------|--------------|
| **KpiTiles** | Success rate, runs, cost, duration, failure count, active agents — প্রতিটি তিনটি density স্তরে |
| **Activity feed** | সমস্ত এজেন্ট জুড়ে executions-এর লাইভ স্ট্রিম, স্ক্রোলযোগ্য, অনুসন্ধানযোগ্য, বিশদের জন্য ক্লিক করুন |
| **Notifications** | অপরাধী রানে click-through সহ সাবস্ক্রাইব করা alerts (failures, budget caps, manual review, anomalies) |
| **Health snapshot** | Per-agent স্বাস্থ্য রোল-আপ — হলুদ বা লাল কিছুর জন্য দ্রুত স্ক্যান |

### এটি কীভাবে কাজ করে

Overview পৃষ্ঠা অ্যাপের বাকি অংশ যে একই execution এবং event store ব্যবহার করে তা থেকে পড়ে, তাই আপনি যা দেখেন তা সর্বদা live state। Filters এবং density preferences সেশন জুড়ে স্থায়ী হয়; আপনি একবার সেট করেন এবং dashboard মনে রাখে। per-agent breakdown-এ drill করতে যেকোনো KpiTile-এ ক্লিক করুন, execution detail modal খুলতে যেকোনো activity row-এ ক্লিক করুন।

:::tip
title-bar notification bell অ্যাপের যেকোনো জায়গা থেকে সবচেয়ে নতুন execution detail-এর একটি one-click শর্টকাট। আপনাকে রুটিন "কী এইমাত্র ঘটেছে?" চেকের জন্য ম্যানুয়ালি Overview-তে নেভিগেট করতে হবে না।
:::
  `,

  "execution-logs": `
## এক্সিকিউশন লগ

প্রতিটি agent run একটি execution log তৈরি করে: trigger payload, model-এ পাঠানো রেন্ডার করা prompt, model response, প্রতিটি tool call (arguments এবং result সহ), চূড়ান্ত output, duration, cost, এবং যেকোনো errors। Logs immutable — সেগুলি একবার লেখা হয় এবং অনির্দিষ্টকালের জন্য সংরক্ষিত হয়। Activity ট্যাব (editor-এ per-agent, বা Overview-তে global) হল entry point।

প্রতিটি log entry তালিকায় একটি one-line সারসংক্ষেপ; ক্লিক করা উপরের সমস্ত fields সহ full detail modal খোলে। সেখান থেকে আপনি যেকোনো ফিল্ড কপি করতে পারেন, একই input দিয়ে run replay করতে পারেন, বা step-by-step debugging-এর জন্য সম্পর্কিত trace view-এ যেতে পারেন।

### মূল পয়েন্ট

- **সম্পূর্ণ ক্যাপচার** — input, prompt, response, tool calls (parameters এবং results সহ), output, duration, cost, errors
- **Immutable history** — run সম্পূর্ণ হওয়ার পরে logs কখনও পরিবর্তিত হয় না; যদি এজেন্টের prompt পরে edited হয়, পুরানো রানগুলি সেই সময়ে যা পাঠানো হয়েছিল তা এখনও দেখায়
- **যেকোনো run থেকে Replay** — মূল input দিয়ে এজেন্ট পুনরায় চালায়; পূর্বে-ব্যর্থ payload-এ একটি fix যাচাই করার জন্য দরকারী
- **trigger দ্বারা Tagged** — \`manual\`, \`schedule\`, \`webhook\`, \`chain\`, ইত্যাদি, তাই আপনি source দ্বারা activity ফিল্টার করতে পারেন
- **Manual-review marker** — যে রানগুলি এজেন্ট নিজেই পর্যালোচনার জন্য ফ্ল্যাগ করেছে (\`manual_review\` directive-এর মাধ্যমে) একটি badge পায় তাই আপনি সেগুলি দ্রুত খুঁজে পেতে পারেন

### এটি কীভাবে কাজ করে

execution store হল local SQLite, transactionally লেখা হয় run progresses হিসাবে। detail modal-এর ভিতরে trace ট্যাব প্রতিটি ধাপকে এর sub-events-এ প্রসারিত করে (model token stream, tool call dispatched, tool result received, decision branch taken)। date range, agent, trigger type, status, business_outcome দ্বারা ফিল্টার করুন, বা input/output-এ full-text।

:::tip
যখন একটি এজেন্ট অপ্রত্যাশিত output তৈরি করে, trace ট্যাব — output নয় — যেখানে উত্তর থাকে। ভুল ডেটা ফিরিয়ে দেওয়া tool call খুঁজুন, বা ভুল পথে branch করা model decision। output হল লক্ষণ; trace হল কারণ।
:::
  `,

  "real-time-activity-feed": `
## রিয়েল-টাইম কার্যকলাপ ফিড

activity feed আপনাকে দেখায় আপনার সমস্ত এজেন্ট জুড়ে এখন কী ঘটছে। প্রতিটি এজেন্ট তার কাজ প্রক্রিয়া করার সাথে সাথে, updates রিয়েল টাইমে প্রদর্শিত হয় — এটি একটি লাইভ scoreboard দেখার মতো। আপনি refresh বা পৃথক এজেন্ট চেক না করে যে মুহূর্তে ঘটে সেগুলি ঘটে দেখেন।

এটি বিশেষভাবে দরকারী যখন আপনার অনেক এজেন্ট একসাথে চলছে বা যখন আপনি একটি critical automation এটি execute হওয়ার সময় দেখতে চান।

### মূল পয়েন্ট

- **Live updates** — ঘটনার সাথে সাথে agent activity দেখুন, কোনো refresh প্রয়োজন নেই
- **সমস্ত এজেন্ট** — একটি feed আপনার সেটআপে চলমান প্রতিটি এজেন্ট কভার করে
- **Timestamped entries** — প্রতিটি update ঠিক কখন ঘটেছে তা দেখায়
- **Status changes** — দেখুন এজেন্টরা কখন শুরু, শেষ, সফল বা ব্যর্থ হয় রিয়েল টাইমে

### এটি কীভাবে কাজ করে

monitoring dashboard বা sidebar থেকে activity feed খুলুন। আপনার এজেন্টরা কাজ করার সাথে সাথে Updates স্বয়ংক্রিয়ভাবে stream হয়। প্রতিটি entry agent name, action, timestamp, এবং result দেখায়। যেকোনো entry-তে — বা title bar-এ notification bell-এ — ক্লিক করুন সরাসরি Overview › Activity ট্যাবে full execution detail modal খুলতে, যেখানে আপনি trace, রেন্ডার করা prompt, input, output, এবং যেকোনো errors দেখতে পারেন। feed নিজেই scrollable এবং searchable।

:::tip
নতুন এজেন্ট পরীক্ষা করার সময় একটি side panel-এ activity feed খোলা রাখুন। লাইভ output দেখা আপনাকে অবিলম্বে issues সনাক্ত করতে এবং দ্রুত পুনরাবৃত্তি করতে সাহায্য করে। প্রতিদিনের ব্যবহারের জন্য, title-bar notification bell হল দ্রুততম পথ — এটি আপনাকে নেভিগেট না করেই সর্বদা সবচেয়ে নতুন execution detail খোলে।
:::
  `,

  "cost-tracking-per-agent": `
## প্রতি এজেন্ট খরচ ট্র্যাকিং

প্রতিটি AI provider প্রতি token charges করে, এবং Personas প্রতিটি রানকে সঠিক token count, model, এবং provider দিয়ে tag করে তাই per-agent cost সর্বদা পরিচিত। Overview → Usage প্রতিটি এজেন্টের একটি sortable তালিকা দেখায় নির্বাচিত time window-এ এর cost সহ — দিন, সপ্তাহ, মাস, বা custom range — plus trend arrows তাই আপনি এক নজরে দেখতে পারেন কোন এজেন্টদের costs বাড়ছে।

breakdown-এর জন্য যেকোনো row-এ drill করুন: cost-per-run distribution (median বনাম p95), cost by model যখন এজেন্টের failover কনফিগার করা থাকে, total tokens (input বনাম output), এবং সময়ের সাথে একটি trend chart। যদি একটি এজেন্টের cost বাড়ছে, এটিই প্রথম জায়গা যেখানে এটি সারফেস করে।

### মূল পয়েন্ট

- **Per-agent breakdown** — প্রতিটি রান এর agent-এ attributed
- **Filterable time windows** — আজ, এই সপ্তাহ, এই মাস, all time, বা custom range
- **Cost-per-run distribution** — median, p95, max; প্রকাশ করে যদি একটি ব্যয়বহুল outlier total dominate করছে
- **Token breakdown** — input বনাম output tokens তাই আপনি বলতে পারেন এজেন্ট অনেক পড়ছে নাকি অনেক তৈরি করছে
- **Trend arrows** — প্রতিটি এজেন্টের পাশে week-over-week পরিবর্তন দেখানো হয়, তাই cost regressions অবিলম্বে সারফেস

### এটি কীভাবে কাজ করে

cost meter একটি রান চলাকালীন tokens stream হওয়ার সাথে সাথে live tick করে। যখন run সম্পূর্ণ হয়, চূড়ান্ত cost finalized হয় এবং execution log-এর পাশাপাশি স্থায়ী হয়। Usage view এই store থেকে aggregates করে, তাই time-range filter পরিবর্তন করা শুধু একই data পুনরায় query করে — কোনো পৃথক "cost accounting" job চলছে না।

:::tip
যদি একটি একক এজেন্ট আপনার costs-এ dominate করে, per-run distribution total-এর চেয়ে বেশি দরকারী। একটি high median মানে prompt ধারাবাহিকভাবে ব্যয়বহুল (prompt size এবং tool-call count দেখুন)। স্বাভাবিক median সহ একটি high p95 মানে বিরল outliers (trace history-তে অস্বাভাবিক inputs দেখুন)।
:::
  `,

  "cost-tracking-per-model": `
## প্রতি মডেল খরচ ট্র্যাকিং

বিভিন্ন models-এর খুব ভিন্ন price points — Claude Haiku প্রতি token Opus-এর চেয়ে ~30× সস্তা, GPT-4o-mini GPT-4o-এর চেয়ে ~20× সস্তা, এবং local models প্রতি token মূলত কিছুই খরচ করে না (শুধু compute)। Overview → Usage-এ per-model view provider এবং model দ্বারা spending ভাঙে তাই আপনি দেখতে পারেন টাকা কোথায় যায় এবং spend value-এর সাথে মেলে কিনা।

:::feature
**Smart Optimization Hints** color=#34d399
সিস্টেম এমন রানগুলি tag করে যা মনে হয় অনুরূপ গুণমান সহ একটি সস্তা মডেলে চলতে পারত। যখন একটি high-cost মডেল একটি task pattern-এর জন্য ব্যবহৃত হয় যা সস্তা মডেল অন্য কোথাও ভালভাবে পরিচালনা করে, hint cost row-এর পাশে সারফেস করে — আপনাকে Lab-এ A-B করার জন্য candidate এজেন্টদের নির্দেশ করে।
:::

### মূল পয়েন্ট

- **By provider and model** — সঠিক model identifier দ্বারা cost বিভক্ত (Sonnet 4.6, Haiku 4.5, GPT-4o, Gemini 2.5 Pro, local-ollama)
- **Calls, tokens, cost** — একই data-এর তিনটি view; cost আপনি যা প্রদান করেন, tokens আপনি যা ব্যয় করেন, calls আপনি কতবার call করেন
- **Cost-per-call comparison** — models জুড়ে একই metric তাই আপনি like-for-like তুলনা করতে পারেন
- **Optimization hints** — candidate এজেন্টদের সারফেস করে যা downgraded হতে পারে; A-B test করতে Lab-এ ক্লিক করুন
- **Per-agent attribution** — কোন এজেন্টরা এটি সবচেয়ে বেশি ব্যবহার করছে তা দেখতে একটি model row-এ drill করুন

### এটি কীভাবে কাজ করে

Usage view per-agent view-এর মতো একই execution records group করে কিন্তু এর পরিবর্তে model dimension-এ। Pricing Settings → Engine-এ per-model কনফিগার করা হয়, প্রতিটি provider-এর public pricing-এর সাথে মিলে যাওয়া defaults সহ; আপনি override করতে পারেন যদি আপনার একটি negotiated rate থাকে বা একটি সস্তা endpoint-এ BYOI ব্যবহার করছেন।

:::tip
মাসে একবার, total cost দ্বারা sorted per-model view স্ক্যান করুন। শীর্ষ entry আপনার সঞ্চয়ের জন্য সবচেয়ে বড় সুযোগ — পরবর্তী সস্তা model-এর বিরুদ্ধে এটিকে Lab arena-তে ফেলে দিন এবং দেখুন গুণমান ধরে থাকে কিনা। বেশিরভাগ এজেন্ট একটি model downgrade ভাল সহ্য করে; যারা করে না তারাই যারা প্রকৃতপক্ষে spend-এর যোগ্য।
:::
  `,

  "success-rate-metrics": `
## সাফল্যের হার মেট্রিক্স

প্রতিটি রান একটি status সহ শেষ হয়: success, failure, বা manual-review। Success rate হল প্রত্যাশিত আচরণের একটি backdrop-এর বিরুদ্ধে সফলভাবে সম্পূর্ণ হওয়া রানের শতাংশ। Overview → Health ট্যাব এবং per-agent Activity ট্যাব উভয়ই trend indicator সহ success rate সারফেস করে — week-over-week পরিবর্তন — তাই আপনি এক নজরে দেখতে পারেন reliability ধরে আছে কিনা।

metric এখন pure success/failure-এর বাইরে যায়। **business_outcome** tracking-এর সাথে, agent নিজেই ঘোষণা করতে পারে একটি সফল রান আপনি আসলে যা চেয়েছিলেন তা তৈরি করেছে কিনা (একটি sale, একটি অনুমোদিত doc, একটি দরকারী সারসংক্ষেপ) — "did the run complete without errors"-এর থেকে একটি পৃথক signal। Success rate "completed cleanly" এবং "produced the desired business outcome"-এ বিভক্ত হয় — দ্বিতীয়টি বেশিরভাগ এজেন্টের জন্য বেশি দরকারী সংখ্যা।

### মূল পয়েন্ট

- trend arrow সহ **Per-agent success rate**
- **Business-outcome rate** — clean-completion rate থেকে আলাদা; এজেন্টের কাজ আসলে দরকারী ছিল কিনা ট্র্যাক করে
- **Per-trigger split** — একই এজেন্ট manual রানে 99% এ সফল হতে পারে কিন্তু scheduled রানে 70%; breakdown আপনাকে দেখায় কোন trigger source-এ সমস্যা আছে
- **Threshold alerts** — প্রতি এজেন্টে একটি threshold সেট করুন; rate এর নিচে নামলে আপনাকে notified করা হয়
- **Failure reason classification** — \`timeout\`, \`model_error\`, \`tool_error\`, \`credential_expired\`, ইত্যাদি, তাই আপনি দেখতে পারেন *কেন* রান ব্যর্থ হচ্ছে

### এটি কীভাবে কাজ করে

Health ট্যাব per-agent একটি rolling window-এ run statuses aggregates করে। Business-outcome tracking-এর জন্য এজেন্টকে তার output-এ একটি \`business_outcome\` directive নির্গত করতে হয় (বেশিরভাগ templates যাদের প্রয়োজন তা ডিফল্টভাবে এটি করে; custom এজেন্টরা স্পষ্টভাবে এটি যোগ করতে পারে)। Threshold alerts per agent কনফিগার করা হয় এবং একই notification channels-এর মাধ্যমে fire করে যা এজেন্ট সেট আপ করা হয়েছে।

:::tip
প্রতিটি production এজেন্টে একটি 90% threshold সেট করুন। alert আপনাকে বলবে না কেন একটি এজেন্ট ব্যর্থ হচ্ছে, কিন্তু এটি আপনাকে বলবে কিছু আছে। Health ট্যাবে failure-reason classification হল যেখানে আপনি পরবর্তীতে নির্ণয় করতে যান।
:::
  `,

  "execution-tracing": `
## এক্সিকিউশন ট্রেসিং

Tracing হল per-run এজেন্ট কী করেছে তার ধাপে ধাপে রেকর্ড। Activity feed থেকে যেকোনো execution খুলুন এবং Trace ট্যাবে ক্লিক করুন: আপনি কালানুক্রমিক ক্রমে প্রতিটি event দেখবেন — model token-streaming শুরু এবং শেষ, arguments সহ প্রতিটি tool invocation, প্রতিটি tool result, একটি chained এজেন্টে প্রতিটি decision branch, রেন্ডার করা prompt, output। প্রতিটি ধাপ সম্পূর্ণ বিশদের জন্য expandable।

Chained pipelines-এর জন্য, trace একাধিক এজেন্ট জুড়ে spans — lineage canvas (Events → Lineage) cross-agent view দেখায় যখন per-run trace within-agent বিশদ দেখায়। একসাথে তারা আপনাকে "এই pipeline কোথায় ভেঙেছে?" এবং "এজেন্ট ধাপে ধাপে কী সিদ্ধান্ত নিয়েছে?" উভয়ই ডিবাগ করতে দেয়।

### মূল পয়েন্ট

- **Chronological** — timestamp এবং duration সহ প্রতিটি event
- **প্রতি ধাপে Expandable** — সেই ধাপের সম্পূর্ণ input/output-এর জন্য যেকোনো ধাপে ক্লিক করুন
- **Per-step duration** — দেখুন কোন ধাপ ধীর; সাধারণত একটি tool call বা একটি দীর্ঘ model response
- **Chained traces** — যখন একটি এজেন্ট একটি chain দ্বারা triggered হয়, trace upstream এজেন্টের সাথে লিঙ্ক করে যাতে আপনি pipeline navigate করতে পারেন
- **Token-by-token** model-এর জন্য — ধীর-streaming providers-এর জন্য দরকারী যেখানে user অপেক্ষা করছে

### এটি কীভাবে কাজ করে

প্রতিটি execution চলার সাথে সাথে trace store-এ events লেখে; trace ট্যাব সেই store query করে এবং timeline রেন্ডার করে। Token-level events এমন একটি rate-এ sampled হয় যা দীর্ঘ responses-এর জন্যও trace usable রাখে (একটি 10k-token response 10k-এর পরিবর্তে 500 sampled events ক্যাপচার করতে পারে)। Tool-use loops-এর জন্য, model/tool round-trip-এর প্রতিটি iteration ক্যাপচার করা হয়।

:::tip
model *actually* কী পেয়েছে তা নিশ্চিত করতে trace ব্যবহার করুন। "এজেন্ট অদ্ভুত কিছু করেছে" বাগগুলির সবচেয়ে বড় উৎস হল model আপনার আশা করা থেকে ভিন্ন input পাওয়া — সাধারণত একটি tool result-এর কারণে যা এজেন্টের prompt আশা করা থেকে ভিন্ন দেখায়।
:::
  `,

  "performance-trends": `
## পারফরম্যান্স ট্রেন্ড

Trends হল agent behavior-এর দীর্ঘ view — success rate, cost, duration, output quality (যেখানে measured) সময়ের সাথে plotted তাই আপনি যে পরিবর্তনগুলি করেন তার প্রভাব দেখতে পারেন। Overview → Trends আপনাকে chart view দেয়; আপনি agent(s) এবং metric(s) এবং date range বাছেন, এবং charts render হয়।

সবচেয়ে দরকারী প্যাটার্ন হল "before vs. after": আপনি March 5-এ একটি এজেন্টের prompt পরিবর্তন করেছেন, জিনিসগুলি কি ভাল বা খারাপ হয়েছে? trends view সেকেন্ডের মধ্যে এটির উত্তর দেয় — আপনি যে lines যত্ন করেন সেগুলি আপনি যে তারিখে পরিবর্তন করেছেন সেখানে উপরে বা নিচে যায়।

### মূল পয়েন্ট

- **একটি chart-এ একাধিক metrics** — success rate, cost, duration, business-outcome rate overlay করুন
- **Multi-agent overlay** — একটি chart-এ একাধিক এজেন্ট জুড়ে একই metric তুলনা করুন
- **Custom date ranges** — "এই ঘন্টা" থেকে "all time" পর্যন্ত zoom করুন
- **Annotations** — তাৎপর্যপূর্ণ events (prompt version saves, settings changes, credential rotations) timeline-এ pinned তাই আপনি correlate করতে পারেন
- **Export** — chart ডেটা CSV-তে exports করে যদি আপনি নিজের analysis করতে চান

### এটি কীভাবে কাজ করে

Trends বাকি monitoring views-এর মতো একই execution এবং trace store থেকে aggregate করে — একই ডেটা, ভিন্ন visualization। Annotations version history এবং configuration history থেকে auto-generated হয় তাই আপনাকে ম্যানুয়ালি "I made a change here" চিহ্নিত করতে হবে না; সিস্টেম ইতিমধ্যেই জানে।

:::tip
একটি এজেন্টে যেকোনো অর্থপূর্ণ পরিবর্তনের পরে (prompt revision, model swap, new tool), এক সপ্তাহ পরে trends দেখুন। বেশিরভাগ prompt পরিবর্তন যা "testing-এ ভাল লেগেছিল" measurably ভিন্ন metrics তৈরি করে; chart এটি নিশ্চিত করে (বা আপনার gut invalidates করে)।
:::
  `,

  "setting-budget-limits": `
## বাজেট সীমা সেট করা

Budget limits agent স্তরে এবং global স্তরে AI spending cap করে। একটি per-run budget সেট করুন (এই একক execution $X-এর বেশি খরচ করতে পারে না), একটি per-day budget (এই এজেন্ট সমস্ত রান জুড়ে প্রতিদিন $Y-এর বেশি খরচ করতে পারে না), বা সমস্ত এজেন্ট জুড়ে একটি global cap। যখন একটি সীমাতে পৌঁছায়, প্রভাবিত এজেন্ট পরিষ্কারভাবে pauses করে — আংশিক run trace-এ ক্যাপচার করা হয়, cap-এর বাইরে কোনো charge স্থায়ী হয় না, এবং একটি notification fires।

এটি unattended এজেন্টদের জন্য সবচেয়ে underrated বৈশিষ্ট্যগুলির একটি। একটি scheduled বা webhook-triggered এজেন্ট budget cap ছাড়াই রাতারাতি অপ্রত্যাশিত costs jam করতে পারে যদি একটি prompt বা input কিছু pathological করে। Budget caps মানে worst case আপনি আগে থেকে সিদ্ধান্ত নিয়েছেন তা দ্বারা bounded, একটি errant model run কী করতে পারে তা দ্বারা নয়।

### মূল পয়েন্ট

- **Per-run cap** — একটি একক execution-এ hard limit
- **Per-day / per-week / per-month cap** — প্রতি এজেন্টে windowed spending সীমা
- **Global cap** — across-all-agents সীমা; এমনকি যখন প্রতিটি এজেন্টের নিজস্ব cap থাকে তখনও একটি safety net হিসাবে দরকারী
- **Graceful stop** — এজেন্টরা cap-এ পরিষ্কারভাবে থামে; আংশিক trace সংরক্ষিত
- **Notifications** — প্রতিটি cap-hit আপনাকে notify করে তাই আপনি সিদ্ধান্ত নিতে পারেন cap বাড়াবেন নাকি underlying prompt ঠিক করবেন
- **Soft warnings** — ঐচ্ছিক pre-cap thresholds (যেমন "80%-এ warn করুন") তাই আপনি জানেন একটি এজেন্ট একটি cap-এর দিকে যাচ্ছে

### এটি কীভাবে কাজ করে

Caps এজেন্টের Settings ট্যাবে (per-run, per-window) বা Settings → Engine → Budget (global)-এ কনফিগার করা হয়। execution engine রানের সময় লাইভ cost ট্র্যাক করে; যখন cost cap অতিক্রম করে, engine একটি timeout-এর মতো একই path দিয়ে run abort করে। Aborted state কারণ \`budget_exceeded\` সহ trace-এ সংরক্ষিত হয়।

:::warning
স্বয়ংক্রিয়ভাবে ট্রিগার করা যেকোনো এজেন্টের জন্য (schedule, webhook, file watcher, chain) সর্বদা কমপক্ষে একটি per-day cap সেট করুন। একটি ছাড়া, একটি pathological input বা একটি model loop আপনি লক্ষ্য করার আগে একটি unbounded amount খরচ করতে পারে। cap হল আপনার safety net।
:::

:::tip
আপনি একটি সাধারণ দিন যা খরচ করার আশা করেন তার প্রায় 3x সহ caps শুরু করুন। runaways ধরার জন্য যথেষ্ট tight, যথেষ্ট loose যে স্বাভাবিক variance cap trip করে না। বাস্তব ডেটার এক সপ্তাহ পরে adjust করুন।
:::
  `,

  "the-director": `
## Director — স্বয়ংক্রিয় এজেন্ট কোচিং

**Director** হল একটি অন্তর্নির্মিত মেটা-এজেন্ট যা আপনার অন্যান্য এজেন্টগুলি পর্যবেক্ষণ করে এবং সেগুলিকে সত্যিকারের কার্যকর হওয়ার দিকে কোচিং দেয়। আপনাকে প্রতিটি রান পড়ার বদলে, Director আপনার হয়ে সেগুলি পর্যালোচনা করে এবং একটি রায় রেখে যায়।

আপনি কী পর্যবেক্ষণ করবে তা এজেন্টগুলি **স্টার করে** নির্ধারণ করেন (All Agents-এর প্রতিটি সারিতে ⭐)। একটি স্টার করা এজেন্ট "Director-এর আওতায়" থাকে — Director তা পর্যালোচনা করে; স্টার না করা এজেন্টগুলি একা থাকে। Director নিজে একটি সিস্টেম এজেন্ট এবং মুছে ফেলা যায় না।

### কমান্ড সেন্টার

Director থাকে **Overview › Director**-এ — একটি কেন্দ্রীভূত পর্দায়:

- একটি **পোর্টফোলিও স্কোরকার্ড**: আপনার ফ্লিটের কাজের কতটুকু আসলে মূল্য দিয়েছে, গড় রায় স্কোর, প্রতি মূল্য-প্রদানকারী রানের খরচ, এবং আপনার স্টার করা এজেন্টগুলি কীভাবে দাঁড়িয়ে আছে তা দেখানো ০–৫ বিতরণ।
- আওতায় থাকা প্রতিটি এজেন্টের একটি **কোচিং টেবিল** — স্কোর, একটি ট্রেন্ড স্পার্কলাইন (কোচিং কি কাজ করছে?), মূল্যের হার, শেষ পর্যালোচনা, এবং **মনোযোগ ট্যাগ** যা ঠিক কোথায় পদক্ষেপ নিতে হবে তা চিহ্নিত করে (প্রথম পর্যালোচনার অপেক্ষায়, কম স্কোর, পতনশীল, পুরনো)। শুধু যে এজেন্টগুলির মনোযোগ দরকার সেগুলিতে ফিল্টার করুন। যেকোনো এজেন্টে ক্লিক করুন তার **বিস্তারিত** খুলতে — প্রতিটি স্কোরের পেছনের যুক্তি ও সুনির্দিষ্ট পরামর্শসহ পূর্ণ রায়ের ইতিহাস।
- একটি পাতলা হেডার যাতে **Review all in scope**, একটি **Add to scope** পিকার, এবং দীর্ঘমেয়াদী **মেমরি** টগল।

All Agents পৃষ্ঠায় একটি পাতলা Director স্ট্রিপ রয়েছে যা সরাসরি এখানে লিঙ্ক করে।

### একটি রায় কেমন দেখায়

প্রতিটি পর্যালোচনা একটি সামগ্রিক **০–৫ স্কোর** এবং ঐচ্ছিক কোচিং নোট তৈরি করে:

- Activity তালিকার **Verdict** কলাম এজেন্টের পাশেই স্কোরটি তারা হিসেবে দেখায় — এক নজরেই বোঝা যায় কোন রানগুলি তাদের খরচের মূল্য রেখেছে।
- যেকোনো রানের **Director** ট্যাব পঠনযোগ্য মার্কডাউনে পূর্ণ মূল্যায়ন খোলে: স্কোর, একটি এক-লাইনের সারাংশ, এবং সুনির্দিষ্ট পরামর্শ (একটি প্রম্পট পরিবর্তন, একটি গার্ডরেল, একটি মডেল-স্তর পরিবর্তন, একটি অনুপস্থিত টুল)।
- কার্যকর নোটগুলি আপনার পর্যালোচনা সারিতেও আসে, যেখানে সেগুলি অনুমোদন বা প্রত্যাখ্যান করা Director-কে সময়ের সাথে আপনার পছন্দ শেখায়।

একটি সুস্থ এজেন্ট সামান্য বা কোনো কোচিং ছাড়াই উচ্চ স্কোর পায় — উন্নতির কিছু না থাকলে Director চুপ থাকে।

### দীর্ঘমেয়াদী মেমরি (ঐচ্ছিক)

আপনি **Obsidian Brain** ব্যবহার করলে Director-এর দীর্ঘমেয়াদী মেমরি চালু করতে পারেন। তখন সে প্রতিটি পর্যালোচনার আগে একটি এজেন্ট সম্পর্কে নিজের পূর্ববর্তী নোট পড়ে (ফলে পরামর্শ পুনরাবৃত্তির বদলে জমা হয়) এবং প্রতিটি নতুন রায় আপনার vault-এর একটি \`Director/\` ফোল্ডারে লিখে রাখে — একটি টেকসই, মানুষ-পাঠযোগ্য কোচিং ইতিহাস।

### কেন এটি গুরুত্বপূর্ণ

কাঁচা সংখ্যা (রান, খরচ, সাফল্যের হার) আপনাকে বলে *কী* ঘটেছে, *মূল্যবান ছিল কিনা* তা নয়। Director সেই অনুপস্থিত বিচার স্তর যোগ করে — প্রতিটি এজেন্টের মূল্য ও দক্ষতার একটি সৎ, প্রমাণ-ভিত্তিক মূল্যায়ন — যাতে এজেন্টদের একটি বহর আপনি প্রতিটি রান হাতে অডিট না করেই কার্যকর থাকে।
  `,

  "anomaly-detection": `
## অসঙ্গতি সনাক্তকরণ

Anomaly detection প্রতিটি নতুন রানকে এজেন্টের সাম্প্রতিক baseline-এর বিরুদ্ধে তুলনা করে এবং অস্বাভাবিক দেখায় এমন রানগুলি ফ্ল্যাগ করে। baseline per-agent নির্মিত হয়: typical duration, typical cost, typical output length, typical tool-call count। এই যেকোনোটিতে উল্লেখযোগ্যভাবে deviates করা একটি নতুন রান একটি কারণ সহ ফ্ল্যাগ হয় — "duration স্বাভাবিকের 5×", "cost spike", "tool-call count anomalous", "output unusually short"।

এটি একটি ক্লাসের সমস্যা ধরে যা pure success/failure metrics মিস করে: রান সম্পূর্ণ হয়েছে, কিন্তু কিছু ভুল ছিল। এজেন্ট পাঁচ মিনিট নিয়েছে যখন এটি সাধারণত ত্রিশ সেকেন্ড নেয়। output হল তিনটি বাক্য যখন এটি সাধারণত তিনটি প্যারাগ্রাফ। input-এ কোনো পরিবর্তন ছাড়াই cost দ্বিগুণ হয়েছে। এগুলি trends হয়ে ওঠার আগে দেখার মতো signals।

### মূল পয়েন্ট

- **Multi-signal baseline** — duration, cost, output size, tool-call count, failure rate
- **Per-agent baselines** — প্রতিটি এজেন্টের নিজস্ব স্বাভাবিক রয়েছে; একটির জন্য যা anomalous অন্যটির জন্য স্বাভাবিক
- **Reason-tagged alerts** — alert কোন signal deviated এবং কত নাম দেয়
- **Low noise** — genuine outliers সারফেস করতে calibrated, স্বাভাবিক variance নয়
- **notifications-এর সাথে একীভূত** — anomalies এজেন্ট যে notification channels-এর সাথে কনফিগার করা হয়েছে তার মাধ্যমে fire করে

### এটি কীভাবে কাজ করে

baseline হল সাম্প্রতিক রানের একটি rolling window (configurable; default 50)। প্রতিটি নতুন রান প্রতিটি signal-এ স্কোর করা হয়; যদি কোনো signal কনফিগার করা threshold (default 3 standard deviations from the rolling mean) অতিক্রম করে, রানটি ফ্ল্যাগ করা হয় এবং একটি anomaly event নির্গত হয়। Anomaly events Overview → Notifications-এ এবং সেই এজেন্টের জন্য Health ট্যাবে প্রদর্শিত হয়।

:::tip
আপনি যে anomalies তদন্ত এবং সমাধান করেন সেগুলি cleared করা উচিত (সেগুলিকে "investigated" চিহ্নিত করুন)। baseline তার rolling window থেকে investigated anomalies বাদ দেয়, তাই সিস্টেম anomalous রানকে "স্বাভাবিক" বিবেচনা করার দিকে drift করে না।
:::
  `,
};
