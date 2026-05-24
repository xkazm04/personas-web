export const content: Record<string, string> = {
  "common-error-messages": `
## সাধারণ ত্রুটি বার্তা

Error messages ভীতিকর দেখতে পারে, কিন্তু বেশিরভাগের সহজ solutions রয়েছে। এই guide সবচেয়ে ঘন ঘন errors-কে সহজ ইংরেজিতে অনুবাদ করে এবং আপনাকে ঠিক কী করতে হবে তা বলে। আপনাকে technical details বুঝতে হবে না — শুধু error-কে fix-এর সাথে মিলিয়ে নিন।

বেশিরভাগ errors কয়েকটি categories-এ পড়ে: credential problems, timeout issues, এবং input format mismatches। একবার আপনি patterns জানলে, troubleshooting second nature হয়ে যায়।

### Quick Diagnostic Checklist

:::checklist
- চেক করুন AI provider-এর API online কিনা এবং আপনার account সক্রিয় কিনা
- Credentials panel-এ credential health যাচাই করুন (লাল/হলুদ indicators খুঁজুন)
- Rate limits review করুন — আপনি যদি অনেক requests পাঠিয়ে থাকেন তবে এক মিনিট অপেক্ষা করুন
- issue isolate করতে সহজ test input সহ একটি manual রান চেষ্টা করুন
- যদি ডেটা একটি trigger বা pipeline থেকে আসে তবে input format চেক করুন
:::

### সবচেয়ে সাধারণ Errors

- **"Authentication failed"** — আপনার credential expired বা ভুলভাবে entered। \`Credentials\`-এ যান এবং এটি refresh বা re-enter করুন।
- **"Request timed out"** — AI provider প্রতিক্রিয়া করতে অনেক বেশি সময় নিয়েছে। আবার চালানোর চেষ্টা করুন, বা agent settings-এ timeout বাড়ান।
- **"Rate limit exceeded"** — আপনি খুব দ্রুত অনেক বেশি requests করেছেন। এক মিনিট অপেক্ষা করুন এবং আবার চেষ্টা করুন, বা আপনার provider plan upgrade করুন।
- **"Invalid input format"** — আপনার এজেন্টে পাঠানো ডেটা expected format-এ ছিল না। এই এজেন্টে ডেটা feeding-এর trigger বা pipeline চেক করুন।

### এটি কীভাবে কাজ করে

যখন একটি error ঘটে, এটি একটি code এবং description সহ execution log-এ প্রদর্শিত হয়। একটি বিস্তারিত ব্যাখ্যা এবং suggested fix দেখতে error-এ ক্লিক করুন। অনেক errors-এ একটি \`Fix Now\` বোতাম অন্তর্ভুক্ত রয়েছে যা আপনাকে সরাসরি যে setting মনোযোগের প্রয়োজন সেখানে নিয়ে যায়।

:::tip
যখন আপনি একটি error দেখেন তখন আতঙ্কিত হবেন না। বার্তাটি সাবধানে পড়ুন — এটি প্রায় সবসময় আপনাকে কী ভুল হয়েছে তা বলে এবং solution-এর দিকে নির্দেশ করে।
:::
  `,

  "agent-not-responding": `
## এজেন্ট সাড়া দিচ্ছে না

যদি আপনার এজেন্ট হিমায়িত, আটকে আছে, বা ফলাফল তৈরি করছে না বলে মনে হয়, চিন্তা করবেন না — এটি সাধারণত একটি সহজ fix। সবচেয়ে সাধারণ কারণগুলি হল একটি timed-out AI provider connection, একটি credential issue, বা এজেন্ট তার maximum turn limit-এ আঘাত করেছে। ট্র্যাকে ফিরে আসতে এই checklist অনুসরণ করুন।

বেশিরভাগ unresponsive agent issues নিজেদের সমাধান করে যখন আপনি underlying cause সনাক্ত এবং fix করেন, যা প্রায় কখনই একটি স্থায়ী সমস্যা নয়।

### Diagnostic Checklist

:::steps
1. **execution log চেক করুন** — error messages বা warnings খুঁজুন যা stall ব্যাখ্যা করে
2. **আপনার AI provider যাচাই করুন** — নিশ্চিত করুন আপনার provider-এর API online এবং আপনার account সক্রিয়
3. **credentials চেক করুন** — নিশ্চিত করুন এজেন্টের credentials expire হয়নি
4. **limits review করুন** — এজেন্ট তার timeout বা max turns setting আঘাত করেছে কিনা
5. **একটি manual রান চেষ্টা করুন** — issue isolate করতে সহজ test input দিয়ে এজেন্ট চালান
:::

### এটি কীভাবে কাজ করে

এজেন্ট খুলুন এবং এর সর্বশেষ execution log চেক করুন। যদি এটি একটি error দেখায়, সেই specific error-এর জন্য fix অনুসরণ করুন। যদি log দেখায় এজেন্ট এখনও চলছে, এটি একটি বিশেষভাবে জটিল task প্রক্রিয়া করতে পারে। timeout setting চেক করুন — যদি এটি খুব ছোট হয়, এজেন্ট সম্পূর্ণ করার আগে থামতে পারে।

:::tip
যদি একটি এজেন্ট সত্যিই আটকে থাকে (কয়েক মিনিটের জন্য কোনো অগ্রগতি নেই), \`Stop\` ক্লিক করুন এবং তারপর সহজ input দিয়ে একটি manual রান চেষ্টা করুন। এটি আপনাকে নির্ধারণ করতে সাহায্য করে যে issue input বা এজেন্ট নিজে।
:::
  `,

  "credential-errors": `
## ক্রেডেনশিয়াল ত্রুটি

যখন একটি এজেন্ট একটি service-এর সাথে connect করতে পারে না, এটি সাধারণত কারণ একটি credential expire হয়েছে, একটি password পরিবর্তিত হয়েছে, বা একটি permission revoke করা হয়েছে। এগুলি যেকোনো automation system-এর সবচেয়ে সাধারণ সমস্যা, এবং সেগুলি প্রায় সবসময় ঠিক করতে দ্রুত।

মূল হল কোন credential সমস্যা সৃষ্টি করছে তা সনাক্ত করা, তারপর এটি refresh বা replace করা।

### সাধারণ কারণ

- **Expired token** — OAuth tokens পর্যায়ক্রমে expire হয় এবং refresh প্রয়োজন
- **Changed password** — যদি আপনি অন্য কোথাও একটি password পরিবর্তন করেন, Personas-এও এটি আপডেট করুন
- **Revoked permissions** — service আপনি মূলত দেওয়া access revoke করতে পারে
- **Wrong credential assigned** — এজেন্ট service-এর জন্য ভুল credential ব্যবহার করতে পারে

### এটি কীভাবে কাজ করে

execution log-এ error message চেক করুন — এটি উল্লেখ করবে কোন service ব্যর্থ হয়েছে। \`Credentials\`-এ যান এবং সেই service-এর জন্য credential খুঁজুন। এর health status চেক করুন। যদি এটি লাল বা হলুদ হয়, এটিতে ক্লিক করুন কী ভুল তা দেখতে এবং suggested fix অনুসরণ করুন — সাধারণত token refresh করা বা password re-entering।

:::tip
স্বয়ংক্রিয়ভাবে চলতে credential health checks সেট আপ করুন। তারা agent failures সৃষ্টি করার আগে expiring credentials ধরবে, একটি potential crisis-কে একটি routine maintenance task-এ পরিণত করবে।
:::
  `,

  "trigger-not-firing": `
## ট্রিগার ফায়ার হচ্ছে না

একটি trigger যা fire হয় না তা হতাশাজনক, কিন্তু কারণটি সাধারণত ছোট কিছু — একটি configuration typo, একটি timing issue, বা একটি missing permission। এই guide আপনাকে সবচেয়ে সাধারণ অপরাধীদের মধ্য দিয়ে নিয়ে যায় যাতে আপনি আপনার automations আবার চালাতে পারেন।

trigger log এখানে আপনার সেরা বন্ধু। এটি প্রতিটি activation প্রচেষ্টা রেকর্ড করে, ফিল্টার আউট হওয়া বা নীরবে ব্যর্থ হওয়াগুলি সহ।

### Diagnostic পদক্ষেপ

:::steps
1. **trigger log চেক করুন** — এজেন্টের trigger settings খুলুন এবং প্রতিটি প্রচেষ্টা দেখতে \`Log\` ট্যাবে ক্লিক করুন, failures সহ
2. **trigger সক্ষম যাচাই করুন** — toggle switch খুঁজুন; disabled triggers fire হয় না
3. **filters চেক করুন** — আপনার filter conditions review করুন, যা খুব কঠোর হতে পারে এবং সমস্ত events block করছে
4. **manually পরীক্ষা করুন** — একটি event simulate করতে এবং configuration যাচাই করতে trigger tester ব্যবহার করুন
5. **permissions চেক করুন** — নিশ্চিত করুন file watchers-এর folder access এবং webhooks-এর network access আছে
:::

### এটি কীভাবে কাজ করে

এজেন্টের trigger settings খুলুন এবং \`Log\` ট্যাবে ক্লিক করুন। প্রতিটি trigger প্রচেষ্টা একটি status সহ তালিকাভুক্ত: fired, filtered, বা failed। কেন এটি fire হয়নি দেখতে যেকোনো entry-তে ক্লিক করুন। সবচেয়ে সাধারণ আবিষ্কার হল একটি filter যা সামান্য খুব কঠোর — এটি adjusting করা সাধারণত অবিলম্বে সমস্যা সমাধান করে।

:::tip
একটি নতুন trigger সেট আপ করার সময়, কোনো filters ছাড়াই শুরু করুন। একবার আপনি নিশ্চিত করেন এটি সঠিকভাবে fire করে, এক সময়ে একটি filters যোগ করুন। এইভাবে আপনি জানেন প্রতিটি filter expected হিসাবে কাজ করে।
:::
  `,

  "self-healing-explained": `
## Self-healing ব্যাখ্যা

যখন একটি agent run-এর সময় কিছু ভুল হয়, self-healing system সমস্যাটি ঠিক করার চেষ্টা করে এবং স্বয়ংক্রিয়ভাবে retry করে। এটি একটি safety net থাকার মতো যা আপনি লক্ষ্য করার আগেই বেশিরভাগ errors ধরে। সাধারণ issues যেমন temporary network glitches, brief API outages, বা rate limits আপনার hand intervention ছাড়াই পরিচালিত হয়।

Self-healing মানে নয় আপনার এজেন্ট কখনই ব্যর্থ হয় না — এটি মানে এটি ছোট, temporary সমস্যাগুলি থেকে পুনরুদ্ধার করে যা অন্যথায় আপনাকে এটি manually restart করতে হবে।

### মূল পয়েন্ট

- **Automatic retry** — transient errors smart backoff timing সহ retried হয়
- **Error classification** — সিস্টেম fixable এবং unfixable errors-এর মধ্যে পার্থক্য করে
- **Credential refresh** — যখন সম্ভব expired tokens স্বয়ংক্রিয়ভাবে refresh হয়
- **স্বচ্ছ** — প্রতিটি self-healing action logged হয় যাতে আপনি কী ঘটেছে দেখতে পারেন

### এটি কীভাবে কাজ করে

যখন একটি error ঘটে, self-healing system এটি মূল্যায়ন করে। Transient errors (network timeouts, rate limits, temporary outages) একটি ছোট অপেক্ষার পরে একটি automatic retry ট্রিগার করে। Credential expirations একটি automatic refresh প্রচেষ্টা ট্রিগার করে। Permanent errors (invalid configuration, missing permissions) আপনাকে অবিলম্বে রিপোর্ট করা হয় কারণ তাদের আপনার মনোযোগ প্রয়োজন।

:::success
যখন self-healing সফল হয়, এজেন্ট কিছু না ঘটার মতো চালিয়ে যায়। execution log একটি green "healed" badge দিয়ে recovered error চিহ্নিত করে যাতে আপনি দেখতে পারেন কী ধরা এবং স্বয়ংক্রিয়ভাবে সমাধান করা হয়েছে।
:::

:::tip
কী ধরা হচ্ছে তা দেখতে মাঝে মাঝে self-healing log চেক করুন। যদি একই error healed হতে থাকে, এটি একটি underlying issue নির্দেশ করতে পারে যা স্থায়ীভাবে fix করার মতো।
:::
  `,

  "checking-system-health": `
## সিস্টেম স্বাস্থ্য পরীক্ষা

built-in health check আপনার সম্পূর্ণ Personas installation scans করে এবং যেকোনো issues রিপোর্ট করে — outdated components, missing files, configuration problems, বা connectivity issues। আপনার system-এর সামগ্রিক status-এর একটি দ্রুত মূল্যায়নের জন্য যেকোনো সময় কিছু অফ মনে হলে এটি চালান।

আপনার Personas setup-এর জন্য doctor-এর কাছে visit হিসাবে এটিকে ভাবুন। একটি দ্রুত check-up ছোট issues বড় সমস্যা হওয়ার আগে ধরতে পারে।

### এটি কী চেক করে

- **App version** — আপনি সর্বশেষ সংস্করণ চালাচ্ছেন কিনা
- **Database integrity** — আপনার local data files অক্ষত এবং healthy
- **Credential status** — সমস্ত সংরক্ষিত credentials valid এবং কাজ করছে
- **Provider connectivity** — আপনার AI providers reachable এবং responding
- **Cloud connection** — আপনার orchestrator connection active (যদি কনফিগার করা থাকে)

### এটি কীভাবে কাজ করে

\`Settings > System Health\`-এ যান এবং \`Run Health Check\` ক্লিক করুন। scan কয়েক সেকেন্ড সময় নেয় এবং একটি report তৈরি করে। Green items healthy, yellow items শীঘ্রই মনোযোগ প্রয়োজন, এবং red items অবিলম্বে fixing প্রয়োজন। প্রতিটি item-এ issue-এর একটি description এবং একটি suggested fix অন্তর্ভুক্ত।

:::tip
updates ইনস্টল করার পরে, connectivity issues-এর পরে, বা একটি critical agent deploy করার আগে একটি health check চালান। এটি কেবল সেকেন্ড নেয় এবং আপনাকে মানসিক শান্তি দেয়।
:::
  `,

  "log-files-and-debugging": `
## লগ ফাইল এবং ডিবাগিং

Log files আপনার Personas installation-এর জন্য একটি flight recorder-এর মতো। তারা সবকিছু ক্যাপচার করে যা ঘটেছে — agent runs, system events, errors, এবং আরও — বিস্তারিত chronological order-এ। যখন কিছু ভুল হয় এবং execution log যথেষ্ট না হয়, এই files-এ সম্পূর্ণ গল্প থাকে।

আপনাকে নিয়মিত logs পড়তে হবে না, কিন্তু কোথায় সেগুলি আছে এবং কীভাবে সেগুলি ব্যবহার করতে হয় তা জানা একটি tricky সমস্যা troubleshooting-এর সময় অমূল্য।

### মূল পয়েন্ট

- **Automatic logging** — আপনি কিছু চালু না করেই সবকিছু রেকর্ড করা হয়
- **date দ্বারা সংগঠিত** — সহজ browsing-এর জন্য প্রতিটি দিনের events একটি পৃথক file-এ থাকে
- **Searchable** — keyword, date, বা severity level দ্বারা specific events খুঁজুন
- **Shareable** — যদি আপনি support-এর সাথে যোগাযোগ করেন, আপনি প্রাসঙ্গিক log excerpts shared করতে পারেন

### এটি কীভাবে কাজ করে

Log files আপনার কম্পিউটারে locally সংরক্ষিত। \`Settings > Logs\` থেকে সেগুলিতে access করুন বা সরাসরি log folder-এ নেভিগেট করুন। প্রতিটি file একটি দিন কভার করে এবং timestamped entries ধারণ করে। search, filter, এবং browse করতে built-in log viewer ব্যবহার করুন। support requests-এর জন্য, \`Export Log\` বোতাম একটি shareable excerpt তৈরি করে।

:::tip
একটি issue সম্পর্কে support-এর সাথে যোগাযোগ করার সময়, প্রাসঙ্গিক log excerpt অন্তর্ভুক্ত করুন। এটি troubleshooting process নাটকীয়ভাবে দ্রুত করে কারণ support team ঠিক কী ঘটেছে দেখতে পারে।
:::
  `,

  "resetting-to-defaults": `
## ডিফল্টে রিসেট করা

যদি আপনি একটি setting পরিবর্তন করেছেন এবং কী সমস্যা সৃষ্টি করছে তা বুঝতে পারছেন না, defaults-এ resetting আপনাকে একটি পরিষ্কার শুরুর বিন্দু দেয়। এটি শুধুমাত্র আপনার preferences এবং configuration settings reset করে — আপনার এজেন্ট, credentials, memories, এবং data সবই সংরক্ষিত। কিছু গুরুত্বপূর্ণ হারিয়ে যায় না।

একটি room-কে তার মূল layout-এ পুনরুদ্ধার করার মতো এটিকে ভাবুন। আপনার সমস্ত belongings (এজেন্ট এবং ডেটা) থাকে, কিন্তু furniture (settings) যেখানে এটি শুরু হয়েছিল সেখানে ফিরে যায়।

:::warning
Resetting এক action-এ সমস্ত customized preferences clears করে। এটি আপনার theme, default model, notification settings, এবং keyboard shortcuts অন্তর্ভুক্ত করে। আপনার এজেন্ট, credentials, memories, এবং data প্রভাবিত হয় না — কিন্তু যেকোনো carefully tuned preferences পরে manually reconfigured করতে হবে।
:::

### কী Reset হয়

- **Display preferences** — theme, layout, sidebar width, এবং visual settings
- **Default model** — সুপারিশকৃত default-এ ফিরে যায়
- **Notification settings** — standard notification behavior-এ reset হয়
- **Keyboard shortcuts** — মূল key combinations-এ পুনরুদ্ধার করা হয়

### কী Safe থাকে

- আপনার সমস্ত **এজেন্ট** এবং তাদের prompts, histories, এবং configurations
- ভল্টের আপনার সমস্ত **credentials**
- আপনার সমস্ত **memories**, test results, এবং execution logs
- আপনার সমস্ত **pipelines** এবং team configurations

### এটি কীভাবে কাজ করে

\`Settings > Advanced > Reset to Defaults\`-এ যান। কী reset হবে review করুন, তারপর \`Confirm\` ক্লিক করুন। আপনার settings তাদের factory values-এ ফিরে আসে যখন আপনার সমস্ত কাজ সংরক্ষিত থাকে। আপনি তারপর settings এক সময়ে একটি reconfigure করতে পারেন যে পরিবর্তনটি issue সৃষ্টি করছে তা সনাক্ত করতে।

:::tip
Resetting-এর আগে, আপনি ইচ্ছাকৃতভাবে customized করেছেন এমন যেকোনো settings-এর একটি নোট তৈরি করুন। এইভাবে reset আপনার issue ঠিক করার পরে আপনি যেগুলি চান সেগুলি দ্রুত পুনরুদ্ধার করতে পারেন।
:::
  `,
};
