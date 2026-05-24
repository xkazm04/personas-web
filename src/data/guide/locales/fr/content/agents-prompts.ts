export const content: Record<string, string> = {
  "creating-a-new-agent": `
## Créer un nouvel agent

Vous avez deux façons de créer un nouvel agent. **À partir de zéro** — cliquez sur \`Créer un agent\`, nommez-le et rédigez les instructions vous-même. **À partir d'un modèle** — parcourez la galerie de modèles, choisissez-en un qui correspond à ce que vous voulez faire (traitement de factures, rapports quotidiens, publication sociale...), répondez à quelques courtes questions sur votre cas d'utilisation spécifique, et laissez le moteur de construction assembler l'agent pour vous. La plupart des gens commencent par un modèle et l'ajustent à partir de là.

Dans les deux cas, vous choisirez un nom et une icône, sélectionnerez le modèle d'IA qui alimente l'agent, et choisirez les outils (e-mail, recherche web, accès aux fichiers, etc.) qu'il peut utiliser. Aucun de ces choix n'est permanent — vous pouvez changer n'importe quel paramètre plus tard.

:::steps
1. **Cliquez sur Créer un agent** — depuis la barre latérale ou l'écran d'accueil
2. **Choisissez un chemin** — commencez vide, ou choisissez un modèle dans la galerie
3. **Répondez aux questions de construction** — si vous avez choisi la voie du modèle ; le moteur de construction adapte l'agent à vos réponses
4. **Nommez votre agent** — et choisissez une icône
5. **Ajustez le prompt et les outils** — affinez les instructions produites par le modèle (ou rédigez-les à partir de zéro)
6. **Promouvez quand vous êtes prêt** — l'agent passe du brouillon à actif une fois que vous confirmez
:::

### Comment ça marche

Le chemin par modèle exécute une session de construction interactive : le moteur pose des questions de clarification sur votre cas d'utilisation, propose des paramètres (forme d'entrée, canaux de sortie, cadence de planification) et affiche un aperçu en direct de l'agent qu'il s'apprête à assembler. Vous approuvez à la fin, et l'agent est prêt à tester. Le chemin à partir de zéro saute tout cela — utile quand vous savez déjà exactement ce que vous voulez que l'agent fasse.

:::tip
Les bons noms d'agents décrivent la tâche, pas la technologie. "Résumé des e-mails du matin" est plus utile que "Agent GPT 3".
:::
  `,

  "writing-effective-prompts": `
## Rédiger des prompts efficaces

Un prompt est l'ensemble d'instructions que vous donnez à votre agent. Les bons prompts sont spécifiques, concrets et ordonnés : définissez le rôle de l'agent, énoncez la tâche, décrivez la forme d'entrée, spécifiez le format de sortie et signalez les cas limites. Les prompts vagues produisent des sorties vagues — "résume mes e-mails" fonctionne beaucoup moins bien que "lis mes cinq e-mails non lus les plus récents et écris un résumé de deux phrases pour chacun, classé par importance de l'expéditeur".

Le moteur de construction vous aide ici. Quand vous adoptez un modèle, le moteur pose des questions de clarification par lots par capacité (source d'entrée, canal de sortie, format, fréquence) et tisse vos réponses dans un prompt structuré. Si vous rédigez à partir de zéro, vous faites ce tissage vous-même — mais ce sont les mêmes cinq entrées qui produisent des agents fiables.

### Liste de vérification de qualité du prompt

:::checklist
- Définir le rôle — "Tu es un X qui fait Y." Ancre le comportement du modèle.
- Énoncer la tâche concrètement — verbes, comptes, fenêtres temporelles. Évitez "aide-moi avec…"
- Décrire l'entrée — quelle forme, quels champs, ce que l'agent devrait ignorer
- Spécifier la sortie — puces vs paragraphes vs JSON, avec les noms de champs si structuré
- Gérer les cas limites — que faire quand l'entrée est vide, malformée ou inattendue
- Utilisez des exemples — même une paire entrée/sortie améliore considérablement la cohérence
:::

### Comment ça marche

Chaque exécution construit le prompt à partir de votre modèle stocké, de la charge utile du déclencheur et de toute mémoire d'agent que le modèle est autorisé à consulter. Le modèle voit le même prompt que vous avez rédigé (dans l'ordre où vous l'avez rédigé) plus l'entrée — ce qui revient est sa tentative honnête de suivre vos instructions. L'onglet trace dans le détail d'exécution affiche le prompt exact qui a été envoyé, donc quand la sortie dérive, vous pouvez voir si le prompt ou l'entrée est en cause.

:::tip
Rédigez le prompt comme si vous briefiez un sous-traitant intelligent mais flambant neuf. Ne supposez rien. La première fois que l'agent produit une sortie, regardez la trace et demandez-vous : "un sous-traitant humain aurait-il compris ce que je voulais à partir de ce prompt ?"
:::
  `,

  "simple-vs-structured-prompt-mode": `
## Mode prompt simple vs structuré

L'éditeur de prompt offre deux modes. Le **mode simple** est une zone de texte libre unique — vous tapez le prompt comme un bloc de prose. Rapide pour les agents petits ou expérimentaux. Le **mode structuré** divise le prompt en cinq sections nommées (Identité, Instructions, Outils, Exemples, Gestion d'erreurs) pour que vous puissiez réfléchir à chaque préoccupation séparément et modifier l'une sans affecter les autres.

Vous pouvez passer d'un mode à l'autre à tout moment sans perdre votre travail. L'éditeur analyse la prose du mode simple en sections structurées quand vous passez vers le haut, et concatène les sections structurées en un seul bloc quand vous passez vers le bas.

:::compare
**Mode simple**
Zone de texte unique. Prose libre. Rapide à rédiger, rapide à itérer. Idéal pour l'expérimentation et les agents personnels où vous êtes le seul lecteur.
---
**Mode structuré** [recommended for shared/production agents]
Cinq sections nommées — Identité, Instructions, Outils, Exemples, Gestion d'erreurs. Plus lent à rédiger mais plus facile à maintenir. Chaque section peut être examinée et modifiée indépendamment, ce qui compte quand vous (ou quelqu'un d'autre) revient sur l'agent des mois plus tard.
:::

:::info
Les deux modes produisent le même prompt en arrière-plan à l'exécution. Le mode structuré est une surcouche UX qui vous aide à organiser votre pensée ; le modèle voit le prompt rendu dans les deux cas.
:::

### Comment ça marche

Le changement de mode est non destructif : l'éditeur stocke la représentation structurée en interne, et le mode simple est une vue aplatie de celle-ci. L'historique des versions préserve le mode dans lequel vous avez sauvegardé, donc restaurer une ancienne version ramène également le mode dans lequel elle a été créée.

:::tip
Commencez en mode simple pendant que vous découvrez ce que l'agent devrait faire. Une fois satisfait du comportement, passez en mode structuré pour le long terme — il rentabilise dès la première fois où vous devez ajuster uniquement la section Exemples sans relire tout le prompt.
:::
  `,

  "structured-prompt-sections-explained": `
## Sections du prompt structuré expliquées

Le mode structuré divise le prompt en cinq sections. Chacune a un travail spécifique, et le moteur de construction utilise les mêmes cinq compartiments quand il génère des prompts à partir de modèles — les sections ne sont donc pas une bizarrerie d'UI, ce sont un contrat stable entre votre rédaction et la façon dont le modèle voit l'agent.

### Les cinq sections

:::diagram
[Identité] --> [Instructions] --> [Outils] --> [Exemples] --> [Gestion d'erreurs]
:::

- **Identité** — qui est l'agent. Rôle, personnalité, domaine d'expertise, style de communication. La ligne "tu es un…".
- **Instructions** — ce que fait l'agent, étape par étape. La tâche principale et toutes les sous-tâches, dans l'ordre où elles doivent se produire.
- **Outils** — quelles capacités l'agent utilise et comment les utiliser. Quand appeler quel outil, quels arguments comptent, que faire des résultats.
- **Exemples** — paires entrée/sortie qui montrent à quoi ressemble du "bon". La section unique la plus sous-utilisée et l'une des plus impactantes — un bon exemple bat trois phrases d'instruction supplémentaires.
- **Gestion d'erreurs** — que faire quand l'entrée est manquante, malformée ou inattendue. Où s'arrêter, que réessayer, que faire remonter à une revue manuelle.

### Comment ça marche

Le rendu concatène les sections dans l'ordre indiqué, avec des délimiteurs clairs. Certains modèles accordent plus d'attention aux sections initiales ; l'ordre est conçu pour placer le rôle et la tâche principale en premier, avec les exemples et la gestion d'erreurs en bas où ils sont toujours dans le contexte mais ne diluent pas l'essentiel. Si vous utilisez les prompts structurés pour la première fois, remplissez Identité et Instructions immédiatement et laissez les autres vides — le modèle fonctionnera bien, et vous pourrez ajouter Exemples / Gestion d'erreurs à mesure que les cas limites apparaissent.

:::tip
Quand un agent commence à produire des échecs de cas limites, regardez la trace et demandez-vous : "aurais-je pu empêcher cela avec un exemple ?" La plupart des problèmes "l'agent est mauvais à X" sont vraiment "je ne lui ai jamais montré à quoi ressemble un bon X".
:::
  `,

  "agent-settings-and-limits": `
## Paramètres et limites de l'agent

L'onglet Paramètres de l'éditeur d'agent est l'endroit où vous mettez des garde-fous. Chaque agent a des limites sur la durée d'exécution, le coût par exécution, le nombre de tours de modèle qu'il peut prendre et le nombre de copies pouvant s'exécuter en parallèle. Les valeurs par défaut sont conservatrices — assez pour permettre un vrai travail, assez basses pour qu'un agent mal comporté ne puisse pas accumuler une facture avant que vous ne le remarquiez.

Les limites sont particulièrement importantes pour les agents sans surveillance (planifiés, déclenchés par webhook, déclenchés en chaîne). Les exécutions manuelles vous les voyez se produire ; les exécutions planifiées non, donc un prompt incontrôlé pourrait se déclencher toutes les heures pendant une semaine avant que vous ne vérifiiez.

### Paramètres clés

- **Timeout** — temps total d'horloge avant que l'exécution ne soit tuée. Par défaut 2 minutes, augmentez pour les modèles lents ou les longues chaînes d'utilisation d'outils.
- **Plafond budgétaire** — coût maximum par exécution, évalué par rapport au compteur de coût en direct ; l'exécution s'arrête gracieusement lorsqu'elle dépasse le plafond.
- **Tours maximum** — nombre d'aller-retours modèle ↔ outil autorisés en une exécution. Empêche les boucles d'appels d'outils où le modèle ne converge jamais.
- **Concurrence** — combien d'exécutions parallèles de cet agent sont autorisées. Définissez à 1 pour les agents avec état (afin qu'ils ne se chevauchent pas sur la même entrée) ; augmentez pour le travail par lots parallèle.
- **Accès mémoire** — si l'agent lit dans son magasin de mémoire à l'exécution (par défaut activé pour les agents qui ont les mémoires activées).
- **Fournisseur de basculement** — fournisseur d'IA alternatif à utiliser quand le principal renvoie des erreurs au-dessus d'un seuil. Définissez-le sur les agents dont vous vous souciez du temps de fonctionnement.

### Comment ça marche

Les limites sont appliquées par le moteur d'exécution, pas par le modèle. Quand une exécution atteint une limite, elle s'arrête proprement — la trace partielle est préservée, l'exécution est marquée avec la raison (\`timeout\`, \`budget_exceeded\`, \`turns_exceeded\`), et aucune charge ou mutation d'état ne persiste pour la portion coupée. L'onglet Santé fait remonter les arrêts par limite comme avertissements pour que vous puissiez décider d'augmenter la limite ou de corriger le prompt sous-jacent.

:::tip
Commencez avec des limites conservatrices sur chaque nouvel agent. Le moment le moins cher pour découvrir un prompt incontrôlé est la troisième exécution manuelle, pas la troisième exécution planifiée de nuit.
:::
  `,

  "assigning-tools-to-agents": `
## Attribuer des outils aux agents

Les outils sont comme des applications sur un téléphone — votre agent ne peut utiliser que ceux que vous installez. En attribuant des outils spécifiques, vous contrôlez exactement ce que votre agent peut faire. Un agent avec accès à l'e-mail peut lire et envoyer des messages ; un avec recherche web peut chercher des choses en ligne.

:::warning
C'est aussi une fonctionnalité de sécurité. Un agent ne peut pas modifier accidentellement des fichiers s'il n'a pas accès aux fichiers, et il ne peut pas envoyer d'e-mails s'il n'a pas d'outils e-mail. Vous gardez toujours le contrôle de ce que vos agents peuvent et ne peuvent pas toucher.
:::

### Types d'outils disponibles

- **E-mail** — lire, rédiger et envoyer des messages e-mail
- **Recherche web** — rechercher des informations sur Internet
- **Accès aux fichiers** — lire et écrire des fichiers sur votre ordinateur ou stockage cloud
- **Appels API** — interagir avec des services externes et des bases de données
- **Presse-papiers** — lire depuis et écrire dans votre presse-papiers
- **Canaux de messagerie** — envoyer les résultats à Slack, Discord, Teams, ou tout point de terminaison webhook générique dans le cadre de la sortie de l'agent

### Comment attribuer des outils

:::steps
1. **Ouvrez l'onglet Connecteurs** — sur l'éditeur d'agent ; il affiche toutes les capacités dont votre agent a besoin par rapport à votre coffre
2. **Choisissez une catégorie, pas un service spécifique** — choisissez "e-mail" ou "stockage cloud" et le sélecteur affiche les identifiants correspondants que vous avez déjà plus les connecteurs suggérés si vous n'en avez pas
3. **Autorisez tout nouveau** — pour les services OAuth, vous cliquerez à travers un écran de consentement unique ; l'identifiant résultant arrive dans votre coffre et est réutilisable entre les agents
4. **Vérification pré-vol** — avant que vous ne promouviez l'agent, le moteur de construction recoupe chaque capacité requise par rapport au coffre et signale tout ce qui manque
5. **Enregistrez la configuration** — l'agent utilise les outils attribués lors de sa prochaine exécution ; si un identifiant expire plus tard, vous le verrez dans l'indicateur de santé de l'agent
:::

:::tip
N'attribuez que les outils dont votre agent a réellement besoin. Moins d'outils signifie moins de choses qui peuvent mal tourner, et votre agent reste concentré sur son travail.
:::
  `,

  "prompt-version-history": `
## Historique des versions du prompt

Chaque sauvegarde du prompt d'un agent crée une version immuable. L'historique vit à côté de l'éditeur de prompt sur l'onglet Prompt — ouvrez-le et vous voyez chaque sauvegarde, horodatée, avec le diff par rapport à la version précédente visible en ligne. Il n'y a pas de limite ; la toute première version est préservée indéfiniment.

Le système versionne également automatiquement quand le moteur de construction modifie un prompt (par ex., lors de l'adoption d'un modèle ou de la reconstruction de paramètres), afin que les changements du moteur apparaissent à côté de vos modifications manuelles avec une étiquette claire "généré automatiquement".

### Points clés

- **Instantanés automatiques** à chaque sauvegarde — modifications manuelles et modifications du moteur
- **Restauration en un clic** — choisit n'importe quelle version et en fait le prompt actuel ; la version actuelle est sauvegardée en premier, donc les restaurations ne perdent jamais de données
- **Diff en ligne** — voyez ce qui a changé entre deux versions sans quitter l'onglet
- **Rétention illimitée** — les versions n'expirent jamais et ne sont jamais ramassées par le garbage collector

### Comment ça marche

L'historique est stocké dans la base de données SQLite locale (à côté de l'agent lui-même), il est donc immédiatement consultable et fonctionne hors ligne. Quand vous restaurez une version, l'éditeur passe à celle-ci mais la version précédemment actuelle est également préservée — vous pouvez revenir en arrière sans refaire votre travail.

:::tip
Avant un changement de prompt risqué, faites une sauvegarde sans effet pour que l'état actuel soit mis en point de contrôle dans l'historique. Ensuite, expérimentez librement — restaurer est un clic si l'expérience échoue.
:::
  `,

  "comparing-prompt-versions": `
## Comparer les versions de prompts

Quand le comportement d'un agent change et que vous voulez savoir pourquoi, la vue diff de l'historique des versions montre exactement quels caractères du prompt sont différents entre deux versions. Les ajouts sont surlignés en vert, les suppressions en rouge. C'est le moyen le plus rapide de localiser une régression — vous pouvez généralement voir le changement fautif en quelques secondes.

Le diff respecte également les sections du prompt structuré : si vous comparez deux versions en mode structuré, le diff est segmenté par section pour que vous puissiez ignorer les sections non pertinentes et vous concentrer sur celle qui a changé.

:::code-compare
### Original
Résume les e-mails dans ma boîte de réception.
Donne-moi les points clés.
---
### Amélioré
Lis mes 5 e-mails non lus les plus récents.
Pour chaque e-mail, écris un résumé de 2 phrases
incluant le nom de l'expéditeur et l'action nécessaire.
Formate comme une liste numérotée.
:::

### Points clés

- **Vue côte à côte** — les deux versions visibles à la fois avec surlignage au niveau caractère
- **Diff par section** pour les prompts structurés — sautez directement à la section modifiée
- **Comparer n'importe quelles deux versions** — pas seulement des consécutives ; utile pour "qu'est-ce qui a changé depuis la version fonctionnelle d'il y a trois semaines"
- **Restauration rapide** — restaurez l'une ou l'autre version directement depuis la vue diff

### Comment ça marche

Ouvrez l'historique des versions sur l'onglet Prompt, cochez les cases à côté de deux versions, et cliquez sur Comparer. Le diff se rend dans un panneau côte à côte. Cliquez sur Restaurer de chaque côté pour le rendre actuel ; le diff reste ouvert pour que vous puissiez voir exactement ce que vous avez restauré.

:::tip
Quand vous trouvez le changement fautif dans un diff, copiez la *nouvelle* version (cassée) dans le prompt et continuez à modifier — de cette façon l'historique des versions enregistre votre intention ("essayé X, revenu à Y, puis affiné à Z"). Restaurer sans laisser de trace perd la leçon.
:::
  `,

  "cloning-and-duplicating-agents": `
## Cloner et dupliquer des agents

Le clonage copie la configuration complète d'un agent dans un nouvel agent : prompt (y compris l'historique des versions), outils, déclencheurs, paramètres, indicateurs d'accès à la mémoire, fournisseur de basculement, tout sauf l'état d'exécution (les exécutions, les coûts et les déclencheurs actifs ne sont pas reportés). Le clone est totalement indépendant — les modifications de l'un n'affectent pas l'autre.

L'utilisation la plus courante est le fork d'un agent fonctionnel pour expérimenter en toute sécurité. L'original continue à produire ; le clone est votre bac à sable. Si l'expérience est bonne, vous pouvez soit remplacer l'original, soit garder le clone comme spécialisation.

### Points clés

- **Configuration complète reportée** — prompt, outils, déclencheurs, paramètres, mémoire, basculement
- **L'état d'exécution non** — les exécutions, les coûts, les déclencheurs actifs appartiennent à un seul agent à la fois
- **Les déclencheurs sont clonés mais désactivés** — pour que le clone ne commence pas immédiatement à se déclencher sur le même planning/webhook que l'original
- **Les agents clonés reçoivent un suffixe "(Copie)"** par défaut ; renommez avant de promouvoir

### Comment ça marche

Cliquez avec le bouton droit sur un agent dans la barre latérale ou utilisez le menu à trois points dans la barre d'outils de l'éditeur, et choisissez \`Cloner\`. Le nouvel agent apparaît dans le même groupe avec des déclencheurs désactivés. Réactivez-les délibérément (et mettez à jour leur configuration si vous ne voulez pas que le clone écoute la même URL webhook que l'original, par exemple).

:::tip
Le clonage est le moyen le plus sûr d'effectuer un test A-B sur un changement de prompt sans perturber un agent déjà en production. Faites le changement dans le clone, exécutez les deux dans l'arène du Lab sur les mêmes entrées, et n'échangez l'agent de production qu'une fois que le clone gagne.
:::
  `,

  "agent-groups-and-organization": `
## Groupes d'agents et organisation

Les agents dans la barre latérale sont organisés par groupes — vos propres dossiers pour ranger les choses par équipe, projet, fonction ou tout ce que vous trouvez utile. Vide par défaut ; vous ajoutez des groupes à mesure que votre collection grandit et que la liste plate cesse d'évoluer correctement.

La barre latérale prend également en charge les groupes imbriqués (un niveau d'imbrication), le réordonnement par glisser-déposer, l'état de réduction/expansion qui persiste entre les sessions, et les icônes par groupe pour une reconnaissance visuelle rapide.

### Points clés

- **Créez des groupes** selon les besoins — pas de limite sur le nombre
- **Glisser pour réorganiser** — déposez un agent sur un groupe pour le déplacer, ou réorganisez la liste en déposant entre les frères et sœurs
- **Icônes et couleurs par groupe** — choisissez une icône qui suggère le thème du groupe pour que vous trouviez le bon groupe d'un coup d'œil
- **Réduire pour désencombrer** — les groupes réduits restent réduits entre les sessions pour qu'une longue liste ne vous combatte pas au démarrage
- **Imbriquer un niveau** — utile pour "Personnel > E-mail", "Travail > Recherche", etc.

### Comment ça marche

Cliquez avec le bouton droit dans la barre latérale des agents pour ajouter un groupe, ou faites glisser un groupe existant sur un autre pour l'imbriquer. Les groupes sont persistés dans la base de données locale et n'affectent pas l'exécution des agents — c'est purement une couche d'organisation. Les agents peuvent être dans un groupe à la fois mais se déplacent librement entre eux.

:::tip
Un groupe "Brouillons" ou "Expérimental" en haut de votre barre latérale est un schéma utile. Tout ce que vous itérez encore y vit, et vos agents de production restent dans des groupes clairement nommés en dessous. La séparation visuelle réduit le risque de modifier le mauvais agent.
:::
  `,

  "disabling-and-archiving-agents": `
## Désactiver et archiver des agents

Deux façons de mettre en pause un agent sans le supprimer. **Désactiver** empêche tous les déclencheurs de se déclencher et bloque les exécutions manuelles ; l'agent reste visible dans la barre latérale avec une icône en sourdine pour que vous vous souveniez qu'il existe. **Archiver** déplace l'agent dans une section d'archive cachée à l'écart de l'utilisation quotidienne ; il cesse de se déclencher, ne compte pas dans les limites de niveau et peut être restauré à tout moment.

Aucune opération ne touche aux exécutions, aux paramètres ou à l'historique des versions. Archiver est plus lourd — utilisez-le pour les agents avec lesquels vous en avez fini pour l'instant mais que vous pourriez vouloir récupérer. Désactiver est plus léger — utilisez-le quand vous devez arrêter temporairement un agent sans le perdre de vue.

### Points clés

- **Désactiver** — met en pause l'exécution ; l'agent reste visible dans la barre latérale ; réactivation en un clic
- **Archiver** — masque l'agent et libère son emplacement par rapport à votre limite de niveau ; restaurable pour toujours
- **Aucune des deux ne supprime** — les paramètres, l'historique des prompts et les exécutions passées sont préservés
- **Les déclencheurs respectent la désactivation** — un agent désactivé ignore les événements de planning/webhook/surveillance de fichiers ; ils ne sont pas mis en file d'attente pour rejeu à la réactivation

### Comment ça marche

Ouvrez le menu à trois points dans la barre d'outils de l'éditeur d'agent ou cliquez avec le bouton droit sur l'agent dans la barre latérale. Désactiver / Archiver / Restaurer y vivent tous. Les agents archivés sont accessibles depuis la section Archive en bas de la barre latérale des agents ; restaurer remet l'agent dans son groupe d'origine (ou dans un compartiment "Non groupé" si le groupe a été supprimé entre-temps).

:::tip
Archivez les agents saisonniers (rapports trimestriels, flux de vacances, réconciliations de fin de mois) au lieu de les supprimer. Restaurez-les quand la saison revient et ils sont prêts à s'exécuter immédiatement.
:::
  `,

  "agent-health-indicators": `
## Indicateurs de santé des agents

Chaque agent a un petit point coloré à côté de son nom qui vous indique son statut d'un coup d'œil. Le **vert** signifie que tout fonctionne bien. Le **jaune** signifie que quelque chose a besoin de votre attention — peut-être qu'un identifiant est sur le point d'expirer ou qu'une exécution récente a eu un avertissement. Le **rouge** signifie qu'il y a un problème qui doit être résolu.

Ces indicateurs vous évitent d'avoir à vérifier chaque agent individuellement. Un coup d'œil rapide à votre barre latérale vous indique la santé de toute votre configuration.

:::feature
**Surveillance de santé d'un coup d'œil**
Personas suit en permanence les résultats d'exécution, l'expiration des identifiants et la complétude de la configuration pour chaque agent. Les indicateurs de santé se mettent à jour automatiquement — aucune vérification manuelle requise.
:::

### Ce que signifie chaque couleur

| Couleur | Statut | Signification |
|---|---|---|
| **Vert** | Sain | Toutes les exécutions récentes ont réussi, aucun problème détecté, configuration complète |
| **Jaune** | Avertissement | Quelque chose pourrait nécessiter attention bientôt (identifiant expirant, performance lente, configuration partiellement complète) |
| **Rouge** | Erreur | L'agent a échoué récemment ou a un problème de configuration |
| **Gris** | Inactif | Désactivé ou jamais exécuté |

### Statut de configuration

Parallèlement à la santé, chaque agent a un **statut de configuration** indiquant à quel point il est prêt à s'exécuter de manière autonome. Un agent fraîchement promu a souvent des lacunes de configuration — un identifiant manquant, un déclencheur non configuré, un canal de sortie encore en cours de câblage. Le badge de statut de configuration fait remonter exactement ce qui reste à faire, par ordre de priorité, pour que vous n'ayez pas à chercher à travers les onglets pour découvrir ce qui bloque. Les agents avec des problèmes de configuration persistants sont automatiquement retirés de toute rotation planifiée ou déclenchée par un disjoncteur, donc vous n'aurez jamais un agent à moitié configuré s'exécutant silencieusement contre de mauvaises données.

### Comment ça marche

La santé est calculée automatiquement en fonction des résultats d'exécution récents, du statut des identifiants et de la complétude de la configuration. Cliquez sur l'indicateur pour voir un résumé de ce qui cause le statut actuel — y compris toutes les lacunes de configuration. À partir de là, vous pouvez sauter directement aux paramètres, aux journaux ou à l'onglet spécifique qui nécessite attention.

:::tip
Prenez l'habitude de scanner les couleurs de votre barre latérale une fois par jour. Attraper un indicateur jaune tôt empêche qu'il devienne rouge — et résoudre les lacunes de configuration juste après la promotion est le moment le moins cher pour le faire.
:::
  `,
};
