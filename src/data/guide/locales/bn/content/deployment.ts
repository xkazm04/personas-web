export const content: Record<string, string> = {
  "local-vs-cloud-execution": `
## লোকাল বনাম ক্লাউড এক্সিকিউশন

Personas এজেন্টরা দুটি জায়গায় চলে: আপনার লোকাল মেশিনে (ডেস্কটপ অ্যাপের নিজস্ব ইঞ্জিন) বা একটি remote orchestrator-এ (আমাদের দ্বারা cloud-managed, বা আপনার নিজস্ব infrastructure-এ BYOI)। Local হল default এবং out of the box কাজ করে; cloud হল opt-in (Team / Builder tier) এবং আপনার মেশিন চালু না থাকা ছাড়াই 24/7 availability সক্ষম করে। একই agent prompt, tools, এবং credentials যেকোনো environment-এ কাজ করে — স্যুইচ করা একটি deployment decision, একটি redesign নয়।

সিদ্ধান্ত নেওয়া কারণগুলি সাধারণত uptime এবং observability requirements। development, testing, exploratory এজেন্ট, এবং যেকোনো কিছুর জন্য Local দুর্দান্ত যেখানে আপনি কাজ দেখার চারপাশে আছেন। scheduled overnight রান, webhook এজেন্টদের জন্য Cloud সঠিক পছন্দ যা আপনি ঘুমানোর সময় reachable হতে হবে এবং যেকোনো production-grade automation যেখানে "my laptop was closed" একটি ব্যর্থতা mode হতে পারে না।

:::compare
**Local Execution** [default]
ডেস্কটপ অ্যাপের ইঞ্জিনে চলে। অ্যাপটি খোলা থাকাকালীন উপলব্ধ। শূন্য setup। ডেটা এবং credentials কখনই আপনার মেশিন ছেড়ে যায় না। আপনি যে UI-এর সাথে তৈরি করেন সেই একই UI-তে সম্পূর্ণ live observability। development, testing, supervised কাজ এবং যেকোনো privacy-sensitive-এর জন্য সেরা।
---
**Cloud Execution**
orchestrator-এ চলে (managed cloud বা BYOI)। আপনার লোকাল মেশিন নির্বিশেষে 24/7 উপলব্ধ। Setup হল এককালীন। ডেটা এবং credentials orchestrator-এ transit-এ এবং এতে rest-এ এনক্রিপ্ট করা হয়। ফলাফল আপনার ডেস্কটপে sync হয়। schedules, webhooks, এবং production-grade unattended কাজের জন্য সেরা।
:::

### এটি কীভাবে কাজ করে

Local এজেন্টরা in-app execution engine দ্বারা পাঠানো হয় — অ্যাপের অন্য সবকিছু যে same path ব্যবহার করে। Cloud এজেন্টরা deployed: এজেন্টের সম্পূর্ণ configuration (prompt, tools, credentials by reference, triggers) orchestrator-এ পাঠানো হয়, যা একটি long-lived এজেন্ট প্রক্রিয়া চালায় যা server-side triggers পরিচালনা করে। ফলাফল ডেস্কটপ অ্যাপে stream হয়ে ফিরে আসে এবং local রানের মতো একই monitoring views-এ প্রদর্শিত হয়।

:::tip
লোকাল ডেভেলপ এবং পরীক্ষা করুন, তারপর যা কাজ করে তা cloud-এ deploy করুন। local engine-এর সবচেয়ে দ্রুত edit-test loop আছে; cloud হল যেখানে আপনি এমন এজেন্ট রাখেন যাদের schedule বা availability গুরুত্বপূর্ণ। আপনাকে globally একটি বা অন্যটি বাছতে হবে না — সাধারণ সেটআপে বেশিরভাগ এজেন্ট local এবং মুষ্টিমেয় production cloud-এ থাকে।
:::
  `,

  "connecting-to-the-cloud-orchestrator": `
## ক্লাউড অর্কেস্ট্রেটরের সাথে সংযোগ

একটি orchestrator-এর সাথে সংযোগ করতে Deployment → Cloud Deploy খুলুন। দুটি পথ: **managed orchestrator** (আমরা এটি হোস্ট করি; আপনি আপনার অ্যাকাউন্ট দিয়ে authenticate করেন এবং আপনি 30 সেকেন্ডে সম্পন্ন) বা **BYOI** (আপনি আপনার নিজস্ব infrastructure-এ orchestrator হোস্ট করেন; আপনি ডেস্কটপ অ্যাপকে আপনার endpoint-এ নির্দেশ করেন এবং একটি auth key প্রদান করেন)। যেভাবেই হোক, connection প্রতি মেশিনে এককালীন এবং অ্যাপ restart জুড়ে স্থায়ী হয়।

একবার সংযুক্ত হলে, প্রতিটি এজেন্টের Settings ট্যাব একটি "Deploy to cloud" বিকল্প অর্জন করে। Deployment trigger করা এজেন্টের configuration orchestrator-এ আপলোড করে এবং এর জন্য একটি long-lived server-side প্রক্রিয়া শুরু করে। Cloud এজেন্টরা local-এর মতো একই monitoring views-এ প্রদর্শিত হয়, একটি ছোট cloud icon দিয়ে tagged।

:::steps
1. **Deployment → Cloud Deploy খুলুন** — সাইডবার → Deployment → Cloud Deploy
2. **environment বাছুন** — Managed Cloud (one-click sign-in) বা BYOI (আপনার orchestrator URL + auth key লিখুন)
3. **BYOI-এর জন্য**: orchestrator URL এবং auth token পেস্ট করুন; wizard একটি connection test চালায় এবং orchestrator version compatibility যাচাই করে
4. **Managed-এর জন্য**: "Sign in" ক্লিক করুন; OAuth flow আপনার Personas account-এর বিরুদ্ধে authenticate করতে খোলে
5. **Save** — connection স্থায়ী হয়; এজেন্টরা এখন তাদের Settings ট্যাবে একটি "Deploy to cloud" বিকল্প দেখায়
:::

:::warning
BYOI auth token-কে অন্য যেকোনো credential-এর মতো আচরণ করুন: এটি ভল্টে সংরক্ষণ করুন (Connections → Credentials → Custom), এটিকে chat-এ পেস্ট করবেন না বা version control-এ commit করবেন না। যে কেউ token ধারণ করে orchestrator-এ যেকোনো এজেন্ট deploy এবং undeploy করতে পারে।
:::

### এটি কীভাবে কাজ করে

orchestrator হল একটি long-running server প্রক্রিয়া (per environment একটি) যা deployed agent configurations ধরে রাখে এবং schedule-এ, webhook event-এ, বা চাহিদা অনুযায়ী চালায়। ডেস্কটপ অ্যাপ এবং orchestrator-এর মধ্যে যোগাযোগ mutual auth সহ TLS-এর উপরে। Deployed এজেন্টদের credentials deploy time-এ orchestrator-এর per-tenant key ব্যবহার করে এনক্রিপ্ট করা হয় এবং রানের সময় শুধুমাত্র orchestrator প্রক্রিয়ার ভিতরে ডিক্রিপ্ট হয়।

:::tip
কিছু deploy করার আগে connection পরীক্ষা করুন। wizard-এর connection test version compatibility এবং reachability যাচাই করে — যদি এটি ব্যর্থ হয়, ব্যর্থতাটি এখন তিনটি এজেন্ট deploy করার চেষ্টা করার পরে ডায়াগনস করার চেয়ে অনেক সহজ।
:::
  `,

  "deploying-an-agent-to-the-cloud": `
## ক্লাউডে একটি এজেন্ট ডিপ্লয় করা

একটি orchestrator সংযুক্ত হলে, যেকোনো এজেন্ট deploy করা এর Settings ট্যাবে একটি বোতাম। deploy action এজেন্টের সম্পূর্ণ configuration (prompt, tools, credential references, trigger definitions, settings) প্যাকেজ করে এবং TLS-এর উপরে orchestrator-এ পাঠায়। orchestrator validates, এজেন্ট সেট আপ করে, এবং server-side তার triggers পরিচালনা শুরু করে। প্রথম রান সাধারণত সেকেন্ডের মধ্যে ঘটে।

একই এজেন্টের Local এবং cloud কপি একই auto-sync সিস্টেমের মাধ্যমে sync-এ থাকে যা সমস্ত desktop ↔ cloud coordination পরিচালনা করে। আপনি local-এ এজেন্ট iterate করতে এবং প্রস্তুত হলে re-deploy করতে পারেন; আপনাকে দুটি environments-এর মধ্যে বাছাই করতে হবে না।

:::steps
1. **orchestrator connection যাচাই করুন** — Deployment → Cloud Deploy "Connected" দেখাতে হবে
2. **এজেন্ট খুলুন** — Agents পৃষ্ঠা → আপনি যেটি deploy করতে চান
3. **Settings tab → Deploy to Cloud** — deployment section-এ বোতাম
4. **deployment summary পর্যালোচনা করুন** — পাঠানো credentials, সক্রিয় হওয়া triggers, model selection, failover settings; সবকিছু আপনি local-এ পরীক্ষা করেছেন তার সাথে মেলানো উচিত
5. **Confirm Deploy** — orchestrator configuration পায়, validates, এজেন্ট সেট আপ করে; status সেকেন্ডে "Deployed"-এ ফ্লিপ করে
6. **dashboard-এ যাচাই করুন** — Overview → Activity এজেন্টকে একটি cloud icon সহ দেখায়; পরবর্তী scheduled / webhook event cloud instance-এ route করবে
:::

:::warning
Cloud এজেন্টরা cloud-side ভল্ট থেকে credentials ব্যবহার করে, আপনার local vault সরাসরি নয়। deploy action credential *references* (এনক্রিপ্টেড) পাঠায় এবং orchestrator সেগুলিকে server-side resolve করে। যদি একটি credential local-only বা replicated না হয়, deploy একটি "credential not available in cloud" warning সারফেস করবে এবং সম্পূর্ণ করার আগে আপনাকে হয় replicate করতে বা একটি বিকল্প বাছতে বলবে।
:::

### এটি কীভাবে কাজ করে

Deployment atomic: হয় orchestrator সম্পূর্ণ configuration গ্রহণ করে এবং এজেন্ট live যায়, অথবা এটি reject করে (একটি নির্দিষ্ট কারণ সহ) এবং server-side কিছু পরিবর্তন হয় না। একবার deployed হলে, orchestrator trigger evaluation-এর মালিক হয় — আপনার local app আর সেই এজেন্টের জন্য schedules / webhooks fire করে না (আপনি অন্যথায় duplicates পাবেন)। ডেস্কটপ অ্যাপ থেকে Manual রান একই connection-এর উপরে cloud instance-এ routed হয়।

:::tip
cloud দিয়ে শুরু করার সময় scheduled এজেন্টদের প্রথমে deploy করুন। তারা 24/7 uptime থেকে সবচেয়ে বেশি লাভবান হয়, এবং সেগুলি যাচাই করা সবচেয়ে সহজ (আপনি আপনার ল্যাপটপ খোলা হোক বা না হোক রানটি তার প্রত্যাশিত schedule-এ অবতরণ করতে দেখবেন)।
:::
  `,

  "cloud-execution-monitoring": `
## ক্লাউড এক্সিকিউশন মনিটরিং

Cloud এজেন্টরা local এজেন্টদের মতো একই Overview পৃষ্ঠাগুলি থেকে দৃশ্যমান — একই Activity feed, একই Health ট্যাব, একই Usage breakdowns। একটি ছোট cloud icon cloud এজেন্টদের local থেকে আলাদা করে। যেকোনো cloud execution-এ ক্লিক করুন এবং আপনি একটি local রানের মতো সম্পূর্ণ trace পান: রেন্ডার করা prompt, model call, tool calls, output, cost।

ডেস্কটপ অ্যাপ খোলা থাকাকালীন orchestrator-কে ক্রমাগত poll করে এবং সংযুক্ত থাকাকালীন live event streams-এ সাবস্ক্রাইব করে, তাই আপনি যা দেখেন তা সেকেন্ডে measured delay সহ live state, মিনিটে নয়। যখন অ্যাপটি বন্ধ থাকে, orchestrator নিজেই সবকিছু চালিয়ে রাখে; পরে অ্যাপ খোলা orchestrator-এর authoritative store থেকে local state catch up করে।

### মূল পয়েন্ট

- **Unified monitoring surface** — local এবং cloud এজেন্টরা একই Activity / Health / Usage views শেয়ার করে
- ডেস্কটপ সংযুক্ত থাকাকালীন **Live event streaming**; orchestrator-side persistence গ্যারান্টি দেয় আপনি অফলাইন থাকাকালীন কিছু হারিয়ে যায় না
- **Cloud icon** cloud-resident এজেন্টদের আলাদা করে
- **cloud-এ Cost attribution** — usage charts environment দ্বারা ভাঙা local এবং cloud spending উভয়ই অন্তর্ভুক্ত করে
- **reconnect-এ Catch-up** — extended offline সময়ের পরে অ্যাপ খোলা orchestrator থেকে সমস্ত মিস হওয়া events syncs করে

### এটি কীভাবে কাজ করে

Cloud এজেন্টরা local এজেন্টদের মতো একই execution এবং event records নির্গত করে; orchestrator সেগুলিকে server-side সংরক্ষণ করে এবং সংযোগে ডেস্কটপ অ্যাপে replicates করে। Activity feed chronological order-এ local এবং cloud event streams মিশ্রিত করে, তাই একটি mixed local + cloud setup দুটি parallel-এর পরিবর্তে একটি unified view-এর মতো দেখায়।

:::tip
day one থেকে cloud এজেন্টদের উপর per-day budget caps সেট করুন। Cloud এজেন্টদের কোনো implicit "I'm watching this happen" check নেই যা local manual রানের আছে; per-day cap হল একটি রানওয়ে prompt-এর বিরুদ্ধে আপনার safety net রাতারাতি।
:::
  `,

  "github-actions-integration": `
## GitHub Actions একীকরণ

এজেন্টরা তাদের Connectors ট্যাবে GitHub tool-এর মাধ্যমে GitHub Actions workflows ট্রিগার করতে পারে, এবং GitHub Actions standard webhook trigger-এর মাধ্যমে এজেন্টদের ট্রিগার করতে পারে। দুটি প্যাটার্ন ভালভাবে একত্রিত হয়: একটি GitHub event (PR opened, push to main, release tagged) একটি webhook fire করে যা একটি Personas এজেন্ট শুরু করে, এজেন্ট তার কাজ করে, এবং (প্রয়োজনে) এজেন্ট তার output-এর অংশ হিসাবে একটি workflow ট্রিগার করে।

GitHub connector Catalog-এ shipped (Connections → Catalog → Developer Tools → GitHub)। Auth হল OAuth বা একটি fine-grained PAT — যখন এজেন্টের শুধুমাত্র read access প্রয়োজন তখন OAuth পছন্দনীয়; workflows dispatching-এর মতো write operations-এর জন্য PATs ভালভাবে কাজ করে।

### মূল পয়েন্ট

- inbound webhook-এর মাধ্যমে **GitHub → Personas** — standard webhook trigger; এজেন্টের URL-এ POST করতে GitHub কনফিগার করুন
- GitHub tool-এর মাধ্যমে **Personas → GitHub** — এজেন্ট workflows পাঠাতে পারে, PR-এ মন্তব্য করতে পারে, issues খুলতে পারে, GitHub API যা প্রকাশ করে তার যেকোনো কিছু
- **Scoped auth** — read-mostly এজেন্টদের জন্য OAuth, write operations-এর জন্য fine-grained PAT; প্রতি এজেন্টে ন্যূনতম scopes
- **Live status sync** — agent traces workflow_dispatch request এবং GitHub-এর response দেখায়; প্রয়োজনে এজেন্ট workflow সম্পূর্ণ হওয়ার জন্য অপেক্ষা করতে পারে

### এটি কীভাবে কাজ করে

:::diagram
[GitHub event] --> [Inbound webhook] --> [Agent decides] --> [GitHub tool dispatches workflow] --> [Workflow result back into trace]
:::

GitHub tool GitHub REST/GraphQL APIs wrap করে এবং এজেন্টকে উচ্চ-স্তরের actions প্রকাশ করে: "dispatch workflow", "comment on PR", "open issue", "merge PR", ইত্যাদি। এজেন্টের prompt trigger-এর উপর ভিত্তি করে এটি যে action নেবে তার নাম দেয়; tool auth, payload construction, এবং response handling পরিচালনা করে।

:::warning
আপনার GitHub plan সমর্থন করলে যখনই classic PATs-এর উপর fine-grained PATs ব্যবহার করুন। Classic PATs বিস্তৃত org-wide অনুমতি প্রদান করে; fine-grained PATs নির্দিষ্ট repositories এবং নির্দিষ্ট permission scopes-এ সীমাবদ্ধ করে, যা token লিক হলে blast radius নাটকীয়ভাবে tightens করে।
:::

:::tip
target হিসাবে একটি low-stakes workflow দিয়ে শুরু করুন — যেমন একটি "notify Slack" workflow যা শুধু একটি বার্তা পোস্ট করে। একবার agent → GitHub Actions handoff প্রমাণিত হলে, উচ্চ-stakes targets-এ স্নাতক হোন (deploy, release-cut, ইত্যাদি)।
:::
  `,

  "gitlab-ci-cd-integration": `
## GitLab CI/CD একীকরণ

Personas দুটি উপায়ে GitLab-এর সাথে integrate করে: একটি direct GitLab plugin যা এজেন্টদের API-level access দেয় (pipeline status, MR comments, issue management), এবং একটি GitLab CI YAML export যা আপনার বিদ্যমান pipelines-এর ভিতরে Personas এজেন্টদের পদক্ষেপ হিসাবে চালায়। উভয়ই ship; আপনার team-এর workflow shape-এর সাথে মানানসই একটি বাছুন।

plugin (Plugins → GitLab) API-side integration পরিচালনা করে: install, authenticate, এবং আপনার এজেন্টরা উচ্চ-স্তরের actions (start pipeline, comment on MR, manage issues) সহ একটি \`gitlab\` tool surface পায়। CI YAML export অন্য দিকে যায় — আপনার এজেন্টরা আপনার GitLab CI pipelines-এ পদক্ষেপ হয়ে যায়, GitLab runners দ্বারা executed, পরবর্তী পদক্ষেপগুলিতে ফলাফল ফরোয়ার্ড সহ।

### মূল পয়েন্ট

- **GitLab plugin** — API-level integration; এজেন্ট তার Connectors ট্যাব থেকে একটি tool হিসাবে GitLab ব্যবহার করে
- **CI YAML export** — এজেন্ট আপনার GitLab pipeline-এ একটি পদক্ষেপ হয়; আপনার GitLab runners-এ চলে
- **দ্বিদিকীয়** — GitLab events এজেন্ট ট্রিগার করতে পারে (webhook), এবং এজেন্টরা GitLab pipelines ট্রিগার করতে পারে (plugin)
- **Token scopes** — ন্যূনতম প্রয়োজনীয় অনুমতিতে scoped project access tokens বা group access tokens ব্যবহার করুন
- **Pipeline events as triggers** — \`Pipeline succeeded\`, \`Pipeline failed\`, \`MR merged\` সব webhook trigger-এর মাধ্যমে consumable

### এটি কীভাবে কাজ করে

plugin credential vault-এ সংরক্ষিত GitLab API tokens ব্যবহার করে। যখন একটি এজেন্ট একটি GitLab tool action invokes করে, engine API call পাঠায়, response ক্যাপচার করে, এবং model-এর পরবর্তী turn-এর জন্য tool result হিসাবে এটি ফিরিয়ে দেয়।

CI export-এর জন্য: এজেন্টের Settings ট্যাব → Export → GitLab CI YAML খুলুন। wizard একটি job definition তৈরি করে যা একটি CI-runnable shape-এ এজেন্টকে wrap করে (সাধারণত Personas CLI সহ একটি Docker image plus এজেন্টের reference)। আপনার repository-র \`.gitlab-ci.yml\`-এ generated YAML commit করুন; এজেন্ট আপনার pipeline-এর অংশ হিসাবে অন্যান্য CI jobs-এর পাশাপাশি চলে।

:::warning
exported CI YAML AI provider keys-এর মতো জিনিসগুলির জন্য credential variables references করে। আপনার project settings-এ এগুলিকে **masked, protected** GitLab CI/CD variables হিসাবে সংজ্ঞায়িত করুন — pipeline YAML আপনার repo-তে থাকে এবং read access থাকা যে কারো কাছে দৃশ্যমান, তাই YAML file-এ secrets hardcode করবেন না।
:::

:::tip
বেশিরভাগ teams-এর জন্য plugin হল lighter-weight option। CI YAML export সবচেয়ে দরকারী যখন এজেন্টকে যেভাবেই হোক একটি GitLab runner-এর ভিতরে চালাতে হবে (network isolation, internal-network resources, compliance-mandated infrastructure) — অন্যথায় plugin আপনাকে Personas-এ এজেন্ট রাখতে দেয় যেখানে এর observability এবং debugging সবচেয়ে সমৃদ্ধ।
:::
  `,

  "n8n-workflow-integration": `
## n8n ওয়ার্কফ্লো একীকরণ

n8n হল একটি জনপ্রিয় open-source workflow automation tool, এবং Personas এটির সাথে দ্বিদিকীয়ভাবে integrate করে। আপনি বিদ্যমান n8n workflows-কে Personas-এ templates হিসাবে import করতে পারেন (Templates → n8n Import) — import wizard workflow JSON parse করে এবং n8n nodes-কে সমতুল্য Personas এজেন্ট, connectors, এবং triggers-এ map করে। আপনি একটি এজেন্টের inbound webhook URL invoke করতে HTTP/webhook nodes ব্যবহার করে n8n থেকে Personas এজেন্টদের call-ও করতে পারেন।

n8n import হল one-way এবং one-time: এটি workflow-এর *shape* Personas-এ আনে, কিন্তু এটি n8n original-কে synced রাখে না। import-এর পরে, imported pipeline স্বাধীনভাবে edit করার জন্য আপনার।

### মূল পয়েন্ট

- **n8n → Personas import** — Templates → n8n Import; workflow JSON parse করে, nodes-কে Personas equivalents-এ map করে
- **Personas → n8n trigger** — n8n-এর HTTP/webhook nodes একটি এজেন্টের webhook trigger URL-এ POST করতে পারে
- **n8n → Personas trigger** — n8n একটি n8n workflow-এর অংশ হিসাবে একটি Personas agent webhook call করতে পারে; agent-এর response (configurable) n8n-এ ফিরে যায়
- **Not synced** — imported pipelines তাদের n8n source থেকে diverge হয়; import-কে এককালীন শুরুর বিন্দু হিসাবে আচরণ করুন
- **Mapped node coverage** — importer সাধারণ nodes (HTTP, function, IF, switch) পরিচালনা করে; exotic / community nodes ম্যানুয়াল completion-এর জন্য placeholders হিসাবে import হতে পারে

### এটি কীভাবে কাজ করে

import wizard n8n workflow JSON (workflow-এ n8n → "Download" থেকে export) পড়ে, প্রতিটি node-কে এর নিকটতম Personas equivalent-এ map করে (HTTP nodes → tools, function nodes → এজেন্ট, IF/switch → conditional routing, ইত্যাদি), এবং ফলাফলটিকে একটি pipeline হিসাবে stage করে যা আপনি গ্রহণ করার আগে preview করেন। mapping হল best-effort: importer confidently map করতে পারে না এমন যে কোন কিছু আপনার পূরণ করার জন্য একটি note সহ একটি placeholder হয়ে যায়।

বিপরীত দিকের জন্য, Personas এজেন্টের webhook URL শুধু একটি URL — যেকোনো n8n HTTP node এটি call করতে পারে। request body হিসাবে input পাস করুন; এজেন্ট প্রক্রিয়া করে এবং (ঐচ্ছিকভাবে) এর output সহ synchronously উত্তর দেয়।

:::tip
n8n "moving data between services" plumbing-এ excel করে; Personas "thinking"-এ excel করে — analyzing, deciding, writing। সবচেয়ে শক্তিশালী combined workflows orchestration-এর জন্য n8n plus AI-powered decision points-এর জন্য Personas এজেন্ট ব্যবহার করে, একটিতে সব করার চেষ্টা করার পরিবর্তে।
:::
  `,

  "byoi-bring-your-own-infrastructure": `
## BYOI — Bring Your Own Infrastructure

BYOI (Builder tier) মানে আমাদের managed cloud ব্যবহার করার পরিবর্তে আপনি নিজে orchestrator চালান। আপনি আপনার নিজস্ব infrastructure-এ orchestrator software (একটি Docker image এবং একটি Kubernetes Helm chart হিসাবে provided) install করেন, আপনার preferences-এ এটি কনফিগার করেন (auth, storage, networking), এবং ডেস্কটপ অ্যাপকে আপনার orchestrator URL-এ নির্দেশ করেন। সেই বিন্দু থেকে, deploying এজেন্ট managed cloud-এর মতোই কাজ করে — তারা শুধু আপনার hardware-এ চলে।

BYOI হল সঠিক পছন্দ যখন data sovereignty গুরুত্বপূর্ণ (regulatory environments, customer-data isolation, air-gapped networks), যখন আপনার বিদ্যমান infrastructure আছে যা আপনি leverage করতে চান (managed hosting-এর জন্য অতিরিক্ত প্রদান করার পরিবর্তে), বা যখন আপনি runtime environment-এর উপর সম্পূর্ণ নিয়ন্ত্রণ চান (custom networking, specific availability guarantees, আপনার বিদ্যমান observability stack-এর সাথে integration)।

### মূল পয়েন্ট

- **Self-hosted orchestrator** — release অনুযায়ী Docker image + Helm chart প্রকাশিত
- **Data sovereignty** — execution data, credentials, এবং traces কখনই আপনার infrastructure ছাড়ে না
- **একই এজেন্ট semantics** — একটি BYOI orchestrator-এ deployed এজেন্টরা managed cloud-এর মতোই আচরণ করে
- **আপনার auth, আপনার storage, আপনার network** — orchestrator আপনার বিদ্যমান identity provider, database, এবং network policies-এর সাথে integrate করে
- **Builder-tier feature** — orchestrator software license-এর জন্য Builder subscription প্রয়োজন

### এটি কীভাবে কাজ করে

orchestrator একটি long-lived server process হিসাবে চলে। Docker image single-node deployments-এর জন্য self-contained; Helm chart shared storage সহ HA multi-node setups সমর্থন করে। Auth OIDC providers-এর সাথে integrate করে তাই আপনি আপনার বিদ্যমান SSO ব্যবহার করতে পারেন; storage Postgres (managed বা self-hosted) ব্যবহার করে; credential vault encryption keys আপনার পছন্দের KMS-এ থাকে (Vault, AWS KMS, GCP KMS, Azure Key Vault)।

একটি BYOI orchestrator-এ একটি এজেন্ট deploy করা ডেস্কটপ অ্যাপের দৃষ্টিকোণ থেকে managed cloud-এর সাথে অভিন্ন — একই UI, একই flow, একই observability। orchestrator endpoint শুধু আমাদের পরিবর্তে আপনার installation-এ point করার জন্য কনফিগার করা হয়েছে।

:::info
BYOI সত্যিকারের infrastructure কাজ। orchestrator software ভাল ডকুমেন্টেড এবং Helm chart বেশিরভাগ setup পরিচালনা করে, কিন্তু আপনার এখনও production server software চালানোর সাথে স্বাচ্ছন্দ্যপূর্ণ কারো প্রয়োজন হবে। সেই capacity ছাড়া teams-এর জন্য, managed cloud হল ভাল শুরুর বিন্দু — requirements পরিবর্তন হলে পরে BYOI-তে স্যুইচ করুন।
:::

:::tip
আপনি যদি এটিতে নতুন হন তবে প্রথমে একটি staging environment-এ BYOI চালান। setup guide-এ একটি "minimal local stack" Docker Compose অন্তর্ভুক্ত রয়েছে যা একটি একক মেশিনে orchestrator + Postgres + Vault চালায় — production hardware deploying-এর আগে moving parts কাজ করার জন্য নিখুঁত।
:::
  `,

  "syncing-desktop-and-cloud": `
## ডেস্কটপ এবং ক্লাউড সিঙ্ক করা

যখন আপনার একটি cloud orchestrator-এ deployed এজেন্ট থাকে, ডেস্কটপ অ্যাপ স্বয়ংক্রিয়ভাবে দুটির মধ্যে state synced রাখে। একটি deployed এজেন্টে Local edits (prompt change, settings tweak, credential rotation) save-এ orchestrator-এ push করে। Cloud-side events (execution results, trigger fires, health changes) ডেস্কটপে sync করে এবং monitoring views-এ প্রদর্শিত হয়।

ডেস্কটপ সংযুক্ত থাকাকালীন Sync ক্রমাগত background-এ চলে। যখন অ্যাপটি অফলাইন থাকে, local changes queue করে এবং reconnected হলে push করে; cloud events server-side accumulate করে এবং reconnect-এ stream down করে। status bar একটি ছোট indicator সহ sync state দেখায় (green = সম্পূর্ণ synced, amber = sync in progress / queued changes, red = sync error needs attention)।

### মূল পয়েন্ট

- **দ্বিদিকীয়, স্বয়ংক্রিয়** — local changes save-এ push করে; cloud events ক্রমাগত stream down করে
- **Offline-tolerant** — offline-এর সময় local changes queue করে এবং reconnect-এ push করে; cloud catch-up-এর জন্য events সংরক্ষণ করে
- **Conflict detection** — যদি একই এজেন্ট locally এবং remotely edited হয় (যেমন একই orchestrator ব্যবহার করে একজন teammate দ্বারা), ডেস্কটপ commit করার আগে সমাধান করতে প্রম্পট করে
- **Status indicator** — bottom-bar element live sync state দেখায়
- **Manual sync** — explicit sync trigger-এর জন্য indicator-এ ক্লিক করুন; disconnecting-এর ঠিক আগে দরকারী

### এটি কীভাবে কাজ করে

Sync একটি per-resource version vector ব্যবহার করে। প্রতিটি এজেন্ট, credential, trigger, এবং execution record একটি version বহন করে যা পরিবর্তনে increment হয়। Sync হল "আমার versions পাঠান, কোনো নতুনগুলি গ্রহণ করুন" — efficient, conflict-aware। Conflicts (rare, কিন্তু shared-orchestrator setups-এ সম্ভব) একটি resolution prompt হিসাবে সারফেস করে; আপনি বাছেন কোন version জেতে বা manually merge করেন।

:::tip
অর্থপূর্ণ পরিবর্তনের পরে sync indicator-এ একবার দেখুন। Green মানে অ্যাপ বন্ধ করা এবং cloud সর্বশেষটি আছে তা বিশ্বাস করা নিরাপদ। Amber মানে পরিবর্তনগুলি in flight — disconnecting করার আগে কয়েক সেকেন্ড অপেক্ষা করুন যদি আপনি নিশ্চিত হতে চান।
:::
  `,

  "cloud-troubleshooting": `
## ক্লাউড সমস্যা সমাধান

বেশিরভাগ cloud issues একটি ছোট সেটে পড়ে: orchestrator unreachable (network / firewall / orchestrator down), credential mismatch (একটি এজেন্ট যে credential ব্যবহার করে তা orchestrator side-এ replicated নয়), version mismatch (ডেস্কটপের চেয়ে পুরানো release-এ orchestrator, missing features), বা out-of-sync configuration (local-এ unsaved changes রয়েছে যা push হয়নি)। Deployment → Cloud Deploy status পৃষ্ঠা হল একক সেরা diagnostic surface — এটি orchestrator health, sync state, এবং নির্দিষ্ট failure reasons সহ per-agent deployment status দেখায়।

agent-level issues-এর জন্য (এজেন্ট deployed কিন্তু চলছে না, cloud-এ রান ব্যর্থ কিন্তু locally সফল), এজেন্টের Health ট্যাব local-এর জন্য যেমন cloud-এর জন্য একই diagnostics দেখায় — credential status, recent failure reasons, configuration completeness। execution trace-ও দেখায় একটি রান cloud বা local-এ executed হয়েছে কিনা, তাই আপনি "cloud-only" issues দ্রুত isolate করতে পারেন।

### সাধারণ সমস্যা এবং Fixes

| Symptom | সম্ভাব্য কারণ | Fix |
|---|---|---|
| এজেন্ট schedule-এ চলছে না | Orchestrator unreachable, বা cloud-side trigger disabled | Deployment status চেক করুন; যদি trigger state stale হয় তবে redeploy করুন |
| প্রথম cloud রানে Credential error | Credential orchestrator-এ replicated নয় | Deployment → Cloud Deploy → "Sync credentials"; এজেন্টের Connectors ট্যাব যাচাই করুন |
| ডেস্কটপে ফলাফল প্রদর্শিত হচ্ছে না | রান হওয়ার সময় Sync paused বা app offline | sync indicator ক্লিক করুন; reconnect-এ events stream down করে |
| Cloud এজেন্ট local-এর চেয়ে ধীর | deploy-এ ভিন্ন model / provider কনফিগার করা; বা এজেন্ট থেকে AI provider-এ network latency | Cloud Deploy detail view-এ এজেন্টের effective config চেক করুন |
| Deploy-এ "Version mismatch" error | পুরানো release-এ Orchestrator | orchestrator upgrade করুন (BYOI) বা managed-cloud rollout-এর জন্য অপেক্ষা করুন |

### এটি কীভাবে কাজ করে

Deployment status পৃষ্ঠা ডেস্কটপ সংযুক্ত থাকাকালীন orchestrator-কে ক্রমাগত poll করে এবং ফলাফলটিকে একটি একক dashboard হিসাবে রেন্ডার করে। প্রতিটি deployed এজেন্টের একটি per-resource status (healthy / degraded / unreachable) রয়েছে নির্দিষ্ট issue নামকরণ সহ। বেশিরভাগ issues-এর status row থেকে সরাসরি অফার করা one-click resolution রয়েছে।

:::warning
"Redeploy" অনেক cloud issues-এর জন্য সহজতম fix, কিন্তু এটি *current local state* orchestrator-এ push করে। যদি আপনার পর্যালোচনা না করা local changes থাকে (বা, একটি shared orchestrator-এ, cloud-এ এমন changes আছে যা local-এ পৌঁছায়নি), redeploying সেগুলিকে overwrite করতে পারে। সর্বদা প্রথমে sync state চেক করুন — যদি amber হয়, redeploying-এর আগে sync resolve করুন।
:::

:::tip
সবচেয়ে সাধারণ cloud issue হল "আমি cloud vault-এ একটি credential replicate করতে ভুলে গেছি"। কোনো এজেন্ট deploying-এর আগে, deploy wizard প্রি-চেক credential availability এবং warns; এটিকে dismiss করার পরিবর্তে সেই warning-এ মনোযোগ দিন, এবং বেশিরভাগ cloud-side credential errors অদৃশ্য হয়ে যায়।
:::
  `,
};
