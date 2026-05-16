export const content: Record<string, string> = {
  "installing-personas": `
## Personas installieren

Personas auf deinem Computer einzurichten dauert etwa eine Minute. Hole dir das Installationsprogramm für dein Betriebssystem — Windows, macOS oder Linux — von der Download-Seite und führe es aus. Das Installationsprogramm ist eine einzelne Datei ohne Einrichtungsassistent; Doppelklicken, Sicherheitsabfrage bestätigen, und die App startet. Updates werden automatisch im Hintergrund geliefert, sodass du immer die neueste Version hast, ohne etwas tun zu müssen.

Wenn die App zum ersten Mal öffnet, landest du auf dem Begrüßungsbildschirm. Von dort kannst du entweder direkt einen Agenten bauen (Personas bietet an, einen KI-Anbieter einzurichten, sobald du einen brauchst) oder zuerst den Zugangsdaten-Tresor öffnen, falls du bereits API-Schlüssel zum Speichern hast. Beide Wege funktionieren.

:::steps
1. **Lade das Installationsprogramm herunter** — wähle die richtige Datei für dein Betriebssystem (NSIS \`.exe\` unter Windows, \`.dmg\` unter macOS, \`.AppImage\` oder \`.deb\` unter Linux)
2. **Führe das Installationsprogramm aus** — doppelklicken unter Windows, in den Programme-Ordner ziehen unter macOS, ausführen unter Linux
3. **Bestätige Sicherheitsabfragen** — dein Betriebssystem fragt eventuell nach Bestätigung; das ist bei neuer Desktop-Software normal
4. **Starte Personas** — der Begrüßungsbildschirm öffnet sich mit einer geführten Tour, die du mitmachen oder überspringen kannst
5. **Optional: einen Anbieter verbinden** — füge auf der Connections-Seite einen API-Schlüssel ein, wenn du sofort startklar sein willst
:::

:::info
Funktioniert unter **Windows 10+**, **macOS 12+** und den meisten modernen **Linux**-Distributionen. Das Windows-Installationsprogramm ist eine 53 MB NSIS \`.exe\`; das mitgelieferte Binary ist nach der Installation etwa 90 MB groß. Auto-Updates sind reine Delta-Updates und daher typischerweise viel kleiner.
:::

:::tip
Wenn du eine Windows-SmartScreen- oder macOS-Gatekeeper-Warnung siehst, ist das einfach dein Betriebssystem, das mit neuer Software vorsichtig ist. Bestätige es und du bist startklar — das Installationsprogramm ist codesigniert.
:::
  `,

  "creating-your-first-agent": `
## Deinen ersten Agenten erstellen

Dein erster Agent dauert etwa fünf Minuten von null bis zum funktionierenden Assistenten. Du hast zwei Wege: **von einer Vorlage starten** (empfohlen für deinen ersten Agenten — die Build-Engine setzt aus deinen Antworten eine funktionierende Konfiguration zusammen) oder **bei null anfangen** (volle manuelle Kontrolle). Beide enden am selben Ort: ein Agent, den du ausführen kannst.

Wählst du den Vorlagenweg, startet die Build-Engine eine interaktive Sitzung. Sie stellt Klärungsfragen in Bündeln ("welche Art von Eingabe erwartest du?", "wohin soll die Ausgabe?", "wie oft soll das laufen?"), schlägt anhand deiner Antworten Parameter vor und zeigt eine Live-Vorschau des Agenten, den sie bauen will. Du bestätigst am Ende, und der Agent ist testbereit.

Wählst du den Weg von Grund auf, schreibst du den Prompt selbst, wählst das KI-Modell, hängst Tools an und speicherst.

:::steps
1. **Öffne die Agents-Seite** — Seitenleiste → Agents, oder drücke \`Ctrl+1\`, um direkt dorthin zu springen
2. **Klicke auf Create Agent** — wähle einen Weg: eine Vorlage auswählen oder leer starten
3. **Beantworte die Build-Fragen (Vorlagenweg)** — die Build-Engine bündelt Klärungsfragen pro Capability und zeigt eine Live-Vorschau, während deine Antworten den Agenten formen
4. **Passe Prompt und Tools an** — feinjustiere die von der Vorlage erzeugten Anweisungen (oder schreibe sie von Grund auf)
5. **Befördere wenn bereit** — verschiebt den Agenten vom Entwurf in den aktiven Status; Setup-Status-Checks laufen automatisch und kennzeichnen jegliche nicht verbundene Zugangsdaten oder nicht konfigurierte Trigger, bevor du befördern kannst
:::

### So funktioniert es

Der Vorlagenweg ist der schnellste Weg zu einem *guten* Agenten (Vorlagen werden von uns entworfen und getestet), aber du wirst ihn überwachsen. Sobald du ein paar vorlagenbasierte Agenten ausgeliefert hast, schreibst du Prompts direkt und behandelst Vorlagen als Ausgangspunkte statt als komplette Lösungen.

:::tip
Mach dir keine Sorgen darum, deinen ersten Agenten perfekt zu machen. Der Versionsverlauf (später behandelt) bedeutet, dass du frei experimentieren kannst — jedes Speichern ist ein Checkpoint, zu dem du zurückkehren kannst.
:::
  `,

  "understanding-the-interface": `
## Die Oberfläche verstehen

Die Personas-Oberfläche hat drei Hauptbereiche. Die **Seitenleiste** links ist deine Top-Level-Navigation — Home, Overview, Agents, Events, Connections, Templates, Plugins, Schedules, Pipeline, Deployment und Settings. Klicke auf einen Top-Level-Bereich, und eine Navigation der zweiten Ebene erscheint mit seinen Unterseiten (z. B. zeigt ein Klick auf Agents All Agents plus die Editor-Tabs für den aktuell ausgewählten Agenten: Prompt, Connectors, Lab, Activity, Health, Settings).

Der zentrale Bereich ist der **Arbeitsbereich**, in dem alles tatsächlich passiert — Prompts bearbeiten, Ausführungen beobachten, den Zugangsdaten-Katalog durchstöbern. Die **Titelleiste** oben enthält die Benachrichtigungsglocke (klicke für die frischesten Ausführungsdetails), den Cockpit-Zugang ("Talk to Athena") und die globale Suche. Der **untere Streifen** zeigt aktive Ausführungen und alle dringenden Systemereignisse.

| Bereich | Was er tut |
|------|-------------|
| Seitenleiste Ebene 1 | Top-Level-Bereiche — Home, Overview, Agents, Events, Connections, Templates, Plugins, Schedules, Pipeline, Deployment, Settings |
| Seitenleiste Ebene 2 | Kontextsensitive Sub-Navigation für den aktiven Bereich |
| Arbeitsbereich | Der Haupt-Editor / -Browser / -Dashboard für den jeweiligen Bereich |
| Titelleiste | Benachrichtigungsglocke, Cockpit-Shortcut, globale Suche, App-Steuerung |
| Unterer Streifen | Aktive Ausführungen, Systemstatus |

### So funktioniert es

Das meiste, was du tust, geschieht durch Klicken auf einen Seitenleisten-Eintrag und Bearbeiten im Arbeitsbereich. Die Benachrichtigungsglocke in der Titelleiste ist der einzige universelle Shortcut, den es sich zu merken lohnt — sie öffnet immer das neueste Ausführungsdetail, egal wo du gerade bist. Der Cockpit-Shortcut ("Talk to Athena") öffnet einen In-App-Chat mit dem Companion, der dir beim Bauen, Debuggen oder einfach beim Beantworten von Fragen zu deinem Setup helfen kann.

:::tip
Bewege den Mauszeiger über ein Seitenleisten-Symbol für einen Tooltip mit dem Tastenkürzel. \`Ctrl+1\` bis \`Ctrl+9\` springen direkt zu Top-Level-Bereichen, und \`Ctrl+K\` öffnet die globale Suche, damit du alles per Name finden kannst.
:::
  `,

  "what-is-an-ai-agent": `
## Was ist ein KI-Agent?

Ein KI-Agent ist ein konfiguriertes KI-Modell mit einer Aufgabe. Du gibst ihm Anweisungen ("lies meine ungelesenen E-Mails und fasse die wichtigen zusammen"), sagst ihm, welche Tools er nutzen darf, und triggerst ihn — manuell per Knopfdruck, nach Zeitplan, per Ereignis oder als Schritt in einer Pipeline. Der Agent liest die Trigger-Nutzlast, folgt deinen Anweisungen, ruft benötigte Tools auf und produziert eine Ausgabe. Anders als ein Chatbot handelt der Agent: sendet die E-Mail, schreibt die Datei, postet auf Slack.

Jeder Agent in Personas ist beständig — er behält sein Setup, seine Historie, seine Zugangsdaten und (optional) Memories aus vergangenen Läufen. Du kannst ihn klonen, seinen Prompt versionieren, ihn in einer Arena gegen alternative Prompts laufen lassen, um zu sehen, welcher besser abschneidet, und ihn mit anderen Agenten verketten, um mehrstufige Workflows zu bauen.

:::compare
**Chatbot**
Du tippst eine Frage, er antwortet. Jeder Zug ist einmalig. Nützlich für schnelle Nachschlagewerke, Brainstorming, Entwürfe. Keine Aktionen, kein Gedächtnis über Sitzungen hinweg, keine Automatisierung.
---
**KI-Agent** [recommended]
Eine persistente Konfiguration mit einer Aufgabe. Manuell oder automatisch getriggert; nutzt Tools, um zu handeln; hat versionierten Prompt, angehängte Zugangsdaten, Ausführungsverlauf und einen Health-Indikator. Das Modell ist der Motor, aber der Agent ist die gesamte Konstruktion drumherum.
:::

### So funktioniert es

:::diagram
[Trigger feuert] --> [Agent liest Eingabe] --> [Modell + Tools führen aus] --> [Ausgabe wird verteilt]
:::

Der Trigger packt eine Eingabe-Nutzlast (einen Webhook-Body, eine Zwischenablage-Zeichenkette, einen Dateipfad, ein Ereignis von einem anderen Agenten …). Der Agent liest seinen Prompt, gibt ihn dem KI-Modell zusammen mit der Eingabe und lässt das Modell angehängte Tools nach Bedarf aufrufen. Die finale Ausgabe wird über den von dir konfigurierten Ausgabekanal verteilt — zurück an eine UI, in eine Datei geschrieben, auf Slack gepostet oder als Eingabe an den nächsten Agenten weitergegeben.

:::tip
Der schnellste Weg, Agenten zu verstehen, ist, sich deine wiederkehrenden wöchentlichen Aufgaben anzuschauen und zu fragen: "Könnte das getriggert, angewiesen und automatisiert werden?" Wenn ja, ist diese Aufgabe ein Agent.
:::
  `,

  "running-your-first-automation": `
## Deine erste Automatisierung ausführen

Sobald du einen Agenten erstellt hast, hast du mehrere Möglichkeiten, ihn zu starten. Die einfachste ist der manuelle **Run**-Knopf oben im Agenten-Editor — klicke ihn an, und du siehst den Live-Ausführungs-Stream im Activity-Panel. Innerhalb weniger Sekunden (oder ein paar Minuten bei langsameren Anbietern oder längeren Prompts) erscheint die Ausgabe.

Für wiederkehrende Arbeit füge einen Schedule-Trigger, einen Webhook-Trigger, einen File-Watcher-Trigger oder einen Chain-Trigger hinzu, damit der Agent von selbst läuft. Du richtest den Trigger einmal ein, der Agent macht den Rest.

:::steps
1. **Öffne den Agenten** — finde ihn auf der Agents-Seite; der Editor öffnet sich mit dem fokussierten Prompt-Tab
2. **Klicke auf Run** — der Arbeitsbereich wechselt automatisch zum Activity-Tab; du siehst, wie der Prompt aufgebaut wird, der Modellaufruf rausgeht und Tokens zurückströmen
3. **Beobachte den Live-Feed** — jeder Agent hat seinen eigenen Stream, sodass du mehrere parallel ausführen kannst, ohne durcheinanderzukommen
4. **Sieh dir die Ausgabe an** — die Activity-Zeile klappt auf und zeigt den vollständigen Prompt, die Modellantwort, alle Tool-Aufrufe, die Dauer und die Kosten
5. **Iteriere** — ändere den Prompt oder Einstellungen, speichere, führe erneut aus; jeder Lauf wird mit einem Checkpoint versehen
:::

### So funktioniert es

Ein Lauf ist eine einzelne Ausführung: Trigger → Prompt-Konstruktion → Modellaufruf → Tool-Aufrufe → Ausgabe. Jeder Schritt wird im Ausführungs-Trace erfasst, und der Lauf landet im Activity-Tab der Overview-Seite (die globale Ansicht über alle Agenten) und im eigenen Activity-Tab des Agenten. Von jedem Ort aus kannst du in den Lauf klicken, um das vollständige Detailmodal zu öffnen.

Wenn ein Lauf fehlschlägt (Modellfehler, abgelaufene Zugangsdaten, Netzwerk-Aussetzer), wird der Health-Indikator des Agenten gelb oder rot, und der Fehler wird im Trace bewahrt, damit du debuggen kannst.

:::tip
Bei deinem ersten Lauf geht es teilweise darum zu lernen, was dein Prompt tatsächlich in der Praxis macht. Wenn die Ausgabe nicht das ist, was du wolltest, zeigt der Trace dir genau, was das Modell erhalten hat — meist liegt die Lösung darin, den Prompt zu klären oder einzugrenzen, nicht es erneut zu versuchen.
:::
  `,

  "choosing-your-ai-provider": `
## Deinen KI-Anbieter wählen

Personas unterstützt die wichtigsten KI-Anbieter — **Anthropic** (Claude-Familie), **OpenAI** (GPT-Familie), **Google** (Gemini) und **lokale Modelle** über Ollama oder jeden OpenAI-kompatiblen Endpunkt. Du kannst auch benutzerdefinierte Anbieter in Settings → Custom Models konfigurieren. Jeder Agent wählt seinen Anbieter/sein Modell unabhängig, sodass du günstige Modelle für Routinearbeit nutzen und teure für Aufgaben reservieren kannst, die sie brauchen.

Verbinde einen Anbieter einmal auf der Connections-Seite (du fügst einen API-Schlüssel ein — verschlüsselt im lokalen Tresor — oder gehst durch OAuth bei Anbietern, die das unterstützen). Danach zeigt der Modell-Picker jedes Agenten die konfigurierten Anbieter und ihre Modelle.

:::compare
**Anthropic Claude** [recommended]
Starke Befolgung von Anweisungen, Reasoning mit langem Kontext, strukturierte Ausgabe. Sonnet 4.6 ist der Standard für neue Agenten. Opus-Modelle für härtestes Reasoning, Haiku für Geschwindigkeit/Kosten. Exzellent bei Tool-Use-Schleifen.
---
**OpenAI GPT**
Das breiteste Ökosystem und das am meisten getestete für viele Anwendungsfälle. Solider Allrounder; GPT-4o-Klasse-Modelle sind stark für allgemeine Assistenzarbeit.
---
**Google Gemini**
Multimodal, große Kontextfenster, schnelle Latenz für das erste Token. Stark für Recherche- / Dokumentenverarbeitungs-Agenten.
---
**Lokal (Ollama / OpenAI-kompatibel)**
Läuft auf deinem Rechner — keine Daten verlassen das Gerät. Kleinere Modelle, aber für Arbeit mit geringem Risiko oder privater Natur lohnt sich der Kompromiss oft.
:::

### So funktioniert es

Sobald mehrere Anbieter verbunden sind, kann Personas auf Agent-Ebene automatisches Failover durchführen: Wenn dein primärer Anbieter Fehler über einem Schwellwert zurückgibt, nutzt der nächste Lauf des Agenten den konfigurierten Fallback-Anbieter. Wenn sich der primäre erholt, geht die normale Rotation weiter. Das wird pro Agent im Editor → Settings-Tab konfiguriert.

Für die Kostenverfolgung wird jeder Lauf mit Anbieter, Modell und Token-Anzahl getaggt, sodass der Overview → Usage-Tab Ausgaben nach Anbieter, Modell oder Agent aufschlüsseln kann.

### In Aktion

:::usecases
**Modell-pro-Agent-Strategie**
Deine Agenten haben unterschiedliche Bedürfnisse
---
Code-Review-Agent nutzt Claude Opus (bestes Reasoning); E-Mail-Zusammenfasser nutzt Haiku (schnell und günstig); ein persönlicher/privater Agent läuft lokal auf Ollama.
===
**Failover bei Anbieterausfall**
Ein Anbieter hat einen regionalen Ausfall
---
Betroffene Agenten leiten automatisch auf den konfigurierten Fallback um; der Health-Tab zeigt, welche Agenten auf Fallback laufen, und meldet die Erholung, sobald der primäre zurückkommt.
===
**Kostenreduktion**
Die monatlichen KI-Ausgaben schleichen sich hoch
---
Overview → Usage zeigt, welche Agenten und Modelle die Ausgaben dominieren. Tausche die teuersten Agenten auf eine günstigere Stufe (Sonnet → Haiku, GPT-4o → GPT-4o-mini); das Lab kann sie zuerst per A-B vergleichen, um sicherzustellen, dass die Qualität hält.
:::

:::info
Der Standard-Anbieter für neue Agenten wird in Settings → Engine festgelegt. Du kannst ihn pro Agent überschreiben.
:::

:::tip
Die meisten Anbieter bieten kostenlose Testguthaben an. Verbinde zwei oder drei und lass denselben Prompt im Lab gegen jeden in der Arena laufen — du wirst die Persönlichkeitsunterschiede spüren und einen Standard wählen, der zu deinem Stil passt.
:::
  `,

  "starter-vs-team-vs-builder-tiers": `
## Starter vs. Team vs. Builder Tiers

Personas wird in drei Tiers ausgeliefert. **Starter** ist kostenlos, nur lokal und reicht aus, um echte Agenten zu bauen und das System zu lernen. **Team** fügt Kollaborationsfunktionen, Cloud-Deployment und das vollständige Testing-Lab hinzu. **Builder** schaltet die fortschrittlichsten Oberflächen frei — vollständige Pipeline-Orchestrierung, Genome-Evolution für Prompt-Optimierung und BYOI (bring your own infrastructure) für Cloud-Deployment auf dein eigenes Gateway.

Du kannst den Tier jederzeit ändern. Bestehende Agenten bleiben beim Downgrade unversehrt; tier-gebundene Funktionen werden deaktiviert, bis du wieder upgradest. Keine Agenten oder Zugangsdaten werden jemals gelöscht.

:::compare
**Starter (Kostenlos)**
Bis zu 5 Agenten. Manuelle + Schedule- + Clipboard-Trigger. Nur lokale Ausführung. Grundlegendes Lab (Single-Prompt-Läufe, keine Arena). Einzelnutzer. Perfekt zum Lernen und für persönliche Automatisierung.
---
**Team**
Unbegrenzte Agenten. Alle Trigger-Typen einschließlich Webhooks und File Watchers. Cloud-Deployment über den verwalteten Orchestrator. Vollständiges Lab (Arena, A-B, Eval-Grid). Im Team geteilte Agenten. Priority-Support.
---
**Builder** [recommended]
Alles in Team plus erweiterte Pipelines (bedingtes Routing, Team-Memory), Genome-Evolution (automatische Prompt-Optimierung aus dem Ausführungsverlauf) und BYOI Cloud-Deploy (hoste den Orchestrator selbst).
:::

### So funktioniert es

Öffne Settings → Account, um deinen aktuellen Tier, die Nutzung gegenüber den Tier-Limits und den Upgrade-Pfad zu sehen. Upgrades werden sofort aktiviert; Downgrades werden zum nächsten Abrechnungszyklus wirksam, damit du nicht mitten in der Periode den Zugriff verlierst.

:::tip
Starte mit Starter. In dem Moment, in dem du an ein Agenten-Anzahl-Limit stößt oder einen Webhook-Trigger willst, hast du einen echten Anwendungsfall fürs Upgraden gefunden — und du weißt genau, welche Features die Kosten zurückzahlen.
:::
  `,

  "system-requirements": `
## Systemanforderungen

Personas ist eine Tauri-Desktop-App — Rust-Backend, React-Frontend, lokale SQLite-Datenbank — und bewusst schlank gehalten. Der Großteil der schweren Rechenarbeit findet auf den Servern des KI-Anbieters statt, nicht auf deinem Rechner. Die App läuft im Leerlauf bei nahezu null CPU und nutzt ein paar hundert Megabyte RAM; sie skaliert nur, wenn Agenten aktiv lokal laufen.

Das mitgelieferte Binary ist nach der Installation etwa 90 MB groß. Plugins (Artist für Bildgenerierung, Obsidian Brain für Vektorsuche) können diesen Footprint erhöhen, wenn du sie aktivierst.

:::checklist
- Windows 10+, macOS 12+ oder Ubuntu 20.04+ (neueste Version empfohlen)
- Mindestens 4 GB RAM (8 GB+ empfohlen, wenn du die Embeddings- / Vektorsuche-Plugins nutzt)
- 1 GB freier Festplattenspeicher (mehr, wenn du die lokalen Modelle des Artist-Plugins aktivierst)
- Stabile Breitbandverbindung — die Agentenausführung ist an die API-Latenz des KI-Anbieters gebunden
- Jede moderne Dual-Core-CPU; Quad-Core oder besser empfohlen für parallele Multi-Agenten-Läufe
:::

### So funktioniert es

Die App speichert ihre Datenbank (\`personas.db\`), den Zugangsdaten-Tresor, den Ausführungsverlauf und die Konfiguration lokal in deinem OS-spezifischen App-Daten-Verzeichnis. Nichts wird hochgeladen, es sei denn, du aktivierst explizit Cloud-Deployment oder nutzt einen Cloud-KI-Anbieter. Plugins, die lokale Modelle ausliefern (z. B. das Artist-Plugin mit Bildgenerierung + Gemini-Vision), laden die Modelldateien bei der ersten Nutzung herunter.

Der Windows-Build nutzt ONNX Runtime für Embeddings, wenn die Vektor-Wissensdatenbank-Funktion aktiviert ist; das ist in diesem Fall die größte Einzelabhängigkeit.

:::tip
Wenn sich die App während eines Multi-Agenten-Laufs langsam anfühlt, öffne den Health-Tab — er zeigt, welche Agenten und welche Abhängigkeiten (Modellaufrufe, Tool-Aufrufe, ONNX-Inferenz) zur Last beitragen.
:::
  `,

  "keyboard-shortcuts-and-tips": `
## Tastenkürzel und Tipps

Ein paar Tastenkürzel decken die meiste Reibung in der App ab. \`Ctrl+K\` öffnet die globale Suche (finde jeden Agenten, jede Seite oder Einstellung per Name). \`Ctrl+1\`–\`Ctrl+9\` springen zu Top-Level-Seitenleisten-Bereichen. \`Ctrl+Enter\` führt den fokussierten Agenten aus. \`Ctrl+N\` öffnet den Create-Agent-Flow.

Du kannst jede Tastenbelegung in Settings → Appearance → Keyboard Shortcuts anpassen; Standardwerte folgen wo möglich den OS-Konventionen.

### Essenzielle Shortcuts

:::keys
Ctrl+K — Globale Suche (alles per Name finden)
Ctrl+N — Einen neuen Agenten erstellen
Ctrl+Enter — Den fokussierten Agenten ausführen
Ctrl+S — Änderungen im aktuellen Editor speichern
Ctrl+/ — Seitenleiste auf-/zuklappen
Ctrl+, — Settings öffnen
Ctrl+? — Tastenkürzel-Spickzettel zeigen
:::

### Navigations-Shortcuts

:::keys
Ctrl+1 — Home
Ctrl+2 — Overview
Ctrl+3 — Agents
Ctrl+4 — Events
Ctrl+5 — Connections
Ctrl+6 — Templates
Ctrl+7 — Plugins
Ctrl+Shift+P — Command-Palette öffnen (jede Aktion per Name ausführen)
:::

### So funktioniert es

Die Command-Palette (\`Ctrl+Shift+P\`) ist die Power-User-Oberfläche. Tippe ein Verb (\`run\`, \`clone\`, \`disable\`, \`open\`) plus den Zielnamen, und die Palette zeigt passende Aktionen über deinen gesamten Workspace. Sobald du die Namen der Dinge kennst, ist das schneller als manuelle Navigation.

:::tip
Beginne mit \`Ctrl+K\`. Tippe ein paar Buchstaben eines Agentennamens und drücke Enter — dieser eine Shortcut deckt vielleicht 60 % der alltäglichen Navigation ab.
:::
  `,

  "where-to-get-help": `
## Wo du Hilfe bekommst

Du bist nie auf dich allein gestellt. **In-App-Hilfe** ist der schnellste Weg: der Cockpit-Chat ("Talk to Athena" in der Titelleiste) ist ein LLM-gestützter Companion, der dein Setup, deine jüngsten Ausführungen und das Produkt kennt. Stelle ihm Fragen in klarer Sprache, und er kann auch Konfigurationsänderungen vorschlagen, dich zum richtigen Tab führen oder eine Debug-Sitzung für einen fehlschlagenden Lauf öffnen.

Für Dinge, die der In-App-Companion nicht beantworten kann, ist der **Guide** (diese Seite) die ausführliche Referenz, der **Community-Discord** der Ort, wo du andere Nutzer und das Team fragst, und **E-Mail-Support** für Konto- oder Abrechnungsfragen.

| Ressource | Am besten für | Antwortzeit |
|----------|----------|---------------|
| Cockpit / Athena (in-app) | Einrichtungsfragen, Debugging, "wo ist X?" | Sofort |
| Dieser Guide | Feature-Referenz und How-tos | Sofort |
| Dokumentationsseite | Architektur, Schema, fortgeschrittene Integrationen | Sofort |
| Discord-Community | Tipps, Rezepte, "sieht das noch jemand?" | Minuten |
| Support-E-Mail | Konto, Abrechnung, Sicherheit | Stunden |
| Video-Tutorials | Visuelle Walkthroughs der wichtigsten Flows | Sofort |

### So funktioniert es

Das Cockpit hat Zugriff auf eine Doctrine — eine kuratierte Wissensbasis über das Produkt — und auf deinen lokalen Zustand (anonymisiert). Es kann deine Ausführungen durchsuchen, Änderungen empfehlen und sogar inline UI-Karten erstellen, die dich Schritt für Schritt durch eine Lösung führen. Wenn es nicht antworten kann, schlägt es die richtige externe Ressource vor.

:::tip
Bei "Ich glaube, etwas ist kaputt"-Fragen öffne zuerst Athena und frage "diagnose den letzten fehlschlagenden Lauf von Agent X". Der Debug-Flow des Cockpits ist dafür gebaut und schlägt das manuelle Lesen von Logs meist um Längen.
:::
  `,
};
