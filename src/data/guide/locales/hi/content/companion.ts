// Companion (Athena) गाइड बॉडी — Hindi अनुवाद।
// Keyed by topic id (categoryId "companion" देखें)।
export const content: Record<string, string> = {
  "meet-athena": `
## Athena से मिलें

Athena, Personas की अंतर्निहित कंपेनियन है — हमेशा उपलब्ध, हमेशा संदर्भ में। वह साइड में जोड़ा गया कोई chatbot नहीं है। वह आपके agents, आपके goals, आपकी memory जानती है, और वह वास्तव में आपकी ओर से app को संचालित कर सकती है।

वह एक साथ दो जगह रहती है। **footer avatar** — नीचे-दाईं कोने में उसका animated चेहरा — प्रवेश बिंदु है: chat panel खोलने के लिए उस पर tap करें, या panel खोले बिना voice message dictate करने के लिए press and hold करें। **floating orb** उसका दूसरा रूप है: एक draggable overlay जो आपके काम के ऊपर तैरती है ताकि आप app में कहीं भी हों, वह आपकी पहुंच में रहे। जब orb सक्षम हो (डिफ़ॉल्ट), footer orb को summon और dismiss करता है; orb का अपना tap पूर्ण chat panel खोलता है।

दोनों surfaces एक नज़र में दिखाते हैं कि Athena क्या कर रही है। जब वह सोच रही होती है, तो उसका avatar posture बदलता है। जब वह बोल रही होती है, तो orb उसकी voice level के साथ glows करती है। जब कोई background task पूरा होता है, तो orb एक संक्षिप्त प्रतिक्रिया दिखाती है। ये सजावटी नहीं हैं — ये आपको panel खोले बिना उसकी स्थिति बताते हैं।

Athena जो कर सकती है वह सवालों के जवाब देने से कहीं आगे जाता है। वह सवालों के जवाब दे सकती है और features समझा सकती है, हाँ, लेकिन वह app को नेविगेट भी कर सकती है, आपके agents चला सकती है, memory file कर सकती है, identity updates प्रस्तावित कर सकती है, और भविष्य के check-in schedule कर सकती है। जब autonomous mode चालू हो, तो वह आपके बिना किसी click के कई steps एक साथ chain कर सकती है।

### मुख्य बिंदु

- **Footer avatar** — chat panel खोलने/बंद करने के लिए tap करें; कहीं से भी voice turn dictate करने के लिए press and hold करें
- **Floating orb** — draggable overlay, वही दो gestures; guided walkthroughs के दौरान हर क्षेत्र की ओर glide करती है
- **App को संचालित करती है** — Athena केवल सलाह नहीं देती; वह routes navigate कर सकती है, agents चला सकती है, और dashboards compose कर सकती है
- **हमेशा context में** — वह हर reply से पहले आपकी memory, goals, और agent state पढ़ती है, इसलिए वह कभी शून्य से शुरू नहीं करती
- **शुरुआती बिंदु** — इस Companion section के विषय प्रत्येक गहरे जाते हैं: chatting, voice, memory, proactive check-ins, guided walkthroughs, Decision Hub, और chat द्वारा app चलाना

:::tip
यदि आप chat panel बंद करते हैं, तो Athena काम करती रहती है। Background tasks orb में चलते हैं, proactive nudges अभी भी आते हैं, और voice replies अभी भी चलते हैं — panel बंद होने से वह रुकती नहीं।
:::
  `,

  "chatting-with-athena": `
## Athena से Chat करना

Panel खोलें और Athena आपको एक **welcome screen** से स्वागत करती है — उसका avatar, एक संक्षिप्त greeting, और सबसे सामान्य शुरुआती बिंदुओं को कवर करने वाले **starter-prompt chips** का एक सेट। किसी भी chip पर क्लिक करें और संदेश तुरंत भेज दिया जाता है; आपको type नहीं करना है।

starter set से परे ready-made prompts के लिए, खाले संदेश के पहले अक्षर के रूप में \`/\` टाइप करें। एक **slash palette** composer के ऊपर preset prompts के साथ खुलती है जिसे आप typing करके filter कर सकते हैं: **get to know me** (वह intake interview जो उसकी आपकी memory को bootstrap करती है), **show goals**, **what's queued**, **recent decisions**, **live ops**, **memory recap**, और **capabilities**। Arrow keys सूची में navigate करती हैं, Enter highlighted item चुनता है, Escape साफ करता है और बंद करता है।

जब Athena reply करती है तो वह अक्सर **quick-reply chips** जोड़ती है — दो से पांच follow-up prompts जो conversation की दिशा से मेल खाते हैं। अपना अगला संदेश भेजने के लिए एक पर क्लिक करें। उसकी नवीनतम पूर्ण reply के नीचे आपको तीन **refine chips** भी मिलते हैं: **Shorter**, **More detail**, और **Code only**। प्रत्येक आपके अंतिम संदेश को एक steering suffix के साथ फिर से भेजता है ताकि आप बिना retyping के reply को आकार दे सकें।

composer तब भी खुला रहता है जब Athena जवाब दे रही होती है। आप किसी भी समय type कर सकते हैं — यदि आपका संदेश redirect जैसा लगता है ("actually, stop" या "wait, instead…") तो यह in-flight reply को interrupt करेगा और आपके नए request को queue करेगा। यदि यह additive लगता है ("and also…") तो यह current reply के पीछे queue होता है और बाद में चलता है। आपको queued messages compositor के ऊपर छोटे chips के रूप में दिखेंगे; आप उनमें से किसी को भी cancel कर सकते हैं।

**Autonomous mode** (panel header में ∞ icon) Athena को खुद multi-step काम chain करने देता है। जब यह चालू हो और उसके पास करने के लिए और काम हो, तो वह लगभग पंद्रह सेकंड बाद एक follow-up turn schedule करती है, अधिकतम बीस consecutive turns तक। transcript में एक slim divider प्रत्येक autonomous continuation को mark करता है ताकि आप एक नज़र में देख सकें कि आपने कहाँ छोड़ा और उसने कहाँ संभाला।

### मुख्य बिंदु

- **Welcome screen** — starter chips real messages उसी pipeline के माध्यम से fire करते हैं जैसे typed ones
- **Slash palette** — preset prompts browse करने के लिए \`/\` टाइप करें; typing करके filter करें, Enter से चुनें
- **Quick-reply chips** — 2–5 follow-up options जो Athena अपनी reply के अंत में offer करती है
- **Refine chips** — Shorter / More detail / Code only; केवल नवीनतम पूर्ण reply के नीचे
- **Mid-answer redirect** — जब वह जवाब दे रही हो तब type करें; स्वचालित रूप से interrupt या queue के रूप में classify होता है
- **Autonomous mode** — Athena self-directed काम के 20 turns तक chain करती है; आपसे कोई भी संदेश chain रद्द कर देता है

:::tip
slash palette prompts सभी 14 supported languages में translated हैं — यदि आप Personas किसी अन्य भाषा में उपयोग करते हैं, तो preset messages आपके locale में आते हैं और Athena उसी भाषा में reply करती है।
:::
  `,

  "voice-and-hold-to-talk": `
## Voice और Hold-to-Talk

Athena पूर्ण two-way voice support करती है: आप dictate करते हैं, वह transcribe और reply करती है, और उसका जवाब synthesized voice में play होता है। pipeline के हर हिस्से में एक privacy option है।

### Athena को Dictate करना

footer avatar या floating orb को लगभग एक चौथाई सेकंड के लिए **press and hold** करें। एक mic badge और एक pulse दिखाई देते हैं, और interim transcript orb के बगल में caption के रूप में दिखती है। जब आप बोलना समाप्त कर लें तो release करें — transcript Athena को सौंपा जाता है और सामान्य reply pipeline चलती है। Reply panel में stream होती है और, यदि voice engine configured है, तो स्वचालित रूप से play होती है। Panel कभी खुलना ज़रूरी नहीं; एक voice turn इसके पूरी तरह collapsed होने पर भी काम करता है।

**global keyboard shortcut Cmd/Ctrl+Shift+A** app में कहीं से भी Athena को summon करता है और एक keystroke में voice turn शुरू करता है। भेजने के लिए shortcut फिर से दबाएं, या बिना भेजे cancel करने के लिए Esc। यह orb पर hold के समान session उपयोग करता है — एक walkthrough के बीच में shortcut orb hold के समान है।

### Speech-to-text engines

दो engines उपलब्ध हैं, STT panel के अंतर्गत **Companion → Voice** में चुनी गई:

:::compare
**Browser (default)**
App के renderer में Web Speech API का उपयोग करता है। कोई setup आवश्यक नहीं। Windows पर audio OS vendor की cloud speech service को forward की जाती है — सुविधाजनक लेकिन off-device।
---
**Local Whisper**
एक \`whisper-cli\` sidecar के माध्यम से on-device transcription। Audio आपकी machine कभी नहीं छोड़ता। Whisper model download करना और binary को expected path पर रखना आवश्यक है (Voice tab सटीक location और download status दिखाता है)।
:::

### Voice playback engines

जब Athena reply करती है, तो spoken summary दो voice engines में से किसी से भी आ सकती है:

:::compare
**ElevenLabs (cloud)**
ElevenLabs API credential और आपके द्वारा चुने गए voice ID का उपयोग करके high-quality synthesis। Per-voice tuning: stability, similarity, style, और speed। Credential आपके vault में stored है; API key app के renderer तक कभी नहीं पहुंचती।
---
**Piper (local ONNX)**
Synthesis time पर कोई network call नहीं और कोई credential आवश्यक नहीं के साथ on-device synthesis। Voices 14 भाषाओं में लगभग 17 voices के curated catalog से download की जाती हैं। Voice tab दिखाता है कि कौन सी install हैं।
:::

### Proactive nudges जोर से बोले जाते हैं

Proactive check-ins (goals approaching, agent failures, reminders) भी spoken हो सकते हैं — यहाँ तक कि chat panel बंद होने पर भी। Arrival-TTS वह क्षण fire होती है जब nudge आती है, उसी engine का उपयोग करते हुए जो आपने configured की है। footer में एक **Play it again** button आखिरी spoken message replay करता है यदि आप चूक गए।

:::tip
यदि आप बिना किसी cloud calls के voice चाहते हैं, तो dictation के लिए local Whisper और playback के लिए Piper pair करें। दोनों पूरी तरह on-device चलते हैं। Voice tab प्रत्येक engine के लिए एक install path और model browser दिखाता है।
:::
  `,

  "athenas-long-term-memory": `
## Athena की Long-Term Memory

Athena आपको sessions के पार याद रखती है। हर बार जब आप panel खोलते हैं तो वह एक खाली slate से शुरू नहीं करती — वह हर reply से पहले आपकी memory पढ़ती है और ऐसे जवाब देने के लिए उसका उपयोग करती है जो आपकी वास्तविक स्थिति के अनुकूल हों।

### वह क्या याद रखती है

Memory tiers में organized है, प्रत्येक एक अलग प्रकार के knowledge को cover करता है:

- **Facts** — वे चीज़ें जो उसने आपके बारे में, आपके projects के बारे में, और दुनिया के बारे में सीखी हैं। "आप concise summaries पसंद करते हैं।" "इस repo की main branch master है।"
- **Procedural preferences** — behavioral rules जो उसने pick up किए हैं। "किसी लंबे doc को summarize करते समय, एक-sentence punchline से शुरू करें।" "Code examples के लिए TypeScript prefer करें।"
- **Goals** — वे active goals और target dates जो वह आपकी ओर से track करती है।
- **Identity profile** — एक evolving \`identity.md\` document जो हर system prompt में read किया जाता है। यह "Athena के लिए अभी आप कौन हैं" का एकमात्र source है और anchored edits द्वारा बढ़ता है, कभी wholesale rewrites से नहीं।
- **Episodes** — conversation history खुद, आपकी machine पर markdown files के रूप में stored। Doctrine (Personas के अपने reference docs) product knowledge भरते हैं।

### Intake interview से bootstrapping

एक fresh install पर Athena स्वचालित रूप से एक संक्षिप्त interview चलाती है — कुछ focused questions जो उसे एक initial identity profile लिखने के लिए पर्याप्त देते हैं। आप slash palette से **get to know me** select करके या welcome screen पर matching chip पर click करके किसी भी समय interview फिर से चला सकते हैं। यदि identity profile पहले से exists करती है, तो वह इसे anchored diffs से update करती है; वह पहले आपने जो context दिया उसे कभी नहीं हटाती।

### Memory browser

**Companion → Memory** खोलें ताकि Athena जो कुछ जानती है वह सब देखें। Brain Viewer episodes, facts, procedural preferences, goals, और identity doc को list करता है — सब browsable। किसी भी entry पर click करके पूर्ण content पढ़ें, linked memories को related entries तक follow करें, और कुछ भी गलत हो तो edit या correct करें।

**Corrections एक click में हैं।** identity view में प्रत्येक bullet में एक "That's wrong" affordance है। इस पर click करें और Athena correction को एक high-value learning signal के रूप में record करती है और एक single approval card में गलत bullet को हटाने का प्रस्ताव करती है। आप approve करें और गलत claim चली जाती है।

### Privacy

Brain data — सभी पाँच memory tiers — आपकी machine पर \`~/.personas/companion-brain/\` पर रहती है। कुछ भी cloud database में stored नहीं होता। यदि आप local Whisper STT और Piper TTS engines उपयोग करते हैं, तो कोई भी audio आपकी machine नहीं छोड़ता।

:::tip
Intake interview छोटी है (कुछ मिनट) और तुरंत लाभ देती है — एक अच्छे intake के बाद Athena के पहले कुछ replies ध्यान देने योग्य रूप से अधिक on-point होती हैं। अपने पहले real session से पहले इसे चलाएं।
:::
  `,

  "proactive-check-ins": `
## Proactive Check-Ins

Athena आपके पूछने का इंतजार नहीं करती। जब आपके ध्यान देने लायक कुछ होता है — कोई deadline नज़दीक आ रही हो, कोई agent प्रतीक्षा कर रहा हो, आपका set reminder हो — तो वह पहले पहुंचती है। ये proactive check-ins हैं: cards जो chat panel में दिखाई देते हैं, वैकल्पिक रूप से जोर से बोले जाते हैं, बिना आपके कुछ खोले।

### Check-in क्या trigger करता है

Athena लगभग हर पाँच मिनट में conditions evaluate करती है। जो triggers check-in produce कर सकते हैं उनमें शामिल हैं:

- **Goal target approaching** — एक active goal की target date 24 घंटों के भीतर है
- **Backlog aging** — एक self-promise commitment tier threshold से अधिक समय तक unaddressed रहा है (1 दिन से 3 दिन से 7 दिन तक escalating)
- **Cadence due** — एक ritual जो आपने set किया (एक recurring check-in, एक focus window) "अभी" से मेल खाती है
- **On this day** — उसी calendar day से एक month, तीन months, या एक year पहले का एक note या reflection, आपके active goals से matched
- **Agent needs you** — एक fleet session fail हो गई, दो मिनट से अधिक समय से input का इंतजार कर रही है, या stale हो गई है
- **Athena की अपनी commitments** — scheduled check-ins जो Athena ने propose किए और आपने conversation के दौरान approve किए, ठीक उस समय deliver किए जैसा उसने commit किया था

### Guardrails

System को noisy हुए बिना उपयोगी बनाने के लिए design किया गया है:

- **Quiet hours** — आपके द्वारा configure किए गए किसी भी quiet window के दौरान nudges hold की जाती हैं; कुछ भी तब fire नहीं होता जब आपने explicitly silence माँगा हो
- **Daily budget** — default रूप से Athena trigger-driven kinds से अधिकतम तीन nudges प्रति दिन भेजती है; यदि आप लगातार किसी प्रकार की nudge dismiss करते हैं, तो उस kind का budget चुपके से समय के साथ घटता है
- **Deduplification** — उसी subject के लिए वही trigger केवल एक बार fire हो सकता है जब तक आप इसे resolve नहीं करते; एक failing agent हर पाँच मिनट में नई nudge produce नहीं करेगा

### Check-in पर act करना

प्रत्येक card दो actions offer करता है: **Engage** और **Dismiss**। Engaging relevant context खोलता है — goal detail, agent की activity, memory entry। Dismissing record करता है कि आपने इसे देखा। यदि voice configured है, तो nudge body वह क्षण spoken है जब यह आती है, यहाँ तक कि chat panel बंद होने पर भी।

:::info
High, urgent, और critical-severity incidents daily nudge budget को पूरी तरह bypass करते हैं — वे कभी frequency caps या quiet hours द्वारा silenced नहीं होते। Safety-floor items हमेशा आप तक पहुँचते हैं।
:::

:::tip
Slash palette में एक quiet-hours ritual set करें (अपने rituals देखने के लिए \`/\` type करें और "what's queued" चुनें) ताकि एक window define करें जहाँ Athena window समाप्त होने तक सभी check-ins hold रखे। यह deep-work blocks के लिए उपयोगी है जहाँ आप शून्य interruption चाहते हैं।
:::
  `,

  "guided-walkthroughs": `
## Guided Walkthroughs

जब आप Athena से पूछते हैं कि कुछ कैसे करें, तो वह सिर्फ बताने के बजाय दिखा सकती है। "show me how to create a persona" या "how do I set up a connector?" कहें और वह एक choice offer करती है: **Build it for me** (वह काम करती है) या **Show me how to build it** (वह आपको खुद करने के माध्यम से walk करती है)।

walkthrough path चुनें और guided tour शुरू होती है। Athena का orb screen पर relevant area की ओर glide करती है — आप इसे move करते हुए देख सकते हैं। जिस element को वह देखना चाहती है उसे corner brackets के साथ एक soft glowing ring मिलती है जो उस पर lock हो जाती है। बाकी UI पूरी तरह visible और clickable रहता है; कुछ भी dimmed या blocked नहीं होता। एक **caption panel** step narration और controls के साथ orb के बगल में चलता है: Back, Pause, Skip, और Stop।

### प्रत्येक step कैसे काम करता है

walkthrough में प्रत्येक step narrate करता है कि आप क्या देख रहे हैं और, जब कुछ करने के लिए है, तो आपके act करने का इंतजार करता है। Highlighted element पर click करने से tour **और** real action दोनों होते हैं — tour और app sync में रहते हैं। कुछ steps "your turn" beats हैं जहाँ auto-advance तब तक पूरी तरह paused है जब तक आप click नहीं करते। अन्य steps आपके narration पढ़ लेने के बाद एक short dwell के बाद automatically advance होते हैं।

Walkthrough keyboard-driveable है: left/right arrows step back और forward, Space pause और resume, Escape stop करता है।

### कौन से walkthroughs उपलब्ध हैं

Athena ने उन surfaces के लिए tours author किए हैं जिनके बारे में users सबसे अधिक पूछते हैं:

- **Creating a persona** — build studio, sigil का describe-your-persona trigger, और autonomous build toggle
- **Setting up a connector** — Vault route, Add new credential flow, और connector type चुनना
- **Creating a trigger** — Events hub और routing canvas Builder
- **Adopting a template** — template gallery और template card पर Adopt affordance
- **Triaging an incident** — Overview Incidents inbox और एक incident row
- **Setting up a goal and KPIs** — Goals board और KPI dashboard

प्रत्येक walkthrough एक call to action के साथ बंद होता है: Start building, Open the catalog, Open the Builder, या Set up a goal — ताकि "show me how" path सीधे "do it" path में ले जाए।

### Point-at और ad-hoc tours

Scripted walkthroughs से परे, Athena conversation के बीच में individual elements को point कर सकती है। यदि आप पूछते हैं "where is the activity feed?" तो वह एक full tour शुरू किए बिना उस पर एक glowing ring flash कर सकती है और एक single caption narrate कर सकती है। वह "show me around" requests के लिए on the fly एक short two-to-six-step tour भी assemble कर सकती है।

:::tip
Athena walkthrough या build-for-me path automatically offer करती है जब आप describe करते हैं कि आप कोई persona चाहते हैं — आपको सही phrase जानने की ज़रूरत नहीं है। बस describe करें कि आप क्या build करना चाहते हैं और वह दोनों options surface करेगी।
:::
  `,

  "the-decision-hub": `
## Decision Hub

Athena के कुछ actions को run होने से पहले आपकी explicit sign-off की ज़रूरत होती है। जब वह कुछ ऐसा करना चाहती है जो state बदले — agent run करना, आपकी identity profile update करना, भविष्य का check-in schedule करना, fleet sessions spawn करना — तो वह इसे एक **approval card** के रूप में propose करती है। Card chat panel में तब तक रहता है जब तक आप इस पर act नहीं करते। आपके करने तक कुछ नहीं होता।

### Approval card के रूप में क्या दिखाई देता है

जिन actions का यह तरीका होता है उनकी range broad है:

- **Agents running** — दिए गए inputs के साथ एक persona execute करना, या एक autonomous one-shot build launch करना
- **Memory और identity writes** — आपकी identity profile update करना, कोई fact या procedural preference लिखना या delete करना, कोई goal लिखना या update करना
- **Future commitments** — एक scheduled check-in जो Athena propose कर रही है ("मैं तीन दिनों में इस बारे में ping करूँगी")
- **Project और dev work** — एक नया project register करना, codebase scan enqueue करना
- **Fleet operations** — नई Claude Code worker sessions spawn करना, session को input भेजना, session kill करना, multi-session operation dispatch करना

### Sensitive operations कभी auto-approved नहीं होते

कुछ categories **कभी** auto-approved नहीं होतीं, यहाँ तक कि जब autonomous mode चालू हो। Identity updates और goal writes को हर बार आपकी review की ज़रूरत होती है — Athena उन्हें propose कर सकती है, लेकिन आपके click के बिना commit नहीं कर सकती। यह by design है: writes जो shape करते हैं कि Athena के लिए आप कौन हैं, और goal state जो proactive check-ins drive करती है, हमेशा एक human in the loop के साथ होती है।

### Approve all

जब एक ही fleet session से कई approval cards pile up हो जाएं — मान लीजिए, एक session तीन file writes के लिए row में wait कर रहा है — तो card group एक **Approve all** button दिखाता है जो उस session में हर approval-type card को एक साथ resolve करता है। Guidance requests जिनके लिए typed answers की ज़रूरत है वे कभी batched नहीं होते; वे individual रहते हैं।

### Hub कहाँ रहता है

Approval cards chat panel में, composer के ऊपर inline appear होते हैं। आप अपने running agent sessions से pending approvals भी वहाँ देख सकते हैं — जो भी आपके decision का इंतजार कर रहा है वह individual agent views में scattered होने के बजाय एक जगह surface होता है।

:::info
यदि Athena कोई action propose करती है और आप उसे reject करते हैं, तो वह rejection को feedback के रूप में receive करती है और एक alternative propose कर सकती है। Rejecting हमेशा safe है — आपके approve करने तक कोई state नहीं बदलता।
:::
  `,

  "operating-by-chat": `
## Chat द्वारा App को संचालित करना

Athena केवल सलाह से अधिक कर सकती है — वह app drive कर सकती है। उसे कहीं ले जाने, editor खोलने, dashboard build करने, या connected service call करने के लिए कहें, और वह करती है, destination flash करती है ताकि आपकी आँखें वहाँ पहुँचें जहाँ वह अभी लेकर आई है।

### Voice या text द्वारा navigate करना

Athena से app के किसी भी main section को खोलने के लिए कहें — Overview, Agents, Events, Credentials, Settings, और अन्य — और वह sidebar route switch करती है। Destination का container एक moment के लिए pulse करता है ताकि आपको पता चले कि वह कहाँ पहुँची। यह panel बंद होने पर voice turn से भी काम करता है: "take me to the activity feed" कहें और app navigate हो जाता है जबकि Athena chat में confirm करती है।

एक specific context से, वह और गहरी जा सकती है। "comparison mode में summarizer agent के लिए Lab में jump into करो" कहें और वह उस agent का editor matrix comparison view में pre-selected खोलती है। Route और mode selection एक single action में होते हैं।

### एक custom cockpit compose करना

जब Athena किसी operational चीज़ को explain करना चाहती है — आपकी agent fleet status, एक connected service summary, pending approvals — तो वह एक **cockpit** compose कर सकती है: आपके Home tab पर एक widget grid जो data को chat prose में dump करने के बजाय directly दिखाती है। वह widgets assemble करती है, spec persist करती है, आपको वहाँ navigate करती है, और panel cockpit container के flash के साथ confirm करती है।

आप उससे explicitly cockpit build करने के लिए भी कह सकते हैं: "मेरे top तीन agents और कोई pending reviews दिखाने वाला dashboard बनाओ।" Widgets जो उपयोगी साबित होते हैं उन्हें एक click से permanently pin किया जा सकता है।

### Radar और Sunrise buttons

Companion toolbar में दो buttons Athena के दो सबसे common operational summaries तक one-tap access देते हैं:

- **Radar** — एक fleet review। Athena आपके execution store से एक digest pre-gather करती है — team health, goal progress, agent performance, Director scores — और एक single focused turn में उस पर reason करती है। इसे use करें जब आप honest read चाहते हों कि आपकी पूरी fleet कैसे कर रही है।
- **Sunrise** — एक morning brief। Athena Messages, Human Review, और Incidents में पिछले 24 घंटों को summarize करती है: कितने आए, क्या urgent है, क्या overdue है। इसे session की शुरुआत में खुद को orient करने के लिए use करें।

दोनों buttons data-gathering step के लिए chat turn को bypass करते हैं — आपका click trigger है, और summary किसी अन्य reply की तरह panel में stream back होती है।

### App में "Ask Athena" shortcuts

Personas के अन्य parts **Ask Athena** buttons surface करते हैं जो context directly उसे route करते हैं। Mission Control पर Fleet Optimization card, goal pages, message detail views, और अन्य surfaces सभी में ये हैं। एक पर click करना relevant context को always-mounted panel के माध्यम से voice turn के रूप में भेजता है — orb briefly surface होती है, receipt acknowledge करती है, और turn background में run होता है ताकि आप उस screen पर रहें जहाँ आप थे।

:::tip
Athena आपकी connected services को directly chat में call कर सकती है — Sentry issues, GitHub pull requests, Slack channels, Gmail threads। Toolbar में एक connector pin करें और वह एक background job में उससे fetch कर सकती है, फिर आपको conversation छोड़े बिना अपनी अगली reply में results report करती है।
:::
  `,
};
