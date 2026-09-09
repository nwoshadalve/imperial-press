/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import type { Author, Issue, Paper, SectionType } from '@/types';
import { journals, getJournal } from './journals';

const CURRENT_YEAR = 2026;

/** Build the current-year issue list for each journal (one per recent month). */
function buildIssues(): Issue[] {
  const list: Issue[] = [];
  for (const j of journals) {
    const volume = CURRENT_YEAR - j.yearStarted + 1;
    // Latest few months of the current volume.
    for (const month of [7, 6, 5, 4]) {
      list.push({
        id: `iss-${j.slug}-${CURRENT_YEAR}-${month}`,
        journalId: j.id,
        volume,
        number: month,
        year: CURRENT_YEAR,
        publishedAt: `${CURRENT_YEAR}-${String(month).padStart(2, '0')}-28`,
        label: `Vol. ${volume} No. ${month} (${CURRENT_YEAR})`,
      });
    }
  }
  return list;
}

export const issues: Issue[] = buildIssues();

export function latestIssue(journalSlug: string): Issue | undefined {
  const j = getJournal(journalSlug);
  if (!j) return undefined;
  return issues
    .filter((i) => i.journalId === j.id)
    .sort((a, b) => b.number - a.number)[0];
}

export function issuesForJournal(journalSlug: string): Issue[] {
  const j = getJournal(journalSlug);
  if (!j) return [];
  return issues
    .filter((i) => i.journalId === j.id)
    .sort((a, b) => b.number - a.number);
}

function a(name: string, affiliation: string, country: string, orcid?: string): Author {
  return { id: `au-${name.replace(/\W+/g, '-').toLowerCase()}`, name, affiliation, country, orcid };
}

interface PaperSeed {
  slug: string;
  journalSlug: string;
  title: string;
  section: SectionType;
  page: [number, number];
  seq: number;
  month: number;
  keywords: string[];
  authors: Author[];
  abstract: string;
  views: number;
  downloads: number;
  citations: number;
}

