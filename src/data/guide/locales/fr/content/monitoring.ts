export const content: Record<string, string> = {
  "the-monitoring-dashboard": `
## Le tableau de bord de surveillance

La page Vue d'ensemble est votre centre de commande pour tout ce qui se passe à travers vos agents. L'onglet Tableau de bord s'ouvre par défaut et affiche une grille de KpiTile — une tuile par métrique (taux de réussite, total des exécutions, coût total, durée moyenne, agents actifs, échecs du jour, etc.). Chaque tuile a trois modes de densité (compact / standard / détail) que vous basculez en cliquant sur la tuile ; utile quand vous voulez un nombre rapide vs quand vous voulez le graphique de tendance et la ventilation.

Sous les KpiTile, la Vue d'ensemble fait apparaître l'activité en direct, les échecs récents et les notifications auxquelles vous vous êtes abonné. Tout sur cette page est filtrable par agent, par groupe et par plage de temps — le même ensemble de filtres s'applique à chaque panneau pour que vous puissiez limiter tout le tableau de bord à "cette semaine, juste mes agents Marketing" en un clic.

| Panneau | Ce qu'il montre |
|---------|--------------|
| **KpiTile** | Taux de réussite, exécutions, coût, durée, nombre d'échecs, agents actifs — chacun à trois niveaux de densité |
| **Flux d'activité** | Flux en direct des exécutions à travers tous les agents, défilable, consultable, cliquez pour le détail |
| **Notifications** | Alertes auxquelles vous êtes abonné (échecs, plafonds budgétaires, revue manuelle, anomalies) avec clic vers l'exécution incriminée |
| **Aperçu de santé** | Récapitulatif de santé par agent — scan rapide pour tout ce qui est jaune ou rouge |

### Comment ça marche

La page Vue d'ensemble lit depuis le même magasin d'exécution et d'événements que le reste de l'application utilise, donc ce que vous voyez est toujours l'état en direct. Les filtres et préférences de densité persistent entre les sessions ; vous les définissez une fois et le tableau de bord s'en souvient. Cliquez sur n'importe quelle KpiTile pour explorer une ventilation par agent, cliquez sur n'importe quelle ligne d'activité pour ouvrir le modal de détail d'exécution.

:::tip
La cloche de notification de la barre de titre est un raccourci en un clic depuis n'importe où dans l'application vers le détail d'exécution le plus frais. Vous n'avez pas besoin de naviguer manuellement vers Vue d'ensemble pour les vérifications de routine "que vient-il de se passer ?".
:::
  `,

  "execution-logs": `
## Journaux d'exécution

Chaque exécution d'agent produit un journal d'exécution : charge utile du déclencheur, prompt rendu envoyé au modèle, réponse du modèle, chaque appel d'outil (avec arguments et résultat), sortie finale, durée, coût et toutes les erreurs. Les journaux sont immuables — ils sont écrits une fois et préservés indéfiniment. L'onglet Activité (par agent sur l'éditeur, ou global sur Vue d'ensemble) est le point d'entrée.

Chaque entrée de journal est un résumé d'une ligne dans la liste ; cliquer ouvre le modal de détail complet avec tous les champs ci-dessus. À partir de là, vous pouvez copier n'importe quel champ, rejouer l'exécution avec la même entrée, ou sauter à la vue de trace associée pour le débogage étape par étape.

### Points clés

- **Capture complète** — entrée, prompt, réponse, appels d'outils (avec paramètres et résultats), sortie, durée, coût, erreurs
- **Historique immuable** — les journaux ne changent jamais après la fin de l'exécution ; si le prompt de l'agent est édité plus tard, les anciennes exécutions montrent toujours ce qui a été envoyé à l'époque
- **Rejeu depuis n'importe quelle exécution** — réexécute l'agent avec l'entrée originale ; utile pour vérifier une correction sur une charge utile précédemment défaillante
- **Étiquetage par déclencheur** — \`manual\`, \`schedule\`, \`webhook\`, \`chain\`, etc., pour que vous puissiez filtrer l'activité par source
- **Marqueur de revue manuelle** — les exécutions que l'agent lui-même a signalées pour revue (via la directive \`manual_review\`) obtiennent un badge pour que vous puissiez les trouver rapidement

### Comment ça marche

Le magasin d'exécution est SQLite local, écrit transactionnellement à mesure que l'exécution progresse. L'onglet trace à l'intérieur du modal de détail développe chaque étape en ses sous-événements (flux de tokens du modèle, appel d'outil envoyé, résultat d'outil reçu, branche de décision prise). Filtrez par plage de dates, agent, type de déclencheur, statut, business_outcome, ou texte intégral sur l'entrée/sortie.

:::tip
Quand un agent produit une sortie inattendue, l'onglet trace — pas la sortie — est l'endroit où vit la réponse. Cherchez l'appel d'outil qui a renvoyé des données erronées, ou la décision du modèle qui s'est branchée du mauvais côté. La sortie est le symptôme ; la trace est la cause.
:::
  `,

  "real-time-activity-feed": `
## Flux d'activité en temps réel

Le flux d'activité vous montre ce qui se passe en ce moment à travers tous vos agents. À mesure que chaque agent traite sa tâche, les mises à jour apparaissent en temps réel — c'est comme regarder un tableau de scores en direct. Vous voyez les résultats au moment où ils se produisent sans rafraîchir ou vérifier les agents individuels.

C'est particulièrement utile quand vous avez de nombreux agents qui s'exécutent simultanément ou quand vous voulez regarder une automatisation critique pendant qu'elle s'exécute.

### Points clés

- **Mises à jour en direct** — voyez l'activité de l'agent au fur et à mesure qu'elle se produit, pas besoin de rafraîchir
- **Tous les agents** — un flux couvre chaque agent en cours d'exécution dans votre configuration
- **Entrées horodatées** — chaque mise à jour montre exactement quand elle s'est produite
- **Changements de statut** — voyez quand les agents démarrent, terminent, réussissent ou échouent en temps réel

### Comment ça marche

Ouvrez le flux d'activité depuis le tableau de bord de surveillance ou la barre latérale. Les mises à jour arrivent automatiquement en streaming pendant que vos agents travaillent. Chaque entrée montre le nom de l'agent, l'action, l'horodatage et le résultat. Cliquez sur n'importe quelle entrée — ou sur la cloche de notification dans la barre de titre — pour ouvrir le modal de détail d'exécution complet directement sur l'onglet Vue d'ensemble › Activité, où vous pouvez voir la trace, le prompt rendu, l'entrée, la sortie et toutes les erreurs. Le flux lui-même est défilable et consultable.

:::tip
Gardez le flux d'activité ouvert dans un panneau latéral pendant que vous testez de nouveaux agents. Regarder la sortie en direct vous aide à repérer les problèmes immédiatement et à itérer plus vite. Pour l'usage quotidien, la cloche de notification de la barre de titre est le chemin le plus rapide — elle ouvre toujours le détail d'exécution le plus frais sans que vous ayez à naviguer.
:::
  `,

  "cost-tracking-per-agent": `
## Suivi des coûts par agent

Chaque fournisseur d'IA facture par token, et Personas marque chaque exécution avec le nombre exact de tokens, le modèle et le fournisseur, donc le coût par agent est toujours connu. Vue d'ensemble → Utilisation montre une liste triable de chaque agent avec son coût sur la fenêtre de temps sélectionnée — jour, semaine, mois ou plage personnalisée — plus des flèches de tendance pour que vous puissiez voir d'un coup d'œil quels coûts d'agents grimpent.

Explorez n'importe quelle ligne pour une ventilation : distribution coût-par-exécution (médiane vs p95), coût par modèle quand l'agent a un basculement configuré, total des tokens (entrée vs sortie), et un graphique de tendance dans le temps. Si le coût d'un agent dérive à la hausse, c'est le premier endroit qui le fait apparaître.

### Points clés

- **Ventilation par agent** — chaque exécution est attribuée à son agent
- **Fenêtres de temps filtrables** — aujourd'hui, cette semaine, ce mois, tous les temps, ou plage personnalisée
- **Distribution coût-par-exécution** — médiane, p95, max ; révèle si une valeur aberrante coûteuse domine le total
- **Ventilation des tokens** — tokens d'entrée vs sortie pour que vous puissiez dire si l'agent lit beaucoup ou produit beaucoup
- **Flèches de tendance** — changement semaine sur semaine affiché à côté de chaque agent, pour que les régressions de coût apparaissent immédiatement

### Comment ça marche

Le compteur de coût coche en direct pendant une exécution à mesure que les tokens arrivent en streaming. Quand l'exécution se termine, le coût final est finalisé et persisté à côté du journal d'exécution. La vue Utilisation agrège depuis ce magasin, donc changer le filtre de plage de temps interroge simplement les mêmes données — aucun travail de "comptabilité de coût" séparé n'est en cours.

:::tip
Si un seul agent domine vos coûts, la distribution par exécution est plus utile que le total. Une médiane élevée signifie que le prompt est constamment coûteux (regardez la taille du prompt et le nombre d'appels d'outils). Une p95 élevée avec une médiane normale signifie des valeurs aberrantes rares (regardez les entrées inhabituelles dans l'historique de trace).
:::
  `,

  "cost-tracking-per-model": `
## Suivi des coûts par modèle

Différents modèles ont des points de prix très différents — Claude Haiku est ~30× moins cher qu'Opus par token, GPT-4o-mini est ~20× moins cher que GPT-4o, et les modèles locaux ne coûtent essentiellement rien par token (juste du calcul). La vue par modèle sur Vue d'ensemble → Utilisation décompose les dépenses par fournisseur et modèle pour que vous puissiez voir où va l'argent et si les dépenses correspondent à la valeur.

:::feature
**Conseils d'optimisation intelligents** color=#34d399
Le système marque les exécutions qui pourraient s'exécuter sur un modèle moins cher avec une qualité similaire. Quand un modèle à coût élevé est utilisé pour un schéma de tâche que le modèle moins cher gère bien ailleurs, le conseil apparaît à côté de la ligne de coût — vous pointant vers les agents candidats à tester en A-B dans le Lab.
:::

### Points clés

- **Par fournisseur et modèle** — coût ventilé par identifiant de modèle exact (Sonnet 4.6, Haiku 4.5, GPT-4o, Gemini 2.5 Pro, local-ollama)
- **Appels, tokens, coût** — trois vues des mêmes données ; le coût est ce que vous payez, les tokens sont ce que vous dépensez, les appels sont la fréquence à laquelle vous appelez
- **Comparaison coût-par-appel** — même métrique entre modèles pour que vous puissiez comparer comme avec comme
- **Conseils d'optimisation** — fait apparaître les agents candidats qui pourraient être rétrogradés ; cliquez dans le Lab pour tester en A-B
- **Attribution par agent** — explorez une ligne de modèle pour voir quels agents l'utilisent le plus

### Comment ça marche

La vue Utilisation regroupe les mêmes enregistrements d'exécution que la vue par agent mais sur la dimension modèle à la place. La tarification est configurée par modèle dans Paramètres → Moteur, avec des valeurs par défaut correspondant à la tarification publique de chaque fournisseur ; vous pouvez surcharger si vous avez un tarif négocié ou utilisez BYOI sur un point de terminaison moins cher.

:::tip
Une fois par mois, scannez la vue par modèle triée par coût total. L'entrée du haut est votre plus grande opportunité d'économies — déposez-la dans l'arène du Lab contre le modèle moins cher suivant et voyez si la qualité tient. La plupart des agents tolèrent bien une rétrogradation de modèle ; ceux qui ne le font pas sont ceux qui méritent vraiment la dépense.
:::
  `,

  "success-rate-metrics": `
## Métriques de taux de réussite

Chaque exécution se termine avec un statut : succès, échec ou revue manuelle. Le taux de réussite est le pourcentage d'exécutions qui se sont terminées avec succès par rapport à un contexte de comportement attendu. L'onglet Vue d'ensemble → Santé et l'onglet Activité par agent font tous deux apparaître le taux de réussite avec un indicateur de tendance — changement semaine sur semaine — pour que vous puissiez voir d'un coup d'œil si la fiabilité tient.

La métrique va au-delà du pur succès/échec maintenant. Avec le suivi **business_outcome**, l'agent lui-même peut déclarer si une exécution réussie a produit le résultat que vous vouliez réellement (une vente, un document approuvé, un résumé utile) — un signal séparé de "l'exécution s'est-elle terminée sans erreurs". Le taux de réussite se divise en "terminé proprement" et "produit le résultat commercial souhaité" — le second est le nombre le plus utile pour la plupart des agents.

### Points clés

- **Taux de réussite par agent** avec flèche de tendance
- **Taux de résultat commercial** — séparé du taux de complétion propre ; suit si le travail de l'agent était réellement utile
- **Division par déclencheur** — le même agent peut réussir à 99 % sur les exécutions manuelles mais 70 % sur les planifiées ; la ventilation vous montre quelle source de déclencheur a des problèmes
- **Alertes de seuil** — définissez un seuil par agent ; vous êtes notifié quand le taux tombe en dessous
- **Classification de raison d'échec** — \`timeout\`, \`model_error\`, \`tool_error\`, \`credential_expired\`, etc., pour que vous puissiez voir *pourquoi* les exécutions échouent

### Comment ça marche

L'onglet Santé agrège les statuts d'exécution sur une fenêtre glissante par agent. Le suivi des résultats commerciaux nécessite que l'agent émette une directive \`business_outcome\` dans sa sortie (la plupart des modèles qui en ont besoin le font par défaut ; les agents personnalisés peuvent l'ajouter explicitement). Les alertes de seuil sont configurées par agent et se déclenchent via les mêmes canaux de notification avec lesquels l'agent est configuré.

:::tip
Définissez un seuil de 90 % sur chaque agent de production. L'alerte ne vous dira pas pourquoi un agent échoue, mais elle vous dira que quelque chose ne va pas. La classification de raison d'échec sur l'onglet Santé est où vous allez ensuite pour diagnostiquer.
:::
  `,

  "execution-tracing": `
## Traçage d'exécution

Le traçage est l'enregistrement étape par étape par exécution de ce que l'agent a fait. Ouvrez n'importe quelle exécution depuis le flux d'activité et cliquez sur l'onglet Trace : vous verrez chaque événement dans l'ordre chronologique — début et fin du streaming de tokens du modèle, chaque invocation d'outil avec arguments, chaque résultat d'outil, chaque branche de décision dans un agent chaîné, le prompt rendu, la sortie. Chaque étape est extensible pour un détail complet.

Pour les pipelines chaînés, la trace s'étend sur plusieurs agents — le canevas de lignée (Événements → Lignée) montre la vue inter-agents tandis que la trace par exécution montre le détail intra-agent. Ensemble, ils vous permettent de déboguer à la fois "où ce pipeline s'est-il cassé ?" et "qu'est-ce que l'agent a décidé étape par étape ?".

### Points clés

- **Chronologique** — chaque événement avec horodatage et durée
- **Extensible par étape** — cliquez sur n'importe quelle étape pour l'entrée/sortie complète de cette étape
- **Durée par étape** — voyez quelle étape est lente ; généralement un appel d'outil ou une longue réponse de modèle
- **Traces chaînées** — quand un agent est déclenché par une chaîne, la trace renvoie à l'agent en amont pour que vous puissiez naviguer dans le pipeline
- **Token par token** pour le modèle — utile pour les fournisseurs au streaming lent où l'utilisateur attend

### Comment ça marche

Chaque exécution écrit des événements dans le magasin de traces pendant qu'elle s'exécute ; l'onglet trace interroge ce magasin et rend la chronologie. Les événements au niveau token sont échantillonnés à un taux qui garde la trace utilisable même pour les longues réponses (une réponse de 10k tokens pourrait capturer 500 événements échantillonnés plutôt que 10k). Pour les boucles d'utilisation d'outils, chaque itération de l'aller-retour modèle/outil est capturée.

:::tip
Utilisez la trace pour confirmer ce que le modèle a *réellement* reçu. La plus grande source de bugs "l'agent a fait quelque chose de bizarre" est le modèle recevant une entrée différente de ce que vous attendiez — généralement à cause d'un résultat d'outil qui ne ressemblait pas à ce que le prompt de l'agent supposait.
:::
  `,

  "performance-trends": `
## Tendances de performance

Les tendances sont la vue à long terme du comportement de l'agent — taux de réussite, coût, durée, qualité de sortie (là où elle est mesurée) tracés dans le temps pour que vous puissiez voir l'impact des changements que vous faites. Vue d'ensemble → Tendances vous donne la vue graphique ; vous choisissez le(s) agent(s) et la (les) métrique(s) et la plage de dates, et les graphiques se rendent.

Le modèle le plus utile est "avant vs après" : vous avez changé le prompt d'un agent le 5 mars, les choses se sont-elles améliorées ou aggravées ? La vue des tendances y répond en quelques secondes — les lignes qui vous intéressent montent ou descendent à la date où vous avez fait le changement.

### Points clés

- **Plusieurs métriques sur un graphique** — superposez taux de réussite, coût, durée, taux de résultat commercial
- **Superposition multi-agents** — comparez la même métrique entre plusieurs agents sur un graphique
- **Plages de dates personnalisées** — zoomez de "cette heure" à "tous les temps"
- **Annotations** — les événements significatifs (sauvegardes de versions de prompt, changements de paramètres, rotations d'identifiants) sont épinglés à la chronologie pour que vous puissiez corréler
- **Export** — les données du graphique s'exportent au format CSV si vous voulez faire votre propre analyse

### Comment ça marche

Les tendances agrègent depuis le même magasin d'exécution et de trace que le reste des vues de surveillance — mêmes données, visualisation différente. Les annotations sont auto-générées à partir de l'historique des versions et de l'historique de configuration (qui sont également persistants) donc vous n'avez pas à marquer manuellement "j'ai fait un changement ici" ; le système le sait déjà.

:::tip
Après tout changement significatif à un agent (révision du prompt, échange de modèle, nouvel outil), vérifiez les tendances une semaine plus tard. La plupart des changements de prompt qui "semblaient meilleurs en test" produisent des métriques mesurablement différentes ; le graphique le confirme (ou invalide votre intuition).
:::
  `,

  "setting-budget-limits": `
## Définir des limites budgétaires

Les limites budgétaires plafonnent les dépenses d'IA au niveau de l'agent et au niveau global. Définissez un budget par exécution (cette seule exécution ne peut pas coûter plus de X$), un budget par jour (cet agent ne peut pas dépenser plus de Y$ par jour entre toutes les exécutions), ou un plafond global sur tous les agents. Quand une limite est atteinte, l'agent affecté se met en pause proprement — l'exécution partielle est capturée dans la trace, aucune charge ne persiste au-delà du plafond, et une notification se déclenche.

C'est l'une des fonctionnalités les plus sous-estimées pour les agents sans surveillance. Un agent déclenché par planning ou webhook sans plafond budgétaire pourrait accumuler des coûts inattendus pendant la nuit si un prompt ou une entrée fait quelque chose de pathologique. Les plafonds budgétaires signifient que le pire cas est borné par ce que vous avez décidé à l'avance, pas par ce qu'une exécution de modèle errante peut faire.

### Points clés

- **Plafond par exécution** — limite dure sur une seule exécution
- **Plafond par jour / par semaine / par mois** — limite de dépense fenêtrée par agent
- **Plafond global** — limite à travers tous les agents ; utile comme filet de sécurité même quand chaque agent a son propre plafond
- **Arrêt gracieux** — les agents s'arrêtent proprement au plafond ; la trace partielle est préservée
- **Notifications** — chaque atteinte de plafond vous notifie pour que vous puissiez décider d'augmenter le plafond ou de corriger le prompt sous-jacent
- **Avertissements doux** — seuils optionnels avant plafond (par ex. "avertir à 80 %") pour que vous sachiez qu'un agent se dirige vers un plafond

### Comment ça marche

Les plafonds sont configurés sur l'onglet Paramètres de l'agent (par exécution, par fenêtre) ou dans Paramètres → Moteur → Budget (global). Le moteur d'exécution suit le coût en direct pendant l'exécution ; quand le coût traverse le plafond, le moteur abandonne l'exécution via le même chemin qu'un timeout. L'état abandonné est préservé dans la trace avec la raison \`budget_exceeded\`.

:::warning
Définissez toujours au moins un plafond par jour pour tout agent déclenché automatiquement (planning, webhook, surveillance de fichiers, chaîne). Sans cela, une entrée pathologique ou une boucle de modèle pourrait dépenser un montant illimité avant que vous ne le remarquiez. Le plafond est votre filet de sécurité.
:::

:::tip
Commencez avec des plafonds environ 3x ce que vous attendez qu'une journée typique coûte. Assez serré pour attraper les emballements, assez lâche pour que la variance normale ne déclenche pas le plafond. Ajustez après une semaine de données réelles.
:::
  `,

  "anomaly-detection": `
## Détection d'anomalies

La détection d'anomalies compare chaque nouvelle exécution au référentiel récent de l'agent et signale les exécutions qui semblent inhabituelles. Le référentiel est construit par agent : durée typique, coût typique, longueur typique de sortie, nombre typique d'appels d'outils. Une nouvelle exécution qui dévie significativement sur l'une de ces dimensions est signalée avec une raison — "durée 5× normale", "pic de coût", "nombre d'appels d'outils anormal", "sortie inhabituellement courte".

Cela attrape une classe de problèmes que les métriques pures de succès/échec manquent : l'exécution s'est terminée, mais quelque chose n'allait pas. L'agent a pris cinq minutes alors qu'il prend habituellement trente secondes. La sortie est trois phrases alors qu'elle est habituellement trois paragraphes. Le coût a doublé sans changement d'entrée. Ce sont des signaux qui valent la peine d'être vus avant qu'ils ne deviennent des tendances.

### Points clés

- **Référentiel multi-signaux** — durée, coût, taille de sortie, nombre d'appels d'outils, taux d'échec
- **Référentiels par agent** — chaque agent a sa propre normalité ; ce qui est anormal pour l'un est normal pour un autre
- **Alertes étiquetées par raison** — l'alerte nomme quel signal a dévié et de combien
- **Faible bruit** — calibré pour faire apparaître les vraies valeurs aberrantes, pas la variance normale
- **S'intègre aux notifications** — les anomalies se déclenchent via les canaux de notification avec lesquels l'agent est configuré

### Comment ça marche

Le référentiel est une fenêtre glissante d'exécutions récentes (configurable ; par défaut 50). Chaque nouvelle exécution est scorée sur chaque signal ; si un signal traverse le seuil configuré (par défaut 3 écarts-types de la moyenne glissante), l'exécution est signalée et un événement d'anomalie est émis. Les événements d'anomalie apparaissent dans Vue d'ensemble → Notifications et dans l'onglet Santé pour cet agent.

:::tip
Les anomalies que vous enquêtez et résolvez doivent être effacées (marquez-les "enquêtées"). Le référentiel exclut les anomalies enquêtées de sa fenêtre glissante, pour que le système ne dérive pas vers considérer l'exécution anormale comme "normale".
:::
  `,
};
