const fs = require('fs');
const path = require('path');

const ROOT = 'C:/Users/Admin/skillshop';
const BASE = 'https://skillshop.onrender.com';

const pages = [
  { file: 'index.html', title: 'Skillshop — Learn a skill. Prove it.', desc: 'Practical online courses in technology, productivity, design, business, data, and creative arts. Learn at your own pace, earn virtual badges, and print a certificate when you finish.', type: 'website' },
  { file: 'courses.html', title: 'Explore skills · Skillshop', desc: 'Browse 58 detailed courses across technology, productivity, communication, design, business, data, and creative arts. Every course includes guided lessons, a final assessment, virtual badges, and a printable certificate.', type: 'website' },
  { file: 'course.html', title: 'Course · Skillshop', desc: 'Learn a practical skill with guided lessons, a final assessment, a virtual badge, and a printable certificate.', type: 'website' },
  { file: 'dashboard.html', title: 'My learning · Skillshop', desc: 'Track your course progress, collect virtual badges, and manage your certificates in one dashboard.', type: 'website' },
  { file: 'account.html', title: 'Your profile · Skillshop', desc: 'Create or manage your Skillshop learner profile. Save progress, earn badges, and put your name on certificates.', type: 'website' },
  { file: 'login.html', title: 'Sign in · Skillshop', desc: 'Sign in to Skillshop with email or Google to save your progress and earn certificates.', type: 'website' },
  { file: 'certificate.html', title: 'Certificate · Skillshop', desc: 'View and print your fixed-template Skillshop certificate of completion.', type: 'website' }
];

const OG_IMAGE = '/assets/favicon.svg';

function inject(file, { title, desc, type }) {
  const p = path.join(ROOT, file);
  let html = fs.readFileSync(p, 'utf8');

  const ogTitle = `<meta property="og:title" content="${escape(title)}">`;
  const ogDesc = `<meta property="og:description" content="${escape(desc)}">`;
  const ogType = `<meta property="og:type" content="${type}">`;
  const ogUrl = `<meta property="og:url" content="${BASE}/${file}">`;
  const ogImage = `<meta property="og:image" content="${BASE}${OG_IMAGE}">`;
  const twCard = `<meta name="twitter:card" content="summary_large_image">`;
  const twTitle = `<meta name="twitter:title" content="${escape(title)}">`;
  const twDesc = `<meta name="twitter:description" content="${escape(desc)}">`;
  const canonical = `<link rel="canonical" href="${BASE}/${file}">`;

  const schema = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Skillshop",
  "url": "${BASE}",
  "logo": "${BASE}${OG_IMAGE}"
}
</script>`;

  const seoBlock = `${ogTitle}\n${ogDesc}\n${ogType}\n${ogUrl}\n${ogImage}\n${twCard}\n${twTitle}\n${twDesc}\n${canonical}\n${schema}`;

  // Insert after <title>...</title>
  html = html.replace(/<title>[^<]*<\/title>/, (m) => m + '\n' + seoBlock);

  // Ensure description meta exists or update it
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escape(desc)}">`);

  fs.writeFileSync(p, html);
  console.log('SEO added:', file);
}

function escape(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;'); }

for (const pg of pages) inject(pg.file, pg);
console.log('Done. SEO meta tags added to all pages.');
