/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import type {
  EditorialMember,
  IndexingEntry,
  Journal,
} from '@/types';
import { subjects } from './subjects';

/** Databases commonly referenced across open-access journals. */
const commonIndexing: IndexingEntry[] = [
  { name: 'Google Scholar', description: 'Full-text and citation indexing for scholarly literature.' },
  { name: 'DOAJ', description: 'Directory of Open Access Journals — vetted OA listing.' },
  { name: 'Crossref', description: 'DOI registration and reference linking.' },
  { name: 'Scilit', description: 'Comprehensive, centrally aggregated scientific literature.' },
  { name: 'BASE', description: 'Bielefeld Academic Search Engine for open-access content.' },
];

let memberSeq = 0;
function member(
  role: EditorialMember['role'],
  name: string,
  designation: string,
  institution: string,
  country: string,
): EditorialMember {
  memberSeq += 1;
  return { id: `em-${memberSeq}`, role, name, designation, institution, country };
}

interface JournalSeed {
  slug: string;
  title: string;
  fullTitle: string;
  abbreviation: string;
  eIssn: string;
  pIssn: string;
  doiPrefix: string;
  subjectId: string;
  yearStarted: number;
  frequency: Journal['frequency'];
  impactFactor: number;
  acceptanceRate: number;
  apcStandard: number;
  languages: string[];
  description: string;
  aimsAndScope: string;
  eic: EditorialMember;
  associates: EditorialMember[];
  board: EditorialMember[];
  featured?: boolean;
}

