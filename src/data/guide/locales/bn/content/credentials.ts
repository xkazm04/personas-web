export const content: Record<string, string> = {
  "how-personas-keeps-your-data-safe": `
## Personas কীভাবে আপনার ডেটা নিরাপদ রাখে

সুরক্ষা গোড়া থেকে Personas-এ তৈরি করা হয়েছে। API keys, tokens, এবং passwords আপনার নিজের মেশিনে একটি স্থানীয় এনক্রিপ্টেড ভল্টে থাকে — তারা একটি রান চলাকালীন এজেন্ট স্পষ্টভাবে একটি AI প্রোভাইডার বা তৃতীয়-পক্ষের পরিষেবায় না পাঠানো পর্যন্ত ডিভাইস ছেড়ে যায় না। ভল্ট ফাইলটি নিজেই **AES-256-GCM** দিয়ে এনক্রিপ্ট করা হয়েছে, এবং যে কীটি এটি আনলক করে তা আপনার OS-নেটিভ keyring (Windows DPAPI, macOS Keychain, Linux Secret Service) দ্বারা মোড়ানো হয় তাই plaintext keys কখনই ডিস্কে বসে না।

আপনি যখন একটি এজেন্ট চালান, ইঞ্জিন শুধুমাত্র সেই নির্দিষ্ট ক্রেডেনশিয়ালগুলি ডিক্রিপ্ট করে যা এজেন্টের প্রয়োজন, কলের সময়কালের জন্য মেমরিতে ধরে রাখে, তারপর plaintext মুছে দেয়। Logs, traces, এবং exports কখনও raw credential values ধারণ করে না — যেখানেই একটি ক্রেডেনশিয়াল প্রদর্শিত হবে, আপনি পরিবর্তে একটি token reference (\`cred:gmail-work\`) দেখতে পান।

### মূল পয়েন্ট

- **AES-256-GCM** — authenticated encryption (প্রতিটি ক্রেডেনশিয়ালের ciphertext integrity-checked, তাই একটি tampered vault file সনাক্ত করা হয়, নীরবে ডিক্রিপ্ট করা হয় না)
- **OS keyring–wrapped master key** — Windows-এ DPAPI, macOS-এ Keychain, Linux-এ Secret Service; প্রতিটি সেশনে টাইপ করার কোনো master password নেই
- **Local-only by default** — কিছুই আপলোড করা হয় না; cloud deploy opt-in এবং আপনার বেছে নেওয়া orchestrator-এ TLS-এর মাধ্যমে transit-এ এনক্রিপ্ট করে
- **logs-এ token references** — agent traces এবং exports raw secrets নয়, credential IDs ব্যবহার করে
- **Tamper-evident** — GCM authentication tags vault file-এর যেকোনো সংশোধন ধরে

### এটি কীভাবে কাজ করে

একটি ক্রেডেনশিয়াল সংরক্ষণ করা vault key (per-vault AES-256-GCM key, নিজেই OS keyring দ্বারা মোড়ানো) দিয়ে এটিকে এনক্রিপ্ট করে এবং ciphertext-কে local SQLite-এ লেখে। একটি এজেন্ট রানের সময় একটি ক্রেডেনশিয়াল ব্যবহার করা মেমরিতে এটি ডিক্রিপ্ট করে, এটি প্রাসঙ্গিক tool বা HTTP client-এ পাস করে এবং অবিলম্বে buffer ছেড়ে দেয়। raw value কখনই logged হয় না, প্রাথমিক এন্ট্রির পরে কখনই প্রদর্শিত হয় না, এবং এনক্রিপ্টেড ভল্টের বাইরে কোথাও serialized হয় না।

### এটি কার্যকর দেখুন

:::usecases
**Multiple services, isolated credentials**
আপনার এজেন্টরা Slack, GitHub, এবং Jira-এর সাথে কথা বলে
---
প্রতিটি ক্রেডেনশিয়াল তার নিজস্ব random nonce দিয়ে স্বাধীনভাবে এনক্রিপ্ট করা হয়। একটি record-এর সমঝোতা অন্যদের প্রকাশ করে না।
===
**Credential rotation**
একটি token মেয়াদ শেষ হয় বা ঘুরানো হয়
---
OAuth credentials provider-এর refresh token-এর মাধ্যমে স্বয়ংক্রিয়ভাবে রিফ্রেশ হয়। ম্যানুয়ালি-ঘুরানো keys আপনি কিছু পুনরায় শুরু না করে ক্রেডেনশিয়াল record-এ অদলবদল করেন।
===
**Audit-friendly traces**
আপনার প্রমাণ করতে হবে কোন ক্রেডেনশিয়াল কোথায় ব্যবহার করা হয়েছিল
---
প্রতিটি রানের trace যে credential ID ব্যবহার করেছে তা রেকর্ড করে। প্রকৃত মান কখনই প্রদর্শিত হয় না; provenance প্রদর্শন করার জন্য ID যথেষ্ট।
:::

:::info
ভল্টটি OS keyring-এর মাধ্যমে আপনার OS user account-এ আবদ্ধ। ভল্ট ফাইলটিকে একই OS সহ একটি ভিন্ন মেশিনে কপি করা এটি ডিক্রিপ্টযোগ্য করবে না — wrapping key OS keyring-এ থাকে এবং পোর্টেবল নয়।
:::

:::warning
আপনি যদি macOS বা Linux-এ আপনার OS account password পরিবর্তন করেন, keyring wrapping key পুনরায় লক করতে পারে। পরিবর্তনের পরে প্রথম রানে Personas নতুন ক্রেডেনশিয়ালের জন্য প্রম্পট করবে। যদি keyring মুছে ফেলা হয় (factory reset, account deletion), ভল্টটি পুনরুদ্ধারের অযোগ্য হয়ে যায় — স্থানীয় মেশিনের বাইরে disaster recovery প্রয়োজন হলে raw secrets বাহ্যিকভাবে ব্যাকআপ করুন।
:::

:::tip
local-only মডেল ব্যক্তিগত অটোমেশনের জন্য সঠিক ডিফল্ট। team / production কাজের জন্য যেখানে একাধিক মেশিনের একই ক্রেডেনশিয়াল প্রয়োজন, cloud deploy (Team / Builder tier) end-to-end এনক্রিপশন সহ orchestrator-এর মাধ্যমে vault state প্রতিলিপি করে।
:::
  `,

  "adding-a-new-credential": `
## একটি নতুন ক্রেডেনশিয়াল যোগ করা

Connections → Credentials খুলুন এবং \`Add Credential\` ক্লিক করুন। একটি category বাছুন (email, cloud storage, payments, communication, developer tools, CRM, AI provider, generic) — picker auth type, প্রয়োজনীয় fields, এবং label hints স্বয়ংক্রিয়ভাবে কনফিগার করা মিল-প্রি-নির্মিত কানেক্টর দেখায়। যদি আপনার পরিষেবাটি catalog-এ না থাকে, "Custom" বাছুন এবং নিজেই ক্রেডেনশিয়াল সংজ্ঞায়িত করুন (name, type, fields)।

OAuth-সমর্থনকারী পরিষেবাগুলির জন্য, ফ্লো provider-এর consent screen-এ একটি browser উইন্ডো খোলে। API-key পরিষেবাগুলির জন্য, secure input-এ key পেস্ট করুন। যেভাবেই হোক, ক্রেডেনশিয়াল এনক্রিপ্ট করা অবতরণ করে এবং picker matching category-এ একটি open capability slot সহ যেকোনো এজেন্টে এটি প্রয়োগ করার অফার দেয়।

### ধাপে ধাপে

:::steps
1. **Connections → Credentials-এ নেভিগেট করুন** — সাইডবার → Connections, তারপর Credentials ট্যাব
2. **Add Credential ক্লিক করুন** — credential তালিকার উপরের-ডানে বোতাম
3. **একটি category বাছুন** — email / storage / payments / ইত্যাদি; মিল connector catalog স্বয়ংক্রিয়ভাবে ফিল্টার হয়
4. **auth flow চালান** — OAuth একটি consent উইন্ডো খোলে; API-key পরিষেবাগুলি secure input field ব্যবহার করে
5. **নাম দিন এবং সংরক্ষণ করুন** — ক্রেডেনশিয়ালকে একটি label দিন যা আপনি চিনবেন ("Stripe Live", "Gmail Personal"); ক্রেডেনশিয়ালটি AES-256-GCM দিয়ে এনক্রিপ্ট করা হয় এবং স্থায়ী হয়
6. **ঐচ্ছিক: এখন এজেন্টে আবদ্ধ করুন** — picker matching open capabilities সহ এজেন্ট দেখায়; one-click bind তাদের পরে শিকার এড়ায়
:::

### এটি কীভাবে কাজ করে

আপনি যখন Save ক্লিক করেন, ক্রেডেনশিয়ালের raw value OS keyring থেকে নেওয়া vault key দিয়ে এনক্রিপ্ট করা হয়, তারপর credential store-এ কমিট করা হয়। save শুধুমাত্র credential ID এবং label ফেরত দেয় — raw value অবিলম্বে মেমরি থেকে মুছে ফেলা হয়। এই বিন্দু থেকে, agent editor-এর Connectors ট্যাব ID দ্বারা ক্রেডেনশিয়ালকে রেফারেন্স করতে পারে।

:::warning
agent prompts, code comments, বা chat windows-এ কখনও ক্রেডেনশিয়াল পেস্ট করবেন না। শুধুমাত্র secure credential input field ব্যবহার করুন — অন্য কিছু একটি log, sync, বা screenshot-এ raw value ক্যাপচার হওয়ার ঝুঁকি নেয়।
:::

:::tip
20+ ক্রেডেনশিয়াল থাকলে নামকরণ কনভেনশন গুরুত্বপূর্ণ। \`<service>-<env>-<account>\` ("stripe-live-main", "gmail-prod-support") অবিলম্বে স্পষ্ট করে যে আপনি একটি এজেন্টের Connectors ট্যাব কনফিগার করার সময় কোন ক্রেডেনশিয়াল বাছাই করবেন।
:::
  `,

  "oauth-setup-walkthrough": `
## OAuth সেটআপ ওয়াকথ্রু

OAuth হল পছন্দের auth flow পরিষেবাগুলির জন্য যা এটিকে সমর্থন করে (Google, GitHub, Slack, Linear, HubSpot, Twitter/X, Discord, ইত্যাদি)। আপনি একটি API key টাইপ বা পেস্ট করার পরিবর্তে, Personas provider-এর অফিসিয়াল consent screen-এ একটি browser উইন্ডো খোলে — আপনি সেখানে আপনার বিদ্যমান ক্রেডেনশিয়াল ব্যবহার করে সাইন ইন করেন, Personas যে নির্দিষ্ট scopes অনুরোধ করছে তা অনুমোদন করেন এবং provider অ্যাপে একটি scoped access token ফিরিয়ে দেয়। token vault-এ এনক্রিপ্ট করা অবতরণ করে; আপনার পাসওয়ার্ড কখনই Personas স্পর্শ করে না।

বেশিরভাগ OAuth tokens স্বল্প-জীবিত এবং একটি refresh token-এর সাথে জোড়া। Personas ব্যাকগ্রাউন্ডে access token বর্তমান রাখতে refresh token ব্যবহার করে — আপনি সাধারণত OAuth ক্রেডেনশিয়াল থেকে মেয়াদ শেষের বার্তা কখনই দেখবেন না যদি না provider refresh token-কে অবৈধ করে (সম্মতি প্রত্যাহার, পাসওয়ার্ড পরিবর্তন, সুরক্ষা ইভেন্ট)।

### ধাপে ধাপে

:::steps
1. **Connections → Credentials খুলুন** — সাইডবার → Connections → Credentials, তারপর \`Add Credential\`
2. **পরিষেবা বাছুন** — catalog category দ্বারা ফিল্টার হয়; OAuth-সমর্থনকারী পরিষেবাগুলি একটি "OAuth" auth-type ব্যাজ দেখায়
3. **Connect ক্লিক করুন** — provider-এর consent screen-এ একটি browser উইন্ডো খোলে
4. **সাইন ইন করুন এবং scopes অনুমোদন করুন** — অনুরোধ করা সঠিক অনুমতিগুলি পর্যালোচনা করুন; token ইস্যু করতে অনুমোদন করুন, বা বাতিল করতে অস্বীকার করুন
5. **নিশ্চিতকরণ অবতরণ করে** — browser উইন্ডো স্বয়ংক্রিয়ভাবে বন্ধ হয়; ক্রেডেনশিয়াল মঞ্জুর করা scopes তালিকাভুক্ত সহ আপনার ভল্টে প্রদর্শিত হয়; আপনি অবিলম্বে এজেন্টে এটি ব্যবহার করতে পারেন
:::

### এটি কীভাবে কাজ করে

:::diagram
[Click Connect] --> [Browser opens] --> [Sign in to provider] --> [Approve specific scopes] --> [Token + refresh stored encrypted]
:::

OAuth Personas-কে একটি *scoped* token দেয় — এটি ঠিক আপনি যা অনুমোদন করেছেন তা করতে পারে এবং অন্য কিছু নয়। প্রতিটি connector integration-এর বর্ণিত কার্যকারিতার জন্য ন্যূনতম scopes অনুরোধ করে (একটি summarizer agent-এর জন্য Gmail read-only, একটি auto-reply agent-এর জন্য Gmail read+send, ইত্যাদি)। আপনি ক্রেডেনশিয়াল কার্ডে মঞ্জুর করা scopes পর্যালোচনা করতে পারেন এবং আপনি যদি কখনও চান তবে provider-এর নিজস্ব সুরক্ষা সেটিংস থেকে সম্পূর্ণভাবে সেগুলি প্রত্যাহার করতে পারেন।

:::info
OAuth tokens সাধারণত স্বল্প-জীবিত (মিনিট থেকে ঘন্টা) এবং Personas দীর্ঘ-জীবিত refresh token ব্যবহার করে স্বয়ংক্রিয়ভাবে সেগুলি রিফ্রেশ করে। refresh token নিজেই মেয়াদ শেষ হলে (provider-নির্দিষ্ট, সাধারণত 90 দিন থেকে কখনও না), Personas আপনাকে পুনরায় প্রমাণীকরণ করতে প্রম্পট করে — consent flow-এর একটি one-click পুনরায় চালানো।
:::

:::tip
যেসব পরিষেবার জন্য আপনার OAuth এবং API-key বিকল্প উভয়ই আছে (যেমন OpenAI, Anthropic), যখন উপলব্ধ থাকে OAuth পছন্দনীয় কারণ scopes টাইট এবং একটি API key ঘুরানো ছাড়াই provider পাশ থেকে tokens বাতিল করা যেতে পারে। headless / programmatic ব্যবহারের জন্য API keys এখনও ঠিক আছে।
:::
  `,

  "understanding-the-credential-vault": `
## ক্রেডেনশিয়াল ভল্ট বোঝা

ভল্ট হল এনক্রিপ্টেড স্থানীয় স্টোর যেখানে প্রতিটি ক্রেডেনশিয়াল থাকে। যান্ত্রিকভাবে এটি অ্যাপের SQLite database-এর ভিতরে একটি AES-256-GCM-এনক্রিপ্টেড blob, যেখানে encryption key নিজেই OS-নেটিভ keyring দ্বারা মোড়ানো। ভল্ট কখনই সম্পূর্ণ-ডিক্রিপ্টেড অবস্থায় থাকে না — পৃথক ক্রেডেনশিয়ালগুলি এক-এ-এক, মেমরিতে, শুধুমাত্র যখন একটি এজেন্ট রানের প্রয়োজন তখন ডিক্রিপ্ট হয়।

ভল্টটি Connections → Credentials থেকে browseযোগ্য। আপনি ক্রেডেনশিয়ালের label, category, status (healthy / expiring soon / expired / broken), এবং dependencies (কোন এজেন্ট এটি ব্যবহার করে) দেখেন। প্রাথমিক এন্ট্রির পরে raw values কখনই দৃশ্যমান নয় — কোনো "show password" toggle নেই, ডিজাইন দ্বারা।

:::feature
**AES-256-GCM + OS-native keyring** color=#a855f7
GCM confidentiality এবং authenticated integrity উভয়ই প্রদান করে — একটি tampered vault file সনাক্ত করা হয়, garbage দিয়ে নীরবে ডিক্রিপ্ট হয় না। wrapping key DPAPI (Windows) / Keychain (macOS) / Secret Service (Linux)-এ থাকে, তাই এটি আপনার OS user account দ্বারা সুরক্ষিত, একটি পৃথক master password দ্বারা নয় যা আপনাকে টাইপ করতে হবে।
:::

### মূল পয়েন্ট

- **Per-credential AES-256-GCM** — প্রতিটি ক্রেডেনশিয়াল তার নিজস্ব nonce দিয়ে এনক্রিপ্ট করা হয়; একটি সমঝোতা cascade করে না
- **OS keyring vault key মোড়ায়** — পরিচালনা করার জন্য পৃথক master password নেই; সুরক্ষা আপনার OS account login থেকে আসে
- **Tamper detection** — GCM authentication tags যেকোনো সংশোধন ধরে; tampered records একটি স্পষ্ট error দিয়ে ডিক্রিপ্ট করতে ব্যর্থ হয়
- **Audit-friendly** — প্রতিটি ক্রেডেনশিয়াল অ্যাক্সেস timestamp, agent, এবং execution ID সহ logged হয়; raw values কখনই logged হয় না
- **OS account-এ আবদ্ধ** — ভল্ট ফাইলকে অন্য মেশিন বা user account-এ কপি করা এটি ব্যবহারযোগ্য করবে না

### এটি কীভাবে কাজ করে

যখন অ্যাপটি শুরু হয়, এটি OS keyring থেকে wrapped vault key চায়। keyring wrapping ডিক্রিপ্ট করে (OS-account-level protections ব্যবহার করে — DPAPI, Keychain, Secret Service) এবং মেমরিতে অ্যাপ প্রক্রিয়ায় vault key হস্তান্তর করে। সেখান থেকে, অ্যাপ চাহিদা অনুযায়ী পৃথক ক্রেডেনশিয়ালগুলি ডিক্রিপ্ট করতে পারে। vault key কখনই plaintext-এ ডিস্কে লেখা হয় না, এবং OS keyring একমাত্র জায়গা যা এটি তৈরি করতে পারে।

:::warning
আপনি যদি আপনার macOS বা Linux user password পরিবর্তন করেন, keyring wrapping key পুনরায় লক করতে পারে এবং পরবর্তী অ্যাক্সেসে এটিকে পুনরায় উদ্ভূত করতে প্রম্পট করতে পারে। এটি স্বাভাবিক এবং পুনরুদ্ধারযোগ্য। যদি OS account মুছে ফেলা হয় বা keyring রিসেট করা হয় (যেমন factory reset), ভল্টটি পুনরুদ্ধারের অযোগ্য হয়ে যায় — যেকোনো অপরিবর্তনীয় secrets বাহ্যিকভাবে ব্যাকআপ করুন।
:::

:::tip
ভল্ট সুরক্ষা binary: এটি হয় অক্ষত (OS account valid, keyring readable) বা ভাঙা (decrypt করতে পারে না)। কোনো "weak" মধ্যবর্তী অবস্থা নেই। ভল্ট সুরক্ষার জন্য আপনি যা করতে পারেন সবচেয়ে গুরুত্বপূর্ণ জিনিস হল আধুনিক OS সংস্করণ চালান এবং full-disk encryption ব্যবহার করুন (BitLocker, FileVault, LUKS) যাতে device-level threat model আবদ্ধ থাকে।
:::
  `,

  "credential-health-checks": `
## ক্রেডেনশিয়াল স্বাস্থ্য পরীক্ষা

ক্রেডেনশিয়ালগুলি সময়ের সাথে সাথে drift হয় — tokens মেয়াদ শেষ হয়, keys upstream-এ ঘুরানো হয়, OAuth scopes পরিবর্তিত হয়। ক্রেডেনশিয়াল স্বাস্থ্য পরীক্ষা একটি হালকা পরীক্ষা কল দিয়ে পর্যায়ক্রমে প্রতিটি সংরক্ষিত ক্রেডেনশিয়াল পিং করে (একটি no-op API অনুরোধ যা কোনো খরচ করে না এবং আপনাকে বলে ক্রেডেনশিয়ালটি এখনও বৈধ কিনা)। ফলাফলগুলি ক্রেডেনশিয়াল কার্ডে একটি স্ট্যাটাস সূচক হিসাবে এবং একটি ক্রেডেনশিয়াল হ্রাস পেলে alerts হিসাবে সারফেস করে।

পরীক্ষা শিডিউল কনফিগারযোগ্য। ডিফল্টভাবে, OAuth credentials দৈনিক পরীক্ষা করে (কারণ refresh-token flow-এর যেভাবেই হোক পর্যায়ক্রমে ক্রেডেনশিয়াল ব্যবহার করতে হবে), API-key credentials সাপ্তাহিক পরীক্ষা করে। ক্রেডেনশিয়াল কার্ড থেকে যেকোনো সময় Manual পরীক্ষা চালানো যেতে পারে।

### মূল পয়েন্ট

- **Per-credential status** — green (healthy), yellow (expiring soon / scope changed), red (broken / revoked)
- **Configurable cadence** — per-credential overrides যদি একটি পরিষেবা aggressive checking rate-limit করে
- **Manual check** — ক্রেডেনশিয়াল কার্ড থেকে one-click test; একটি নতুন এজেন্ট deploy করার আগে দরকারী
- **Expiry projection** — পরিচিত expiry তারিখ সহ ক্রেডেনশিয়ালগুলির জন্য (signed JWTs, scoped tokens), স্ট্যাটাস expiry-এর N দিন আগে yellow-এ ফ্লিপ হয় (configurable, default 7)
- **Alert routing** — failures আপনার agents-এর জন্য কনফিগার করা একই notification channels-এর মাধ্যমে route হয়

### এটি কীভাবে কাজ করে

প্রতিটি connector তার নিজস্ব স্বাস্থ্য পরীক্ষা কল সংজ্ঞায়িত করে (সম্ভব সবচেয়ে হালকা অনুরোধ যা ক্রেডেনশিয়াল ব্যবহার করে)। পরীক্ষাটি কনফিগার করা cadence-এ ব্যাকগ্রাউন্ডে চলে; ফলাফল স্থায়ী হয় এবং ক্রেডেনশিয়ালের স্ট্যাটাস আপডেট করে। যদি একটি পরীক্ষা ব্যর্থ হয়, স্ট্যাটাস ফ্লিপ হয়, ক্রেডেনশিয়াল কার্ড হাইলাইট হয়, এবং নির্ভরশীল এজেন্টগুলি তাদের নিজস্ব স্বাস্থ্য সূচকগুলিতে সতর্কতা উত্তরাধিকারী হয় — তাই একটি ভাঙা Gmail credential প্রতিটি Gmail-ব্যবহারকারী এজেন্টকে আপনি এটি ঠিক না করা পর্যন্ত yellow দেখায়।

:::tip
যেকোনো production deploy বা scheduled overnight রানের আগে একটি ম্যানুয়াল স্বাস্থ্য পরীক্ষা চালান। 3am-এ একটি token নীরবে ঘুরে যাওয়ার কারণে একটি ব্যর্থ রানের বিরুদ্ধে এখন পাঁচ সেকেন্ড।
:::
  `,

  "auto-credential-browser": `
## অটো-ক্রেডেনশিয়াল ব্রাউজার

auto-credential browser হল নতুন ক্রেডেনশিয়ালের জন্য catalog-চালিত onboarding। Connections → Catalog খুলুন এবং আপনি Personas যে প্রতিটি connector প্রি-কনফিগার করা শিপ করে দেখতে পাবেন: এই লেখার সময় 60+ পরিষেবা, category দ্বারা সংগঠিত (email, storage, payments, communication, developer tools, CRM, AI providers, ইত্যাদি)। প্রতিটি connector সঠিক auth type, প্রয়োজনীয় fields, OAuth scopes, API endpoints, এবং যেকোনো পরিষেবা-নির্দিষ্ট quirks জানে।

আপনি যখন একটি connector বাছেন, wizard সেই পরিষেবার জন্য সঠিক পদক্ষেপগুলির মধ্য দিয়ে আপনাকে নিয়ে যায় — পরিষেবার UI-তে নির্দিষ্ট পৃষ্ঠাগুলির লিঙ্ক সহ যেখানে আপনি একটি API key খুঁজে পাবেন, বা কোন OAuth scopes অনুমোদন করতে হবে, বা কোন অনুমতিগুলি গুরুত্বপূর্ণ। যেসব পরিষেবার জন্য Personas একটি সফল সংযোগ সনাক্ত করতে পারে (তাদের বেশিরভাগ), wizard সংরক্ষণ করার আগে রিয়েল-টাইমে যাচাই করে।

### মূল পয়েন্ট

- **60+ পূর্ব-কনফিগার করা connectors** — auth type, fields, scopes, endpoints বেক করা
- **পরিষেবা-নির্দিষ্ট গাইডেন্স** — সঠিক API-key পৃষ্ঠা বা settings ট্যাবের সরাসরি লিঙ্ক
- **Live validation** — wizard বেশিরভাগ পরিষেবার জন্য সংরক্ষণ করার আগে ক্রেডেনশিয়াল পরীক্ষা করে
- **Suggested-for-agent flow** — catalog একটি এজেন্টের Connectors ট্যাব থেকেও প্রবেশ করা যেতে পারে, যেখানে এটি open capability slot-এর সাথে মেলে এমন connectors-এ ফিল্টার করা হয়
- **নতুন connectors অনুরোধ করুন** — catalog-এ এখনও নেই এমন পরিষেবার অনুরোধ করা যেতে পারে; one-offs-এর জন্য, Generic / Custom connector type ব্যবহার করুন

### এটি কীভাবে কাজ করে

Connector definitions অ্যাপের সাথে শিপ করা হয় এবং নিয়মিত release cycle-এর মাধ্যমে আপডেট হয়। প্রতিটি definition তার auth flow, প্রয়োজনীয় fields, validation endpoint, এবং scope list ঘোষণা করে। আপনি যখন একটি connector বাছেন, wizard definition পড়ে, মিল form রেন্ডার করে, OAuth বা API-key flow চালায় এবং সংরক্ষণের আগে যাচাই করে। প্রকৃত ক্রেডেনশিয়াল value save time-এ একটি ম্যানুয়ালি-যোগ করা ক্রেডেনশিয়ালের একই পথ ব্যবহার করে এনক্রিপ্ট করা হয়।

:::tip
catalog কী একীভূত তা আবিষ্কার করার দ্রুততম উপায়ও। আপনি যদি বিবেচনা করছেন Personas পরিষেবা Y-এর সাথে X করতে পারে কিনা, প্রথমে catalog অনুসন্ধান করুন — যদি Y একটি প্রাসঙ্গিক ক্ষমতা সহ সেখানে থাকে, একীকরণ one-click।
:::
  `,

  "which-agents-use-which-credentials": `
## কোন এজেন্ট কোন ক্রেডেনশিয়াল ব্যবহার করে

Connections-এ Dependencies ট্যাব credential → agent গ্রাফ দেখায়। বাম দিকে একটি ক্রেডেনশিয়াল বাছুন এবং আপনি ডানদিকে এটি রেফারেন্স করা প্রতিটি এজেন্ট দেখতে পাবেন, নির্দিষ্ট capability slot নামকরণ সহ ("email-summary agent-এর জন্য Gmail account")। একটি এজেন্ট বাছুন এবং আপনি প্রতিটি ক্রেডেনশিয়াল যা এটি নির্ভর করে তা দেখতে পাবেন। গ্রাফটি দ্বিদিকীয় — উভয় "এই key ঘুরালে কী ভাঙে?" এবং "এই এজেন্টের promote করার আগে কোন ক্রেডেনশিয়াল প্রয়োজন?"-এর জন্য দরকারী।

একই dependency map build-engine pre-flight check চালায়: আপনি যখন একটি এজেন্ট promote করেন, ইঞ্জিন ভল্টের বিরুদ্ধে প্রতিটি প্রয়োজনীয় capability ক্রস-চেক করে এবং promote অনুমতি দেওয়ার আগে অনুপস্থিত বা মেয়াদোত্তীর্ণ ক্রেডেনশিয়াল ফ্ল্যাগ করে। এই কারণেই আপনি নতুন তৈরি করা এজেন্টদের রানটাইমে প্রায় কখনই "credential not found" error পান না — dependency check promote time-এ চলেছিল এবং এটি ধরেছিল।

### মূল পয়েন্ট

- **দ্বিদিকীয় গ্রাফ** — credential → agents এবং agent → credentials
- **Capability-slot নামকরণ** — dependency আপনাকে শুধু "এই ক্রেডেনশিয়াল ব্যবহৃত হয়" নয়, "email-send capability হিসাবে ব্যবহৃত" বলে
- **Pre-flight check** — একই graph ব্যবহার করে promote-time validation
- **Impact preview** — একটি ক্রেডেনশিয়াল নির্বাচন করলে এটি অপসারণ দ্বারা প্রভাবিত হবে এমন প্রতিটি এজেন্ট হাইলাইট হয়
- **Unused-credential detection** — শূন্য agent dependencies সহ ক্রেডেনশিয়ালগুলি Connections summary-তে সারফেস করা হয় যাতে আপনি সেগুলি পরিষ্কার করতে পারেন

### এটি কীভাবে কাজ করে

প্রতিটি এজেন্টের Connectors ট্যাব প্রতি capability slot-এ credential reference সংরক্ষণ করে। Dependencies ভিউ গ্রাফ রেন্ডার করতে উভয় দিকে এই স্টোরেজ query করে। Credential rotation, expiration, বা অপসারণ ইভেন্টগুলি গ্রাফের মাধ্যমে প্রচার করে: একটি ক্ষীণ ক্রেডেনশিয়ালের উপর নির্ভরশীল যেকোনো এজেন্ট তার স্বাস্থ্য সূচকে warning state উত্তরাধিকারী করে, তাই গ্রাফটি শুধু একটি স্থির রেফারেন্স নয় — এটি একটি live propagation path।

:::warning
একটি unattended (scheduled / webhook / chain) এজেন্ট দ্বারা ব্যবহৃত যেকোনো ক্রেডেনশিয়াল ঘুরানো বা মুছে ফেলার আগে, dependency map চেক করুন এবং এজেন্টদের প্রথমে replacement ক্রেডেনশিয়ালে নির্দেশ করতে আপডেট করুন। pre-flight check আপনাকে promote time-এ ধরে; ইতিমধ্যেই-promoted এজেন্টদের জন্য, runtime failure একমাত্র সংকেত।
:::

:::tip
একটি মাসিক "credential audit" রুটিন: Connections → Dependencies খুলুন, oldest দ্বারা সাজান, এবং নীচের ডজনের জন্য জিজ্ঞাসা করুন "আমি কি এখনও এই ক্রেডেনশিয়াল ব্যবহার করি?"। অব্যবহৃত ক্রেডেনশিয়াল কিছুর জন্য পৃষ্ঠ এলাকা, তাই সেগুলি অপসারণ বিশুদ্ধ পরিষ্কার।
:::
  `,

  "refreshing-expired-tokens": `
## মেয়াদোত্তীর্ণ টোকেন রিফ্রেশ করা

কিছু ক্রেডেনশিয়াল ডিজাইন দ্বারা সময়-আবদ্ধ — OAuth access tokens মিনিট থেকে ঘন্টায় মেয়াদ শেষ হয়; পরিষেবা-ইস্যু করা tokens (Slack bot tokens, GitHub PATs) প্রায়শই N-দিন বা N-বছরের expiries থাকে। Personas যেখানে provider প্রকাশ করে সেখানে expiry ট্র্যাক করে এবং কাটঅফের কিছু দিন আগে একটি "expiring soon" yellow status সারফেস করে (configurable, default 7 দিন)।

একটি refresh token সহ OAuth ক্রেডেনশিয়ালের জন্য, refresh ব্যাকগ্রাউন্ডে স্বয়ংক্রিয় এবং নীরব। API keys এবং tokens যা refresh হয় না, আপনি yellow warning দেখবেন এবং ক্রেডেনশিয়াল কার্ড একটি "Reconnect" বা "Replace" বোতাম অফার করবে — এটিতে ক্লিক করা একই wizard খোলে যা ক্রেডেনশিয়াল তৈরি করেছিল।

### মূল পয়েন্ট

- **OAuth-এর জন্য স্বয়ংক্রিয় refresh** — refresh token নীরবে ব্যবহৃত হয়; আপনি এটি ঘটতে দেখেন না
- **non-refresh creds-এর জন্য অগ্রিম warning** — expiry-এর N দিন আগে yellow status; configurable warning window
- **One-click reconnect** — ক্রেডেনশিয়াল কার্ডে একটি Reconnect বোতাম রয়েছে যা auth flow পুনরায় চালায়
- **Zero-downtime swap** — সক্রিয় নির্ভরশীল এজেন্ট সহ ক্রেডেনশিয়ালের জন্য, নতুন token পুরানোটি জায়গায় প্রতিস্থাপন করে; এজেন্টরা তাদের পরবর্তী রানে নতুন মান গ্রহণ করে
- **Failure agent health-এ সারফেস হয়** — যে ক্রেডেনশিয়ালগুলি refresh হতে ব্যর্থ হয় সেগুলি তাদের নির্ভরশীল এজেন্টদের Health ট্যাবে yellow / red করে

### এটি কীভাবে কাজ করে

Refresh একই ব্যাকগ্রাউন্ড task-এর অংশ হিসাবে চলে যা health checks করে। OAuth-এর জন্য, task refresh token ব্যবহার করে provider থেকে একটি নতুন access token তৈরি করে এবং credential record আপডেট করে। Non-refreshable tokens-এর জন্য, task শুধুমাত্র expiry projection আপডেট করে (তাই yellow warning সঠিক সময়ে প্রদর্শিত হয়); প্রকৃত প্রতিস্থাপন হল একটি manual action যা আপনি warning fires হলে নেন।

:::tip
যখন একটি yellow expiry warning fires, অপেক্ষা করার পরিবর্তে অবিলম্বে refresh করুন। এখন refresh করা একটি এক-মিনিটের কাজ। 3am-এ একটি scheduled এজেন্ট ব্যর্থ হতে দেওয়া কারণ token রাতারাতি মেয়াদ শেষ হয়েছে মিস হওয়া রানগুলি আনওয়াইন্ড করতে অনেক বেশি ব্যয়বহুল।
:::
  `,

  "deleting-credentials-safely": `
## ক্রেডেনশিয়াল নিরাপদে মুছে ফেলা

একটি ক্রেডেনশিয়াল মুছে ফেলা স্থায়ী — এনক্রিপ্টেড record vault থেকে মুছে ফেলা হয় এবং Personas-এর ভিতর থেকে কোনো recovery নেই। আপনি মুছে ফেলার আগে, ক্রেডেনশিয়াল কার্ড dependency check দেখায়: ক্রেডেনশিয়াল রেফারেন্স করা প্রতিটি এজেন্ট, কোন capability slot-এ, প্রভাব কী হবে। আপনি deletion dialog ব্যবহার করে নিশ্চিত করার আগে প্রতিটি নির্ভরশীল এজেন্টকে একটি ভিন্ন ক্রেডেনশিয়ালে পুনরায় বরাদ্দ করতে পারেন, তাই প্রকৃত মুছে ফেলা পুনঃবরাদ্দের সাথে atomic।

OAuth credentials-এর জন্য, deletion শুধুমাত্র স্থানীয় সংরক্ষিত token সরায় — এটি provider পাশে অ্যাক্সেস revoke করে না। আপনি যদি provider-এও revoke করতে চান, provider-এর সুরক্ষা সেটিংস পৃষ্ঠায় এটি করুন (deletion dialog-এ প্রধান providers-এর জন্য একটি লিঙ্ক অফার করা হয়)।

### মূল পয়েন্ট

- **স্থায়ী এবং অবিলম্বে** — কোনো undo নেই; confirm-এ এনক্রিপ্টেড record মুছে ফেলা হয়
- **আগে থেকে dependency check** — confirm করার আগে প্রতিটি নির্ভরশীল এজেন্ট দেখুন
- **Inline reassignment** — deletion dialog-এর অংশ হিসাবে নির্ভরশীল এজেন্টদের একটি replacement ক্রেডেনশিয়ালে নির্দেশ করুন
- **OAuth providers: ডিফল্টভাবে local-only delete** — provider-side revocation একটি পৃথক পদক্ষেপ (লিঙ্ক প্রদত্ত)
- **ইতিমধ্যেই-ভাঙা ক্রেডেনশিয়ালের জন্য No-op safe** — একটি মেয়াদোত্তীর্ণ / প্রত্যাহৃত ক্রেডেনশিয়াল মুছে ফেলা সবসময় নিরাপদ; কার্যকরী অবস্থার উপর কিছু নির্ভর করে না

### এটি কীভাবে কাজ করে

Deletion dialog Dependencies ভিউ-এর মতো একই dependency graph পড়ে। আপনি confirm করলে, ইঞ্জিন প্রথমে আপনি নির্দিষ্ট করা যেকোনো reassignments লেখে, তারপর একটি একক transaction-এ ভল্ট থেকে credential record সরায়। যদি reassignments validation ব্যর্থ হয় (যেমন আপনি ভুল category-এর একটি ক্রেডেনশিয়ালে নির্দেশ করার চেষ্টা করেছেন), deletion roll back হয় এবং কিছু পরিবর্তন হয় না।

:::warning
স্থায়ী মানে স্থায়ী। এনক্রিপ্টেড record মুছে ফেলা হয়, এবং যদি আপনি raw secret অন্য কোথাও লিখে না রাখেন, এটি চলে গেছে। আপনি যদি ক্রেডেনশিয়াল আবার প্রয়োজন হতে পারেন, মুছে ফেলার আগে raw value বাহ্যিকভাবে ব্যাকআপ করুন।
:::

:::tip
সবচেয়ে নিরাপদ rotation প্যাটার্ন হল "নতুন যোগ করুন, সমস্ত এজেন্ট পুনরায় বরাদ্দ করুন, তারপর পুরানো মুছে দিন"। প্রথমে replacement ক্রেডেনশিয়াল যোগ করুন, নির্ভরশীল এজেন্টদের একে একে পুনরায় বরাদ্দ করতে dependency map হাঁটুন (অথবা একবারে সব reassign dialog-এ), সবকিছু স্বাস্থ্যকর তা যাচাই করুন, তারপর পুরানো ক্রেডেনশিয়াল মুছে দিন। এই sequence শূন্য downtime নিশ্চিত করে।
:::
  `,

  "connector-catalog": `
## কানেক্টর ক্যাটালগ

Connections → Catalog-এ catalog হল Personas যে পরিষেবাগুলির সাথে box-এর বাইরে একীভূত হয় তার কিউরেটেড তালিকা। এই লেখার সময়, 9 categories জুড়ে 60+ connectors, প্রতিটি release-এ user demand-এর উপর ভিত্তি করে নতুন connectors যোগ করা হয়েছে। প্রতিটি connector তার auth type (OAuth, API key, basic auth, bot token), প্রয়োজনীয় scopes / capabilities, এবং এটি যে agent-side tool surface প্রকাশ করে তা ঘোষণা করে।

যখন একটি এজেন্টের Connectors ট্যাবের একটি capability প্রয়োজন ("email-send", "cloud-storage-write", "chat-message-send"), এটি সেই capability সন্তুষ্ট করে এমন connectors-এর জন্য catalog query করে, তারপর আপনার ভল্টের বিরুদ্ধে মিলিয়ে দেয়। যদি আপনার ইতিমধ্যেই সেই connectors-এর একটির জন্য একটি ক্রেডেনশিয়াল থাকে, এটি একটি তাৎক্ষণিক মিল। যদি না হয়, catalog একটি যোগ করার অফার দেয় — Auto-Credential Browser বিষয়ে বর্ণিত একই wizard খোলে।

### Connector Categories

| Category | Example services | Auth |
|---|---|---|
| Email | Gmail, Outlook, IMAP/SMTP | OAuth / API |
| Cloud Storage | Google Drive, Dropbox, OneDrive, S3, Local Drive | OAuth / API |
| Payments | Stripe, PayPal, Square | API key |
| Social | Twitter/X, LinkedIn, Facebook, Mastodon | OAuth |
| Developer Tools | GitHub, GitLab, Jira, Linear, Sentry | OAuth / API |
| Communication | Slack, Discord, Microsoft Teams, Telegram, generic webhook | OAuth / bot token |
| CRM | Salesforce, HubSpot, Pipedrive | OAuth / API |
| AI Providers | Anthropic, OpenAI, Google, local Ollama, custom OpenAI-compatible | API |
| Data | Postgres, Snowflake, BigQuery, generic SQL/HTTP | URL + credentials |

### মূল পয়েন্ট

- **Capability-based matching** — connectors capabilities প্রকাশ করে; এজেন্টদের capabilities প্রয়োজন; catalog তাদের মেলায়
- **পরিষেবা-নির্দিষ্ট quirks বেক করা** — Slack workspace IDs, GitHub PAT scopes, OAuth callback URLs, ইত্যাদি, সবই প্রি-কনফিগার করা
- **Auth-type indicators** — এক নজরে, দেখুন কোন connectors OAuth বনাম API-key বনাম local
- **Generic / Custom fallback** — catalog-এ নেই এমন পরিষেবার জন্য, Generic connector type raw HTTP/REST কনফিগারেশন গ্রহণ করে
- **Channel-delivery connectors** — Slack, Discord, Teams, generic webhook এখানে outbound agent output-এর জন্যও দেখা যায় (Connectors ট্যাবে প্রতি-এজেন্ট কনফিগার করা)

### এটি কীভাবে কাজ করে

Connector definitions অ্যাপে থাকে এবং binary-এর সাথে versioned। প্রতিটি এজেন্টে Connectors ট্যাব dynamically catalog query করে — catalog-এ একটি connector যোগ করা (একটি release-এ) এটিকে কোনো per-agent migration ছাড়াই বিদ্যমান এজেন্টদের কাছে উপলব্ধ করে। Custom / Generic connectors আপনি স্থানীয়ভাবে কনফিগার করেন vault-scoped এবং catalog-এর মধ্য দিয়ে যায় না।

:::tip
catalog একটি discovery surface-ও। মাঝে মাঝে browse করুন এমনকি যখন আপনার একটি নির্দিষ্ট প্রয়োজন নেই — আপনি প্রায়শই একটি integration খুঁজে পাবেন যা একটি নতুন automation প্রস্তাব করে। বিশেষ করে Communication category output-side ব্যবহারের ক্ষেত্রে সমৃদ্ধ (Slack / Discord / Teams-এ এজেন্ট ফলাফল সরবরাহ করা)।
:::
  `,
};
