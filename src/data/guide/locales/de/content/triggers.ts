export const content: Record<string, string> = {
  "how-triggers-work": `
## So funktionieren Trigger

Trigger sind das "Wann" deines Agenten. Der Prompt und die Tools definieren *was* der Agent macht; der Trigger definiert *wann* und *mit welcher Eingabe*. Personas liefert sieben Trigger-Typen: **Manual** (Knopfdruck), **Schedule** (cron-Stil), **Webhook** (eingehendes HTTP), **Clipboard** (Kopierereignis-Treffer), **File Watcher** (Dateisystem-Ereignisse), **Chain** (Ausgabe eines anderen Agenten) und **Event-Based** (interne Ereignisse, die von anderen Agenten, Plugins oder der Engine selbst emittiert werden).

Jeder Agent kann beliebig viele Trigger haben, gemischt über Typen hinweg. Ein einzelner Agent kann nach einem täglichen Zeitplan laufen, auf einen Webhook von Stripe reagieren, feuern, wenn du eine E-Mail-Adresse kopierst, und gleichzeitig von Upstream-Agenten verkettbar sein.

### Trigger-Typen

:::compare
**Manual**
Knopfdruck im Editor oder über den Quick-Run in der Titelleiste. Jeder Agent erhält das standardmäßig. Am besten für Tests und Ad-hoc-Aufrufe.
---
**Schedule**
Cron-basiert. Stündlich, täglich, wöchentlich oder vollständiger Cron-Ausdruck mit Zeitzone. Am besten für Routinearbeit, die ohne Eingabe läuft — tägliche Zusammenfassungen, wöchentliche Berichte.
---
**Webhook**
Eine eindeutige eingehende URL, auf die der Agent hört. Externe Dienste POSTen darauf, um den Agenten zu starten. Am besten für "auf ein Ereignis eines Drittanbieter-Dienstes reagieren".
---
**Clipboard**
Feuert, wenn kopierter Text einem konfigurierten Muster entspricht (Regex, Inhaltstyp oder Stichwort). Am besten für Power-User-Shortcuts — kopiere eine E-Mail, ein Agent schlägt sie nach.
---
**File Watcher**
Dateisystem-Ereignisse in einem überwachten Ordner (Erstellen / Ändern / Löschen). Am besten für Drop-Zone-Workflows, in denen Dateien zu unvorhersehbaren Zeiten ankommen.
---
**Chain**
Die Ausgabe von Agent A wird zur Eingabe von Agent B. Am besten für mehrstufige Pipelines, die aus fokussierten Agenten zusammengesetzt sind.
---
**Event-Based**
Abonniert interne Personas-Ereignisse (eine Zugangsdaten ist abgelaufen, ein Plugin hat ein Ereignis emittiert, eine Ausführung wurde mit manual_review beendet). Am besten für reaktive Automatisierungen innerhalb deines eigenen Setups.
:::

### Wichtige Punkte

- **Mehrere Trigger pro Agent** — keine Obergrenze; kombiniere Typen frei
- **Unabhängiges Feuern** — jeder Trigger wertet eigenständig aus; ein Schedule-Trigger weiß nicht oder kümmert sich nicht um einen Webhook-Trigger auf demselben Agenten
- **Filterung pro Trigger** — jeder Trigger kann eigene Filterbedingungen haben (z. B. feuert ein Webhook-Trigger nur bei \`event_type=charge.succeeded\`)
- **Trigger-Abstammung** — die Lineage-Canvas (Events → Live Stream → Lineage) zeigt, welche Trigger, welche Agenten und welche Ereignisse end-to-end über dein gesamtes Setup verbunden sind
- **Einzeln pausieren** — deaktiviere einen einzelnen Trigger, ohne den Rest des Agenten zu berühren

### So funktioniert es

Trigger werden im Settings-Tab des Agenten konfiguriert oder durch Hinzufügen aus der Trigger-Liste auf der Events-Seite. Die Execution-Engine bewertet Trigger-Bedingungen unabhängig und versendet eine Ausführung an den Agenten, sobald irgendein Trigger zutrifft. Der Lauf trägt die Trigger-Nutzlast (Webhook-Body, Dateipfad, kopierter Text, Upstream-Ausgabe, Ereignisdaten) als Eingabe in den Agenten.

:::tip
Starte jeden Agenten mit nur einem Manual-Trigger. Sobald du seinem Verhalten vertraust, füge automatische Trigger nacheinander hinzu, damit du isolieren kannst, welcher ein Problem einführt, falls etwas schiefgeht.
:::
  `,

  "manual-triggers": `
## Manuelle Trigger

Manuelle Trigger sind die Standardeinstellung für jeden Agenten. Klicke \`Run\` im Editor und der Agent startet sofort, oder nutze den Quick-Run-Shortcut in der Titelleiste (\`Ctrl+Enter\` auf dem fokussierten Agenten). Manuelle Läufe sind, wie du entwickelst und testest — sie sind das Äquivalent dazu, ein Skript direkt auszuführen, um zu sehen, was es tut, bevor du einen Cron-Eintrag hinzufügst.

Du kannst jedes Mal eine benutzerdefinierte Eingabe übergeben. Der Agenten-Editor zeigt ein kleines Eingabefeld neben dem Run-Knopf, wenn der Agent angibt, dass er Eingaben akzeptiert; was immer du tippst, geht als Trigger-Nutzlast durch.

### Wichtige Punkte

- **Keine Konfiguration** — manuelle Trigger sind immer verfügbar
- **Optionale Eingabe** — tippe Eingaben direkt, füge strukturiertes JSON ein oder führe ohne Eingabe für Agenten aus, die keine brauchen
- **Diagnostische Läufe** — manuelle Läufe werden im Trace mit \`manual\` getaggt, sodass du sie aus Kosten-/Metrikberichten ausfiltern kannst, wenn du nur die automatische Aktivität sehen willst
- **Concurrency-aware** — manuelle Läufe respektieren das Concurrency-Limit des Agenten; wird das Limit erreicht, wird der Klick mit einer klaren Meldung abgelehnt

### So funktioniert es

Manuelle Trigger existieren implizit auf jedem Agenten — es gibt keinen Schalter, um sie auszuschalten (nutze \`Disable\` auf dem ganzen Agenten, wenn du ihn aussperren willst). Die Engine behandelt einen manuellen Lauf identisch zu einem automatisierten: gleicher Ausführungspfad, gleiche Trace-Erfassung, gleiche Kostenabrechnung. Der einzige Unterschied ist der Trigger-Tag.

:::tip
Nutze manuelle Läufe während der Prompt-Iteration. Prompt speichern, ausführen, Trace anschauen, bearbeiten. Das Lab-Arena ist für systematische Vergleiche; Manual ist für schnelles Feedback im Editor.
:::
  `,

  "schedule-triggers": `
## Zeitplan-Trigger

Zeitplan-Trigger lassen einen Agenten in einer wiederkehrenden Frequenz laufen — jede Stunde, jeden Werktag um 8 Uhr, am ersten Montag des Monats oder nach jedem Cron-Ausdruck, den du schreiben kannst. Die Zeitplan-UI gibt dir voreingestellte Shortcuts (stündlich, täglich, wöchentlich) für gängige Fälle und ein rohes Cron-Feld für alles andere.

Zeitpläne respektieren eine konfigurierbare Zeitzone. Standardmäßig nutzt der Agent deine Systemzeitzone, aber du kannst sie pro Trigger überschreiben — nützlich für Agenten, die "um 9 Uhr Eastern" laufen müssen, egal wo du gerade sitzt.

### Wichtige Punkte

- **Voreinstellungen und Cron** — wähle aus gängigen Frequenzen oder schreibe den vollständigen Cron-Ausdruck
- **Zeitzone pro Trigger** — IANA-Zeitzonennamen (\`America/New_York\`, \`Europe/Prague\`, \`UTC\`); DST wird automatisch gehandhabt
- **Vorschau des nächsten Laufs** — der Trigger zeigt die nächsten drei geplanten Zeiten, damit du deinen Cron-Ausdruck plausibilisieren kannst
- **Pausieren ohne Verlieren** — das Deaktivieren eines Zeitplan-Triggers löscht ihn nicht; aktiviere ihn wieder, um fortzufahren

### Einen Zeitplan einrichten

:::steps
1. **Öffne Trigger-Einstellungen** — im Settings-Tab des Agenten oder über die Events-Seite; klicke \`Add trigger\` und wähle Schedule
2. **Wähle eine Voreinstellung oder schreibe einen Cron** — \`0 8 * * 1-5\` für "8 Uhr Werktags" oder nutze eine Voreinstellung für gängige Fälle
3. **Stelle die Zeitzone ein** — standardmäßig System; ändere für Agenten, die an einen bestimmten Geschäftskalender gebunden sind
4. **Bestätige die Vorschau des nächsten Laufs** — drei kommende Laufzeiten werden angezeigt; prüfe, ob sie deinen Erwartungen entsprechen
5. **Speichern** — der Trigger wird sofort scharf und erscheint in der Trigger-Liste des Agenten mit einem "next run"-Countdown
:::

:::tip
Zeitplan-Trigger holen verpasste Läufe nicht nach. Wenn die App geschlossen ist oder die Maschine schläft, wenn eine geplante Zeit verstreicht, wird dieser Lauf übersprungen. Für unternehmenskritische geplante Arbeit nutze das Cloud-Deploy (Builder-Tier), damit der Orchestrator das Scheduling serverseitig übernimmt.
:::
  `,

  "webhook-triggers": `
## Webhook-Trigger

Webhook-Trigger stellen eine eindeutige eingehende URL bereit, auf die der Agent hört. Wenn ein externer Dienst auf diese URL POSTet, wird der Body zur Trigger-Nutzlast, und der Agent läuft. Die meisten Drittanbieter-Dienste, die Webhooks unterstützen (Stripe, GitHub, Shopify, Linear, Twilio, eigene interne APIs), funktionieren ohne Anpassung.

Der Trigger unterstützt Filterung auf Request-Body, Headers und Methode, sodass ein einzelner Endpunkt selektiv sein kann, welche Ereignisse den Agenten tatsächlich starten. Gängiges Muster: eine Webhook-URL pro Agent, gefiltert auf bestimmte Ereignistypen des Upstream-Dienstes.

### Wichtige Punkte

- **Eindeutige URL pro Trigger** — automatisch generiert; nie zwischen Agenten oder Triggern geteilt
- **Filterausdrücke** — JSONPath / Header-Übereinstimmungen lassen dich nur die Ereignisse akzeptieren, die dich interessieren
- **Replay-Endpunkt** — jeder empfangene Webhook wird bewahrt und kann manuell von der Trigger-Detailseite erneut abgespielt werden
- **Send Test** — eingebauter Knopf, der Beispiel-Nutzlasten gegen deinen lokalen Endpunkt POSTet, damit du Filter und die Reaktion des Agenten ohne den externen Dienst validieren kannst
- **Eingehend und ausgehend sind getrennt** — siehe unten

### Einen Webhook verbinden

:::steps
1. **Füge einen Webhook-Trigger hinzu** — Events-Seite → Add trigger → Webhook; binde ihn an den Agenten
2. **Kopiere die generierte URL** — eindeutig für diesen Trigger; läuft nie ab, es sei denn, du löschst den Trigger
3. **Konfiguriere den externen Dienst** — füge die URL in die Webhook-Konfiguration des Dienstes ein (Stripe Dashboard, GitHub-Repo-Einstellungen usw.)
4. **Setze Filterausdrücke** — schränke auf bestimmte Ereignistypen oder Nutzlast-Formen ein, damit du den Agenten nicht auf jedes Ereignis ausführst, das der Dienst emittiert
5. **Test** — nutze Send Test mit einer Beispiel-Nutzlast (oder löse ein echtes Ereignis im Upstream-Dienst aus); prüfe den Trace und passe Filter bei Bedarf an
:::

### Eingehende vs. ausgehende Webhooks

Webhooks gibt es in zwei Geschmacksrichtungen, und es lohnt sich, sie auseinanderzuhalten:

- **Eingehende Webhooks (dieses Thema)** — ein externer Dienst ruft *dich* an, um einen Agenten zu starten. Stripe pingt dich, wenn eine Zahlung erfolgreich ist; GitHub pingt dich, wenn ein PR geöffnet wird.
- **Ausgehende Webhooks (ein separates Feature)** — *dein* Agent sendet sein Ergebnis nach Abschluss an einen Kanal. Personas liefert erstklassige Outbound-Auslieferung an Slack, Discord, Microsoft Teams und generische Webhook-URLs, konfiguriert pro Agent im Connectors-Tab. Die Ausgabe des Agenten wird passend für jeden Kanal formatiert (reichhaltige Slack-Blöcke, Discord-Embeds, Teams-Cards) und nach Abschluss des Laufs versendet.

Die meisten Automatisierungen nutzen am Ende beides: ein eingehender Webhook startet den Agenten, der Agent erledigt seine Arbeit, und ein ausgehender Kanal liefert das Ergebnis dorthin, wo dein Team beobachtet.

:::tip
Für lokale Entwicklung oder Pre-Produktions-Webhooks nutze den \`Send Test\`-Knopf mit einer Beispiel-Nutzlast, statt den echten Upstream zu konfigurieren. Du iterierst viel schneller an Filtern und Prompts, ohne den Drittanbieter-Dienst zu durchlaufen.
:::
  `,

  "clipboard-monitor": `
## Zwischenablage-Monitor

Der Zwischenablage-Monitor beobachtet deine System-Zwischenablage und feuert den Agenten, wenn der kopierte Inhalt deinen Regeln entspricht. Kopiere eine Bestellnummer — der Agent schlägt sie nach. Kopiere einen Satz in einer Fremdsprache — der Agent übersetzt ihn. Kopiere eine Kunden-E-Mail — der Agent holt das Konto.

Die Übereinstimmung kann auf einfachen Stichwörtern, Regex-Mustern oder Inhaltstyp-Heuristiken (E-Mail-Adresse, URL, Telefonnummer, JSON-Form, Zahl, strukturierte ID) basieren. Der Trigger wertet die Regel bei jeder Zwischenablage-Änderung aus und feuert nur, wenn eine Regel trifft, sodass er still im Hintergrund sitzt, bis du tatsächlich etwas Interessantes kopierst.

### Wichtige Punkte

- **Regelbasiert** — definiere eine oder mehrere Regeln pro Trigger; erste Übereinstimmung gewinnt
- **Übereinstimmungsmodi** — Stichwort, Regex oder eingebaute Inhaltstyp-Heuristiken (E-Mail/URL/Telefon/JSON/etc.)
- **Standardmäßig still** — nicht passende Kopien lösen nicht mal ein Auswertungs-Log aus; nur Treffer erzeugen Aktivität
- **Ausgabemodi** — als Desktop-Benachrichtigung anzeigen, in den Cockpit-Posteingang schieben oder still bleiben und nur in den Aktivitäts-Feed des Agenten schreiben
- **Privatsphäre** — Zwischenablage-Inhalt bleibt lokal; nichts wird hochgeladen, außer was der Agent selbst beim KI-Anbieter aufruft

### So funktioniert es

Der Trigger registriert sich beim OS-Zwischenablagesystem beim App-Start. Wenn sich die Zwischenablage ändert, wird der neue Inhalt gegen jede Regel dieses Triggers ausgewertet; erste Übereinstimmung feuert den Agenten mit dem kopierten Inhalt als Eingabe. Nicht passende Kopien werden ohne Spur verworfen, sodass der Monitor das Aktivitäts-Log nicht aufbläht.

:::tip
Sei spezifisch mit Regeln. Ein Zwischenablage-Monitor, der jedes \`@\`-Symbol abgleicht, wird bei Kopien feuern, die du nicht meintest. Nutze vollständige E-Mail-Regex oder beschränke auf "Kopien, die wie eine Kunden-ID aussehen" (passend zu deiner eigenen ID-Form).
:::
  `,

  "file-watcher-triggers": `
## Datei-Watcher-Trigger

File-Watcher-Trigger feuern, wenn Dateien in einem von dir bestimmten Ordner erscheinen, sich ändern oder verschwinden. Lege eine CSV in einen Ordner, und ein Agent verarbeitet sie. Speichere ein Bild in einem "Process"-Verzeichnis, und ein OCR-/Klassifizierungs-Agent handelt. Ändere eine Konfigurationsdatei, und ein Agent vergleicht sie mit der vorherigen Version.

Überwachte Ordner können im lokalen Dateisystem oder an jedem synchronisierten Ort liegen (OneDrive, Dropbox, iCloud). Filter schränken Ereignisse nach Dateityp / Glob-Muster ein, damit du den Agenten nicht auf irrelevante Änderungen laufen lässt (wie macOS-\`.DS_Store\`-Dateien oder temporäre Editor-Swap-Dateien).

### Wichtige Punkte

- **Überwache jeden Ordner** — lokal oder synchronisierter Cloud-Speicher; Unterordner-Rekursion optional
- **Ereignistypen** — Erstellen / Ändern / Löschen; abonniere einen, zwei oder alle drei
- **Glob-Filter** — \`*.csv\`, \`**/invoices/*.pdf\`; unterstützt Negationsmuster
- **Debounce** — aufeinanderfolgende schnelle Änderungen werden zu einem Trigger-Ereignis zusammengefasst (kein Doppel-Feuern bei Speichern-und-sofort-Speichern-Flows)
- **Nutzlast** — der Agent erhält den Dateipfad und (wenn die Datei klein genug ist) den Inhalt inline; andernfalls einen Pfad, den der Agent mit seinem Dateizugriffs-Tool lesen kann

### So funktioniert es

Der Trigger nutzt OS-native Datei-Watch-APIs (FSEvents auf macOS, ReadDirectoryChangesW unter Windows, inotify auf Linux). Der Watcher läuft im Engine-Prozess, während die App offen ist. Wenn ein Ereignis dem Filter des Triggers entspricht, versendet die Engine eine Agentenausführung mit den Datei-Metadaten als Eingabe. Die Engine leitet File-Watcher-Ereignisse auch in den **Ambient Producer**: jeder Agent, der das relevante Ambient-Ereignis abonniert, kann reagieren, ohne einen eigenen Watcher zu brauchen.

:::tip
Erstelle einen eigenen Drop-Zone-Ordner für jeden Agenten, der einen File Watcher nutzt. Watcher auf geteilten Ordnern ("Downloads", "Desktop") führen zu überraschenden Aktivierungen, wenn du dort unverwandte Dateien speicherst.
:::
  `,

  "chain-triggers": `
## Chain-Trigger

Chain-Trigger verbinden Agenten end-to-end: wenn Agent A erfolgreich endet, startet Agent B mit der Ausgabe von A als Eingabe. So werden mehrstufige Automatisierungen gebaut — jeder Agent ist klein und fokussiert, die Chain heftet sie zu einer Pipeline zusammen.

Chains können verzweigen (die Ausgabe eines Agenten fließt zu mehreren Downstream-Agenten) und konvergieren (mehrere Upstream-Agenten fließen in einen Downstream). Sie können auch bedingt sein — der Trigger kann einen Filter haben, der nur Ausgaben weiterleitet, die einer Bedingung entsprechen, sodass du den Downstream-Agenten nur in den relevanten Fällen ausführst.

:::diagram
[Research Agent] --> [Writing Agent] --> [Formatting Agent] --> [Final Output]
:::

### Wichtige Punkte

- **Ausgabe → Eingabe-Verdrahtung** — automatisch; der Prompt des Downstream-Agenten sieht die Upstream-Ausgabe wortwörtlich (oder transformiert, wenn du einen Transformer konfigurierst)
- **Verzweigen und konvergieren** — Many-to-one- und One-to-many-Chains werden unterstützt
- **Bedingte Weiterleitung** — Filterausdrücke am Chain-Trigger lassen dich nur unter bestimmten Bedingungen weiterleiten (Ausgabe enthält "error" oder ein Feld überschreitet einen Schwellwert)
- **Ausfall stoppt die Chain** — wenn ein Upstream-Agent fehlschlägt, laufen nachgelagerte verkettete Agenten nicht; der Fehler erscheint in der Lineage-Ansicht, damit du genau sehen kannst, wo die Chain gebrochen ist
- **End-to-end sichtbar** — die Events → Live Stream → Lineage-Canvas zeigt den vollständigen Graphen verketteter Agenten und den Live-Ausführungsfluss

### So funktioniert es

Im Settings-Tab des Downstream-Agenten füge einen Chain-Trigger hinzu und wähle den Upstream-Agenten. Die Engine abonniert den Downstream-Agenten beim Abschlussereignis des Upstream; wenn der Upstream "execution complete with success" emittiert, leitet die Engine die Ausgabe als Eingabe an den Downstream. Bedingte Filter werden serverseitig ausgewertet, bevor der Downstream-Lauf versendet wird.

:::tip
Jeder Agent in einer Chain sollte genau eine Sache gut machen. Eine Chain aus drei kleinen fokussierten Agenten ist viel einfacher zu debuggen als ein großer Allrounder-Agent — du kannst in der Lineage-Ansicht sehen, welche Stufe fehlgeschlagen ist, und du kannst einen Agenten gegen eine bessere Version austauschen, ohne den Rest der Chain anzufassen.
:::
  `,

  "event-based-triggers": `
## Ereignisbasierte Trigger

Ereignisbasierte Trigger abonnieren einen Agenten an interne Personas-Ereignisse. Alles in der App, das ein Ereignis emittiert — ein anderer Agent, der fertig wird, eine Zugangsdaten, die abläuft, ein Plugin, das feuert (wie das Drive-Plugin, das \`drive.document.*\`-Ereignisse emittiert, wenn sich Dateien im lokalen Drive ändern), oder die Engine selbst, die einen Manual-Review-Fall kennzeichnet — kann einen abonnierten Agenten antreiben.

Das ist der flexibelste Trigger-Typ. Anders als Webhooks (die von externen Systemen kommen) oder Schedules (die nach Uhrzeit feuern) kommen Ereignisse aus deinem eigenen Personas-Setup. Baue ereignisgesteuerte Setups, in denen ein Signal sich auf mehrere Agenten verteilen kann, ohne explizite Verdrahtung.

### Wichtige Punkte

- **Abonniere jedes Ereignis** — Agent-Abschluss-Ereignisse, Plugin-Ereignisse, Engine-Ereignisse, benutzerdefinierte Ereignisse, die von anderen Agenten emittiert werden
- **Nutzlast-bewusst** — jedes Ereignis trägt Daten (die Ausgabe des Agenten, den Dateipfad, die Credential-ID); der abonnierte Agent empfängt es als Eingabe
- **One-to-many** — mehrere Agenten können dasselbe Ereignis abonnieren und parallel laufen, wenn es feuert
- **Filterausdrücke** — schränke nach Nutzlast-Feldern ein (feuere nur bei Ereignissen mit \`severity = critical\`)
- **Auffindbar** — die Ereignisregistratur ist auf der Events-Seite durchstöberbar; du kannst genau sehen, welche Ereignisse verfügbar sind und welche Felder sie tragen

### So funktioniert es

Füge dem Downstream-Agenten einen Event-Trigger hinzu und wähle das Ereignis aus der Registratur. Die Engine abonniert den Agenten beim Boot und versendet einen Lauf mit der Ereignis-Nutzlast, sobald das passende Ereignis feuert. Plugin-emittierte Ereignisse sehen aus der Sicht des Agenten identisch zu Engine-emittierten aus — sie fließen alle durch denselben Bus.

:::tip
Ereignisbasierte Trigger sind, wie du "wenn X, dann auch Y"-Beziehungen baust, ohne X zu ändern. Füge einen Event-Trigger an einem neuen Agenten hinzu, zeige ihn auf ein Ereignis, das ein anderer Agent emittiert, und das neue Verhalten passiert reaktiv — der bestehende Agent weiß oder kümmert sich nicht.
:::
  `,

  "combining-multiple-triggers": `
## Mehrere Trigger kombinieren

Ein Agent kann beliebig viele Trigger beliebiger Typen haben. Die meisten Produktiv-Agenten haben mindestens zwei: einen Manual-Trigger (für Tests und Ad-hoc-Aufrufe) plus einen oder mehrere automatische Trigger (Schedule, Webhook, Chain, Event). Es ist üblich, einen Agenten mit einer Schedule- + Webhook- + Chain-Kombination zu sehen — derselbe Agent kann als Teil eines täglichen Batches, als Reaktion auf einen Echtzeit-Webhook und als Schritt in einer verketteten Pipeline laufen.

Mehrere Trigger stören sich nicht. Jeder feuert nach seinem eigenen Zeitplan oder Ereignis; wenn zwei im selben Moment auslösen, läuft der Agent zweimal (sofern es die Concurrency erlaubt). Der Trace jedes Laufs erfasst, welcher Trigger ihn gestartet hat.

### Wichtige Punkte

- **Keine Obergrenze** — ein Agent kann Dutzende von Triggern haben
- **Unabhängige Auswertung** — jeder Trigger wertet aus und versendet unabhängig
- **Filterung und Konfiguration pro Trigger** — Schedules haben ihren eigenen Cron, Webhooks ihre eigene URL usw.
- **Trigger-Tag im Trace** — jeder Lauf ist mit dem Trigger getaggt, der ihn gestartet hat, sodass du Aktivität nach Trigger-Quelle filtern kannst
- **Selektives Deaktivieren** — deaktiviere einen einzelnen Trigger, ohne den Rest anzufassen

### So funktioniert es

Der Settings → Triggers-Tab des Agenten zeigt jeden angeschlossenen Trigger, seinen Status (aktiviert/deaktiviert) und seine letzte Auslösezeit. Füge neue mit \`Add trigger\` hinzu; derselbe Picker lässt dich jeden der sieben Trigger-Typen erstellen. Deaktivierte Trigger bleiben in der Liste, damit du sie später ohne Neukonfiguration reaktivieren kannst.

:::tip
Ein nützliches Muster: halte einen Manual-Trigger für immer aktiv (zum Debuggen) und paare jeden "echten" automatischen Trigger mit einem Geschwister-Manual-Trigger, der dieselbe Eingabeform annimmt. So kannst du jede automatisierte Nutzlast jederzeit manuell wiedergeben, wenn du nachforschen willst.
:::
  `,

  "testing-and-debugging-triggers": `
## Trigger testen und debuggen

Der Events → Test-Tab ist der Trigger-Tester. Für jeden Trigger kannst du eine Beispiel-Nutzlast senden (Webhook-Body, Datei-Ereignis, Zwischenablage-String, Ereignis-Daten) und genau sehen, was der Agent erhalten und wie er reagieren würde — ohne den externen Dienst oder das Warten auf die tatsächliche Trigger-Zeit.

Für Trigger, die ausgelöst haben und bei denen der Agent nicht wie erwartet lief, zeigt das Trigger-Log jede Auswertung: getroffene Filter, abgelehnte, Nutzlast-Form, Versandzeit. Die Lineage-Canvas (Events → Live Stream → Lineage) ist das visuelle Äquivalent — sie zeigt Live-Trigger-Auswertungen und -Versendungen über dein gesamtes Setup.

### Wichtige Punkte

- **Simuliere jeden Trigger** — füge eine Nutzlast ein und sieh die Reaktion des Agenten
- **Trigger-Log** — jeder Auslöseversuch wird aufgezeichnet, einschließlich Filterablehnungen, damit du sehen kannst, was nicht traf
- **Lineage-Canvas** — visueller Graph von Triggern, Agenten und Ereignissen mit Live-Flow-Indikatoren, wenn Dinge auslösen
- **Send Test für Webhooks** — eingebauter Knopf, der einen Beispiel-Body gegen den lokalen Endpunkt POSTet
- **Replay** — vergangene Trigger-Auslösungen können mit der exakten Original-Nutzlast erneut abgespielt werden, nützlich für "was passiert, wenn dieser Stripe-Webhook den Agenten erneut trifft"

### Einen Trigger Schritt für Schritt debuggen

:::steps
1. **Bestätige, dass der Trigger aktiviert ist** — Settings → Triggers-Tab am Agenten; ein gedämpftes Symbol bedeutet, der Trigger ist deaktiviert
2. **Prüfe das Trigger-Log** — Events → Test → Logs gefiltert nach deinem Trigger; suche nach Auswertungen, die nicht versendet wurden
3. **Inspiziere Filter gegen die Nutzlast** — wenn der Trigger ausgewertet hat, aber nicht versendet wurde, lehnt ein Filterausdruck ihn ab; kopiere die Nutzlast und teste den Filter explizit
4. **Verifiziere, dass der Versand den Agenten erreicht hat** — der Ausführungs-Trace sollte den Trigger-Tag zeigen; wenn keine Ausführung erschien, wurde der Trigger nie versendet (Filter-Problem, Concurrency-Limit oder deaktivierter Agent)
5. **Nutze die Lineage-Canvas** — bei Chain- oder Event-Triggern öffne Lineage und verfolge den Pfad; du siehst, wo der Fluss unterbrochen ist
:::

:::tip
"Mein Trigger feuert nicht" bedeutet fast immer eines von: der Trigger ist deaktiviert, ein Filter ist zu streng, der Agent ist deaktiviert oder der externe Dienst sendet nicht wirklich, was du denkst. Das Trigger-Log unterscheidet alle vier innerhalb einer Minute.
:::
  `,
};
