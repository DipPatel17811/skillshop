const fs = require('fs');
const path = require('path');

const ROOT = 'C:/Users/Admin/skillshop';
const CATALOG_PATH = path.join(ROOT, 'courses', 'catalog.json');

const TOPICS = [
  { slug: 'technology', name: 'Technology', color: '#4E56D8' },
  { slug: 'productivity', name: 'Productivity', color: '#2E9B62' },
  { slug: 'communication', name: 'Communication', color: '#D94F7A' },
  { slug: 'design', name: 'Design', color: '#8B5CF6' },
  { slug: 'business', name: 'Business', color: '#F2A33B' },
  { slug: 'data', name: 'Data & Analytics', color: '#27958E' },
  { slug: 'creative', name: 'Creative Arts', color: '#FF7A59' }
];

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const ICONS = ['book', 'chip', 'code', 'layout', 'grid', 'presentation', 'document', 'wand', 'mic', 'brain', 'palette', 'layers', 'target', 'compass', 'shield', 'medal', 'award', 'bolt', 'spark', 'table'];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function uid(prefix) { return prefix + '-' + Math.random().toString(36).slice(2, 8); }

function lessonBlocks(title, topic) {
  const blocks = [
    { type: 'lead', text: `In this lesson you'll learn the essentials of ${title.toLowerCase()} and how to apply ${topic.toLowerCase()} in real work.` },
    { type: 'h', text: `Core concept: ${title}` },
    { type: 'p', text: `Every skilled practitioner starts by understanding the fundamentals of ${title}. This lesson walks you through the key ideas, common mistakes, and a practical example you can try today.` },
    { type: 'list', style: 'bullet', items: [
      `The definition and purpose of ${title}`,
      `When to use ${title} versus alternatives`,
      `A step-by-step walkthrough`,
      `Common pitfalls and how to avoid them`
    ]},
    { type: 'callout', tone: 'tip', title: 'Remember', text: `Practice ${title} with real examples before moving to the next lesson.` },
    { type: 'code', language: 'text', code: `// Example: ${title}\n// Replace this with your own practice\nconsole.log("Learning ${title}");` },
    { type: 'quiz', question: `What is the main goal of ${title}?`, options: ['To learn the fundamentals', 'To skip the basics', 'To memorize everything', 'To avoid practice'], answer: 0, explanation: `The goal of ${title} is to build a solid foundation you can build on.` },
    { type: 'h3', text: 'Apply it' },
    { type: 'p', text: `Try applying ${title} to a small project this week. Reflect on what worked and what needs more practice.` }
  ];
  return blocks;
}

