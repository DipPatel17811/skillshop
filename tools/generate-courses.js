const fs = require('fs');
const path = require('path');

const ROOT = 'C:/Users/Admin/skillshop';
const COURSES_DIR = path.join(ROOT, 'courses');

// Helper to create lesson blocks
function createLessonBlock(type, data = {}) {
  return { type, ...data };
}

// Lesson topics per course type
function getLessonTopics(topicSlug) {
  const topics = {
    technology: [
      ['Introduction', 'Core Concepts', 'Hands-on Practice'],
      ['Advanced Techniques', 'Best Practices', 'Common Mistakes'],
      ['Real-world Application', 'Case Studies', 'Project Work'],
      ['Optimization', 'Troubleshooting', 'Advanced Patterns'],
      ['Capstone Project', 'Review', 'Next Steps']
    ],
    productivity: [
      ['Getting Started', 'Core Principles', 'Daily Practice'],
      ['Advanced Workflows', 'Efficiency Tips', 'Common Pitfalls'],
      ['Real Projects', 'Case Studies', 'Collaboration'],
      ['Automation', 'Integration', 'Scaling'],
      ['Capstone Project', 'Review', 'Next Steps']
    ],
    communication: [
      ['Introduction', 'Core Concepts', 'Hands-on Practice'],
      ['Advanced Techniques', 'Best Practices', 'Common Mistakes'],
      ['Real-world Application', 'Case Studies', 'Project Work'],
      ['Optimization', 'Troubleshooting', 'Advanced Patterns'],
      ['Capstone Project', 'Review', 'Next Steps']
    ],
    design: [
      ['Design Principles', 'Color Theory', 'Typography'],
      ['Layout Systems', 'Visual Hierarchy', 'Grid Systems'],
      ['User Research', 'Wireframing', 'Prototyping'],
      ['Accessibility', 'Responsive Design', 'Testing'],
      ['Portfolio Project', 'Review', 'Next Steps']
    ],
    business: [
      ['Business Fundamentals', 'Market Research', 'Business Planning'],
      ['Financial Basics', 'Marketing Strategy', 'Operations'],
      ['Sales Techniques', 'Customer Relations', 'Team Management'],
      ['Growth Strategies', 'Risk Management', 'Scaling'],
      ['Business Plan', 'Review', 'Execution Plan']
    ],
    'data-analytics': [
      ['Data Fundamentals', 'Data Collection', 'Data Cleaning'],
      ['Exploratory Analysis', 'Statistical Thinking', 'Data Visualization'],
      ['Hypothesis Testing', 'Regression Analysis', 'Time Series'],
      ['Machine Learning Basics', 'Model Evaluation', 'Ethics'],
      ['Capstone Project', 'Review', 'Career Path']
    ],
    'creative-arts': [
      ['Creative Process', 'Inspiration', 'Sketching'],
      ['Composition', 'Color Theory', 'Typography'],
      ['Digital Tools', 'Traditional Media', 'Mixed Media'],
      ['Style Development', 'Client Work', 'Presentation'],
      ['Portfolio', 'Review', 'Career Path']
    ]
  };
  return topics[topicSlug] || topics.technology;
}