const seeds: PaperSeed[] = [
  {
    slug: 'attention-efficient-transformers-edge',
    journalSlug: 'ijaiml',
    title: 'Attention-Efficient Transformers for On-Device Inference at the Edge',
    section: 'Research Article',
    page: [1, 18],
    seq: 1,
    month: 7,
    keywords: ['transformers', 'edge computing', 'model compression', 'attention', 'efficiency'],
    authors: [
      a('Mei-Ling Chen', 'National University of Singapore', 'Singapore', '0000-0002-1825-0097'),
      a('Daniel R. Okonkwo', 'ETH Zürich', 'Switzerland'),
    ],
    abstract:
      'Deploying transformer models on resource-constrained edge devices remains challenging due to the quadratic cost of self-attention. We propose a sparsity-aware attention mechanism that reduces memory footprint by 47% while preserving accuracy within 1.2% of the dense baseline across three benchmark tasks. Extensive experiments on mobile-class hardware demonstrate real-time latency, and an ablation study isolates the contribution of each architectural component. Our findings suggest that structured sparsity, rather than aggressive quantization alone, offers the most favourable accuracy–efficiency trade-off for on-device inference.',
    views: 3421,
    downloads: 1187,
    citations: 24,
  },
  {
    slug: 'federated-learning-privacy-healthcare',
    journalSlug: 'ijaiml',
    title: 'A Federated Learning Framework for Privacy-Preserving Clinical Prediction',
    section: 'Research Article',
    page: [19, 37],
    seq: 2,
    month: 7,
    keywords: ['federated learning', 'privacy', 'healthcare', 'differential privacy'],
    authors: [
      a('Priya Nair', 'IIT Bombay', 'India'),
      a('Aisha Bello', 'University of Toronto', 'Canada'),
    ],
    abstract:
      'We present a federated learning framework that enables multiple hospitals to jointly train clinical prediction models without sharing patient records. By combining secure aggregation with differential privacy, the framework provides formal privacy guarantees while achieving predictive performance comparable to centralised training. We evaluate the approach on a multi-site mortality-prediction task and analyse the trade-off between privacy budget and model utility.',
    views: 2760,
    downloads: 903,
    citations: 15,
  },
  {
    slug: 'graph-neural-networks-survey',
    journalSlug: 'jcds',
    title: 'Graph Neural Networks for Tabular Data: A Systematic Review',
    section: 'Review Article',
    page: [1, 29],
    seq: 1,
    month: 7,
    keywords: ['graph neural networks', 'tabular data', 'representation learning', 'survey'],
    authors: [
      a('James Whitfield', 'University of Edinburgh', 'United Kingdom'),
      a('Sofia Almeida', 'University of São Paulo', 'Brazil'),
    ],
    abstract:
      'Graph neural networks (GNNs) have shown promise beyond their traditional graph domains. This systematic review surveys 128 studies applying GNNs to tabular data, categorising methods by how they induce graph structure from tabular features. We identify recurring design patterns, summarise empirical results, and highlight open challenges in scalability and interpretability that future work should address.',
    views: 1994,
    downloads: 712,
    citations: 9,
  },
  {
    slug: 'code-switching-bilingual-classrooms',
    journalSlug: 'ijllt',
    title: 'Code-Switching as a Pedagogical Resource in Bilingual Classrooms',
    section: 'Research Article',
    page: [1, 15],
    seq: 1,
    month: 7,
    keywords: ['code-switching', 'bilingual education', 'applied linguistics', 'pedagogy'],
    authors: [
      a('Carmen Ortega', 'Universidad de Buenos Aires', 'Argentina'),
      a('Nadia El-Amin', 'University of Cambridge', 'United Kingdom'),
    ],
    abstract:
      'This study examines how teachers strategically deploy code-switching to scaffold comprehension in bilingual secondary classrooms. Drawing on classroom observations and teacher interviews across six schools, we identify four functional categories of pedagogical code-switching and discuss their implications for language-in-education policy. The findings challenge deficit views of translanguaging and argue for its principled integration into teacher training.',
    views: 2210,
    downloads: 845,
    citations: 12,
  },
  {
    slug: 'literary-translation-machine-post-editing',
    journalSlug: 'ijllt',
    title: 'Human–Machine Collaboration in Literary Translation: A Post-Editing Study',
    section: 'Research Article',
    page: [16, 33],
    seq: 2,
    month: 7,
    keywords: ['translation studies', 'post-editing', 'literary translation', 'machine translation'],
    authors: [
      a('Lucas Bernard', 'Sorbonne Université', 'France'),
      a('Ahmed Farouk', 'Cairo University', 'Egypt'),
    ],
    abstract:
      'As neural machine translation matures, its role in literary translation remains contested. Through a controlled post-editing experiment with professional literary translators, we measure productivity, quality, and translator satisfaction when working from machine-generated drafts. Results indicate significant productivity gains for prose but persistent difficulties with figurative language, suggesting a complementary rather than substitutive role for machine assistance.',
    views: 1503,
    downloads: 588,
    citations: 6,
  },
  {
    slug: 'wearable-sensors-cardiac-monitoring',
    journalSlug: 'jacm',
    title: 'Wearable Photoplethysmography for Early Detection of Atrial Fibrillation',
    section: 'Research Article',
    page: [1, 12],
    seq: 1,
    month: 7,
    keywords: ['atrial fibrillation', 'wearables', 'photoplethysmography', 'cardiology'],
    authors: [
      a('Elena Vasquez', 'Johns Hopkins University', 'United States', '0000-0001-7842-1123'),
      a('Rohan Kapoor', 'All India Institute of Medical Sciences', 'India'),
    ],
    abstract:
      'Atrial fibrillation (AF) is frequently asymptomatic yet substantially increases stroke risk. In a prospective cohort of 1,842 participants, we evaluated a consumer-grade wrist wearable using photoplethysmography for AF screening against 12-lead ECG. The device achieved a sensitivity of 94.1% and specificity of 97.3%. We discuss the clinical implications of population-scale passive screening and the importance of confirmatory diagnostics before treatment.',
    views: 4102,
    downloads: 1560,
    citations: 31,
  },
  {
    slug: 'community-health-workers-maternal-outcomes',
    journalSlug: 'ijphr',
    title: 'Community Health Worker Programmes and Maternal Outcomes: A Multi-Country Analysis',
    section: 'Research Article',
    page: [1, 20],
    seq: 1,
    month: 7,
    keywords: ['maternal health', 'community health workers', 'health equity', 'global health'],
    authors: [
      a('Grace Achieng', 'University of Nairobi', 'Kenya'),
      a('Fatima Rahimi', 'Aga Khan University', 'Pakistan'),
    ],
    abstract:
      'Community health worker (CHW) programmes are widely promoted to improve maternal health in low-resource settings, yet evidence on their comparative effectiveness is fragmented. Analysing survey data from eight countries, we estimate the association between CHW coverage and antenatal-care attendance and skilled birth attendance. We find consistent positive associations and discuss the programme features most strongly linked to improved outcomes.',
    views: 1876,
    downloads: 701,
    citations: 8,
  },
  {
    slug: 'green-hydrogen-supply-chains',
    journalSlug: 'ijess',
    title: 'Techno-Economic Assessment of Green Hydrogen Supply Chains in Coastal Regions',
    section: 'Research Article',
    page: [1, 22],
    seq: 1,
    month: 7,
    keywords: ['green hydrogen', 'renewable energy', 'sustainability', 'techno-economic analysis'],
    authors: [
      a('Ana Beatriz Costa', 'University of Cape Town', 'South Africa'),
      a('Erik Johansson', 'Norwegian University of Science and Technology', 'Norway'),
    ],
    abstract:
      'Green hydrogen is central to many decarbonisation strategies, but its economic viability depends heavily on local renewable resources and infrastructure. We develop a techno-economic model for coastal green-hydrogen supply chains and apply it to three representative regions. The analysis identifies the levelised cost drivers and the policy conditions under which green hydrogen becomes cost-competitive with fossil alternatives.',
    views: 1345,
    downloads: 522,
    citations: 5,
  },
  {
    slug: 'behavioural-nudges-retirement-savings',
    journalSlug: 'jbie',
    title: 'Behavioural Nudges and Retirement Savings: Evidence from a Field Experiment',
    section: 'Research Article',
    page: [1, 19],
    seq: 1,
    month: 7,
    keywords: ['behavioural economics', 'nudges', 'retirement savings', 'field experiment'],
    authors: [
      a('Sara Lindqvist', 'Stockholm School of Economics', 'Sweden'),
      a('Michael Brandt', 'London School of Economics', 'United Kingdom'),
    ],
    abstract:
      'We report a pre-registered field experiment testing whether simplified enrolment and social-comparison messaging increase voluntary retirement contributions. Among 6,300 employees, treatment increased average contribution rates by 1.8 percentage points, with effects concentrated among younger workers. We discuss the welfare implications and the durability of nudge effects over a twelve-month follow-up.',
    views: 1620,
    downloads: 640,
    citations: 7,
  },
  {
    slug: 'generative-ai-classroom-assessment',
    journalSlug: 'jels',
    title: 'Generative AI and the Future of Classroom Assessment: Opportunities and Risks',
    section: 'Discussion Note',
    page: [1, 11],
    seq: 1,
    month: 6,
    keywords: ['generative AI', 'assessment', 'educational technology', 'academic integrity'],
    authors: [
      a('Robert Sinclair', 'University of Melbourne', 'Australia'),
      a('Amina Yusuf', 'University of Lagos', 'Nigeria'),
    ],
    abstract:
      'Generative AI tools are reshaping how students produce and how educators evaluate academic work. This discussion note examines the tension between authentic assessment and the widespread availability of generative models. We propose a framework for assessment redesign that emphasises process, reflection, and applied reasoning, and we outline an agenda for empirical research on its effectiveness.',
    views: 2890,
    downloads: 1024,
    citations: 14,
  },
];

