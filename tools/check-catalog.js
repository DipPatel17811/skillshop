const fs = require('fs');
const html = fs.readFileSync('courses.html', 'utf8');
const m = html.match(/<script id="embedded-catalog"[^>]*>([\s\S]*?)<\/script>/);
if (m) {
  const data = JSON.parse(m[1]);
  console.log('Courses in courses.html:', data.courses.length);
  data.courses.forEach(c => console.log(' -', c.title));
} else {
  console.log('No embedded catalog found');
}
