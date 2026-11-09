const fs = require('fs');
const path = require('path');

const ROOT = 'C:/Users/Admin/skillshop';
const CATALOG_PATH = path.join(ROOT, 'courses', 'catalog.json');
const COURSES_DIR = path.join(ROOT, 'courses');

// Read existing catalog
let existing = { courses: [] };
try {
  existing = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
} catch (e) {}

// Keep only courses that have actual course.json files
const validCourses = existing.courses.filter(c => {
  const p = path.join(ROOT, c.path);
  return fs.existsSync(p);
});

console.log(`Keeping ${validCourses.length} existing courses with valid JSON files`);

const catalog = {
  version: 3,
  updated: new Date().toISOString().slice(0, 10),
  tagline: 'Practical skills. Shareable proof.',
  courses: [...validCourses]
};

const existingIds = new Set(catalog.courses.map(c => c.id));

const TOPICS = [
  { slug: 'technology', name: 'Technology', color: '#4E56D8' },
  { slug: 'productivity', name: 'Productivity', color: '#2E9B62' },
  { slug: 'communication', name: 'Communication', color: '#D94F7A' },
  { slug: 'design', name: 'Design', color: '#8B5CF6' },
  { slug: 'business', name: 'Business', color: '#F2A33B' },
  { slug: 'data', name: 'Data & Analytics', color: '#27958E' },
  { slug: 'creative', name: 'Creative Arts', color: '#FF7A59' }
];