const seeds: JournalSeed[] = [
  {
    slug: 'ijaiml',
    title: 'Artificial Intelligence & Machine Learning',
    fullTitle: 'International Journal of Artificial Intelligence and Machine Learning',
    abbreviation: 'IJAIML',
    eIssn: '2789-4021',
    pIssn: '2789-4013',
    doiPrefix: '10.32996/ijaiml',
    subjectId: 'sub-ai',
    yearStarted: 2019,
    frequency: 'Monthly',
    impactFactor: 4.2,
    acceptanceRate: 21,
    apcStandard: 180,
    languages: ['English'],
    description:
      'Peer-reviewed research on machine learning, deep learning, and applied artificial intelligence across science and industry.',
    aimsAndScope:
      'IJAIML publishes original research and rigorous reviews spanning supervised and unsupervised learning, deep neural architectures, reinforcement learning, natural language processing, computer vision, and the responsible deployment of AI systems. The journal welcomes both methodological advances and high-impact applications.',
    eic: member('Editor-in-Chief', 'Prof. Daniel R. Okonkwo', 'Professor of Computer Science', 'ETH Zürich', 'Switzerland'),
    associates: [
      member('Associate Editor', 'Dr. Mei-Ling Chen', 'Associate Professor', 'National University of Singapore', 'Singapore'),
      member('Associate Editor', 'Dr. Rafael Moreno', 'Senior Lecturer', 'Universidad Politécnica de Madrid', 'Spain'),
    ],
    board: [
      member('Editorial Board Member', 'Dr. Aisha Bello', 'Research Scientist', 'University of Toronto', 'Canada'),
      member('Editorial Board Member', 'Prof. Henrik Larsson', 'Professor', 'KTH Royal Institute of Technology', 'Sweden'),
      member('Editorial Board Member', 'Dr. Priya Nair', 'Assistant Professor', 'IIT Bombay', 'India'),
    ],
    featured: true,
  },
  {
    slug: 'jcds',
    title: 'Computational Data Science',
    fullTitle: 'Journal of Computational Data Science',
    abbreviation: 'JCDS',
    eIssn: '2790-1122',
    pIssn: '2790-1114',
    doiPrefix: '10.32996/jcds',
    subjectId: 'sub-ai',
    yearStarted: 2021,
    frequency: 'Quarterly',
    impactFactor: 3.1,
    acceptanceRate: 28,
    apcStandard: 150,
    languages: ['English'],
    description:
      'Methods and applications in large-scale data analysis, statistical computing, and reproducible data science workflows.',
    aimsAndScope:
      'JCDS covers scalable analytics, statistical learning, data engineering, visualization, and reproducibility. It emphasises open data and open-source tooling that advance the practice of data science.',
    eic: member('Editor-in-Chief', 'Prof. Sofia Almeida', 'Professor of Statistics', 'University of São Paulo', 'Brazil'),
    associates: [
      member('Associate Editor', 'Dr. James Whitfield', 'Reader in Data Science', 'University of Edinburgh', 'United Kingdom'),
    ],
    board: [
      member('Editorial Board Member', 'Dr. Omar Haddad', 'Assistant Professor', 'American University of Beirut', 'Lebanon'),
      member('Editorial Board Member', 'Dr. Yuki Tanaka', 'Associate Professor', 'Kyoto University', 'Japan'),
    ],
  },
  {
    slug: 'ijllt',
    title: 'Linguistics, Literature & Translation',
    fullTitle: 'International Journal of Linguistics, Literature and Translation',
    abbreviation: 'IJLLT',
    eIssn: '2617-0299',
    pIssn: '2708-0099',
    doiPrefix: '10.32996/ijllt',
    subjectId: 'sub-lang',
    yearStarted: 2018,
    frequency: 'Monthly',
    impactFactor: 2.4,
    acceptanceRate: 34,
    apcStandard: 150,
    languages: ['English', 'Arabic', 'French'],
    description:
      'Applied linguistics, literary criticism, and translation and interpreting studies from a global scholarly community.',
    aimsAndScope:
      'IJLLT publishes research in theoretical and applied linguistics, second-language acquisition, discourse analysis, comparative literature, and translation studies. Multilingual submissions are welcomed in the journal’s accepted languages.',
    eic: member('Editor-in-Chief', 'Prof. Nadia El-Amin', 'Professor of Applied Linguistics', 'University of Cambridge', 'United Kingdom'),
    associates: [
      member('Associate Editor', 'Dr. Lucas Bernard', 'Maître de conférences', 'Sorbonne Université', 'France'),
      member('Associate Editor', 'Dr. Carmen Ortega', 'Associate Professor', 'Universidad de Buenos Aires', 'Argentina'),
    ],
    board: [
      member('Editorial Board Member', 'Prof. Ahmed Farouk', 'Professor of Translation', 'Cairo University', 'Egypt'),
      member('Editorial Board Member', 'Dr. Hannah Weiss', 'Lecturer', 'University of Vienna', 'Austria'),
    ],
    featured: true,
  },
  {
    slug: 'jacm',
    title: 'Applied Clinical Medicine',
    fullTitle: 'Journal of Applied Clinical Medicine',
    abbreviation: 'JACM',
    eIssn: '2795-3320',
    pIssn: '2795-3312',
    doiPrefix: '10.32996/jacm',
    subjectId: 'sub-med',
    yearStarted: 2020,
    frequency: 'Monthly',
    impactFactor: 5.6,
    acceptanceRate: 18,
    apcStandard: 220,
    languages: ['English'],
    description:
      'Clinical studies, translational medicine, and evidence-based practice across internal medicine and allied specialties.',
    aimsAndScope:
      'JACM disseminates clinical trials, cohort and case–control studies, systematic reviews, and translational research that improve patient care. All human-subject research must comply with the Declaration of Helsinki.',
    eic: member('Editor-in-Chief', 'Prof. Elena Vasquez, MD', 'Professor of Internal Medicine', 'Johns Hopkins University', 'United States'),
    associates: [
      member('Associate Editor', 'Dr. Kwame Mensah, MD', 'Consultant Physician', 'University of Ghana Medical School', 'Ghana'),
      member('Associate Editor', 'Dr. Ingrid Solberg, MD', 'Senior Consultant', 'Karolinska Institutet', 'Sweden'),
    ],
    board: [
      member('Editorial Board Member', 'Dr. Rohan Kapoor, MD', 'Associate Professor', 'All India Institute of Medical Sciences', 'India'),
      member('Editorial Board Member', 'Prof. Liu Wei, MD', 'Professor', 'Peking University', 'China'),
    ],
    featured: true,
  },
  {
    slug: 'ijphr',
    title: 'Public Health Research',
    fullTitle: 'International Journal of Public Health Research',
    abbreviation: 'IJPHR',
    eIssn: '2789-8842',
    pIssn: '2789-8834',
    doiPrefix: '10.32996/ijphr',
    subjectId: 'sub-med',
    yearStarted: 2019,
    frequency: 'Quarterly',
    impactFactor: 3.8,
    acceptanceRate: 25,
    apcStandard: 190,
    languages: ['English'],
    description:
      'Epidemiology, health policy, and population health interventions with a focus on equity and global health.',
    aimsAndScope:
      'IJPHR publishes epidemiological studies, health-systems research, and evaluations of public-health interventions, prioritising work that advances health equity in low- and middle-income settings.',
    eic: member('Editor-in-Chief', 'Prof. Grace Achieng', 'Professor of Epidemiology', 'University of Nairobi', 'Kenya'),
    associates: [
      member('Associate Editor', 'Dr. Thomas Berg', 'Senior Researcher', 'University of Copenhagen', 'Denmark'),
    ],
    board: [
      member('Editorial Board Member', 'Dr. Fatima Rahimi', 'Assistant Professor', 'Aga Khan University', 'Pakistan'),
      member('Editorial Board Member', 'Dr. Pedro Gonçalves', 'Researcher', 'University of Lisbon', 'Portugal'),
    ],
  },
  {
    slug: 'jbie',
    title: 'Business Innovation & Economics',
    fullTitle: 'Journal of Business Innovation and Economics',
    abbreviation: 'JBIE',
    eIssn: '2790-6621',
    pIssn: '2790-6613',
    doiPrefix: '10.32996/jbie',
    subjectId: 'sub-bus',
    yearStarted: 2020,
    frequency: 'Quarterly',
    impactFactor: 2.9,
    acceptanceRate: 30,
    apcStandard: 160,
    languages: ['English'],
    description:
      'Entrepreneurship, applied economics, and management research bridging academic rigour and practical impact.',
    aimsAndScope:
      'JBIE covers innovation management, applied and behavioural economics, finance, marketing, and organisational studies, welcoming both quantitative and qualitative methodologies.',
    eic: member('Editor-in-Chief', 'Prof. Michael Brandt', 'Professor of Economics', 'London School of Economics', 'United Kingdom'),
    associates: [
      member('Associate Editor', 'Dr. Sara Lindqvist', 'Associate Professor', 'Stockholm School of Economics', 'Sweden'),
    ],
    board: [
      member('Editorial Board Member', 'Dr. Andrés Rojas', 'Assistant Professor', 'Universidad de los Andes', 'Colombia'),
      member('Editorial Board Member', 'Dr. Nur Hidayah', 'Senior Lecturer', 'Universiti Malaya', 'Malaysia'),
    ],
  },
  {
    slug: 'ijess',
    title: 'Environmental Studies & Sustainability',
    fullTitle: 'International Journal of Environmental Studies and Sustainability',
    abbreviation: 'IJESS',
    eIssn: '2795-4471',
    pIssn: '2795-4463',
    doiPrefix: '10.32996/ijess',
    subjectId: 'sub-env',
    yearStarted: 2021,
    frequency: 'Quarterly',
    impactFactor: 3.4,
    acceptanceRate: 27,
    apcStandard: 170,
    languages: ['English'],
    description:
      'Climate science, ecology, and sustainability research addressing the planet’s most pressing environmental challenges.',
    aimsAndScope:
      'IJESS publishes research on climate change, biodiversity, renewable energy, environmental policy, and sustainable development, encouraging interdisciplinary and solutions-oriented work.',
    eic: member('Editor-in-Chief', 'Prof. Ana Beatriz Costa', 'Professor of Environmental Science', 'University of Cape Town', 'South Africa'),
    associates: [
      member('Associate Editor', 'Dr. Erik Johansson', 'Researcher', 'Norwegian University of Science and Technology', 'Norway'),
    ],
    board: [
      member('Editorial Board Member', 'Dr. Meera Krishnan', 'Assistant Professor', 'Indian Institute of Science', 'India'),
      member('Editorial Board Member', 'Dr. Sofia Ricci', 'Lecturer', 'University of Bologna', 'Italy'),
    ],
  },
  {
    slug: 'jels',
    title: 'Education & Learning Sciences',
    fullTitle: 'Journal of Education and Learning Sciences',
    abbreviation: 'JELS',
    eIssn: '2789-9931',
    pIssn: '2789-9923',
    doiPrefix: '10.32996/jels',
    subjectId: 'sub-soc',
    yearStarted: 2018,
    frequency: 'Bi-annual',
    impactFactor: 2.1,
    acceptanceRate: 36,
    apcStandard: 140,
    languages: ['English'],
    description:
      'Pedagogy, educational technology, and the cognitive science of learning across formal and informal settings.',
    aimsAndScope:
      'JELS publishes empirical and design-based research on teaching and learning, curriculum, assessment, and educational technology, from early years through higher education.',
    eic: member('Editor-in-Chief', 'Prof. Robert Sinclair', 'Professor of Education', 'University of Melbourne', 'Australia'),
    associates: [
      member('Associate Editor', 'Dr. Amina Yusuf', 'Senior Lecturer', 'University of Lagos', 'Nigeria'),
    ],
    board: [
      member('Editorial Board Member', 'Dr. Chloe Martin', 'Assistant Professor', 'McGill University', 'Canada'),
      member('Editorial Board Member', 'Dr. Ji-woo Park', 'Associate Professor', 'Seoul National University', 'South Korea'),
    ],
  },
  {
    slug: 'ijssh',
    title: 'Social Sciences & Humanities',
    fullTitle: 'International Journal of Social Sciences and Humanities',
    abbreviation: 'IJSSH',
    eIssn: '2790-3381',
    pIssn: '2790-3373',
    doiPrefix: '10.32996/ijssh',
    subjectId: 'sub-soc',
    yearStarted: 2017,
    frequency: 'Monthly',
    impactFactor: 1.9,
    acceptanceRate: 38,
    apcStandard: 130,
    languages: ['English'],
    description:
      'Sociology, psychology, political science, and the humanities, fostering interdisciplinary scholarly dialogue.',
    aimsAndScope:
      'IJSSH welcomes research across the social sciences and humanities, including sociology, psychology, anthropology, history, philosophy, and cultural studies.',
    eic: member('Editor-in-Chief', 'Prof. Isabella Ferrari', 'Professor of Sociology', 'University of Amsterdam', 'Netherlands'),
    associates: [
      member('Associate Editor', 'Dr. David Cohen', 'Associate Professor', 'Tel Aviv University', 'Israel'),
    ],
    board: [
      member('Editorial Board Member', 'Dr. Wanjiru Kamau', 'Lecturer', 'Makerere University', 'Uganda'),
      member('Editorial Board Member', 'Dr. Lars Petersen', 'Assistant Professor', 'Aarhus University', 'Denmark'),
    ],
  },
];

