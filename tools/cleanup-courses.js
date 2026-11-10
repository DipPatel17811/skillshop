const fs = require('fs');
const path = require('path');

const ROOT = 'C:/Users/Admin/skillshop';
const CATALOG_PATH = path.join(ROOT, 'courses', 'catalog.json');
const COURSES_DIR = path.join(ROOT, 'courses');

// Keep only these 6 courses
const KEEP_IDS = new Set([
  'microcontrollers-101',
  'excel-essentials',
  'powerpoint-storytelling',
  'word-professional-documents',
  'powerpoint-morph',
  'python-foundations'
]);

// Read existing catalog
let catalog = { courses: [] };
try {
  catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
} catch (e) {
  console.log('No existing catalog');
}

// Filter catalog to keep only the 6 courses
catalog.courses = catalog.courses.filter(c => KEEP_IDS.has(c.id));

// Write updated catalog
fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2) + '\n');

// Delete all course folders except the 6 kept ones
function deleteCourseFolders(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      // Check if this is a course directory (has course.json)
      const courseJson = path.join(fullPath, 'course.json');
      if (fs.existsSync(courseJson)) {
        const courseData = JSON.parse(fs.readFileSync(courseJson, 'utf8'));
        if (!KEEP_IDS.has(courseData.id)) {
          fs.rmSync(fullPath, { recursive: true, force: true });
          console.log('Deleted:', fullPath);
        } else {
          console.log('Kept:', fullPath);
        }
      } else {
        // It's a topic folder, recurse
        deleteCourseFolders(fullPath);
      }
    }
  }
}

deleteCourseFolders(COURSES_DIR);

console.log('\nDone! Kept courses:');
catalog.courses.forEach(c => console.log(`  - ${c.id}: ${c.title}`));
console.log(`\nTotal courses: ${catalog.courses.length}`);
