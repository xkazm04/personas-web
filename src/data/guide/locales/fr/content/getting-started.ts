export const content: Record<string, string> = {
  "installing-personas": `
## Installer Personas

Installer Personas sur votre ordinateur prend environ une minute. Récupérez l'installateur pour votre système d'exploitation — Windows, macOS ou Linux — depuis la page de téléchargement et exécutez-le. L'installateur est un fichier unique sans assistant de configuration ; double-cliquez, approuvez l'invite de sécurité, et l'application se lance. Les mises à jour sont livrées automatiquement en arrière-plan, vous aurez donc toujours la dernière version sans rien faire.

La première fois que l'application s'ouvre, vous arrivez sur l'écran d'accueil. À partir de là, vous pouvez soit vous lancer directement dans la création d'un agent (Personas vous proposera de configurer un fournisseur d'IA quand vous en aurez besoin), soit ouvrir d'abord le coffre d'identifiants si vous avez déjà des clés API à stocker. Les deux chemins fonctionnent.

:::steps
1. **Téléchargez l'installateur** — choisissez le bon fichier pour votre OS (NSIS \`.exe\` sur Windows, \`.dmg\` sur macOS, \`.AppImage\` ou \`.deb\` sur Linux)
2. **Exécutez l'installateur** — double-clic sur Windows, glisser vers Applications sur macOS, exécution sur Linux
3. **Approuvez les invites de sécurité** — votre OS peut vous demander de confirmer ; c'est normal pour les nouveaux logiciels de bureau
4. **Lancez Personas** — l'écran d'accueil s'ouvre avec une visite guidée que vous pouvez suivre ou ignorer
5. **Optionnel : connectez un fournisseur** — collez une clé API sur la page Connexions si vous voulez être prêt à construire immédiatement
:::

:::info
Fonctionne sur **Windows 10+**, **macOS 12+**, et la plupart des distributions **Linux** modernes. L'installateur Windows est un fichier NSIS \`.exe\` de 53 Mo ; le binaire fourni fait environ 90 Mo après installation. Les mises à jour automatiques sont uniquement en delta, elles sont donc généralement beaucoup plus petites.
:::

:::tip
Si vous rencontrez un avertissement Windows SmartScreen ou macOS Gatekeeper, c'est votre OS qui est prudent avec les nouveaux logiciels. Approuvez-le et vous êtes prêt — l'installateur est signé par code.
:::
  `,

  "creating-your-first-agent": `
## Créer votre premier agent

Votre premier agent prend environ cinq minutes, d'une page blanche à un assistant fonctionnel. Vous avez deux chemins : **partir d'un modèle** (recommandé pour votre premier agent — le moteur de construction assemble une configuration fonctionnelle à partir de vos réponses) ou **partir de zéro** (contrôle manuel complet). Les deux mènent au même endroit : un agent que vous pouvez exécuter.

Si vous choisissez le chemin par modèle, le moteur de construction lance une session interactive. Il pose des questions de clarification par lots ("quel type d'entrée attendez-vous ?", "où la sortie doit-elle aller ?", "à quelle fréquence cela doit-il s'exécuter ?"), propose des paramètres en fonction de vos réponses et affiche un aperçu en direct de l'agent qu'il s'apprête à construire. Vous approuvez à la fin, et l'agent est prêt à être testé.

Si vous choisissez le chemin à partir de zéro, vous rédigez le prompt vous-même, choisissez le modèle d'IA, attachez les outils nécessaires, et enregistrez.

:::steps
1. **Ouvrez la page Agents** — barre latérale → Agents, ou appuyez sur \`Ctrl+1\` pour y accéder
2. **Cliquez sur Créer un agent** — choisissez un chemin : prenez un modèle, ou commencez vide
3. **Répondez aux questions de construction (chemin par modèle)** — le moteur de construction regroupe les questions de clarification par capacité et affiche un aperçu en direct au fur et à mesure que vos réponses façonnent l'agent
4. **Ajustez le prompt et les outils** — affinez les instructions produites par le modèle (ou rédigez-les à partir de zéro)
5. **Promouvez quand vous êtes prêt** — fait passer l'agent du brouillon à actif ; les vérifications de statut de configuration s'exécutent automatiquement pour signaler tout identifiant non connecté ou tout déclencheur non configuré avant de pouvoir promouvoir
:::

### Comment ça marche

Le chemin par modèle est le moyen le plus rapide d'obtenir un *bon* agent (les modèles sont conçus et testés par nous), mais vous le dépasserez. Une fois que vous aurez livré quelques agents basés sur des modèles, vous commencerez à rédiger les prompts directement et à considérer les modèles comme des points de départ plutôt que des solutions complètes.

:::tip
Ne vous souciez pas de perfectionner votre premier agent. L'historique des versions (abordé plus loin) signifie que vous pouvez expérimenter librement — chaque sauvegarde est un point de contrôle vers lequel vous pouvez revenir.
:::
  `,

  "understanding-the-interface": `
## Comprendre l'interface

L'interface de Personas comporte trois régions principales. La **barre latérale** à gauche est votre navigation de premier niveau — Accueil, Vue d'ensemble, Agents, Événements, Connexions, Modèles, Plugins, Plannings, Pipeline, Déploiement et Paramètres. Cliquez sur une section de premier niveau et une navigation de second niveau apparaît, affichant ses sous-pages (par ex., cliquer sur Agents révèle Tous les agents, ainsi que les onglets Éditeur pour l'agent actuellement sélectionné : Prompt, Connecteurs, Lab, Activité, Santé, Paramètres).

La zone centrale est l'**espace de travail** où tout se passe réellement — édition de prompts, observation des exécutions, navigation dans le catalogue d'identifiants. La **barre de titre** en haut contient la cloche de notification (cliquez pour le détail d'exécution le plus frais), l'accès au cockpit ("Parler à Athena") et la recherche globale. La **bande inférieure** affiche les exécutions actives et tout événement système urgent.

| Région | Ce qu'elle fait |
|------|-------------|
| Barre latérale niveau 1 | Sections de premier niveau — Accueil, Vue d'ensemble, Agents, Événements, Connexions, Modèles, Plugins, Plannings, Pipeline, Déploiement, Paramètres |
| Barre latérale niveau 2 | Sous-navigation contextuelle pour la section active |
| Espace de travail | L'éditeur / navigateur / tableau de bord principal pour la section sur laquelle vous êtes |
| Barre de titre | Cloche de notification, raccourci cockpit, recherche globale, contrôles d'application |
| Bande inférieure | Exécutions actives, statut système |

### Comment ça marche

La plupart de ce que vous faites se produit en cliquant sur un élément de la barre latérale et en éditant dans l'espace de travail. La cloche de notification de la barre de titre est le seul raccourci universel à mémoriser — elle ouvre toujours le détail d'exécution le plus récent, peu importe où vous êtes. Le raccourci cockpit ("Parler à Athena") ouvre un chat dans l'application avec le compagnon qui peut vous aider à construire, déboguer ou simplement répondre à des questions sur votre configuration.

:::tip
Survolez n'importe quelle icône de barre latérale pour voir une infobulle avec le raccourci clavier. \`Ctrl+1\` à \`Ctrl+9\` sautent directement aux sections de premier niveau, et \`Ctrl+K\` ouvre la recherche globale pour que vous puissiez trouver n'importe quoi par son nom.
:::
  `,

  "what-is-an-ai-agent": `
## Qu'est-ce qu'un agent IA ?

Un agent IA est un modèle d'IA configuré avec un travail. Vous lui donnez des instructions ("lis mes e-mails non lus et résume les importants"), vous lui indiquez quels outils il peut utiliser, et vous le déclenchez — manuellement avec un bouton, sur une planification, sur un événement, ou comme étape dans un pipeline. L'agent lit la charge utile du déclencheur, suit vos instructions, appelle les outils dont il a besoin et produit une sortie. Contrairement à un chatbot, l'agent agit : envoie l'e-mail, écrit le fichier, publie sur Slack.

Chaque agent dans Personas est durable — il se souvient de sa configuration, de son historique, de ses identifiants et (optionnellement) des mémoires des exécutions passées. Vous pouvez le cloner, contrôler la version de son prompt, l'exécuter dans une arène contre des prompts alternatifs pour voir lequel fonctionne le mieux, et l'enchaîner à d'autres agents pour construire des flux de travail multi-étapes.

:::compare
**Chatbot**
Vous tapez une question, il répond. Chaque tour est ponctuel. Utile pour des recherches rapides, le brainstorming, la rédaction. Pas d'actions, pas de mémoire entre les sessions, pas d'automatisation.
---
**Agent IA** [recommended]
Une configuration persistante avec un travail. Déclenchée manuellement ou automatiquement ; utilise des outils pour agir ; possède un prompt sous contrôle de version, des identifiants attachés, un historique d'exécution et un indicateur de santé. Le modèle est le moteur, mais l'agent est tout l'assemblage autour.
:::

### Comment ça marche

:::diagram
[Le déclencheur se déclenche] --> [L'agent lit l'entrée] --> [Modèle + outils s'exécutent] --> [Sortie distribuée]
:::

Le déclencheur emballe une charge utile d'entrée (un corps de webhook, une chaîne de presse-papiers, un chemin de fichier, un événement d'un autre agent…). L'agent lit son prompt, l'alimente au modèle d'IA avec l'entrée, et laisse le modèle appeler les outils attachés selon les besoins. La sortie finale est distribuée via le canal de sortie que vous avez configuré — retour à une UI, écrit dans un fichier, publié sur Slack, ou enchaîné comme entrée à l'agent suivant.

:::tip
Le moyen le plus rapide de comprendre les agents est de regarder vos tâches hebdomadaires répétitives et de vous demander : "pourrait-on déclencher, instruire et automatiser cela ?" Si oui, cette tâche est un agent.
:::
  `,

  "running-your-first-automation": `
## Exécuter votre première automatisation

Une fois que vous avez créé un agent, vous avez plusieurs façons de le démarrer. La plus simple est le bouton **Exécuter** manuel en haut de l'éditeur d'agent — cliquez dessus et vous verrez le flux d'exécution en direct dans le panneau d'activité. En quelques secondes (ou quelques minutes pour les fournisseurs plus lents ou les prompts plus longs), la sortie apparaît.

Pour le travail répétitif, ajoutez un déclencheur planifié, un déclencheur webhook, un déclencheur de surveillance de fichiers ou un déclencheur en chaîne pour que l'agent s'exécute tout seul. Vous configurez le déclencheur une fois, l'agent fait le reste.

:::steps
1. **Ouvrez l'agent** — trouvez-le sur la page Agents ; l'éditeur s'ouvre avec l'onglet Prompt en focus
2. **Cliquez sur Exécuter** — l'espace de travail bascule automatiquement vers l'onglet Activité ; vous voyez le prompt en cours de construction, l'appel au modèle qui sort, et les tokens qui reviennent en streaming
3. **Observez le flux en direct** — chaque agent a son propre flux pour que vous puissiez en exécuter plusieurs en parallèle sans confusion
4. **Examinez la sortie** — la ligne d'activité se développe pour montrer le prompt complet, la réponse du modèle, tous les appels d'outils effectués, la durée et le coût
5. **Itérez** — changez le prompt ou les paramètres, sauvegardez, réexécutez ; chaque exécution est mise en point de contrôle
:::

### Comment ça marche

Une exécution est une exécution unique : déclencheur → construction du prompt → appel au modèle → appels d'outils → sortie. Chaque étape est capturée dans la trace d'exécution, et l'exécution arrive dans l'onglet Activité de la page Vue d'ensemble (la vue globale sur tous les agents) et dans l'onglet Activité de l'agent lui-même. Depuis l'un ou l'autre endroit, vous pouvez cliquer sur l'exécution pour le modal de détail complet.

Si une exécution échoue (erreur de modèle, identifiant expiré, problème réseau), l'indicateur de santé de l'agent passe au jaune ou au rouge et l'échec est préservé dans la trace pour que vous puissiez déboguer.

:::tip
Votre première exécution est en partie destinée à apprendre ce que votre prompt fait réellement en pratique. Si la sortie n'est pas ce que vous vouliez, la trace vous montre exactement ce que le modèle a reçu — généralement la solution est de clarifier ou de contraindre le prompt plutôt que de réessayer.
:::
  `,

  "choosing-your-ai-provider": `
## Choisir votre fournisseur d'IA

Personas prend en charge les principaux fournisseurs d'IA — **Anthropic** (famille Claude), **OpenAI** (famille GPT), **Google** (Gemini) et les **modèles locaux** via Ollama ou tout point de terminaison compatible OpenAI. Vous pouvez également configurer des fournisseurs personnalisés dans Paramètres → Modèles personnalisés. Chaque agent choisit son fournisseur/modèle indépendamment, vous pouvez donc exécuter des modèles bon marché pour le travail de routine et réserver les coûteux pour les tâches qui en ont besoin.

Connectez un fournisseur une fois sur la page Connexions (vous collerez une clé API — chiffrée dans le coffre local — ou passerez par OAuth pour les fournisseurs qui le prennent en charge). Après cela, le sélecteur de modèle de chaque agent affiche les fournisseurs configurés et leurs modèles.

:::compare
**Anthropic Claude** [recommended]
Forte suivie d'instructions, raisonnement à long contexte, sortie structurée. Sonnet 4.6 est le modèle par défaut pour les nouveaux agents. Modèles Opus pour le raisonnement le plus difficile, Haiku pour la vitesse/coût. Excellent dans les boucles d'utilisation d'outils.
---
**OpenAI GPT**
L'écosystème le plus large et le plus testé pour de nombreux cas d'utilisation. Solide polyvalent ; les modèles de classe GPT-4o sont forts pour le travail d'assistant général.
---
**Google Gemini**
Multimodal, grandes fenêtres de contexte, faible latence pour le premier token. Fort pour les agents de recherche / traitement de documents.
---
**Local (Ollama / compatible OpenAI)**
S'exécute sur votre machine — aucune donnée ne quitte l'appareil. Modèles plus petits, mais pour le travail à faible enjeu ou privé, le compromis en vaut souvent la peine.
:::

### Comment ça marche

Une fois que plusieurs fournisseurs sont connectés, Personas peut effectuer un basculement automatique au niveau de l'agent : si votre fournisseur principal renvoie des erreurs au-dessus d'un seuil, la prochaine exécution de l'agent utilise le fournisseur de secours configuré. Quand le principal récupère, la rotation normale reprend. Cela se configure par agent dans Éditeur → onglet Paramètres.

Pour le suivi des coûts, chaque exécution est marquée avec le fournisseur, le modèle et le nombre de tokens, afin que l'onglet Vue d'ensemble → Utilisation puisse décomposer les dépenses par fournisseur, modèle ou agent.

### En action

:::usecases
**Stratégie modèle par agent**
Vos agents ont des besoins différents
---
L'agent de revue de code utilise Claude Opus (meilleur raisonnement) ; le résumeur d'e-mails utilise Haiku (rapide et bon marché) ; un agent personnel/privé s'exécute localement sur Ollama.
===
**Basculement en cas de panne de fournisseur**
Un fournisseur a une panne régionale
---
Les agents affectés sont automatiquement routés vers le fournisseur de secours configuré ; l'onglet Santé affiche quels agents fonctionnent en secours et fait remonter la récupération une fois que le principal revient.
===
**Réduction des coûts**
Les dépenses mensuelles d'IA augmentent progressivement
---
Vue d'ensemble → Utilisation montre quels agents et modèles dominent les dépenses. Faites passer les agents les plus coûteux à un niveau moins cher (Sonnet → Haiku, GPT-4o → GPT-4o-mini) ; le Lab peut les comparer en A-B d'abord pour confirmer que la qualité tient.
:::

:::info
Le fournisseur par défaut pour les nouveaux agents est défini dans Paramètres → Moteur. Vous pouvez le remplacer sur chaque agent.
:::

:::tip
La plupart des fournisseurs offrent des crédits d'essai gratuits. Connectez-en deux ou trois et exécutez le même prompt contre chacun dans l'arène du Lab — vous ressentirez les différences de personnalité et choisirez un défaut qui correspond à votre style.
:::
  `,

  "starter-vs-team-vs-builder-tiers": `
## Niveaux Starter, Team et Builder

Personas est livré en trois niveaux. **Starter** est gratuit, local uniquement, et suffisant pour construire de vrais agents et apprendre le système. **Team** ajoute des fonctionnalités de collaboration, le déploiement cloud et le laboratoire de tests complet. **Builder** débloque les surfaces les plus avancées — orchestration complète de pipelines, évolution génomique pour l'optimisation des prompts, et BYOI (apportez votre propre infrastructure) pour le déploiement cloud sur votre propre passerelle.

Vous pouvez changer de niveau à tout moment. Les agents existants restent intacts lorsque vous rétrogradez ; les fonctionnalités verrouillées par niveau sont désactivées jusqu'à ce que vous mettiez à niveau à nouveau. Aucun agent ni identifiant n'est jamais supprimé.

:::compare
**Starter (gratuit)**
Jusqu'à 5 agents. Déclencheurs manuels + planifiés + presse-papiers. Exécution locale uniquement. Lab basique (exécutions de prompts uniques, pas d'arène). Mono-utilisateur. Parfait pour l'apprentissage et l'automatisation personnelle.
---
**Team**
Agents illimités. Tous les types de déclencheurs y compris webhooks et surveillances de fichiers. Déploiement cloud via l'orchestrateur géré. Lab complet (arène, A-B, grille eval). Agents partagés en équipe. Support prioritaire.
---
**Builder** [recommended]
Tout ce qui est dans Team plus les pipelines avancés (routage conditionnel, mémoire d'équipe), l'évolution génomique (optimisation automatique des prompts à partir de l'historique d'exécution), et le déploiement cloud BYOI (hébergez l'orchestrateur vous-même).
:::

### Comment ça marche

Ouvrez Paramètres → Compte pour voir votre niveau actuel, votre utilisation par rapport aux limites du niveau et le chemin de mise à niveau. Les mises à niveau s'activent immédiatement ; les rétrogradations prennent effet au prochain cycle de facturation pour que vous ne perdiez pas l'accès en cours de période.

:::tip
Commencez sur Starter. Au moment où vous atteignez une limite de nombre d'agents ou vous voulez un déclencheur webhook, vous avez trouvé un vrai cas d'utilisation pour passer au niveau supérieur — et vous saurez exactement quelles fonctionnalités amortissent le coût.
:::
  `,

  "system-requirements": `
## Configuration système requise

Personas est une application de bureau Tauri — backend Rust, frontend React, base de données SQLite locale — et elle est intentionnellement légère. La majeure partie du calcul lourd se produit sur les serveurs du fournisseur d'IA, pas sur votre machine. L'application est inactive à un CPU proche de zéro et utilise quelques centaines de mégaoctets de RAM ; elle monte en puissance uniquement lorsque les agents s'exécutent activement en local.

Le binaire fourni fait environ 90 Mo après installation. Les plugins (Artist pour la génération d'images, Obsidian Brain pour la recherche vectorielle) peuvent ajouter à cette empreinte si vous les activez.

:::checklist
- Windows 10+, macOS 12+, ou Ubuntu 20.04+ (dernière version recommandée)
- 4 Go de RAM minimum (8 Go+ recommandés si vous utilisez les plugins d'embeddings / recherche vectorielle)
- 1 Go d'espace disque libre (plus si vous activez les modèles locaux du plugin Artist)
- Haut débit stable — l'exécution d'agents est limitée par la latence de l'API du fournisseur d'IA
- Tout CPU dual-core moderne ; quad-core ou mieux recommandé pour les exécutions multi-agents parallèles
:::

### Comment ça marche

L'application stocke sa base de données (\`personas.db\`), son coffre d'identifiants, son historique d'exécution et sa configuration localement dans le répertoire de données d'application spécifique à votre OS. Rien n'est téléchargé sauf si vous activez explicitement le déploiement cloud ou utilisez un fournisseur d'IA cloud. Les plugins qui livrent des modèles locaux (par ex., génération d'images + vision Gemini du plugin Artist) téléchargent les fichiers de modèle à la première utilisation.

La version Windows utilise ONNX Runtime pour l'embedding lorsque la fonctionnalité base de connaissances vectorielle est activée ; c'est la plus grande dépendance unique dans ce cas.

:::tip
Si vous sentez l'application lente pendant une exécution multi-agents, ouvrez l'onglet Santé — il affiche quels agents et quelles dépendances (appels de modèle, appels d'outils, inférence ONNX) contribuent à la charge.
:::
  `,

  "keyboard-shortcuts-and-tips": `
## Raccourcis clavier et astuces

Quelques raccourcis clavier couvrent la plupart des frictions dans l'application. \`Ctrl+K\` ouvre la recherche globale (trouvez n'importe quel agent, page ou paramètre par son nom). \`Ctrl+1\`–\`Ctrl+9\` sautent aux sections de premier niveau de la barre latérale. \`Ctrl+Enter\` exécute l'agent focalisé. \`Ctrl+N\` ouvre le flux de création d'agent.

Vous pouvez personnaliser n'importe quelle liaison dans Paramètres → Apparence → Raccourcis clavier ; les valeurs par défaut suivent les conventions de l'OS lorsque c'est possible.

### Raccourcis essentiels

:::keys
Ctrl+K — Recherche globale (trouver n'importe quoi par nom)
Ctrl+N — Créer un nouvel agent
Ctrl+Enter — Exécuter l'agent focalisé
Ctrl+S — Enregistrer les modifications dans l'éditeur actuel
Ctrl+/ — Basculer la barre latérale ouverte/fermée
Ctrl+, — Ouvrir les Paramètres
Ctrl+? — Afficher la fiche des raccourcis clavier
:::

### Raccourcis de navigation

:::keys
Ctrl+1 — Accueil
Ctrl+2 — Vue d'ensemble
Ctrl+3 — Agents
Ctrl+4 — Événements
Ctrl+5 — Connexions
Ctrl+6 — Modèles
Ctrl+7 — Plugins
Ctrl+Shift+P — Ouvrir la palette de commandes (exécuter n'importe quelle action par nom)
:::

### Comment ça marche

La palette de commandes (\`Ctrl+Shift+P\`) est la surface utilisateur avancé. Tapez un verbe (\`run\`, \`clone\`, \`disable\`, \`open\`) plus le nom de la cible, et la palette affiche les actions correspondantes dans tout votre espace de travail. C'est plus rapide que la navigation manuelle une fois que vous connaissez les noms des choses.

:::tip
Commencez avec \`Ctrl+K\`. Tapez quelques lettres d'un nom d'agent et appuyez sur Entrée — ce seul raccourci couvre peut-être 60 % de la navigation quotidienne.
:::
  `,

  "where-to-get-help": `
## Où obtenir de l'aide

Vous n'êtes jamais bloqué. L'**aide intégrée** est le chemin le plus rapide : le chat cockpit ("Parler à Athena" dans la barre de titre) est un compagnon alimenté par LLM qui connaît votre configuration, vos exécutions récentes et le produit. Posez-lui des questions en langage clair et il peut également proposer des changements de configuration, vous diriger vers le bon onglet, ou ouvrir une session de débogage sur une exécution défaillante.

Pour les choses auxquelles le compagnon intégré ne peut pas répondre, le **guide** (ce site) est la référence détaillée, le **Discord communautaire** est l'endroit où vous demandez à d'autres utilisateurs et à l'équipe, et le **support par e-mail** est pour les problèmes de compte ou de facturation.

| Ressource | Idéal pour | Temps de réponse |
|----------|----------|---------------|
| Cockpit / Athena (intégré) | Questions de configuration, débogage, "où est X ?" | Instantané |
| Ce guide | Référence des fonctionnalités et procédures | Instantané |
| Site de documentation | Architecture, schéma, intégrations avancées | Instantané |
| Communauté Discord | Astuces, recettes, "est-ce que quelqu'un d'autre voit…?" | Minutes |
| E-mail de support | Compte, facturation, sécurité | Heures |
| Tutoriels vidéo | Visites visuelles des flux clés | Instantané |

### Comment ça marche

Le cockpit a accès à une doctrine — un corpus de connaissances curé sur le produit — et à votre état local (anonymisé). Il peut rechercher dans vos exécutions, recommander des changements, et même composer des cartes UI en ligne pour vous guider à travers une correction étape par étape. S'il ne peut pas répondre, il suggérera la bonne ressource externe.

:::tip
Pour les questions "je pense que quelque chose est cassé", ouvrez d'abord Athena et demandez "diagnostique la dernière exécution défaillante de l'agent X". Le flux de débogage du cockpit est conçu pour cela et surpasse généralement la lecture manuelle des journaux.
:::
  `,
};