const COURSE_DEFINITIONS = {
  technology: [
    { id: 'microcontrollers-101', title: 'Microcontrollers 101', level: 'Beginner', duration: '5h 10m', icon: 'chip', color: '#FF7A59', badge: 'Circuit Starter', skills: ['Arduino programming', 'Circuit design', 'Sensor integration', 'Debugging hardware'], description: 'Build real hardware projects with Arduino-compatible boards. Learn to read sensors, control LEDs, and debug electronic circuits from the ground up.' },
    { id: 'python-foundations', title: 'Python Foundations', level: 'Beginner', duration: '5h 10m', icon: 'code', color: '#4E56D8', badge: 'Python Pioneer', skills: ['Python syntax', 'Data structures', 'File handling', 'Error handling'], description: 'Learn programming by writing small, useful programs. Covers variables, logic, loops, functions, files, error handling, and a complete command-line project.' },
    { id: 'web-design-foundations', title: 'Web Design Foundations', level: 'Beginner', duration: '5h 05m', icon: 'layout', color: '#27958E', badge: 'Web Weaver', skills: ['HTML semantics', 'CSS layout', 'Responsive design', 'Accessibility'], description: 'Build and publish your first responsive website with semantic HTML and modern CSS. Learn layout, typography, color, accessibility, and static hosting.' },
    { id: 'course-010', title: 'Blockchain Intro', level: 'Intermediate', duration: '3h 00m', icon: 'layout', color: '#4E56D8', badge: 'Topic Master', skills: ['Blockchain basics', 'Smart contracts', 'Cryptocurrency', 'Distributed ledger'], description: 'Understand blockchain technology, how distributed ledgers work, and what smart contracts enable.' },
    { id: 'course-029', title: 'Network Basics', level: 'Intermediate', duration: '3h 00m', icon: 'shield', color: '#4E56D8', badge: 'Topic Master', skills: ['TCP/IP', 'DNS', 'HTTP', 'Network security'], description: 'Learn how computer networks operate, from IP addressing to DNS, HTTP, and basic network security.' },
    { id: 'course-037', title: 'DevOps Fundamentals', level: 'Intermediate', duration: '3h 00m', icon: 'code', color: '#4E56D8', badge: 'Practitioner', skills: ['CI/CD', 'Containerization', 'Infrastructure as code', 'Monitoring'], description: 'Understand DevOps culture and practices including CI/CD pipelines, containerization, and infrastructure automation.' },
    { id: 'course-045', title: 'Cloud Computing 101', level: 'Advanced', duration: '4h 00m', icon: 'layers', color: '#4E56D8', badge: 'Skill Builder', skills: ['Cloud models', 'AWS basics', 'Azure basics', 'Google Cloud'], description: 'Learn cloud computing fundamentals, service models (IaaS, PaaS, SaaS), and major cloud providers.' },
    { id: 'course-046', title: 'Mobile App Development', level: 'Advanced', duration: '3h 00m', icon: 'bolt', color: '#4E56D8', badge: 'Achiever', skills: ['Mobile UI', 'App lifecycle', 'API integration', 'App store deployment'], description: 'Build mobile applications from design to deployment, covering UI patterns, data handling, and publishing.' }
  ],
  productivity: [
    { id: 'excel-essentials', title: 'Excel Essentials', level: 'Beginner', duration: '5h 00m', icon: 'grid', color: '#2E9B62', badge: 'Spreadsheet Navigator', skills: ['Formulas', 'PivotTables', 'Data validation', 'Charts'], description: 'Go from blank grid to confident spreadsheet. Master formulas, tables, charts, and PivotTables by building a budget tracker you can actually use.' },
    { id: 'powerpoint-storytelling', title: 'PowerPoint Storytelling', level: 'Beginner', duration: '4h 45m', icon: 'presentation', color: '#F2A33B', badge: 'Slide Storyteller', skills: ['Story structure', 'Visual hierarchy', 'Data visuals', 'Delivery'], description: 'Design slides that support your message instead of competing with it. Learn structure, visual hierarchy, charts, motion, and confident delivery.' },
    { id: 'word-professional-documents', title: 'Word Professional Documents', level: 'Beginner', duration: '4h 45m', icon: 'document', color: '#3F72C8', badge: 'Document Architect', skills: ['Styles', 'Page layout', 'Tables', 'Track changes'], description: 'Create reports, proposals, and templates that look intentional. Use styles, sections, tables, references, and review tools like a professional.' },
    { id: 'course-002', title: 'PowerPoint Design Systems', level: 'Intermediate', duration: '4h 00m', icon: 'wand', color: '#2E9B62', badge: 'Skill Builder', skills: ['Slide masters', 'Theme colors', 'Custom templates', 'Brand consistency'], description: 'Build consistent, reusable PowerPoint design systems with slide masters, custom themes, and brand-aligned templates.' },
    { id: 'course-006', title: 'Project Planning', level: 'Intermediate', duration: '3h 00m', icon: 'mic', color: '#2E9B62', badge: 'Achiever', skills: ['Work breakdown', 'Timeline estimation', 'Resource allocation', 'Risk management'], description: 'Learn to plan projects effectively with work breakdown structures, realistic timelines, and resource management.' },
    { id: 'course-009', title: 'Document Templates', level: 'Advanced', duration: '2h 00m', icon: 'bolt', color: '#2E9B62', badge: 'Achiever', skills: ['Template design', 'Form fields', 'Macro basics', 'Document automation'], description: 'Create reusable document templates with form fields, styles, and automation for consistent document production.' },
    { id: 'course-012', title: 'PowerPoint Design Systems', level: 'Advanced', duration: '2h 00m', icon: 'layers', color: '#2E9B62', badge: 'Practitioner', skills: ['Master slides', 'Theme customization', 'Brand kits', 'Template libraries'], description: 'Advanced PowerPoint design systems with master slides, custom themes, and enterprise-grade template libraries.' },
    { id: 'course-013', title: 'Word Automation', level: 'Intermediate', duration: '4h 00m', icon: 'medal', color: '#2E9B62', badge: 'Achiever', skills: ['Mail merge', 'Macros', 'Field codes', 'Document assembly'], description: 'Automate Word document creation with mail merge, macros, field codes, and document assembly techniques.' },
    { id: 'course-017', title: 'Time Management', level: 'Beginner', duration: '2h 00m', icon: 'brain', color: '#2E9B62', badge: 'Practitioner', skills: ['Prioritization', 'Time blocking', 'Task batching', 'Productivity systems'], description: 'Master time management with prioritization frameworks, time blocking, and productivity systems that work.' },
    { id: 'course-021', title: 'Advanced Excel Modeling', level: 'Advanced', duration: '5h 00m', icon: 'shield', color: '#2E9B62', badge: 'Achiever', skills: ['Financial modeling', 'Data tables', 'Scenario analysis', 'Advanced functions'], description: 'Build advanced Excel models with financial functions, data tables, scenario analysis, and complex formulas.' },
    { id: 'course-025', title: 'Notion for Productivity', level: 'Intermediate', duration: '5h 00m', icon: 'shield', color: '#2E9B62', badge: 'Skill Builder', skills: ['Database setup', 'Page design', 'Automation', 'Workspace organization'], description: 'Build organized productivity systems in Notion with databases, pages, automations, and workspace organization.' },
    { id: 'course-027', title: 'Time Management', level: 'Intermediate', duration: '3h 00m', icon: 'shield', color: '#2E9B62', badge: 'Practitioner', skills: ['Eisenhower matrix', 'Pomodoro technique', 'Deep work', 'Energy management'], description: 'Advanced time management techniques including the Eisenhower matrix, Pomodoro technique, and energy-based scheduling.' },
    { id: 'course-028', title: 'Meeting Facilitation', level: 'Beginner', duration: '4h 00m', icon: 'layers', color: '#2E9B62', badge: 'Topic Master', skills: ['Agenda design', 'Facilitation techniques', 'Conflict management', 'Action items'], description: 'Learn to facilitate effective meetings with clear agendas, engagement techniques, and actionable outcomes.' },
    { id: 'course-043', title: 'Word Automation', level: 'Intermediate', duration: '3h 00m', icon: 'wand', color: '#2E9B62', badge: 'Practitioner', skills: ['Mail merge', 'Templates', 'AutoText', 'Field codes'], description: 'Automate Word document creation with mail merge, templates, AutoText, and field codes for document efficiency.' },
    { id: 'course-044', title: 'Google Workspace Mastery', level: 'Advanced', duration: '3h 00m', icon: 'compass', color: '#2E9B62', badge: 'Achiever', skills: ['Google Docs', 'Google Sheets', 'Google Slides', 'Google Forms'], description: 'Master Google Workspace collaboration tools including Docs, Sheets, Slides, and Forms for team productivity.' }
  ],
  communication: [
    { id: 'public-speaking', title: 'Public Speaking with Confidence', level: 'Beginner', duration: '2h 40m', icon: 'mic', color: '#D94F7A', badge: 'Confident Voice', skills: ['Talk structure', 'Voice', 'Body language', 'Q&A'], description: 'Prepare and deliver a talk that people remember. Practice structure, voice, body language, nerves, Q&A, and a complete five-minute capstone presentation.' },
    { id: 'course-018', title: 'Active Listening', level: 'Beginner', duration: '2h 00m', icon: 'target', color: '#D94F7A', badge: 'Skill Builder', skills: ['Active listening', 'Empathy', 'Questioning', 'Feedback'], description: 'Master active listening techniques including empathetic responses, questioning skills, and constructive feedback.' },
    { id: 'course-024', title: 'Conflict Resolution', level: 'Beginner', duration: '2h 00m', icon: 'brain', color: '#D94F7A', badge: 'Topic Master', skills: ['Conflict styles', 'De-escalation', 'Negotiation', 'Mediation'], description: 'Learn to resolve conflicts constructively with de-escalation techniques, negotiation skills, and mediation basics.' },
    { id: 'course-033', title: 'Negotiation Skills', level: 'Beginner', duration: '5h 00m', icon: 'wand', color: '#D94F7A', badge: 'Practitioner', skills: ['Negotiation tactics', 'BATNA', 'Value creation', 'Closing deals'], description: 'Learn negotiation fundamentals including BATNA, value creation, tactical communication, and closing techniques.' },
    { id: 'course-034', title: 'Conflict Resolution', level: 'Advanced', duration: '4h 00m', icon: 'table', color: '#D94F7A', badge: 'Badge Earner', skills: ['Advanced mediation', 'Group conflict', 'Organizational conflict', 'Peacebuilding'], description: 'Advanced conflict resolution for complex group and organizational conflicts with mediation and peacebuilding techniques.' },
    { id: 'course-038', title: 'Active Listening', level: 'Intermediate', duration: '2h 00m', icon: 'book', color: '#D94F7A', badge: 'Achiever', skills: ['Deep listening', 'Reflective responses', 'Empathy building', 'Active silence'], description: 'Advanced active listening techniques including deep listening, reflective responses, and building empathy through listening.' },
    { id: 'course-048', title: 'Public Speaking', level: 'Advanced', duration: '5h 00m', icon: 'document', color: '#D94F7A', badge: 'Practitioner', skills: ['Advanced delivery', 'Storytelling', 'Audience analysis', 'Impromptu speaking'], description: 'Advanced public speaking with storytelling techniques, audience analysis, impromptu speaking, and advanced delivery skills.' }
  ],
  design: [
    { id: 'course-003', title: 'Typography Basics', level: 'Intermediate', duration: '3h 00m', icon: 'document', color: '#8B5CF6', badge: 'Topic Master', skills: ['Type classification', 'Font pairing', 'Hierarchy', 'Readability'], description: 'Learn typography fundamentals including type classification, font pairing, visual hierarchy, and readability principles.' },
    { id: 'course-004', title: 'User Experience Intro', level: 'Beginner', duration: '3h 00m', icon: 'table', color: '#8B5CF6', badge: 'Practitioner', skills: ['User research', 'Wireframing', 'User testing', 'Information architecture'], description: 'Introduction to user experience design including user research, wireframing, user testing, and information architecture.' },
    { id: 'course-008', title: 'Layout Design', level: 'Beginner', duration: '2h 00m', icon: 'palette', color: '#8B5CF6', badge: 'Skill Builder', skills: ['Grid systems', 'Whitespace', 'Alignment', 'Balance'], description: 'Learn layout design principles including grid systems, whitespace, alignment, and visual balance for effective layouts.' },
    { id: 'course-014', title: 'User Experience Intro', level: 'Intermediate', duration: '5h 00m', icon: 'brain', color: '#8B5CF6', badge: 'Badge Earner', skills: ['User personas', 'Journey mapping', 'Usability testing', 'Accessibility'], description: 'Intermediate UX design with user personas, journey mapping, usability testing, and accessibility considerations.' },
    { id: 'course-019', title: 'Icon Design', level: 'Intermediate', duration: '2h 00m', icon: 'code', color: '#8B5CF6', badge: 'Topic Master', skills: ['Icon systems', 'Vector design', 'Visual metaphors', 'Consistency'], description: 'Design icon systems with vector graphics, visual metaphors, and consistency across different sizes and contexts.' },
    { id: 'course-036', title: 'Logo Design', level: 'Advanced', duration: '3h 00m', icon: 'medal', color: '#8B5CF6', badge: 'Topic Master', skills: ['Logo design', 'Brand identity', 'Vector graphics', 'Typography'], description: 'Learn logo design principles including brand identity, vector graphics, and typography for memorable logos.' },
    { id: 'course-039', title: 'Icon Design', level: 'Intermediate', duration: '2h 00m', icon: 'award', color: '#8B5CF6', badge: 'Skill Builder', skills: ['Icon families', 'Scalable design', 'Visual language', 'Export formats'], description: 'Design icon families with scalable vector design, consistent visual language, and proper export formats.' },
    { id: 'course-049', title: 'Icon Design', level: 'Intermediate', duration: '3h 00m', icon: 'medal', color: '#8B5CF6', badge: 'Badge Earner', skills: ['Icon sets', 'Design systems', 'SVG optimization', 'Accessibility'], description: 'Design accessible icon sets for design systems with SVG optimization and accessibility considerations.' }
  ],
  business: [
    { id: 'course-007', title: 'Operations Management', level: 'Beginner', duration: '2h 00m', icon: 'palette', color: '#F2A33B', badge: 'Badge Earner', skills: ['Process design', 'Quality control', 'Supply chain', 'Operations strategy'], description: 'Learn operations management fundamentals including process design, quality control, and supply chain basics.' },
    { id: 'course-011', title: 'Entrepreneurship 101', level: 'Intermediate', duration: '5h 00m', icon: 'layout', color: '#F2A33B', badge: 'Achiever', skills: ['Business planning', 'Market validation', 'Pitching', 'Fundraising'], description: 'Learn entrepreneurship fundamentals including business planning, market validation, pitching, and fundraising basics.' },
    { id: 'course-023', title: 'Marketing Fundamentals', level: 'Advanced', duration: '4h 00m', icon: 'chip', color: '#F2A33B', badge: 'Topic Master', skills: ['Marketing mix', 'Customer segmentation', 'Positioning', 'Campaigns'], description: 'Learn marketing fundamentals including the marketing mix, customer segmentation, positioning, and campaign management.' },
    { id: 'course-030', title: 'Business Law Basics', level: 'Intermediate', duration: '2h 00m', icon: 'layout', color: '#F2A33B', badge: 'Practitioner', skills: ['Contracts', 'Employment law', 'Intellectual property', 'Business formation'], description: 'Understand business law fundamentals including contracts, employment law, intellectual property, and business formation.' },
    { id: 'course-032', title: 'Financial Literacy', level: 'Advanced', duration: '4h 00m', icon: 'book', color: '#F2A33B', badge: 'Topic Master', skills: ['Budgeting', 'Investing', 'Taxes', 'Retirement planning'], description: 'Master personal and business financial literacy including budgeting, investing, taxes, and retirement planning.' },
    { id: 'course-040', title: 'Business Law Basics', level: 'Intermediate', duration: '2h 00m', icon: 'medal', color: '#F2A33B', badge: 'Topic Master', skills: ['Contract law', 'Corporate law', 'Compliance', 'Risk management'], description: 'Intermediate business law covering contract law, corporate law, compliance, and risk management.' },
    { id: 'course-041', title: 'Entrepreneurship 101', level: 'Beginner', duration: '2h 00m', icon: 'document', color: '#F2A33B', badge: 'Skill Builder', skills: ['Idea validation', 'Lean startup', 'MVP', 'Customer discovery'], description: 'Introduction to entrepreneurship with idea validation, lean startup methodology, MVP development, and customer discovery.' },
    { id: 'course-042', title: 'Financial Literacy', level: 'Advanced', duration: '2h 00m', icon: 'award', color: '#F2A33B', badge: 'Practitioner', skills: ['Personal finance', 'Investment strategies', 'Risk management', 'Wealth building'], description: 'Advanced financial literacy with personal finance, investment strategies, risk management, and wealth building techniques.' },
    { id: 'course-050', title: 'Business Law Basics', level: 'Advanced', duration: '2h 00m', icon: 'medal', color: '#F2A33B', badge: 'Topic Master', skills: ['Regulatory compliance', 'Corporate governance', 'International business law', 'Dispute resolution'], description: 'Advanced business law covering regulatory compliance, corporate governance, international business law, and dispute resolution.' }
  ],
  data: [
    { id: 'course-001', title: 'Data Visualization', level: 'Advanced', duration: '2h 00m', icon: 'compass', color: '#27958E', badge: 'Achiever', skills: ['Chart selection', 'Data storytelling', 'Color theory', 'Dashboard design'], description: 'Learn data visualization principles including chart selection, data storytelling, color theory, and dashboard design.' },
    { id: 'course-005', title: 'Data Cleaning', level: 'Advanced', duration: '4h 00m', icon: 'chip', color: '#27958E', badge: 'Topic Master', skills: ['Data wrangling', 'Missing values', 'Outliers', 'Data validation'], description: 'Learn data cleaning techniques including data wrangling, handling missing values, outlier detection, and data validation.' },
    { id: 'course-016', title: 'A/B Testing', level: 'Advanced', duration: '4h 00m', icon: 'wand', color: '#27958E', badge: 'Achiever', skills: ['Hypothesis testing', 'Statistical significance', 'Experiment design', 'Results analysis'], description: 'Learn A/B testing methodology including hypothesis testing, statistical significance, experiment design, and results analysis.' },
    { id: 'course-022', title: 'Statistics Intro', level: 'Intermediate', duration: '4h 00m', icon: 'target', color: '#27958E', badge: 'Topic Master', skills: ['Descriptive statistics', 'Probability', 'Distributions', 'Inference'], description: 'Introduction to statistics including descriptive statistics, probability, distributions, and statistical inference.' },
    { id: 'course-031', title: 'Data Visualization', level: 'Beginner', duration: '3h 00m', icon: 'table', color: '#27958E', badge: 'Skill Builder', skills: ['Bar charts', 'Line charts', 'Scatter plots', 'Data stories'], description: 'Beginner data visualization with bar charts, line charts, scatter plots, and telling stories with data.' },
    { id: 'course-035', title: 'Data Cleaning', level: 'Beginner', duration: '2h 00m', icon: 'chip', color: '#27958E', badge: 'Topic Master', skills: ['Data cleaning', 'Missing data', 'Duplicates', 'Data quality'], description: 'Learn data cleaning fundamentals including handling missing data, removing duplicates, and ensuring data quality.' },
    { id: 'course-047', title: 'KPI Tracking', level: 'Advanced', duration: '2h 00m', icon: 'chip', color: '#27958E', badge: 'Badge Earner', skills: ['KPI selection', 'Dashboard design', 'Metric tracking', 'Performance reporting'], description: 'Learn KPI tracking with metric selection, dashboard design, performance reporting, and data-driven decision making.' }
  ],
  creative: [
    { id: 'course-015', title: 'Creative Writing', level: 'Beginner', duration: '2h 00m', icon: 'brain', color: '#FF7A59', badge: 'Achiever', skills: ['Story structure', 'Character development', 'Dialogue', 'Editing'], description: 'Learn creative writing fundamentals including story structure, character development, dialogue writing, and editing.' },
    { id: 'course-020', title: 'Creative Portfolio', level: 'Beginner', duration: '2h 00m', icon: 'target', color: '#FF7A59', badge: 'Badge Earner', skills: ['Portfolio design', 'Project selection', 'Presentation', 'Online presence'], description: 'Build a creative portfolio with project selection, presentation design, and online presence for showcasing your work.' },
    { id: 'course-026', title: 'Podcasting 101', level: 'Beginner', duration: '4h 00m', icon: 'bolt', color: '#FF7A59', badge: 'Achiever', skills: ['Audio recording', 'Editing', 'Publishing', 'Distribution'], description: 'Learn podcasting fundamentals including audio recording, editing, publishing, and distribution to podcast platforms.' }
  ]
};