const CURRENT_YEAR = 2026;

function buildJournal(seed: JournalSeed): Journal {
  const subject = subjects.find((s) => s.id === seed.subjectId)!;
  return {
    id: `jr-${seed.slug}`,
    slug: seed.slug,
    title: seed.title,
    fullTitle: seed.fullTitle,
    abbreviation: seed.abbreviation,
    issn: seed.eIssn,
    eIssn: seed.eIssn,
    pIssn: seed.pIssn,
    doiPrefix: seed.doiPrefix,
    description: seed.description,
    subjectId: seed.subjectId,
    subjectArea: subject.name,
    isOpenAccess: true,
    yearStarted: seed.yearStarted,
    frequency: seed.frequency,
    languages: seed.languages,
    apcStandard: seed.apcStandard,
    apcFastTrack: seed.apcStandard + 100,
    impactFactor: seed.impactFactor,
    acceptanceRate: seed.acceptanceRate,
    ccLicence: 'CC BY 4.0',
    aimsAndScope: seed.aimsAndScope,
    about: `${seed.fullTitle} (${seed.abbreviation}) is a peer-reviewed, open-access journal published by Imperial Press since ${seed.yearStarted}. It follows a double-blind peer-review process and is committed to the rapid, rigorous dissemination of scholarship in ${subject.name.toLowerCase()}. All articles are published under a ${'CC BY 4.0'} licence, assigned a DOI, and archived for long-term preservation.`,
    editorInChief: seed.eic,
    editorialTeam: [seed.eic, ...seed.associates, ...seed.board],
    indexing: commonIndexing,
    announcements: [
      {
        id: `ann-${seed.slug}-1`,
        title: `Call for Papers — Special Issue (${CURRENT_YEAR})`,
        date: `${CURRENT_YEAR}-06-15`,
        body: `${seed.abbreviation} invites submissions for its upcoming special issue. See the Call for Papers section for scope and deadlines.`,
      },
      {
        id: `ann-${seed.slug}-2`,
        title: `Vol. ${CURRENT_YEAR - seed.yearStarted + 1} now indexed in DOAJ`,
        date: `${CURRENT_YEAR}-03-02`,
        body: 'The latest volume is now discoverable through the Directory of Open Access Journals.',
      },
    ],
  };
}

export const journals: Journal[] = seeds.map(buildJournal);

export const featuredJournalSlugs = seeds.filter((s) => s.featured).map((s) => s.slug);

export function getJournal(slug: string): Journal | undefined {
  return journals.find((j) => j.slug === slug);
}

export function getFeaturedJournals(): Journal[] {
  return journals.filter((j) => featuredJournalSlugs.includes(j.slug));
}

export function journalsBySubject(): { subjectId: string; journals: Journal[] }[] {
  return subjects
    .map((s) => ({ subjectId: s.id, journals: journals.filter((j) => j.subjectId === s.id) }))
    .filter((group) => group.journals.length > 0);
}
