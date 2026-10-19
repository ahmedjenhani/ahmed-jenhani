export type Lang = 'en' | 'fr';

export interface ProjectText {
  id: string;
  title: string;
  kicker: string;
  description: string;
  highlights: string[];
}

export interface ExperienceText {
  id: string;
  role: string;
  company: string;
  project: string;
  period: string;
  place: string;
  bullets: string[];
}

export interface Content {
  meta: { title: string; description: string };
  a11y: { skip: string; theme: { toLight: string; toDark: string }; language: string; menuOpen: string; menuClose: string };
  nav: { home: string; about: string; skills: string; projects: string; experience: string; contact: string };
  hero: {
    greeting: string;
    role: string;
    tagline: string;
    status: string;
    location: string;
    downloadCv: string;
    contact: string;
    projects: string;
    photoAlt: string;
    badge: string;
    stats: { internships: string; liveApps: string; certifications: string };
  };
  about: {
    title: string;
    paragraphs: string[];
    education: {
      title: string;
      items: { school: string; period: string; degree: string; place: string }[];
    };
    certifications: string;
    languages: { title: string; items: { name: string; level: string }[] };
    volunteering: { title: string; text: string };
  };
  skills: { title: string; subtitle: string; groups: Record<string, string>; practices: { title: string; items: string[] } };
  projects: { title: string; subtitle: string; live: string; code: string; noLinks: string; featured: string; screenshotAlt: string; items: ProjectText[] };
  experience: { title: string; subtitle: string; items: ExperienceText[] };
  contact: {
    title: string;
    intro: string;
    form: {
      title: string;
      name: string;
      email: string;
      message: string;
      send: string;
      sending: string;
      subject: string;
      validation: { name: string; email: string; message: string };
      sentMail: string;
      sentOnline: string;
      failed: string;
    };
    info: { email: string; copy: string; copied: string; linkedin: string; github: string; location: string; locationValue: string };
  };
  footer: { built: string; top: string };
}

