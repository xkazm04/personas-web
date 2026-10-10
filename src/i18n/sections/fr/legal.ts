import type { Translations } from "../../en";

export const fr: Pick<Translations, "legalPage" | "cookiePolicy" | "privacyPolicy"> = {
    legalPage: {
      title: "Mentions l\u00e9gales",
      heading: "Pages l\u00e9gales bient\u00f4t disponibles",
      description: "Notre politique de confidentialit\u00e9 et nos conditions d'utilisation sont en cours de finalisation. En attendant, si vous avez des questions, n'h\u00e9sitez pas \u00e0 nous contacter."
    },
    cookiePolicy: {
      tldr: [
        "Ce site ne d\u00e9pose aucun cookie qui lui soit propre. Il conserve quelques r\u00e9glages dans le stockage local de votre navigateur et, si vous associez un t\u00e9l\u00e9phone, une cl\u00e9 de signature dans la base de donn\u00e9es du navigateur de ce t\u00e9l\u00e9phone. Chaque \u00e9l\u00e9ment est list\u00e9 ci-dessous.",
        "Aucune publicit\u00e9, aucun suivi intersites, aucune empreinte num\u00e9rique, de quelque nature que ce soit.",
        "Vous pouvez tout effacer \u00e0 tout moment dans les r\u00e9glages de votre navigateur."
      ],
      lastUpdated: "Derni\u00e8re mise \u00e0 jour\u00a0: {date}",
      approachHeading: "Notre approche des cookies et du stockage",
      approachBody: "Nous ne conservons que ce dont le site a besoin. Selon les r\u00e8gles de l'UE, le stockage du navigateur, comme le stockage local, est trait\u00e9 comme un cookie\u00a0; la liste ci-dessous couvre donc les deux. Nous n'utilisons ni cookies publicitaires, ni pixels de suivi, ni empreinte num\u00e9rique.",
      registerHeading: "Ce que nous stockons sur votre appareil",
      registerIntro: "Tous les cookies et cl\u00e9s de stockage que ce site \u00e9crit, regroup\u00e9s par finalit\u00e9. Un nom se terminant par * d\u00e9signe une famille de cl\u00e9s, par exemple une par politique ou par liste de contr\u00f4le.",
      categories: {
        necessary: {
          title: "Strictement n\u00e9cessaires",
          description: "Indispensables pour que le site fasse ce que vous avez demand\u00e9. Ils sont toujours actifs."
        },
        preferences: {
          title: "Pr\u00e9f\u00e9rences",
          description: "M\u00e9morisent vos choix pour que le site s'affiche et se comporte comme vous l'avez r\u00e9gl\u00e9."
        },
        functional: {
          title: "Fonctionnels",
          description: "Assurent la continuit\u00e9 des fonctionnalit\u00e9s d'une visite \u00e0 l'autre\u00a0: votre progression, ce que vous avez d\u00e9j\u00e0 vu et vos votes."
        },
        analytics: {
          title: "Mesure d'audience",
          description: "Rien n'est stock\u00e9 pour la mesure d'audience. Si vous choisissez \"Tout accepter\" dans le bandeau cookies, le site compte anonymement les pages vues et quelques actions cl\u00e9s, sans rien \u00e9crire sur votre appareil. Si vous choisissez \"Essentiels uniquement\", rien n'est compt\u00e9."
        }
      },
      mechanisms: {
        cookie: "Cookie",
        localStorage: "Stockage local",
        indexedDB: "Base de donn\u00e9es du navigateur (IndexedDB)"
      },
      lifetimes: {
        oneYear: "1 an",
        untilCleared: "Jusqu'\u00e0 ce que vous l'effaciez",
        untilSignOut: "Jusqu'\u00e0 votre d\u00e9connexion",
        untilUnpaired: "Jusqu'\u00e0 ce que vous dissociiez le t\u00e9l\u00e9phone ou effaciez les donn\u00e9es du site"
      },
      purposes: {
        consent: "M\u00e9morise votre choix dans le bandeau cookies.",
        authSession: "Vous garde connect\u00e9 au tableau de bord. \u00c9crit par Supabase, notre fournisseur de connexion, et uniquement si vous vous connectez.",
        theme: "M\u00e9morise le th\u00e8me de couleurs que vous avez choisi.",
        language: "M\u00e9morise la langue que vous avez choisie.",
        tourVolume: "M\u00e9morise le volume de la narration de la visite guid\u00e9e.",
        dashboardPrefs: "M\u00e9morise vos vues, filtres et r\u00e9glages du tableau de bord, comme l'escalade des revues et la lecture \u00e0 voix haute.",
        tourSeen: "M\u00e9morise que vous avez vu la visite guid\u00e9e, pour ne pas vous la proposer \u00e0 nouveau.",
        policySeen: "M\u00e9morise la derni\u00e8re fois que vous avez lu chaque politique de cette page, afin de signaler les mises \u00e0 jour.",
        dashboardActivity: "M\u00e9morise la derni\u00e8re fois que vous avez ouvert le tableau de bord et le nombre de nouvelles tentatives d'un \u00e9v\u00e9nement de d\u00e9monstration.",
        checklist: "M\u00e9morise les \u00e9l\u00e9ments des listes de contr\u00f4le du guide que vous avez coch\u00e9s.",
        voting: "Un identifiant al\u00e9atoire qui vous permet de voter une seule fois par fonctionnalit\u00e9, et un pseudonyme al\u00e9atoire (par exemple SwiftFox) affich\u00e9 sur vos commentaires. Les deux sont envoy\u00e9s avec vos votes et commentaires, et aucun ne contient d'informations personnelles.",
        pairedPhoneKey: "Uniquement sur un t\u00e9l\u00e9phone que vous associez \u00e0 l'application de bureau : une cl\u00e9 de signature cr\u00e9\u00e9e par le navigateur, qui ne peut pas l'exporter, un identifiant pour ce t\u00e9l\u00e9phone, l'identifiant de l'ordinateur auquel il est associ\u00e9 et la date de l'association. La cl\u00e9 signe les commandes envoy\u00e9es par ce t\u00e9l\u00e9phone, pour que votre ordinateur puisse v\u00e9rifier qu'elles viennent bien de lui."
      },
      notUsedHeading: "Ce que nous n'utilisons pas",
      notUsed: [
        "Aucun cookie publicitaire ou de remarketing",
        "Aucun suivi intersites",
        "Aucun pixel de suivi des r\u00e9seaux sociaux",
        "Aucun cookie ni stockage de mesure d'audience"
      ],
      thirdPartyHeading: "Cookies tiers",
      thirdPartyBody: "Si vous vous connectez, vous passez par Supabase, notre fournisseur de connexion, et par le fournisseur de compte de votre choix, comme Google. Ceux-ci peuvent d\u00e9poser des cookies sur leurs propres domaines pendant la connexion, selon leurs propres politiques. Nous n'utilisons pas ces cookies pour vous suivre.",
      managingHeading: "G\u00e9rer les cookies et le stockage",
      managingBody: "Vous pouvez effacer ou bloquer les cookies et les donn\u00e9es du site \u00e0 tout moment dans les r\u00e9glages de votre navigateur. Les effacer vous d\u00e9connecte et r\u00e9initialise vos pr\u00e9f\u00e9rences. Pour toute question, \u00e9crivez-nous \u00e0 {email}.",
      manageButton: "G\u00e9rer les pr\u00e9f\u00e9rences de cookies"
    },
    privacyPolicy: {
      tldr: [
        "Personas ex\u00e9cute vos agents sur votre ordinateur et les y conserve, avec votre historique d'ex\u00e9cutions, vos notes et vos conversations. Vos prompts ne vont qu'au fournisseur d'IA que vous choisissez.",
        "La synchronisation cloud est facultative et d\u00e9sactiv\u00e9e tant que vous ne l'activez pas. Elle copie vos agents et leurs ex\u00e9cutions sur votre compte pour que vous puissiez les consulter sur le web. Les notes et les conversations ne sont synchronis\u00e9es que si vous activez aussi leurs propres interrupteurs.",
        "Un t\u00e9l\u00e9phone que vous associez peut lancer, mettre en pause, reprendre et arr\u00eater vos agents, approuver ou refuser leurs revues, et discuter avec eux et avec Athena, sans un clic sur votre ordinateur. Vous pouvez le r\u00e9voquer \u00e0 tout moment.",
        "Les cl\u00e9s d'API sont chiffr\u00e9es en AES-256 et ne quittent jamais votre machine, m\u00eame avec la synchronisation cloud activ\u00e9e.",
        "En dehors de ce que vous choisissez de synchroniser, l'application de bureau ne nous envoie que des rapports d'erreur et des signaux d'utilisation anonymes, et vous pouvez d\u00e9sactiver la plupart d'entre eux.",
        "Nous ne recueillons votre e-mail que si vous vous connectez pour utiliser les fonctions cloud.",
        "Vous pouvez tout exporter ou tout supprimer \u00e0 tout moment. Il suffit de demander."
      ],
      lastUpdated: "Derni\u00e8re mise \u00e0 jour : {date}",
      commitmentHeading: "Notre engagement pour la confidentialit\u00e9",
      commitmentBody: "Personas repose sur un principe simple : vos donn\u00e9es vous appartiennent. Notre application de bureau est local-first. Tant que vous n'activez pas la synchronisation cloud, vos agents, prompts, r\u00e9sultats et identifiants ne nous sont jamais envoy\u00e9s, et les seules donn\u00e9es que l'application nous envoie sont les diagnostics anonymes d\u00e9crits plus bas. Vos identifiants ne nous sont jamais envoy\u00e9s, m\u00eame avec la synchronisation cloud activ\u00e9e.",
      desktopHeading: "Ce que l'application de bureau conserve",
      desktopBody: "Tout ce que cr\u00e9e l'application de bureau Personas (vos agents, pipelines, historique d'ex\u00e9cutions, notes, conversations et configuration) reste sur votre ordinateur. Rien de tout cela n'est envoy\u00e9 \u00e0 nos serveurs, sauf si vous activez la synchronisation cloud, d\u00e9crite plus bas. Quand un agent s'ex\u00e9cute, son prompt va directement de votre ordinateur au fournisseur d'IA que vous avez choisi : Claude d'Anthropic, ou un mod\u00e8le Ollama local qui ne quitte jamais votre ordinateur.",
      telemetryHeading: "Rapports d'erreur et signaux d'utilisation de l'application de bureau",
      telemetryBody: "Les versions publi\u00e9es de l'application de bureau envoient \u00e0 Sentry des rapports d'erreur (message d'erreur, trace de pile, syst\u00e8me d'exploitation, architecture et version de l'application) et des signaux d'utilisation anonymes (sessions de l'application, sections et onglets que vous ouvrez, actions cl\u00e9s comme la cr\u00e9ation d'un agent, et \u00e9tapes franchies une seule fois). Les sessions et les \u00e9tapes ne sont li\u00e9es qu'\u00e0 un identifiant al\u00e9atoire d'appareil ou d'installation. Les adresses IP, les adresses e-mail, les noms d'utilisateur ainsi que le corps et les en-t\u00eates des requ\u00eates sont supprim\u00e9s avant tout envoi. Il n'y a ni traces de performance, ni enregistrements de session, ni identit\u00e9 d'utilisateur, et vos prompts, le contenu de vos personas et vos identifiants ne sont jamais inclus.",
      telemetryControls: "Vous pouvez d\u00e9sactiver les signaux d'utilisation et les rapports d'erreur de l'interface de l'application au premier lancement ou \u00e0 tout moment dans Param\u00e8tres > Compte. Les rapports de plantage du c\u0153ur natif de l'application ne sont pas encore couverts par cet interrupteur. Les versions de d\u00e9veloppement et celles que vous compilez \u00e0 partir du code source n'envoient rien.",
      credentialsHeading: "Comment les identifiants sont prot\u00e9g\u00e9s",
      credentialsBody: "Les cl\u00e9s d'API et les secrets que vous ajoutez \u00e0 Personas sont chiffr\u00e9s au repos en AES-256-GCM et stock\u00e9s dans le trousseau de votre syst\u00e8me d'exploitation. Ils ne quittent jamais votre appareil, m\u00eame lorsque vous utilisez la synchronisation cloud ou un t\u00e9l\u00e9phone associ\u00e9.",
      syncHeading: "Synchronisation cloud facultative",
      syncIntro: "La synchronisation cloud est d\u00e9sactiv\u00e9e tant que vous ne vous connectez pas et ne l'activez pas dans les Param\u00e8tres de l'application de bureau. Elle vous permet de suivre vos agents sur le site web de Personas, y compris depuis votre t\u00e9l\u00e9phone. Tant qu'elle est activ\u00e9e, l'application copie ceci sur votre compte : vos agents (y compris leurs noms, descriptions et instructions), leurs ex\u00e9cutions (y compris l'entr\u00e9e, la sortie, le co\u00fbt et les erreurs), les \u00e9v\u00e9nements, les \u00e9l\u00e9ments en attente de votre validation, les messages que vos agents vous envoient, les m\u00e9moires, les sch\u00e9mas appris, les probl\u00e8mes de sant\u00e9, les horaires planifi\u00e9s, la file d'ex\u00e9cution et les totaux quotidiens. Les valeurs qui ressemblent \u00e0 des secrets sont retir\u00e9es des donn\u00e9es d'\u00e9v\u00e9nement avant l'envoi.",
      syncNever: "Jamais synchronis\u00e9s : les cl\u00e9s d'API, mots de passe et autres identifiants, ni les r\u00e9glages des d\u00e9clencheurs, comme la configuration des webhooks.",
      syncOptIns: "Deux autres types de donn\u00e9es ne sont synchronis\u00e9s que si vous activez aussi leurs propres interrupteurs dans les m\u00eames Param\u00e8tres : \u00ab Synchroniser les notes \u00bb et \u00ab Synchroniser les discussions \u00bb. Tous deux sont d\u00e9sactiv\u00e9s au d\u00e9part, m\u00eame si la synchronisation cloud est d\u00e9j\u00e0 activ\u00e9e.",
      syncNotes: "\u00ab Synchroniser les notes \u00bb copie vos objectifs du Notepad : le titre, le texte, le statut et le nom du projet de chaque note (jamais le dossier du projet sur votre ordinateur), ainsi que le court r\u00e9sum\u00e9 de son r\u00e9sultat. Les notes archiv\u00e9es ne sont pas synchronis\u00e9es.",
      syncChats: "\u00ab Synchroniser les discussions \u00bb copie vos conversations avec Athena et avec vos agents, pour que vous puissiez les lire et les poursuivre depuis votre t\u00e9l\u00e9phone : le titre de chaque conversation active, ainsi que vos messages et les r\u00e9ponses \u00e0 partir de 90 jours avant l'activation. Les r\u00e9ponses peuvent citer ce que vos agents ont lu via les applications que vous avez connect\u00e9es. Les messages syst\u00e8me et d'outils, les r\u00e9sum\u00e9s de conversation, la m\u00e9moire de travail d'un agent et les conversations archiv\u00e9es ne sont jamais synchronis\u00e9s.",
      syncMasking: "Avant que le texte d'une note ou d'une discussion ne quitte votre ordinateur, tout ce qui ressemble \u00e0 une cl\u00e9, un jeton ou un mot de passe est masqu\u00e9, et les textes longs sont tronqu\u00e9s : les titres \u00e0 1 Ko, le texte des notes \u00e0 16 Ko et chaque message de discussion \u00e0 32 Ko.",
      syncDeletion: "D\u00e9sactiver \u00ab Synchroniser les notes \u00bb ou \u00ab Synchroniser les discussions \u00bb supprime les notes ou les discussions que cet ordinateur a synchronis\u00e9es, lors de sa prochaine synchronisation. Supprimer une discussion avec un agent sur votre ordinateur supprime sa copie synchronis\u00e9e, et supprimer un agent supprime sa copie synchronis\u00e9e, discussions comprises. D\u00e9sactiver la synchronisation cloud elle-m\u00eame arr\u00eate les nouvelles copies, mais ne supprime pas ce qui a d\u00e9j\u00e0 \u00e9t\u00e9 synchronis\u00e9. \u00c9crivez-nous et nous le supprimerons.",
      syncWhere: "Les donn\u00e9es synchronis\u00e9es sont stock\u00e9es chez Supabase, notre fournisseur cloud, dans des lignes li\u00e9es \u00e0 votre compte. Les r\u00e8gles d'acc\u00e8s de la base de donn\u00e9es ne permettent qu'\u00e0 votre compte connect\u00e9 de lire ou de modifier ces lignes, depuis l'application de bureau ou le site web. Les donn\u00e9es ne sont pas chiffr\u00e9es de bout en bout.",
      phonesHeading: "T\u00e9l\u00e9phones associ\u00e9s",
      phonesIntro: "Tant que la synchronisation cloud est activ\u00e9e, vous pouvez associer un t\u00e9l\u00e9phone en scannant un code affich\u00e9 dans les Param\u00e8tres de l'application de bureau. Depuis le site web de Personas, un t\u00e9l\u00e9phone associ\u00e9 peut lancer, mettre en pause et reprendre vos agents, arr\u00eater une ex\u00e9cution, approuver ou refuser les revues qui vous attendent, et discuter avec Athena ou avec n'importe lequel de vos agents, y compris ceux en pause (uniquement si \u00ab Synchroniser les discussions \u00bb est activ\u00e9). Votre ordinateur ex\u00e9cute ces actions sans vous demander au pr\u00e9alable, et les ex\u00e9cutions, r\u00e9ponses et travaux approuv\u00e9s ainsi lanc\u00e9s utilisent votre forfait Claude. Une commande n'atteint votre ordinateur que s'il est allum\u00e9 et en ligne. Une commande qui ne l'atteint pas dans la minute expire au lieu d'attendre.",
      phonesLimits: "Un t\u00e9l\u00e9phone associ\u00e9 ne peut pas modifier vos agents, voir ou modifier vos identifiants, ni changer la file d'ex\u00e9cution sans votre accord sur l'ordinateur. Sans association, une demande du site web pour lancer un agent attend que vous l'approuviez sur votre ordinateur.",
      phonesKey: "Lors de l'association, le navigateur du t\u00e9l\u00e9phone cr\u00e9e une cl\u00e9 de signature qui ne peut pas \u00eatre export\u00e9e et la conserve dans le stockage de ce navigateur. Chaque commande est sign\u00e9e avec elle, et votre ordinateur v\u00e9rifie la signature \u00e0 l'aide de sa propre liste de t\u00e9l\u00e9phones associ\u00e9s. Le nom du t\u00e9l\u00e9phone (tir\u00e9 de son navigateur, par exemple \u00ab iPhone \u00b7 Safari \u00bb), sa cl\u00e9 publique et les commandes qu'il envoie avec leurs r\u00e9sultats sont stock\u00e9s avec vos donn\u00e9es synchronis\u00e9es.",
      phonesRevoke: "Vous pouvez r\u00e9voquer un t\u00e9l\u00e9phone, ou tous, dans les Param\u00e8tres de l'application de bureau \u00e0 tout moment. La r\u00e9vocation prend effet en quelques secondes, et une ex\u00e9cution d\u00e9j\u00e0 lanc\u00e9e se termine. Vous pouvez aussi dissocier le t\u00e9l\u00e9phone depuis le t\u00e9l\u00e9phone lui-m\u00eame, ce qui y supprime sa cl\u00e9.",
      accountHeading: "Ce que nous recueillons pour les fonctions cloud",
      accountBody: "Si vous vous connectez avec Google pour utiliser les fonctions cloud, nous stockons votre adresse e-mail et les informations de base de votre profil via Supabase, notre fournisseur de connexion. Si vous activez la synchronisation cloud ou associez un t\u00e9l\u00e9phone, nous stockons aussi les donn\u00e9es d\u00e9crites plus haut.",
      analyticsHeading: "Mesure d'audience du site web",
      analyticsBody: "Si vous choisissez \u00ab {acceptAll} \u00bb dans le bandeau des cookies, ce site web compte de mani\u00e8re anonyme les pages vues et quelques actions cl\u00e9s (clics de t\u00e9l\u00e9chargement, inscriptions \u00e0 la liste d'attente, votes sur les fonctionnalit\u00e9s et commentaires) pour nous aider \u00e0 comprendre quelles pages sont utiles. Si vous choisissez \u00ab {essentialOnly} \u00bb, rien n'est compt\u00e9. Nous ne suivons pas les utilisateurs individuellement, ne cr\u00e9ons pas de profils publicitaires et ne vendons pas de donn\u00e9es \u00e0 des tiers.",
      thirdPartyHeading: "Services tiers",
      thirdPartySupabase: "connexion et stockage cloud des donn\u00e9es que vous choisissez de synchroniser",
      thirdPartySentry: "suivi des erreurs et comptages anonymes mentionn\u00e9s plus haut sur ce site web, ainsi que les rapports d'erreur et signaux d'utilisation de l'application de bureau",
      rightsHeading: "Vos droits",
      rightsBody: "Vous pouvez \u00e0 tout moment demander l'acc\u00e8s, la rectification ou la suppression de toute donn\u00e9e personnelle que nous d\u00e9tenons, y compris vos donn\u00e9es synchronis\u00e9es. Vous pouvez aussi exporter toutes vos donn\u00e9es locales directement depuis l'application de bureau. Pour exercer ces droits, contactez-nous \u00e0 {email}."
    },
};
