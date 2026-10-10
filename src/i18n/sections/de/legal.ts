import type { Translations } from "../../en";

export const de: Pick<Translations, "legalPage" | "cookiePolicy" | "privacyPolicy"> = {
    legalPage: {
      title: "Rechtliches",
      heading: "Rechtliche Seiten folgen in K\u00fcrze",
      description: "Unsere Datenschutzrichtlinie und Nutzungsbedingungen werden derzeit finalisiert. In der Zwischenzeit kontaktieren Sie uns bitte bei Fragen."
    },
    cookiePolicy: {
      tldr: [
        "Diese Website setzt keine eigenen Cookies. Sie speichert einige Einstellungen im lokalen Speicher Ihres Browsers und, wenn Sie ein Telefon koppeln, einen Signaturschl\u00fcssel in der Browserdatenbank dieses Telefons. Jeder Eintrag ist unten aufgef\u00fchrt.",
        "Keine Werbung, kein website\u00fcbergreifendes Tracking und kein Fingerprinting jeglicher Art.",
        "Sie k\u00f6nnen alles jederzeit in Ihren Browsereinstellungen l\u00f6schen."
      ],
      lastUpdated: "Zuletzt aktualisiert: {date}",
      approachHeading: "Unser Umgang mit Cookies und Speicher",
      approachBody: "Wir speichern nur, was die Website braucht. Browserspeicher wie der lokale Speicher gilt nach EU-Recht wie ein Cookie, deshalb umfasst die Liste unten beides. Wir verwenden keine Werbe-Cookies, keine Tracking-Pixel und kein Fingerprinting.",
      registerHeading: "Was wir auf Ihrem Ger\u00e4t speichern",
      registerIntro: "Alle Cookies und Speicherschl\u00fcssel, die diese Website schreibt, nach Zweck gruppiert. Ein Name, der auf * endet, steht f\u00fcr eine Gruppe von Schl\u00fcsseln, etwa einen pro Richtlinie oder Checkliste.",
      categories: {
        necessary: {
          title: "Unbedingt erforderlich",
          description: "N\u00f6tig, damit die Website tut, was Sie angefordert haben. Sie sind immer aktiv."
        },
        preferences: {
          title: "Pr\u00e4ferenzen",
          description: "Merken sich Ihre Entscheidungen, damit die Website so aussieht und sich so verh\u00e4lt, wie Sie es eingestellt haben."
        },
        functional: {
          title: "Funktional",
          description: "Halten Funktionen \u00fcber Besuche hinweg am Laufen: Ihren Fortschritt, was Sie schon gesehen haben, und Ihre Stimmen."
        },
        analytics: {
          title: "Analyse",
          description: "F\u00fcr Analysen wird nichts gespeichert. Wenn Sie im Cookie-Banner \"Alle akzeptieren\" w\u00e4hlen, z\u00e4hlt die Website Seitenaufrufe und einige wichtige Aktionen anonym, ohne etwas auf Ihr Ger\u00e4t zu schreiben. Wenn Sie \"Nur notwendige\" w\u00e4hlen, wird nichts gez\u00e4hlt."
        }
      },
      mechanisms: {
        cookie: "Cookie",
        localStorage: "Lokaler Speicher",
        indexedDB: "Browserdatenbank (IndexedDB)"
      },
      lifetimes: {
        oneYear: "1 Jahr",
        untilCleared: "Bis Sie ihn l\u00f6schen",
        untilSignOut: "Bis Sie sich abmelden",
        untilUnpaired: "Bis Sie die Kopplung des Telefons aufheben oder die Websitedaten l\u00f6schen"
      },
      purposes: {
        consent: "Merkt sich Ihre Auswahl im Cookie-Banner.",
        authSession: "H\u00e4lt Sie im Dashboard angemeldet. Wird von Supabase, unserem Anmeldeanbieter, geschrieben, und nur, wenn Sie sich anmelden.",
        theme: "Merkt sich das von Ihnen gew\u00e4hlte Farbschema.",
        language: "Merkt sich die von Ihnen gew\u00e4hlte Sprache.",
        tourVolume: "Merkt sich die Lautst\u00e4rke der Sprecherstimme in der gef\u00fchrten Tour.",
        dashboardPrefs: "Merkt sich Ihre Dashboard-Ansichten, -Filter und -Einstellungen, etwa Review-Eskalation und Vorlesen.",
        tourSeen: "Merkt sich, dass Sie die gef\u00fchrte Tour gesehen haben, damit sie nicht erneut angeboten wird.",
        policySeen: "Merkt sich, wann Sie die einzelnen Richtlinien auf dieser Seite zuletzt gelesen haben, damit Aktualisierungen markiert werden k\u00f6nnen.",
        dashboardActivity: "Merkt sich, wann Sie das Dashboard zuletzt ge\u00f6ffnet haben und wie oft ein Demo-Ereignis wiederholt wurde.",
        checklist: "Merkt sich, welche Punkte der Checklisten im Leitfaden Sie abgehakt haben.",
        voting: "Eine zuf\u00e4llige ID, mit der Sie pro Funktion nur einmal abstimmen k\u00f6nnen, und ein zuf\u00e4lliger Spitzname (zum Beispiel SwiftFox), der bei Ihren Kommentaren angezeigt wird. Beide werden mit Ihren Stimmen und Kommentaren gesendet, und keiner enth\u00e4lt personenbezogene Daten.",
        pairedPhoneKey: "Nur auf einem Telefon, das Sie mit der Desktop-App koppeln: ein Signaturschl\u00fcssel, den der Browser erzeugt hat und nicht exportieren kann, eine ID f\u00fcr dieses Telefon, die ID des Computers, mit dem es gekoppelt ist, und der Zeitpunkt der Kopplung. Der Schl\u00fcssel signiert die Befehle, die dieses Telefon sendet, damit Ihr Computer pr\u00fcfen kann, dass sie von ihm stammen."
      },
      notUsedHeading: "Was wir nicht verwenden",
      notUsed: [
        "Keine Werbe- oder Remarketing-Cookies",
        "Kein website\u00fcbergreifendes Tracking",
        "Keine Tracking-Pixel sozialer Netzwerke",
        "Keine Analyse-Cookies und kein Analysespeicher"
      ],
      thirdPartyHeading: "Cookies von Drittanbietern",
      thirdPartyBody: "Wenn Sie sich anmelden, durchlaufen Sie Supabase, unseren Anmeldeanbieter, und den Kontoanbieter Ihrer Wahl, etwa Google. Diese k\u00f6nnen w\u00e4hrend der Anmeldung Cookies auf ihren eigenen Domains setzen, nach ihren eigenen Richtlinien. Wir verwenden diese Cookies nicht zum Tracking.",
      managingHeading: "Cookies und Speicher verwalten",
      managingBody: "Sie k\u00f6nnen Cookies und Websitedaten jederzeit in Ihren Browsereinstellungen l\u00f6schen oder blockieren. Dadurch werden Sie abgemeldet und Ihre Pr\u00e4ferenzen zur\u00fcckgesetzt. Bei Fragen wenden Sie sich an {email}.",
      manageButton: "Cookie-Einstellungen verwalten"
    },
    privacyPolicy: {
      tldr: [
        "Personas f\u00fchrt Ihre Agenten auf Ihrem Computer aus und speichert sie dort, zusammen mit Ihrem Ausf\u00fchrungsverlauf, Ihren Notizen und Chats. Ihre Prompts gehen nur an den KI-Anbieter, den Sie w\u00e4hlen.",
        "Die Cloud-Synchronisierung ist optional und bleibt aus, bis Sie sie einschalten. Sie kopiert Ihre Agenten und deren Ausf\u00fchrungen in Ihr Konto, damit Sie sie im Web sehen k\u00f6nnen. Notizen und Chats werden nur synchronisiert, wenn Sie zus\u00e4tzlich deren eigene Schalter einschalten.",
        "Ein Telefon, das Sie koppeln, kann Ihre Agenten starten, pausieren, fortsetzen und stoppen, ihre Pr\u00fcfungen freigeben oder ablehnen und mit ihnen und mit Athena chatten, ohne dass Sie am Computer etwas anklicken. Sie k\u00f6nnen die Kopplung jederzeit widerrufen.",
        "API-Schl\u00fcssel werden mit AES-256 verschl\u00fcsselt und verlassen Ihren Computer nie, auch nicht bei eingeschalteter Cloud-Synchronisierung.",
        "Abgesehen von dem, was Sie synchronisieren, sendet uns die Desktop-App nur anonyme Fehlerberichte und Nutzungssignale, und die meisten davon k\u00f6nnen Sie abschalten.",
        "Ihre E-Mail-Adresse erfassen wir nur, wenn Sie sich f\u00fcr Cloud-Funktionen anmelden.",
        "Sie k\u00f6nnen jederzeit alles exportieren oder l\u00f6schen. Fragen Sie einfach."
      ],
      lastUpdated: "Zuletzt aktualisiert: {date}",
      commitmentHeading: "Unser Bekenntnis zum Datenschutz",
      commitmentBody: "Personas folgt einem einfachen Grundsatz: Ihre Daten geh\u00f6ren Ihnen. Unsere Desktop-App ist Local-first. Solange Sie die Cloud-Synchronisierung nicht einschalten, werden Ihre Agenten, Prompts, Ausgaben und Zugangsdaten nie an uns gesendet, und die einzigen Daten, die die App an uns sendet, sind die unten beschriebenen anonymen Diagnosedaten. Ihre Zugangsdaten werden auch bei eingeschalteter Cloud-Synchronisierung nie an uns gesendet.",
      desktopHeading: "Was die Desktop-App speichert",
      desktopBody: "Alles, was die Personas-Desktop-App erstellt (Ihre Agenten, Pipelines, Ihr Ausf\u00fchrungsverlauf, Notizen, Unterhaltungen und Ihre Konfiguration), liegt auf Ihrem Computer. Nichts davon wird an unsere Server gesendet, es sei denn, Sie schalten die unten beschriebene Cloud-Synchronisierung ein. Wenn ein Agent l\u00e4uft, geht sein Prompt direkt von Ihrem Computer an den KI-Anbieter Ihrer Wahl: Claude von Anthropic oder ein lokales Ollama-Modell, das Ihren Computer nie verl\u00e4sst.",
      telemetryHeading: "Fehlerberichte und Nutzungssignale der Desktop-App",
      telemetryBody: "Release-Builds der Desktop-App senden Fehlerberichte (Fehlermeldung, Stacktrace, Betriebssystem, Architektur und App-Version) und anonyme Nutzungssignale (App-Sitzungen, welche Bereiche und Tabs Sie \u00f6ffnen, wichtige Aktionen wie das Erstellen eines Agenten und einmalige Meilensteine) an Sentry. Sitzungen und Meilensteine sind nur mit einer zuf\u00e4lligen Ger\u00e4te- oder Installations-ID verkn\u00fcpft. IP-Adressen, E-Mail-Adressen, Benutzernamen sowie Anfrageinhalte und -header werden vor dem Senden entfernt. Es gibt keine Performance-Traces, keine Sitzungsaufzeichnungen und keine Benutzeridentit\u00e4t, und Ihre Prompts, Persona-Inhalte und Zugangsdaten sind nie enthalten.",
      telemetryControls: "Sie k\u00f6nnen Nutzungssignale und Fehlerberichte der App-Oberfl\u00e4che beim ersten Start oder jederzeit unter Einstellungen > Konto abschalten. Absturzberichte aus dem nativen Kern der App deckt dieser Schalter noch nicht ab. Entwicklungs-Builds und Builds, die Sie selbst aus dem Quellcode kompilieren, senden nichts.",
      credentialsHeading: "Wie Zugangsdaten gesch\u00fctzt werden",
      credentialsBody: "API-Schl\u00fcssel und Geheimnisse, die Sie in Personas hinterlegen, werden im Ruhezustand mit AES-256-GCM verschl\u00fcsselt und im Schl\u00fcsselbund Ihres Betriebssystems gespeichert. Sie verlassen Ihr Ger\u00e4t nie, auch nicht bei Cloud-Synchronisierung oder mit einem gekoppelten Telefon.",
      syncHeading: "Optionale Cloud-Synchronisierung",
      syncIntro: "Die Cloud-Synchronisierung ist aus, bis Sie sich anmelden und sie in den Einstellungen der Desktop-App einschalten. Damit k\u00f6nnen Sie Ihre Agenten auf der Personas-Website verfolgen, auch auf Ihrem Telefon. Solange sie eingeschaltet ist, kopiert die App Folgendes in Ihr Konto: Ihre Agenten (einschlie\u00dflich Namen, Beschreibungen und Anweisungen), deren Ausf\u00fchrungen (einschlie\u00dflich Eingabe, Ausgabe, Kosten und Fehlern), Ereignisse, Elemente, die auf Ihre Pr\u00fcfung warten, Nachrichten Ihrer Agenten an Sie, Erinnerungen, gelernte Muster, Zustandsprobleme, Zeitplanzeiten, die Ausf\u00fchrungswarteschlange und Tagessummen. Werte, die wie Geheimnisse aussehen, werden vor dem Senden aus den Ereignisdaten entfernt.",
      syncNever: "Nie synchronisiert: API-Schl\u00fcssel, Passw\u00f6rter und andere Zugangsdaten sowie Trigger-Einstellungen wie Webhook-Konfigurationen.",
      syncOptIns: "Zwei weitere Datenarten werden nur synchronisiert, wenn Sie in denselben Einstellungen zus\u00e4tzlich deren eigene Schalter einschalten: \u201eNotizen synchronisieren\u201c und \u201eChats synchronisieren\u201c. Beide sind anfangs aus, auch wenn die Cloud-Synchronisierung bereits l\u00e4uft.",
      syncNotes: "\u201eNotizen synchronisieren\u201c kopiert Ihre Ziele aus dem Notepad: Titel, Text, Status und Projektname jeder Notiz (nie den Ordner des Projekts auf Ihrem Computer) sowie die kurze Zusammenfassung ihres Ergebnisses. Archivierte Notizen werden nicht synchronisiert.",
      syncChats: "\u201eChats synchronisieren\u201c kopiert Ihre Unterhaltungen mit Athena und mit Ihren Agenten, damit Sie sie auf Ihrem Telefon lesen und dort fortsetzen k\u00f6nnen: den Titel jeder aktiven Unterhaltung sowie Ihre Nachrichten und die Antworten ab 90 Tagen vor dem Einschalten. Die Antworten k\u00f6nnen zitieren, was Ihre Agenten \u00fcber die verbundenen Apps gelesen haben. System- und Tool-Nachrichten, Zusammenfassungen von Unterhaltungen, das Arbeitsged\u00e4chtnis eines Agenten sowie archivierte Unterhaltungen werden nie synchronisiert.",
      syncMasking: "Bevor Notiz- oder Chattext Ihren Computer verl\u00e4sst, wird alles maskiert, was wie ein Schl\u00fcssel, Token oder Passwort aussieht, und langer Text wird gek\u00fcrzt: Titel auf 1 KB, Notiztext auf 16 KB und jede Chatnachricht auf 32 KB.",
      syncDeletion: "Wenn Sie \u201eNotizen synchronisieren\u201c oder \u201eChats synchronisieren\u201c ausschalten, werden die Notizen bzw. Chats, die dieser Computer synchronisiert hat, bei der n\u00e4chsten Synchronisierung gel\u00f6scht. Wenn Sie auf Ihrem Computer einen Chat mit einem Agenten l\u00f6schen, wird auch seine synchronisierte Kopie gel\u00f6scht, und wenn Sie einen Agenten l\u00f6schen, wird seine synchronisierte Kopie samt seiner Chats gel\u00f6scht. Das Ausschalten der Cloud-Synchronisierung selbst stoppt neue Kopien, l\u00f6scht aber nicht, was bereits synchronisiert wurde. Schreiben Sie uns, dann l\u00f6schen wir es.",
      syncWhere: "Synchronisierte Daten werden bei Supabase, unserem Cloud-Anbieter, in Zeilen gespeichert, die Ihrem Konto zugeordnet sind. Zugriffsregeln der Datenbank erlauben nur Ihrem angemeldeten Konto, diese Zeilen zu lesen oder zu \u00e4ndern, aus der Desktop-App oder auf der Website. Die Daten sind nicht Ende-zu-Ende-verschl\u00fcsselt.",
      phonesHeading: "Gekoppelte Telefone",
      phonesIntro: "Solange die Cloud-Synchronisierung eingeschaltet ist, k\u00f6nnen Sie ein Telefon koppeln, indem Sie einen Code scannen, den die Desktop-App in den Einstellungen anzeigt. \u00dcber die Personas-Website kann ein gekoppeltes Telefon Ihre Agenten starten, pausieren und fortsetzen, eine Ausf\u00fchrung stoppen, Pr\u00fcfungen, die auf Sie warten, freigeben oder ablehnen und mit Athena oder mit jedem Ihrer Agenten chatten, auch mit pausierten (nur solange \u201eChats synchronisieren\u201c eingeschaltet ist). Ihr Computer f\u00fchrt das aus, ohne Sie vorher zu fragen, und Ausf\u00fchrungen, Antworten und freigegebene Arbeit, die es startet, laufen \u00fcber Ihren Claude-Tarif. Ein Befehl erreicht Ihren Computer nur, solange er eingeschaltet und online ist. Ein Befehl, der ihn nicht innerhalb einer Minute erreicht, verf\u00e4llt, statt zu warten.",
      phonesLimits: "Ein gekoppeltes Telefon kann Ihre Agenten nicht bearbeiten, Ihre Zugangsdaten weder sehen noch \u00e4ndern und die Ausf\u00fchrungswarteschlange nicht ohne Ihre Zustimmung am Computer \u00e4ndern. Ohne Kopplung wartet eine Anfrage der Website, einen Agenten zu starten, bis Sie sie auf Ihrem Computer best\u00e4tigen.",
      phonesKey: "Beim Koppeln erzeugt der Browser des Telefons einen Signaturschl\u00fcssel, der nicht exportiert werden kann, und bewahrt ihn im Speicher dieses Browsers auf. Jeder Befehl wird damit signiert, und Ihr Computer pr\u00fcft die Signatur anhand seiner eigenen Liste gekoppelter Telefone. Der Name des Telefons (aus seinem Browser, etwa \u201eiPhone \u00b7 Safari\u201c), sein \u00f6ffentlicher Schl\u00fcssel und die gesendeten Befehle mit ihren Ergebnissen werden mit Ihren synchronisierten Daten gespeichert.",
      phonesRevoke: "Sie k\u00f6nnen ein Telefon oder alle Telefone jederzeit in den Einstellungen der Desktop-App widerrufen. Der Widerruf wirkt innerhalb von Sekunden, und eine bereits gestartete Ausf\u00fchrung l\u00e4uft zu Ende. Sie k\u00f6nnen die Kopplung auch auf dem Telefon selbst aufheben, wodurch sein Schl\u00fcssel dort gel\u00f6scht wird.",
      accountHeading: "Was wir f\u00fcr Cloud-Funktionen erfassen",
      accountBody: "Wenn Sie sich mit Google f\u00fcr Cloud-Funktionen anmelden, speichern wir Ihre E-Mail-Adresse und grundlegende Profilinformationen \u00fcber Supabase, unseren Anmeldeanbieter. Wenn Sie die Cloud-Synchronisierung einschalten oder ein Telefon koppeln, speichern wir au\u00dferdem die oben beschriebenen Daten.",
      analyticsHeading: "Website-Analyse",
      analyticsBody: "Wenn Sie im Cookie-Banner \u201e{acceptAll}\u201c w\u00e4hlen, z\u00e4hlt diese Website anonym Seitenaufrufe und einige wichtige Aktionen (Download-Klicks, Wartelisten-Anmeldungen, Funktionsabstimmungen und Kommentare), damit wir verstehen, welche Seiten n\u00fctzlich sind. Wenn Sie \u201e{essentialOnly}\u201c w\u00e4hlen, wird nichts gez\u00e4hlt. Wir verfolgen keine einzelnen Nutzer, erstellen keine Werbeprofile und verkaufen keine Daten an Dritte.",
      thirdPartyHeading: "Dienste von Drittanbietern",
      thirdPartySupabase: "Anmeldung und Cloud-Speicher f\u00fcr die Daten, die Sie synchronisieren",
      thirdPartySentry: "Fehlerverfolgung und die oben genannten anonymen Z\u00e4hlungen auf dieser Website sowie die Fehlerberichte und Nutzungssignale der Desktop-App",
      rightsHeading: "Ihre Rechte",
      rightsBody: "Sie k\u00f6nnen jederzeit Auskunft \u00fcber, Berichtigung oder L\u00f6schung aller personenbezogenen Daten verlangen, die wir \u00fcber Sie speichern, einschlie\u00dflich Ihrer synchronisierten Daten. Ihre lokalen Daten k\u00f6nnen Sie au\u00dferdem direkt aus der Desktop-App exportieren. Um diese Rechte auszu\u00fcben, schreiben Sie uns an {email}."
    },
};
