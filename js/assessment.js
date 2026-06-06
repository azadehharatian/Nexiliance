/* ============================================================
   assessment.js — CRA Question Data & Scoring Logic
   42 questions across 6 CRA pillars
   ============================================================ */

const CRA_PILLARS = [
  {
    id: 'security-design',
    name: 'Security by Design',
    shortName: 'Sec. Design',
    icon: '🔐',
    color: '#4f6ef7',
    colorVar: 'var(--blue)',
    article: 'CRA Annex I, Part I',
    description: 'Cybersecurity must be designed into the product from the ground up — not bolted on afterwards.',
    questions: [
      { id: 'sd1',  text: 'Do you conduct formal threat modeling during the product design phase?' },
      { id: 'sd2',  text: 'Is data at rest encrypted using industry-standard algorithms (AES-256 or equivalent)?' },
      { id: 'sd3',  text: 'Is data in transit protected using TLS 1.2 or higher for all connections?' },
      { id: 'sd4',  text: 'Is the attack surface minimized — only necessary ports, services, and APIs are exposed?' },
      { id: 'sd5',  text: 'Are security requirements documented and signed off before development begins?' },
      { id: 'sd6',  text: 'Is access control based on the principle of least privilege throughout your system?' },
      { id: 'sd7',  text: 'Are third-party and open-source components evaluated for known vulnerabilities before integration?' },
      { id: 'sd8',  text: 'Does your development team receive regular secure coding training?' },
      { id: 'sd9',  text: 'Are security-focused code reviews mandatory for every release?' },
      { id: 'sd10', text: 'Is penetration testing conducted (internal or third-party) before product release?' },
    ]
  },
  {
    id: 'secure-default',
    name: 'Secure by Default',
    shortName: 'Sec. Default',
    icon: '🛡️',
    color: '#06b6d4',
    colorVar: 'var(--cyan)',
    article: 'CRA Annex I (2)(d)',
    description: 'Products must ship with security-maximizing configurations — users should not need to "opt in" to security.',
    questions: [
      { id: 'sbd1', text: 'Are all default passwords prohibited or must be changed on first login (unique per device)?' },
      { id: 'sbd2', text: 'Are security updates configured to install automatically by default?' },
      { id: 'sbd3', text: 'Are all non-essential features, ports, and services disabled by default?' },
      { id: 'sbd4', text: 'Are secure communication protocols (e.g., HTTPS, TLS) used by default — not opt-in?' },
      { id: 'sbd5', text: 'Is data collection limited strictly to what is necessary for the product to function (data minimization)?' },
      { id: 'sbd6', text: 'Are audit logging and activity monitoring enabled by default?' },
      { id: 'sbd7', text: 'Are network interfaces and firewall rules restrictive by default?' },
      { id: 'sbd8', text: 'Is multi-factor authentication (MFA) available and recommended or required by default?' },
    ]
  },
  {
    id: 'sbom',
    name: 'SBOM',
    shortName: 'SBOM',
    icon: '📋',
    color: '#10b981',
    colorVar: 'var(--green)',
    article: 'CRA Article 13(3)',
    description: 'A Software Bill of Materials is mandatory under the CRA — the equivalent of a list of ingredients for your software.',
    questions: [
      { id: 'sbom1', text: 'Do you maintain a complete inventory of all software components, including open-source and commercial libraries?' },
      { id: 'sbom2', text: 'Do you use automated tools to generate SBOMs (e.g., Syft, Black Duck, FOSSA, Trivy)?' },
      { id: 'sbom3', text: 'Is your SBOM produced in a standard machine-readable format (SPDX or CycloneDX)?' },
      { id: 'sbom4', text: 'Is your SBOM updated automatically with every software build or release?' },
      { id: 'sbom5', text: 'Do you continuously monitor SBOM components for newly disclosed CVEs and vulnerabilities?' },
      { id: 'sbom6', text: 'Is SBOM generation integrated into your CI/CD pipeline (e.g., GitHub Actions, GitLab CI, Jenkins)?' },
    ]
  },
  {
    id: 'conformity',
    name: 'Conformity Assessment',
    shortName: 'Conformity',
    icon: '📜',
    color: '#f59e0b',
    colorVar: 'var(--amber)',
    article: 'CRA Articles 32–36',
    description: 'Manufacturers must prove compliance — through self-assessment or a Notified Body — and affix the CE mark.',
    questions: [
      { id: 'ca1', text: 'Have you classified your product according to CRA risk categories (Default, Class I, or Class II)?' },
      { id: 'ca2', text: 'Have you determined whether your product requires third-party conformity assessment by a Notified Body?' },
      { id: 'ca3', text: 'Have you drafted or started preparing a Declaration of Conformity (DoC)?' },
      { id: 'ca4', text: 'Is technical documentation available that substantiates all your product security claims?' },
      { id: 'ca5', text: 'Are your security requirements and controls traceable to specific CRA articles and Annex I requirements?' },
      { id: 'ca6', text: 'Have you contacted a Notified Body if your product is classified as Class I or Class II?' },
      { id: 'ca7', text: 'Are your conformity assessment and testing procedures documented and repeatable?' },
    ]
  },
  {
    id: 'vuln-disclosure',
    name: 'Vulnerability Disclosure',
    shortName: 'Vuln. Disclose',
    icon: '🔔',
    color: '#a78bfa',
    colorVar: 'var(--violet)',
    article: 'CRA Articles 13(6), 14',
    description: 'Manufacturers must handle vulnerabilities responsibly and report exploited ones to ENISA within 24 hours.',
    questions: [
      { id: 'vd1', text: 'Do you have a published Vulnerability Disclosure Policy (VDP)?' },
      { id: 'vd2', text: 'Is there a secure channel for receiving vulnerability reports (security.txt, HackerOne, dedicated email)?' },
      { id: 'vd3', text: 'Are you familiar with ENISA\'s vulnerability reporting platform and its mandatory use under CRA?' },
      { id: 'vd4', text: 'Can your team report actively exploited vulnerabilities to ENISA within 24 hours as required by CRA?' },
      { id: 'vd5', text: 'Do you have an Incident Response Plan (IRP) for severe security incidents affecting your product?' },
      { id: 'vd6', text: 'Are affected customers and users promptly notified of vulnerabilities that affect them?' },
    ]
  },
  {
    id: 'support-period',
    name: 'Support Period',
    shortName: 'Support',
    icon: '⏱️',
    color: '#fb923c',
    colorVar: 'var(--orange)',
    article: 'CRA Article 13(8)',
    description: 'Security updates must be provided throughout the product\'s expected lifetime — generally at least 5 years.',
    questions: [
      { id: 'sp1', text: 'Have you committed to a minimum 5-year security support period for your product?' },
      { id: 'sp2', text: 'Is there a documented, reliable process for delivering security patches to end users?' },
      { id: 'sp3', text: 'Are end-of-life (EOL) dates clearly communicated to users well in advance?' },
      { id: 'sp4', text: 'Do you have a defined process for handling vulnerabilities discovered after a product reaches end-of-life?' },
      { id: 'sp5', text: 'Are security updates provided independently from feature updates, enabling faster security patch deployment?' },
    ]
  }
];

