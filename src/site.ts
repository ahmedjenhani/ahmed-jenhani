/** Facts that never change with the language. Everything on the page that is a link comes from here. */
export const SITE = {
  name: 'Ahmed Jenhani',
  email: 'ahmed.jenhani2@gmail.com',
  phone: '+216 50 107 126',
  github: 'https://github.com/ahmedjenhani',
  linkedin: 'https://www.linkedin.com/in/ahmed-jenhani-3a6424233/',
  cv: '/Ahmed-Jenhani-CV.pdf',
  photo: '/ahmed.jpg',
} as const;

export const SECTION_IDS = ['home', 'about', 'skills', 'projects', 'experience', 'contact'] as const;
export type SectionId = (typeof SECTION_IDS)[number];

/** Per-project facts that are the same in every language: technologies, links and screenshots. */
export interface ProjectFacts {
  id: string;
  tech: string[];
  live?: string;
  code?: string;
  image?: string;
  featured?: boolean;
}

export const PROJECT_FACTS: ProjectFacts[] = [
  {
    id: 'retrolive',
    featured: true,
    tech: ['React', 'TypeScript', 'Express', 'Socket.IO', 'PostgreSQL', 'Prisma', 'Tailwind CSS', 'Docker', 'Gemini API'],
    live: 'https://retrolive.vercel.app',
    code: 'https://github.com/ahmedjenhani/RetroLive',
    image: '/projects/retrolive.png',
  },
  {
    id: 'jobtracker',
    featured: true,
    tech: ['Angular', 'Spring Boot', 'Java', 'PostgreSQL', 'Flyway', 'Docker', 'JWT', 'Gemini API'],
    live: 'https://job-application-tracker-one-flax.vercel.app',
    code: 'https://github.com/ahmedjenhani/job-application-tracker',
    image: '/projects/jobtracker.png',
  },
  {
    id: 'stockflow',
    tech: ['Laravel', 'PHP', 'JavaScript', 'Tailwind CSS', 'Blade', 'PhpSpreadsheet'],
    code: 'https://github.com/ahmedjenhani/sujet-PFE-20252026',
  },
  {
    id: 'shopease',
    tech: ['MongoDB', 'Express.js', 'Angular', 'Node.js', 'TypeScript', 'JWT'],
  },
  {
    id: 'phishing',
    tech: ['Python', 'FastAPI', 'MongoDB', 'MLflow', 'DagsHub', 'Docker', 'GitHub Actions', 'GCP'],
    code: 'https://github.com/ahmedjenhani/ITBSNetworksecurity2',
  },
];

export const SKILL_GROUPS: { id: string; items: string[] }[] = [
  { id: 'languages', items: ['JavaScript', 'TypeScript', 'Java', 'PHP', 'Python'] },
  { id: 'frontend', items: ['React', 'Angular', 'HTML', 'CSS', 'Bootstrap', 'Tailwind CSS'] },
  { id: 'backend', items: ['Spring Boot', 'Node.js', 'Express.js', 'Laravel', 'FastAPI', 'JWT', 'REST APIs', 'WebSockets'] },
  { id: 'databases', items: ['PostgreSQL', 'MySQL', 'Oracle (PL/SQL)', 'MongoDB', 'Prisma'] },
  { id: 'devops', items: ['Docker', 'Git / GitHub', 'GitHub Actions', 'Jira', 'Postman', 'UML', 'Vercel', 'Render'] },
  { id: 'mlops', items: ['MLflow', 'DagsHub', 'GCP', 'CI/CD', 'FastAPI'] },
];

export const CERTIFICATIONS = [
  'Database Programming with SQL (Oracle Academy)',
  'Java Foundations (Oracle Academy)',
  'Database Foundations (Oracle)',
  'Getting Started with Deep Learning (NVIDIA)',
  'Introduction to Generative AI (Google)',
  'AWS Academy Introduction to Cloud (AWS)',
  'AWS Academy Machine Learning Foundations (AWS)',
  'PCAP: Programming Essentials in Python (Cisco Networking Academy)',
];

/** Experience facts that do not change with the language. */
export const EXPERIENCE_TECH: Record<string, string[]> = {
  dr_sina: ['Laravel', 'PHP', 'JavaScript', 'Tailwind CSS', 'Blade', 'PhpSpreadsheet'],
  main_form: ['React', 'JavaScript', 'HTML', 'CSS', 'Bootstrap', 'PHP', 'SQL'],
  elboita: ['Google Analytics', 'Search Console', 'On-page SEO'],
};
