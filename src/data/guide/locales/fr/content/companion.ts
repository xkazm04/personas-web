// Compagnon (Athena) — corps des rubriques du guide en français.
// Keyed by topic id (see ../../topics.ts, categoryId "companion").
export const content: Record<string, string> = {
  "meet-athena": `
## Rencontrer Athena

Athena est le compagnon intégré de Personas — toujours disponible, toujours en contexte. Ce n'est pas un chatbot greffé sur le côté. Elle connaît vos agents, vos objectifs, votre mémoire, et elle peut réellement opérer l'application à votre place.

Elle existe à deux endroits à la fois. L'**avatar dans le pied de page** — son visage animé dans le coin inférieur droit — est le point d'entrée : tapez dessus pour ouvrir le panneau de chat, ou appuyez longuement pour dicter un message vocal sans que le panneau ne s'ouvre jamais. L'**orbe flottante** est sa deuxième forme : une superposition déplaçable qui flotte au-dessus de votre travail pour qu'elle reste accessible où que vous soyez dans l'application. Quand l'orbe est activée (par défaut), le pied de page la fait apparaître et disparaître ; un tapotement sur l'orbe ouvre le panneau de chat complet.

Les deux surfaces reflètent ce qu'Athena fait d'un coup d'œil. Pendant qu'elle réfléchit, l'avatar change de posture. Pendant qu'elle parle, l'orbe brille au rythme de sa voix. Quand une tâche en arrière-plan se termine, l'orbe affiche une brève réaction. Ce ne sont pas de simples effets cosmétiques — ils vous indiquent son état sans que vous ayez à ouvrir le panneau.

Ce qu'Athena peut faire va bien au-delà de répondre à des questions. Elle peut répondre à des questions et expliquer des fonctionnalités, oui, mais elle peut aussi naviguer dans l'application à votre place, exécuter vos agents, consigner des mémoires, proposer des mises à jour d'identité et planifier de futurs rappels. Quand le mode autonome est activé, elle peut enchaîner plusieurs étapes sans que vous n'ayez à cliquer.

### Points clés

- **Avatar dans le pied de page** — tapez pour ouvrir/fermer le panneau de chat ; appuyez longuement pour dicter un tour vocal depuis n'importe où
- **Orbe flottante** — superposition déplaçable, mêmes deux gestes ; glisse vers chaque zone lors des visites guidées
- **Opère l'application** — Athena ne se contente pas de conseiller ; elle peut naviguer dans les routes, exécuter des agents et composer des tableaux de bord
- **Toujours en contexte** — elle lit votre mémoire, vos objectifs et l'état de vos agents avant chaque réponse, de sorte qu'elle ne repart jamais de zéro
- **Point de départ** — les rubriques de cette section Compagnon approfondissent chaque aspect : le chat, la voix, la mémoire, les rappels proactifs, les visites guidées, le Hub de décision et la conduite de l'application par chat

:::tip
Si vous fermez le panneau de chat, Athena continue de travailler. Les tâches en arrière-plan s'exécutent dans l'orbe, les nudges proactifs arrivent toujours, et les réponses vocales sont toujours lues — fermer le panneau ne la met pas en pause.
:::
  `,

  "chatting-with-athena": `
## Discuter avec Athena

Ouvrez le panneau et Athena vous accueille avec un **écran de bienvenue** — son avatar, une courte salutation et un ensemble de **chips de prompts de démarrage** couvrant les points de départ les plus courants. Cliquez sur n'importe quel chip et le message s'envoie immédiatement ; inutile de taper.

Pour des prompts prêts à l'emploi au-delà du jeu de démarrage, tapez \`/\` comme premier caractère d'un message vide. Une **palette slash** s'ouvre au-dessus du compositeur avec des prompts prédéfinis que vous pouvez filtrer en tapant : **apprends à me connaître** (l'entretien de prise en charge qui amorce sa mémoire de vous), **montrer les objectifs**, **ce qui est en attente**, **décisions récentes**, **opérations en direct**, **récapitulatif mémoire** et **capacités**. Les touches fléchées naviguent dans la liste, Entrée sélectionne l'élément mis en surbrillance, Échap efface et ferme.

Quand Athena répond, elle ajoute souvent des **chips de réponse rapide** — deux à cinq suggestions de suivi qui correspondent à la direction de la conversation. Cliquez sur l'une pour l'envoyer comme prochain message. Sous sa dernière réponse complète, vous trouvez également trois **chips d'affinage** : **Plus court**, **Plus de détails** et **Code uniquement**. Chacun renvoie votre dernier message avec un suffixe d'orientation pour que vous puissiez façonner la réponse sans retaper.

Le compositeur reste ouvert pendant qu'Athena répond. Vous pouvez taper à tout moment — si votre message ressemble à une réorientation (« en fait, arrête » ou « attends, plutôt… »), il interrompra la réponse en cours et mettra en file votre nouvelle demande. S'il semble complémentaire (« et aussi… »), il se met en file après la réponse actuelle et s'exécute après. Vous verrez les messages en attente sous forme de petits chips au-dessus du compositeur ; vous pouvez en annuler n'importe lequel.

Le **mode autonome** (l'icône ∞ dans l'en-tête du panneau) permet à Athena d'enchaîner des travaux multi-étapes de manière autonome. Quand il est activé et qu'elle a davantage à faire, elle planifie un tour de suivi environ quinze secondes plus tard, jusqu'à vingt tours consécutifs. Un séparateur fin dans la transcription marque chaque continuation autonome pour que vous puissiez voir d'un coup d'œil où vous vous êtes arrêté et où elle a pris le relais.

### Points clés

- **Écran de bienvenue** — les chips de démarrage envoient de vrais messages via le même pipeline que les messages tapés
- **Palette slash** — tapez \`/\` pour parcourir les prompts prédéfinis ; filtrez en tapant, sélectionnez avec Entrée
- **Chips de réponse rapide** — 2 à 5 options de suivi qu'Athena propose à la fin de sa réponse
- **Chips d'affinage** — Plus court / Plus de détails / Code uniquement ; sous la dernière réponse complète uniquement
- **Réorientation en pleine réponse** — tapez pendant qu'elle répond ; classifié automatiquement comme interruption ou mise en file
- **Mode autonome** — Athena enchaîne jusqu'à 20 tours de travail autonome ; tout message de votre part annule la chaîne

:::tip
Les prompts de la palette slash sont traduits dans les 14 langues prises en charge — si vous utilisez Personas dans une autre langue que l'anglais, les messages prédéfinis arrivent dans votre langue et Athena répond de même.
:::
  `,

  "voice-and-hold-to-talk": `
## Voix et appui prolongé pour parler

Athena prend en charge la voix bidirectionnelle complète : vous dictez, elle transcrit et répond, et sa réponse est lue en voix de synthèse. Chaque partie de ce pipeline dispose d'une option de confidentialité.

### Dicter à Athena

**Appuyez longuement** sur l'avatar du pied de page ou sur l'orbe flottante pendant environ un quart de seconde. Un badge microphone et une pulsation apparaissent, et la transcription intermédiaire s'affiche sous forme de légende à côté de l'orbe. Relâchez quand vous avez fini de parler — la transcription est transmise à Athena et le pipeline de réponse habituel s'exécute. La réponse s'affiche en streaming dans le panneau et, si un moteur vocal est configuré, est lue automatiquement. Le panneau n'a jamais besoin de s'ouvrir ; un tour vocal fonctionne même avec le panneau entièrement replié.

Le **raccourci clavier global Cmd/Ctrl+Maj+A** invoque Athena depuis n'importe où dans l'application et démarre un tour vocal en une seule frappe. Appuyez à nouveau sur le raccourci pour envoyer, ou Échap pour annuler sans envoyer. Cela utilise la même session qu'un appui prolongé sur l'orbe — un raccourci en pleine visite guidée est identique à un appui prolongé sur l'orbe.

### Moteurs de reconnaissance vocale

Deux moteurs sont disponibles, à sélectionner dans **Compagnon → Voix** sous le panneau STT :

:::compare
**Navigateur (par défaut)**
Utilise l'API Web Speech dans le rendu de l'application. Aucune configuration requise. Sur Windows, l'audio est transmis au service vocal cloud du fournisseur OS — pratique mais hors appareil.
---
**Whisper local**
Transcription sur l'appareil via un side-car \`whisper-cli\`. L'audio ne quitte jamais votre machine. Nécessite de télécharger un modèle Whisper et de placer le binaire au chemin attendu (l'onglet Voix affiche l'emplacement exact et l'état de téléchargement).
:::

### Moteurs de lecture vocale

Quand Athena répond, le résumé parlé peut provenir de l'un des deux moteurs vocaux :

:::compare
**ElevenLabs (cloud)**
Synthèse de haute qualité utilisant un identifiant API ElevenLabs et un ID de voix de votre choix. Réglage par voix : stabilité, similarité, style et vitesse. L'identifiant est stocké dans votre vault ; la clé API n'atteint jamais le rendu de l'application.
---
**Piper (ONNX local)**
Synthèse sur l'appareil sans appel réseau au moment de la synthèse, sans identifiant requis. Les voix sont téléchargées depuis un catalogue curé d'environ 17 voix dans 14 langues. L'onglet Voix indique lesquelles sont installées.
:::

### Nudges proactifs lus à voix haute

Les rappels proactifs (objectifs qui approchent, échecs d'agents, rappels) peuvent également être lus à voix haute — même quand le panneau de chat est fermé. Le TTS à l'arrivée se déclenche dès qu'un nudge arrive, en utilisant le moteur que vous avez configuré. Un bouton **Rejouer** dans le pied de page relit le dernier message vocal si vous l'avez manqué.

:::tip
Si vous voulez de la voix sans aucun appel cloud, associez Whisper local pour la dictée à Piper pour la lecture. Les deux fonctionnent entièrement sur l'appareil. L'onglet Voix expose un chemin d'installation et un navigateur de modèles pour chaque moteur.
:::
  `,

  "athenas-long-term-memory": `
## La mémoire à long terme d'Athena

Athena se souvient de vous d'une session à l'autre. Elle ne repart pas d'une ardoise vierge chaque fois que vous ouvrez le panneau — elle lit sa mémoire de vous avant chaque réponse et l'utilise pour donner des réponses adaptées à votre situation réelle.

### Ce qu'elle retient

La mémoire est organisée en niveaux, chacun couvrant un type de connaissance différent :

- **Faits** — des choses qu'elle a apprises sur vous, vos projets et le monde. « Vous préférez les résumés concis. » « La branche principale de ce dépôt est master. »
- **Préférences procédurales** — des règles de comportement qu'elle a intégrées. « Quand tu résumes un long document, commence par la conclusion en une phrase. » « Pour les exemples de code, préfère TypeScript. »
- **Objectifs** — les objectifs actifs et les dates cibles qu'elle suit en votre nom.
- **Profil d'identité** — un document \`identity.md\` évolutif qui est lu dans chaque prompt système. C'est la source unique de « qui êtes-vous pour Athena en ce moment » et grandit par modifications ancrées, jamais par réécriture complète.
- **Épisodes** — l'historique de conversation lui-même, stocké sous forme de fichiers markdown sur votre machine. La doctrine (les propres docs de référence de Personas) complète la connaissance produit.

### Amorçage avec l'entretien de prise en charge

Lors d'une nouvelle installation, Athena effectue automatiquement un court entretien — quelques questions ciblées qui lui donnent suffisamment pour rédiger un profil d'identité initial. Vous pouvez relancer l'entretien à tout moment en sélectionnant **apprends à me connaître** dans la palette slash ou en cliquant sur le chip correspondant sur l'écran de bienvenue. Si un profil d'identité existe déjà, elle le met à jour avec des différences ancrées ; elle ne supprime jamais le contexte que vous lui avez fourni auparavant.

### Le navigateur de mémoire

Ouvrez **Compagnon → Mémoire** pour voir tout ce qu'Athena sait. Le visionneur de cerveaux liste les épisodes, les faits, les préférences procédurales, les objectifs et le document d'identité — tout est consultable. Cliquez sur n'importe quelle entrée pour lire le contenu complet, suivez les mémoires liées vers des entrées connexes, et modifiez ou corrigez tout ce qui est erroné.

**Les corrections se font en un clic.** Chaque point de la vue identité dispose d'un affordance « C'est faux ». Cliquez dessus et Athena enregistre la correction comme un signal d'apprentissage à haute valeur et propose de supprimer le point incorrect dans une seule carte d'approbation. Vous approuvez et la mauvaise affirmation disparaît.

### Confidentialité

Les données du cerveau — les cinq niveaux de mémoire — vivent sur votre machine dans \`~/.personas/companion-brain/\`. Rien n'est stocké dans une base de données cloud. Si vous utilisez les moteurs STT Whisper local et TTS Piper, aucun audio ne quitte non plus votre machine.

:::tip
L'entretien de prise en charge est court (quelques minutes) et porte ses fruits immédiatement — les premières réponses d'Athena après un bon entretien sont nettement plus pertinentes. Lancez-le avant votre première vraie session.
:::
  `,

  "proactive-check-ins": `
## Rappels proactifs

Athena n'attend pas que vous lui demandiez. Quand quelque chose mérite votre attention — une échéance qui approche, un agent en attente, un rappel que vous avez défini — elle prend les devants. Ce sont des rappels proactifs : des cartes qui apparaissent dans le panneau de chat, éventuellement lues à voix haute, sans que vous n'ayez rien à ouvrir.

### Ce qui déclenche un rappel

Athena évalue les conditions environ toutes les cinq minutes. Les déclencheurs susceptibles de produire un rappel incluent :

- **Objectif dont la date cible approche** — un objectif actif a une date cible dans les 24 heures
- **Retard dans le backlog** — un engagement de promesse à soi-même n'a pas été traité au-delà d'un seuil de niveau (escalade de 1 jour à 3 jours à 7 jours)
- **Cadence due** — un rituel que vous avez défini (un rappel récurrent, une fenêtre de concentration) correspond à « maintenant »
- **En ce jour** — une note ou une réflexion du même jour calendaire il y a un mois, trois mois ou un an, mise en correspondance avec vos objectifs actifs
- **L'agent a besoin de vous** — une session de flotte a échoué, attend une entrée depuis plus de deux minutes, ou est devenue obsolète
- **Les propres engagements d'Athena** — des rappels planifiés qu'Athena a proposés et que vous avez approuvés lors d'une conversation, livrés à l'heure exacte à laquelle elle s'est engagée

### Garde-fous

Le système est conçu pour être utile sans être envahissant :

- **Heures calmes** — les nudges sont retenus pendant toute fenêtre calme que vous configurez ; rien ne se déclenche pendant que vous avez explicitement demandé le silence
- **Budget quotidien** — par défaut, Athena envoie au maximum trois nudges par jour provenant des types déclenchés ; si vous ignorez systématiquement un type de nudge, le budget pour ce type diminue silencieusement au fil du temps
- **Déduplication** — le même déclencheur pour le même sujet ne peut se déclencher qu'une seule fois jusqu'à ce que vous le résolviez ; un agent défaillant ne produira pas un nouveau nudge toutes les cinq minutes

### Agir sur un rappel

Chaque carte propose deux actions : **Engager** et **Ignorer**. Engager ouvre le contexte pertinent — le détail de l'objectif, l'activité de l'agent, l'entrée mémoire. Ignorer enregistre que vous l'avez vu. Si la voix est configurée, le corps du nudge est lu à voix haute dès qu'il arrive, même avec le panneau de chat fermé.

:::info
Les incidents de sévérité haute, urgente et critique contournent entièrement le budget quotidien de nudges — ils ne sont jamais réduits au silence par des plafonds de fréquence ni par les heures calmes. Les éléments de plancher de sécurité vous parviennent toujours.
:::

:::tip
Définissez un rituel d'heures calmes dans la palette slash (tapez \`/\` et choisissez « ce qui est en attente » pour voir vos rituels) pour définir une fenêtre où Athena retient tous les rappels jusqu'à la fin de cette fenêtre. C'est utile pour les plages de travail en profondeur où vous voulez zéro interruption.
:::
  `,

  "guided-walkthroughs": `
## Visites guidées

Quand vous demandez à Athena comment faire quelque chose, elle peut vous le montrer plutôt que de simplement vous l'expliquer. Dites « montre-moi comment créer un persona » ou « comment configurer un connecteur ? » et elle propose un choix : **Construis-le pour moi** (elle fait le travail) ou **Montre-moi comment le construire** (elle vous guide pas à pas).

Choisissez le chemin de la visite guidée et la visite commence. L'orbe d'Athena glisse sur l'écran vers la zone concernée — vous pouvez la regarder se déplacer. L'élément qu'elle veut que vous regardiez reçoit un anneau lumineux doux avec des crochets d'angle qui se verrouillent dessus. Le reste de l'interface reste entièrement visible et cliquable ; rien n'est assombri ni bloqué. Un **panneau de légende** accompagne l'orbe avec la narration de l'étape et les commandes : Précédent, Pause, Ignorer et Arrêter.

### Comment fonctionne chaque étape

Chaque étape d'une visite guidée raconte ce que vous regardez et, quand il y a quelque chose à faire, attend que vous agissiez. Cliquer sur l'élément mis en surbrillance fait avancer la visite **et** exécute l'action réelle — la visite et l'application restent synchronisées. Certaines étapes sont des moments « à vous de jouer » où l'avancement automatique est entièrement mis en pause jusqu'à ce que vous cliquiez. D'autres étapes avancent automatiquement après un court délai une fois que vous avez lu la narration.

La visite guidée est utilisable au clavier : les flèches gauche/droite font reculer et avancer, Espace met en pause et reprend, Échap arrête.

### Quelles visites guidées sont disponibles

Athena a rédigé des visites pour les surfaces que les utilisateurs demandent le plus souvent :

- **Créer un persona** — le studio de construction, le déclencheur de description du sigil et le bouton de construction autonome
- **Configurer un connecteur** — la route Vault, le flux d'ajout de nouvel identifiant et le choix du type de connecteur
- **Créer un déclencheur** — le hub Événements et le canevas Builder de routage
- **Adopter un modèle** — la galerie de modèles et l'affordance Adopter sur une carte de modèle
- **Trier un incident** — la boîte de réception des incidents Vue d'ensemble et une ligne d'incident
- **Configurer un objectif et des KPI** — le tableau des objectifs et le tableau de bord KPI

Chaque visite guidée se termine par un appel à l'action : Commencer à construire, Ouvrir le catalogue, Ouvrir le Builder ou Configurer un objectif — pour que le chemin « montre-moi comment » mène directement au chemin « faisons-le ».

### Pointage et visites ad hoc

Au-delà des visites guidées préétablies, Athena peut pointer vers des éléments individuels en pleine conversation. Si vous demandez « où est le flux d'activité ? », elle peut faire clignoter un anneau lumineux dessus et narrer une seule légende sans démarrer une visite complète. Elle peut également assembler une courte visite de deux à six étapes à la volée pour des demandes « fais-moi visiter ».

:::tip
Athena propose automatiquement la visite guidée ou le chemin « construis-le pour moi » quand vous décrivez un persona que vous voulez — vous n'avez pas besoin de connaître la bonne formulation. Décrivez simplement ce que vous voulez construire et elle présentera les deux options.
:::
  `,

  "the-decision-hub": `
## Le Hub de décision

Certaines actions d'Athena nécessitent votre accord explicite avant de s'exécuter. Quand elle veut faire quelque chose qui modifie l'état — exécuter un agent, mettre à jour votre profil d'identité, planifier un futur rappel, lancer des sessions de flotte — elle le propose sous forme de **carte d'approbation**. La carte reste dans le panneau de chat jusqu'à ce que vous agissiez. Rien ne se passe jusqu'à ce que vous le fassiez.

### Ce qui apparaît comme carte d'approbation

L'éventail d'actions qui se manifestent ainsi est large :

- **Exécution d'agents** — exécuter un persona avec des entrées données, ou lancer une construction autonome en une seule passe
- **Écritures mémoire et identité** — mettre à jour votre profil d'identité, écrire ou supprimer un fait ou une préférence procédurale, écrire ou mettre à jour un objectif
- **Engagements futurs** — un rappel planifié qu'Athena propose (« je vous rappellerai ça dans trois jours »)
- **Travaux de projet et de développement** — enregistrer un nouveau projet, mettre en file un scan de base de code
- **Opérations de flotte** — lancer de nouvelles sessions de travail Claude Code, envoyer des entrées à une session, tuer une session, envoyer une opération multi-sessions

### Les opérations sensibles ne sont jamais auto-approuvées

Certaines catégories ne sont **jamais** auto-approuvées, même quand le mode autonome est activé. Les mises à jour d'identité et les écritures d'objectifs requièrent votre examen à chaque fois — Athena peut les proposer, mais elle ne peut pas les valider sans votre clic. C'est délibéré : les écritures qui façonnent qui vous êtes pour Athena, et l'état des objectifs qui pilote les rappels proactifs, ont toujours un humain dans la boucle.

### Approuver tout

Quand plusieurs cartes d'approbation s'accumulent depuis la même session de flotte — disons qu'une session attend trois écritures de fichiers d'affilée — le groupe de cartes affiche un bouton **Approuver tout** qui résout toutes les cartes de type approbation de cette session en une seule fois. Les demandes de guidance qui nécessitent des réponses tapées ne sont jamais regroupées ; elles restent individuelles.

### Où vit le hub

Les cartes d'approbation apparaissent en ligne dans le panneau de chat, au-dessus du compositeur. Vous pouvez également voir les approbations en attente de vos sessions d'agents en cours d'exécution là — tout ce qui attend votre décision se regroupe en un seul endroit plutôt que d'être dispersé dans les vues des agents individuels.

:::info
Si Athena propose une action et que vous la rejetez, elle reçoit le rejet comme retour et peut proposer une alternative. Rejeter est toujours sûr — aucun changement d'état n'intervient jusqu'à ce que vous approuviez.
:::
  `,

  "operating-by-chat": `
## Opérer l'application par chat

Athena peut faire plus que conseiller — elle peut piloter l'application. Demandez-lui de vous emmener quelque part, d'ouvrir un éditeur, de construire un tableau de bord ou d'appeler un service connecté, et elle le fait, en faisant clignoter la destination pour que votre regard se pose sur ce qu'elle vient d'afficher.

### Naviguer par voix ou par texte

Demandez à Athena d'ouvrir n'importe quelle section principale de l'application — Vue d'ensemble, Agents, Événements, Identifiants, Paramètres et d'autres — et elle change la route de la barre latérale. Le conteneur de la destination pulse un moment pour que vous sachiez où elle a atterri. Cela fonctionne depuis un tour vocal avec le panneau fermé : dites « emmène-moi au flux d'activité » et l'application navigue pendant qu'Athena confirme dans le chat.

Depuis un contexte spécifique, elle peut aller plus loin. Demandez de « sauter dans le Lab pour l'agent résumeur en mode comparaison » et elle ouvre l'éditeur de cet agent pré-sélectionné sur la vue de comparaison matricielle. La sélection de la route et du mode se fait en une seule action.

### Composer un cockpit personnalisé

Quand Athena veut expliquer quelque chose d'opérationnel — l'état de votre flotte d'agents, un résumé de service connecté, les approbations en attente — elle peut composer un **cockpit** : une grille de widgets sur votre onglet Accueil qui affiche les données directement plutôt que de les déverser en prose dans le chat. Elle assemble les widgets, persiste la spec, vous y navigue, et le panneau confirme avec un éclair du conteneur de cockpit.

Vous pouvez également lui demander explicitement de construire un cockpit : « prépare un tableau de bord montrant mes trois meilleurs agents et toutes les révisions en attente. » Les widgets qui s'avèrent utiles peuvent être épinglés définitivement en un clic.

### Les boutons Radar et Lever du soleil

Deux boutons dans la barre d'outils du compagnon vous donnent un accès en un tap aux deux résumés opérationnels les plus courants d'Athena :

- **Radar** — une revue de flotte. Athena rassemble à l'avance un digest depuis votre magasin d'exécution — santé de l'équipe, progression des objectifs, performance des agents, scores Director — et en fait une analyse dans un tour concentré unique. Utilisez ceci quand vous voulez une lecture honnête de la façon dont toute votre flotte fonctionne.
- **Lever du soleil** — un briefing matinal. Athena résume les dernières 24 heures à travers Messages, Révision humaine et Incidents : combien sont arrivés, ce qui est urgent, ce qui est en retard. Utilisez ceci pour vous orienter au début d'une session.

Les deux boutons contournent le tour de chat pour l'étape de collecte de données — votre clic est le déclencheur, et le résumé revient en streaming dans le panneau comme n'importe quelle autre réponse.

### Raccourcis « Demander à Athena » dans toute l'application

D'autres parties de Personas exposent des boutons **Demander à Athena** qui acheminent le contexte directement vers elle. La carte d'optimisation de la flotte sur Mission Control, les pages d'objectifs, les vues détaillées des messages et d'autres surfaces ont tous ces boutons. Cliquer sur l'un envoie le contexte pertinent comme un tour vocal via le panneau toujours monté — l'orbe apparaît brièvement, accuse réception, et le tour s'exécute en arrière-plan pour que vous restiez sur l'écran où vous étiez.

:::tip
Athena peut appeler vos services connectés directement dans le chat — problèmes Sentry, pull requests GitHub, canaux Slack, fils Gmail. Épinglez un connecteur dans la barre d'outils et elle peut le récupérer dans une tâche en arrière-plan, puis rapporter les résultats dans sa prochaine réponse sans que vous quittiez la conversation.
:::
  `,
};