const en: Content = {
  meta: {
    title: 'Ahmed Jenhani | Full-Stack Developer',
    description:
      'Portfolio of Ahmed Jenhani, a software engineering student and full-stack developer (React, Angular, Node.js, Spring Boot) looking for an internship.',
  },
  a11y: {
    skip: 'Skip to content',
    theme: { toLight: 'Switch to light mode', toDark: 'Switch to dark mode' },
    language: 'Language',
    menuOpen: 'Open the menu',
    menuClose: 'Close the menu',
  },
  nav: { home: 'Home', about: 'About', skills: 'Skills', projects: 'Projects', experience: 'Experience', contact: 'Contact' },
  hero: {
    greeting: "Hi, I'm",
    role: 'Full-Stack Developer',
    tagline:
      "Software engineering student building web applications end to end, from the database to the interface. I'm looking for an internship where I can learn from a team and ship real features.",
    status: 'Open to internships',
    location: 'Nabeul, Tunisia',
    downloadCv: 'Download my CV',
    contact: 'Get in touch',
    projects: 'See my projects',
    photoAlt: 'Portrait of Ahmed Jenhani',
    badge: 'Software Engineering · 3rd year',
    stats: { internships: 'internships', liveApps: 'apps live on the web', certifications: 'certifications' },
  },
  about: {
    title: 'About me',
    paragraphs: [
      "I'm a third-year software engineering student at ITBS in Tunisia. I like working across the whole stack: modelling the data, building the API, and making the interface pleasant to use. I've worked with Laravel, React, Angular, Express and Spring Boot, and I'm comfortable with both SQL and NoSQL databases.",
      'My experience comes from three internships (a pharmacy management system, a freelancer recruitment platform and an SEO internship) and from projects of my own: an e-commerce site, a phishing-detection MLOps pipeline, and two recent applications that I built, tested and deployed, Job Tracker and RetroLive.',
      "I'm now looking for an internship in full-stack development, ideally in a team where I can learn from experienced engineers and contribute to a real product.",
    ],
    education: {
      title: 'Education',
      items: [
        { school: 'ITBS', period: 'Sept 2021 – present', degree: 'Engineering degree, Software Engineering (3rd year)', place: 'Nabeul, Tunisia' },
        {
          school: 'Leaders University',
          period: 'Sept 2017 – June 2020',
          degree: "Bachelor's degree in Applied Computer Science for Management",
          place: 'Nabeul, Tunisia',
        },
      ],
    },
    certifications: 'Certifications',
    languages: {
      title: 'Languages',
      items: [
        { name: 'French', level: 'Fluent' },
        { name: 'English', level: 'Fluent' },
        { name: 'Arabic', level: 'Native' },
      ],
    },
    volunteering: { title: 'Community', text: 'Former member of the Tunisian Scouts' },
  },
  skills: {
    title: 'Skills',
    subtitle: 'The tools I work with, grouped by area.',
    groups: {
      languages: 'Languages',
      frontend: 'Frontend',
      backend: 'Backend & APIs',
      databases: 'Databases',
      devops: 'DevOps & tools',
      mlops: 'Data & MLOps',
    },
    practices: {
      title: 'Ways of working',
      items: ['Agile / Scrum', 'Software testing', 'REST API design', 'Responsive design', 'Teamwork', 'Problem solving'],
    },
  },
  projects: {
    title: 'Projects',
    subtitle: 'Two applications I built and deployed, and other work from my studies and internships.',
    live: 'Live demo',
    code: 'Source code',
    noLinks: 'Source code available on request',
    featured: 'Live on the web',
    screenshotAlt: 'Screenshot of',
    items: [
      {
        id: 'retrolive',
        title: 'RetroLive',
        kicker: 'Real-time web app',
        description:
          'A live retrospective board for teams. A host shares a code, everyone joins from their own device without an account, adds notes and votes, and the board, the votes, the timer and the phases update in real time. An AI summary turns the notes into themes and action items.',
        highlights: [
          'Notes, votes, phases and a timer update instantly for every participant with Socket.IO',
          'The server enforces the rules: exactly 3 votes per person, even when clicks arrive at the same moment',
          'One-click private demo board that deletes itself after 24 hours',
          '97 backend, 49 frontend and 39 end-to-end tests; deployed with Docker, Render, Vercel and Neon',
        ],
      },
      {
        id: 'jobtracker',
        title: 'Job Tracker',
        kicker: 'Full-stack web app',
        description:
          'A companion for the job search: a Kanban board for applications, analytics on the whole funnel, daily follow-up reminders, and AI help to fill in the form from a pasted job posting and to prepare interview questions.',
        highlights: [
          'Drag-and-drop board with Wishlist, Applied, Interview, Offer and Rejected stages',
          'Dashboard with response rate, interview rate, time to first answer and weekly activity',
          'Daily scheduled reminders by in-app notification and email',
          'JWT authentication, database migrations, Docker; 45 backend, 21 frontend and 24 end-to-end tests',
        ],
      },
      {
        id: 'stockflow',
        title: 'StockFlow',
        kicker: 'Internship project at Doctor Sina',
        description:
          'A back-office application for small pharmacies and businesses: inventory, sales, point of sale and human resources in one place.',
        highlights: [
          'Stock and expiry tracking, barcodes, and Excel import and export',
          'Cart-based point of sale with invoices, payments and automatic stock updates',
          'Roles and permissions, KPI dashboards and a French-language interface',
        ],
      },
      {
        id: 'shopease',
        title: 'ShopEase',
        kicker: 'Personal project',
        description:
          'A full-stack e-commerce website with authentication, product browsing, a cart and payment, plus an admin dashboard to manage inventory and follow orders.',
        highlights: ['JWT authentication and REST APIs', 'Admin dashboard built with modular Angular'],
      },
      {
        id: 'phishing',
        title: 'ITBS Network Security',
        kicker: 'MLOps project',
        description:
          'An end-to-end MLOps pipeline that detects phishing: ingestion from MongoDB, validation, transformation and training, with typed artifacts and dedicated exceptions and logging between each stage.',
        highlights: [
          'FastAPI service for training and for predicting from an uploaded CSV file',
          'Experiment tracking with MLflow and DagsHub',
          'Docker image and CI/CD with GitHub Actions, deployed on GCP through a self-hosted runner',
        ],
      },
    ],
  },
  experience: {
    title: 'Experience',
    subtitle: 'Three internships in full-stack development and digital marketing.',
    items: [
      {
        id: 'dr_sina',
        role: 'Full-Stack Developer Intern',
        company: 'Doctor Sina',
        project: 'StockFlow: pharmacy management application',
        period: 'Feb 2024 – Sept 2024',
        place: 'Remote',
        bullets: [
          'Built a back-office application with Laravel to manage inventory, sales and human resources for small businesses.',
          'Implemented a complete stock and point-of-sale system: product CRUD with images and barcodes, stock and expiry tracking, Excel import and export, a cart-based POS, invoices, payments and automatic stock updates.',
          'Created the HR features: employee management, attendance tracking and payroll.',
          'Added roles and permissions with Spatie, full authentication, a French-language interface, KPI dashboards, tracking of stock and outstanding payments, and a backup and download interface.',
        ],
      },
      {
        id: 'main_form',
        role: 'Full-Stack Developer Intern',
        company: 'Main-Form',
        project: 'SkillBridge: recruitment platform for freelancers',
        period: 'Feb 2020 – Sept 2020',
        place: 'Nabeul, Tunisia',
        bullets: [
          'Designed a full-stack application to manage the interactions between freelancers and employers, making it easier to connect and collaborate.',
          'Implemented features to follow freelancers\' availability, display the services they offer, set their rates and manage profiles, giving employers more transparency.',
          'Wrote functional test cases and validated the features to make sure the deliverables were of good quality.',
        ],
      },
      {
        id: 'elboita',
        role: 'SEO & Digital Marketing Intern',
        company: 'elBoita',
        project: 'SEO optimisation of a website',
        period: 'Aug 2019 – Sept 2019',
        place: 'Nabeul, Tunisia',
        bullets: [
          "Managed the website's SEO to improve its visibility on search engines and its organic traffic.",
          'Researched keywords, optimised pages and followed performance metrics.',
        ],
      },
    ],
  },
  contact: {
    title: 'Get in touch',
    intro:
      "I'm looking for an internship in full-stack development. Write to me about an opportunity, a project, or just to say hello. I answer every message.",
    form: {
      title: 'Send me a message',
      name: 'Your name',
      email: 'Your email',
      message: 'Your message',
      send: 'Send message',
      sending: 'Sending…',
      subject: 'Internship opportunity',
      validation: { name: 'Please tell me your name.', email: 'Please enter a valid email address.', message: 'Please write a short message.' },
      sentMail: 'Your email app should open with the message ready to send. If nothing happens, write to me directly at the address on this page.',
      sentOnline: 'Thank you! Your message has been sent and I will reply soon.',
      failed: 'Sorry, the message could not be sent. Please write to me directly by email.',
    },
    info: {
      email: 'Email',
      copy: 'Copy',
      copied: 'Copied!',
      linkedin: 'LinkedIn',
      github: 'GitHub',
      location: 'Location',
      locationValue: 'Nabeul, Tunisia',
    },
  },
  footer: { built: 'Designed and built by Ahmed Jenhani with React, TypeScript and Tailwind CSS.', top: 'Back to top' },
};

