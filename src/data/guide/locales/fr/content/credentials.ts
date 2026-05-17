export const content: Record<string, string> = {
  "how-personas-keeps-your-data-safe": `
## Comment Personas protège vos données

La sécurité est intégrée à Personas dès le départ. Les clés API, les jetons et les mots de passe vivent dans un coffre chiffré local sur votre propre machine — ils ne quittent jamais l'appareil sauf si un agent les envoie explicitement à un fournisseur d'IA ou à un service tiers pendant une exécution. Le fichier coffre lui-même est chiffré avec **AES-256-GCM**, et la clé qui le déverrouille est enveloppée par votre porte-clés natif de l'OS (Windows DPAPI, macOS Keychain, Linux Secret Service) pour que les clés en clair ne restent jamais sur disque.

Quand vous exécutez un agent, le moteur ne déchiffre que les identifiants spécifiques dont cet agent a besoin, les conserve en mémoire pour la durée de l'appel, puis efface le texte en clair. Les journaux, traces et exports ne contiennent jamais de valeurs d'identifiants brutes — partout où un identifiant apparaîtrait, vous voyez une référence par jeton (\`cred:gmail-work\`) à la place.

### Points clés

- **AES-256-GCM** — chiffrement authentifié (le chiffré de chaque identifiant est vérifié en intégrité, donc un fichier coffre altéré est détecté, pas silencieusement déchiffré)
- **Clé maître enveloppée par le porte-clés OS** — DPAPI sur Windows, Keychain sur macOS, Secret Service sur Linux ; pas de mot de passe maître à taper à chaque session
- **Local uniquement par défaut** — rien n'est téléchargé ; le déploiement cloud est opt-in et chiffre en transit via TLS vers l'orchestrateur que vous avez choisi
- **Références par jeton dans les journaux** — les traces et exports d'agents utilisent des ID d'identifiants, pas de secrets bruts
- **Évident en cas d'altération** — les tags d'authentification GCM détectent toute modification du fichier coffre

### Comment ça marche

Stocker un identifiant le chiffre avec la clé du coffre (la clé AES-256-GCM par coffre, elle-même enveloppée par le porte-clés OS) et écrit le chiffré dans SQLite local. Utiliser un identifiant pendant une exécution d'agent le déchiffre en mémoire, le transmet à l'outil ou client HTTP pertinent, et libère le tampon immédiatement. La valeur brute n'est jamais journalisée, jamais affichée après la saisie initiale, et jamais sérialisée nulle part en dehors du coffre chiffré.

### En action

:::usecases
**Plusieurs services, identifiants isolés**
Vos agents parlent à Slack, GitHub et Jira
---
Chaque identifiant est chiffré indépendamment avec son propre nonce aléatoire. Un compromis d'un enregistrement n'expose pas les autres.
===
**Rotation d'identifiants**
Un jeton expire ou est renouvelé
---
Les identifiants OAuth se rafraîchissent automatiquement via le jeton de rafraîchissement du fournisseur. Les clés renouvelées manuellement, vous les échangez sur l'enregistrement de l'identifiant sans redémarrer quoi que ce soit.
===
**Traces favorables à l'audit**
Vous devez prouver quel identifiant a été utilisé où
---
La trace de chaque exécution enregistre l'ID d'identifiant qu'elle a utilisé. La valeur réelle n'apparaît jamais ; l'ID est suffisant pour démontrer la provenance.
:::

:::info
Le coffre est lié à votre compte utilisateur OS via le porte-clés OS. Copier le fichier coffre sur une machine différente, même avec le même OS, ne le rendra pas déchiffrable — la clé d'enveloppement vit dans le porte-clés OS et n'est pas portable.
:::

:::warning
Si vous changez votre mot de passe de compte OS sur macOS ou Linux, le porte-clés peut reverrouiller la clé d'enveloppement. Personas vous demandera le nouvel identifiant lors de la première exécution après le changement. Si le porte-clés est effacé (réinitialisation d'usine, suppression de compte), le coffre devient irrécupérable — sauvegardez les secrets bruts en externe si vous avez besoin de récupération après sinistre au-delà de la machine locale.
:::

:::tip
Le modèle local uniquement est la bonne valeur par défaut pour l'automatisation personnelle. Pour le travail d'équipe / production où plusieurs machines ont besoin des mêmes identifiants, le déploiement cloud (niveau Team / Builder) réplique l'état du coffre via l'orchestrateur avec un chiffrement de bout en bout.
:::
  `,

  "adding-a-new-credential": `
## Ajouter un nouvel identifiant

Ouvrez Connexions → Identifiants et cliquez sur \`Ajouter un identifiant\`. Choisissez une catégorie (e-mail, stockage cloud, paiements, communication, outils de développement, CRM, fournisseur d'IA, générique) — le sélecteur affiche les connecteurs préconstruits correspondants qui configurent automatiquement le type d'authentification, les champs requis et les indices d'étiquette. Si votre service n'est pas dans le catalogue, choisissez "Personnalisé" et définissez l'identifiant vous-même (nom, type, champs).

Pour les services prenant en charge OAuth, le flux ouvre une fenêtre de navigateur vers l'écran de consentement du fournisseur. Pour les services à clé API, collez la clé dans l'entrée sécurisée. Dans les deux cas, l'identifiant arrive chiffré et le sélecteur propose de l'appliquer à tous les agents qui ont un emplacement de capacité ouvert dans la catégorie correspondante.

### Étape par étape

:::steps
1. **Naviguez vers Connexions → Identifiants** — barre latérale → Connexions, puis l'onglet Identifiants
2. **Cliquez sur Ajouter un identifiant** — bouton en haut à droite sur la liste des identifiants
3. **Choisissez une catégorie** — e-mail / stockage / paiements / etc. ; le catalogue de connecteurs correspondants filtre automatiquement
4. **Exécutez le flux d'authentification** — OAuth ouvre une fenêtre de consentement ; les services à clé API utilisent le champ d'entrée sécurisé
5. **Nommez et enregistrez** — donnez à l'identifiant une étiquette que vous reconnaîtrez ("Stripe Live", "Gmail Personnel") ; l'identifiant est chiffré avec AES-256-GCM et persisté
6. **Optionnel : liez aux agents maintenant** — le sélecteur affiche les agents avec des capacités ouvertes correspondantes ; la liaison en un clic évite de les chercher plus tard
:::

### Comment ça marche

Quand vous cliquez sur Enregistrer, la valeur brute de l'identifiant est chiffrée avec la clé du coffre dérivée du porte-clés OS, puis validée dans le magasin d'identifiants. L'enregistrement ne renvoie que l'ID et l'étiquette de l'identifiant — la valeur brute est effacée de la mémoire immédiatement. À partir de ce point, l'onglet Connecteurs de l'éditeur d'agent peut référencer l'identifiant par ID.

:::warning
Ne collez jamais d'identifiants dans les prompts d'agent, les commentaires de code ou les fenêtres de chat. Utilisez uniquement le champ d'entrée sécurisé des identifiants — tout le reste risque que la valeur brute soit capturée dans un journal, une synchronisation ou une capture d'écran.
:::

:::tip
La convention de nommage compte une fois que vous avez 20+ identifiants. \`<service>-<env>-<compte>\` ("stripe-live-main", "gmail-prod-support") indique instantanément quel identifiant choisir quand vous configurez l'onglet Connecteurs d'un agent.
:::
  `,



  "credential-health-checks": `
## Vérifications de santé des identifiants

Les identifiants dérivent avec le temps — les jetons expirent, les clés sont renouvelées en amont, les scopes OAuth changent. Les vérifications de santé des identifiants pingent chaque identifiant stocké périodiquement avec un appel de test léger (une requête API sans effet qui ne coûte rien et vous dit si l'identifiant est toujours valide). Les résultats apparaissent comme un indicateur de statut sur la carte d'identifiant et comme alertes quand un identifiant se dégrade.

Le calendrier de vérification est configurable. Par défaut, les identifiants OAuth vérifient quotidiennement (parce que le flux de jeton de rafraîchissement a besoin que l'identifiant soit exercé périodiquement de toute façon), les identifiants à clé API vérifient hebdomadairement. Les vérifications manuelles peuvent être exécutées à tout moment depuis la carte d'identifiant.

### Points clés

- **Statut par identifiant** — vert (sain), jaune (expirant bientôt / scope changé), rouge (cassé / révoqué)
- **Cadence configurable** — surcharges par identifiant si un service limite le débit de vérification agressive
- **Vérification manuelle** — test en un clic depuis la carte d'identifiant ; utile avant de déployer un nouvel agent
- **Projection d'expiration** — pour les identifiants avec des dates d'expiration connues (JWT signés, jetons scopés), le statut passe au jaune N jours avant l'expiration (configurable, par défaut 7)
- **Acheminement des alertes** — les échecs sont acheminés via les mêmes canaux de notification que vous avez configurés pour les agents

### Comment ça marche

Chaque connecteur définit son propre appel de vérification de santé (la requête la plus légère possible qui exerce l'identifiant). La vérification s'exécute en arrière-plan sur la cadence configurée ; les résultats sont persistés et mettent à jour le statut de l'identifiant. Si une vérification échoue, le statut bascule, la carte d'identifiant se met en évidence, et les agents dépendants héritent de l'avertissement sur leurs propres indicateurs de santé — donc un identifiant Gmail cassé fait que chaque agent utilisant Gmail apparaît jaune jusqu'à ce que vous le répariez.

:::tip
Exécutez une vérification de santé manuelle avant tout déploiement de production ou exécution planifiée nocturne. Cinq secondes maintenant contre une exécution échouée à 3 heures du matin parce qu'un jeton a silencieusement été renouvelé.
:::
  `,

  "auto-credential-browser": `
## Navigateur automatique d'identifiants

Le navigateur automatique d'identifiants est l'onboarding piloté par catalogue pour les nouveaux identifiants. Ouvrez Connexions → Catalogue et vous voyez chaque connecteur que Personas livre préconfiguré : 60+ services au moment de cette rédaction, organisés par catégorie (e-mail, stockage, paiements, communication, outils de développement, CRM, fournisseurs d'IA, etc.). Chaque connecteur connaît le bon type d'authentification, les champs requis, les scopes OAuth, les points de terminaison API et toutes les particularités spécifiques au service.

Quand vous choisissez un connecteur, l'assistant vous guide à travers les étapes exactes pour ce service — y compris des liens vers les pages spécifiques dans l'UI du service où vous trouveriez une clé API, ou quels scopes OAuth approuver, ou quelles permissions comptent. Pour les services où Personas peut détecter une connexion réussie (la plupart d'entre eux), l'assistant vérifie en temps réel avant l'enregistrement.

### Points clés

- **60+ connecteurs préconfigurés** — type d'authentification, champs, scopes, points de terminaison intégrés
- **Conseils spécifiques au service** — liens directs vers la page exacte de clé API ou l'onglet de paramètres
- **Validation en direct** — l'assistant teste l'identifiant avant l'enregistrement pour la plupart des services
- **Flux suggéré pour l'agent** — le catalogue peut également être entré depuis l'onglet Connecteurs d'un agent, où il est filtré aux connecteurs correspondant à l'emplacement de capacité ouvert
- **Demander de nouveaux connecteurs** — les services pas encore dans le catalogue peuvent être demandés ; pour les cas uniques, utilisez le type de connecteur Générique / Personnalisé

### Comment ça marche

Les définitions de connecteurs sont livrées avec l'application et mises à jour via le cycle de version régulier. Chaque définition déclare son flux d'authentification, les champs requis, le point de terminaison de validation et la liste de scopes. Quand vous choisissez un connecteur, l'assistant lit la définition, rend le formulaire correspondant, exécute le flux OAuth ou clé API, et valide avant l'enregistrement. La valeur réelle de l'identifiant est chiffrée au moment de l'enregistrement en utilisant le même chemin qu'un identifiant ajouté manuellement.

:::tip
Le catalogue est également le moyen le plus rapide de découvrir ce qui est intégré. Si vous vous demandez si Personas peut faire X avec le service Y, recherchez d'abord dans le catalogue — si Y y est avec une capacité pertinente, l'intégration est en un clic.
:::
  `,

  "which-agents-use-which-credentials": `
## Quels agents utilisent quels identifiants

L'onglet Dépendances sur Connexions montre le graphe identifiant → agent. Choisissez un identifiant à gauche et vous voyez chaque agent qui le référence à droite, avec l'emplacement de capacité spécifique nommé ("Compte Gmail pour l'agent de résumé d'e-mails"). Choisissez un agent et vous voyez chaque identifiant dont il dépend. Le graphe est bidirectionnel — utile à la fois pour "qu'est-ce qui casse si je renouvelle cette clé ?" et "quels identifiants cet agent a-t-il besoin avant que je puisse le promouvoir ?".

La même carte de dépendances pilote la vérification pré-vol du moteur de construction : quand vous promouvez un agent, le moteur recoupe chaque capacité requise par rapport au coffre et signale les identifiants manquants ou expirés avant d'autoriser la promotion. C'est pourquoi vous n'obtenez presque jamais d'erreur "identifiant introuvable" à l'exécution dans les agents nouvellement créés — la vérification de dépendance a été exécutée au moment de la promotion et l'a attrapée.

### Points clés

- **Graphe bidirectionnel** — identifiant → agents et agent → identifiants
- **Emplacement de capacité nommé** — la dépendance vous dit non seulement "cet identifiant est utilisé" mais "utilisé comme capacité d'envoi d'e-mails"
- **Vérification pré-vol** — validation au moment de la promotion qui utilise le même graphe
- **Aperçu d'impact** — sélectionner un identifiant met en évidence chaque agent qui serait affecté par sa suppression
- **Détection d'identifiants inutilisés** — les identifiants avec zéro dépendance d'agent sont mis en évidence dans le résumé Connexions pour que vous puissiez les nettoyer

### Comment ça marche

L'onglet Connecteurs de chaque agent stocke la référence d'identifiant par emplacement de capacité. La vue Dépendances interroge ce stockage dans les deux directions pour rendre le graphe. Les événements de rotation, expiration ou suppression d'identifiants se propagent à travers le graphe : tout agent dépendant d'un identifiant dégradé hérite de l'état d'avertissement sur son indicateur de santé, donc le graphe n'est pas seulement une référence statique — c'est un chemin de propagation en direct.

:::warning
Avant de renouveler ou supprimer tout identifiant utilisé par un agent sans surveillance (planifié / webhook / chaîne), vérifiez la carte de dépendances et mettez à jour les agents pour qu'ils pointent d'abord vers l'identifiant de remplacement. La vérification pré-vol vous attrape au moment de la promotion ; pour les agents déjà promus, l'échec à l'exécution est le seul signal.
:::

:::tip
Une routine d'audit mensuelle des identifiants : ouvrez Connexions → Dépendances, triez par plus ancien et demandez "est-ce que j'utilise toujours cet identifiant ?" pour la douzaine du bas. Les identifiants inutilisés sont une surface d'attaque pour rien, donc les supprimer est un nettoyage pur.
:::
  `,

  "refreshing-expired-tokens": `
## Renouveler les jetons expirés

Certains identifiants sont limités dans le temps par conception — les jetons d'accès OAuth expirent en minutes à heures ; les jetons émis par les services (jetons de bot Slack, PAT GitHub) ont souvent des expirations de N jours ou N années. Personas suit l'expiration là où le fournisseur la publie et fait apparaître un statut jaune "expirant bientôt" quelques jours avant la coupure (configurable, par défaut 7 jours).

Pour les identifiants OAuth avec un jeton de rafraîchissement, le rafraîchissement est automatique et silencieux en arrière-plan. Pour les clés API et jetons qui ne se rafraîchissent pas, vous verrez l'avertissement jaune et la carte d'identifiant offrira un bouton "Reconnecter" ou "Remplacer" — cliquer dessus ouvre le même assistant qui a créé l'identifiant.

### Points clés

- **Rafraîchissement automatique pour OAuth** — jeton de rafraîchissement utilisé silencieusement ; vous ne voyez pas cela se produire
- **Avertissement avancé pour les identifiants non rafraîchissables** — statut jaune N jours avant l'expiration ; fenêtre d'avertissement configurable
- **Reconnexion en un clic** — la carte d'identifiant a un bouton Reconnecter qui réexécute le flux d'authentification
- **Échange sans interruption** — pour les identifiants avec des agents dépendants actifs, le nouveau jeton remplace l'ancien en place ; les agents prennent la nouvelle valeur lors de leur prochaine exécution
- **L'échec apparaît dans la santé de l'agent** — les identifiants qui échouent à se rafraîchir font passer leurs agents dépendants au jaune / rouge sur l'onglet Santé

### Comment ça marche

Le rafraîchissement s'exécute dans le cadre de la même tâche d'arrière-plan qui fait les vérifications de santé. Pour OAuth, la tâche utilise le jeton de rafraîchissement pour frapper un nouveau jeton d'accès chez le fournisseur et met à jour l'enregistrement d'identifiant. Pour les jetons non rafraîchissables, la tâche ne met à jour que la projection d'expiration (pour que l'avertissement jaune apparaisse au bon moment) ; le remplacement réel est une action manuelle que vous prenez quand l'avertissement se déclenche.

:::tip
Quand un avertissement d'expiration jaune se déclenche, rafraîchissez immédiatement plutôt que d'attendre. Rafraîchir maintenant est une tâche d'une minute. Laisser un agent planifié échouer à 3 heures du matin parce que le jeton a expiré pendant la nuit est beaucoup plus coûteux à démêler que les exécutions manquées.
:::
  `,

  "deleting-credentials-safely": `
## Supprimer les identifiants en toute sécurité

Supprimer un identifiant est permanent — l'enregistrement chiffré est effacé du coffre et il n'y a pas de récupération depuis Personas. Avant que vous ne supprimiez, la carte d'identifiant affiche la vérification de dépendance : chaque agent référençant l'identifiant, dans quel emplacement de capacité, avec ce que serait l'impact. Vous pouvez utiliser le dialogue de suppression pour réaffecter chaque agent dépendant à un identifiant différent avant de confirmer, de sorte que la suppression réelle soit atomique avec la réaffectation.

Pour les identifiants OAuth, la suppression ne supprime que le jeton stocké localement — elle ne révoque pas l'accès côté fournisseur. Si vous voulez également révoquer chez le fournisseur, faites-le sur la page des paramètres de sécurité du fournisseur (un lien est offert dans le dialogue de suppression pour les principaux fournisseurs).

### Points clés

- **Permanent et immédiat** — pas d'annulation ; l'enregistrement chiffré est effacé à la confirmation
- **Vérification de dépendance en amont** — voyez chaque agent dépendant avant de confirmer
- **Réaffectation en ligne** — pointez les agents dépendants vers un identifiant de remplacement dans le cadre du dialogue de suppression
- **Fournisseurs OAuth : suppression locale uniquement par défaut** — la révocation côté fournisseur est une étape séparée (lien fourni)
- **Sans effet sûr pour les identifiants déjà cassés** — supprimer un identifiant expiré / révoqué est toujours sûr ; rien ne dépend de son état fonctionnel

### Comment ça marche

Le dialogue de suppression lit le même graphe de dépendances que la vue Dépendances. Quand vous confirmez, le moteur écrit d'abord toutes les réaffectations que vous avez spécifiées, puis supprime l'enregistrement d'identifiant du coffre en une seule transaction. Si les réaffectations échouent à la validation (par ex. vous avez essayé de pointer vers un identifiant de la mauvaise catégorie), la suppression est annulée et rien ne change.

:::warning
Permanent signifie permanent. L'enregistrement chiffré est effacé, et si vous n'avez pas noté le secret brut ailleurs, il est parti. Si vous pourriez avoir besoin de l'identifiant à nouveau, sauvegardez la valeur brute en externe avant la suppression.
:::

:::tip
Le modèle de rotation le plus sûr est "ajouter le nouveau, réaffecter tous les agents, puis supprimer l'ancien". Ajoutez d'abord l'identifiant de remplacement, parcourez la carte de dépendances pour réaffecter les agents dépendants un par un (ou tous en même temps dans le dialogue de réaffectation), vérifiez que tout est sain, puis supprimez l'ancien identifiant. Cette séquence garantit zéro temps d'arrêt.
:::
  `,

  "connector-catalog": `
## Catalogue de connecteurs

Le catalogue à Connexions → Catalogue est la liste curatée des services avec lesquels Personas s'intègre dès la sortie de la boîte. Au moment de cette rédaction, 60+ connecteurs sur 9 catégories, avec de nouveaux connecteurs ajoutés à chaque version en fonction de la demande des utilisateurs. Chaque connecteur déclare son type d'authentification (OAuth, clé API, authentification basique, jeton de bot), les scopes / capacités requis et la surface d'outils côté agent qu'il expose.

Quand l'onglet Connecteurs d'un agent a besoin d'une capacité ("envoi d'e-mails", "écriture de stockage cloud", "envoi de message de chat"), il interroge le catalogue pour les connecteurs qui satisfont cette capacité, puis correspond à votre coffre. Si vous avez déjà un identifiant pour l'un de ces connecteurs, c'est une correspondance immédiate. Sinon, le catalogue propose d'en ajouter un — ouvrant le même assistant décrit dans le sujet du Navigateur automatique d'identifiants.

### Catégories de connecteurs

| Catégorie | Exemples de services | Authentification |
|---|---|---|
| E-mail | Gmail, Outlook, IMAP/SMTP | OAuth / API |
| Stockage Cloud | Google Drive, Dropbox, OneDrive, S3, Drive local | OAuth / API |
| Paiements | Stripe, PayPal, Square | Clé API |
| Social | Twitter/X, LinkedIn, Facebook, Mastodon | OAuth |
| Outils de développement | GitHub, GitLab, Jira, Linear, Sentry | OAuth / API |
| Communication | Slack, Discord, Microsoft Teams, Telegram, webhook générique | OAuth / jeton de bot |
| CRM | Salesforce, HubSpot, Pipedrive | OAuth / API |
| Fournisseurs d'IA | Anthropic, OpenAI, Google, Ollama local, compatible OpenAI personnalisé | API |
| Données | Postgres, Snowflake, BigQuery, SQL/HTTP générique | URL + identifiants |

### Points clés

- **Correspondance basée sur les capacités** — les connecteurs exposent des capacités ; les agents ont besoin de capacités ; le catalogue les fait correspondre
- **Particularités spécifiques au service intégrées** — ID d'espace de travail Slack, scopes de PAT GitHub, URLs de rappel OAuth, etc., tous préconfigurés
- **Indicateurs de type d'authentification** — d'un coup d'œil, voyez quels connecteurs sont OAuth vs clé API vs locaux
- **Repli générique / personnalisé** — pour les services pas dans le catalogue, le type de connecteur Générique accepte une configuration HTTP/REST brute
- **Connecteurs de livraison de canal** — Slack, Discord, Teams, webhook générique apparaissent ici également pour la sortie sortante d'agent (configuré par agent sur l'onglet Connecteurs)

### Comment ça marche

Les définitions de connecteurs vivent dans l'application et sont versionnées avec le binaire. L'onglet Connecteurs sur chaque agent interroge le catalogue dynamiquement — ajouter un connecteur au catalogue (dans une version) le rend disponible aux agents existants sans aucune migration par agent. Les connecteurs personnalisés / génériques que vous configurez localement sont à portée de coffre et ne passent pas par le catalogue.

:::tip
Le catalogue est également une surface de découverte. Parcourez occasionnellement même quand vous n'avez pas de besoin spécifique — vous trouverez souvent une intégration qui suggère une nouvelle automatisation. La catégorie Communication en particulier est riche pour les cas d'utilisation côté sortie (livraison des résultats d'agent à Slack / Discord / Teams).
:::
  `,
};
