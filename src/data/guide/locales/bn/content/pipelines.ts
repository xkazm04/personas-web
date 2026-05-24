export const content: Record<string, string> = {
  "what-are-pipelines": `
## পাইপলাইন কী?

একটি pipeline হল এজেন্টদের একটি সমন্বিত গ্রুপ যারা একটি multi-step task পরিচালনা করতে একে অপরের মধ্যে কাজ পাস করে। একটি বড় do-everything এজেন্টের পরিবর্তে, আপনি ছোট ফোকাসড এজেন্ট তৈরি করেন এবং তাদের একসাথে wire করেন — প্রতিটি specializes, pipeline orchestration পরিচালনা করে। sidebar-এ Pipeline বিভাগ হল যেখানে pipelines থাকে; এর ভিতরে Team Canvas হল যেখানে আপনি সেগুলি রচনা করেন।

Personas-এ pipelines first-class — তাদের নিজস্ব execution history আছে, তাদের নিজস্ব observability surfaces, তাদের নিজস্ব team memory (shared context যা pipeline-এর সমস্ত এজেন্ট পড়তে পারে), এবং সেগুলিকে একটি single এজেন্টের মতো ট্রিগার করা যেতে পারে (schedule, webhook, manual, chain)। পার্থক্য হল একটি trigger একটি এজেন্টের পরিবর্তে একটি পুরো pipeline fires করে।

:::compare
**Single Agent**
একটি prompt, একটি tool set, একটি output। সেট আপ করা সহজ; সীমিত যখন কাজটি স্বাভাবিকভাবে পর্যায়ে decomposes হয়।
---
**Pipeline** [recommended for multi-stage work]
কয়েকটি ফোকাসড এজেন্ট, একটি flow-এ wired। প্রতিটি এজেন্ট ছোট এবং ডিবাগ করা সহজ; pipeline তাদের একটি বৃহত্তর capability-তে রচনা করে। Shared team memory এজেন্টদের কাঠামোগত context পাস করতে দেয়, শুধু text নয়। team canvas-এ end-to-end দৃশ্যমান।
:::

### মূল পয়েন্ট

- **Multi-agent flow** — এজেন্টরা সংজ্ঞায়িত সংযোগ বরাবর inputs-এ output পাস করে
- **Team memory** — একটি shared context store যা সমস্ত pipeline এজেন্ট পড়তে এবং লিখতে পারে, per-agent memory থেকে আলাদা
- **Visual editor** — Team Canvas; এজেন্ট স্থাপন করুন, সংযোগ আঁকুন, routing কনফিগার করুন
- **পুনঃব্যবহারযোগ্য** — যেকোনো মিল trigger payload-এর জন্য একই pipeline চলে; pipelines clone করাও যেতে পারে
- **Observable** — per-agent breakdown সহ সম্পূর্ণ pipeline-level execution history

### এটি কীভাবে কাজ করে

আপনি Team Canvas-এ একটি pipeline রচনা করেন: এজেন্ট ফেলে দিন, সংযোগ আঁকুন, প্রয়োজনে conditional branches কনফিগার করুন। যখন pipeline চলে, সংযোগ বরাবর ডেটা প্রবাহিত হয় — প্রতিটি এজেন্টের output canvas যে downstream এজেন্টে wired তার ইনপুট হয়ে যায়। engine end-to-end run ট্র্যাক করে তাই আপনি N disjoint agent runs-এর পরিবর্তে একটি pipeline execution দেখেন।

### এটি কার্যকর দেখুন

:::usecases
**DevOps automation**
GitHub-এ একটি pull request খোলে
---
PR Reviewer agent diff বিশ্লেষণ করে, Test Runner builds যাচাই করে, Release Notes একটি changelog drafts, Slack Notifier আপনার team channel-এ summary পোস্ট করে — GitHub webhook দ্বারা ট্রিগার করা একক pipeline।
===
**Content workflow**
আপনার একটি বিষয় থেকে একটি প্রকাশিত blog post প্রয়োজন
---
Research agent sources সংগ্রহ করে, Writer piece drafts, Editor polishes, Publisher আপনার CMS-এর জন্য formats — pipeline handoffs পরিচালনা করে এবং team memory shared style guidance বহন করে।
===
**Customer support triage**
একটি নতুন ticket আসে
---
Classifier urgency এবং category নির্ধারণ করে, Knowledge agent প্রাসঙ্গিক docs retrieves, Drafter একটি candidate response লেখে, Router confidence কম হলে একজন মানুষের কাছে escalates।
:::

:::info
pipeline size-এ কোনো কঠিন উপরের সীমা নেই। ডেটা flow যাচাই করতে দুটি এজেন্ট দিয়ে শুরু করুন, এক সময়ে একটি specialist যোগ করে বাড়ান। 10+ এজেন্ট সহ Pipelines ছোটগুলির মতো নির্ভরযোগ্যভাবে কাজ করে; engine orchestration একইভাবে পরিচালনা করে।
:::

:::tip
pipeline-এর প্রতিটি এজেন্টকে একটি single-purpose function-এর মতো আচরণ করুন: একটি specific input shape, একটি specific output shape। প্রতিটি এজেন্ট যত ছোট এবং বেশি ফোকাসড, পুরো pipeline ডিবাগ করা তত সহজ এবং পৃথক পিসগুলি pipelines জুড়ে তত বেশি পুনঃব্যবহারযোগ্য।
:::
  `,

  "the-team-canvas": `
## টিম ক্যানভাস

Team Canvas হল pipelines-এর জন্য ভিজ্যুয়াল editor। Pipeline → Team Canvas খুলুন এবং আপনি আপনার pipeline-কে একটি গ্রাফ হিসাবে দেখেন: directed edges দ্বারা সংযুক্ত agent nodes। বাম পাশের library panel থেকে এজেন্ট ফেলে দিন, একটি এজেন্টের output port থেকে অন্য এজেন্টের input port-এ টেনে এনে সংযোগ আঁকুন, conditional nodes দিয়ে branches কনফিগার করুন। canvas pan, zoom, multi-select, auto-layout, এবং keyboard navigation সমর্থন করে।

canvas শুধু visualization নয় — এটি editor। আপনি canvas-এ যে প্রতিটি পরিবর্তন করেন (একটি এজেন্ট স্থাপন করা, একটি সংযোগ আঁকা, একটি conditional node যোগ করা) অবিলম্বে pipeline-এর সংজ্ঞা আপডেট করে। কমিট করতে Save করুন; pipeline একই ভাবে version-controlled যেমন agent prompts।

### মূল পয়েন্ট

- library থেকে canvas-এ এজেন্ট **Drag-and-drop**
- **সংযোগ আঁকা** — output port থেকে input port-এ ক্লিক-এন্ড-ড্র্যাগ; run time-এ সংযোগ বরাবর ডেটা প্রবাহিত হয়
- **Conditional nodes** — ডেটার উপর ভিত্তি করে branch করতে এজেন্টদের মধ্যে একটি routing node যোগ করুন
- **Auto-layout** — এক ক্লিক canvas-কে left-to-right বা top-to-bottom flow-এ tidies করে
- **Versioned** — canvas snapshots pipeline-এর সাথে সংরক্ষিত হয়; পূর্ববর্তী layouts এবং topologies পুনরুদ্ধার করুন

### আপনার প্রথম Pipeline তৈরি করা

:::steps
1. **Pipeline → Team Canvas খুলুন** — সাইডবার → Pipeline → New Pipeline (বা একটি বিদ্যমান একটি খুলুন)
2. **agent library browse করুন** — বাম প্যানেল; group দ্বারা ফিল্টার বা অনুসন্ধান
3. **এজেন্ট canvas-এ টেনে আনুন** — execution order-এ মোটামুটি স্থাপন করুন
4. **সংযোগ আঁকুন** — output port (right edge) থেকে input port (left edge)-এ
5. **প্রয়োজনে conditional nodes যোগ করুন** — toolbar → Conditional; branches কনফিগার করুন
6. **Save** — Ctrl+S; pipeline কমিটেড এবং অবিলম্বে চালানোর জন্য প্রস্তুত
:::

:::tip
Left-to-right top-to-bottom হল সবচেয়ে পঠনযোগ্য কনভেনশন। topology সেট হয়ে গেলে auto-layout (toolbar button) ব্যবহার করুন; এটি একটি পরিষ্কার ভিজ্যুয়াল flow তৈরি করে যা canvas পড়া যে কাউকে সাহায্য করে — ভবিষ্যত-আপনি সহ — এক নজরে pipeline বুঝতে।
:::
  `,

  "adding-agents-to-a-pipeline": `
## একটি পাইপলাইনে এজেন্ট যোগ করা

এজেন্টরা Team Canvas-এর বাম দিকে library panel থেকে pipelines-এ যোগ করা হয়। স্থাপন করতে যেকোনো এজেন্ট canvas-এ টেনে আনুন; এজেন্টের ডিফল্ট সেটিংস (prompt, tools, model, credentials) বহন করে, কিন্তু আপনি যদি চান এই এজেন্ট এখানে অন্য কোথাও থেকে সামান্য ভিন্নভাবে আচরণ করুক তবে আপনি per-pipeline override করতে পারেন।

একই এজেন্ট একাধিক pipelines-এ অংশগ্রহণ করতে পারে, প্রতিটির নিজস্ব override settings সহ। underlying এজেন্টে পরিবর্তন (যেমন এজেন্টের নিজস্ব editor-এ একটি prompt revision) এটি ব্যবহার করা সমস্ত pipelines-এ প্রচার করে; per-pipeline overrides করে না, সেগুলি কেবল pipeline-এ থাকে।

### মূল পয়েন্ট

- **library থেকে drag** — আপনি যে কোনো এজেন্ট তৈরি করেছেন তা উপলব্ধ
- **Per-pipeline overrides** — input mapping, output transformer, model preference (যদি আপনি চান এই pipeline এই পর্যায়ের জন্য একটি সস্তা মডেল ব্যবহার করুক), failover provider
- **Multi-pipeline reuse** — pipeline A এবং pipeline B-তে একটি এজেন্টের প্রতি pipeline-এ স্বাধীন override sets আছে
- **underlying এজেন্ট পরিবর্তন propagate করে** — prompt edits, tool changes, ইত্যাদি, এজেন্ট ব্যবহার করা প্রতিটি pipeline-এ flow করে (per-pipeline overrides করে না)
- **জায়গায় একটি এজেন্ট প্রতিস্থাপন করুন** — right-click → Replace; নতুন এজেন্ট পুরানোটির সংযোগগুলি উত্তরাধিকারী করে যদি input/output shapes মেলে

### এটি কীভাবে কাজ করে

canvas-এ একটি এজেন্ট স্থাপন করা সেই এজেন্টের একটি *pipeline-scoped reference* তৈরি করে। reference-এ override set (যেকোনো per-pipeline customizations) এবং canvas-এ অবস্থান অন্তর্ভুক্ত। run time-এ, engine reference resolve করে, এজেন্টের base configuration-এর উপরে overrides প্রয়োগ করে, এবং run পাঠায়।

:::tip
override set-এ ভারী per-pipeline customizations বেক করার প্রলোভনকে প্রতিরোধ করুন। আপনি যদি নিজেকে একটি pipeline-এ অনেক কিছু override করতে দেখেন, এজেন্টকে clone করা সাধারণত পরিষ্কার (clone-কে একটি স্পষ্ট নাম দিয়ে যেমন "Email Writer - Pipeline B") এবং clone ব্যবহার করুন — override panels-এর ভিতরে লুকানোর পরিবর্তে per-pipeline customizations explicit রাখে।
:::
  `,

  "connecting-agents-with-data-flow": `
## ডেটা ফ্লো দিয়ে এজেন্টদের সংযুক্ত করা

canvas-এ সংযোগগুলি একটি এজেন্টের output port থেকে অন্য এজেন্টের input port-এ directed edges। প্রতিটি সংযোগ upstream এজেন্টের output downstream এজেন্টের কাছে ইনপুট হিসাবে বহন করে — ডিফল্টভাবে verbatim, অথবা একটি inline transformer (একটি ছোট expression যা output-কে পাস করার আগে reshapes করে) দ্বারা রূপান্তরিত।

সংযোগগুলি কনফিগার করা হয়: আপনি transformers যোগ করতে পারেন, লেবেল করতে পারেন (জটিল pipelines-এ দরকারী), এবং সেগুলি সরানো ছাড়াই ডিবাগিংয়ের জন্য অস্থায়ীভাবে toggle off করতে পারেন। একাধিক সংযোগ একটি output থেকে ফ্যান আউট করতে পারে (broadcast: downstream এজেন্টরা সবাই একই ডেটা পায়) বা একটি input-এ ফ্যান ইন (engine downstream-এর জন্য একটি input object-এ একাধিক upstream এজেন্ট থেকে inputs একত্রিত করে)।

### মূল পয়েন্ট

- একটি সংযোগ তৈরি করতে output port থেকে input port-এ **Click-drag**
- **ঐচ্ছিক transformer** — inline expression যা পথে ডেটা reshapes করে
- **Fan-out** — একটি output থেকে অনেক downstream inputs (parallel branching)
- **Fan-in** — অনেক upstream outputs একটি downstream input-এ (combined object)
- **Toggle on/off** — সংযোগ মুছে না দিয়ে নিষ্ক্রিয় করুন (staged rollouts-এর জন্য দরকারী)
- **Labeled** — জটিল pipelines-এ স্পষ্টতার জন্য সংযোগ নাম দিন
- **Delete** — ক্লিক সংযোগ → Delete key

### দুটি এজেন্ট সংযুক্ত করা

:::steps
1. **output port খুঁজুন** — source এজেন্টের right edge-এ ছোট বৃত্ত
2. **Click-and-drag** input port-এ — target-এর left edge-এ ছোট বৃত্ত
3. **input port-এ ফেলুন** — line আঁকা; সংযোগ committed
4. **ঐচ্ছিকভাবে একটি transformer যোগ করুন** — right-click connection → Add transformer; ডেটা reshape করতে একটি ছোট expression লিখুন
5. **pipeline চালিয়ে পরীক্ষা করুন** — মধ্য দিয়ে যাওয়া ডেটা পরিদর্শন করতে একটি রানের সময় যেকোনো সংযোগে ক্লিক করুন
:::

:::tip
3-4 এজেন্টের বেশি সহ যেকোনো pipeline-এ connection labels এবং transformers উদারভাবে ব্যবহার করুন। Labels topology-কে self-documenting করে; transformers আপনাকে pipelines জুড়ে এজেন্টদের পুনঃব্যবহারযোগ্য রাখতে দেয় (একটি এজেন্টকে জানতে হবে না একটি ভিন্ন pipeline upstream কী format তৈরি করতে পারে — transformer এটি adapts করে)।
:::
  `,

  "pipeline-execution": `
## পাইপলাইন এক্সিকিউশন

একটি pipeline চালানো প্রথম এজেন্টের (বা এজেন্টদের, যদি একাধিক start nodes থাকে) মধ্যে trigger payload পাঠায়, এবং প্রতিটি downstream এজেন্ট তার inputs উপলব্ধ হওয়ার সাথে সাথে চলে। canvas live execution দেখায় — এজেন্টরা চলার সময় glow করে, সংযোগগুলি ডেটা প্রবাহিত হওয়ার সাথে animate হয়, এবং conditional nodes দেখায় কোন branch নেওয়া হয়েছিল।

engine স্বয়ংক্রিয়ভাবে parallelism পরিচালনা করে: যদি দুটি এজেন্টের মধ্যে কোনো dependency না থাকে, তারা parallel-এ চলে। যদি একটি এজেন্ট একাধিক upstream এজেন্টের outputs-এর উপর নির্ভর করে, এটি সবগুলি সম্পূর্ণ হওয়ার জন্য অপেক্ষা করে। মোট wall-clock সময় গ্রাফের মাধ্যমে critical path দ্বারা নির্ধারিত হয়, সমস্ত এজেন্ট সময়কালের যোগফল নয়।

### মূল পয়েন্ট

- **Live canvas animation** — দেখুন কোন এজেন্টরা চলছে, কোন সংযোগগুলি প্রবাহিত, কোন conditional branches নেওয়া হয়েছে
- **স্বয়ংক্রিয় parallelism** — স্বাধীন এজেন্টরা concurrently চলে; নির্ভরশীল এজেন্টরা prerequisites-এর জন্য অপেক্ষা করে
- **Critical path wall time নির্ধারণ করে** — pipeline সময়কাল = দীর্ঘতম dependency chain, এজেন্টদের যোগফল নয়
- **Stop-at-first-failure** — ডিফল্টভাবে; আপনি fault-tolerant execution চাইলে প্রতি pipeline-এ configurable
- **যেকোনো ধাপ থেকে পুনরায় চালান** — সফল upstream পর্যায়গুলি পুনরায় না চালিয়ে একটি ফিক্সের পরে তুলুন

### এটি কীভাবে কাজ করে

:::diagram
[Trigger] --> [Agent A] --> [Conditional] --> [Agent B or Agent C] --> [Agent D] --> [Output]
:::

\`Run\` ক্লিক করুন (বা ট্রিগার স্বয়ংক্রিয়ভাবে ফায়ার হওয়ার জন্য অপেক্ষা করুন)। engine canvas topology থেকে একটি execution plan তৈরি করে, start nodes পাঠায়, এবং topological order দ্বারা গ্রাফ প্রক্রিয়া করে। প্রতিটি এজেন্ট সম্পূর্ণ হওয়ার সাথে সাথে, downstream এজেন্টরা যোগ্য হয়ে যায় এবং স্বয়ংক্রিয়ভাবে পাঠায়। ব্যর্থতা inspector-এ দৃশ্যমান error সহ ব্যর্থ ধাপে pipeline pauses করে; underlying issue ঠিক করুন এবং পুনরায় শুরু করতে \`Retry Step\` ক্লিক করুন।

:::tip
critical path-এর সবচেয়ে ধীর এজেন্ট pipeline সময়কাল নির্ধারণ করে। যদি আপনার pipeline ধীর মনে হয়, একবার চালান, trace-এ per-agent durations দেখুন, দীর্ঘতম path সনাক্ত করুন, এবং সেই path-এ যে কোন এজেন্টের সর্বোচ্চ duration আছে তা optimize করুন। আপনার critical path ধীর হলে parallel branches সাহায্য করে না।
:::
  `,

  "conditional-routing": `
## শর্তসাপেক্ষ রাউটিং

Conditional routing nodes একটি pipeline-কে এটি প্রক্রিয়া করছে এমন ডেটার উপর branch করতে দেয়। canvas-এ একটি conditional node ফেলে দিন, এক বা একাধিক নিয়ম সংজ্ঞায়িত করুন ("if amount > 1000", "if email contains 'urgent'", "if classifier output = 'support'"), এবং প্রতিটি branch-কে একটি ভিন্ন downstream path-এ wire করুন। run time-এ conditional evaluates এবং মিল branch-এ routes — শুধুমাত্র সেই branch চলে।

নিয়মগুলি expression-based: comparisons এবং logical operators-এর একটি ছোট DSL upstream এজেন্টের output-এর বিরুদ্ধে evaluated। কোনো কোড নেই; expression editor-এর upstream output shape-এর জন্য autocomplete আছে তাই আপনি টাইপ করার সাথে সাথে উপলব্ধ ফিল্ডগুলি আবিষ্কার করেন।

:::feature
**Expression-based routing**
Conditional নিয়মগুলি upstream output-এর বিরুদ্ধে expressions হিসাবে evaluated। ফিল্ড তুলনা করুন, AND/OR দিয়ে একত্রিত করুন, কিছু মিল না হলে একটি default branch-এ fall through করুন। কোনো কোড প্রয়োজন নেই, কিন্তু আপনার প্রয়োজন হলে সম্পূর্ণ expressiveness।
:::

### মূল পয়েন্ট

- **একাধিক branches** — একটি conditional node, N rule-defined branches, plus একটি default fallback
- **Default branch বাধ্যতামূলক** — গ্যারান্টি দেয় ডেটা কখনই unmatched conditions-এ আটকে যায় না
- **Expression DSL** — comparisons (\`>\`, \`<\`, \`==\`, \`contains\`, \`matches\`), boolean operators (\`and\`, \`or\`, \`not\`)
- **upstream shape-এ Autocomplete** — expression editor upstream এজেন্টের output schema জানে
- **trace-এ Live evaluation** — প্রতিটি pipeline run-এ কোন branch নেওয়া হয়েছিল দেখুন

### এটি কীভাবে কাজ করে

এজেন্টদের মধ্যে একটি Conditional node ফেলে দিন। rule editor-এ প্রতিটি branch-এর নিয়ম কনফিগার করুন; default branch-এর কোনো নিয়মের প্রয়োজন নেই (এটি fallback)। run time-এ engine ক্রমে নিয়মগুলি evaluates করে; প্রথম মিল জেতে; কোনো নিয়ম মিল না করলে default branch চলে। যে branch চলে সে upstream output-কে input হিসাবে দেখে; অন্যরা এই রানের জন্য idle থাকে।

:::warning
সর্বদা একটি default branch সংজ্ঞায়িত করুন। একটি ছাড়া, একটি unmatched input মধ্য-pipeline-এ আটকে যায় এবং একটি hung run তৈরি করে — ডিবাগ করা বিরক্তিকর। default branch একটি terminal "log and stop" এজেন্টে route করতে পারে যদি আপনি সত্যিই চান unmatched inputs জোরে ব্যর্থ হোক, কিন্তু branch থাকতে হবে।
:::
  `,

  "team-members-and-roles": `
## টিম সদস্য এবং ভূমিকা

একটি pipeline-এ প্রতিটি এজেন্ট একটি role label বহন করতে পারে — "Researcher", "Writer", "Editor", "Classifier" — যা pipeline-এর মধ্যে এর function বর্ণনা করে। Roles বিশুদ্ধভাবে organizational; engine সেগুলি প্রয়োগ বা ব্যবহার করে না। তাদের মূল্য মানব: যখন আপনি (বা অন্য কেউ) এক মাস পরে canvas খোলেন, role labels pipeline-কে self-documenting করে।

label-এর বাইরে, agent substitution-এর জন্যও roles দরকারী। আপনার যদি একাধিক এজেন্ট থাকে যা "Editor" role পূরণ করতে পারে (ভিন্ন prompt styles বা specialties সহ), role label আপনি যখন মন পরিবর্তন করেন তখন কোন slot swap করতে হবে তা স্পষ্ট করে তোলে। Team Canvas একটি role-এ drag-replace সমর্থন করে: বিদ্যমান role-এ একটি ভিন্ন এজেন্ট ফেলে দিন এবং canvas substitute করবে কিনা জিজ্ঞাসা করে, সংযোগগুলি সংরক্ষণ করে।

### মূল পয়েন্ট

- **Free-text role labels** — যেকোনো human-readable; সাধারণগুলি autocomplete সাজেশন পায়
- **Canvas-visible** — role labels প্রতিটি agent node-এর উপরে প্রদর্শিত হয় তাই team structure এক নজরে
- **role দ্বারা Drag-replace** — সংযোগ সংরক্ষণ করে substitute করতে একটি নতুন এজেন্ট একটি role slot-এ ফেলে দিন
- **role দ্বারা library ফিল্টার করুন** — যখন আপনার অনেক অনুরূপ এজেন্ট থাকে, candidates দ্রুত খুঁজে পেতে role দ্বারা library ফিল্টার করুন
- **Pipeline templates roles ব্যবহার করে** — template পূরণ করার জন্য roles সংজ্ঞায়িত করে, আপনি প্রতিটি role-এ মানানসই এজেন্ট আনেন

### এটি কীভাবে কাজ করে

canvas-এ যেকোনো এজেন্টে right-click → Set role। label agent node-এর উপরে প্রদর্শিত হয়। Roles agent reference-এর পাশাপাশি pipeline definition-এ থাকে; তারা এজেন্টকে নিজে সংশোধন করে না। Pipeline templates পূর্ব-সংজ্ঞায়িত roles সহ শিপ করে; একটি template instantiating আপনাকে প্রতিটি role-এর জন্য একটি এজেন্ট বাছাই করতে বলে।

:::tip
দায়িত্ব দ্বারা roles নাম দিন, বর্তমান এজেন্ট দ্বারা নয়। "Editor" "Claude Sonnet Editor"-এর চেয়ে ভাল; role description বর্তমানে যে specific agent পূরণ করে তার চেয়ে বেশি দিন স্থায়ী হয়। যদি আপনি সেই role-এর জন্য Claude থেকে GPT-এ স্যুইচ করেন, role label এখনও সঠিক।
:::
  `,

  "pipeline-run-history": `
## পাইপলাইন রান ইতিহাস

Pipeline runs পৃথক agent runs যে একই store-এ যায় তাতে first-class executions। Pipeline → Run History ট্যাব প্রতিটি run-কে এর trigger, input, status, total duration, total cost, এবং per-agent breakdown সহ দেখায়। সম্পূর্ণ trace প্রসারিত করতে যেকোনো রানে ক্লিক করুন: per-agent traces, conditional decisions, transformer outputs, চূড়ান্ত ফলাফল।

Run history অনির্দিষ্টকালের জন্য স্থায়ী হয় (Settings → Data-তে retention settings সাপেক্ষে) এবং per-agent activity views-এর মতো একই ফিল্টারিং এবং অনুসন্ধান সমর্থন করে। প্রতিটি run immutable — একবার ক্যাপচার করা হলে, trace হিমায়িত, after-the-fact audits-এর জন্য দরকারী।

### মূল পয়েন্ট

- **সম্পূর্ণ ক্যাপচার** — input, per-agent traces (prompt, tool calls, response), conditional decisions, transformer outputs, চূড়ান্ত ফলাফল
- pipeline trace-এর মধ্যে **Per-agent status** — success / failure / skipped / pending
- **Total + per-agent timing** — critical path দেখুন এবং bottlenecks সনাক্ত করুন
- **Total + per-agent cost** — pipeline cost = per-agent costs-এর যোগফল
- **Searchable এবং filterable** — date, trigger, status, cost, duration, agent দ্বারা
- **Two-run compare** — per-agent outputs diff করতে দুটি runs বাছুন ("কী পরিবর্তন হয়েছে?"-এর জন্য দরকারী)

### এটি কীভাবে কাজ করে

Pipeline runs single-agent runs-এর মতো একই execution store ব্যবহার করে কিন্তু একটি অতিরিক্ত pipeline-level wrapper সহ যা সমস্ত child agent executions-এ লিঙ্ক করে। history view এই store query করে, per-agent breakdowns-এর জন্য agent execution records-এ join করে, এবং trace tree রেন্ডার করে।

:::tip
একটি অর্থপূর্ণ pipeline পরিবর্তনের পরে (নতুন conditional rule, swapped agent, একটি member agent-এ prompt revision), ইতিহাস থেকে একটি "before" run এবং নতুন run থেকে "after" run বাছুন, তারপর কী আলাদা তা ঠিক দেখতে Compare ব্যবহার করুন। pipeline স্তরে diff প্রায়শই এমন প্রভাব প্রকাশ করে যা আপনি বিচ্ছিন্নভাবে যেকোনো একক এজেন্ট দেখে মিস করতেন।
:::
  `,

  "pipeline-templates": `
## পাইপলাইন টেমপ্লেট

Pipeline templates হল প্রি-নির্মিত pipeline shapes যা আপনি একটি শুরুর বিন্দু হিসাবে গ্রহণ করতে পারেন। template topology সংজ্ঞায়িত করে — কী roles বিদ্যমান, কী conditional branches, কী transformers — কিন্তু প্রতিটি role-এ নির্দিষ্ট এজেন্ট bind করে না। আপনি যখন একটি template instantiate করেন, canvas topology জায়গায় সহ খোলে এবং আপনাকে আপনার নিজস্ব agent library থেকে প্রতিটি role পূরণ করতে বলে।

Templates সাধারণ shapes কভার করে: content workflows (research → write → edit → publish), support triage (classify → route → respond → escalate), data processing (ingest → validate → transform → store)। Template library Pipelines → New Pipeline → Browse Templates-এ।

### মূল পয়েন্ট

- **Topology-defined, role-flexible** — template shape জানে; আপনি এজেন্ট আনেন
- **প্রি-কনফিগার করা conditional rules এবং transformers** — common-case routing logic বেক করা
- **instantiation-এর পরে Customizable** — একবার instantiated, canvas আপনার সংশোধন করার জন্য
- **Best-practice patterns** — templates মান হিসাবে error handling এবং fallback branches সহ শিপ করে
- **বর্ধমান library** — user demand-এর উপর ভিত্তি করে নতুন templates যোগ করা হয়; আপনি reuse-এর জন্য templates হিসাবে আপনার নিজস্ব pipelines সংরক্ষণ করতে পারেন

### এটি কীভাবে কাজ করে

একটি template হল agent references-এর পরিবর্তে role slots সহ একটি canvas definition। Instantiating একটি নতুন pipeline তৈরি করে, template-এর canvas কপি করে, এবং agent library থেকে প্রতিটি role পূরণ করতে আপনাকে বলে। একবার পূরণ হলে, pipeline সম্পূর্ণরূপে editable — এটি template-এ লিঙ্ক করা নয়, তাই template-এর আপডেট propagate করে না (এবং pipeline-এর edits template-কে প্রভাবিত করে না)।

:::tip
এমনকি যখন কোনো template একটি সঠিক fit নয়, সবচেয়ে কাছেরটি বাছাই করা এবং এটি সংশোধন করা সাধারণত স্ক্র্যাচ থেকে নির্মাণের চেয়ে দ্রুত। Templates orchestration shape (conditional placement, transformer locations, fan-out/fan-in topology) প্রি-সলভ করে; বাকি কাজ হল এজেন্ট নির্বাচন এবং prompt tuning, যা আপনি যেভাবেই হোক ফোকাস করতে চেয়েছিলেন।
:::
  `,

  "debugging-pipeline-issues": `
## পাইপলাইন সমস্যা ডিবাগিং

যখন একটি pipeline run ব্যর্থ হয়, canvas একটি লাল সূচক সহ ব্যর্থ এজেন্টকে চিহ্নিত করে এবং সেই ধাপে run pauses করে। history থেকে ব্যর্থ run খুলুন (বা live canvas-এ সূচকে ক্লিক করুন) এবং debug panel এজেন্টের input, error, ব্যর্থতা পর্যন্ত trace, এবং ব্যর্থ হওয়ার আগে এজেন্ট যে কোন আংশিক output তৈরি করেছে তা দেখায়। একই panel থেকে আপনি শুধু ব্যর্থ ধাপ retry করতে পারেন বা শুরু থেকে পুরো pipeline rerun করতে পারেন।

সবচেয়ে সাধারণ pipeline failures হল data-shape mismatches — একটি upstream এজেন্ট downstream এজেন্ট আশা করে এমন থেকে সামান্য ভিন্ন format-এ output তৈরি করে। connection inspector (যেকোনো সংযোগে ক্লিক করুন) সবচেয়ে সাম্প্রতিক রানে এটির মধ্য দিয়ে যাওয়া ডেটা দেখায়, যা সাধারণত mismatch সনাক্ত করার জন্য যথেষ্ট।

### মূল পয়েন্ট

- **ব্যর্থ ধাপ হাইলাইট করা** — canvas-এ লাল সূচক, debug panel-এ সম্পূর্ণ error
- **Connection inspector** — লাইভ বা last-run ডেটা পাস হওয়া দেখতে যেকোনো সংযোগে ক্লিক করুন
- **ব্যর্থ ধাপ থেকে Retry** — সমস্যা ঠিক করুন এবং পুনরায় শুরু করুন; সফল upstream পর্যায়গুলি পুনরায় চলে না
- **Step-by-step replay** — একটি ব্যর্থতা deterministically reproduce করতে একই input দিয়ে যেকোনো অতীত pipeline execution পুনরায় চালান
- **Connection validation** — canvas প্রি-চেক করতে পারে upstream এবং downstream এজেন্টদের সামঞ্জস্যপূর্ণ input/output shapes আছে কিনা (run time-এর আগে mismatches ধরে)

### এটি কীভাবে কাজ করে

pipeline engine একটি agent run errors হলে কাঠামোগত failure events নির্গত করে। debug panel এই events-এ সাবস্ক্রাইব করে এবং প্রাসঙ্গিক trace + inspector রেন্ডার করে। Retry-from-step engine দ্বারা সমর্থিত: এটি ব্যর্থ agent-কে একই upstream context-এ পুনরায় পাঠায়, pipeline run-এর বাকিটা সংরক্ষণ করে।

:::tip
বেশিরভাগ pipeline failures connection issues, agent issues নয়। যখন কিছু ভেঙে যায়, প্রথমে ব্যর্থ এজেন্টকে ফিড করা সংযোগগুলি পরিদর্শন করুন — এটি আসলে কী shape পেয়েছিল? এটি "agent ভুল ছিল"-এর চেয়ে "ডেটা ভুল ছিল" অনেক বেশি ঘন ঘন; connection inspector আপনাকে এক মিনিটেরও কম সময়ে কোন ক্ষেত্র তা বলে।
:::
  `,
};
