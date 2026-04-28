#!/usr/bin/env node
/**
 * Génère skills-docs/index.html — notice complète de chaque skill en français.
 * Relancé automatiquement après `npx skills add/install/update`.
 */
import fs from "fs";
import path from "path";
import os from "os";

const HOME = os.homedir();
const OUT = path.join(import.meta.dirname, "index.html");

// ── Contenu enrichi par skill ──────────────────────────────────────────────
// desc   : à quoi ça sert (1-2 phrases)
// peux   : ce que tu peux faire (liste)
// dois   : ce que tu dois faire / prérequis (liste)
// ex     : exemples de commandes
const SKILL_DATA = {
  "agent-browser": {
    desc: "CLI en Rust qui pilote Chrome nativement via CDP. Automatise n'importe quelle interaction dans un navigateur web ou une app Electron.",
    peux: [
      "Naviguer sur n'importe quel site web",
      "Remplir et soumettre des formulaires",
      "Cliquer des boutons, extraire du texte, prendre des screenshots",
      "Scraper des données structurées depuis des pages",
      "Tester un tunnel de paiement ou un onboarding",
      "Automatiser des apps Electron : VS Code, Slack, Figma, Notion, Spotify",
      "Lire les messages Slack, envoyer des messages",
      "Faire du QA exploratoire et des bug hunts",
    ],
    dois: [
      "Lancer `agent-browser install` une fois pour télécharger Chrome",
      "Invoquer `/agent-browser` avant toute tâche de navigation",
      "Pour les apps Electron : charger le skill `/agent-browser skills get electron`",
    ],
    ex: [
      "/agent-browser — ouvre example.com et prends un screenshot",
      "/agent-browser — teste le tunnel de paiement de mon app",
      "/agent-browser — scrape les prix depuis cette URL",
      "/agent-browser — vérifie que le formulaire de contact fonctionne",
    ],
  },
  "impeccable": {
    desc: "23 commandes de design frontend qui combattent les patterns 'AI slop' — Inter, gradients violets, cards dans des cards — et les remplacent par des choix visuels distinctifs.",
    peux: [
      "Auditer une interface : a11y, performance, responsive (`audit`)",
      "Critiquer l'UX : hiérarchie, clarté, charge cognitive (`critique`)",
      "Polir une page avant livraison client (`polish`)",
      "Amplifier un design trop fade (`bolder`) ou calmer un design trop chargé (`quieter`)",
      "Ajouter du mouvement purposeful : animations, transitions (`animate`)",
      "Corriger la typographie, les tailles, les polices (`typeset`)",
      "Adapter un design pour mobile/tablette (`adapt`)",
      "Générer PRODUCT.md et DESIGN.md pour cadrer un projet (`teach`)",
      "Itérer visuellement en temps réel dans le navigateur (`live`)",
    ],
    dois: [
      "Être dans un projet avec du code frontend (HTML, React, Vue…)",
      "Pointer sur la page ou le composant à améliorer",
      "En début de projet : lancer `/impeccable teach` pour créer DESIGN.md",
      "Pour des effets avancés : avoir un accès preview navigateur actif",
    ],
    ex: [
      "/impeccable audit landing",
      "/impeccable critique hero section",
      "/impeccable polish settings page",
      "/impeccable bolder — le design est trop fade",
      "/impeccable animate — ajouter de la vie aux boutons",
      "/impeccable live — itérer sur le header dans le browser",
    ],
  },
  "vault-pkm": {
    desc: "Pont bidirectionnel entre Claude Code et ton vault Obsidian. 20 outils MCP pour lire, écrire, rechercher et maintenir ta base de connaissances personnelle.",
    peux: [
      "Lire et écrire des notes Markdown dans ton vault",
      "Faire des recherches full-text dans toutes tes notes",
      "Faire des recherches sémantiques par sens (avec clé OpenAI)",
      "Créer des notes structurées depuis des templates",
      "Explorer le graphe de liens (wikilinks entrants/sortants)",
      "Auditer les liens cassés, orphelins, ambigus",
      "Charger automatiquement le contexte projet à chaque session",
      "Déplacer et renommer des notes en mettant à jour les liens",
    ],
    dois: [
      "Avoir VAULT_PATH configuré dans ~/.claude/settings.json",
      "Lancer `/vault-pkm:setup` une fois après installation",
      "Lancer `/vault-pkm:init-project` dans chaque projet à connecter",
      "Avoir une clé VAULT_PKM_OPENAI_KEY pour la recherche sémantique (optionnel)",
    ],
    ex: [
      "vault_append — ajoute une entrée dans le devlog du projet",
      "vault_semantic_search — retrouve mes notes sur HeyGen",
      "vault_link_health — vérifie les liens cassés dans mon vault",
      "vault_query — liste toutes les tâches ouvertes",
    ],
  },
  "systematic-debugging": {
    desc: "Protocole de débogage structuré par hypothèses. Force une analyse rigoureuse avant toute modification du code.",
    peux: [
      "Diagnostiquer un bug en isolant sa cause racine",
      "Analyser un test qui échoue sans toucher le code trop vite",
      "Documenter les hypothèses testées et les résultats",
      "Éviter les fixes cosmétiques qui masquent le vrai problème",
    ],
    dois: [
      "Invoquer AVANT d'écrire le moindre fix",
      "Fournir les logs, messages d'erreur ou comportement observé",
      "Laisser Claude formuler des hypothèses avant de les valider",
    ],
    ex: [
      "/systematic-debugging — la fonction parseDate retourne undefined",
      "/systematic-debugging — le test d'intégration échoue en CI mais pas en local",
    ],
  },
  "test-driven-development": {
    desc: "Applique la discipline TDD : écrire les tests en premier, puis le code qui les fait passer. Garantit une couverture réelle et un design orienté contrat.",
    peux: [
      "Écrire les tests unitaires et d'intégration avant l'implémentation",
      "Définir le contrat d'une fonction à partir de ses cas d'usage",
      "Implémenter en cycles red→green→refactor",
      "Vérifier que la couverture est réelle et non cosmétique",
    ],
    dois: [
      "Invoquer AVANT d'écrire le code de la feature",
      "Avoir un framework de test configuré (Jest, Vitest, pytest…)",
      "Accepter que les tests échouent au début — c'est normal",
    ],
    ex: [
      "/test-driven-development — implémente la validation de numéro IBAN",
      "/test-driven-development — ajoute la logique de calcul de remise",
    ],
  },
  "writing-plans": {
    desc: "Transforme un spec ou des requirements flous en plan d'implémentation structuré avec étapes, dépendances et risques identifiés.",
    peux: [
      "Décomposer une tâche complexe en étapes atomiques",
      "Identifier les dépendances entre tâches",
      "Anticiper les risques et blocages potentiels",
      "Produire un plan que tu valides avant tout code",
    ],
    dois: [
      "Invoquer AVANT de toucher le code, pas après",
      "Avoir un spec, une description de feature ou un brief client",
      "Valider le plan avant de passer à l'exécution",
    ],
    ex: [
      "/writing-plans — intégrer le webhook Stripe pour les remboursements",
      "/writing-plans — migrer la base de données vers PostgreSQL",
    ],
  },
  "executing-plans": {
    desc: "Exécute un plan d'implémentation existant dans une session dédiée, avec des points de contrôle après chaque étape.",
    peux: [
      "Dérouler un plan écrit étape par étape",
      "Faire une review à chaque checkpoint avant de continuer",
      "Garder la session principale propre pendant l'exécution",
      "Reprendre un plan interrompu sans perdre le fil",
    ],
    dois: [
      "Avoir un plan écrit au préalable (via `/writing-plans` ou manuellement)",
      "Valider chaque étape avant de passer à la suivante",
    ],
    ex: [
      "/executing-plans — exécute le plan dans tasks/todo.md",
    ],
  },
  "verification-before-completion": {
    desc: "Bloque toute déclaration de 'tâche terminée' sans preuve. Exige l'exécution des commandes de vérification et la confirmation des résultats.",
    peux: [
      "Vérifier qu'une feature fonctionne réellement avant de la déclarer done",
      "Éviter les faux positifs ('les tests passent' sans les avoir lancés)",
      "Documenter la preuve de bon fonctionnement",
    ],
    dois: [
      "Invoquer AVANT tout commit, PR ou message 'c'est fait'",
      "Avoir les commandes de test ou de vérification disponibles",
    ],
    ex: [
      "/verification-before-completion — avant de merger la PR #42",
    ],
  },
  "requesting-code-review": {
    desc: "Structure une demande de code review rigoureuse : contexte, changements, tests effectués, points d'attention.",
    peux: [
      "Préparer une review request complète et actionnable",
      "Mettre en évidence les choix d'implémentation à discuter",
      "Vérifier que le code est prêt à être reviewé avant de demander",
    ],
    dois: [
      "Avoir une implémentation complète et testée",
      "Invoquer avant de soumettre une PR ou de demander une review",
    ],
    ex: [
      "/requesting-code-review — PR de refactoring du module auth",
    ],
  },
  "receiving-code-review": {
    desc: "Analyse le feedback reçu d'une code review avec rigueur : distingue les suggestions valides des opinions non fondées avant d'implémenter quoi que ce soit.",
    peux: [
      "Évaluer chaque commentaire de review techniquement",
      "Questionner les suggestions floues ou contre-productives",
      "Implémenter seulement ce qui est réellement justifié",
    ],
    dois: [
      "Avoir les commentaires de review en main",
      "Invoquer AVANT de toucher le code en réponse à une review",
    ],
    ex: [
      "/receiving-code-review — le reviewer dit de tout refactorer en classes",
    ],
  },
  "finishing-a-development-branch": {
    desc: "Guide la fin d'une branche de développement : présente les options (merge direct, PR, squash, cleanup) et aide à choisir la bonne stratégie.",
    peux: [
      "Choisir entre merge, PR ou squash selon le contexte",
      "Vérifier que la branche est prête avant toute intégration",
      "Nettoyer les commits et préparer un changelog",
    ],
    dois: [
      "Avoir une implémentation complète avec tests passants",
      "Invoquer quand tu es prêt à intégrer, pas avant",
    ],
    ex: [
      "/finishing-a-development-branch — feature/stripe-webhooks",
    ],
  },
  "brainstorming": {
    desc: "Exploration structurée avant tout travail créatif : clarifie l'intention, explore les approches, évalue les trade-offs avant de coder.",
    peux: [
      "Clarifier les requirements flous ou contradictoires",
      "Explorer plusieurs approches techniques avant de choisir",
      "Identifier les risques et contraintes d'une feature",
      "Aligner sur l'intention avant de toucher le code",
    ],
    dois: [
      "Invoquer AVANT toute création de feature ou composant",
      "Laisser l'exploration se faire — ne pas forcer une solution",
    ],
    ex: [
      "/brainstorming — comment implémenter le système de notifications ?",
      "/brainstorming — architecture de la gestion des permissions",
    ],
  },
  "ui-ux-pro-max": {
    desc: "Intelligence de design étendue : 67 styles visuels, 96 palettes, 57 pairings de polices, 13 stacks front (React, Next, Vue, Svelte, Flutter, SwiftUI, Tailwind, shadcn…).",
    peux: [
      "Créer une interface dans n'importe quel style : glassmorphism, brutalism, bento grid, neumorphism, skeuomorphism…",
      "Générer des dashboards, landing pages, panels admin, apps mobile",
      "Choisir une palette de couleurs et un système typographique cohérent",
      "Intégrer shadcn/ui, Tailwind, Framer Motion",
      "Corriger accessibilité, animations, responsive, ombres, gradients",
    ],
    dois: [
      "Préciser le style visuel souhaité si tu en as un",
      "Avoir un projet frontend actif (ou décrire ce que tu veux créer)",
    ],
    ex: [
      "/ui-ux-pro-max — crée un dashboard dark glassmorphism en Next.js",
      "/ui-ux-pro-max — landing page brutalist pour un outil CLI",
      "/ui-ux-pro-max — refais le formulaire d'inscription, trop générique",
    ],
  },
  "design-html": {
    desc: "Génère du HTML/CSS pur pour des interfaces visuelles. Idéal pour des maquettes rapides, des emails ou des composants standalone.",
    peux: [
      "Créer une maquette HTML/CSS sans framework",
      "Générer un template d'email responsive",
      "Prototyper une interface rapidement",
    ],
    dois: [
      "Décrire l'interface souhaitée avec ses contraintes visuelles",
    ],
    ex: [
      "/design-html — une page de confirmation de commande minimaliste",
    ],
  },
  "design-consultation": {
    desc: "Session de consultation design : définit la direction visuelle, les contraintes et le public cible avant de produire quoi que ce soit.",
    peux: [
      "Définir une charte visuelle cohérente pour un projet",
      "Aligner sur les valeurs, le ton et l'identité visuelle",
      "Choisir stack, typographie et palette avant de coder",
    ],
    dois: [
      "Invoquer en tout début de projet ou avant une refonte",
      "Avoir des références visuelles ou un brief client si possible",
    ],
    ex: [
      "/design-consultation — on démarre la refonte de claresai.com",
    ],
  },
  "design-shotgun": {
    desc: "Génère plusieurs directions visuelles différentes en une passe pour choisir la plus forte. Exploration rapide multi-variantes.",
    peux: [
      "Produire 3-5 interprétations visuelles d'une même interface",
      "Comparer des directions opposées (minimaliste vs dramatique)",
      "Trouver la direction sans s'engager trop tôt",
    ],
    dois: [
      "Décrire le contexte et le public cible",
      "Accepter que les résultats soient divergents — c'est le but",
    ],
    ex: [
      "/design-shotgun — hero section pour une app SaaS B2B",
    ],
  },
  "design-review": {
    desc: "Review design technique : vérifie la cohérence du système de design, les espacements, la hiérarchie visuelle et les anti-patterns.",
    peux: [
      "Identifier les incohérences dans un système de design existant",
      "Vérifier que les tokens sont bien appliqués",
      "Repérer les violations de la charte visuelle",
    ],
    dois: [
      "Avoir du code frontend à reviewer",
    ],
    ex: [
      "/design-review — components/Button.tsx et ses variantes",
    ],
  },
  "dispatching-parallel-agents": {
    desc: "Orchestre plusieurs sous-agents en parallèle pour traiter des tâches indépendantes simultanément et réduire le temps d'exécution.",
    peux: [
      "Lancer 2+ tâches en parallèle sans état partagé",
      "Réduire le temps total d'une session complexe",
      "Garder le contexte principal propre",
    ],
    dois: [
      "S'assurer que les tâches sont vraiment indépendantes",
      "Invoquer quand tu as un ensemble de tâches clairement définies",
    ],
    ex: [
      "/dispatching-parallel-agents — écrire les tests + documenter l'API + migrer les styles",
    ],
  },
  "subagent-driven-development": {
    desc: "Exécute un plan d'implémentation en déléguant chaque tâche à un sous-agent dédié dans la session courante.",
    peux: [
      "Implémenter un plan complexe sans polluer le contexte principal",
      "Isoler chaque tâche dans son propre contexte d'exécution",
      "Paralléliser l'implémentation de tâches indépendantes",
    ],
    dois: [
      "Avoir un plan d'implémentation écrit et validé",
      "S'assurer que les tâches peuvent être exécutées indépendamment",
    ],
    ex: [
      "/subagent-driven-development — exécute le plan de migration v2",
    ],
  },
  "using-git-worktrees": {
    desc: "Crée des worktrees git isolés pour travailler sur une feature sans polluer l'espace de travail courant. Idéal pour les expérimentations risquées.",
    peux: [
      "Tester une feature dans un répertoire isolé",
      "Travailler sur plusieurs branches simultanément",
      "Expérimenter sans risquer de casser la branche principale",
    ],
    dois: [
      "Être dans un repo git",
      "Invoquer avant de démarrer un travail risqué ou expérimental",
    ],
    ex: [
      "/using-git-worktrees — avant de tester la migration Prisma",
    ],
  },
  "writing-skills": {
    desc: "Guide pour créer, modifier ou valider des skills Claude Code. Inclut les conventions, la structure SKILL.md et les tests de déploiement.",
    peux: [
      "Créer un nouveau skill personnalisé pour tes workflows",
      "Modifier un skill existant pour l'adapter à ton contexte",
      "Valider qu'un skill fonctionne avant de le partager",
    ],
    dois: [
      "Comprendre le format frontmatter SKILL.md",
      "Tester le skill dans une session réelle avant de le publier",
    ],
    ex: [
      "/writing-skills — crée un skill /claresai-pipeline",
    ],
  },
  "using-superpowers": {
    desc: "Meta-skill : explique comment trouver et utiliser tous les skills disponibles. À invoquer au démarrage d'une conversation pour activer le toolkit complet.",
    peux: [
      "Découvrir tous les skills disponibles dans la session",
      "Comprendre comment les invoquer correctement",
      "Activer le mode 'superpowers' pour des réponses optimales",
    ],
    dois: [
      "Invoquer au tout début d'une conversation importante",
    ],
    ex: [
      "/using-superpowers",
    ],
  },
  "browse": {
    desc: "Navigation web via le browser gstack. À utiliser pour TOUTE navigation — ne jamais utiliser les outils Chrome MCP directement.",
    peux: [
      "Ouvrir n'importe quelle URL et lire son contenu",
      "Naviguer dans des pages nécessitant JavaScript",
      "Extraire du texte, des liens ou des données structurées",
    ],
    dois: [
      "Toujours utiliser `/browse` — jamais les outils `mcp__Claude_in_Chrome__*` directement",
      "Fournir l'URL complète",
    ],
    ex: [
      "/browse https://docs.anthropic.com/claude-code",
      "/browse — lis la page de pricing de ce concurrent",
    ],
  },
  "qa": {
    desc: "Workflow QA complet : teste l'app dans le navigateur, identifie les régressions, documente les bugs trouvés avec reproduction steps.",
    peux: [
      "Tester les flows principaux d'une application web",
      "Détecter des régressions visuelles et fonctionnelles",
      "Produire un rapport de bugs structuré",
    ],
    dois: [
      "Avoir un serveur de dev actif",
      "Décrire les flows à tester",
    ],
    ex: [
      "/qa — teste l'onboarding complet de claresai",
    ],
  },
  "ship": {
    desc: "Workflow end-to-end pour shipper une feature : implémentation, tests, review, deploy. Un seul skill pour tout le cycle.",
    peux: [
      "Finir et déployer une feature de A à Z",
      "Avoir un checklist de livraison automatique",
      "Ne rien oublier avant un deploy en prod",
    ],
    dois: [
      "Avoir une feature implémentée ou en cours",
      "Avoir les accès de déploiement configurés",
    ],
    ex: [
      "/ship — feature/stripe-refunds",
    ],
  },
  "retro": {
    desc: "Rétrospective structurée : ce qui a bien marché, ce qui a bloqué, actions concrètes pour la prochaine itération.",
    peux: [
      "Analyser une sprint, une release ou un incident",
      "Identifier les patterns de blocage récurrents",
      "Produire des actions concrètes et assignables",
    ],
    dois: [
      "Avoir du contexte sur la période à analyser",
    ],
    ex: [
      "/retro — sprint 12, livraison du module vidéo",
    ],
  },
  "investigate": {
    desc: "Investigation approfondie d'un problème ou d'un sujet technique. Structure la recherche, formule des hypothèses et synthétise les findings.",
    peux: [
      "Investiguer la cause d'un incident ou d'une dégradation",
      "Analyser un sujet technique inconnu",
      "Produire un rapport d'investigation structuré",
    ],
    dois: [
      "Décrire le problème ou le sujet à investiguer",
      "Fournir les données disponibles (logs, métriques, code…)",
    ],
    ex: [
      "/investigate — pourquoi les vidéos HeyGen ont une lip-sync décalée",
    ],
  },
  "plan-eng-review": {
    desc: "Review d'un plan technique depuis une perspective ingénierie : faisabilité, risques, alternatives, dette technique.",
    peux: [
      "Évaluer la solidité technique d'un plan",
      "Identifier les risques et les lacunes",
      "Suggérer des alternatives plus robustes",
    ],
    dois: [
      "Avoir un plan écrit à soumettre",
    ],
    ex: [
      "/plan-eng-review — plan de migration vers microservices",
    ],
  },
  "plan-ceo-review": {
    desc: "Review d'un plan depuis une perspective CEO/business : ROI, priorités, alignement stratégique, go/no-go.",
    peux: [
      "Évaluer si un plan vaut l'investissement",
      "Identifier les risques business et les dépendances",
      "Arbitrer entre plusieurs options stratégiques",
    ],
    dois: [
      "Avoir un plan ou une proposition à évaluer",
    ],
    ex: [
      "/plan-ceo-review — roadmap Q3 : 3 features vs refactoring",
    ],
  },
  "careful": {
    desc: "Mode d'exécution ultra-prudent, étape par étape avec confirmation avant chaque action destructive ou irréversible.",
    peux: [
      "Exécuter des opérations risquées en mode sécurisé",
      "Avoir un point de contrôle avant chaque action critique",
      "Éviter les erreurs irréversibles sur la prod ou les données",
    ],
    dois: [
      "Invoquer quand l'opération est risquée ou irréversible",
      "Être prêt à confirmer chaque étape",
    ],
    ex: [
      "/careful — supprime les anciennes entrées de la DB",
      "/careful — déploie la mise à jour des permissions",
    ],
  },
  "canary": {
    desc: "Déploiement canary : déploie progressivement avec surveillance et rollback automatique si une métrique dépasse le seuil.",
    peux: [
      "Déployer vers 5% des utilisateurs avant un rollout complet",
      "Surveiller les erreurs et la latence en temps réel",
      "Faire un rollback automatique si quelque chose déraille",
    ],
    dois: [
      "Avoir une infrastructure de déploiement progressif configurée",
      "Définir les métriques de santé à surveiller",
    ],
    ex: [
      "/canary — déploie v2.3.0 sur 10% du trafic",
    ],
  },
  "autoplan": {
    desc: "Génère automatiquement un plan d'implémentation structuré à partir d'une description de tâche en langage naturel.",
    peux: [
      "Obtenir un plan détaillé sans écrire le spec soi-même",
      "Démarrer rapidement sur une tâche complexe",
      "Avoir une structure pour guider l'implémentation",
    ],
    dois: [
      "Décrire clairement ce que tu veux implémenter",
      "Valider le plan avant de le lancer",
    ],
    ex: [
      "/autoplan — ajoute un système de notifications push",
    ],
  },
  "freeze": {
    desc: "Gèle les modifications sur le code. Aucune écriture autorisée tant que `/unfreeze` n'a pas été invoqué.",
    peux: [
      "Protéger le code pendant une période de stabilisation",
      "Empêcher toute modification accidentelle avant une release",
      "Forcer une review avant de reprendre le dev",
    ],
    dois: [
      "Invoquer `/unfreeze` explicitement pour reprendre le travail",
    ],
    ex: [
      "/freeze — freeze avant la démo client de demain",
    ],
  },
  "benchmark": {
    desc: "Mesure et compare les performances : temps d'exécution, mémoire, throughput. Produit des rapports avec graphes comparatifs.",
    peux: [
      "Benchmarker une fonction ou un endpoint",
      "Comparer deux implémentations",
      "Identifier les goulots d'étranglement",
    ],
    dois: [
      "Décrire ce qu'on mesure et dans quelles conditions",
    ],
    ex: [
      "/benchmark — compare l'ancienne et la nouvelle implémentation du parser",
    ],
  },
  "benchmark-models": {
    desc: "Compare plusieurs modèles Claude sur une même tâche : qualité de réponse, vitesse, coût. Aide à choisir le modèle optimal.",
    peux: [
      "Choisir entre Sonnet, Opus et Haiku pour un cas d'usage",
      "Mesurer objectivement la qualité vs le coût",
    ],
    dois: [
      "Définir la tâche et les critères d'évaluation",
    ],
    ex: [
      "/benchmark-models — pour la génération de scripts vidéo Claresai",
    ],
  },
  "review": {
    desc: "Code review approfondie : qualité, sécurité, performance, maintenabilité. Produit des findings priorisés avec suggestions concrètes.",
    peux: [
      "Auditer un fichier, un module ou une PR complète",
      "Identifier les vulnérabilités de sécurité",
      "Repérer les problèmes de performance et de maintenabilité",
    ],
    dois: [
      "Pointer sur le code à reviewer",
    ],
    ex: [
      "/review — handlers/payment.js",
      "/review — PR #42 complète",
    ],
  },
  "learn": {
    desc: "Workflow d'apprentissage guidé sur un sujet technique ou un nouvel outil. Adapte le niveau d'explication à ton contexte.",
    peux: [
      "Comprendre rapidement une nouvelle technologie",
      "Obtenir des exemples concrets adaptés à ton stack",
      "Identifier quoi retenir en priorité",
    ],
    dois: [
      "Décrire ton niveau actuel sur le sujet",
      "Préciser l'objectif concret (ce que tu veux pouvoir faire après)",
    ],
    ex: [
      "/learn — comprendre sqlite-vec pour la recherche sémantique",
      "/learn — les hooks React useCallback et useMemo",
    ],
  },
  "project-routine": {
    desc: "Routine complète à appliquer au démarrage de chaque session : lire les fichiers de contexte, vérifier les MCP, choisir le modèle, appliquer les leçons.",
    peux: [
      "Reprendre exactement là où tu t'étais arrêté",
      "Appliquer toutes les leçons passées avant de coder",
      "Vérifier que l'environnement (MCP, permissions) est correct",
    ],
    dois: [
      "Avoir tasks/todo.md, tasks/lessons.md et tasks/projects.md à jour",
      "Invoquer au tout début de chaque session",
    ],
    ex: [
      "/project-routine",
    ],
  },
  "claude-council": {
    desc: "Simule un conseil IA multi-perspectives (technique, business, design, risque) qui débat et rend un verdict clair avec une action concrète.",
    peux: [
      "Obtenir un avis multi-dimensions sur une décision importante",
      "Débloquer une décision difficile avec des arguments structurés",
      "Évaluer les risques d'une option stratégique",
    ],
    dois: [
      "Formuler la question clairement",
      "Fournir le contexte : stack, contraintes, enjeux",
    ],
    ex: [
      "/ask-the-council — doit-on migrer vers une architecture microservices ?",
      "/ask-the-council — React Native ou Flutter pour la prochaine app ?",
      "/ask-the-council — quel pricing pour Claresai ?",
    ],
  },
  "context-save": {
    desc: "Sauvegarde le contexte critique de la session courante avant une compaction, une pause longue ou une fin de journée.",
    peux: [
      "Préserver les décisions importantes avant `/compact`",
      "Documenter l'état exact pour reprendre sans perte",
    ],
    dois: [
      "Invoquer avant toute compaction ou longue pause",
    ],
    ex: [
      "/context-save — avant la compaction de fin de session",
    ],
  },
  "context-restore": {
    desc: "Recharge le contexte sauvegardé au démarrage d'une nouvelle session pour reprendre exactement là où on s'était arrêté.",
    peux: [
      "Reprendre une session après une interruption sans réexpliquer",
      "Restaurer les décisions et l'état du travail en cours",
    ],
    dois: [
      "Avoir fait un `/context-save` au préalable",
    ],
    ex: [
      "/context-restore — reprends où on était hier",
    ],
  },
  "health": {
    desc: "Vérifie l'état du workspace : MCP actifs, skills chargés, permissions configurées, usage du contexte, modèle actif.",
    peux: [
      "Diagnostiquer pourquoi un skill ou MCP ne répond pas",
      "Vérifier que tout l'environnement est bien configuré",
    ],
    dois: [
      "Invoquer quand quelque chose ne semble pas fonctionner",
    ],
    ex: [
      "/health",
    ],
  },
  "heygen-skills": {
    desc: "Toolkit HeyGen : génération de vidéos avatar IA, gestion des jobs de génération, récupération des MP4 finaux. Intègre le pipeline Claresai.",
    peux: [
      "Lancer une génération vidéo HeyGen depuis Claude",
      "Suivre l'état d'un job de génération",
      "Récupérer et nommer le fichier MP4 produit",
      "Gérer les erreurs de génération (lip-sync, fps, résolution)",
    ],
    dois: [
      "Avoir HEYGEN_API_KEY dans ~/.claude/settings.json (section env)",
      "Lire PIPELINE.md de Claresai avant tout module vidéo",
      "Toujours ffprobe la source avant de lancer la génération",
    ],
    ex: [
      "/heygen-skills — génère la vidéo du module 3 avec Rebecca",
    ],
  },
  "make-pdf": {
    desc: "Génère un PDF propre depuis du contenu Markdown ou HTML. Idéal pour les livrables clients, rapports et documentation exportée.",
    peux: [
      "Exporter une note Markdown en PDF formaté",
      "Créer un livrable client depuis du contenu existant",
      "Générer une documentation au format imprimable",
    ],
    dois: [
      "Avoir le contenu à convertir (fichier .md ou .html)",
    ],
    ex: [
      "/make-pdf — tasks/rapport-audit.md",
    ],
  },
  "setup-deploy": {
    desc: "Configure le déploiement pour un projet : Vercel, VPS, Docker, GitHub Pages. Génère les fichiers de config et les commandes de déploiement.",
    peux: [
      "Configurer un premier déploiement sur Vercel ou Netlify",
      "Générer un Dockerfile et docker-compose.yml",
      "Mettre en place un pipeline CI/CD basique",
    ],
    dois: [
      "Avoir un projet avec un build fonctionnel",
      "Connaître la plateforme cible",
    ],
    ex: [
      "/setup-deploy — déploie cette app Next.js sur Vercel",
    ],
  },
  "document-release": {
    desc: "Génère la documentation de release : changelog structuré, notes de version, guide de migration pour les breaking changes.",
    peux: [
      "Produire un CHANGELOG.md à partir des commits",
      "Rédiger des release notes pour les utilisateurs",
      "Documenter les breaking changes et la procédure de migration",
    ],
    dois: [
      "Avoir un historique git propre avec des messages de commit Conventional Commits",
    ],
    ex: [
      "/document-release — v3.0.0 du plugin vault-pkm",
    ],
  },
  "landing-report": {
    desc: "Audit et rapport complet d'une landing page : conversion, copywriting, CTA, hiérarchie visuelle, performance, SEO.",
    peux: [
      "Identifier pourquoi une landing page ne convertit pas",
      "Obtenir des recommandations priorisées par impact",
      "Comparer avec les best practices du secteur",
    ],
    dois: [
      "Fournir l'URL de la page ou le code source",
    ],
    ex: [
      "/landing-report — https://claresai.com",
    ],
  },
  "pair-agent": {
    desc: "Active le mode pair programming avec un sous-agent dédié : l'un code, l'autre review en temps réel.",
    peux: [
      "Avoir une deuxième lecture critique en temps réel",
      "Détecter les erreurs pendant l'implémentation, pas après",
      "Alterner les rôles driver/navigator",
    ],
    dois: [
      "Décrire la tâche à implémenter en pair",
    ],
    ex: [
      "/pair-agent — implémente le module de parsing des factures",
    ],
  },
};

