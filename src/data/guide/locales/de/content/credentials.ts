export const content: Record<string, string> = {
  "how-personas-keeps-your-data-safe": `
## Wie Personas deine Daten sicher hält

Sicherheit ist von Grund auf in Personas eingebaut. API-Schlüssel, Tokens und Passwörter leben in einem lokalen verschlüsselten Tresor auf deiner eigenen Maschine — sie verlassen das Gerät nie, es sei denn, ein Agent sendet sie während eines Laufs explizit an einen KI-Anbieter oder Drittanbieter-Dienst. Die Tresor-Datei selbst ist mit **AES-256-GCM** verschlüsselt, und der Schlüssel, der sie entsperrt, wird durch dein OS-natives Keyring umhüllt (Windows DPAPI, macOS Keychain, Linux Secret Service), sodass Klartext-Schlüssel nie auf der Festplatte liegen.

Wenn du einen Agenten ausführst, entschlüsselt die Engine nur die spezifischen Zugangsdaten, die dieser Agent braucht, hält sie für die Dauer des Aufrufs im Speicher und wischt dann den Klartext. Logs, Traces und Exports enthalten nie rohe Zugangsdaten-Werte — überall, wo eine Zugangsdaten erscheinen würden, siehst du stattdessen eine Token-Referenz (\`cred:gmail-work\`).

### Wichtige Punkte

- **AES-256-GCM** — authentifizierte Verschlüsselung (jeder Zugangsdaten-Chiffretext wird auf Integrität geprüft, sodass eine manipulierte Tresor-Datei erkannt wird, nicht still entschlüsselt)
- **OS-Keyring-umhüllter Hauptschlüssel** — DPAPI auf Windows, Keychain auf macOS, Secret Service auf Linux; kein Master-Passwort, das jede Sitzung getippt werden muss
- **Standardmäßig nur lokal** — nichts wird hochgeladen; Cloud-Deploy ist Opt-in und verschlüsselt während der Übertragung via TLS zu deinem gewählten Orchestrator
- **Token-Referenzen in Logs** — Agenten-Traces und Exports nutzen Zugangsdaten-IDs, keine rohen Geheimnisse
- **Manipulations-evident** — GCM-Authentifizierungs-Tags fangen jede Modifikation der Tresor-Datei ab

### So funktioniert es

Das Speichern einer Zugangsdaten verschlüsselt sie mit dem Tresor-Schlüssel (dem AES-256-GCM-Schlüssel pro Tresor, selbst umhüllt von OS-Keyring) und schreibt den Chiffretext in das lokale SQLite. Die Nutzung einer Zugangsdaten während einer Agentenausführung entschlüsselt sie im Speicher, gibt sie an das relevante Tool oder den HTTP-Client weiter und gibt den Buffer sofort frei. Der Rohwert wird nie protokolliert, nie nach der ersten Eingabe angezeigt und nie irgendwo außerhalb des verschlüsselten Tresors serialisiert.

### In Aktion

:::usecases
**Mehrere Dienste, isolierte Zugangsdaten**
Deine Agenten sprechen mit Slack, GitHub und Jira
---
Jede Zugangsdaten wird unabhängig mit ihrem eigenen zufälligen Nonce verschlüsselt. Eine Kompromittierung eines Datensatzes legt die anderen nicht offen.
===
**Zugangsdaten-Rotation**
Ein Token läuft ab oder wird rotiert
---
OAuth-Zugangsdaten erneuern sich automatisch über das Refresh-Token des Anbieters. Manuell rotierte Schlüssel tauschst du am Zugangsdaten-Datensatz, ohne irgendetwas neu starten zu müssen.
===
**Audit-freundliche Traces**
Du musst nachweisen, welche Zugangsdaten wo verwendet wurde
---
Der Trace jedes Laufs zeichnet die verwendete Zugangsdaten-ID auf. Der tatsächliche Wert erscheint nie; die ID reicht, um die Herkunft zu belegen.
:::

:::info
Der Tresor ist über das OS-Keyring an dein OS-Benutzerkonto gebunden. Das Kopieren der Tresor-Datei auf eine andere Maschine, selbst mit dem gleichen OS, macht sie nicht entschlüsselbar — der umhüllende Schlüssel lebt im OS-Keyring und ist nicht portabel.
:::

:::warning
Wenn du dein OS-Konto-Passwort auf macOS oder Linux änderst, kann das Keyring den umhüllenden Schlüssel neu sperren. Personas wird beim ersten Lauf nach der Änderung nach der neuen Zugangsdaten fragen. Wenn das Keyring gelöscht wird (Werksreset, Kontolöschung), wird der Tresor unwiederherstellbar — sichere die Rohgeheimnisse extern, falls du Disaster Recovery über die lokale Maschine hinaus benötigst.
:::

:::tip
Das Nur-lokal-Modell ist der richtige Standard für persönliche Automatisierung. Für Team-/Produktivarbeit, bei der mehrere Maschinen dieselben Zugangsdaten brauchen, repliziert das Cloud-Deploy (Team-/Builder-Tier) den Tresor-Zustand über den Orchestrator mit End-to-End-Verschlüsselung.
:::
  `,

  "adding-a-new-credential": `
## Eine neue Zugangsdaten hinzufügen

Öffne Connections → Credentials und klicke \`Add Credential\`. Wähle eine Kategorie (Email, Cloud-Speicher, Zahlungen, Kommunikation, Entwicklertools, CRM, KI-Anbieter, generisch) — der Picker zeigt passende vorgefertigte Konnektoren, die Auth-Typ, benötigte Felder und Label-Hinweise automatisch konfigurieren. Wenn dein Dienst nicht im Katalog ist, wähle "Custom" und definiere die Zugangsdaten selbst (Name, Typ, Felder).

Für OAuth-unterstützende Dienste öffnet der Flow ein Browserfenster zum Zustimmungsbildschirm des Anbieters. Für API-Schlüssel-Dienste fügst du den Schlüssel in das sichere Eingabefeld ein. In jedem Fall landet die Zugangsdaten verschlüsselt, und der Picker bietet an, sie auf Agenten anzuwenden, die einen offenen Capability-Slot in der passenden Kategorie haben.

### Schritt für Schritt

:::steps
1. **Navigiere zu Connections → Credentials** — Seitenleiste → Connections, dann der Credentials-Tab
2. **Klicke Add Credential** — Knopf oben rechts in der Zugangsdaten-Liste
3. **Wähle eine Kategorie** — Email / Speicher / Zahlungen / etc.; der passende Konnektor-Katalog filtert automatisch
4. **Führe den Auth-Flow aus** — OAuth öffnet ein Zustimmungsfenster; API-Schlüssel-Dienste nutzen das sichere Eingabefeld
5. **Benenne und speichere** — gib der Zugangsdaten ein Label, das du wiedererkennst ("Stripe Live", "Gmail Personal"); die Zugangsdaten wird mit AES-256-GCM verschlüsselt und persistiert
6. **Optional: jetzt an Agenten binden** — der Picker zeigt Agenten mit passenden offenen Capabilities; Ein-Klick-Binden vermeidet späteres Suchen
:::

### So funktioniert es

Wenn du auf Save klickst, wird der Rohwert der Zugangsdaten mit dem Tresor-Schlüssel verschlüsselt, der vom OS-Keyring abgeleitet ist, dann im Zugangsdaten-Store committet. Das Speichern gibt nur die Zugangsdaten-ID und das Label zurück — der Rohwert wird sofort aus dem Speicher gewischt. Von diesem Punkt an kann der Connectors-Tab im Agenten-Editor die Zugangsdaten über die ID referenzieren.

:::warning
Füge nie Zugangsdaten in Agenten-Prompts, Code-Kommentare oder Chat-Fenster ein. Verwende nur das sichere Zugangsdaten-Eingabefeld — alles andere riskiert, dass der Rohwert in einem Log, einer Synchronisation oder einem Screenshot erfasst wird.
:::

:::tip
Die Benennungskonvention zählt, sobald du 20+ Zugangsdaten hast. \`<Dienst>-<Umgebung>-<Konto>\` ("stripe-live-main", "gmail-prod-support") macht sofort klar, welche Zugangsdaten beim Konfigurieren eines Connectors-Tabs am Agenten zu wählen ist.
:::
  `,



  "credential-health-checks": `
## Zugangsdaten-Gesundheitschecks

Zugangsdaten driften im Laufe der Zeit — Tokens laufen ab, Schlüssel werden upstream rotiert, OAuth-Scopes ändern sich. Zugangsdaten-Gesundheitschecks pingen jede gespeicherte Zugangsdaten periodisch mit einem leichten Test-Aufruf (eine No-op-API-Anfrage, die nichts kostet und dir sagt, ob die Zugangsdaten noch gültig ist). Die Ergebnisse erscheinen als Status-Indikator auf der Zugangsdaten-Karte und als Alerts, wenn eine Zugangsdaten sich verschlechtert.

Der Check-Zeitplan ist konfigurierbar. Standardmäßig prüfen OAuth-Zugangsdaten täglich (weil der Refresh-Token-Flow die Zugangsdaten ohnehin periodisch ausführen muss), API-Schlüssel-Zugangsdaten wöchentlich. Manuelle Checks können jederzeit von der Zugangsdaten-Karte aus ausgeführt werden.

### Wichtige Punkte

- **Status pro Zugangsdaten** — grün (healthy), gelb (expiring soon / Scope geändert), rot (broken / revoked)
- **Konfigurierbare Frequenz** — Überschreibungen pro Zugangsdaten, falls ein Dienst aggressives Prüfen rate-limitiert
- **Manueller Check** — Ein-Klick-Test von der Zugangsdaten-Karte; nützlich vor dem Deployen eines neuen Agenten
- **Ablaufprojektion** — bei Zugangsdaten mit bekanntem Ablaufdatum (signierte JWTs, eingeschränkte Tokens) wechselt der Status N Tage vor Ablauf auf gelb (konfigurierbar, Standard 7)
- **Alert-Routing** — Fehlschläge werden über die gleichen Benachrichtigungskanäle geroutet, die du für Agenten konfiguriert hast

### So funktioniert es

Jeder Konnektor definiert seinen eigenen Health-Check-Aufruf (die leichteste mögliche Anfrage, die die Zugangsdaten ausführt). Der Check läuft im Hintergrund nach der konfigurierten Frequenz; die Ergebnisse werden persistiert und aktualisieren den Status der Zugangsdaten. Wenn ein Check fehlschlägt, wechselt der Status, die Zugangsdaten-Karte wird hervorgehoben, und abhängige Agenten erben die Warnung auf ihren eigenen Health-Indikatoren — sodass eine kaputte Gmail-Zugangsdaten jeden Gmail-nutzenden Agenten gelb anzeigt, bis du sie reparierst.

:::tip
Führe einen manuellen Health-Check vor jedem Produktiv-Deploy oder geplanten Übernachtlauf aus. Fünf Sekunden jetzt versus ein fehlgeschlagener Lauf um 3 Uhr morgens, weil ein Token still rotiert wurde.
:::
  `,

  "auto-credential-browser": `
## Auto-Zugangsdaten-Browser

Der Auto-Zugangsdaten-Browser ist das kataloggetriebene Onboarding für neue Zugangsdaten. Öffne Connections → Catalog, und du siehst jeden Konnektor, den Personas vorkonfiguriert ausliefert: zum jetzigen Zeitpunkt 60+ Dienste, nach Kategorie organisiert (Email, Speicher, Zahlungen, Kommunikation, Entwicklertools, CRM, KI-Anbieter usw.). Jeder Konnektor kennt den richtigen Auth-Typ, die benötigten Felder, die OAuth-Scopes, die API-Endpunkte und alle dienst-spezifischen Eigenheiten.

Wenn du einen Konnektor auswählst, führt dich der Assistent durch die genauen Schritte für diesen Dienst — einschließlich Links zu den spezifischen Seiten in der UI des Dienstes, wo du einen API-Schlüssel findest oder welche OAuth-Scopes zu genehmigen sind oder welche Berechtigungen wichtig sind. Bei Diensten, bei denen Personas eine erfolgreiche Verbindung erkennen kann (die meisten), validiert der Assistent in Echtzeit vor dem Speichern.

### Wichtige Punkte

- **60+ vorkonfigurierte Konnektoren** — Auth-Typ, Felder, Scopes, Endpunkte eingebacken
- **Dienst-spezifische Anleitung** — direkte Links zur genauen API-Schlüssel-Seite oder zum Einstellungs-Tab
- **Live-Validierung** — der Assistent testet die Zugangsdaten vor dem Speichern bei den meisten Diensten
- **Vorgeschlagen-für-Agent-Flow** — der Katalog kann auch über den Connectors-Tab eines Agenten aufgerufen werden, wo er auf Konnektoren gefiltert ist, die den offenen Capability-Slot abdecken
- **Neue Konnektoren anfordern** — Dienste, die noch nicht im Katalog sind, können angefordert werden; für Einzelfälle nutze den Generic-/Custom-Konnektor-Typ

### So funktioniert es

Konnektor-Definitionen werden mit der App ausgeliefert und über den regulären Release-Zyklus aktualisiert. Jede Definition gibt ihren Auth-Flow, benötigte Felder, Validierungs-Endpunkt und Scope-Liste an. Wenn du einen Konnektor auswählst, liest der Assistent die Definition, rendert das passende Formular, führt den OAuth- oder API-Schlüssel-Flow aus und validiert vor dem Speichern. Der tatsächliche Zugangsdaten-Wert wird beim Speichern auf demselben Pfad wie eine manuell hinzugefügte Zugangsdaten verschlüsselt.

:::tip
Der Katalog ist auch der schnellste Weg, um zu entdecken, was integriert ist. Wenn du überlegst, ob Personas X mit Dienst Y machen kann, durchsuche zuerst den Katalog — wenn Y dort mit einer relevanten Capability ist, ist die Integration ein Klick entfernt.
:::
  `,

  "which-agents-use-which-credentials": `
## Welche Agenten nutzen welche Zugangsdaten

Der Dependencies-Tab in Connections zeigt den Zugangsdaten → Agent-Graphen. Wähle eine Zugangsdaten auf der linken Seite, und du siehst jeden Agenten, der sie auf der rechten Seite referenziert, mit dem benannten spezifischen Capability-Slot ("Gmail-Konto für den Email-Summary-Agenten"). Wähle einen Agenten, und du siehst jede Zugangsdaten, von der er abhängt. Der Graph ist bidirektional — nützlich sowohl für "was bricht, wenn ich diesen Schlüssel rotiere?" als auch für "welche Zugangsdaten braucht dieser Agent, bevor ich ihn befördern kann?".

Dieselbe Abhängigkeitskarte treibt den Pre-flight-Check der Build-Engine an: wenn du einen Agenten beförderst, prüft die Engine jede benötigte Capability gegen den Tresor und kennzeichnet fehlende oder abgelaufene Zugangsdaten, bevor die Beförderung erlaubt wird. Deshalb bekommst du bei neu erstellten Agenten fast nie einen "Credential not found"-Fehler zur Laufzeit — der Abhängigkeits-Check lief zur Beförderungszeit und hat ihn abgefangen.

### Wichtige Punkte

- **Bidirektionaler Graph** — Zugangsdaten → Agenten und Agent → Zugangsdaten
- **Capability-Slot benannt** — die Abhängigkeit sagt dir nicht nur "diese Zugangsdaten wird verwendet", sondern "verwendet als Email-Send-Capability"
- **Pre-flight-Check** — Validierung zur Beförderungszeit, die denselben Graphen nutzt
- **Impact-Vorschau** — das Auswählen einer Zugangsdaten hebt jeden Agenten hervor, der durch ihre Entfernung betroffen wäre
- **Erkennung ungenutzter Zugangsdaten** — Zugangsdaten ohne Agent-Abhängigkeiten erscheinen in der Connections-Übersicht, damit du sie aufräumen kannst

### So funktioniert es

Der Connectors-Tab jedes Agenten speichert die Zugangsdaten-Referenz pro Capability-Slot. Die Dependencies-Ansicht fragt diesen Speicher in beide Richtungen ab, um den Graphen zu rendern. Zugangsdaten-Rotation, -Ablauf oder -Entfernung breiten sich durch den Graphen aus: jeder Agent, der von einer verschlechterten Zugangsdaten abhängt, erbt den Warnzustand auf seinem Health-Indikator, sodass der Graph nicht nur eine statische Referenz ist — er ist ein Live-Ausbreitungspfad.

:::warning
Bevor du eine Zugangsdaten rotierst oder löschst, die von einem unbeaufsichtigten (geplanten / webhook / chain) Agenten verwendet wird, prüfe die Abhängigkeitskarte und aktualisiere die Agenten so, dass sie zuerst auf die Ersatz-Zugangsdaten zeigen. Der Pre-flight-Check fängt dich zur Beförderungszeit ab; bei bereits beförderten Agenten ist der Laufzeitfehler das einzige Signal.
:::

:::tip
Eine monatliche "Zugangsdaten-Audit"-Routine: öffne Connections → Dependencies, sortiere nach ältester und frage "nutze ich diese Zugangsdaten noch?" für das unterste Dutzend. Ungenutzte Zugangsdaten sind Angriffsfläche für nichts, also ist ihr Entfernen reine Aufräumarbeit.
:::
  `,

  "refreshing-expired-tokens": `
## Abgelaufene Tokens erneuern

Einige Zugangsdaten sind designbedingt zeitlich begrenzt — OAuth-Access-Tokens laufen in Minuten bis Stunden ab; dienstausgestellte Tokens (Slack-Bot-Tokens, GitHub-PATs) haben oft N-Tage- oder N-Jahre-Ablaufzeiten. Personas verfolgt Ablaufzeiten, wo der Anbieter sie veröffentlicht, und zeigt einen "expiring soon"-gelb-Status einige Tage vor dem Cutoff (konfigurierbar, Standard 7 Tage).

Für OAuth-Zugangsdaten mit Refresh-Token ist der Refresh automatisch und still im Hintergrund. Für API-Schlüssel und Tokens, die sich nicht erneuern, siehst du die gelbe Warnung, und die Zugangsdaten-Karte bietet einen "Reconnect"- oder "Replace"-Knopf — ein Klick öffnet denselben Assistenten, der die Zugangsdaten erstellt hat.

### Wichtige Punkte

- **Automatischer Refresh für OAuth** — Refresh-Token wird still verwendet; du siehst das nicht
- **Vorabwarnung für nicht-erneuerbare Zugangsdaten** — gelber Status N Tage vor Ablauf; konfigurierbares Warn-Fenster
- **Ein-Klick-Reconnect** — die Zugangsdaten-Karte hat einen Reconnect-Knopf, der den Auth-Flow erneut ausführt
- **Zero-Downtime-Tausch** — bei Zugangsdaten mit aktiven abhängigen Agenten ersetzt das neue Token das alte direkt; Agenten nehmen den neuen Wert beim nächsten Lauf auf
- **Fehler tauchen in Agent-Health auf** — Zugangsdaten, die nicht erneuern, machen ihre abhängigen Agenten im Health-Tab gelb / rot

### So funktioniert es

Der Refresh läuft als Teil derselben Hintergrundaufgabe, die Health-Checks durchführt. Bei OAuth nutzt die Aufgabe das Refresh-Token, um ein neues Access-Token vom Anbieter zu prägen, und aktualisiert den Zugangsdaten-Datensatz. Bei nicht erneuerbaren Tokens aktualisiert die Aufgabe nur die Ablaufprojektion (damit die gelbe Warnung zur richtigen Zeit erscheint); die tatsächliche Ersetzung ist eine manuelle Aktion, die du ergreifst, wenn die Warnung feuert.

:::tip
Wenn eine gelbe Ablaufwarnung feuert, erneuere sofort, statt zu warten. Jetzt zu erneuern ist eine Aufgabe von einer Minute. Einen geplanten Agenten um 3 Uhr morgens scheitern zu lassen, weil das Token über Nacht abgelaufen ist, ist beim Aufräumen der verpassten Läufe viel teurer.
:::
  `,

  "deleting-credentials-safely": `
## Zugangsdaten sicher löschen

Eine Zugangsdaten zu löschen ist endgültig — der verschlüsselte Datensatz wird aus dem Tresor gewischt, und es gibt keine Wiederherstellung von innerhalb von Personas. Vor dem Löschen zeigt die Zugangsdaten-Karte den Abhängigkeitscheck: jeden Agenten, der die Zugangsdaten referenziert, in welchem Capability-Slot, mit welcher Auswirkung. Du kannst den Löschdialog verwenden, um jeden abhängigen Agenten vor der Bestätigung einer anderen Zugangsdaten zuzuweisen, sodass die eigentliche Löschung atomar mit der Neuzuweisung ist.

Bei OAuth-Zugangsdaten entfernt das Löschen nur das lokal gespeicherte Token — es widerruft den Zugriff anbieterseitig nicht. Wenn du auch anbieterseitig widerrufen willst, tu das auf der Sicherheitseinstellungsseite des Anbieters (ein Link wird im Löschdialog für wichtige Anbieter angeboten).

### Wichtige Punkte

- **Endgültig und sofort** — kein Rückgängig; der verschlüsselte Datensatz wird beim Bestätigen gewischt
- **Abhängigkeitscheck im Voraus** — sieh jeden abhängigen Agenten vor dem Bestätigen
- **Inline-Neuzuweisung** — zeige abhängige Agenten als Teil des Löschdialogs auf eine Ersatz-Zugangsdaten
- **OAuth-Anbieter: standardmäßig nur lokales Löschen** — Anbieterseitiger Widerruf ist ein separater Schritt (Link bereitgestellt)
- **No-op-sicher bei bereits kaputten Zugangsdaten** — das Löschen einer abgelaufenen / widerrufenen Zugangsdaten ist immer sicher; nichts hängt vom funktionalen Zustand ab

### So funktioniert es

Der Löschdialog liest denselben Abhängigkeitsgraphen wie die Dependencies-Ansicht. Wenn du bestätigst, schreibt die Engine zuerst alle von dir angegebenen Neuzuweisungen und entfernt dann den Zugangsdaten-Datensatz in einer einzigen Transaktion aus dem Tresor. Wenn Neuzuweisungen die Validierung nicht bestehen (z. B. wenn du versuchst, auf eine Zugangsdaten der falschen Kategorie zu zeigen), wird die Löschung zurückgerollt, und nichts ändert sich.

:::warning
Endgültig heißt endgültig. Der verschlüsselte Datensatz wird gewischt, und wenn du das Rohgeheimnis nicht anderswo aufgeschrieben hast, ist es weg. Wenn du die Zugangsdaten vielleicht wieder brauchst, sichere den Rohwert extern vor dem Löschen.
:::

:::tip
Das sicherste Rotationsmuster ist "neu hinzufügen, alle Agenten neu zuweisen, dann alt löschen". Füge zuerst die Ersatz-Zugangsdaten hinzu, gehe die Abhängigkeitskarte durch, um abhängige Agenten einen nach dem anderen neu zuzuweisen (oder alle auf einmal im Neuzuweisungs-Dialog), verifiziere, dass alles gesund ist, dann lösche die alte Zugangsdaten. Diese Sequenz garantiert null Ausfallzeit.
:::
  `,

  "connector-catalog": `
## Konnektor-Katalog

Der Katalog unter Connections → Catalog ist die kuratierte Liste der Dienste, die Personas standardmäßig integriert. Zum jetzigen Zeitpunkt 60+ Konnektoren über 9 Kategorien, mit neuen Konnektoren, die pro Release basierend auf Nutzerwünschen hinzugefügt werden. Jeder Konnektor gibt seinen Auth-Typ (OAuth, API-Schlüssel, Basic Auth, Bot-Token), die benötigten Scopes / Capabilities und die Tool-Oberfläche an, die er auf der Agentenseite bereitstellt.

Wenn der Connectors-Tab eines Agenten eine Capability benötigt ("email-send", "cloud-storage-write", "chat-message-send"), fragt er den Katalog nach Konnektoren, die diese Capability erfüllen, und gleicht dann gegen deinen Tresor ab. Wenn du bereits eine Zugangsdaten für einen dieser Konnektoren hast, ist es eine sofortige Übereinstimmung. Wenn nicht, bietet der Katalog an, eine hinzuzufügen — er öffnet denselben Assistenten, der im Auto-Zugangsdaten-Browser-Thema beschrieben wird.

### Konnektor-Kategorien

| Kategorie | Beispiel-Dienste | Auth |
|---|---|---|
| Email | Gmail, Outlook, IMAP/SMTP | OAuth / API |
| Cloud-Speicher | Google Drive, Dropbox, OneDrive, S3, Local Drive | OAuth / API |
| Zahlungen | Stripe, PayPal, Square | API-Schlüssel |
| Social | Twitter/X, LinkedIn, Facebook, Mastodon | OAuth |
| Entwicklertools | GitHub, GitLab, Jira, Linear, Sentry | OAuth / API |
| Kommunikation | Slack, Discord, Microsoft Teams, Telegram, generischer Webhook | OAuth / Bot-Token |
| CRM | Salesforce, HubSpot, Pipedrive | OAuth / API |
| KI-Anbieter | Anthropic, OpenAI, Google, lokales Ollama, benutzerdefiniert OpenAI-kompatibel | API |
| Daten | Postgres, Snowflake, BigQuery, generisches SQL/HTTP | URL + Zugangsdaten |

### Wichtige Punkte

- **Capability-basierte Übereinstimmung** — Konnektoren stellen Capabilities bereit; Agenten brauchen Capabilities; der Katalog gleicht sie ab
- **Dienst-spezifische Eigenheiten eingebacken** — Slack-Workspace-IDs, GitHub-PAT-Scopes, OAuth-Callback-URLs usw. alle vorkonfiguriert
- **Auth-Typ-Indikatoren** — auf einen Blick, sieh, welche Konnektoren OAuth vs. API-Schlüssel vs. lokal sind
- **Generic-/Custom-Fallback** — für Dienste, die nicht im Katalog sind, akzeptiert der Generic-Konnektor-Typ rohe HTTP/REST-Konfiguration
- **Channel-Delivery-Konnektoren** — Slack, Discord, Teams, generischer Webhook erscheinen hier auch für ausgehende Agenten-Ausgaben (konfiguriert pro Agent im Connectors-Tab)

### So funktioniert es

Konnektor-Definitionen leben in der App und werden mit dem Binary versioniert. Der Connectors-Tab jedes Agenten fragt den Katalog dynamisch ab — das Hinzufügen eines Konnektors zum Katalog (in einem Release) macht ihn für bestehende Agenten ohne Migration pro Agent verfügbar. Custom-/Generic-Konnektoren, die du lokal konfigurierst, sind Tresor-scoped und gehen nicht durch den Katalog.

:::tip
Der Katalog ist auch eine Entdeckungs-Oberfläche. Durchstöbere ihn gelegentlich, auch wenn du keinen spezifischen Bedarf hast — du findest oft eine Integration, die eine neue Automatisierung andeutet. Die Kommunikations-Kategorie ist besonders reichhaltig für Ausgabe-seitige Anwendungsfälle (Auslieferung von Agentenergebnissen an Slack / Discord / Teams).
:::
  `,
};
