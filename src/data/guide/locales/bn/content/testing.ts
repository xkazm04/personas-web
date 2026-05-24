export const content: Record<string, string> = {
  "why-test-your-agents": `
## কেন আপনার এজেন্ট পরীক্ষা করবেন?

পরীক্ষা হল আপনি কীভাবে এজেন্টদের নির্ভরযোগ্য রাখেন যখন আপনি পুনরাবৃত্তি করেন। প্রতিটি prompt edit, প্রতিটি model swap, প্রতিটি নতুন tool আপনি যোগ করেন এজেন্টের আচরণ এমনভাবে পরিবর্তন করে যা আপনি diff পড়া থেকে সম্পূর্ণভাবে ভবিষ্যদ্বাণী করতে পারেন না। পরীক্ষা সেই অনিশ্চয়তাকে প্রমাণে পরিণত করে: প্রতিনিধি ইনপুটের বিরুদ্ধে নতুন সংস্করণটি চালান, পূর্ববর্তী সংস্করণের সাথে তুলনা করুন, দেখুন আপনি যে জিনিসগুলিকে উন্নত করতে চেয়েছিলেন তা উন্নত করেছেন কিনা এবং আপনি যে জিনিসগুলিকে চাননি সেগুলিতে regress করেননি কিনা।

প্রতিটি এজেন্টের editor-এ Lab ট্যাব হল যেখানে এটি ঘটে। এটির চারটি মোড রয়েছে — Arena, A-B, Matrix, Eval — প্রতিটি একটি ভিন্ন প্রশ্নের উত্তর দেয়। Arena একই প্রম্পটে মডেল তুলনা করে। A-B একই মডেলে দুটি প্রম্পট তুলনা করে। Matrix প্রম্পট components-এর সংমিশ্রণ পরীক্ষা করে। Eval হল সম্পূর্ণ গ্রিড: প্রতিটি প্রম্পট × প্রতিটি মডেল।

### মূল পয়েন্ট

- **প্রথম দিকে regressions ধরুন** — প্রতিটি পরিবর্তনের পরে পরীক্ষা হল আপনি কীভাবে "এজেন্ট আগে কাজ করত, আমি কী ভেঙেছি?" এড়ান
- **পদ্ধতিগতভাবে বিকল্পগুলি তুলনা করুন** — Arena এবং A-B আপনাকে gut feel-এর পরিবর্তে প্রমাণ সহ বিকল্পগুলির মধ্যে বেছে নিতে দেয়
- **fitness data তৈরি করুন** — Lab রান per-prompt স্কোর জমা করে যা genome evolution (Builder tier) ফিড করে
- **পুনঃব্যবহারযোগ্য ইনপুট সেট** — পরীক্ষার ইনপুট প্রতি এজেন্টে সংরক্ষিত হয়; একই প্রম্পট, একই ডেটা, পুনরাবৃত্তিযোগ্য তুলনা

### এটি কীভাবে কাজ করে

প্রতিটি Lab mode সমান্তরালে একাধিক agent variants (ভিন্ন প্রম্পট, ভিন্ন মডেল, বা উভয়) একই trigger payload পাঠায়। আউটপুট পরিমাণগত মেটাডেটা (সময়কাল, খরচ, token count) এবং আপনার subjective rating বোতাম সহ পাশাপাশি উপস্থাপিত হয়। ফলাফলগুলি এজেন্টের পরীক্ষার ইতিহাসে অবতরণ করে এবং fitness scoring-এ এগিয়ে যায়।

:::tip
একটি prompt regression ধরার সবচেয়ে সস্তা মুহূর্ত হল আপনি এটি লেখার ঠিক পরে। প্রতিটি prompt edit-এ আগের prompt version-এর বিরুদ্ধে Lab → A-B আপনার অভ্যাস করুন; তিন দিন পরে production রানে একটি regression আবিষ্কার করার চেয়ে friction অনেক কম।
:::
  `,

  "the-testing-lab-overview": `
## Testing Lab ওভারভিউ

প্রতিটি এজেন্টের editor-এ Lab ট্যাব একটি workspace যার চারটি mode। আপনি যা শিখতে চাইছেন তার দ্বারা mode বাছুন:

### চারটি Mode

:::compare
**Arena**
একই প্রম্পট, একাধিক মডেল। সমান্তরালে Claude / GPT / Gemini / local-এর মাধ্যমে একটি ইনপুট পাঠায়। "এই এজেন্টের জন্য কোন মডেলটি সঠিক?"-এর জন্য সেরা
---
**A-B**
দুটি প্রম্পট, একই মডেল। অভিন্ন শর্তে এর পূর্বসূরির বিরুদ্ধে একটি prompt পরিবর্তন তুলনা করুন। "এই edit কি জিনিসগুলিকে উন্নত করেছে?"-এর জন্য সেরা
---
**Matrix**
Combinatorial। প্রম্পট components সংজ্ঞায়িত করুন এবং matrix প্রতিটি সমন্বয় পরীক্ষা করে (3 × 4 = 12 variants)। "আমার একাধিক প্রতিদ্বন্দ্বী আইডিয়া আছে — কোন combo জিতবে?"-এর জন্য সেরা
---
**Eval**
সম্পূর্ণ গ্রিড: N prompts × M models। যখন আপনি প্রম্পট *এবং* মডেল একসাথে অপ্টিমাইজ করতে চান তখন সম্পূর্ণ চিত্র। যখন একটি বড় পরিবর্তন টেবিলে থাকে তখন সেরা।
:::

### এটি কীভাবে কাজ করে

প্রতিটি mode একই input picker (manual entry, কাঠামোগত JSON-এর একটি পেস্ট, বা এই এজেন্টের ইতিহাস থেকে একটি বাস্তব past execution-এর replay) এবং একই rating UI শেয়ার করে। আউটপুট কলামগুলি একটি নিয়মিত execution-এর মতো সম্পূর্ণ trace (model call, tool calls, decision branches)-এর জন্য প্রসারিত হয়। ফলাফলগুলি পরীক্ষার ইতিহাসে test mode ট্যাগ সহ সংরক্ষিত হয়, তাই আপনি mode দ্বারা অতীতের পরীক্ষাগুলি browse করতে পারেন।

Chained এজেন্টদের জন্য, Lab শুধুমাত্র এই এজেন্ট পরীক্ষা করে — upstream-কে আপনি নির্দিষ্ট করা ইনপুট ব্যবহার করে mock করা হয়, তাই আপনি পুরো chain পুনরায় না চালিয়ে একটি pipeline-এর এক পর্যায়ে পুনরাবৃত্তি করতে পারেন।

:::tip
বেশিরভাগ সপ্তাহে, Arena এবং A-B যথেষ্ট। Matrix "আমার তিনটি যুক্তিসঙ্গত refactors আছে এবং তুলনা করতে চাই"-এর জন্য, Eval "আমি একটি বড় rewrite বা tier পরিবর্তন বিবেচনা করছি"-এর জন্য। ডিফল্টভাবে heavy mode-এর জন্য পৌঁছাবেন না — সস্তাগুলি সাধারণত যথেষ্ট।
:::
  `,

  "arena-testing": `
## Arena পরীক্ষা

Arena সমান্তরালে একাধিক মডেলে একই প্রম্পট এবং একই ইনপুট পাঠায়, তারপর ফলাফলগুলি পাশাপাশি রাখে। খরচ এবং সময়কাল আউটপুটের পাশে দেখানো হয় তাই আপনি তিনটি অক্ষে তুলনা করছেন — মান (আপনার বিচার), গতি (engine-পরিমাপ করা), এবং খরচ (token-by-token)।

সবচেয়ে সাধারণ ব্যবহার হল model-selection decision: "এই এজেন্টটি Sonnet 4.6-এ চলছে, Haiku 4.5 কি 1/30তম খরচে ধরে রাখতে পারে?" Arena সপ্তাহের production observation-এর পরিবর্তে একটি পরীক্ষায় উত্তর দেয়।

### মূল পয়েন্ট

- **Parallel dispatch** — সমস্ত মডেল একবারে চলে; মোট wall-clock সময় = সবচেয়ে ধীরটি, যোগফল নয়
- **পাশাপাশি আউটপুট** — প্রতিটি মডেলের সম্পূর্ণ আউটপুট ট্যাব না পাল্টে দৃশ্যমান
- **খরচ + সময়কাল দেখানো হয়** — প্রতিটি আউটপুটের নীচে, টেক্সটের মতো একই দৃশ্যে
- **প্রতি কলামে Rating UI** — প্রতি মডেলে thumbs-up / thumbs-down / star; ratings এজেন্টের fitness data-এ স্থায়ী হয়
- **ইতিহাস থেকে Replay** — Arena পরীক্ষাগুলি এই এজেন্টের যেকোনো past execution থেকে ইনপুট টানতে পারে, তাই আপনি বাস্তব আকারে পরীক্ষা করছেন

### এটি কীভাবে কাজ করে

Arena এজেন্টের বর্তমান প্রম্পট এবং tool configuration ব্যবহার করে নির্বাচিত প্রতি মডেলে একটি execution পাঠায়। প্রতিটি execution স্বাধীন (পৃথক trace, পৃথক cost accounting) এবং \`arena\` ট্যাগ করা যাতে এটি এজেন্টের সাধারণ production metrics-এর বিরুদ্ধে গণনা না হয়। ফলাফলগুলি কলাম হিসাবে প্রদর্শিত হয়; আপনি প্রতিটি কলামকে রেট করেন; ratings এই এজেন্টের জন্য per-model fitness data-এ ফিড করে।

:::tip
প্রতি Arena রানে সর্বাধিক 3 মডেল বাছুন। এর বেশি এবং পাশাপাশি পড়া বিশৃঙ্খল হয়ে যায়। আপনি যদি 5+ মডেল বিবেচনা করছেন, একাধিক Arena pairwise চালান এবং প্রতিটি রাউন্ডে কোন মডেল জিতেছে তার একটি চলমান mental note রাখুন।
:::
  `,

  "ab-testing-prompts": `
## A-B প্রম্পট পরীক্ষা

A-B একই মডেলে দুটি prompt variants-এর মাধ্যমে একই ইনপুট চালায়, তাই একমাত্র পরিবর্তনশীল হল prompt। এটি একটি prompt edit মূল্যায়ন করার জন্য সঠিক tool: পূর্ববর্তী সংস্করণটি A হিসাবে, নতুন সংস্করণটি B হিসাবে লোড করুন, প্রতিনিধি ইনপুটে চালান, এবং দেখুন কোনটি আপনি যে ফলাফল চান তা তৈরি করে।

Lab-এর version picker prompt-এর সংস্করণ ইতিহাসের সাথে একীভূত — আপনাকে পুরানো সংস্করণটি কপি-পেস্ট করতে হবে না, শুধু dropdown থেকে এটি বাছুন। এটি "গত সপ্তাহের কার্যকরী সংস্করণের সাথে আমার বর্তমান draft তুলনা করুন"-কে one-click setup করে তোলে।

### মূল পয়েন্ট

- **দুটি prompts, একটি মডেল, একটি ইনপুট** — single-variable তুলনা
- **সংস্করণ ইতিহাস থেকে বাছুন** — A বা B এই এজেন্টের prompt-এর যেকোনো অতীত সংস্করণ হতে পারে
- **একই trace fidelity** — উভয় variants সম্পূর্ণ execution traces পায়, তাই আপনি tool-call patterns তুলনা করতে পারেন, শুধু চূড়ান্ত আউটপুট নয়
- **একাধিক ইনপুট রাউন্ড** — generalization পরীক্ষা করতে ক্রমে বিভিন্ন ইনপুটের বিরুদ্ধে A-B চালান, শুধু একটি ভাগ্যবান ক্ষেত্রে নয়
- **fitness-এ স্কোর স্থায়ী** — A-B ratings একই fitness data ফিড করে যা Arena এবং genome ব্যবহার করে

### এটি কীভাবে কাজ করে

A-B engine উভয় prompts-কে স্বাধীন executions হিসাবে পাঠায় এবং ফলাফল প্যানেলে A এবং B লেবেল করে। তার বাইরে, সেগুলি নিয়মিত executions — একই trace, একই cost accounting, কিন্তু \`ab_test\` ট্যাগ করা তাই সেগুলি পরীক্ষার ইতিহাসে ফিল্টারযোগ্য এবং production metrics-কে দূষিত করে না।

:::code-compare
### Version A
Summarize the document.
Keep it short.
---
### Version B
Summarize the document in exactly
3 bullet points. Each bullet should
be one sentence. Start with the
most important finding.
:::

:::warning
প্রতি A-B রাউন্ডে একটি জিনিস পরিবর্তন করুন। যদি B A থেকে *both* format *and* tone *and* length-এ ভিন্ন হয়, আপনি বলতে পারবেন না কোন মাত্রা score পরিবর্তন ঘটিয়েছে। একটি পরিবর্তন করুন, A-B চালান, গ্রহণ বা প্রত্যাখ্যান করুন, তারপর পরবর্তী পরিবর্তন করুন।
:::
  `,

  "matrix-testing": `
## Matrix পরীক্ষা

Matrix হল combinatorial A-B-C-D-… একসাথে। আপনি আপনার prompt-কে components হিসাবে সংজ্ঞায়িত করেন (intro × instructions × output-format, উদাহরণস্বরূপ) এবং matrix প্রতিটি সমন্বয় তৈরি করে, সবগুলিকে পাঠায় এবং fitness score দ্বারা ফলাফলগুলিকে র‍্যাঙ্ক করে।

প্রতিটির 3টি বিকল্প সহ 3 components মানে 27 সমন্বয় — আপনি ম্যানুয়ালি যে পরীক্ষা করবেন তার চেয়ে অনেক বেশি কিন্তু engine-এর জন্য সমান্তরালে ফ্যান আউট করা সহজ। matrix সবচেয়ে দরকারী যখন আপনার একটি prompt কীভাবে গঠন করবেন সে সম্পর্কে একাধিক প্রতিদ্বন্দ্বী আইডিয়া আছে এবং আপনি অনুমান করা একটির পরিবর্তে আসলে সবচেয়ে ভাল পারফর্ম করে এমন combination খুঁজে পেতে চান।

### মূল পয়েন্ট

- **Components সংজ্ঞায়িত করুন, combinations পান** — matrix components-কে সমস্ত বৈধ combinations-এ প্রসারিত করে
- **Parallel dispatch** — প্রতিটি combo সাথে সাথে চলে (provider rate limits সাপেক্ষে)
- **র‍্যাঙ্কড ফলাফল** — fitness-scored গ্রিড, সেরা থেকে সবচেয়ে খারাপ পর্যন্ত সাজানো
- **Component-level attribution** — দেখুন কোন components উচ্চ স্কোরের সাথে correlate করে; এমনকি যখন আপনি verbatim top winner গ্রহণ করেন না তখনও দরকারী
- **জয়ী combo সংরক্ষণ** — জয়ী combination-কে এজেন্টের active prompt হিসাবে সেট করতে one-click

### এটি কীভাবে কাজ করে

আপনি matrix ট্যাবে variants-এর একটি labeled set হিসাবে প্রতিটি component সংজ্ঞায়িত করেন। engine প্রতিটি combination-কে একটি renderable prompt হিসাবে নির্মাণ করে এবং প্রতিটিকে একটি স্বাধীন execution হিসাবে পাঠায়। ফলাফলগুলি আপনার বেছে নেওয়া fitness signal (rating, cost-per-quality, speed, custom) দ্বারা র‍্যাঙ্কড একটি গ্রিডে aggregated হয়। Per-component attribution combinations জুড়ে fitness গড় করে গণনা করা হয় যা সেই component শেয়ার করে — তাই যদি কোনো একক জয়ী stand out না করে, আপনি শিখবেন কোন intro / instruction style / output format গড়ে সবচেয়ে ভাল পারফর্ম করে।

:::info
3 components × 3 options = 27 variants সহ। 4 × 4 = 256 সহ। matrix বড় গ্রিড পরিচালনা করতে পারে কিন্তু আপনি অনুপাত অনুসারে tokens পোড়াবেন। 3 × 3 দিয়ে শুরু করুন এবং কেবল প্রসারিত করুন যদি ফলাফল সত্যিই অস্পষ্ট হয়।
:::

:::tip
Matrix prompt-এর একটি বড় redesign-এর ঠিক পরে সবচেয়ে দরকারী। যখন আপনি নিশ্চিত নন নতুন গঠনটি পুরানোটির চেয়ে ভাল কিনা, কয়েকটি প্রতিনিধি ইনপুটের বিরুদ্ধে 3-4 candidate structures matrix-test করুন — winner আপনি আশা করার চেয়ে সাধারণত পরিষ্কার।
:::
  `,

  "eval-testing": `
## Eval পরীক্ষা

Eval হল সম্পূর্ণ গ্রিড: প্রতিটি prompt variant × প্রতিটি মডেল। আপনি prompts বাছেন (সাধারণত 2-3 candidates), models বাছেন (সাধারণত 2-4), এবং eval গ্রিড সমস্ত combinations চালায় এবং scores-এর একটি heatmap উপস্থাপন করে। সেরা prompt-model jodi হাইলাইট করা হয়।

এটি heavyweight mode — tokens-এ সবচেয়ে ব্যয়বহুল, coverage-এ সবচেয়ে পুঙ্খানুপুঙ্খ। এটি ব্যবহার করুন যখন আপনি একটি বড় সিদ্ধান্ত নিচ্ছেন যা উভয় অক্ষকে প্রভাবিত করে: "আমরা prompt rewrite এবং একটি সস্তা মডেলে যাওয়ার কথা ভাবছি, আমরা কি একবারে উভয়টি করতে এবং আমাদের quality bar আঘাত করতে পারি?"

### মূল পয়েন্ট

- **N prompts × M models** — উভয় মাত্রা জুড়ে scores-এর heatmap
- **সেরা combination হাইলাইট করা** — fitness-র‍্যাঙ্কড, optimal cell দৃশ্যমানভাবে চিহ্নিত
- **Per-axis breakdowns** — prompt পরিবর্তন বা model পরিবর্তন score পরিবর্তন চালিয়েছে কিনা দেখুন
- **Test-history tagged** — eval রান পরে পর্যালোচনার জন্য \`eval\` ট্যাগের অধীনে ইতিহাসে অবতরণ করে
- **One-click adopt** — সেরা combination (prompt version + model selection) live এজেন্টে প্রয়োগ করুন

### এটি কীভাবে কাজ করে

Eval সমান্তরালে \`prompts × models\` executions পাঠায় (provider rate limits সাপেক্ষে)। প্রতিটি cell তার নিজস্ব trace সহ একটি স্বাধীন execution। গ্রিড ভিউ prompt-model জোড়া দ্বারা aggregates করে; আপনি Arena এবং A-B-এর মতো একই UI ব্যবহার করে cells রেট করেন; fitness scores per-cell ranking-এ রোল আপ হয়। শীর্ষ cell হল সুপারিশকৃত combination — গ্রিড ভিউ থেকে সরাসরি এটি গ্রহণ করুন।

:::warning
Eval হল সবচেয়ে ব্যয়বহুল mode। 3 prompts × 4 models × 5 inputs = 60 executions, প্রতিটির নিজস্ব model call সহ। প্রতিনিধিত্বমূলক ইনপুট সেটে অল্প-অল্প চালান, এবং কেবল যখন সিদ্ধান্তটি সত্যিই উভয় অক্ষ অতিক্রম করে। prompt-only সিদ্ধান্তের জন্য, A-B; model-only সিদ্ধান্তের জন্য, Arena।
:::
  `,

  "rating-and-scoring-results": `
## ফলাফল রেটিং এবং স্কোরিং

যেকোনো Lab পরীক্ষার পরে, প্রতিটি আউটপুট সারিতে rating নিয়ন্ত্রণ রয়েছে: binary বিচারের জন্য thumbs-up / thumbs-down, বা সূক্ষ্ম ক্ষেত্রে 1-5 star scale। আপনার ratings দুটি জিনিস ফিড করে: এজেন্টের per-variant fitness score (matrix এবং eval-এ ranking-এ ব্যবহৃত, এবং Builder tier-এ genome-evolution selection pressure হিসাবে), এবং সময়ের সাথে আপনার সমস্ত পরীক্ষা জুড়ে একটি ব্যক্তিগত preference signal।

Ratings ব্যক্তিগত — তারা মানের আপনার বিচার এনকোড করে, একটি objective metric নয়। এটি ইচ্ছাকৃত; আপনি জানেন যে এজেন্টের আউটপুট আপনার যা প্রয়োজন তার সাথে মেলে কিনা, এবং এটি সেই সংকেত যা সিস্টেম optimize করে।

### মূল পয়েন্ট

- **Binary বা 1-5 star** — আপনি ধারাবাহিক হতে যা স্বাচ্ছন্দ্য বোধ করেন তা বাছুন
- **Per-output rating** — প্রতিটি পরীক্ষার আউটপুট নিজস্ব সারির rating নিয়ন্ত্রণ পায়; আপনি rate না করা পর্যন্ত স্বয়ংক্রিয়ভাবে কিছু aggregated হয় না
- **fitness scores চালায়** — ratings per-variant fitness signal ফিড করে যা Matrix / Eval / genome ব্যবহার করে
- **Feedback ইতিহাস স্থায়ী** — আপনি কখনও যে rating দিয়েছেন তা সংরক্ষিত; "আমি কি অতীতের পরীক্ষায় X-কে Y-এর চেয়ে বেশি rate করেছি?"-এর জন্য দরকারী
- **Consistency precision-এর চেয়ে গুরুত্বপূর্ণ** — একটি 4-star যা আপনি ধারাবাহিকভাবে দেবেন তা একটি 5-star-এর চেয়ে বেশি দরকারী যা আপনি একবার দেন এবং আর কখনও দেন না

### এটি কীভাবে কাজ করে

Ratings নির্দিষ্ট execution (trace, prompt version, model, input)-এর বিরুদ্ধে সংরক্ষিত হয়। fitness aggregator ratings + objective metrics (cost, duration, success) পড়ে এবং একটি per-variant fitness score গণনা করে যা ranking-এ ব্যবহৃত হয়। Genome evolution (Builder tier) parent prompts বাছাই করতে breeding-এর জন্য প্রাথমিক selection pressure হিসাবে ratings ব্যবহার করে।

:::tip
আপনি যা চান তার উপর ভিত্তি করে rate করুন, প্রযুক্তিগতভাবে impressive নয়। একটি ছোট সঠিক উত্তর প্রায়শই একটি দীর্ঘ বিস্তৃত উত্তরের চেয়ে ভাল। সিস্টেমটি আপনার preferences-এর বিরুদ্ধে optimize করে, তাই সৎ, ধারাবাহিক ratings *আপনার* বিচারের জন্য টিউন করা এজেন্ট তৈরি করে।
:::
  `,

  "genome-evolution-basics": `
## জিনোম ইভোলিউশন বেসিক

Genome evolution (Builder tier) আপনার সেরা-rated past tests থেকে নতুন prompt variants স্বয়ংক্রিয়ভাবে breed করে। প্রতিটি "generation" পূর্ববর্তী generation থেকে শীর্ষ-পারফর্মিং prompts mutate এবং recombines করে; বেশ কয়েকটি generation-এর উপর, prompts এমন configurations-এ converge করে যা আপনার শুরুর বিন্দুর চেয়ে ধারাবাহিকভাবে ভাল স্কোর করে। এটি আপনার ratings-কে fitness function হিসাবে ব্যবহার করে evolutionary search।

প্রক্রিয়াটি একবার শুরু করার পরে unattended। আপনি শুরুর prompt এবং fitness signal প্রদান করেন (সাধারণত আপনার rating history প্লাস ঐচ্ছিক objective metrics যেমন cost বা duration), population size এবং generation count সেট করেন এবং এটিকে চলতে দিন। এজেন্টের সাধারণ triggers evolution-এর সময় paused থাকে যাতে তুলনা পরিষ্কার থাকে।

:::info
Genome evolution kicked off হলে unattended। আপনি parameters সেট করেন, engine variations তৈরি করে, আপনার input set-এর বিরুদ্ধে সেগুলি পরীক্ষা করে, আপনার ratings দ্বারা সেগুলি স্কোর করে, এবং পরবর্তী generation-এ winners recombines করে। আপনি চূড়ান্ত population পর্যালোচনা করেন এবং ম্যানুয়ালি winner গ্রহণ করেন — সিস্টেম কখনও আপনার live prompt নীরবে পরিবর্তন করে না।
:::

### মূল পয়েন্ট

- **স্বয়ংক্রিয় variation + selection** — engine শীর্ষ-পারফর্মিং parents-এর mutations তৈরি করে এবং fitness-এর মাধ্যমে নির্বাচন করে
- **Generations + populations** — সাধারণ config হল প্রতিটি 8-12 variants-এর 5-10 generations
- **Fitness function = আপনার ratings** — প্রাথমিক signal; secondary signals (cost, duration) configurable weights
- **সমস্ত generations versioned** — প্রতিটি generated prompt এজেন্টের version history-তে সংরক্ষিত; কিছু হারিয়ে যায় না
- **Manual adoption** — engine কখনও নীরবে আপনার live prompt swap করে না; আপনি winner পর্যালোচনা করেন এবং গ্রহণ করেন

### এটি কীভাবে কাজ করে

প্রতিটি generation একটি parent population দিয়ে শুরু হয়। engine ছোট structured mutations (rewording, reordering sections, adjusting examples, ইত্যাদি) এবং crossover (দুটি parents থেকে segments মিলিয়ে) এর মাধ্যমে child variants তৈরি করে। প্রতিটি child আপনার input set-এর বিরুদ্ধে চলে; ratings fitness score তৈরি করে; শীর্ষ-স্কোরিং children পরবর্তী generation-এর জন্য parent population হয়ে যায়। কনফিগার করা generations সংখ্যা পরে, আপনি চূড়ান্ত র‍্যাঙ্কড population দেখেন এবং যেকোনো variant গ্রহণ করতে পারেন।

### এটি কার্যকর দেখুন

:::usecases
**Email triage tuning**
বর্তমান prompt 15% emails misclassifies করে
---
population 10-এর 5 generations চালান। একটি variant দিয়ে শেষ করুন যা 3% misclassifies করে — one-click সহ গ্রহণ করুন।
===
**Format consistency**
এজেন্টের আউটপুট format ইনপুট আকার জুড়ে অসঙ্গত
---
fitness signal হিসাবে format-conformance সহ একটি বৈচিত্র্যময় input set-এ genome evolves; আউটপুট stabilizes।
===
**Cost reduction without quality loss**
আপনি একটি leaner prompt খুঁজতে চান যা এখনও ভাল আউটপুট তৈরি করে
---
fitness function-এ নেতিবাচক weight সহ cost-per-token যোগ করুন; evolution ছোট prompts খুঁজে পায় যা rating বজায় রাখে।
:::

:::info
evolution-এর সময় তৈরি প্রতিটি variant এজেন্টের prompt history-তে versioned। যদি গৃহীত variant N+1 production-এ খারাপ আচরণ করে, variant N পুনরুদ্ধার করা one-click — কোনো কাজ হারিয়ে যায় না।
:::

:::tip
ধৈর্য ধরা সাধারণত প্রজন্ম 1 আপনার শুরুর prompt-এর চেয়ে নাটকীয়ভাবে ভাল হয় না — mutations ছোট এবং অনেকগুলি duds। প্রজন্ম 3-4 এর মধ্যে surviving population প্রকৃত উন্নতিতে concentrates; এটি সাধারণত যখন আপনি একটি স্পষ্ট winner দেখবেন।
:::
  `,

  "running-a-breeding-cycle": `
## একটি প্রজনন চক্র চালানো

একটি "breeding cycle" হল একটি সম্পূর্ণ evolution run: এজেন্ট বাছুন, parameters সেট করুন, kick off, wait, population পর্যালোচনা, adopt। প্রতিটি cycle হল আপনার বেছে নেওয়া input set-এর বিরুদ্ধে পরীক্ষিত M variants-এর N generations। মোট খরচ মোটামুটি \`generations × population × input-count × per-run-cost\` — parameters থেকে অনুমানযোগ্য।

Lab-এ Genome ট্যাব হল entry point। এটি প্রতিনিধিত্বমূলক শুরুর বিন্দুর জন্য টিউন করা default parameters (5 generations × 10 variants × 5 inputs) দিয়ে খোলে, যা অতিরিক্ত tokens না পুড়িয়ে অর্থপূর্ণ পরিবর্তন দেখার জন্য যথেষ্ট। আপনি যদি একটি ভারী বা হালকা cycle চান তবে kick off করার আগে parameters সামঞ্জস্য করুন।

:::steps
1. **Lab → Genome খুলুন** যে এজেন্টকে আপনি evolve করতে চান তাতে
2. **input set বাছুন** — manual entry, একটি saved set, বা replay-from-history
3. **fitness weights কনফিগার করুন** — rating weight (primary), cost weight (নেতিবাচক যদি আপনি ছোট চান), duration weight (নেতিবাচক যদি আপনি দ্রুত চান)
4. **generations এবং population সেট করুন** — 5 × 10 হল default; কঠিন সমস্যার জন্য উভয় বাড়ান, দ্রুত পরীক্ষার জন্য উভয় কমান
5. **Start Cycle ক্লিক করুন** — engine unattended চলে; আপনি অ্যাপটি খোলা রাখতে পারেন বা পরে ফিরে আসতে পারেন
6. **চূড়ান্ত population পর্যালোচনা করুন** — fitness দ্বারা র‍্যাঙ্কড, প্রতিটি variant-এর trace উপলব্ধ
7. **winner adopt করুন** — অথবা যেকোনো অন্য variant আপনি পছন্দ করেন; এজেন্টের active prompt আপডেট হয় এবং cycle-এর সম্পূর্ণ population version history-তে সংরক্ষিত হয়
:::

### এটি কীভাবে কাজ করে

প্রতিটি generation সমান্তরালে চলে: engine input set জুড়ে সমস্ত M variants সাথে সাথে পাঠায় (provider rate limits সাপেক্ষে), ফলাফল সংগ্রহ করে, fitness function-এর মাধ্যমে সেগুলি স্কোর করে, parents হিসাবে শীর্ষ performers নির্বাচন করে, পরবর্তী generation-এর জন্য children তৈরি করে, এবং চালিয়ে যায়। progress UI লাইভ per-generation সেরা এবং গড় fitness দেখায় যাতে আপনি দেখতে পারেন population উন্নতি করছে কিনা।

:::tip
একটি ছোট input set (3-5 প্রতিনিধিত্বমূলক ক্ষেত্রে) এবং default 5 × 10 cycle দিয়ে শুরু করুন। যদি ফলাফল স্পষ্টভাবে উন্নত হয়, আপনি সম্পন্ন। যদি এটি অস্পষ্ট হয়, input set প্রসারিত করুন এবং পূর্ববর্তী winner থেকে শুরু করে আরেকটি cycle চালান। Iterating cycles প্রায়শই একটি বিশাল cycle-কে বিট করে।
:::
  `,

  "adopting-evolved-prompts": `
## বিবর্তিত প্রম্পট গ্রহণ করা

যখন একটি breeding cycle শেষ হয়, আপনি fitness দ্বারা র‍্যাঙ্কড চূড়ান্ত population দেখেন শীর্ষ variant হাইলাইট করা সহ। Adopting one-click — variant এজেন্টের active prompt হয়ে যায়, পূর্ববর্তী active prompt version history-তে সংরক্ষিত হয় (তাই rollback ও one-click), এবং cycle-এর সম্পূর্ণ population-ও সংরক্ষিত হয় যদি আপনি পরে একটি ভিন্ন variant গ্রহণ করতে চান।

adopt action যেকোনো অন্য prompt পরিবর্তনের মতো একই pre-flight check চালায়: setup-status যাচাই করে এজেন্টের credentials এবং tools এখনও বৈধ, version ইতিহাসে checkpointed হয়, এবং যদি এজেন্টের scheduled triggers থাকে, পরবর্তী scheduled run স্বয়ংক্রিয়ভাবে গৃহীত variant ব্যবহার করে।

### মূল পয়েন্ট

- র‍্যাঙ্কড population view থেকে **One-click adopt**
- **পূর্ববর্তী version সংরক্ষিত** ইতিহাসে; restore ও one-click
- **সম্পূর্ণ population সংরক্ষিত** — cycle থেকে যেকোনো variant পরে adoptable থাকে
- **Pre-flight check চলে** — setup-status verification, credential validation, trigger compatibility
- **Live triggers স্বয়ংক্রিয়ভাবে নতুন variant ব্যবহার করে** — কোনো পৃথক "deploy" পদক্ষেপ নেই

### কীভাবে গ্রহণ করবেন

:::steps
1. **breeding cycle শেষ হওয়ার জন্য অপেক্ষা করুন** — সাধারণত parameters-এর উপর নির্ভর করে 10-30 মিনিট
2. **চূড়ান্ত population view খুলুন** — fitness দ্বারা র‍্যাঙ্কড variants প্রতি variant-এ traces অ্যাক্সেসযোগ্য সহ
3. **শীর্ষ variant-এর prompt পড়ুন** — অপ্রত্যাশিত phrasing বা অদ্ভুত mutations-এর জন্য দ্রুত sanity check
4. **ঐচ্ছিকভাবে 2nd / 3rd-place variants পরিদর্শন করুন** — কখনও কখনও একটি সামান্য কম fitness অনেক ছোট / cleaner prompt-এর সাথে আসে
5. **আপনার পছন্দে Adopt ক্লিক করুন**; pre-flight check চলে; এজেন্টের active prompt atomically আপডেট হয়
6. **পরবর্তী live run যাচাই করুন** — সাধারণত একটি প্রতিনিধিত্বমূলক input সহ একটি Manual Run হল সবচেয়ে সস্তা নিশ্চিতকরণ যে গৃহীত variant test scores প্রতিশ্রুত আচরণ করে
:::

:::tip
Adopt ক্লিক করার আগে গৃহীত variant পড়ুন। Evolution high-fitness prompts খুঁজে পায়, কিন্তু মাঝে মাঝে একটি variant আপনার input set-এর কিছু quirk শোষণ করে ভাল স্কোর করে; prompt পড়া হল সুরক্ষা চেক যা "এটি আমার tests-ও pass করবে কিন্তু weird" ধরে।
:::
  `,

  "fitness-scoring-explained": `
## ফিটনেস স্কোরিং ব্যাখ্যা

Fitness হল একক সংখ্যা যা Matrix / Eval / Genome selection চালায়। এটি আপনার manual ratings (primary signal) objective metrics (cost, duration, success rate, output-length-target conformance, custom signals) সহ একটি weighted score-এ একত্রিত করে। আপনি প্রতি এজেন্ট বা প্রতি পরীক্ষায় weights কনফিগার করেন — ডিফল্টভাবে, ratings dominate এবং objective metrics হল tiebreakers।

score per variant per input গণনা করা হয়, তারপর test set-এর সমস্ত inputs জুড়ে aggregated হয়ে প্রতি variant-এ একটি fitness তৈরি করে। Variants aggregate fitness দ্বারা র‍্যাঙ্ক করা হয়; সেই ranking হল যা genome selection algorithm consumes এবং Lab UI winners হাইলাইট করতে ব্যবহার করে।

### মূল পয়েন্ট

- **প্রতি variant-এ একক aggregate score** — সাধারণত 0.0–1.0 বা 0–100 display preference-এর উপর নির্ভর করে
- **একাধিক input sources** — rating (primary), cost, duration, success, output-format conformance, custom fitness functions
- **প্রতি এজেন্ট weights** — যা গুরুত্বপূর্ণ তা জোর দিন; cost-sensitive এজেন্টদের জন্য, cost বেশি weight করুন; quality-sensitive-দের জন্য, rating বেশি weight করুন
- **inputs জুড়ে Aggregation** — variants প্রতিটি input-এ স্কোর করা হয় তারপর গড় করা হয়, তাই একটি variant যা একটি input-এ brilliant এবং অন্যটিতে ভাঙা একটি স্থির mediocre-এর চেয়ে খারাপ স্কোর করে
- **স্বচ্ছ breakdown** — per-signal অবদান দেখতে যেকোনো fitness সংখ্যায় ক্লিক করুন

### এটি কীভাবে কাজ করে

fitness aggregator execution results (cost, duration, success), rating history (per execution), এবং এজেন্টের জন্য নিবন্ধিত যেকোনো custom fitness signals পড়ে। প্রতিটি 0-1 range-এ normalized হয়, এর configured weight দ্বারা গুণিত হয়, এবং যোগ করা হয়। ফলাফল হল variant-এর fitness; test set-এর সমস্ত inputs জুড়ে aggregate হল displayed score।

:::tip
default weights (90% rating, 10% cost) বেশিরভাগ এজেন্টের জন্য টিউন করা। আপনি যদি নিজেকে eval / matrix tests-এ সিস্টেমের "winners"-এর সাথে disagreeing দেখেন, সবচেয়ে দরকারী সমন্বয় হল সাধারণত rating weight আরও বাড়ানো (95%) যাতে সিস্টেম আপনার বিচারকে আরও বিশ্বাস করে। খুব উচ্চ-volume এজেন্টদের জন্য cost weight বাড়ান যেখানে token cost একটি বাস্তব উদ্বেগ।
:::
  `,

  "test-history-and-trends": `
## পরীক্ষার ইতিহাস এবং ট্রেন্ড

আপনার চালানো প্রতিটি Lab পরীক্ষা এজেন্টের পরীক্ষার ইতিহাসে সংরক্ষিত। ইতিহাস ভিউ (Lab → History) তারিখ অনুসারে সাজানো অতীতের পরীক্ষাগুলি দেখায় mode tag, input set, fitness scores, এবং চূড়ান্ত ফলাফল (গৃহীত / প্রত্যাখ্যাত / superseded) সহ। পুনঃপর্যালোচনার জন্য বা একটি নতুন পরীক্ষায় parameters ক্লোন করার জন্য তার মূল mode-এ পুনরায় খুলতে যেকোনো অতীতের পরীক্ষায় ক্লিক করুন।

Trends sub-tab এজেন্ট-স্তরের metrics সময়ের সাথে plot করে — currently-active prompt-এর fitness, cost-per-run, duration-per-run, business-outcome rate। plot তাৎপর্যপূর্ণ ইভেন্টগুলির সাথে annotated (prompt changes, model swaps, trigger additions) যাতে আপনি live এজেন্টের metrics-এ প্রতিটি পরিবর্তনের প্রভাব দেখতে পারেন।

### মূল পয়েন্ট

- **প্রতিটি পরীক্ষা সংরক্ষিত** — সম্পূর্ণ input, output, ratings, fitness; কিছু GC'd হয় না
- **Mode-tagged** — একটি নির্দিষ্ট অতীতের পরীক্ষা খুঁজতে Arena / A-B / Matrix / Eval / Genome দ্বারা ফিল্টার করুন
- প্রতিটি অর্থপূর্ণ পরিবর্তন বিন্দুতে auto-annotation সহ **Trend chart**
- **বর্তমান অবস্থার সাথে একটি অতীতের পরীক্ষা তুলনা করুন** — "বর্তমান prompt কি এখনও তিন সপ্তাহ আগে আমি যে একটি প্রত্যাখ্যান করেছিলাম তার চেয়ে ভাল?"-এর জন্য দরকারী
- **Exportable** — বাহ্যিক analysis-এর জন্য test history CSV-তে exports

### এটি কীভাবে কাজ করে

পরীক্ষার ফলাফল production runs-এর মতো একই execution store-এ সংরক্ষিত হয়, ফিল্টারিং-এর জন্য test-mode tag সহ। Trends ভিউ এই store থেকে aggregates করে; auto-annotations version-history এবং configuration-history থেকে নিষ্কাশিত হয় (যা স্থায়ীও)। ইতিহাসে কিছুই mutable নয় — অতীতের পরীক্ষাগুলি কখন কী পরীক্ষা করা হয়েছিল তার immutable records।

:::tip
Trends ভিউ হল "আমার এজেন্ট কি আসলে সময়ের সাথে ভাল হচ্ছে?" উত্তর দেওয়ার একক সেরা জায়গা। মাসে একবার এটি খুলুন; যদি fitness trend সমতল বা নিম্নগামী হয়, সাম্প্রতিক পরিবর্তনগুলি সাহায্য করছে না এবং আরও পরিবর্তন শিপ করার চেয়ে চিন্তা করার সময় এসেছে।
:::
  `,
};