// ── Catégories ─────────────────────────────────────────────────────────────
const CATEGORIES = {
  new: {
    label: "Récemment installés",
    color: "#e8c547", tagClass: "new",
    ids: ["agent-browser", "impeccable", "vault-pkm"],
  },
  dev: {
    label: "Workflow de développement",
    color: "#5ee7c4", tagClass: "dev",
    ids: ["systematic-debugging","test-driven-development","writing-plans","executing-plans","verification-before-completion","requesting-code-review","receiving-code-review","finishing-a-development-branch","brainstorming"],
  },
  design: {
    label: "Design & UI",
    color: "#c084fc", tagClass: "design",
    ids: ["impeccable","ui-ux-pro-max","design-html","design-consultation","design-shotgun","design-review"],
  },
  agent: {
    label: "Agents & Architecture",
    color: "#60a5fa", tagClass: "agent",
    ids: ["dispatching-parallel-agents","subagent-driven-development","using-git-worktrees","writing-skills","using-superpowers","pair-agent"],
  },
  gstack: {
    label: "Gstack",
    color: "#fb923c", tagClass: "gstack",
    ids: ["browse","qa","qa-only","ship","retro","investigate","plan-eng-review","plan-ceo-review","plan-design-review","plan-devex-review","careful","canary","autoplan","freeze","unfreeze","benchmark","benchmark-models","review","learn","land-and-deploy","devex-review","connect-chrome","open-gstack-browser","setup-browser-cookies","setup-gbrain","codex","cso","gstack","gstack-upgrade","guard","plan-tune","smart-search","office-hours"],
  },
  session: {
    label: "Session & Contexte",
    color: "#a3e635", tagClass: "session",
    ids: ["project-routine","claude-council","context-save","context-restore","health"],
  },
  misc: {
    label: "Divers",
    color: "#94a3b8", tagClass: "misc",
    ids: ["heygen-skills","make-pdf","setup-deploy","document-release","landing-report"],
  },
};

