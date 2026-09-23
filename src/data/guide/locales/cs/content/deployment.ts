export const content: Record<string, string> = {
  "github-actions-integration": `
## Integrace GitHub Actions

Agenti mohou spouštět GitHub Actions workflow přes GitHub nástroj na své kartě Connectors a GitHub Actions mohou spouštět agenty přes standardní webhook spouštěč. Dva vzory dobře kombinují: GitHub událost (PR otevřen, push na main, release otagován) spustí webhook, který spustí Personas agenta, agent dělá svou věc a (pokud je potřeba) agent spustí workflow jako součást svého výstupu.

GitHub konektor se dodává v Katalogu (Connections → Catalog → Developer Tools → GitHub). Auth je OAuth nebo fine-grained PAT — OAuth je preferovaný, když agent potřebuje jen read přístup; PATy fungují dobře pro write operace jako odesílání workflow.

### Klíčové body

- **GitHub → Personas přes příchozí webhook** — standardní webhook spouštěč; nakonfiguruj GitHub, aby POSToval na URL agenta
- **Personas → GitHub přes GitHub nástroj** — agent může odesílat workflow, komentovat PRy, otvírat issues, cokoli, co vystavuje GitHub API
- **Scopovaný auth** — OAuth pro převážně-read agenty, fine-grained PAT pro write operace; minimální scopy per agent
- **Synchronizace živého stavu** — trace agenta ukazují požadavek workflow_dispatch a odpověď GitHubu; agent může čekat na dokončení workflow, pokud je potřeba

### Jak to funguje

:::diagram
[GitHub event] --> [Inbound webhook] --> [Agent decides] --> [GitHub tool dispatches workflow] --> [Workflow result back into trace]
:::

GitHub nástroj obaluje GitHub REST/GraphQL API a vystavuje high-level akce agentovi: „dispatch workflow", „comment on PR", „open issue", „merge PR" atd. Prompt agenta pojmenovává akci, kterou by měl podniknout na základě spouštěče; nástroj zvládá auth, konstrukci payloadu a zpracování odpovědi.

:::warning
Použij fine-grained PATy přes klasické PATy, kdykoli to tvůj GitHub plán podporuje. Klasické PATy udělují široká org-wide oprávnění; fine-grained PATy omezují na konkrétní repozitáře a konkrétní permission scopy, což dramaticky utěsňuje blast radius, pokud token kdy unikne.
:::

:::tip
Začni s low-stakes workflow jako cíl — jako workflow „notify Slack", které jen postuje zprávu. Jakmile je agent → GitHub Actions handoff prokázán, postup k high-stakes cílům (deploy, release-cut atd.).
:::
  `,

  "gitlab-ci-cd-integration": `
## Integrace GitLab CI/CD

Personas integrují s GitLab dvěma způsoby: přímý GitLab plugin, který dává agentům API-level přístup (status pipeline, MR komentáře, správa issues), a GitLab CI YAML export, který spouští Personas agenty jako kroky uvnitř tvých existujících pipelines. Oba se dodávají; vyber ten, který odpovídá tvaru workflow tvého týmu.

Plugin (Plugins → GitLab) zvládá API-stranní integraci: nainstaluj, autentizuj a tví agenti dostanou \`gitlab\` nástrojový povrch s high-level akcemi (start pipeline, comment on MR, manage issues). CI YAML export jde opačným směrem — tví agenti se stávají kroky v tvých GitLab CI pipelines, spouštěnými GitLab runners, s výsledky předávanými dopředu do dalších kroků.

### Klíčové body

- **GitLab plugin** — API-level integrace; agent používá GitLab jako nástroj z karty Connectors
- **CI YAML export** — agent se stává krokem v tvé GitLab pipelině; běží na tvých GitLab runners
- **Obousměrné** — GitLab události mohou spouštět agenty (webhook) a agenti mohou spouštět GitLab pipelines (plugin)
- **Token scopy** — použij project access tokens nebo group access tokens scopované na minimální potřebná oprávnění
- **Pipeline události jako spouštěče** — \`Pipeline succeeded\`, \`Pipeline failed\`, \`MR merged\` jsou všechny konzumovatelné přes webhook spouštěč

### Jak to funguje

Plugin používá GitLab API tokeny uložené v trezoru přihlašovacích údajů. Když agent vyvolá akci GitLab nástroje, engine odešle API volání, zachytí odpověď a krmí ji zpět jako výsledek nástroje pro další tah modelu.

Pro CI export: otevři kartu Settings agenta → Export → GitLab CI YAML. Průvodce generuje definici úlohy, která obaluje agenta v CI-spustitelném tvaru (typicky Docker image s Personas CLI plus referencí agenta). Commitni vygenerované YAML do \`.gitlab-ci.yml\` tvého repozitáře; agent běží jako součást tvé pipeline vedle dalších CI úloh.

:::warning
Exportovaný CI YAML odkazuje na proměnné přihlašovacích údajů pro věci jako klíče AI poskytovatele. Definuj tyto jako **masked, protected** GitLab CI/CD proměnné v nastavení tvého projektu — nikdy nehardkóduj tajemství v samotném YAML souboru, protože pipeline YAML žije v tvém repu a je viditelný komukoli s read přístupem.
:::

:::tip
Plugin je lehčí variantou pro většinu týmů. CI YAML export je nejužitečnější, když agent musí běžet uvnitř GitLab runneru stejně (síťová izolace, internal-network zdroje, infrastruktura mandátovaná compliancí) — jinak ti plugin umožní držet agenta v Personas, kde jsou jeho observabilita a ladění nejbohatší.
:::
  `,

  "n8n-workflow-integration": `
## Integrace pracovních postupů n8n

n8n je populární open-source nástroj automatizace workflow a Personas s ním integrují obousměrně. Můžeš importovat existující n8n workflow do Personas jako šablony (Templates → n8n Import) — průvodce importu parsuje JSON workflow a mapuje n8n uzly na ekvivalentní Personas agenty, konektory a spouštěče. Můžeš také volat Personas agenty *z* n8n pomocí HTTP/webhook uzlů pro vyvolání URL příchozího webhooku agenta.

n8n import je jednosměrný a jednorázový: přináší *tvar* workflow do Personas, ale neudržuje n8n originál synchronizovaný. Po importu je importovaná pipeline tvá k nezávislé editaci.

### Klíčové body

- **n8n → Personas import** — Templates → n8n Import; parsuje JSON workflow, mapuje uzly na Personas ekvivalenty
- **Personas → n8n spouštěč** — HTTP/webhook uzly n8n mohou POSTovat na URL webhook spouštěče agenta
- **n8n → Personas spouštěč** — n8n může volat Personas agent webhook jako součást n8n workflow; odpověď agenta (konfigurovatelná) teče zpět do n8n
- **Nesynchronizováno** — importované pipeliny se rozcházejí od svého n8n zdroje; ber import jako jednorázový výchozí bod
- **Pokrytí mapovaných uzlů** — importer zvládá běžné uzly (HTTP, function, IF, switch); exotické / community uzly mohou importovat jako placeholdery pro manuální dokončení

### Jak to funguje

Průvodce importu čte JSON workflow n8n (export z n8n → „Download" na workflow), mapuje každý uzel na svůj nejbližší Personas ekvivalent (HTTP uzly → nástroje, function uzly → agenti, IF/switch → podmíněné směrování atd.) a stage výsledek jako pipelinu, kterou si prohlédneš před přijetím. Mapování je best-effort: cokoli, co importer nemůže mapovat s důvěrou, se stává placeholderem s poznámkou pro tebe k vyplnění.

Pro opačný směr je URL webhooku Personas agenta jen URL — libovolný n8n HTTP uzel ji může volat. Předej vstup jako tělo požadavku; agent zpracuje a (volitelně) odpoví synchronně svým výstupem.

:::tip
n8n vyniká v „přesouvání dat mezi službami" instalatérství; Personas vyniká v „přemýšlení" — analýze, rozhodování, psaní. Nejsilnější kombinovaná workflow používají n8n pro orchestraci plus Personas agenty pro AI-poháněné rozhodovací body, místo snahy dělat vše jedním v druhém.
:::
  `,

};