const fr: Content = {
  meta: {
    title: 'Ahmed Jenhani | Développeur Fullstack',
    description:
      "Portfolio d'Ahmed Jenhani, élève ingénieur en génie logiciel et développeur fullstack (React, Angular, Node.js, Spring Boot), à la recherche d'un stage.",
  },
  a11y: {
    skip: 'Aller au contenu',
    theme: { toLight: 'Passer en mode clair', toDark: 'Passer en mode sombre' },
    language: 'Langue',
    menuOpen: 'Ouvrir le menu',
    menuClose: 'Fermer le menu',
  },
  nav: { home: 'Accueil', about: 'À propos', skills: 'Compétences', projects: 'Projets', experience: 'Expérience', contact: 'Contact' },
  hero: {
    greeting: 'Bonjour, je suis',
    role: 'Développeur Fullstack',
    tagline:
      "Élève ingénieur en génie logiciel, je conçois des applications web de bout en bout, de la base de données à l'interface. Je cherche un stage pour apprendre au sein d'une équipe et livrer de vraies fonctionnalités.",
    status: "Disponible pour un stage",
    location: 'Nabeul, Tunisie',
    downloadCv: 'Télécharger mon CV',
    contact: 'Me contacter',
    projects: 'Voir mes projets',
    photoAlt: "Portrait d'Ahmed Jenhani",
    badge: 'Génie Logiciel · 3ème année',
    stats: { internships: 'stages', liveApps: 'applications en ligne', certifications: 'certifications' },
  },
  about: {
    title: 'À propos',
    paragraphs: [
      "Je suis élève ingénieur en génie logiciel en troisième année à l'ITBS, en Tunisie. J'aime travailler sur toute la chaîne : modéliser les données, construire l'API et rendre l'interface agréable à utiliser. J'ai travaillé avec Laravel, React, Angular, Express et Spring Boot, et je suis à l'aise avec les bases de données SQL et NoSQL.",
      "Mon expérience vient de trois stages (un système de gestion de pharmacie, une plateforme de recrutement de freelances et un stage SEO) et de projets personnels : un site e-commerce, un pipeline MLOps de détection de phishing, et deux applications récentes que j'ai développées, testées et déployées, Job Tracker et RetroLive.",
      "Je cherche maintenant un stage en développement fullstack, de préférence dans une équipe où je peux apprendre auprès d'ingénieurs expérimentés et contribuer à un vrai produit.",
    ],
    education: {
      title: 'Formation',
      items: [
        { school: 'ITBS', period: 'sept. 2021 – présent', degree: 'Cycle ingénieur, Génie Logiciel (3ème année)', place: 'Nabeul, Tunisie' },
        {
          school: 'Leaders University',
          period: 'sept. 2017 – juin 2020',
          degree: 'Licence en Informatique Appliquée à la Gestion',
          place: 'Nabeul, Tunisie',
        },
      ],
    },
    certifications: 'Certifications',
    languages: {
      title: 'Langues',
      items: [
        { name: 'Français', level: 'Courant' },
        { name: 'Anglais', level: 'Courant' },
        { name: 'Arabe', level: 'Langue maternelle' },
      ],
    },
    volunteering: { title: 'Vie associative', text: 'Ancien membre des Scouts Tunisiens' },
  },
  skills: {
    title: 'Compétences',
    subtitle: 'Les outils que j\'utilise, regroupés par domaine.',
    groups: {
      languages: 'Langages',
      frontend: 'Frontend',
      backend: 'Backend & API',
      databases: 'Bases de données',
      devops: 'DevOps & outils',
      mlops: 'Data & MLOps',
    },
    practices: {
      title: 'Méthodes de travail',
      items: ['Agile / Scrum', 'Tests logiciels', "Conception d'API REST", 'Design responsive', "Travail d'équipe", 'Résolution de problèmes'],
    },
  },
  projects: {
    title: 'Projets',
    subtitle: 'Deux applications que j\'ai développées et déployées, et d\'autres réalisations de mes études et stages.',
    live: 'Voir la démo',
    code: 'Code source',
    noLinks: 'Code source disponible sur demande',
    featured: 'En ligne',
    screenshotAlt: "Capture d'écran de",
    items: [
      {
        id: 'retrolive',
        title: 'RetroLive',
        kicker: 'Application web temps réel',
        description:
          "Un tableau de rétrospective en direct pour les équipes. Un animateur partage un code, chacun rejoint depuis son appareil sans compte, ajoute des notes et vote, et le tableau, les votes, le minuteur et les phases se mettent à jour en temps réel. Un résumé par IA transforme les notes en thèmes et en actions.",
        highlights: [
          'Notes, votes, phases et minuteur mis à jour instantanément pour chaque participant avec Socket.IO',
          'Le serveur applique les règles : exactement 3 votes par personne, même quand des clics arrivent au même moment',
          'Tableau de démo privé en un clic, supprimé automatiquement après 24 heures',
          '97 tests backend, 49 frontend et 39 de bout en bout ; déployé avec Docker, Render, Vercel et Neon',
        ],
      },
      {
        id: 'jobtracker',
        title: 'Job Tracker',
        kicker: 'Application web fullstack',
        description:
          "Un compagnon pour la recherche d'emploi : un tableau Kanban pour les candidatures, des statistiques sur tout l'entonnoir, des rappels de relance quotidiens, et une aide par IA pour remplir le formulaire à partir d'une offre collée et préparer des questions d'entretien.",
        highlights: [
          'Tableau en glisser-déposer : Souhaité, Postulé, Entretien, Offre et Refusé',
          "Tableau de bord : taux de réponse, taux d'entretien, délai avant la première réponse et activité par semaine",
          'Rappels planifiés chaque jour par notification dans l\'application et par email',
          'Authentification JWT, migrations de base de données, Docker ; 45 tests backend, 21 frontend et 24 de bout en bout',
        ],
      },
      {
        id: 'stockflow',
        title: 'StockFlow',
        kicker: 'Projet de stage chez Doctor Sina',
        description:
          'Une application de back-office pour les petites pharmacies et entreprises : inventaire, ventes, point de vente et ressources humaines au même endroit.',
        highlights: [
          "Suivi du stock et des dates d'expiration, codes-barres, import et export Excel",
          'Point de vente avec panier, factures, paiements et mise à jour automatique du stock',
          'Rôles et permissions, tableaux de bord KPI et interface en français',
        ],
      },
      {
        id: 'shopease',
        title: 'ShopEase',
        kicker: 'Projet personnel',
        description:
          "Un site e-commerce fullstack avec authentification, navigation des produits, panier et paiement, et un tableau de bord d'administration pour gérer l'inventaire et suivre les commandes.",
        highlights: ['Authentification JWT et APIs REST', "Tableau de bord d'administration avec Angular modulaire"],
      },
      {
        id: 'phishing',
        title: 'ITBS Network Security',
        kicker: 'Projet MLOps',
        description:
          "Un pipeline MLOps de bout en bout qui détecte le phishing : ingestion depuis MongoDB, validation, transformation et entraînement, avec des artefacts typés ainsi que des exceptions et des logs dédiés entre chaque étape.",
        highlights: [
          "API FastAPI pour l'entraînement et la prédiction à partir d'un fichier CSV envoyé",
          'Suivi des expériences avec MLflow et DagsHub',
          'Image Docker et CI/CD avec GitHub Actions, déployé sur GCP via un runner auto-hébergé',
        ],
      },
    ],
  },
  experience: {
    title: 'Expérience',
    subtitle: 'Trois stages en développement fullstack et en marketing digital.',
    items: [
      {
        id: 'dr_sina',
        role: 'Stagiaire Développeur Fullstack',
        company: 'Doctor Sina',
        project: 'StockFlow : application de gestion de pharmacie',
        period: 'févr. 2024 – sept. 2024',
        place: 'À distance',
        bullets: [
          "Développé une application back-office avec Laravel pour gérer l'inventaire des médicaments, les ventes et les ressources humaines des petites entreprises.",
          "Implémenté un système complet de gestion de stock et de point de vente : CRUD des produits avec images et codes-barres, suivi du stock et des dates d'expiration, import et export Excel, POS basé sur panier, factures, paiements et mise à jour automatique du stock.",
          'Créé les fonctionnalités RH : gestion des employés, suivi de présence et paie.',
          "Ajouté des rôles et permissions avec Spatie, une authentification complète, une interface en français, des tableaux de bord KPI, le suivi des stocks et des paiements dus, et une interface de sauvegarde et de téléchargement.",
        ],
      },
      {
        id: 'main_form',
        role: 'Stagiaire Développeur Fullstack',
        company: 'Main-Form',
        project: 'SkillBridge : plateforme de recrutement pour freelances',
        period: 'févr. 2020 – sept. 2020',
        place: 'Nabeul, Tunisie',
        bullets: [
          'Conçu une application fullstack pour gérer les interactions entre freelances et employeurs, facilitant la mise en relation et la collaboration.',
          'Implémenté des fonctionnalités pour suivre la disponibilité des freelances, afficher les services proposés, définir les tarifs et gérer les profils, offrant plus de transparence aux employeurs.',
          'Effectué des cas de tests fonctionnels et validé les fonctionnalités pour assurer la qualité des livrables.',
        ],
      },
      {
        id: 'elboita',
        role: 'Stagiaire SEO – Marketing Digital',
        company: 'elBoita',
        project: "Optimisation SEO d'un site web",
        period: 'août 2019 – sept. 2019',
        place: 'Nabeul, Tunisie',
        bullets: [
          "Géré le SEO du site web afin d'améliorer la visibilité sur les moteurs de recherche et le trafic organique.",
          "Réalisé des recherches de mots-clés, l'optimisation on-page et le suivi des performances SEO.",
        ],
      },
    ],
  },
  contact: {
    title: 'Me contacter',
    intro:
      "Je cherche un stage en développement fullstack. Écrivez-moi pour une opportunité, un projet, ou simplement pour dire bonjour. Je réponds à tous les messages.",
    form: {
      title: 'Envoyez-moi un message',
      name: 'Votre nom',
      email: 'Votre email',
      message: 'Votre message',
      send: 'Envoyer le message',
      sending: 'Envoi…',
      subject: 'Opportunité de stage',
      validation: { name: 'Merci de me dire votre nom.', email: 'Merci de saisir une adresse email valide.', message: 'Merci d\'écrire un court message.' },
      sentMail: "Votre application email devrait s'ouvrir avec le message prêt à envoyer. Sinon, écrivez-moi directement à l'adresse indiquée sur cette page.",
      sentOnline: 'Merci ! Votre message a bien été envoyé et je vous répondrai bientôt.',
      failed: "Désolé, le message n'a pas pu être envoyé. Écrivez-moi directement par email.",
    },
    info: {
      email: 'Email',
      copy: 'Copier',
      copied: 'Copié !',
      linkedin: 'LinkedIn',
      github: 'GitHub',
      location: 'Localisation',
      locationValue: 'Nabeul, Tunisie',
    },
  },
  footer: { built: "Conçu et développé par Ahmed Jenhani avec React, TypeScript et Tailwind CSS.", top: 'Retour en haut' },
};

export const CONTENT: Record<Lang, Content> = { en, fr };