// ── Lire les SKILL.md ───────────────────────────────────────────────────────
function readFrontmatter(filepath) {
  try {
    const raw = fs.readFileSync(filepath, "utf-8");
    if (!raw.startsWith("---")) return {};
    const end = raw.indexOf("\n---", 3);
    if (end === -1) return {};
    const block = raw.slice(3, end);
    const obj = {};
    for (const line of block.split("\n")) {
      const m = line.match(/^(\w[\w-]*):\s*(.*)/);
      if (m) obj[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
    return obj;
  } catch { return {}; }
}

function collectSkills() {
  const dirs = [path.join(HOME,".claude","skills"), path.join(HOME,".agents","skills")];
  const seen = new Set();
  const skills = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
      const id = entry.name;
      if (seen.has(id)) continue;
      seen.add(id);
      const fm = readFrontmatter(path.join(dir, id, "SKILL.md"));
      skills.push({ id, name: fm.name || id, rawDesc: fm.description || "", tools: fm["allowed-tools"] || "", hidden: fm.hidden === "true" });
    }
  }
  if (!seen.has("vault-pkm")) {
    skills.push({ id: "vault-pkm", name: "vault-pkm", rawDesc: "", tools: "vault_read, vault_write, vault_append, vault_semantic_search…", hidden: false });
  }
  return skills;
}

