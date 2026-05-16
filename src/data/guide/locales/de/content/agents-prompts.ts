export const content: Record<string, string> = {
  "creating-a-new-agent": `
## Einen neuen Agenten erstellen

Du hast zwei Wege, einen neuen Agenten zu erstellen. **Von Grund auf** — klicke \`Create Agent\`, gib ihm einen Namen und schreibe selbst die Anweisungen. **Aus einer Vorlage** — durchstöbere die Vorlagengalerie, wähle eine, die zu dem passt, was du tun willst (Rechnungsverarbeitung, Tagesberichte, Social Posting …), beantworte ein paar kurze Fragen zu deinem speziellen Anwendungsfall und lass die Build-Engine den Agenten für dich zusammenstellen. Die meisten starten mit einer Vorlage und passen von dort an.

In jedem Fall wählst du einen Namen und ein Symbol, wählst, welches KI-Modell den Agenten antreibt, und entscheidest, welche Tools (E-Mail, Websuche, Dateizugriff usw.) er nutzen darf. Keine dieser Entscheidungen ist endgültig — du kannst jede Einstellung später ändern.

:::steps
1. **Klicke auf Create Agent** — über die Seitenleiste oder den Home-Bildschirm
2. **Wähle einen Weg** — leer starten oder eine Vorlage aus der Galerie wählen
3. **Beantworte die Build-Fragen** — wenn du den Vorlagenweg genommen hast; die Build-Engine passt den Agenten an deine Antworten an
4. **Benenne deinen Agenten** — und wähle ein Symbol
5. **Passe Prompt und Tools an** — feinjustiere die von der Vorlage erzeugten Anweisungen (oder schreibe sie von Grund auf)
6. **Befördere wenn bereit** — der Agent wechselt vom Entwurf zu aktiv, sobald du bestätigst
:::

### So funktioniert es

Der Vorlagenweg startet eine interaktive Build-Sitzung: die Engine stellt Klärungsfragen zu deinem Anwendungsfall, schlägt Parameter vor (Eingabeform, Ausgabekanäle, Zeitplan-Häufigkeit) und zeigt eine Live-Vorschau des Agenten, den sie zusammenbauen will. Du bestätigst am Ende, und der Agent ist testbereit. Der Weg von Grund auf überspringt all das — nützlich, wenn du bereits genau weißt, was der Agent tun soll.

:::tip
Gute Agentennamen beschreiben die Aufgabe, nicht die Technologie. "Morning Email Summary" ist nützlicher als "GPT Agent 3".
:::
  `,

  "writing-effective-prompts": `
## Effektive Prompts schreiben

Ein Prompt ist die Menge an Anweisungen, die du deinem Agenten gibst. Gute Prompts sind spezifisch, konkret und geordnet: definiere die Rolle des Agenten, formuliere die Aufgabe, beschreibe die Eingabeform, gib das Ausgabeformat an und benenne Randfälle. Vage Prompts erzeugen vage Ausgaben — "fasse meine E-Mails zusammen" funktioniert viel schlechter als "lies meine fünf neuesten ungelesenen E-Mails und schreibe eine zweisätzige Zusammenfassung jeder, geordnet nach Senderwichtigkeit."

Die Build-Engine hilft dir hier. Wenn du eine Vorlage übernimmst, stellt die Engine Klärungsfragen in Bündeln pro Capability (Eingabequelle, Ausgabekanal, Format, Häufigkeit) und webt deine Antworten in einen strukturierten Prompt ein. Wenn du von Grund auf schreibst, machst du dieses Weben selbst — aber dieselben fünf Eingaben sind es, die zuverlässige Agenten produzieren.

### Checkliste für Prompt-Qualität

:::checklist
- Definiere die Rolle — "Du bist ein X, der Y macht." Verankert das Verhalten des Modells.
- Formuliere die Aufgabe konkret — Verben, Zahlen, Zeitfenster. Vermeide "hilf mir mit …"
- Beschreibe die Eingabe — welche Form, welche Felder, was der Agent ignorieren soll
- Spezifiziere die Ausgabe — Aufzählungen vs. Absätze vs. JSON, mit Feldnamen wenn strukturiert
- Behandle Randfälle — was tun, wenn die Eingabe leer, fehlerhaft oder unerwartet ist
- Verwende Beispiele — selbst ein Input/Output-Paar verbessert die Konsistenz dramatisch
:::

### So funktioniert es

Jeder Lauf baut den Prompt aus deiner gespeicherten Vorlage, der Trigger-Nutzlast und etwaiger Agent-Memory zusammen, die das Modell konsultieren darf. Das Modell sieht denselben Prompt, den du geschrieben hast (in der Reihenfolge, in der du ihn geschrieben hast), plus die Eingabe — was zurückkommt, ist sein ehrlicher Versuch, deinen Anweisungen zu folgen. Der Trace-Tab im Ausführungsdetail zeigt den genauen Prompt, der gesendet wurde, sodass du bei abweichender Ausgabe sehen kannst, ob der Prompt oder die Eingabe schuld ist.

:::tip
Schreibe den Prompt, als würdest du einen klugen, aber brandneuen Auftragnehmer einweisen. Setze nichts voraus. Wenn der Agent zum ersten Mal eine Ausgabe produziert, schau dir den Trace an und frage: "Hätte ein menschlicher Auftragnehmer verstanden, was ich von diesem Prompt wollte?"
:::
  `,

  "simple-vs-structured-prompt-mode": `
## Einfacher vs. strukturierter Prompt-Modus

Der Prompt-Editor bietet zwei Modi. **Einfacher Modus** ist eine einzige freie Textbox — du tippst den Prompt als einen Block Prosa. Schnell für kleine oder experimentelle Agenten. **Strukturierter Modus** unterteilt den Prompt in fünf benannte Abschnitte (Identity, Instructions, Tools, Examples, Error Handling), damit du jeden Aspekt separat durchdenken und einen bearbeiten kannst, ohne die anderen zu beeinflussen.

Du kannst jederzeit zwischen den Modi wechseln, ohne Arbeit zu verlieren. Der Editor parst beim Wechsel nach oben einfache Prosa in strukturierte Abschnitte und fügt beim Wechsel nach unten strukturierte Abschnitte wieder zu einem einzigen Block zusammen.

:::compare
**Einfacher Modus**
Eine Textbox. Freie Prosa. Schnell zu entwerfen, schnell zu iterieren. Am besten für Experimente und persönliche Agenten, bei denen du der einzige Leser bist.
---
**Strukturierter Modus** [recommended for shared/production agents]
Fünf benannte Abschnitte — Identity, Instructions, Tools, Examples, Error Handling. Langsamer zu entwerfen, aber einfacher zu pflegen. Jeder Abschnitt kann unabhängig überprüft und geändert werden, was wichtig ist, wenn du (oder jemand anderes) den Agenten Monate später wieder besucht.
:::

:::info
Beide Modi produzieren zur Laufzeit denselben Prompt unter der Haube. Strukturierter Modus ist eine UX-Ebene, die dir hilft, deine Gedanken zu ordnen; das Modell sieht den gerenderten Prompt in beiden Fällen.
:::

### So funktioniert es

Das Wechseln der Modi ist nicht destruktiv: der Editor speichert intern die strukturierte Repräsentation, und der einfache Modus ist eine geflachte Ansicht davon. Der Versionsverlauf bewahrt den Modus, in dem du gespeichert hast, sodass das Wiederherstellen einer alten Version auch den Modus zurückbringt, in dem sie verfasst wurde.

:::tip
Starte im einfachen Modus, während du herausfindest, was der Agent tun soll. Sobald du mit dem Verhalten zufrieden bist, wechsle in den strukturierten Modus für den langen Lauf — es zahlt sich beim ersten Mal aus, wenn du nur den Examples-Abschnitt anpassen musst, ohne den gesamten Prompt erneut zu lesen.
:::
  `,

  "structured-prompt-sections-explained": `
## Abschnitte des strukturierten Prompts erklärt

Der strukturierte Modus teilt den Prompt in fünf Abschnitte auf. Jeder hat eine bestimmte Aufgabe, und die Build-Engine verwendet dieselben fünf Eimer, wenn sie Prompts aus Vorlagen generiert — die Abschnitte sind also kein UI-Eigenheit, sondern ein stabiler Vertrag zwischen deinem Authoring und dem, was das Modell vom Agenten sieht.

### Die fünf Abschnitte

:::diagram
[Identity] --> [Instructions] --> [Tools] --> [Examples] --> [Error Handling]
:::

- **Identity** — wer der Agent ist. Rolle, Persönlichkeit, Fachgebiet, Kommunikationsstil. Die "du bist ein …"-Zeile.
- **Instructions** — was der Agent tut, Schritt für Schritt. Die Kernaufgabe und alle Unteraufgaben, in der Reihenfolge, in der sie geschehen sollen.
- **Tools** — welche Fähigkeiten der Agent nutzt und wie er sie nutzt. Wann welches Tool aufzurufen ist, welche Argumente wichtig sind, was mit Ergebnissen zu tun ist.
- **Examples** — Input/Output-Paare, die zeigen, wie "gut" aussieht. Der mit Abstand am wenigsten genutzte Abschnitt und einer der wirkungsvollsten — ein solides Beispiel schlägt drei zusätzliche Sätze Anweisung.
- **Error Handling** — was zu tun ist, wenn die Eingabe fehlt, fehlerhaft oder unerwartet ist. Wo zu stoppen, was erneut zu versuchen, was an manuelle Überprüfung zu eskalieren.

### So funktioniert es

Der Renderer verkettet die Abschnitte in der gezeigten Reihenfolge mit klaren Trennern. Einige Modelle achten mehr auf frühe Abschnitte; die Reihenfolge ist so gestaltet, dass Rolle und Kernaufgabe zuerst kommen, mit Beispielen und Fehlerbehandlung unten, wo sie noch im Kontext sind, aber die Schlagzeile nicht verwässern. Wenn du strukturierte Prompts zum ersten Mal verwendest, fülle sofort Identity und Instructions aus und lass die anderen leer — das Modell wird gut funktionieren, und du kannst Examples / Error Handling hinzufügen, wenn Randfälle auftauchen.

:::tip
Wenn ein Agent anfängt, Randfall-Fehler zu produzieren, schau dir den Trace an und frage: "Hätte ich das mit einem Beispiel verhindern können?" Die meisten "der Agent ist schlecht bei X"-Probleme sind in Wirklichkeit "Ich habe ihm nie gezeigt, wie gutes X aussieht."
:::
  `,

  "agent-settings-and-limits": `
## Agenteneinstellungen und Limits

Der Settings-Tab im Agenten-Editor ist der Ort, an dem du Leitplanken setzt. Jeder Agent hat Limits dafür, wie lange er läuft, wie viel er pro Lauf kostet, wie viele Modell-Züge er nehmen darf und wie viele Kopien parallel laufen dürfen. Standardwerte sind konservativ — genug, damit echte Arbeit passieren kann, niedrig genug, damit ein sich fehlverhaltender Agent keine Rechnung anhäufen kann, bevor du es merkst.

Die Limits sind besonders wichtig für unbeaufsichtigte Agenten (geplant, webhook-getriggert, chain-getriggert). Manuelle Läufe siehst du; geplante Läufe nicht, sodass ein außer Kontrolle geratener Prompt eine Woche lang stündlich feuern könnte, bevor du nachschaust.

### Wichtige Einstellungen

- **Timeout** — gesamte Wanduhrzeit, bevor der Lauf abgebrochen wird. Standard 2 Minuten, erhöhe für langsame Modelle oder lange Tool-Use-Ketten.
- **Budget cap** — maximale Kosten pro Lauf, ausgewertet gegen den Live-Kostenzähler; der Lauf bricht sauber ab, wenn er das Limit überschreitet.
- **Max turns** — Anzahl der Modell ↔ Tool-Roundtrips, die in einem Lauf erlaubt sind. Verhindert Tool-Call-Schleifen, in denen das Modell nie konvergiert.
- **Concurrency** — wie viele parallele Ausführungen dieses Agenten erlaubt sind. Setze auf 1 für zustandsbehaftete Agenten (damit sie sich nicht auf derselben Eingabe überlappen); erhöhe für parallele Batch-Arbeit.
- **Memory access** — ob der Agent zur Laufzeit aus seinem Memory-Store liest (standardmäßig an für Agenten mit aktivierter Memory).
- **Failover provider** — alternativer KI-Anbieter, der genutzt wird, wenn der primäre Fehler über einem Schwellwert zurückgibt. Setze ihn bei Agenten, deren Uptime dir wichtig ist.

### So funktioniert es

Limits werden von der Execution-Engine erzwungen, nicht vom Modell. Wenn ein Lauf ein Limit erreicht, stoppt er sauber — der partielle Trace wird bewahrt, der Lauf wird mit dem Grund markiert (\`timeout\`, \`budget_exceeded\`, \`turns_exceeded\`), und keine Gebühr oder Zustandsmutation bleibt für den abgeschnittenen Teil bestehen. Der Health-Tab zeigt Limit-Stops als Warnungen an, damit du entscheiden kannst, ob du das Limit erhöhst oder den zugrundeliegenden Prompt korrigierst.

:::tip
Beginne mit konservativen Limits bei jedem neuen Agenten. Der günstigste Moment, einen außer Kontrolle geratenen Prompt zu entdecken, ist beim dritten manuellen Lauf, nicht beim dritten geplanten Nachtlauf.
:::
  `,

  "assigning-tools-to-agents": `
## Agenten Tools zuweisen

Tools sind wie Apps auf einem Smartphone — dein Agent kann nur die nutzen, die du installierst. Indem du bestimmte Tools zuweist, kontrollierst du genau, was dein Agent tun darf. Ein Agent mit E-Mail-Zugriff kann Nachrichten lesen und senden; einer mit Websuche kann Dinge online nachschlagen.

:::warning
Das ist auch ein Sicherheitsmerkmal. Ein Agent kann nicht versehentlich Dateien ändern, wenn er keinen Dateizugriff hat, und er kann keine E-Mails senden, wenn er keine E-Mail-Tools hat. Du hast immer die Kontrolle darüber, was deine Agenten anfassen können und was nicht.
:::

### Verfügbare Tool-Typen

- **Email** — E-Mail-Nachrichten lesen, verfassen und senden
- **Web search** — Informationen im Internet nachschlagen
- **File access** — Dateien auf deinem Computer oder Cloud-Speicher lesen und schreiben
- **API calls** — mit externen Diensten und Datenbanken interagieren
- **Clipboard** — von deiner Zwischenablage lesen und darauf schreiben
- **Messaging channels** — Ergebnisse als Teil der Agentenausgabe an Slack, Discord, Teams oder jeden generischen Webhook-Endpunkt senden

### So weist du Tools zu

:::steps
1. **Öffne den Connectors-Tab** — im Agenten-Editor; er zeigt jede Capability, die dein Agent braucht, gegen deinen Tresor
2. **Wähle eine Kategorie, nicht einen bestimmten Dienst** — wähle "email" oder "cloud storage", und der Picker zeigt passende Zugangsdaten, die du bereits hast, plus vorgeschlagene Konnektoren, falls nicht
3. **Autorisiere alles Neue** — bei OAuth-Diensten klickst du dich durch einen einmaligen Zustimmungsbildschirm; die resultierenden Zugangsdaten landen in deinem Tresor und sind über Agenten hinweg wiederverwendbar
4. **Pre-flight-Check** — bevor du den Agenten beförderst, prüft die Build-Engine jede benötigte Capability gegen den Tresor und kennzeichnet, was fehlt
5. **Speichere die Konfiguration** — der Agent nutzt die zugewiesenen Tools beim nächsten Lauf; wenn eine Zugangsdaten später abläuft, siehst du es im Health-Indikator des Agenten
:::

:::tip
Weise nur die Tools zu, die dein Agent wirklich braucht. Weniger Tools bedeuten weniger Dinge, die schiefgehen können, und dein Agent bleibt auf seine Aufgabe fokussiert.
:::
  `,

  "prompt-version-history": `
## Prompt-Versionsverlauf

Jedes Speichern eines Agenten-Prompts erstellt eine unveränderliche Version. Der Verlauf lebt neben dem Prompt-Editor im Prompt-Tab — öffne ihn, und du siehst jedes Speichern mit Zeitstempel, mit dem Diff zur vorherigen Version inline sichtbar. Es gibt kein Limit; die allererste Version wird unbegrenzt aufbewahrt.

Das System versioniert auch automatisch, wenn die Build-Engine einen Prompt ändert (z. B. während der Vorlagenübernahme oder beim Neuaufbau von Parametern), sodass Änderungen der Engine neben deinen manuellen Bearbeitungen mit einem klaren "auto-generated"-Label erscheinen.

### Wichtige Punkte

- **Automatische Snapshots** bei jedem Speichern — manuelle Bearbeitungen und Engine-Bearbeitungen gleichermaßen
- **Wiederherstellung mit einem Klick** — wähle eine Version und mach sie zum aktuellen Prompt; die aktuelle Version wird zuerst gespeichert, sodass Wiederherstellungen nie verlustbehaftet sind
- **Inline-Diff** — sieh, was zwischen zwei Versionen geändert wurde, ohne den Tab zu verlassen
- **Unbegrenzte Aufbewahrung** — Versionen verfallen nie und werden nicht von der Garbage Collection erfasst

### So funktioniert es

Der Verlauf wird in der lokalen SQLite-Datenbank gespeichert (neben dem Agenten selbst), sodass er sofort durchsuchbar ist und offline funktioniert. Wenn du eine Version wiederherstellst, wechselt der Editor zu ihr, aber die zuvor aktuelle Version wird ebenfalls bewahrt — du kannst zurückwechseln, ohne deine Arbeit erneut zu machen.

:::tip
Vor einer riskanten Prompt-Änderung mache ein No-op-Speichern, damit der aktuelle Stand im Verlauf gespeichert wird. Dann experimentiere frei — die Wiederherstellung ist ein Klick, wenn das Experiment fehlschlägt.
:::
  `,

  "comparing-prompt-versions": `
## Prompt-Versionen vergleichen

Wenn sich das Verhalten eines Agenten ändert und du wissen willst warum, zeigt die Diff-Ansicht im Versionsverlauf genau, welche Zeichen des Prompts zwischen zwei beliebigen Versionen unterschiedlich sind. Hinzugefügtes wird grün hervorgehoben, Entferntes rot. Das ist der schnellste Weg, eine Regression einzugrenzen — du kannst die problematische Änderung meist in Sekunden sehen.

Die Diff respektiert auch die Abschnitte des strukturierten Prompts: Wenn du zwei strukturierte-Modus-Versionen vergleichst, ist die Diff pro Abschnitt segmentiert, sodass du irrelevante Abschnitte ignorieren und dich auf den geänderten konzentrieren kannst.

:::code-compare
### Original
Summarize the emails in my inbox.
Give me the key points.
---
### Improved
Read my 5 most recent unread emails.
For each email, write a 2-sentence summary
including the sender name and action needed.
Format as a numbered list.
:::

### Wichtige Punkte

- **Nebeneinander-Ansicht** — beide Versionen gleichzeitig sichtbar mit zeichengenauer Hervorhebung
- **Pro-Abschnitt-Diff** für strukturierte Prompts — springe direkt zum geänderten Abschnitt
- **Vergleiche zwei beliebige Versionen** — nicht nur aufeinanderfolgende; nützlich für "was hat sich seit der funktionierenden Version vor drei Wochen geändert"
- **Schnelle Wiederherstellung** — stelle jede Version direkt aus der Diff-Ansicht wieder her

### So funktioniert es

Öffne den Versionsverlauf im Prompt-Tab, hake die Boxen neben zwei Versionen an und klicke Compare. Die Diff wird in einem Side-by-Side-Panel gerendert. Klicke Restore auf einer der Seiten, um sie zur aktuellen zu machen; die Diff bleibt offen, damit du genau siehst, wozu du zurückgekehrt bist.

:::tip
Wenn du in einer Diff die problematische Änderung findest, kopiere die *neue* (kaputte) Version in den Prompt und arbeite weiter — so zeichnet der Versionsverlauf deine Absicht auf ("X versucht, zu Y zurückgekehrt, dann zu Z verfeinert"). Wiederherstellen ohne Spuren zu hinterlassen, lässt die Lektion verloren gehen.
:::
  `,

  "cloning-and-duplicating-agents": `
## Agenten klonen und duplizieren

Das Klonen kopiert die vollständige Konfiguration eines Agenten in einen neuen Agenten: Prompt (einschließlich Versionsverlauf), Tools, Trigger, Einstellungen, Memory-Access-Flags, Failover-Provider — alles außer Laufzeit-Zustand (Ausführungen, Kosten und Live-Trigger werden nicht übertragen). Der Klon ist vollständig unabhängig — Änderungen auf der einen Seite beeinflussen die andere nicht.

Die häufigste Verwendung ist das Forken eines funktionierenden Agenten, um sicher zu experimentieren. Das Original produziert weiter; der Klon ist dein Sandkasten. Wenn das Experiment gut ist, kannst du entweder das Original ersetzen oder den Klon als Spezialisierung behalten.

### Wichtige Punkte

- **Vollständige Konfiguration wird übernommen** — Prompt, Tools, Trigger, Einstellungen, Memory, Failover
- **Laufzeit-Zustand nicht** — Ausführungen, Kosten, Live-Trigger gehören zu einem Agenten gleichzeitig
- **Trigger werden geklont, aber deaktiviert** — damit der Klon nicht sofort auf denselben Zeitplan/Webhook wie das Original feuert
- **Geklonte Agenten bekommen standardmäßig ein "(Copy)"-Suffix**; benenne um, bevor du beförderst

### So funktioniert es

Rechtsklick auf einen Agenten in der Seitenleiste oder Drei-Punkte-Menü in der Editor-Toolbar verwenden und \`Clone\` wählen. Der neue Agent erscheint in derselben Gruppe mit deaktivierten Triggern. Aktiviere sie bewusst neu (und aktualisiere ihre Konfiguration, wenn du z. B. nicht willst, dass der Klon auf dieselbe Webhook-URL hört wie das Original).

:::tip
Klonen ist der sicherste Weg, eine Prompt-Änderung per A-B zu testen, ohne einen produktiven Agenten zu stören. Mache die Änderung im Klon, lass beide im Lab-Arena gegen dieselben Eingaben laufen, und tausche den Produktiv-Agenten erst aus, wenn der Klon gewinnt.
:::
  `,

  "agent-groups-and-organization": `
## Agentengruppen und Organisation

Agenten in der Seitenleiste sind nach Gruppen organisiert — deinen eigenen Ordnern, um Dinge nach Team, Projekt, Funktion oder anderen Kriterien zu sortieren. Standardmäßig leer; du fügst Gruppen hinzu, wenn deine Sammlung wächst und die flache Liste nicht mehr skaliert.

Die Seitenleiste unterstützt auch verschachtelte Gruppen (eine Ebene Verschachtelung), Drag-and-Drop-Umsortierung, einen Auf-/Zuklapp-Zustand, der über Sitzungen hinweg erhalten bleibt, und Symbole pro Gruppe für schnelle visuelle Erkennung.

### Wichtige Punkte

- **Gruppen erstellen** nach Bedarf — keine Obergrenze
- **Per Drag umsortieren** — lass einen Agenten auf einer Gruppe fallen, um ihn zu verschieben, oder sortiere die Liste um, indem du zwischen Geschwistern fallen lässt
- **Symbole und Farben pro Gruppe** — wähle ein Symbol, das das Thema der Gruppe andeutet, damit du die richtige Gruppe auf einen Blick findest
- **Zuklappen für Übersicht** — zugeklappte Gruppen bleiben über Sitzungen hinweg zugeklappt, sodass eine lange Liste dich beim Start nicht erschlägt
- **Eine Ebene verschachteln** — nützlich für "Personal > Email", "Work > Research" usw.

### So funktioniert es

Rechtsklick in der Agenten-Seitenleiste, um eine Gruppe hinzuzufügen, oder ziehe eine bestehende Gruppe auf eine andere, um sie zu verschachteln. Gruppen werden in der lokalen Datenbank gespeichert und beeinflussen die Agentenausführung nicht — sie sind rein eine Organisationsebene. Agenten können gleichzeitig in einer Gruppe sein, aber frei zwischen ihnen wechseln.

:::tip
Eine "Drafts"- oder "Experimental"-Gruppe oben in deiner Seitenleiste ist ein nützliches Muster. Alles, woran du noch iterierst, lebt dort, und deine Produktiv-Agenten bleiben in klar benannten Gruppen darunter. Visuelle Trennung reduziert die Chance, den falschen Agenten zu bearbeiten.
:::
  `,

  "disabling-and-archiving-agents": `
## Agenten deaktivieren und archivieren

Zwei Wege, einen Agenten zu pausieren, ohne ihn zu löschen. **Disable** stoppt alle Trigger und blockiert manuelle Läufe; der Agent bleibt in der Seitenleiste mit einem gedämpften Symbol sichtbar, damit du dich an seine Existenz erinnerst. **Archive** verschiebt den Agenten in einen versteckten Archivbereich aus dem Weg des täglichen Gebrauchs; er stoppt das Triggern, zählt nicht gegen die Tier-Limits und kann jederzeit wiederhergestellt werden.

Keine der Operationen berührt Ausführungen, Einstellungen oder Versionsverlauf. Archive ist schwerer — nutze es für Agenten, mit denen du erstmal fertig bist, die du aber vielleicht zurückwillst. Disable ist leichter — nutze es, wenn du einen Agenten vorübergehend stoppen musst, ohne ihn aus der Sicht zu verlieren.

### Wichtige Punkte

- **Disable** — pausiert die Ausführung; Agent bleibt in der Seitenleiste sichtbar; Reaktivierung mit einem Klick
- **Archive** — versteckt den Agenten und gibt seinen Platz gegen dein Tier-Limit frei; jederzeit wiederherstellbar
- **Keines löscht** — Einstellungen, Prompt-Verlauf und vergangene Ausführungen werden bewahrt
- **Trigger respektieren Disable** — ein deaktivierter Agent ignoriert Schedule-/Webhook-/File-Watcher-Ereignisse; sie sammeln sich nicht für die Wiedergabe bei Reaktivierung an

### So funktioniert es

Öffne das Drei-Punkte-Menü in der Editor-Toolbar oder mache einen Rechtsklick auf den Agenten in der Seitenleiste. Disable / Archive / Restore leben alle dort. Archivierte Agenten sind über den Archiv-Abschnitt unten in der Agenten-Seitenleiste zugänglich; das Wiederherstellen bringt den Agenten zurück in seine ursprüngliche Gruppe (oder in einen "Ungrouped"-Eimer, falls die Gruppe inzwischen gelöscht wurde).

:::tip
Archiviere saisonale Agenten (Quartalsberichte, Feiertags-Workflows, Monatsendabschlüsse), statt sie zu löschen. Stelle sie wieder her, wenn die Saison zurückkommt, und sie sind sofort einsatzbereit.
:::
  `,

  "agent-health-indicators": `
## Agenten-Statusanzeigen

Jeder Agent hat einen kleinen farbigen Punkt neben seinem Namen, der dir auf einen Blick seinen Status verrät. **Grün** bedeutet, alles läuft reibungslos. **Gelb** bedeutet, dass etwas deine Aufmerksamkeit braucht — vielleicht laufen Zugangsdaten bald ab oder ein jüngster Lauf hatte eine Warnung. **Rot** bedeutet, dass es ein Problem gibt, das behoben werden muss.

Diese Indikatoren ersparen dir, jeden Agenten einzeln zu prüfen. Ein kurzer Blick in deine Seitenleiste verrät dir den Zustand deines gesamten Setups.

:::feature
**Statusüberwachung auf einen Blick**
Personas verfolgt kontinuierlich Ausführungsergebnisse, Zugangsdaten-Ablauf und Konfigurationsvollständigkeit für jeden Agenten. Health-Indikatoren aktualisieren sich automatisch — keine manuellen Prüfungen erforderlich.
:::

### Was jede Farbe bedeutet

| Farbe | Status | Bedeutung |
|---|---|---|
| **Grün** | Healthy | Alle jüngsten Läufe erfolgreich, keine Probleme erkannt, Setup vollständig |
| **Gelb** | Warning | Etwas könnte bald Aufmerksamkeit brauchen (ablaufende Zugangsdaten, langsame Performance, Setup teilweise vollständig) |
| **Rot** | Error | Der Agent ist kürzlich fehlgeschlagen oder hat ein Konfigurationsproblem |
| **Grau** | Inactive | Deaktiviert oder nie ausgeführt |

### Setup-Status

Neben Health hat jeder Agent einen **Setup-Status**, der angibt, wie bereit er ist, autonom zu laufen. Ein frisch beförderter Agent hat oft Setup-Lücken — fehlende Zugangsdaten, ein nicht konfigurierter Trigger, ein Ausgabekanal, der noch verdrahtet wird. Das Setup-Status-Badge zeigt genau an, was noch zu tun ist, in Prioritätsreihenfolge, damit du nicht durch Tabs jagen musst, um zu wissen, was blockiert. Agenten mit anhaltenden Setup-Problemen werden automatisch von einem Circuit-Breaker aus jeder geplanten oder getriggerten Rotation gezogen, sodass du nie einen halbkonfigurierten Agenten still gegen schlechte Daten laufen lässt.

### So funktioniert es

Der Health-Status wird automatisch auf Basis aktueller Ausführungsergebnisse, Zugangsdaten-Status und Konfigurationsvollständigkeit berechnet. Klicke auf den Indikator, um eine Zusammenfassung dessen zu sehen, was den aktuellen Status verursacht — einschließlich aller Setup-Lücken. Von dort kannst du direkt zu den Einstellungen, Logs oder dem spezifischen Tab springen, der Aufmerksamkeit braucht.

:::tip
Mach es zur Gewohnheit, einmal täglich die Farben deiner Seitenleiste zu scannen. Ein gelb gewordener Indikator früh zu erkennen, verhindert, dass er rot wird — und das Beheben von Setup-Lücken direkt nach der Beförderung ist der günstigste Moment dafür.
:::
  `,
};