function getLessonBulletPoints(topicSlug, moduleIdx, lessonIdx) {
  const topicBulletPoints = {
    technology: [
      ['Understand the fundamentals', 'Identify key components', 'Apply basic techniques'],
      ['Implement advanced features', 'Follow best practices', 'Avoid common pitfalls'],
      ['Build real projects', 'Analyze case studies', 'Complete hands-on exercises'],
      ['Optimize performance', 'Debug effectively', 'Apply advanced patterns'],
      ['Complete capstone', 'Review learning', 'Plan next steps']
    ],
    productivity: [
      ['Define your goals', 'Choose the right tools', 'Set up your workflow'],
      ['Automate repetitive tasks', 'Optimize your process', 'Collaborate with others'],
      ['Apply to real projects', 'Analyze case studies', 'Complete hands-on exercises'],
      ['Scale your workflow', 'Troubleshoot issues', 'Apply advanced patterns'],
      ['Complete capstone', 'Review learning', 'Plan next steps']
    ],
    communication: [
      ['Listen actively', 'Speak clearly', 'Read body language'],
      ['Handle difficult topics', 'Use positive body language', 'Modulate your voice'],
      ['Structure your talk', 'Engage your audience', 'Write clearly'],
      ['Resolve conflicts', 'Negotiate effectively', 'Build relationships'],
      ['Deliver your talk', 'Review performance', 'Plan growth']
    ],
    design: [
      ['Understand design principles', 'Learn color theory', 'Choose typography'],
      ['Create layouts', 'Establish hierarchy', 'Use grids'],
      ['Research user needs', 'Create wireframes', 'Build prototypes'],
      ['Ensure accessibility', 'Design for all screens', 'Test with users'],
      ['Build portfolio', 'Review work', 'Plan career']
    ],
    business: [
      ['Understand business basics', 'Research the market', 'Create a plan'],
      ['Manage finances', 'Develop marketing', 'Run operations'],
      ['Sell effectively', 'Serve customers', 'Lead teams'],
      ['Grow strategically', 'Manage risk', 'Scale operations'],
      ['Write business plan', 'Review progress', 'Execute plan']
    ],
    'data-analytics': [
      ['Collect data', 'Clean data', 'Explore patterns'],
      ['Analyze statistically', 'Visualize findings', 'Tell data stories'],
      ['Test hypotheses', 'Build regression models', 'Analyze time series'],
      ['Learn ML basics', 'Evaluate models', 'Consider ethics'],
      ['Complete project', 'Review skills', 'Plan career']
    ],
    'creative-arts': [
      ['Creative process', 'Inspiration', 'Sketching'],
      ['Composition', 'Color theory', 'Typography'],
      ['Digital tools', 'Traditional media', 'Mixed media'],
      ['Style development', 'Client work', 'Presentation'],
      ['Portfolio', 'Review', 'Career path']
    ]
  };
  return topicBulletPoints[topicSlug] || topicBulletPoints.technology;
}

function generateLessonContent(courseDef, moduleIdx, lessonIdx, lessonNum) {
  const topicSlug = courseDef.topicSlug;
  const lessonTopics = getLessonTopics(topicSlug);
  const lessonTitle = lessonTopics[moduleIdx][lessonIdx];
  
  return [
    { type: 'lead', text: `In this lesson you'll learn about ${lessonTitle} and how to apply it in real-world scenarios within the context of ${courseDef.title}.` },
    { type: 'h', text: `Core Concept: ${lessonTitle}` },
    { type: 'p', text: `This lesson covers the fundamentals of ${lessonTitle}. You'll learn practical techniques you can apply immediately in your ${courseDef.title.toLowerCase()} projects.` },
    { type: 'list', style: 'bullet', items: getLessonBulletPoints(topicSlug, moduleIdx, lessonIdx) },
    { type: 'callout', tone: 'tip', title: 'Pro Tip', text: `Practice ${lessonTitle} with real examples before moving to the next lesson.` },
    { type: 'callout', tone: 'warning', title: 'Common Mistake', text: `Beginners often rush through ${lessonTitle} without mastering the fundamentals. Take your time and build a solid foundation.` },
    { type: 'code', language: 'text', code: `// Example: ${lessonTitle}\n// Replace this with your own practice\nconsole.log("Learning ${lessonTitle}...");` },
    { type: 'quiz', question: `What is the main goal of learning ${lessonTitle} in ${courseDef.title}?`, options: ['To learn the fundamentals', 'To skip the basics', 'To memorize everything', 'To avoid practice'], answer: 0, explanation: `The goal is to build a solid foundation in ${lessonTitle} that you can build on.` },
    { type: 'h3', text: 'Apply it' },
    { type: 'p', text: `Try applying ${lessonTitle} to a small project this week. Reflect on what worked and what needs more practice.` }
  ];
}

