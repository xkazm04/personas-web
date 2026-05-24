export const content: Record<string, string> = {
  "common-error-messages": `
## Häufige Fehlermeldungen

Fehlermeldungen können beängstigend aussehen, aber die meisten haben einfache Lösungen. Diese Anleitung übersetzt die häufigsten Fehler in klares Deutsch und sagt dir genau, was zu tun ist. Du musst die technischen Details nicht verstehen — gleiche einfach den Fehler mit der Lösung ab.

Die meisten Fehler fallen in ein paar Kategorien: Zugangsdaten-Probleme, Timeout-Probleme und Eingabeformat-Inkompatibilitäten. Sobald du die Muster kennst, wird Fehlerbehebung zur zweiten Natur.

### Schnelle Diagnose-Checkliste

:::checklist
- Prüfe, ob die API des KI-Anbieters online ist und dein Konto aktiv
- Verifiziere die Zugangsdaten-Gesundheit im Credentials-Panel (suche nach roten/gelben Indikatoren)
- Überprüfe Rate-Limits — warte eine Minute, wenn du zu viele Anfragen gesendet hast
- Versuche einen manuellen Lauf mit einfacher Test-Eingabe, um das Problem zu isolieren
- Prüfe das Eingabeformat, wenn Daten von einem Trigger oder einer Pipeline kommen
:::

### Die häufigsten Fehler

- **"Authentication failed"** — deine Zugangsdaten ist abgelaufen oder wurde falsch eingegeben. Gehe zu \`Credentials\` und erneuere oder gib sie erneut ein.
- **"Request timed out"** — der KI-Anbieter brauchte zu lange zum Antworten. Versuche es erneut oder erhöhe das Timeout in den Agenten-Einstellungen.
- **"Rate limit exceeded"** — du hast zu viele Anfragen zu schnell gemacht. Warte eine Minute und versuche es erneut oder upgrade deinen Anbieter-Plan.
- **"Invalid input format"** — die an deinen Agenten gesendeten Daten waren nicht im erwarteten Format. Prüfe den Trigger oder die Pipeline, die Daten an diesen Agenten liefert.

### So funktioniert es

Wenn ein Fehler auftritt, erscheint er im Ausführungs-Log mit einem Code und einer Beschreibung. Klicke auf den Fehler, um eine detaillierte Erklärung und einen Lösungsvorschlag zu sehen. Viele Fehler enthalten einen \`Fix Now\`-Knopf, der dich direkt zur Einstellung führt, die Aufmerksamkeit braucht.

:::tip
Geraten nicht in Panik, wenn du einen Fehler siehst. Lies die Meldung sorgfältig — sie sagt dir fast immer, was schiefgelaufen ist, und weist dich auf die Lösung hin.
:::
  `,

  "agent-not-responding": `
## Agent reagiert nicht

Wenn dein Agent eingefroren, festgefahren wirkt oder einfach keine Ergebnisse produziert, keine Sorge — es ist meist eine einfache Behebung. Die häufigsten Ursachen sind eine abgelaufene KI-Anbieter-Verbindung, ein Zugangsdaten-Problem oder dass der Agent sein maximales Schrittlimit erreicht hat. Folge dieser Checkliste, um wieder auf Kurs zu kommen.

Die meisten Probleme mit nicht reagierenden Agenten lösen sich von selbst, sobald du die zugrundeliegende Ursache identifiziert und behoben hast, die fast nie ein dauerhaftes Problem ist.

### Diagnose-Checkliste

:::steps
1. **Prüfe das Ausführungs-Log** — suche nach Fehlermeldungen oder Warnungen, die den Stillstand erklären
2. **Verifiziere deinen KI-Anbieter** — stelle sicher, dass die API deines Anbieters online und dein Konto aktiv ist
3. **Prüfe Zugangsdaten** — stelle sicher, dass die Zugangsdaten des Agenten nicht abgelaufen sind
4. **Überprüfe Limits** — der Agent könnte sein Timeout oder seine Max-Turns-Einstellung erreicht haben
5. **Versuche einen manuellen Lauf** — führe den Agenten mit einfacher Test-Eingabe aus, um das Problem zu isolieren
:::

### So funktioniert es

Öffne den Agenten und prüfe sein neuestes Ausführungs-Log. Wenn es einen Fehler zeigt, folge der Behebung für diesen spezifischen Fehler. Wenn das Log zeigt, dass der Agent noch läuft, verarbeitet er möglicherweise eine besonders komplexe Aufgabe. Prüfe die Timeout-Einstellung — wenn sie zu kurz ist, könnte der Agent stoppen, bevor er fertig ist.

:::tip
Wenn ein Agent wirklich festgefahren ist (keine Fortschritte für mehrere Minuten), klicke \`Stop\` und versuche dann einen manuellen Lauf mit einfacherer Eingabe. Das hilft dir herauszufinden, ob das Problem mit der Eingabe oder dem Agenten selbst liegt.
:::
  `,

  "credential-errors": `
## Zugangsdaten-Fehler

Wenn ein Agent sich nicht mit einem Dienst verbinden kann, liegt es meist daran, dass eine Zugangsdaten abgelaufen ist, ein Passwort geändert wurde oder eine Berechtigung widerrufen wurde. Das sind die häufigsten Probleme in jedem Automatisierungssystem, und sie sind fast immer schnell zu beheben.

Der Schlüssel ist, herauszufinden, welche Zugangsdaten das Problem verursacht, und sie dann zu erneuern oder zu ersetzen.

### Häufige Ursachen

- **Abgelaufenes Token** — OAuth-Tokens laufen regelmäßig ab und müssen erneuert werden
- **Geändertes Passwort** — wenn du ein Passwort anderswo geändert hast, aktualisiere es auch in Personas
- **Widerrufene Berechtigungen** — der Dienst könnte den Zugriff widerrufen haben, den du ursprünglich gewährt hast
- **Falsche Zugangsdaten zugewiesen** — der Agent verwendet möglicherweise die falsche Zugangsdaten für den Dienst

### So funktioniert es

Prüfe die Fehlermeldung im Ausführungs-Log — sie nennt, welcher Dienst fehlgeschlagen ist. Gehe zu \`Credentials\` und finde die Zugangsdaten für diesen Dienst. Prüfe ihren Health-Status. Wenn er rot oder gelb ist, klicke darauf, um zu sehen, was falsch ist, und folge der vorgeschlagenen Behebung — meist das Erneuern des Tokens oder das erneute Eingeben des Passworts.

:::tip
Richte Zugangsdaten-Health-Checks ein, damit sie automatisch laufen. Sie fangen ablaufende Zugangsdaten ab, bevor sie Agentenausfälle verursachen, und verwandeln eine potenzielle Krise in eine routinemäßige Wartungsaufgabe.
:::
  `,

  "trigger-not-firing": `
## Trigger feuert nicht

Ein Trigger, der nicht feuert, ist frustrierend, aber die Ursache ist meist klein — ein Konfigurations-Tippfehler, ein Timing-Problem oder eine fehlende Berechtigung. Diese Anleitung führt dich durch die häufigsten Verdächtigen, damit du deine Automatisierungen wieder zum Laufen bringst.

Das Trigger-Log ist hier dein bester Freund. Es zeichnet jeden Aktivierungsversuch auf, einschließlich derer, die ausgefiltert wurden oder still fehlschlugen.

### Diagnose-Schritte

:::steps
1. **Prüfe das Trigger-Log** — öffne die Trigger-Einstellungen des Agenten und klicke auf den \`Log\`-Tab, um jeden Versuch zu sehen, einschließlich Fehlschlägen
2. **Verifiziere, dass der Trigger aktiviert ist** — suche nach dem Schalter; deaktivierte Trigger feuern nicht
3. **Prüfe Filter** — überprüfe deine Filterbedingungen, die möglicherweise zu streng sind und alle Ereignisse blockieren
4. **Manuell testen** — verwende den Trigger-Tester, um ein Ereignis zu simulieren und die Konfiguration zu verifizieren
5. **Prüfe Berechtigungen** — bestätige, dass File Watchers Ordnerzugriff haben und Webhooks Netzwerkzugriff
:::

### So funktioniert es

Öffne die Trigger-Einstellungen des Agenten und klicke auf den \`Log\`-Tab. Jeder Trigger-Versuch wird mit einem Status aufgelistet: fired, filtered oder failed. Klicke auf jeden Eintrag, um zu sehen, warum er nicht gefeuert hat. Der häufigste Befund ist ein Filter, der etwas zu streng ist — ihn anzupassen löst das Problem meist sofort.

:::tip
Wenn du einen neuen Trigger einrichtest, beginne ohne Filter. Sobald du bestätigt hast, dass er korrekt feuert, füge Filter einen nach dem anderen hinzu. So weißt du, dass jeder Filter wie erwartet funktioniert.
:::
  `,

  "self-healing-explained": `
## Selbstheilung erklärt

Wenn während einer Agentenausführung etwas schiefläuft, versucht das Selbstheilungssystem, das Problem zu beheben und automatisch neu zu starten. Wie ein Sicherheitsnetz, das die meisten Fehler abfängt, bevor du sie überhaupt bemerkst. Häufige Probleme wie vorübergehende Netzwerkausfälle, kurze API-Ausfälle oder Rate-Limits werden ohne dein Eingreifen behandelt.

Selbstheilung bedeutet nicht, dass dein Agent nie fehlschlägt — es bedeutet, dass er sich von kleinen, vorübergehenden Problemen erholt, die sonst einen manuellen Neustart erfordern würden.

### Wichtige Punkte

- **Automatische Wiederholung** — vorübergehende Fehler werden mit intelligentem Backoff-Timing wiederholt
- **Fehler-Klassifizierung** — das System unterscheidet zwischen behebbaren und nicht behebbaren Fehlern
- **Zugangsdaten-Refresh** — abgelaufene Tokens werden nach Möglichkeit automatisch erneuert
- **Transparent** — jede Selbstheilungsaktion wird protokolliert, damit du sehen kannst, was passiert ist

### So funktioniert es

Wenn ein Fehler auftritt, bewertet ihn das Selbstheilungssystem. Vorübergehende Fehler (Netzwerk-Timeouts, Rate-Limits, vorübergehende Ausfälle) lösen nach einer kurzen Wartezeit eine automatische Wiederholung aus. Zugangsdaten-Abläufe lösen einen automatischen Refresh-Versuch aus. Permanente Fehler (ungültige Konfiguration, fehlende Berechtigungen) werden dir sofort gemeldet, weil sie deine Aufmerksamkeit erfordern.

:::success
Wenn die Selbstheilung erfolgreich ist, fährt der Agent fort, als wäre nichts passiert. Das Ausführungs-Log markiert den wiederhergestellten Fehler mit einem grünen "healed"-Badge, damit du sehen kannst, was automatisch abgefangen und gelöst wurde.
:::

:::tip
Prüfe das Selbstheilungs-Log gelegentlich, um zu sehen, was abgefangen wird. Wenn derselbe Fehler immer wieder geheilt wird, könnte das auf ein zugrundeliegendes Problem hindeuten, das es wert ist, dauerhaft behoben zu werden.
:::
  `,

  "checking-system-health": `
## Systemgesundheit prüfen

Der eingebaute Health-Check scannt deine gesamte Personas-Installation und meldet alle Probleme — veraltete Komponenten, fehlende Dateien, Konfigurationsprobleme oder Konnektivitätsprobleme. Führe ihn jederzeit aus, wenn etwas komisch wirkt, für eine schnelle Einschätzung des Gesamtstatus deines Systems.

Stell es dir wie einen Arztbesuch für dein Personas-Setup vor. Eine schnelle Untersuchung kann kleine Probleme abfangen, bevor sie zu großen werden.

### Was er prüft

- **App-Version** — ob du die neueste Version ausführst
- **Datenbank-Integrität** — deine lokalen Datendateien sind intakt und gesund
- **Zugangsdaten-Status** — alle gespeicherten Zugangsdaten sind gültig und funktionieren
- **Anbieter-Konnektivität** — deine KI-Anbieter sind erreichbar und antworten
- **Cloud-Verbindung** — deine Orchestrator-Verbindung ist aktiv (falls konfiguriert)

### So funktioniert es

Gehe zu \`Settings > System Health\` und klicke \`Run Health Check\`. Der Scan dauert ein paar Sekunden und erzeugt einen Bericht. Grüne Einträge sind gesund, gelbe brauchen bald Aufmerksamkeit, und rote brauchen sofortige Behebung. Jeder Eintrag enthält eine Beschreibung des Problems und einen Lösungsvorschlag.

:::tip
Führe einen Health-Check nach dem Installieren von Updates, nach Konnektivitätsproblemen oder vor dem Deployen eines kritischen Agenten aus. Es dauert nur Sekunden und gibt dir Seelenfrieden.
:::
  `,

  "log-files-and-debugging": `
## Logdateien und Debugging

Logdateien sind wie ein Flugschreiber für deine Personas-Installation. Sie erfassen alles, was passiert ist — Agentenläufe, Systemereignisse, Fehler und mehr — in detaillierter chronologischer Reihenfolge. Wenn etwas schiefgeht und das Ausführungs-Log nicht reicht, enthalten diese Dateien die volle Geschichte.

Du musst Logs nicht regelmäßig lesen, aber zu wissen, wo sie sind und wie man sie verwendet, ist unbezahlbar bei der Behebung eines kniffligen Problems.

### Wichtige Punkte

- **Automatische Protokollierung** — alles wird aufgezeichnet, ohne dass du etwas einschalten musst
- **Nach Datum organisiert** — die Ereignisse jedes Tages sind in einer separaten Datei für einfaches Durchstöbern
- **Durchsuchbar** — finde spezifische Ereignisse nach Stichwort, Datum oder Schweregrad
- **Teilbar** — wenn du den Support kontaktierst, kannst du relevante Log-Ausschnitte teilen

### So funktioniert es

Logdateien werden lokal auf deinem Computer gespeichert. Greife über \`Settings > Logs\` darauf zu oder navigiere direkt zum Log-Ordner. Jede Datei deckt einen Tag ab und enthält Einträge mit Zeitstempel. Verwende den eingebauten Log-Viewer, um zu suchen, zu filtern und zu durchstöbern. Für Support-Anfragen erstellt der \`Export Log\`-Knopf einen teilbaren Ausschnitt.

:::tip
Wenn du den Support wegen eines Problems kontaktierst, füge den relevanten Log-Ausschnitt bei. Es beschleunigt den Fehlerbehebungsprozess dramatisch, weil das Support-Team genau sehen kann, was passiert ist.
:::
  `,

  "resetting-to-defaults": `
## Auf Standardwerte zurücksetzen

Wenn du eine Einstellung geändert hast und nicht herausfinden kannst, was ein Problem verursacht, gibt dir das Zurücksetzen auf Standardwerte einen sauberen Ausgangspunkt. Das setzt nur deine Präferenzen und Konfigurationseinstellungen zurück — deine Agenten, Zugangsdaten, Memories und Daten bleiben alle erhalten. Nichts Wichtiges geht verloren.

Stell es dir wie das Wiederherstellen eines Raumes in seinem ursprünglichen Layout vor. All deine Besitztümer (Agenten und Daten) bleiben, aber die Möbel (Einstellungen) gehen zurück an ihren Anfangsort.

:::warning
Das Zurücksetzen löscht alle angepassten Präferenzen in einer Aktion. Das schließt dein Theme, das Standardmodell, Benachrichtigungseinstellungen und Tastenkürzel ein. Deine Agenten, Zugangsdaten, Memories und Daten sind nicht betroffen — aber alle sorgfältig abgestimmten Präferenzen müssen danach manuell neu konfiguriert werden.
:::

### Was zurückgesetzt wird

- **Anzeigepräferenzen** — Theme, Layout, Seitenleisten-Breite und visuelle Einstellungen
- **Standardmodell** — geht zurück zum empfohlenen Standard
- **Benachrichtigungseinstellungen** — zurückgesetzt auf Standard-Benachrichtigungsverhalten
- **Tastenkürzel** — wiederhergestellt auf ursprüngliche Tastenkombinationen

### Was sicher bleibt

- Alle deine **Agenten** und ihre Prompts, Verläufe und Konfigurationen
- Alle deine **Zugangsdaten** im Tresor
- Alle deine **Memories**, Testergebnisse und Ausführungs-Logs
- Alle deine **Pipelines** und Team-Konfigurationen

### So funktioniert es

Gehe zu \`Settings > Advanced > Reset to Defaults\`. Überprüfe, was zurückgesetzt wird, dann klicke \`Confirm\`. Deine Einstellungen kehren zu ihren Werksstandards zurück, während all deine Arbeit bewahrt wird. Du kannst dann Einstellungen einzeln neu konfigurieren, um zu identifizieren, welche Änderung das Problem verursacht hat.

:::tip
Vor dem Zurücksetzen notiere alle Einstellungen, die du absichtlich angepasst hast. So kannst du diejenigen schnell wiederherstellen, die du willst, nachdem das Zurücksetzen dein Problem behoben hat.
:::
  `,
};