/* ── Scoring ─────────────────────────────────── */
// Answer values: 'yes'=2, 'partial'=1, 'no'=0, undefined=skipped

function getPillarScore(pillarId, answers) {
  const pillar = CRA_PILLARS.find(p => p.id === pillarId);
  if (!pillar) return { earned: 0, max: 0, pct: 0, answered: 0 };
  let earned = 0, answered = 0;
  const max = pillar.questions.length * 2;
  pillar.questions.forEach(q => {
    const a = answers[q.id];
    if (a === 'yes')     { earned += 2; answered++; }
    else if (a === 'partial') { earned += 1; answered++; }
    else if (a === 'no') { earned += 0; answered++; }
  });
  return { earned, max, pct: max > 0 ? Math.round((earned / max) * 100) : 0, answered, total: pillar.questions.length };
}

function getTotalScore(answers) {
  let totalEarned = 0, totalMax = 0, totalAnswered = 0, totalQuestions = 0;
  CRA_PILLARS.forEach(p => {
    const s = getPillarScore(p.id, answers);
    totalEarned   += s.earned;
    totalMax      += s.max;
    totalAnswered += s.answered;
    totalQuestions += s.total;
  });
  return {
    earned: totalEarned,
    max: totalMax,
    pct: totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0,
    answered: totalAnswered,
    total: totalQuestions,
  };
}

function getScoreColor(pct) {
  if (pct >= 80) return '#10b981';
  if (pct >= 60) return '#f59e0b';
  if (pct >= 40) return '#fb923c';
  return '#ef4444';
}

function getScoreLabel(pct) {
  if (pct >= 80) return 'CRA Ready';
  if (pct >= 60) return 'Progressing';
  if (pct >= 40) return 'Action Needed';
  return 'Critical Gaps';
}

/* ── Demo subset (15 questions — 2-3 per pillar) ── */
const DEMO_QUESTION_IDS = ['sd1','sd2','sd5','sbd1','sbd2','sbd4','sbom1','sbom3','sbom5','ca1','ca3','vd1','vd4','sp1','sp2'];

function getDemoQuestions() {
  const result = [];
  CRA_PILLARS.forEach(p => {
    p.questions.forEach(q => {
      if (DEMO_QUESTION_IDS.includes(q.id)) {
        result.push({ ...q, pillarName: p.name, pillarIcon: p.icon, pillarColor: p.color, pillarId: p.id });
      }
    });
  });
  return result;
}
