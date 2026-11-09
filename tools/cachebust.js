const fs = require('fs');
const v = '?v=' + Date.now();
const files = ['index.html', 'courses.html', 'course.html', 'dashboard.html', 'account.html', 'login.html', 'certificate.html'];
for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/src="assets\/js\/([^"?]+\.js)/g, (m, p) => m.replace(p, p + v));
  fs.writeFileSync(f, c);
  console.log('Updated ' + f);
}