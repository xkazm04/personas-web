export const content: Record<string, string> = {
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

};
