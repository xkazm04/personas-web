export const content: Record<string, string> = {
  "why-test-your-agents": `
## Pourquoi tester vos agents ?

Les tests sont la façon dont vous gardez les agents dignes de confiance à mesure que vous itérez. Chaque modification de prompt, chaque échange de modèle, chaque nouvel outil que vous ajoutez change le comportement de l'agent de manières que vous ne pouvez pas pleinement prédire en lisant le diff. Les tests transforment cette incertitude en preuve : exécutez la nouvelle version contre des entrées représentatives, comparez à la version précédente, voyez si vous avez amélioré les choses que vous vouliez et n'avez pas régressé les choses que vous ne vouliez pas.

L'onglet Lab sur l'éditeur de chaque agent est l'endroit où cela se produit. Il a quatre modes — Arena, A-B, Matrix, Eval — chacun répondant à une question différente. Arena compare les modèles sur le même prompt. A-B compare deux prompts sur le même modèle. Matrix teste des combinaisons de composants de prompts. Eval est la grille complète : chaque prompt × chaque modèle.

### Points clés

- **Attraper les régressions tôt** — tester après chaque changement est la façon d'éviter "l'agent fonctionnait, qu'est-ce que j'ai cassé ?"
- **Comparer les alternatives systématiquement** — Arena et A-B vous permettent de choisir entre les options avec des preuves plutôt qu'à l'intuition
- **Générer des données de fitness** — les exécutions Lab accumulent des scores par prompt qui alimentent l'évolution génomique (niveau Builder)
- **Ensembles d'entrées réutilisables** — les entrées de test sont sauvegardées par agent ; mêmes prompts, mêmes données, comparaisons reproductibles

### Comment ça marche

Chaque mode Lab envoie la même charge utile de déclencheur à plusieurs variantes d'agent (différents prompts, différents modèles, ou les deux) en parallèle. Les sorties sont présentées côte à côte avec des métadonnées quantitatives (durée, coût, nombre de tokens) et vos boutons de notation subjective. Les résultats arrivent dans l'historique de test de l'agent et alimentent la notation de fitness.

:::tip
Le moment le moins cher pour attraper une régression de prompt est juste après l'avoir écrite. Faites de Lab → A-B contre la version précédente du prompt votre habitude à chaque modification de prompt ; la friction est beaucoup plus faible que de découvrir une régression dans les exécutions de production trois jours plus tard.
:::
  `,

  "the-testing-lab-overview": `
## Vue d'ensemble du laboratoire de tests

L'onglet Lab sur l'éditeur de chaque agent est un espace de travail avec quatre modes. Choisissez le mode selon ce que vous essayez d'apprendre :

### Les quatre modes

:::compare
**Arena**
Même prompt, plusieurs modèles. Envoie une entrée à travers Claude / GPT / Gemini / local en parallèle. Idéal pour "quel modèle convient à cet agent ?"
---
**A-B**
Deux prompts, même modèle. Comparez un changement de prompt à son prédécesseur dans des conditions identiques. Idéal pour "cette modification a-t-elle amélioré les choses ?"
---
**Matrix**
Combinatoire. Définissez des composants de prompt et la matrice teste chaque combinaison (3 × 4 = 12 variantes). Idéal pour "j'ai plusieurs idées concurrentes — quelle combo gagne ?"
---
**Eval**
Grille complète : N prompts × M modèles. L'image complète quand vous voulez optimiser le prompt *et* le modèle ensemble. Idéal quand un changement majeur est sur la table.
:::

### Comment ça marche

Chaque mode partage le même sélecteur d'entrée (saisie manuelle, collage de JSON structuré, ou rejeu d'une exécution passée réelle de l'historique de cet agent) et la même UI de notation. Les colonnes de sortie se développent pour la trace complète (appel de modèle, appels d'outils, branches de décision) tout comme une exécution régulière. Les résultats sont sauvegardés dans l'historique de test avec le mode de test étiqueté, pour que vous puissiez parcourir les tests passés par mode.

Pour les agents chaînés, le Lab teste uniquement cet agent — l'amont est simulé en utilisant l'entrée que vous avez spécifiée, pour que vous puissiez itérer sur une étape d'un pipeline sans réexécuter toute la chaîne.

:::tip
La plupart des semaines, Arena et A-B suffisent. Matrix est pour "j'ai trois refactorisations plausibles et veux comparer", Eval est pour "j'envisage une réécriture majeure ou un changement de niveau". Ne saisissez pas le mode lourd par défaut — les moins chers sont généralement suffisants.
:::
  `,

  "arena-testing": `
## Test Arena

Arena envoie le même prompt et la même entrée à plusieurs modèles en parallèle, puis présente les résultats côte à côte. Les coûts et durées sont affichés à côté des sorties pour que vous compariez sur trois axes — qualité (votre jugement), vitesse (mesurée par le moteur), et coût (token par token).

L'utilisation la plus courante est la décision de sélection du modèle : "cet agent fonctionne sur Sonnet 4.6, Haiku 4.5 tiendrait-il pour 1/30 du coût ?" Arena répond à cela en un test plutôt qu'en semaines d'observation en production.

### Points clés

- **Envoi parallèle** — tous les modèles s'exécutent en même temps ; temps total d'horloge = le plus lent, pas la somme
- **Sorties côte à côte** — la sortie complète de chaque modèle est visible sans changer d'onglet
- **Coût + durée affichés** — sous chaque sortie, dans la même vue que le texte
- **UI de notation par colonne** — pouce vers le haut / pouce vers le bas / étoile par modèle ; les notes persistent dans les données de fitness de l'agent
- **Rejeu depuis l'historique** — les tests Arena peuvent tirer l'entrée de toute exécution passée de cet agent, pour que vous testiez sur la forme réelle

### Comment ça marche

Arena envoie une exécution par modèle sélectionné en utilisant le prompt actuel et la configuration d'outils de l'agent. Chaque exécution est indépendante (trace séparée, comptabilité de coût séparée) et étiquetée \`arena\` pour qu'elle ne compte pas contre les métriques de production normales de l'agent. Les résultats apparaissent comme colonnes ; vous notez chaque colonne ; les notes alimentent les données de fitness par modèle pour cet agent.

:::tip
Choisissez 3 modèles maximum par exécution Arena. Plus que cela et la lecture côte à côte devient ingérable. Si vous envisagez 5+ modèles, exécutez plusieurs Arenas par paires et gardez une note mentale courante des modèles qui ont gagné chaque tour.
:::
  `,

  "ab-testing-prompts": `
## Tests A-B de prompts

A-B exécute la même entrée à travers deux variantes de prompt sur le même modèle, donc la seule variable est le prompt. C'est le bon outil pour évaluer une modification de prompt : chargez la version précédente comme A, la nouvelle version comme B, exécutez sur des entrées représentatives, et voyez laquelle produit le résultat que vous voulez.

Le sélecteur de version du Lab s'intègre à l'historique des versions du prompt — vous n'avez pas besoin de copier-coller l'ancienne version, choisissez-la simplement dans le menu déroulant. Cela rend "comparer mon brouillon actuel à la version fonctionnelle de la semaine dernière" une configuration en un clic.

### Points clés

- **Deux prompts, un modèle, une entrée** — comparaison à variable unique
- **Choisir depuis l'historique des versions** — A ou B peut être n'importe quelle version passée du prompt de cet agent
- **Même fidélité de trace** — les deux variantes obtiennent des traces d'exécution complètes, pour que vous puissiez comparer les modèles d'appels d'outils, pas seulement la sortie finale
- **Plusieurs tours d'entrée** — exécutez l'A-B contre plusieurs entrées différentes en séquence pour tester la généralisation, pas juste un cas chanceux
- **Le score persiste dans la fitness** — les notes A-B alimentent les mêmes données de fitness que Arena et le génome utilisent

### Comment ça marche

Le moteur A-B envoie les deux prompts comme exécutions indépendantes et les étiquette A et B dans le panneau de résultats. Au-delà, ce sont des exécutions régulières — même trace, même comptabilité de coût, mais étiquetées \`ab_test\` pour qu'elles soient filtrables dans l'historique de test et ne polluent pas les métriques de production.

:::code-compare
### Version A
Résume le document.
Garde-le court.
---
### Version B
Résume le document en exactement
3 puces. Chaque puce doit
être une phrase. Commence par
le résultat le plus important.
:::

:::warning
Changez une chose par tour A-B. Si B diffère de A à la fois en *format* *et* en *ton* *et* en *longueur*, vous ne pouvez pas dire quelle dimension a causé le changement de score. Faites un changement, exécutez A-B, acceptez ou rejetez, puis faites le changement suivant.
:::
  `,

  "matrix-testing": `
## Test Matrix

Matrix est A-B-C-D-… combinatoire tout à la fois. Vous définissez votre prompt comme composants (intro × instructions × format-de-sortie, par exemple) et la matrice génère toutes les combinaisons, les envoie toutes, et classe les résultats par score de fitness.

Avec 3 composants de 3 options chacun, c'est 27 combinaisons — bien plus que ce que vous testeriez manuellement mais facile pour le moteur à déployer en parallèle. La matrice est la plus utile quand vous avez plusieurs idées concurrentes sur la façon de structurer un prompt et que vous voulez trouver la combinaison qui fonctionne réellement le mieux plutôt que celle que vous avez devinée.

### Points clés

- **Définir des composants, obtenir des combinaisons** — la matrice développe les composants en toutes les combinaisons valides
- **Envoi parallèle** — chaque combo s'exécute simultanément (sous réserve des limites de taux du fournisseur)
- **Résultats classés** — grille notée par fitness, triée du meilleur au pire
- **Attribution au niveau composant** — voyez quels composants corrèlent avec des scores élevés ; utile même quand vous n'adoptez pas le gagnant absolu mot pour mot
- **Sauvegarder la combo gagnante** — un clic pour définir la combinaison gagnante comme prompt actif de l'agent

### Comment ça marche

Vous définissez chaque composant comme un ensemble étiqueté de variantes dans l'onglet matrix. Le moteur construit chaque combinaison comme un prompt rendrable et envoie chacun comme une exécution indépendante. Les résultats sont agrégés dans une grille classée par votre signal de fitness choisi (note, coût-par-qualité, vitesse, personnalisé). L'attribution par composant est calculée en faisant la moyenne de la fitness sur les combinaisons qui partagent ce composant — donc même si aucun gagnant unique ne se démarque, vous apprenez quel style d'intro / d'instruction / de format de sortie performe le mieux en moyenne.

:::info
Avec 3 composants × 3 options = 27 variantes. Avec 4 × 4 = 256. La matrice peut gérer de grandes grilles mais vous brûlerez des tokens proportionnellement. Commencez avec 3 × 3 et n'étendez que si le résultat est vraiment ambigu.
:::

:::tip
Matrix est le plus utile juste après une refonte majeure du prompt. Quand vous n'êtes pas sûr si la nouvelle structure est meilleure que l'ancienne, faites un test matriciel sur 3-4 structures candidates contre quelques entrées représentatives — le gagnant est généralement plus clair que ce à quoi vous vous attendiez.
:::
  `,

  "eval-testing": `
## Test Eval

Eval est la grille complète : chaque variante de prompt × chaque modèle. Vous choisissez les prompts (typiquement 2-3 candidats), choisissez les modèles (typiquement 2-4), et la grille eval exécute toutes les combinaisons et présente une carte de chaleur de scores. La meilleure paire prompt-modèle est mise en évidence.

C'est le mode poids lourd — le plus cher en tokens, le plus complet en couverture. Utilisez-le quand vous prenez une décision majeure qui affecte les deux axes : "nous envisageons de réécrire le prompt et de passer à un modèle moins cher, pouvons-nous faire les deux à la fois et toujours atteindre notre barre de qualité ?"

### Points clés

- **N prompts × M modèles** — carte de chaleur de scores sur les deux dimensions
- **Meilleure combinaison mise en évidence** — classée par fitness, avec la cellule optimale visuellement mise en évidence
- **Ventilations par axe** — voyez si le changement de prompt ou le changement de modèle a entraîné le changement de score
- **Étiqueté dans l'historique de test** — les exécutions eval arrivent dans l'historique sous l'étiquette \`eval\` pour revue ultérieure
- **Adoption en un clic** — appliquez la meilleure combinaison (version de prompt + sélection de modèle) à l'agent en direct

### Comment ça marche

Eval envoie \`prompts × modèles\` exécutions en parallèle (sous réserve des limites de taux du fournisseur). Chaque cellule est une exécution indépendante avec sa propre trace. La vue grille agrège par paire prompt-modèle ; vous notez les cellules en utilisant la même UI qu'Arena et A-B ; les scores de fitness se cumulent dans le classement par cellule. La cellule du haut est la combinaison recommandée — adoptez-la directement depuis la vue grille.

:::warning
Eval est le mode le plus cher. 3 prompts × 4 modèles × 5 entrées = 60 exécutions, chacune avec son propre appel de modèle. Exécutez avec parcimonie, sur des ensembles d'entrées représentatifs, et seulement quand la décision traverse vraiment les deux axes. Pour les décisions de prompt uniquement, A-B ; pour les décisions de modèle uniquement, Arena.
:::
  `,

  "rating-and-scoring-results": `
## Noter et évaluer les résultats

Après tout test Lab, chaque ligne de sortie a des contrôles de notation : pouce vers le haut / pouce vers le bas pour le jugement binaire, ou une échelle d'étoiles de 1 à 5 pour les cas nuancés. Vos notes alimentent deux choses : le score de fitness par variante de l'agent (utilisé pour le classement dans matrix et eval, et comme pression de sélection d'évolution génomique au niveau Builder), et un signal de préférence personnelle à travers tous vos tests dans le temps.

Les notes sont personnelles — elles encodent votre jugement de qualité, pas une métrique objective. C'est intentionnel ; vous êtes celui qui sait si la sortie de l'agent correspond à ce dont vous avez besoin, et c'est le signal que le système optimise.

### Points clés

- **Binaire ou étoiles 1-5** — choisissez l'échelle avec laquelle vous êtes à l'aise pour être cohérent
- **Notation par sortie** — chaque sortie de test obtient sa propre ligne de contrôles de notation ; rien n'est agrégé automatiquement jusqu'à ce que vous notiez
- **Pilote les scores de fitness** — les notes alimentent le signal de fitness par variante que Matrix / Eval / génome utilisent
- **L'historique de retour persiste** — chaque note que vous avez donnée est stockée ; utile pour "ai-je noté X plus haut que Y dans les tests passés ?"
- **La cohérence compte plus que la précision** — un 4 étoiles que vous donneriez de manière cohérente est plus utile qu'un 5 étoiles que vous donnez une fois et plus jamais

### Comment ça marche

Les notes sont stockées contre l'exécution spécifique (trace, version de prompt, modèle, entrée). L'agrégateur de fitness lit les notes + métriques objectives (coût, durée, succès) et calcule un score de fitness par variante qui est utilisé dans le classement. L'évolution génomique (niveau Builder) utilise les notes comme pression de sélection principale pour choisir les prompts parents à élever.

:::tip
Notez en fonction de ce que vous voulez réellement, pas de ce qui est techniquement impressionnant. Une réponse courte et correcte bat souvent une longue élaborée. Le système optimise par rapport à vos préférences, donc des notes honnêtes et cohérentes produisent des agents adaptés à *votre* jugement.
:::
  `,

  "genome-evolution-basics": `
## Bases de l'évolution génomique

L'évolution génomique (niveau Builder) élève automatiquement de nouvelles variantes de prompts à partir de vos meilleurs tests passés notés. Chaque "génération" mute et recombine les prompts les plus performants de la génération précédente ; sur plusieurs générations, les prompts convergent sur des configurations qui se notent constamment mieux que votre point de départ. C'est une recherche évolutionnaire avec vos notes comme fonction de fitness.

Le processus est sans surveillance une fois que vous le démarrez. Vous fournissez le prompt de départ et le signal de fitness (typiquement votre historique de notes plus des métriques objectives optionnelles comme le coût ou la durée), définissez la taille de la population et le nombre de générations, et le laissez fonctionner. Les déclencheurs normaux de l'agent restent en pause pendant l'évolution pour garder la comparaison propre.

:::info
L'évolution génomique est sans surveillance une fois lancée. Vous définissez les paramètres, le moteur crée des variations, les teste contre votre ensemble d'entrées, les note par vos notes, et recombine les gagnants dans la génération suivante. Vous examinez la population finale et adoptez le gagnant manuellement — le système ne change jamais silencieusement votre prompt en direct.
:::

### Points clés

- **Variation + sélection automatiques** — le moteur génère des mutations des meilleurs parents et sélectionne par fitness
- **Générations + populations** — configuration typique est 5-10 générations de 8-12 variantes chacune
- **Fonction de fitness = vos notes** — signal principal ; signaux secondaires (coût, durée) sont des poids configurables
- **Toutes les générations versionnées** — chaque prompt généré est préservé dans l'historique des versions de l'agent ; rien n'est perdu
- **Adoption manuelle** — le moteur n'échange jamais silencieusement votre prompt en direct ; vous examinez et adoptez le gagnant

### Comment ça marche

Chaque génération commence avec une population parente. Le moteur génère des variantes enfants via de petites mutations structurées (reformulation, réordonnancement des sections, ajustement des exemples, etc.) et croisement (combinaison de segments de deux parents). Chaque enfant s'exécute contre votre ensemble d'entrées ; les notes produisent le score de fitness ; les enfants les mieux notés deviennent la population parente pour la génération suivante. Après le nombre configuré de générations, vous voyez la population finale classée et pouvez adopter n'importe quelle variante.

### En action

:::usecases
**Réglage de tri d'e-mails**
Le prompt actuel classifie mal 15 % des e-mails
---
Exécutez 5 générations de population 10. Vous obtenez une variante qui classifie mal 3 % — adoptez en un clic.
===
**Cohérence de format**
Le format de sortie de l'agent est incohérent à travers les formes d'entrée
---
Le génome évolue sur un ensemble d'entrées diversifié avec la conformité de format comme signal de fitness ; la sortie se stabilise.
===
**Réduction des coûts sans perte de qualité**
Vous voulez trouver un prompt plus maigre qui produit toujours une bonne sortie
---
Ajoutez le coût-par-token à la fonction de fitness avec un poids négatif ; l'évolution trouve des prompts plus courts qui maintiennent la note.
:::

:::info
Chaque variante créée pendant l'évolution est versionnée dans l'historique de prompt de l'agent. Si la variante adoptée N+1 se révèle mal se comporter en production, restaurer la variante N est un clic — aucun travail n'est perdu.
:::

:::tip
La patience paie. La génération 1 n'est généralement pas dramatiquement meilleure que votre prompt de départ — les mutations sont petites et beaucoup sont nulles. À la génération 3-4 la population survivante se concentre sur les améliorations réelles ; c'est typiquement quand vous verrez un gagnant clair.
:::
  `,

  "running-a-breeding-cycle": `
## Exécuter un cycle d'évolution

Un "cycle d'évolution" est une exécution d'évolution complète : choisir l'agent, définir les paramètres, lancer, attendre, examiner la population, adopter. Chaque cycle est N générations de M variantes testées contre votre ensemble d'entrées choisi. Le coût total est à peu près \`générations × population × nombre d'entrées × coût-par-exécution\` — prévisible à partir des paramètres.

L'onglet Génome sur le Lab est le point d'entrée. Il s'ouvre avec des paramètres par défaut réglés pour un point de départ représentatif (5 générations × 10 variantes × 5 entrées), ce qui est suffisant pour voir un changement significatif sans brûler de tokens excessifs. Ajustez les paramètres avant de lancer si vous voulez un cycle plus lourd ou plus léger.

:::steps
1. **Ouvrez Lab → Génome** sur l'agent que vous voulez faire évoluer
2. **Choisissez l'ensemble d'entrées** — saisie manuelle, ensemble sauvegardé, ou rejeu depuis l'historique
3. **Configurez les poids de fitness** — poids de note (principal), poids de coût (négatif si vous voulez plus court), poids de durée (négatif si vous voulez plus rapide)
4. **Définissez les générations et la population** — 5 × 10 est la valeur par défaut ; augmentez les deux pour les problèmes plus difficiles, abaissez les deux pour les expériences rapides
5. **Cliquez sur Démarrer le cycle** — le moteur s'exécute sans surveillance ; vous pouvez laisser l'application ouverte ou revenir plus tard
6. **Examinez la population finale** — classée par fitness, avec la trace de chaque variante disponible
7. **Adoptez le gagnant** — ou toute autre variante que vous préférez ; le prompt actif de l'agent est mis à jour et la population complète du cycle est préservée dans l'historique des versions
:::

### Comment ça marche

Chaque génération s'exécute en parallèle : le moteur envoie toutes les M variantes simultanément (sous réserve des limites de taux du fournisseur) à travers l'ensemble d'entrées, collecte les résultats, les note via la fonction de fitness, sélectionne les meilleurs performeurs comme parents, génère des enfants pour la génération suivante, et continue. L'UI de progression montre la meilleure fitness en direct par génération et la moyenne pour que vous puissiez voir si la population s'améliore.

:::tip
Commencez avec un petit ensemble d'entrées (3-5 cas représentatifs) et le cycle par défaut 5 × 10. Si le résultat est clairement amélioré, vous avez terminé. S'il est ambigu, étendez l'ensemble d'entrées et exécutez un autre cycle en commençant à partir du gagnant précédent. L'itération de cycles bat souvent un cycle géant.
:::
  `,

  "adopting-evolved-prompts": `
## Adopter les prompts évolués

Quand un cycle d'évolution se termine, vous voyez la population finale classée par fitness avec la variante du haut mise en évidence. L'adoption est en un clic — la variante devient le prompt actif de l'agent, le prompt actif précédent est préservé dans l'historique des versions (donc le retour en arrière est également en un clic), et la population complète du cycle est également préservée au cas où vous voudriez adopter une variante différente plus tard.

L'action d'adoption exécute la même vérification pré-vol que tout autre changement de prompt : le statut de configuration vérifie que les identifiants et outils de l'agent sont toujours valides, la version est mise en point de contrôle dans l'historique, et si l'agent a des déclencheurs planifiés, la prochaine exécution planifiée utilise automatiquement la variante adoptée.

### Points clés

- **Adoption en un clic** depuis la vue population classée
- **Version précédente préservée** dans l'historique ; la restauration est également en un clic
- **Population complète préservée** — toute variante du cycle reste adoptable plus tard
- **La vérification pré-vol s'exécute** — vérification du statut de configuration, validation des identifiants, compatibilité des déclencheurs
- **Les déclencheurs actifs utilisent automatiquement la nouvelle variante** — pas d'étape de "déploiement" séparée

### Comment adopter

:::steps
1. **Attendez la fin du cycle d'évolution** — généralement 10-30 minutes selon les paramètres
2. **Ouvrez la vue population finale** — variantes classées par fitness avec traces accessibles par variante
3. **Lisez le prompt de la variante du haut** — vérification rapide de bon sens pour des formulations inattendues ou des mutations bizarres
4. **Inspectez optionnellement les variantes 2e / 3e** — parfois une fitness légèrement plus basse vient avec un prompt beaucoup plus court / plus propre
5. **Cliquez sur Adopter** sur votre choix ; la vérification pré-vol s'exécute ; le prompt actif de l'agent se met à jour atomiquement
6. **Vérifiez la prochaine exécution en direct** — généralement une exécution manuelle avec une entrée représentative est la confirmation la moins chère que la variante adoptée se comporte comme les scores de test l'ont promis
:::

:::tip
Lisez la variante adoptée avant de cliquer sur Adopter. L'évolution trouve des prompts à haute fitness, mais occasionnellement une variante note bien en exploitant une particularité de votre ensemble d'entrées ; lire le prompt est la vérification de sécurité qui attrape "ceci passerait aussi mes tests mais est bizarre".
:::
  `,

  "fitness-scoring-explained": `
## Notation de fitness expliquée

La fitness est le nombre unique qui pilote la sélection Matrix / Eval / Génome. Elle combine vos notes manuelles (signal principal) avec des métriques objectives (coût, durée, taux de réussite, conformité à la longueur cible de sortie, signaux personnalisés) en un score pondéré. Vous configurez les poids par agent ou par test — par défaut, les notes dominent et les métriques objectives sont des départageurs.

Le score est calculé par variante par entrée, puis agrégé à travers toutes les entrées dans l'ensemble de test pour produire une fitness par variante. Les variantes sont classées par fitness agrégée ; ce classement est ce que l'algorithme de sélection génomique consomme et ce que l'UI Lab utilise pour mettre en évidence les gagnants.

### Points clés

- **Score agrégé unique par variante** — typiquement 0,0–1,0 ou 0–100 selon la préférence d'affichage
- **Sources d'entrée multiples** — note (principale), coût, durée, succès, conformité au format de sortie, fonctions de fitness personnalisées
- **Poids par agent** — soulignez ce qui compte ; pour les agents sensibles au coût, pondérez plus le coût ; pour les sensibles à la qualité, pondérez plus la note
- **Agrégation à travers les entrées** — les variantes sont notées sur chaque entrée puis moyennées, donc une variante qui est brillante sur une entrée et cassée sur une autre note pire qu'une médiocre constante
- **Ventilation transparente** — cliquez sur n'importe quel nombre de fitness pour voir les contributions par signal

### Comment ça marche

L'agrégateur de fitness lit les résultats d'exécution (coût, durée, succès), l'historique des notes (par exécution) et tout signal de fitness personnalisé enregistré pour l'agent. Chacun est normalisé à une plage 0-1, multiplié par son poids configuré, et additionné. Le résultat est la fitness de la variante ; l'agrégation à travers toutes les entrées dans l'ensemble de test est le score affiché.

:::tip
Les poids par défaut (90 % note, 10 % coût) sont réglés pour la plupart des agents. Si vous vous trouvez en désaccord avec les "gagnants" du système dans les tests eval / matrix, l'ajustement le plus utile est généralement d'augmenter encore le poids de la note (95 %) pour que le système fasse plus confiance à votre jugement. Ajustez le poids du coût à la hausse pour les agents à très haut volume où le coût des tokens est une vraie préoccupation.
:::
  `,

  "test-history-and-trends": `
## Historique et tendances des tests

Chaque test Lab que vous exécutez est préservé dans l'historique de test de l'agent. La vue historique (Lab → Historique) montre les tests passés triés par date avec l'étiquette de mode, l'ensemble d'entrées, les scores de fitness et le résultat éventuel (adopté / rejeté / remplacé). Cliquez sur n'importe quel test passé pour le rouvrir dans son mode original pour ré-examen ou pour cloner les paramètres dans un nouveau test.

Le sous-onglet Tendances trace les métriques au niveau de l'agent dans le temps — fitness du prompt actuellement actif, coût-par-exécution, durée-par-exécution, taux de résultat commercial. Le tracé est annoté avec des événements significatifs (changements de prompt, échanges de modèle, ajouts de déclencheurs) pour que vous puissiez voir l'impact de chaque changement sur les métriques de l'agent en direct.

### Points clés

- **Chaque test préservé** — entrée complète, sortie, notes, fitness ; rien n'est GC'd
- **Étiqueté par mode** — filtrez par Arena / A-B / Matrix / Eval / Génome pour trouver un test passé spécifique
- **Graphique de tendance** avec auto-annotation à chaque point de changement significatif
- **Comparer un test passé à l'état actuel** — utile pour "le prompt actuel est-il encore meilleur que celui que j'ai rejeté il y a trois semaines ?"
- **Exportable** — l'historique de test s'exporte au format CSV pour une analyse externe

### Comment ça marche

Les résultats de test sont stockés dans le même magasin d'exécution que les exécutions de production, avec l'étiquette de mode de test pour le filtrage. La vue Tendances agrège depuis ce magasin ; les auto-annotations sont extraites de l'historique des versions et de l'historique de configuration (qui sont aussi persistants). Rien dans l'historique n'est mutable — les tests passés sont des enregistrements immuables de ce qui a été testé quand.

:::tip
La vue Tendances est le meilleur endroit pour répondre à "mon agent s'améliore-t-il vraiment dans le temps ?" Ouvrez-la une fois par mois ; si la tendance de fitness est plate ou en déclin, les changements récents n'aident pas et il est temps de réfléchir plutôt que d'expédier plus de changements.
:::
  `,
};