function generateCourseLessons(courseDef) {
  const modules = [];
  for (let m = 0; m < 5; m++) {
    const moduleLessons = [];
    for (let l = 0; l < 3; l++) {
      const lessonId = `${courseDef.id}-m${m + 1}l${l + 1}`;
      const lessonNum = m * 3 + l + 1;
      moduleLessons.push({
        id: lessonId,
        title: `${getLessonTopics(courseDef.topicSlug)[m][l]}: ${courseDef.title} - Lesson ${lessonNum}`,
        minutes: 12 + Math.floor(Math.random() * 18),
        content: generateLessonContent(courseDef, m, l, lessonNum)
      });
    }
    modules.push({
      id: `m${m + 1}`,
      title: `Module ${m + 1}: ${getModuleTitle(m)}`,
      summary: `Learn the essentials of module ${m + 1} for ${courseDef.title}.`,
      lessons: moduleLessons
    });
  }
  return modules;
}

function getModuleTitle(moduleIdx) {
  const titles = ['Foundations', 'Core Skills', 'Practice', 'Advanced Techniques', 'Mastery'];
  return titles[moduleIdx];
}

function generateFinalAssessment(courseDef) {
  return {
    title: `${courseDef.badgeName} Assessment`,
    intro: `Answer all 8 questions. Score 80% or higher to earn the ${courseDef.badgeName} badge and certificate. You can retake the assessment if needed.`,
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

function generateCourse(courseDef) {
  return {
    id: courseDef.id,
    title: courseDef.title,
    topic: courseDef.topic,
    topicSlug: courseDef.topicSlug,
    level: courseDef.level,
    duration: courseDef.duration,
    description: courseDef.description,
    icon: courseDef.icon,
    color: courseDef.color,
    accent: '#F6F2EA',
    badge: {
      name: courseDef.badgeName,
      icon: courseDef.badgeIcon,
      description: `Awarded for completing ${courseDef.title}.`
    },
    skills: courseDef.skills,
    path: `courses/${courseDef.topicSlug}/${courseDef.id}/course.json`,
    featured: false,
    modules: generateCourseLessons(courseDef),
    finalAssessment: generateFinalAssessment(courseDef)
  };
}

const ALL_COURSES = [
  // Technology (4 courses)
  { id: 'microcontrollers-101', title: 'Microcontrollers 101', topic: 'Technology', topicSlug: 'technology', level: 'Beginner', duration: '5h 10m', icon: 'chip', color: '#FF7A59', badgeName: 'Circuit Starter', badgeIcon: 'bolt', description: 'Build real hardware projects with Arduino-compatible boards. Learn to read sensors, control LEDs, and debug electronic circuits from the ground up.', skills: ['Arduino programming', 'Circuit design', 'Sensor integration', 'Debugging hardware'] },
  { id: 'python-foundations', title: 'Python Foundations', topic: 'Technology', topicSlug: 'technology', level: 'Beginner', duration: '5h 10m', icon: 'code', color: '#4E56D8', badgeName: 'Python Pioneer', badgeIcon: 'code', description: 'Learn programming by writing small, useful programs. Covers variables, logic, loops, functions, files, error handling, and a complete command-line project.', skills: ['Python syntax', 'Data structures', 'File handling', 'Error handling'] },
  { id: 'web-design-foundations', title: 'Web Design Foundations', topic: 'Technology', topicSlug: 'technology', level: 'Beginner', duration: '5h 05m', icon: 'layout', color: '#27958E', badgeName: 'Web Weaver', badgeIcon: 'layout', description: 'Build and publish your first responsive website with semantic HTML and modern CSS. Learn layout, typography, color, accessibility, and static hosting.', skills: ['HTML semantics', 'CSS layout', 'Responsive design', 'Accessibility'] },
  { id: 'cybersecurity-essentials', title: 'Cybersecurity Essentials', topic: 'Technology', topicSlug: 'technology', level: 'Intermediate', duration: '4h 30m', icon: 'shield', color: '#4E56D8', badgeName: 'Cyber Guardian', badgeIcon: 'shield', description: 'Learn cybersecurity fundamentals including network security, encryption, threat detection, and incident response.', skills: ['Network security', 'Encryption', 'Threat detection', 'Incident response'] },

  // Productivity (4 courses)
  { id: 'excel-essentials', title: 'Excel Essentials', topic: 'Productivity', topicSlug: 'productivity', level: 'Beginner', duration: '5h 00m', icon: 'grid', color: '#2E9B62', badgeName: 'Spreadsheet Navigator', badgeIcon: 'table', description: 'Go from blank grid to confident spreadsheet. Master formulas, tables, charts, and PivotTables by building a budget tracker you can actually use.', skills: ['Formulas', 'PivotTables', 'Data validation', 'Charts'] },
  { id: 'powerpoint-storytelling', title: 'PowerPoint Storytelling', topic: 'Productivity', topicSlug: 'productivity', level: 'Beginner', duration: '4h 45m', icon: 'presentation', color: '#F2A33B', badgeName: 'Slide Storyteller', badgeIcon: 'presentation', description: 'Design slides that support your message instead of competing with it. Learn structure, visual hierarchy, charts, motion, and confident delivery.', skills: ['Story structure', 'Visual hierarchy', 'Data visuals', 'Delivery'] },
  { id: 'word-professional-documents', title: 'Word Professional Documents', topic: 'Productivity', topicSlug: 'productivity', level: 'Beginner', duration: '4h 45m', icon: 'document', color: '#3F72C8', badgeName: 'Document Architect', badgeIcon: 'document', description: 'Create reports, proposals, and templates that look intentional. Use styles, sections, tables, references, and review tools like a professional.', skills: ['Styles', 'Page layout', 'Tables', 'Track changes'] },
  { id: 'project-planning', title: 'Project Planning', topic: 'Productivity', topicSlug: 'productivity', level: 'Intermediate', duration: '3h 00m', icon: 'mic', color: '#2E9B62', badgeName: 'Achiever', badgeIcon: 'award', description: 'Learn to plan projects effectively with work breakdown structures, realistic timelines, and resource management.', skills: ['Work breakdown', 'Timeline estimation', 'Resource allocation', 'Risk management'] },

  // Communication (3 courses)
  { id: 'public-speaking', title: 'Public Speaking with Confidence', topic: 'Communication', topicSlug: 'communication', level: 'Beginner', duration: '2h 40m', icon: 'mic', color: '#D94F7A', badgeName: 'Confident Voice', badgeIcon: 'mic', description: 'Prepare and deliver a talk that people remember. Practice structure, voice, body language, nerves, Q&A, and a complete five-minute capstone presentation.', skills: ['Talk structure', 'Voice', 'Body language', 'Q&A'] },
  { id: 'business-writing', title: 'Business Writing', topic: 'Communication', topicSlug: 'communication', level: 'Intermediate', duration: '3h 00m', icon: 'document', color: '#D94F7A', badgeName: 'Business Writer', badgeIcon: 'document', description: 'Learn to write clear, professional business documents including emails, memos, reports, and proposals.', skills: ['Business writing', 'Email etiquette', 'Report writing', 'Proposal writing'] },
  { id: 'negotiation-skills', title: 'Negotiation Skills', topic: 'Communication', topicSlug: 'communication', level: 'Intermediate', duration: '3h 30m', icon: 'wand', color: '#D94F7A', badgeName: 'Negotiator', badgeIcon: 'wand', description: 'Learn negotiation fundamentals including BATNA, value creation, tactical communication, and closing techniques.', skills: ['Negotiation tactics', 'BATNA', 'Value creation', 'Closing deals'] },

  // Design (4 courses)
  { id: 'typography-basics', title: 'Typography Basics', topic: 'Design', topicSlug: 'design', level: 'Intermediate', duration: '3h 00m', icon: 'document', color: '#8B5CF6', badgeName: 'Typography Master', badgeIcon: 'document', description: 'Learn typography fundamentals including type classification, font pairing, visual hierarchy, and readability principles.', skills: ['Type classification', 'Font pairing', 'Hierarchy', 'Readability'] },
  { id: 'user-experience-intro', title: 'User Experience Intro', topic: 'Design', topicSlug: 'design', level: 'Beginner', duration: '3h 00m', icon: 'table', color: '#8B5CF6', badgeName: 'UX Pioneer', badgeIcon: 'table', description: 'Introduction to user experience design including user research, wireframing, user testing, and information architecture.', skills: ['User research', 'Wireframing', 'User testing', 'Information architecture'] },
  { id: 'logo-design', title: 'Logo Design', topic: 'Design', topicSlug: 'design', level: 'Advanced', duration: '3h 00m', icon: 'medal', color: '#8B5CF6', badgeName: 'Logo Master', badgeIcon: 'award', description: 'Learn logo design principles including brand identity, vector graphics, and typography for memorable logos.', skills: ['Logo design', 'Brand identity', 'Vector graphics', 'Typography'] },
  { id: 'color-theory', title: 'Color Theory', topic: 'Design', topicSlug: 'design', level: 'Beginner', duration: '2h 30m', icon: 'palette', color: '#8B5CF6', badgeName: 'Color Expert', badgeIcon: 'palette', description: 'Learn color theory fundamentals including color psychology, harmonies, contrast, and accessibility.', skills: ['Color theory', 'Color psychology', 'Color harmonies', 'Color contrast'] },

  // Business (4 courses)
  { id: 'entrepreneurship-101', title: 'Entrepreneurship 101', topic: 'Business', topicSlug: 'business', level: 'Beginner', duration: '2h 00m', icon: 'document', color: '#F2A33B', badgeName: 'Entrepreneur', badgeIcon: 'document', description: 'Introduction to entrepreneurship with idea validation, lean startup methodology, MVP development, and customer discovery.', skills: ['Idea validation', 'Lean startup', 'MVP', 'Customer discovery'] },
  { id: 'marketing-fundamentals', title: 'Marketing Fundamentals', topic: 'Business', topicSlug: 'business', level: 'Beginner', duration: '4h 00m', icon: 'chip', color: '#F2A33B', badgeName: 'Marketer', badgeIcon: 'chip', description: 'Learn marketing fundamentals including the marketing mix, customer segmentation, positioning, and campaign management.', skills: ['Marketing mix', 'Customer segmentation', 'Positioning', 'Campaigns'] },
  { id: 'financial-literacy', title: 'Financial Literacy', topic: 'Business', topicSlug: 'business', level: 'Advanced', duration: '2h 00m', icon: 'award', color: '#F2A33B', badgeName: 'Financial Literate', badgeIcon: 'award', description: 'Advanced financial literacy with personal finance, investment strategies, risk management, and wealth building techniques.', skills: ['Personal finance', 'Investment strategies', 'Risk management', 'Wealth building'] },
  { id: 'business-law-basics', title: 'Business Law Basics', topic: 'Business', topicSlug: 'business', level: 'Intermediate', duration: '2h 00m', icon: 'layout', color: '#F2A33B', badgeName: 'Legal Aware', badgeIcon: 'layout', description: 'Understand business law fundamentals including contracts, employment law, intellectual property, and business formation.', skills: ['Contracts', 'Employment law', 'Intellectual property', 'Business formation'] },

  // Data & Analytics (3 courses)
  { id: 'data-visualization', title: 'Data Visualization', topic: 'Data & Analytics', topicSlug: 'data-analytics', level: 'Beginner', duration: '3h 00m', icon: 'table', color: '#27958E', badgeName: 'Data Storyteller', badgeIcon: 'target', description: 'Beginner data visualization with bar charts, line charts, scatter plots, and telling stories with data.', skills: ['Bar charts', 'Line charts', 'Scatter plots', 'Data stories'] },
  { id: 'statistics-intro', title: 'Statistics Intro', topic: 'Data & Analytics', topicSlug: 'data-analytics', level: 'Intermediate', duration: '4h 00m', icon: 'target', color: '#27958E', badgeName: 'Statistician', badgeIcon: 'spark', description: 'Introduction to statistics including descriptive statistics, probability, distributions, and statistical inference.', skills: ['Descriptive statistics', 'Probability', 'Distributions', 'Inference'] },
  { id: 'sql-foundations', title: 'SQL Foundations', topic: 'Data & Analytics', topicSlug: 'data-analytics', level: 'Beginner', duration: '3h 00m', icon: 'grid', color: '#27958E', badgeName: 'SQL Query Builder', badgeIcon: 'grid', description: 'Learn to query databases with SQL including SELECT statements, joins, aggregations, and subqueries.', skills: ['SQL queries', 'Joins', 'Aggregations', 'Subqueries'] },

  // Creative Arts (3 courses)
  { id: 'creative-writing', title: 'Creative Writing', topic: 'Creative Arts', topicSlug: 'creative-arts', level: 'Beginner', duration: '2h 00m', icon: 'brain', color: '#FF7A59', badgeName: 'Creative Writer', badgeIcon: 'target', description: 'Learn creative writing fundamentals including story structure, character development, dialogue writing, and editing.', skills: ['Story structure', 'Character development', 'Dialogue', 'Editing'] },
  { id: 'digital-photography', title: 'Digital Photography', topic: 'Creative Arts', topicSlug: 'creative-arts', level: 'Intermediate', duration: '4h 00m', icon: 'bolt', color: '#FF7A59', badgeName: 'Photographer', badgeIcon: 'award', description: 'Learn photography fundamentals including camera settings, composition, lighting, and photo editing.', skills: ['Camera settings', 'Composition', 'Lighting', 'Photo editing'] },
  { id: 'video-editing-basics', title: 'Video Editing Basics', topic: 'Creative Arts', topicSlug: 'creative-arts', level: 'Beginner', duration: '4h 00m', icon: 'book', color: '#FF7A59', badgeName: 'Video Editor', badgeIcon: 'book', description: 'Learn video editing fundamentals including cutting, transitions, color grading, audio mixing, and export.', skills: ['Video editing', 'Transitions', 'Color grading', 'Audio mixing'] },
  { id: 'graphic-design-principles', title: 'Graphic Design Principles', topic: 'Creative Arts', topicSlug: 'creative-arts', level: 'Beginner', duration: '3h 00m', icon: 'brain', color: '#FF7A59', badgeName: 'Graphic Designer', badgeIcon: 'spark', description: 'Learn graphic design fundamentals including layout, typography, color theory, and visual hierarchy.', skills: ['Layout design', 'Typography', 'Color theory', 'Visual hierarchy'] }
];

function main() {
  const catalog = {
    version: 3,
    updated: new Date().toISOString().slice(0, 10),
    tagline: 'Practical skills. Shareable proof.',
    courses: []
  };
  
  for (const def of ALL_COURSES) {
    const dir = path.join(COURSES_DIR, def.topicSlug, def.id);
    fs.mkdirSync(dir, { recursive: true });
    
    const fullCourse = generateCourse(def);
    fs.writeFileSync(path.join(dir, 'course.json'), JSON.stringify(fullCourse, null, 2) + '\n');
    
    catalog.courses.push({
      id: def.id,
      title: def.title,
      topic: def.topic,
      topicSlug: def.topicSlug,
      level: def.level,
      duration: def.duration,
      description: def.description,
      icon: def.icon,
      color: def.color,
      accent: '#F6F2EA',
      badge: { name: def.badgeName, icon: def.badgeIcon, description: `Awarded for completing ${def.title}.` },
      skills: def.skills,
      path: `courses/${def.topicSlug}/${def.id}/course.json`,
      featured: false
    });
  }
  
  fs.writeFileSync(path.join(ROOT, 'courses', 'catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
  console.log(`Generated ${catalog.courses.length} courses total`);
}

main();
