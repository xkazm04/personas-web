export const content: Record<string, string> = {
  "meet-athena": `
## Athena kennenlernen

Athena ist Personas' eingebauter Companion — immer verfügbar, immer im Kontext. Sie ist kein Chatbot, der am Rand hängt. Sie kennt deine Agenten, deine Ziele, dein Memory, und sie kann die App tatsächlich in deinem Namen bedienen.

Sie lebt gleichzeitig an zwei Orten. Der **Footer-Avatar** — ihr animiertes Gesicht in der unteren rechten Ecke — ist der Einstiegspunkt: Tippe darauf, um das Chat-Panel zu öffnen, oder halte ihn gedrückt, um eine Spracheingabe zu diktieren, ohne dass das Panel überhaupt geöffnet wird. Der **schwebende Orb** ist ihre zweite Form: ein verschiebbares Overlay, das über deiner Arbeit schwebt, damit sie erreichbar bleibt, wo auch immer du dich in der App befindest. Wenn der Orb aktiviert ist (die Standardeinstellung), öffnet und schließt der Footer den Orb; das eigene Tippen auf den Orb öffnet das vollständige Chat-Panel.

Beide Oberflächen spiegeln auf einen Blick wider, was Athena gerade tut. Während sie denkt, verändert ihr Avatar die Haltung. Während sie spricht, leuchtet der Orb in ihrem Sprachpegel. Wenn eine Hintergrundaufgabe abgeschlossen ist, zeigt der Orb eine kurze Reaktion. Das ist nicht nur Dekoration — es teilt dir ihren Zustand mit, ohne dass du das Panel öffnen musst.

Was Athena leisten kann, geht weit über das Beantworten von Fragen hinaus. Sie kann Fragen beantworten und Funktionen erklären, ja, aber sie kann auch durch die App navigieren, deine Agenten starten, Memory ablegen, Identitätsaktualisierungen vorschlagen und zukünftige Check-ins einplanen. Wenn der autonome Modus eingeschaltet ist, kann sie mehrere Schritte hintereinander verketten, ohne dass du klicken musst.

### Wichtige Punkte

- **Footer-Avatar** — Tippen zum Öffnen/Schließen des Chat-Panels; gedrückt halten, um von überall eine Spracheingabe zu diktieren
- **Schwebender Orb** — verschiebbares Overlay, dieselben zwei Gesten; gleitet bei geführten Walkthroughs in jeden Bereich
- **Bedient die App** — Athena berät nicht nur; sie kann Routen navigieren, Agenten starten und Dashboards zusammenstellen
- **Immer im Kontext** — sie liest dein Memory, deine Ziele und den Agenten-Zustand vor jeder Antwort, sodass sie nie bei null anfängt
- **Ausgangspunkt** — die Themen in diesem Companion-Abschnitt gehen jeweils tiefer: Chatten, Sprache, Memory, proaktive Check-ins, geführte Walkthroughs, der Decision Hub und die App per Chat steuern

:::tip
Wenn du das Chat-Panel schließt, arbeitet Athena weiter. Hintergrundaufgaben laufen im Orb, proaktive Hinweise treffen weiterhin ein, und Sprachantworten werden weiterhin abgespielt — ein geschlossenes Panel pausiert sie nicht.
:::
  `,

  "chatting-with-athena": `
## Mit Athena chatten

Öffne das Panel, und Athena begrüßt dich mit einem **Willkommensbildschirm** — ihrem Avatar, einer kurzen Begrüßung und einer Reihe von **Starter-Prompt-Chips**, die die häufigsten Einstiegspunkte abdecken. Klicke auf einen Chip und die Nachricht wird sofort gesendet; du musst nichts tippen.

Für vorgefertigte Prompts über das Starter-Set hinaus gib \`/\` als erstes Zeichen einer leeren Nachricht ein. Eine **Slash-Palette** öffnet sich über dem Eingabefeld mit voreingestellten Prompts, die du durch Tippen filtern kannst: **get to know me** (das Einführungsinterview, das ihr Memory über dich aufbaut), **show goals**, **what's queued**, **recent decisions**, **live ops**, **memory recap** und **capabilities**. Mit Pfeiltasten navigierst du die Liste, Enter wählt den markierten Eintrag, Escape schließt und löscht die Auswahl.

Wenn Athena antwortet, fügt sie oft **Quick-Reply-Chips** hinzu — zwei bis fünf Folge-Prompts, die zum Verlauf des Gesprächs passen. Klicke einen an, um ihn als nächste Nachricht zu senden. Unterhalb ihrer letzten abgeschlossenen Antwort bekommst du außerdem drei **Verfeinern-Chips**: **Kürzer**, **Mehr Detail** und **Nur Code**. Jeder sendet deine letzte Nachricht mit einem Steuerungs-Suffix neu, damit du die Antwort gestalten kannst, ohne erneut tippen zu müssen.

Das Eingabefeld bleibt offen, während Athena antwortet. Du kannst jederzeit tippen — wenn deine Nachricht wie eine Umleitung klingt ("eigentlich, stopp" oder "warte, stattdessen…"), unterbricht sie die laufende Antwort und stellt deine neue Anfrage in die Warteschlange. Wenn sie additiv klingt ("und außerdem…"), wird sie hinter der aktuellen Antwort eingereiht und danach ausgeführt. Eingereihte Nachrichten siehst du als kleine Chips über dem Eingabefeld; du kannst sie einzeln abbrechen.

Der **autonome Modus** (das ∞-Symbol im Panel-Header) lässt Athena mehrstufige Arbeit selbstständig verketten. Wenn er eingeschaltet ist und sie mehr zu tun hat, plant sie eine Folge-Runde etwa fünfzehn Sekunden später ein, bis zu zwanzig aufeinanderfolgende Runden. Ein schmaler Trenner im Transkript markiert jede autonome Fortsetzung, damit du auf einen Blick erkennen kannst, wo du aufgehört hast und wo sie übernommen hat.

### Wichtige Punkte

- **Willkommensbildschirm** — Starter-Chips senden echte Nachrichten durch dieselbe Pipeline wie getippte
- **Slash-Palette** — tippe \`/\`, um vorgefertigte Prompts zu durchsuchen; per Tippen filtern, mit Enter auswählen
- **Quick-Reply-Chips** — 2–5 Folgeoptionen, die Athena am Ende ihrer Antwort anbietet
- **Verfeinern-Chips** — Kürzer / Mehr Detail / Nur Code; nur unterhalb der letzten abgeschlossenen Antwort
- **Antwort-Umleitung** — tippe, während sie antwortet; wird automatisch als Unterbrechung oder Einreihung eingestuft
- **Autonomer Modus** — Athena verkettet bis zu 20 Runden eigenständiger Arbeit; jede Nachricht von dir bricht die Kette ab

:::tip
Die Slash-Palette-Prompts sind in alle 14 unterstützten Sprachen übersetzt — wenn du Personas in einer anderen Sprache als Englisch nutzt, kommen die voreingestellten Nachrichten in deiner Sprache an, und Athena antwortet entsprechend.
:::
  `,

  "voice-and-hold-to-talk": `
## Sprache und gedrückt halten

Athena unterstützt vollständige bidirektionale Sprache: du diktierst, sie transkribiert und antwortet, und ihre Antwort wird in einer synthetisierten Stimme wiedergegeben. Jeder Teil der Pipeline hat eine Datenschutzoption.

### An Athena diktieren

**Halte den Footer-Avatar oder den schwebenden Orb** etwa eine Viertelsekunde gedrückt. Ein Mikrofon-Badge und ein Puls erscheinen, und die Zwischentranskription wird als Untertitel neben dem Orb angezeigt. Lasse los, wenn du fertig bist — die Transkription wird an Athena übergeben, und die übliche Antwort-Pipeline läuft. Die Antwort streamt ins Panel und wird, wenn eine Sprach-Engine konfiguriert ist, automatisch abgespielt. Das Panel muss nie geöffnet werden; eine Spracheingabe funktioniert, auch wenn es vollständig geschlossen ist.

Der **globale Tastaturkurzbefehl Cmd/Strg+Umschalt+A** ruft Athena von überall in der App auf und startet mit einem Tastendruck eine Spracheingabe. Drücke den Kurzbefehl erneut zum Senden oder Esc, um ohne Senden abzubrechen. Dabei wird dieselbe Sitzung wie beim Halten des Orbs genutzt — ein Kurzbefehl mitten in einem Walkthrough ist dasselbe wie ein Orb-Halten.

### Sprache-zu-Text-Engines

Zwei Engines stehen zur Auswahl, einstellbar unter **Companion → Voice** im STT-Bereich:

:::compare
**Browser (Standard)**
Nutzt die Web Speech API im Renderer der App. Keine Einrichtung nötig. Unter Windows wird das Audio an den Cloud-Sprachdienst des OS-Anbieters weitergeleitet — praktisch, aber nicht lokal.
---
**Lokales Whisper**
Geräte-eigene Transkription über einen \`whisper-cli\`-Sidecar. Audio verlässt deinen Rechner nie. Erfordert das Herunterladen eines Whisper-Modells und das Ablegen der ausführbaren Datei am erwarteten Pfad (der Voice-Tab zeigt den genauen Speicherort und den Download-Status).
:::

### Sprachausgabe-Engines

Wenn Athena antwortet, kann die gesprochene Zusammenfassung von einer von zwei Sprach-Engines kommen:

:::compare
**ElevenLabs (Cloud)**
Hochwertige Synthese mit einem ElevenLabs-API-Zugangsdaten und einer von dir gewählten Stimmen-ID. Stimmspezifisches Tuning: Stabilität, Ähnlichkeit, Stil und Geschwindigkeit. Die Zugangsdaten sind in deinem Vault gespeichert; der API-Schlüssel erreicht den Renderer der App nie.
---
**Piper (lokales ONNX)**
Geräte-eigene Synthese ohne Netzwerkaufruf zur Synthesezeit und ohne nötige Zugangsdaten. Stimmen werden aus einem kuratierten Katalog von rund 17 Stimmen in 14 Sprachen heruntergeladen. Der Voice-Tab zeigt, welche installiert sind.
:::

### Proaktive Hinweise laut vorlesen

Proaktive Check-ins (Ziele, die sich nähern, Agentenfehler, Erinnerungen) können auch gesprochen werden — auch wenn das Chat-Panel geschlossen ist. Arrival-TTS feuert in dem Moment, in dem ein Hinweis eintrifft, und nutzt die von dir konfigurierte Engine. Ein **Nochmal abspielen**-Button in der Fußzeile spielt die letzte gesprochene Nachricht erneut ab, wenn du sie verpasst hast.

:::tip
Wenn du Sprache ganz ohne Cloud-Aufrufe willst, kombiniere lokales Whisper für die Diktierfunktion mit Piper für die Wiedergabe. Beide laufen vollständig auf deinem Gerät. Der Voice-Tab zeigt einen Installationspfad und einen Modell-Browser für jede Engine.
:::
  `,

  "athenas-long-term-memory": `
## Athenas Langzeitgedächtnis

Athena erinnert sich sitzungsübergreifend an dich. Sie beginnt nicht jedes Mal von einem leeren Blatt, wenn du das Panel öffnest — sie liest vor jeder Antwort ihr Memory über dich und gibt damit Antworten, die zu deiner tatsächlichen Situation passen.

### Was sie sich merkt

Das Memory ist in Tiers gegliedert, die jeweils eine andere Art von Wissen abdecken:

- **Fakten** — Dinge, die sie über dich, deine Projekte und die Welt gelernt hat. "Du bevorzugst knappe Zusammenfassungen." "Der Hauptbranch dieses Repos ist master."
- **Prozedurale Präferenzen** — Verhaltensregeln, die sie aufgegriffen hat. "Beim Zusammenfassen eines langen Dokuments die einzeilige Kernaussage voranstellen." "Bei Code-Beispielen TypeScript bevorzugen."
- **Ziele** — die aktiven Ziele und Zieldaten, die sie in deinem Auftrag verfolgt.
- **Identitätsprofil** — ein wachsendes \`identity.md\`-Dokument, das in jeden System-Prompt eingelesen wird. Es ist die einzige Quelle für "wer bist du gerade für Athena" und wächst durch verankerte Bearbeitungen, nie durch vollständige Neufassungen.
- **Episoden** — die Gesprächshistorie selbst, als Markdown-Dateien auf deinem Rechner gespeichert. Die Doctrine (Personas' eigene Referenzdokumente) ergänzt das Produktwissen.

### Bootstrapping mit dem Einführungsinterview

Bei einer Neuinstallation führt Athena automatisch ein kurzes Interview durch — einige gezielte Fragen, die ihr genug geben, um ein erstes Identitätsprofil zu schreiben. Du kannst das Interview jederzeit erneut durchführen, indem du **get to know me** aus der Slash-Palette auswählst oder auf den entsprechenden Chip auf dem Willkommensbildschirm klickst. Wenn bereits ein Identitätsprofil vorhanden ist, aktualisiert sie es mit verankerten Diffs; sie löscht nie den Kontext, den du ihr zuvor gegeben hast.

### Der Memory-Browser

Öffne **Companion → Memory**, um alles zu sehen, was Athena weiß. Der Brain Viewer listet Episoden, Fakten, prozedurale Präferenzen, Ziele und das Identitätsdokument auf — alles durchsuchbar. Klicke auf einen Eintrag, um den vollständigen Inhalt zu lesen, verknüpften Memories zu verwandten Einträgen zu folgen und alles zu bearbeiten oder zu korrigieren, was falsch ist.

**Korrekturen sind ein Klick entfernt.** Jeder Aufzählungspunkt in der Identitätsansicht hat eine "Das ist falsch"-Schaltfläche. Klicke sie an, und Athena zeichnet die Korrektur als hochwertiges Lernsignal auf und schlägt das Entfernen des fehlerhaften Aufzählungspunkts in einer einzigen Bestätigungskarte vor. Du bestätigst, und die falsche Aussage ist weg.

### Datenschutz

Die Brain-Daten — alle fünf Memory-Tiers — liegen auf deinem Rechner unter \`~/.personas/companion-brain/\`. Nichts wird in einer Cloud-Datenbank gespeichert. Wenn du die lokalen Whisper-STT- und Piper-TTS-Engines nutzt, verlässt auch kein Audio deinen Rechner.

:::tip
Das Einführungsinterview ist kurz (ein paar Minuten) und zahlt sich sofort aus — Athenas erste Handvoll Antworten nach einem guten Interview sind spürbar treffender. Führe es vor deiner ersten echten Sitzung durch.
:::
  `,

  "proactive-check-ins": `
## Proaktive Check-ins

Athena wartet nicht darauf, dass du fragst. Wenn etwas passiert, das deine Aufmerksamkeit verdient — eine nahende Deadline, ein wartender Agent, eine von dir gesetzte Erinnerung — meldet sie sich zuerst. Das sind proaktive Check-ins: Karten, die im Chat-Panel erscheinen, optional laut vorgelesen, ohne dass du irgendetwas öffnen musst.

### Was einen Check-in auslöst

Athena wertet Bedingungen ungefähr alle fünf Minuten aus. Die Auslöser, die einen Check-in erzeugen können, umfassen:

- **Zieldatum naht** — ein aktives Ziel hat ein Zieldatum innerhalb von 24 Stunden
- **Rückstand veraltet** — eine selbst gegebene Verpflichtung ist über einen Tier-Schwellwert hinaus unbearbeitet (eskalierend von 1 Tag über 3 Tage bis 7 Tage)
- **Rhythmus fällig** — ein von dir festgelegtes Ritual (ein wiederkehrender Check-in, ein Fokusfenster) trifft "jetzt" zu
- **An diesem Tag** — eine Notiz oder Reflexion vom selben Kalendertag vor einem Monat, drei Monaten oder einem Jahr, abgeglichen mit deinen aktiven Zielen
- **Agent braucht dich** — eine Fleet-Sitzung ist fehlgeschlagen, wartet seit mehr als zwei Minuten auf Eingabe oder ist veraltet
- **Athenas eigene Verpflichtungen** — geplante Check-ins, die Athena vorgeschlagen und du in einem Gespräch bestätigt hast, geliefert zum genauen Zeitpunkt, den sie zugesagt hat

### Leitplanken

Das System ist so gestaltet, dass es nützlich ist, ohne lästig zu werden:

- **Ruhestunden** — Hinweise werden während jedes von dir konfigurierten Ruhefensters zurückgehalten; nichts feuert, solange du explizit um Stille gebeten hast
- **Tagesbudget** — standardmäßig sendet Athena höchstens drei Hinweise pro Tag aus den triggergesteuerten Arten; wenn du einen bestimmten Hinweistyp konsequent ablehnst, sinkt das Budget für diese Art im Laufe der Zeit leise
- **Deduplizierung** — derselbe Auslöser für dasselbe Thema kann nur einmal feuern, bis du ihn auflöst; ein fehlschlagender Agent erzeugt nicht alle fünf Minuten einen neuen Hinweis

### Auf einen Check-in reagieren

Jede Karte bietet zwei Aktionen: **Ansehen** und **Verwerfen**. Ansehen öffnet den relevanten Kontext — das Zieldetail, die Aktivität des Agenten, den Memory-Eintrag. Verwerfen zeichnet auf, dass du ihn gesehen hast. Wenn Sprache konfiguriert ist, wird der Hinweistext in dem Moment gesprochen, in dem er ankommt, auch wenn das Chat-Panel geschlossen ist.

:::info
Vorfälle mit hohem, dringendem und kritischem Schweregrad umgehen das tägliche Hinweisbudget vollständig — sie werden nie durch Frequenzgrenzen oder Ruhestunden unterdrückt. Sicherheitsrelevante Punkte erreichen dich immer.
:::

:::tip
Richte ein Ruhestunden-Ritual in der Slash-Palette ein (tippe \`/\` und wähle "what's queued", um deine Rituale zu sehen), um ein Fenster zu definieren, in dem Athena alle Check-ins bis zum Ende des Fensters zurückhält. Das ist nützlich für intensive Arbeitsphasen, in denen du null Unterbrechungen willst.
:::
  `,

  "guided-walkthroughs": `
## Geführte Walkthroughs

Wenn du Athena fragst, wie man etwas macht, kann sie es dir zeigen, statt es nur zu erklären. Sag "zeig mir, wie man eine Persona erstellt" oder "wie richte ich einen Connector ein?" und sie bietet dir eine Wahl an: **Für mich bauen** (sie erledigt die Arbeit) oder **Zeig mir, wie ich es baue** (sie führt dich selbst durch).

Wähle den Walkthrough-Pfad, und die geführte Tour beginnt. Athenas Orb gleitet über den Bildschirm in den relevanten Bereich — du kannst ihn dabei beobachten. Das Element, auf das sie hinweisen möchte, bekommt einen sanft leuchtenden Ring mit Eckenklammern, der daran haften bleibt. Der Rest der Benutzeroberfläche bleibt vollständig sichtbar und anklickbar; nichts wird abgedunkelt oder blockiert. Ein **Beschriftungs-Panel** begleitet den Orb mit dem Schritt-Kommentar und Steuerelementen: Zurück, Pause, Überspringen und Stopp.

### So funktioniert jeder Schritt

Jeder Schritt in einem Walkthrough kommentiert, was du siehst, und wartet, wenn etwas zu tun ist, bis du handelst. Das Klicken auf das markierte Element rückt die Tour vor **und** führt die echte Aktion aus — Tour und App bleiben synchron. Einige Schritte sind "Du bist dran"-Pausen, bei denen der automatische Vorschub vollständig unterbrochen ist, bis du klickst. Andere Schritte rücken automatisch vor, nach einer kurzen Wartezeit, sobald du den Kommentar gelesen hast.

Der Walkthrough ist per Tastatur bedienbar: Links-/Rechtspfeile schrittweise zurück und vor, Leertaste pausiert und setzt fort, Escape stoppt.

### Welche Walkthroughs verfügbar sind

Athena hat Touren für die Bereiche erstellt, nach denen Nutzer am häufigsten fragen:

- **Eine Persona erstellen** — das Build-Studio, der Beschreibe-deine-Persona-Auslöser des Sigils und der autonome Build-Schalter
- **Einen Connector einrichten** — die Vault-Route, der Neue-Zugangsdaten-hinzufügen-Flow und die Auswahl eines Connector-Typs
- **Einen Trigger erstellen** — der Events-Hub und der Routing-Canvas-Builder
- **Eine Vorlage übernehmen** — die Vorlagensammlung und die Übernehmen-Schaltfläche auf einer Vorlagenkarte
- **Einen Vorfall triagieren** — der Vorfalls-Eingang unter Overview und eine Vorfallszeile
- **Ein Ziel und KPIs einrichten** — das Ziel-Board und das KPI-Dashboard

Jeder Walkthrough endet mit einem Handlungsaufruf: Bauen beginnen, Katalog öffnen, Builder öffnen oder Ziel einrichten — sodass der "Zeig mir wie"-Pfad direkt in den "Tu es"-Pfad führt.

### Auf etwas zeigen und Ad-hoc-Touren

Über skriptierte Walkthroughs hinaus kann Athena mitten im Gespräch auf einzelne Elemente zeigen. Wenn du fragst "wo ist der Aktivitäts-Feed?", kann sie einen leuchtenden Ring darauf einblenden und einen einzelnen Kommentar erzählen, ohne eine vollständige Tour zu starten. Sie kann auch eine kurze zwei- bis sechsschrittige Tour auf der Stelle für "Zeig mir hier mal kurz alles"-Anfragen zusammenstellen.

:::tip
Athena bietet den Walkthrough oder den Für-mich-bauen-Pfad automatisch an, wenn du eine Persona beschreibst, die du willst — du musst nicht die richtige Formulierung kennen. Beschreibe einfach, was du bauen möchtest, und sie zeigt dir beide Optionen.
:::
  `,

  "the-decision-hub": `
## Der Decision Hub

Einige von Athenas Aktionen brauchen deine ausdrückliche Freigabe, bevor sie ausgeführt werden. Wenn sie etwas tun möchte, das den Zustand verändert — einen Agenten starten, dein Identitätsprofil aktualisieren, einen zukünftigen Check-in einplanen, Fleet-Sitzungen starten — schlägt sie es als **Bestätigungskarte** vor. Die Karte bleibt im Chat-Panel, bis du reagierst. Nichts passiert, bis du es tust.

### Was als Bestätigungskarte erscheint

Die Bandbreite der Aktionen, die so angezeigt werden, ist breit:

- **Agenten starten** — eine Persona mit gegebenen Eingaben ausführen oder einen autonomen Einmal-Build starten
- **Memory- und Identitätsschreibzugriffe** — dein Identitätsprofil aktualisieren, einen Fakt oder eine prozedurale Präferenz schreiben oder löschen, ein Ziel schreiben oder aktualisieren
- **Zukünftige Verpflichtungen** — ein geplanter Check-in, den Athena vorschlägt ("Ich melde mich in drei Tagen zu diesem Thema")
- **Projekt- und Entwicklungsarbeit** — ein neues Projekt registrieren, einen Codebase-Scan in die Warteschlange stellen
- **Fleet-Operationen** — neue Claude Code Worker-Sitzungen starten, Eingabe an eine Sitzung senden, eine Sitzung beenden, eine Multi-Sitzungs-Operation veranlassen

### Sensible Operationen werden nie automatisch genehmigt

Bestimmte Kategorien werden **nie** automatisch genehmigt, auch wenn der autonome Modus eingeschaltet ist. Identitätsaktualisierungen und Zielschreibzugriffe erfordern jedes Mal deine Überprüfung — Athena kann sie vorschlagen, aber sie kann sie ohne deinen Klick nicht festschreiben. Das ist so beabsichtigt: Schreibzugriffe, die formen, wer du für Athena bist, und Zielzustand, der proaktive Check-ins antreibt, haben immer einen Menschen in der Schleife.

### Alle genehmigen

Wenn sich mehrere Bestätigungskarten aus derselben Fleet-Sitzung anhäufen — sagen wir, eine Sitzung wartet auf drei Datei-Schreibzugriffe in Folge —, zeigt die Kartengruppe eine **Alle genehmigen**-Schaltfläche, die jede Genehmigungs-Karte in dieser Sitzung auf einmal auflöst. Anweisungsanfragen, die eingetippte Antworten brauchen, werden nie gebündelt; sie bleiben einzeln.

### Wo der Hub lebt

Bestätigungskarten erscheinen inline im Chat-Panel, über dem Eingabefeld. Du kannst dort auch ausstehende Genehmigungen aus deinen laufenden Agenten-Sitzungen sehen — alles, was auf deine Entscheidung wartet, erscheint an einem Ort statt verstreut über einzelne Agentenansichten.

:::info
Wenn Athena eine Aktion vorschlägt und du sie ablehnst, empfängt sie die Ablehnung als Feedback und kann eine Alternative vorschlagen. Ablehnen ist immer sicher — kein Zustand ändert sich, bis du genehmigst.
:::
  `,

  "operating-by-chat": `
## Die App per Chat bedienen

Athena kann mehr als beraten — sie kann die App steuern. Bitte sie, dich irgendwo hinzubringen, einen Editor zu öffnen, ein Dashboard zu bauen oder einen verbundenen Dienst aufzurufen, und sie tut es, mit einem kurzen Aufleuchten des Ziels, damit dein Blick auf dem landet, was sie gerade aufgerufen hat.

### Per Sprache oder Text navigieren

Bitte Athena, einen beliebigen Hauptbereich der App zu öffnen — Overview, Agents, Events, Credentials, Settings und andere —, und sie wechselt die Seitenleisten-Route. Der Container des Ziels pulsiert kurz, damit du weißt, wo sie gelandet ist. Das funktioniert auch bei einer Spracheingabe mit geschlossenem Panel: Sag "geh zum Aktivitäts-Feed" und die App navigiert, während Athena im Chat bestätigt.

Aus einem bestimmten Kontext kann sie tiefer gehen. Bitte sie, "in das Lab für den Zusammenfassungs-Agenten im Vergleichsmodus zu springen", und sie öffnet den Editor dieses Agenten, vorausgewählt auf die Matrix-Vergleichsansicht. Route und Modus-Auswahl geschehen in einer einzigen Aktion.

### Ein eigenes Cockpit zusammenstellen

Wenn Athena etwas Operatives erklären möchte — deinen Agenten-Fleet-Status, eine Zusammenfassung eines verbundenen Dienstes, ausstehende Genehmigungen — kann sie ein **Cockpit** zusammenstellen: ein Widget-Raster auf deinem Home-Tab, das die Daten direkt anzeigt, statt sie als Chat-Text auszugeben. Sie stellt die Widgets zusammen, speichert die Spezifikation, navigiert dich dorthin, und das Panel bestätigt mit einem Aufleuchten des Cockpit-Containers.

Du kannst sie auch explizit bitten, ein Cockpit zu bauen: "Stell ein Dashboard zusammen, das meine drei besten Agenten und alle ausstehenden Reviews zeigt." Nützliche Widgets können mit einem Klick dauerhaft angeheftet werden.

### Die Radar- und Sunrise-Schaltflächen

Zwei Schaltflächen in der Companion-Symbolleiste geben dir Ein-Klick-Zugriff auf Athenas zwei häufigste operative Zusammenfassungen:

- **Radar** — eine Fleet-Überprüfung. Athena sammelt vorab einen Digest aus deinem Execution-Store — Team-Gesundheit, Zielfortschritt, Agenten-Performance, Director-Werte — und denkt darüber in einer einzigen fokussierten Runde nach. Nutze das, wenn du eine ehrliche Einschätzung deines gesamten Fleets willst.
- **Sunrise** — ein Morgenbriefing. Athena fasst die letzten 24 Stunden über Messages, Human Review und Incidents zusammen: wie viele eintrafen, was dringend ist, was überfällig ist. Nutze das, um dich zu Beginn einer Sitzung zu orientieren.

Beide Schaltflächen umgehen die Chat-Runde für den Daten-Sammelschritt — dein Klick ist der Auslöser, und die Zusammenfassung streamt wie jede andere Antwort ins Panel zurück.

### „Ask Athena"-Shortcuts in der gesamten App

Andere Teile von Personas zeigen **Ask Athena**-Schaltflächen, die Kontext direkt an sie weiterleiten. Die Fleet-Optimization-Karte im Mission Control, Zielseiten, Nachrichtendetailansichten und andere Bereiche haben diese alle. Ein Klick sendet den relevanten Kontext als Spracheingabe durch das immer eingehängte Panel — der Orb erscheint kurz, bestätigt den Empfang, und die Runde läuft im Hintergrund, damit du auf dem Bildschirm bleibst, auf dem du warst.

:::tip
Athena kann deine verbundenen Dienste direkt im Chat aufrufen — Sentry-Probleme, GitHub Pull Requests, Slack-Kanäle, Gmail-Threads. Hefte einen Connector in der Symbolleiste an, und sie kann davon in einem Hintergrundjob abrufen und die Ergebnisse dann in ihrer nächsten Antwort melden, ohne dass du das Gespräch verlässt.
:::
  `,
};
