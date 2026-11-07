const fs = require('fs');
const path = require('path');

const catalog = JSON.parse(fs.readFileSync('courses/catalog.json', 'utf8'));
const json = JSON.stringify(catalog);
// Escape any closing script tags
const safeJson = json.replace(/<\/script>/gi, '<\\/script>');
const scriptTag = '<script id="embedded-catalog" type="application/json">' + safeJson + '</script>\n';

// Add to index.html
let index = fs.readFileSync('index.html', 'utf8');
index = index.replace('</head>', scriptTag + '</head>');
fs.writeFileSync('index.html', index);

// Add to courses.html  
let courses = fs.readFileSync('courses.html', 'utf8');
courses = courses.replace('</head>', scriptTag + '</head>');
fs.writeFileSync('courses.html', courses);

console.log('Embedded catalog into index.html and courses.html');
console.log('Catalog entries:', catalog.courses.length);
console.log('Script tag length:', scriptTag.length, 'chars');
