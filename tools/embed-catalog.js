const fs = require('fs');
const path = require('path');

const catalog = JSON.parse(fs.readFileSync('courses/catalog.json', 'utf8'));
const json = JSON.stringify(catalog);
// Escape any closing script tags
const safeJson = json.replace(/<\/script>/gi, '<\\/script>');
const scriptTag = '<script id="embedded-catalog" type="application/json">' + safeJson + '</script>\n';

// Add to index.html
let index = fs.readFileSync('index.html', 'utf8');
index = index.replace(/<script id="embedded-catalog"[^>]*>[\s\S]*?<\/script>/g, scriptTag);
fs.writeFileSync('index.html', index);

// Add to courses.html
let courses = fs.readFileSync('courses.html', 'utf8');
courses = courses.replace(/<script id="embedded-catalog"[^>]*>[\s\S]*?<\/script>/g, scriptTag);
fs.writeFileSync('courses.html', courses);

console.log('Embedded catalog updated in index.html and courses.html');
console.log('Catalog entries:', catalog.courses.length);