function categorize(skills) {
  const assigned = new Set();
  const result = {};
  for (const [catId, cat] of Object.entries(CATEGORIES)) {
    result[catId] = { ...cat, skills: [] };
    for (const id of cat.ids) {
      const s = skills.find(x => x.id === id);
      if (s && !assigned.has(id)) { result[catId].skills.push(s); assigned.add(id); }
    }
  }
  const unassigned = skills.filter(s => !assigned.has(s.id) && !s.hidden);
  if (unassigned.length > 0) result.other = { label: "Autres", color: "#64748b", tagClass: "misc", ids: [], skills: unassigned };
  return result;
}

function esc(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function renderCard(skill, tagClass) {
  const data = SKILL_DATA[skill.id] || {};
  const desc = data.desc || skill.rawDesc.slice(0, 200) || "Voir SKILL.md pour la documentation complète.";
  const peux = data.peux || [];
  const dois = data.dois || [];
  const ex   = data.ex   || [];

  const peuxHtml = peux.length ? `
          <div class="card-section">
            <div class="section-label-sm">Ce que tu peux faire</div>
            <ul class="bullet-list">${peux.map(p => `<li>${esc(p)}</li>`).join("")}</ul>
          </div>` : "";

  const doisHtml = dois.length ? `
          <div class="card-section">
            <div class="section-label-sm must">Ce que tu dois faire</div>
            <ul class="bullet-list must-list">${dois.map(d => `<li>${esc(d)}</li>`).join("")}</ul>
          </div>` : "";

  const exHtml = ex.length ? `
          <div class="card-section">
            <div class="section-label-sm">Exemples</div>
            ${ex.map(e => `<code class="ex-code">${esc(e)}</code>`).join("")}
          </div>` : "";

  const toolsHtml = skill.tools ? `<div class="card-tools">Outils : <span>${esc(skill.tools)}</span></div>` : "";

  return `
        <div class="card" data-keywords="${esc(skill.id)} ${esc(skill.rawDesc.toLowerCase())} ${esc(desc.toLowerCase())}">
          <div class="card-header">
            <span class="card-name">${esc(skill.name)}</span>
            <span class="tag ${tagClass}">${tagClass.toUpperCase()}</span>
          </div>
          <div class="card-slash">/${esc(skill.id)}</div>
          <div class="card-desc">${esc(desc)}</div>
          ${peuxHtml}${doisHtml}${exHtml}${toolsHtml}
        </div>`;
}

function renderSection(catId, cat) {
  if (cat.skills.length === 0) return "";
  return `
    <div id="${catId}">
      <div class="section-title">
        <h2>${esc(cat.label)}</h2>
        <div class="bar"></div>
        <span class="badge">${cat.skills.length}</span>
      </div>
      <div class="grid">${cat.skills.map(s => renderCard(s, cat.tagClass)).join("")}
      </div>
    </div>`;
}

function renderNav(categorized) {
  return Object.entries(categorized)
    .filter(([, c]) => c.skills.length > 0)
    .map(([id, c]) => `    <a href="#${id}"><span class="dot ${c.tagClass}"></span>${esc(c.label)}</a>`)
    .join("\n");
}

function buildHtml(categorized, totalCount) {
  const sections = Object.entries(categorized).map(([id, c]) => renderSection(id, c)).join("\n");
  const nav = renderNav(categorized);
  const generated = new Date().toLocaleString("fr-FR");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Référence Skills — runisland2015</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0a0a0f; --surface: #111118; --border: #1e1e2e;
      --text: #e2e2f0; --muted: #6b6b8a; --accent: #e8c547; --accent2: #5ee7c4; --accent3: #f07060;
    }
    html { scroll-behavior: smooth; }
    body { background: var(--bg); color: var(--text); font-family: 'Syne', sans-serif; font-size: 15px; line-height: 1.6; }
    /* Header */
    header { position: sticky; top: 0; z-index: 100; background: rgba(10,10,15,.95); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 0 2rem; display: flex; align-items: center; justify-content: space-between; height: 60px; gap: 1rem; }
    .logo { font-weight: 800; font-size: 1rem; letter-spacing: .08em; text-transform: uppercase; color: var(--accent); white-space: nowrap; }
    .logo span { color: var(--muted); font-weight: 400; }
    .search-wrap { position: relative; flex: 1; max-width: 360px; }
    .search-wrap svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--muted); pointer-events: none; }
    #search { width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px 8px 36px; color: var(--text); font-family: 'JetBrains Mono', monospace; font-size: 13px; outline: none; transition: border-color .2s; }
    #search:focus { border-color: var(--accent); }
    #search::placeholder { color: var(--muted); }
    .meta { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--muted); white-space: nowrap; }
    /* Layout */
    .layout { display: flex; min-height: calc(100vh - 60px); }
    nav { width: 230px; flex-shrink: 0; padding: 1.5rem 0; border-right: 1px solid var(--border); position: sticky; top: 60px; height: calc(100vh - 60px); overflow-y: auto; }
    nav a { display: flex; align-items: center; gap: 10px; padding: 9px 1.5rem; color: var(--muted); text-decoration: none; font-size: 13px; font-weight: 600; letter-spacing: .02em; transition: color .15s; }
    nav a:hover, nav a.active { color: var(--text); }
    nav a .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    nav .nav-label { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); padding: 1.2rem 1.5rem .4rem; }
    main { flex: 1; padding: 2.5rem 3rem; min-width: 0; }
    /* Section */
    .section-title { display: flex; align-items: center; gap: 12px; margin-bottom: 1.5rem; margin-top: 3rem; }
    .section-title:first-child { margin-top: 0; }
    .section-title h2 { font-size: .7rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); white-space: nowrap; }
    .section-title .bar { flex: 1; height: 1px; background: var(--border); }
    .section-title .badge { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--muted); }
    /* Grid */
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
    /* Card */
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; transition: border-color .2s, transform .15s; display: flex; flex-direction: column; gap: 10px; }
    .card:hover { border-color: #2a2a3e; transform: translateY(-1px); }
    .card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
    .card-name { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 500; color: var(--text); }
    .tag { font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 4px; letter-spacing: .06em; flex-shrink: 0; text-transform: uppercase; }
    .card-slash { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--accent); }
    .card-desc { font-size: 13px; color: #9090b0; line-height: 1.6; }
    /* Sections dans la carte */
    .card-section { display: flex; flex-direction: column; gap: 5px; }
    .section-label-sm { font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
    .section-label-sm.must { color: #f07060; }
    .bullet-list { list-style: none; display: flex; flex-direction: column; gap: 3px; }
    .bullet-list li { font-size: 12px; color: #8080a0; padding-left: 14px; position: relative; line-height: 1.5; }
    .bullet-list li::before { content: "–"; position: absolute; left: 0; color: var(--muted); }
    .must-list li::before { color: #f07060; }
    .must-list li { color: #c0a0a0; }
    .ex-code { display: block; font-family: 'JetBrains Mono', monospace; font-size: 11px; background: rgba(255,255,255,.03); border: 1px solid var(--border); border-radius: 5px; padding: 4px 8px; color: var(--accent2); margin-bottom: 3px; }
    .card-tools { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--muted); padding-top: 4px; border-top: 1px solid var(--border); }
    .card-tools span { color: var(--accent3); }
    /* Tags couleurs */
    .tag.new    { background: rgba(232,197,71,.14); color: #e8c547; }
    .tag.dev    { background: rgba(94,231,196,.1);  color: #5ee7c4; }
    .tag.design { background: rgba(192,132,252,.1); color: #c084fc; }
    .tag.agent  { background: rgba(96,165,250,.1);  color: #60a5fa; }
    .tag.gstack { background: rgba(251,146,60,.1);  color: #fb923c; }
    .tag.session{ background: rgba(163,230,53,.1);  color: #a3e635; }
    .tag.misc   { background: rgba(148,163,184,.1); color: #94a3b8; }
    .dot.new    { background: #e8c547; }
    .dot.dev    { background: #5ee7c4; }
    .dot.design { background: #c084fc; }
    .dot.agent  { background: #60a5fa; }
    .dot.gstack { background: #fb923c; }
    .dot.session{ background: #a3e635; }
    .dot.misc   { background: #94a3b8; }
    .empty { grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--muted); font-family: 'JetBrains Mono', monospace; font-size: 13px; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  </style>
</head>
<body>
<header>
  <div class="logo">Skills <span>/ runisland2015</span></div>
  <div class="search-wrap">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
    <input id="search" type="text" placeholder="Rechercher un skill, une action…" autocomplete="off">
  </div>
  <div class="meta"><span id="count">${totalCount}</span> skills &nbsp;·&nbsp; ${generated}</div>
</header>
<div class="layout">
  <nav id="nav">
    <div class="nav-label">Catégories</div>
${nav}
  </nav>
  <main id="main">
${sections}
  </main>
</div>
<script>
  const search = document.getElementById('search');
  const countEl = document.getElementById('count');
  const cards = Array.from(document.querySelectorAll('.card'));
  const total = cards.length;
  search.addEventListener('input', () => {
    const q = search.value.toLowerCase().trim();
    let v = 0;
    cards.forEach(c => {
      const show = !q || (c.textContent + ' ' + (c.dataset.keywords||'')).toLowerCase().includes(q);
      c.style.display = show ? '' : 'none';
      if (show) v++;
    });
    countEl.textContent = q ? v + '/' + total : total;
    document.querySelectorAll('.grid').forEach(g => {
      const ok = Array.from(g.querySelectorAll('.card')).some(c => c.style.display !== 'none');
      let empty = g.querySelector('.empty');
      if (!ok && !empty) { empty = Object.assign(document.createElement('div'),{className:'empty',textContent:'Aucun résultat'}); g.appendChild(empty); }
      else if (ok && empty) empty.remove();
    });
  });
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) document.querySelectorAll('nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)); });
  }, { rootMargin: '-20% 0px -70% 0px' });
  document.querySelectorAll('[id]').forEach(s => obs.observe(s));
<\/script>
</body>
</html>`;
}

const skills = collectSkills();
const categorized = categorize(skills);
const total = skills.filter(s => !s.hidden).length;
fs.writeFileSync(OUT, buildHtml(categorized, total), "utf-8");
console.log(`✓ index.html régénéré — ${total} skills`);