function generateCourseLessons(courseDef) {
  const modules = [];
  for (let m = 0; m < 5; m++) {
    const moduleLessons = [];
    for (let l = 0; l < 3; l++) {
      const lessonId = `${courseDef.id}-m${m + 1}l${l + 1}`;
      const lessonNum = m * 3 + l + 1;
      moduleLessons.push({
        id: lessonId,
        title: `${['Introduction', 'Core Concepts', 'Hands-on Practice', 'Advanced Techniques', 'Review'][m]}: ${courseDef.title} - Lesson ${lessonNum}`,
        minutes: 12 + Math.floor(Math.random() * 18),
        content: generateLessonContent(courseDef, m, l, lessonNum)
      });
    }
    modules.push({
      id: `m${m + 1}`,
      title: `Module ${m + 1}: ${['Foundations', 'Core Skills', 'Practice', 'Advanced', 'Mastery'][m]}`,
      summary: `Learn the essentials of module ${m + 1} for ${courseDef.title}.`,
      lessons: moduleLessons
    });
  }
  return modules;
}

function generateLessonContent(courseDef, moduleIdx, lessonIdx, lessonNum) {
  const topics = [
    ['Introduction', 'Core Concepts', 'Hands-on Practice'],
    ['Advanced Techniques', 'Best Practices', 'Common Mistakes'],
    ['Real-world Application', 'Case Studies', 'Project Work'],
    ['Optimization', 'Troubleshooting', 'Advanced Patterns'],
    ['Capstone Project', 'Review', 'Next Steps']
  ];
  const topicName = topics[moduleIdx][lessonIdx];
  
  const blocks = [
    { type: 'lead', text: `In this lesson you'll learn about ${topicName} and how to apply it in real-world scenarios within the context of ${courseDef.title}.` },
    { type: 'h', text: `Core Concept: ${topicName}` },
    { type: 'p', text: `This lesson covers the fundamentals of ${topicName}. You'll learn practical techniques you can apply immediately in your ${courseDef.title.toLowerCase()} projects.` },
    { type: 'list', style: 'bullet', items: [
      `Understand the fundamentals of ${topicName}`,
      `Apply ${topicName} to real-world scenarios`,
      `Identify common mistakes and how to avoid them`,
      `Build confidence through hands-on practice`
    ]},
    { type: 'callout', tone: 'tip', title: 'Remember', text: `Practice ${topicName} with real examples before moving to the next lesson.` },
    { type: 'quiz', question: `What is the main goal of learning ${topicName}?`, options: ['To learn the fundamentals', 'To skip the basics', 'To memorize everything', 'To avoid practice'], answer: 0, explanation: `The goal is to build a solid foundation in ${topicName} that you can build on.` },
    { type: 'h3', text: 'Apply it' },
    { type: 'p', text: `Try applying ${topicName} to a small project this week. Reflect on what worked and what needs more practice.` }
  ];
  
  return blocks;
}