function makeCourse(index) {
  const topic = rand(TOPICS);
  const level = rand(LEVELS);
  const id = `course-${String(index + 1).padStart(3, '0')}`;
  const titleMap = {
    technology: ['Python for Data Analysis', 'React Basics', 'SQL Fundamentals', 'Cybersecurity Essentials', 'Cloud Computing 101', 'Mobile App Development', 'DevOps Fundamentals', 'AI Prompt Engineering', 'Network Basics', 'Blockchain Intro'],
    productivity: ['Advanced Excel Modeling', 'PowerPoint Design Systems', 'Word Automation', 'Google Workspace Mastery', 'Notion for Productivity', 'Project Planning', 'Time Management', 'Meeting Facilitation', 'Document Templates', 'Workflow Automation'],
    communication: ['Business Writing', 'Interpersonal Communication', 'Negotiation Skills', 'Conflict Resolution', 'Presentation Skills', 'Storytelling for Leaders', 'Cross-Cultural Communication', 'Active Listening', 'Feedback Fundamentals', 'Executive Communication'],
    design: ['Visual Design Principles', 'Color Theory', 'Typography Basics', 'User Experience Intro', 'Figma Fundamentals', 'Logo Design', 'Brand Identity', 'Layout Design', 'Icon Design', 'Motion Graphics Basics'],
    business: ['Entrepreneurship 101', 'Financial Literacy', 'Marketing Fundamentals', 'Sales Basics', 'Project Management', 'Customer Service', 'Operations Management', 'Strategic Planning', 'Supply Chain Intro', 'Business Law Basics'],
    data: ['Data Visualization', 'Statistics Intro', 'Tableau Basics', 'Power BI Fundamentals', 'Data Cleaning', 'A/B Testing', 'KPI Tracking', 'Data Storytelling', 'Excel for Analytics', 'Google Analytics'],
    creative: ['Photography Basics', 'Video Editing Intro', 'Illustration Fundamentals', 'Music Production Basics', 'Creative Writing', 'Podcasting 101', 'Animation Basics', 'Hand Lettering', 'Photo Editing', 'Creative Portfolio']
  };
  const titles = titleMap[topic.slug] || titleMap.technology;
  const title = titles[index % titles.length] || `${topic.name} Course ${index + 1}`;
  const duration = `${Math.floor(2 + Math.random() * 4)}h ${Math.floor(0, 59)}m`.replace('${Math.floor(0, 59)}', String(Math.floor(Math.random() * 60)).padStart(2, '0'));

  const modules = [];
  for (let m = 0; m < 5; m++) {
    const lessons = [];
    for (let l = 0; l < 3; l++) {
      const lid = `${id}-m${m + 1}l${l + 1}`;
      lessons.push({
        id: lid,
        title: `${['Introduction', 'Core Concepts', 'Hands-on Practice', 'Advanced Tips', 'Review'][l % 5]}: ${title} Part ${l + 1}`,
        minutes: 12 + Math.floor(Math.random() * 18),
        content: lessonBlocks(`${title} Part ${l + 1}`, topic.name)
      });
    }
    modules.push({ id: `m${m + 1}`, title: `Module ${m + 1}: ${rand(['Foundations', 'Practice', 'Mastery', 'Application', 'Review'])}`, summary: `Learn the essentials of module ${m + 1}.`, lessons });
  }

  const badgeName = rand(['Badge Earner', 'Skill Builder', 'Topic Master', 'Practitioner', 'Achiever']);
  const skills = [topic.name, title.split(' ')[0], 'Practice', 'Application'];

  return {
    id,
    title,
    topic: topic.name,
    topicSlug: topic.slug,
    level,
    duration,
    description: `A practical, ${level.toLowerCase()} course on ${title}. Learn by doing with guided lessons, exercises, and a final assessment.`,
    icon: rand(ICONS),
    color: topic.color,
    accent: '#F6F2EA',
    badge: { name: badgeName, icon: rand(['award', 'spark', 'medal', 'target']), description: `Awarded for completing ${title}.` },
    skills,
    outcomes: [
      `Explain the key concepts of ${title}`,
      `Apply ${title} to real-world scenarios`,
      `Complete a practical project using ${title}`,
      `Assess your own work and improve`
    ],
    prerequisites: ['No prior experience required', 'A computer and internet access', 'Time to practice each week'],
    tools: ['A web browser', 'A text editor or relevant software', 'A notebook for practice'],
    modules,
    finalAssessment: {
      title: `${badgeName} assessment`,
      intro: `Answer all 8 questions. You need 80% to pass and unlock the ${badgeName} badge and certificate.`,
      passScore: 80,
      questions: [
        { question: `What is the primary focus of ${title}?`, options: ['Theory only', 'Practical application', 'History', 'Unrelated topics'], answer: 1, explanation: `${title} focuses on practical, usable skills.` },
        { question: `Which level is this course designed for?`, options: ['Beginner', 'Expert only', 'Level 99', 'No level'], answer: 0, explanation: `This course is designed for ${level.toLowerCase()} learners.` },
        { question: `How many modules does this course have?`, options: ['1', '3', '5', '10'], answer: 2, explanation: 'The course is organized into 5 modules.' },
        { question: `What do you earn on completion?`, options: ['Nothing', 'A badge and certificate', 'A trophy', 'An email'], answer: 1, explanation: 'Completing the course and assessment earns a badge and certificate.' },
        { question: `Can you retake the final assessment?`, options: ['No', 'Yes, unlimited', 'Once', 'Only with payment'], answer: 1, explanation: 'You can retake the assessment if you need to.' },
        { question: `Is practice recommended?`, options: ['Yes', 'No', 'Maybe', 'Only for experts'], answer: 0, explanation: 'Practice is essential to mastering any skill.' },
        { question: `What is included in each lesson?`, options: ['Only videos', 'Content, examples, and a quiz', 'Only quizzes', 'Only reading'], answer: 1, explanation: 'Lessons include content, examples, and knowledge checks.' },
        { question: `Who can take this course?`, options: ['Only experts', 'Anyone interested', 'Only paid members', 'Only students'], answer: 1, explanation: 'Anyone interested in the topic can take this course.' }
      ]
    }
  };
}

function main() {
  const coursesDir = path.join(ROOT, 'courses');
  TOPICS.forEach(t => {
    fs.mkdirSync(path.join(coursesDir, t.slug), { recursive: true });
  });

  // Load existing catalog so we keep the 8 hand-crafted courses
  let existing = { courses: [] };
  try {
    existing = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  } catch (e) {}

  const catalog = {
    version: 2,
    updated: new Date().toISOString().slice(0, 10),
    tagline: 'Practical skills. Shareable proof.',
    courses: [...existing.courses]
  };

  const existingIds = new Set(catalog.courses.map(c => c.id));

  for (let i = 0; i < 50; i++) {
    const course = makeCourse(i);
    if (existingIds.has(course.id)) continue;
    const dir = path.join(coursesDir, course.topicSlug, course.id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'course.json'), JSON.stringify(course, null, 2) + '\n');
    catalog.courses.push({
      id: course.id,
      title: course.title,
      topic: course.topic,
      topicSlug: course.topicSlug,
      level: course.level,
      duration: course.duration,
      description: course.description,
      icon: course.icon,
      color: course.color,
      accent: course.accent,
      badge: course.badge,
      skills: course.skills,
      path: `courses/${course.topicSlug}/${course.id}/course.json`,
      featured: false
    });
  }

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2) + '\n');
  console.log(`Generated ${50} new courses. Total in catalog: ${catalog.courses.length}`);
}

main();
