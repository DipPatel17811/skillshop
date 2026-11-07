const fs = require('fs');
const path = require('path');

const ROOT = 'C:/Users/Admin/skillshop';
const CATALOG = JSON.parse(fs.readFileSync(path.join(ROOT, 'courses', 'catalog.json'), 'utf8'));

const extraQuiz = [
  { question: "Which of the following is a best practice covered in this course?", options: ["Practice regularly", "Skip the exercises", "Memorize without doing", "Guess the answers"], answer: 0, explanation: "Regular practice reinforces learning." },
  { question: "How should you approach a new skill?", options: ["Start with the fundamentals", "Skip to advanced topics", "Avoid practice", "Only read theory"], answer: 0, explanation: "Start with fundamentals and build up." },
  { question: "What helps you retain what you learn?", options: ["Hands-on practice", "Passive reading only", "Ignoring mistakes", "Cramming once"], answer: 0, explanation: "Hands-on practice improves retention." },
  { question: "If you get stuck on a lesson, what should you do?", options: ["Review earlier material and try again", "Give up", "Skip the course", "Guess"], answer: 0, explanation: "Reviewing and retrying is part of learning." }
];

for (const entry of CATALOG.courses) {
  const p = path.join(ROOT, entry.path);
  if (!fs.existsSync(p)) continue;
  let c = JSON.parse(fs.readFileSync(p, 'utf8'));
  let changed = false;

  // Add extra quiz questions to final assessment
  if (c.finalAssessment && Array.isArray(c.finalAssessment.questions)) {
    const start = c.finalAssessment.questions.length;
    for (let i = 0; i < extraQuiz.length; i++) {
      c.finalAssessment.questions.push({ ...extraQuiz[i], answer: extraQuiz[i].answer });
    }
    changed = true;
    console.log(`Added ${extraQuiz.length} quiz questions to ${entry.id} (now ${c.finalAssessment.questions.length})`);
  }

  if (changed) {
    fs.writeFileSync(p, JSON.stringify(c, null, 2) + '\n');
  }
}

console.log('Quiz expansion complete.');