function generateFinalAssessment(courseDef) {
  return {
    title: `${courseDef.badge} Assessment`,
    intro: `Answer all 8 questions. Score 80% or higher to earn the ${courseDef.badge} badge and certificate. You can retake the assessment if needed.`,
    passScore: 80,
    questions: [
      { question: `What is the primary focus of ${courseDef.title}?`, options: ['Theory only', 'Practical application', 'History', 'Unrelated topics'], answer: 1, explanation: `${courseDef.title} focuses on practical, usable skills.` },
      { question: `Which level is this course designed for?`, options: ['Beginner', 'Expert only', 'Level 99', 'No level'], answer: 0, explanation: `This course is designed for ${courseDef.level.toLowerCase()} learners.` },
      { question: `How many modules does this course have?`, options: ['1', '3', '5', '10'], answer: 2, explanation: 'The course is organized into 5 modules.' },
      { question: `What do you earn on completion?`, options: ['Nothing', 'A badge and certificate', 'A trophy', 'An email'], answer: 1, explanation: 'Completing the course and assessment earns a badge and certificate.' },
      { question: `Can you retake the final assessment?`, options: ['No', 'Yes, unlimited', 'Once', 'Only with payment'], answer: 1, explanation: 'You can retake the assessment if you need to.' },
      { question: `Is practice recommended?`, options: ['Yes', 'No', 'Maybe', 'Only for experts'], answer: 0, explanation: 'Practice is essential to mastering any skill.' },
      { question: `What is included in each lesson?`, options: ['Only videos', 'Content, examples, and a quiz', 'Only quizzes', 'Only reading'], answer: 1, explanation: 'Lessons include content, examples, and knowledge checks.' },
      { question: `Who can take this course?`, options: ['Only experts', 'Anyone interested', 'Only paid members', 'Only students'], answer: 1, explanation: 'Anyone interested in the topic can take this course.' }
    ]
  };
}