function buildPaper(seed: PaperSeed): Paper {
  const journal = getJournal(seed.journalSlug)!;
  const volume = CURRENT_YEAR - journal.yearStarted + 1;
  const issueId = `iss-${journal.slug}-${CURRENT_YEAR}-${seed.month}`;
  return {
    id: `pp-${seed.slug}`,
    slug: seed.slug,
    title: seed.title,
    abstract: seed.abstract,
    keywords: seed.keywords,
    authors: seed.authors,
    journalId: journal.id,
    journalTitle: journal.fullTitle,
    issueId,
    sectionType: seed.section,
    volume,
    issueNumber: seed.month,
    pageStart: seed.page[0],
    pageEnd: seed.page[1],
    doi: `${journal.doiPrefix}.${CURRENT_YEAR}.${volume}.${seed.month}.${seed.seq}`,
    licence: 'Open Access — CC BY 4.0',
    publishedAt: `${CURRENT_YEAR}-${String(seed.month).padStart(2, '0')}-28`,
    viewCount: seed.views,
    downloadCount: seed.downloads,
    citationCount: seed.citations,
    isOpenAccess: true,
  };
}

export const papers: Paper[] = seeds.map(buildPaper);

export function getPaper(slug: string): Paper | undefined {
  return papers.find((p) => p.slug === slug || p.id === slug);
}

export function papersByJournal(journalSlug: string): Paper[] {
  const j = getJournal(journalSlug);
  if (!j) return [];
  return papers.filter((p) => p.journalId === j.id);
}

export function papersInIssue(issueId: string): Paper[] {
  return papers.filter((p) => p.issueId === issueId);
}

export function recentPapers(limit = 6): Paper[] {
  return [...papers]
    .sort((x, y) => y.publishedAt.localeCompare(x.publishedAt) || y.viewCount - x.viewCount)
    .slice(0, limit);
}