function main() {
  const generated = [];

  for (let i = 0; i < 50; i++) {
    const topic = TOPICS[i % TOPICS.length];
    const defs = COURSE_DEFINITIONS[topic.slug];
    const def = defs[i % defs.length];
    const id = `course-${String(i + 1).padStart(3, '0')}`;
    
    if (existingIds.has(id)) continue;
    
    const dir = path.join(COURSES_DIR, topic.slug, id);
    fs.mkdirSync(dir, { recursive: true });
    
    const course = {
      id,
      title: def.title,
      topic: topic.name,
      topicSlug: topic.slug,
      level: def.level,
      duration: def.duration,
      description: def.description,
      icon: def.icon,
      color: def.color,
      accent: '#F6F2EA',
      badge: { name: def.badge, icon: ['award', 'spark', 'medal', 'target'][i % 4], description: `Awarded for completing ${def.title}.` },
      skills: def.skills,
      path: `courses/${topic.slug}/${id}/course.json`,
      featured: false
    };
    
    const fullCourse = {
      ...course,
      modules: generateCourseLessons(course),
      finalAssessment: generateFinalAssessment(course)
    };
    
    fs.writeFileSync(path.join(dir, 'course.json'), JSON.stringify(fullCourse, null, 2) + '\n');
    catalog.courses.push(course);
    generated.push(course);
  }

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2) + '\n');
  console.log(`Generated ${generated.length} new courses. Total in catalog: ${catalog.courses.length}`);
}

main();
