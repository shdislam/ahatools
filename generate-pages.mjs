import fs from 'fs';
import path from 'path';

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const DOMAIN = 'https://ahatools.pages.dev';
const TODAY = new Date().toISOString().slice(0, 10);

const src = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const css = src.match(/<style>([\s\S]*?)<\/style>/)[1].replace(/\s*$/, '\n  .panel h1{font-size:22px;margin-bottom:4px}\n');
let js = src.match(/<script>([\s\S]*?)<\/script>/)[1];
js = js.replace(/if\(location\.protocol[\s\S]*?\n}\n/, '').replace(/\nfunction route\(\)\{[\s\S]*?\n\}\n/, '').replace(/window\.addEventListener\('hashchange',route\);\nroute\(\);\n/, '');

const sections = {};
for (const m of src.matchAll(/<section id="([\w-]+)" class="view">([\s\S]*?)<\/section>/g)) {
  if (m[1] !== 'home') sections[m[1]] = m[2];
}

const TOOLS = [
  { id: 'age-calculator', icon: '🎂', name: 'Age Calculator', card: 'Exact age in years, months & days', title: 'Age Calculator – Exact Age in Years, Months & Days', desc: 'Free online age calculator. Enter your date of birth and get your exact age in years, months and days instantly. Calendar-accurate, no signup.' },
  { id: 'bmi-calculator', icon: '⚖️', name: 'BMI Calculator', card: 'Check if your weight is healthy', title: 'BMI Calculator (Metric kg/cm) – Healthy Weight Range', desc: 'Calculate your Body Mass Index in centimeters and kilograms. See your WHO category and healthy weight range instantly. Free and private.' },
  { id: 'loan-calculator', icon: '🏦', name: 'Loan EMI Calculator', card: 'What any loan really costs monthly', title: 'Loan EMI Calculator – Monthly Payment & Total Interest', desc: 'Calculate your loan EMI before you borrow. Monthly payment, total repayment and total interest for any amount, rate and duration.' },
  { id: 'discount-calculator', icon: '🏷️', name: 'Discount Calculator', card: 'Real price after % off', title: 'Discount Calculator – Final Price After % Off', desc: 'Find the real price after any discount percentage. See exactly how much you save before you pay. Free instant discount calculator.' },
  { id: 'percentage-calculator', icon: '％', name: 'Percentage Calculator', card: 'All 3 percentage problems solved', title: 'Percentage Calculator – X% of Y, What Percent & Change', desc: 'All three percentage calculations solved live: X% of Y, X is what percent of Y, and percent change. No button needed.' },
  { id: 'gpa-calculator', icon: '🎓', name: 'GPA Calculator', card: 'Your semester GPA in seconds', title: 'GPA Calculator (4.0 Scale) – Credit-Weighted GPA', desc: 'Calculate your semester GPA on the 4.00 scale with credit weighting. Add unlimited courses. Standard letter-grade points.' },
  { id: 'word-counter', icon: '📝', name: 'Word Counter', card: 'Words, characters & reading time', title: 'Word Counter – Words, Characters, Sentences & Reading Time', desc: 'Count words, characters (with spaces), sentences and estimated reading time live as you type. Your text never leaves your device.' },
  { id: 'case-converter', icon: '🔤', name: 'Case Converter', card: 'UPPER, lower, Title Case & more', title: 'Case Converter – UPPERCASE, lowercase, Title & Sentence Case', desc: 'Convert text between UPPERCASE, lowercase, Title Case and Sentence case in one click. Copy results straight to clipboard.' },
  { id: 'image-compressor', icon: '🖼️', name: 'Image Compressor', card: 'Shrink photos without uploading them', title: 'Image Compressor – Shrink JPG/PNG Online, 100% Private', desc: 'Compress JPG and PNG images in your browser. Photos never upload to any server. Choose quality, download smaller images instantly.' },
  { id: 'password-generator', icon: '🔐', name: 'Password Generator', card: 'Unhackable passwords, made locally', title: 'Password Generator – Strong Random Passwords Offline', desc: 'Generate cryptographically strong passwords using the Web Crypto API, entirely offline. Choose length and character sets. Nothing is stored.' },
  { id: 'days-between-dates', icon: '📅', name: 'Days Between Dates', card: 'Countdown to any date', title: 'Days Between Dates Calculator – Duration & Countdown', desc: 'Count exact days, weeks and months between any two dates. Leap-year accurate countdowns for exams, deadlines and events.' },
  { id: 'unit-converter', icon: '📏', name: 'Unit Converter', card: 'Length & weight conversions', title: 'Unit Converter – Length & Weight With Exact Factors', desc: 'Convert length and weight units with internationally exact factors: meters, km, miles, inches, kg, pounds, ounces and more.' },
  { id: 'tip-calculator', icon: '🍽️', name: 'Tip Calculator', card: 'Split bills fairly in seconds', title: 'Tip Calculator – Bill Splitting With Tip Per Person', desc: 'Calculate tip and split any restaurant bill between friends in seconds. Quick tip chips for 5%, 10%, 15% and 20%.' }
];

const rel = d => (d === 0 ? '' : '../');
const head = (t, depth, jsonld) => `<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${t ? t.title : 'AhaTools — 13 Free Online Tools: Calculators, Converters & Generators'}</title>
<meta name="description" content="${t ? t.desc : '13 powerful free online tools — age calculator, BMI checker, loan EMI calculator, GPA calculator, word counter, discount calculator, password generator, image compressor and more. No signup, mobile-friendly.'}">
<meta name="author" content="AHA!">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#6c5ce7">
<link rel="canonical" href="${DOMAIN}/${t ? t.id + '/' : ''}">
<meta property="og:title" content="${t ? t.name : 'AhaTools'} — Free Online Tool">
<meta property="og:description" content="${t ? t.desc : 'Free calculators and utilities that work instantly in your browser.'}">
<meta property="og:type" content="website">
<meta property="og:url" content="${DOMAIN}/${t ? t.id + '/' : ''}">
<meta property="og:site_name" content="AhaTools">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${t ? t.name : 'AhaTools'}">
<meta name="twitter:description" content="${t ? t.desc : 'Free calculators and utilities that work instantly in your browser.'}">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>">
<link rel="stylesheet" href="${rel(depth)}assets/style.css">
${jsonld}
</head>`;

const headerBar = depth => `<header>
  <div class="wrap bar">
    <a class="logo" href="${rel(depth)}">Aha<span>Tools</span> ⚡</a>
    <a class="logo" href="https://www.youtube.com/@Shahid-Ul-Islam-z5l" style="font-size:14px;color:var(--muted)">▶ YouTube</a>
  </div>
</header>`;

const footerBar = `<footer>Built with ⚡ by AHA! · <a href="https://www.youtube.com/@Shahid-Ul-Islam-z5l" style="color:var(--brand)">Watch tutorials on YouTube</a></footer>`;

const faqHome = src.match(/<div class="faq">\s*<h2>Questions people ask[\s\S]*?<\/div>/)[0];
const aboutHome = src.match(/<div class="faq">\s*<h2>About AhaTools[\s\S]*?<\/div>\s*(?=<nav)/)[0];

for (const t of TOOLS) {
  let inner = sections[t.id]
    .replace('<button class="back" onclick="location.hash=\'home\'">← All tools</button>', `<a class="back" href="${rel(1)}">← All tools</a>`)
    .replace(/<h2>/, '<h1>')
    .replace(/<\/h2>/, '</h1>');
  const jsonld = `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebApplication","name":"${t.name}","url":"${DOMAIN}/${t.id}/","applicationCategory":"UtilitiesApplication","operatingSystem":"Any","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"description":"${t.desc}"}
</script>`;
  const page = `<!DOCTYPE html>
<html lang="en">
${head(t, 1, jsonld)}
<body>
${headerBar(1)}
<main class="wrap">
<div class="panel">${inner.trim()}</div>
<nav class="map" aria-label="More tools"><h2>More free tools</h2>${TOOLS.filter(x => x.id !== t.id).slice(0, 6).map(x => `<a href="../${x.id}/">${x.icon} ${x.name}</a>`).join('\n')}<a href="../">View all 13 →</a></nav>
</main>
${footerBar}
<script src="../assets/app.js"></script>
<script>if(typeof fillUnits==='function'&&document.getElementById('ucType'))fillUnits();</script>
</body>
</html>`;
  fs.mkdirSync(path.join(root, t.id), { recursive: true });
  fs.writeFileSync(path.join(root, t.id, 'index.html'), page);
}

fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
fs.writeFileSync(path.join(root, 'assets', 'style.css'), css);
fs.writeFileSync(path.join(root, 'assets', 'app.js'), js.trimStart());

const cards = TOOLS.map(t => `    <a class="tool-card" href="${t.id}/"><div class="ico">${t.icon}</div><h3>${t.name}</h3><p>${t.card}</p></a>`).join('\n');
const homeJsonld = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "AhaTools",
  "url": "${DOMAIN}/",
  "description": "13 free online tools: calculators, converters, generators and privacy-first utilities.",
  "hasPart": [${TOOLS.map(t => `{"@type":"WebApplication","name":"${t.name}","url":"${DOMAIN}/${t.id}/"}`).join(',')}]
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {"@type": "Question", "name": "Are these tools really free?", "acceptedAnswer": {"@type": "Answer", "text": "Yes. Every tool on AhaTools is 100% free with no signup required."}},
    {"@type": "Question", "name": "Is my data safe?", "acceptedAnswer": {"@type": "Answer", "text": "Yes. All calculations including image compression and password generation run entirely inside your browser. Nothing is uploaded to any server."}},
    {"@type": "Question", "name": "Do the tools work on mobile?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, AhaTools is designed mobile-first and works on any device."}},
    {"@type": "Question", "name": "Who built AhaTools?", "acceptedAnswer": {"@type": "Answer", "text": "AhaTools is created and maintained by the creator behind the AHA! YouTube channel."}}
  ]
}
</script>`;

const home = `<!DOCTYPE html>
<html lang="en">
${head(null, 0, homeJsonld)}
<body>
${headerBar(0)}
<main class="wrap">

<section class="view active">
  <div class="hero">
    <h1>Free Online Tools That Just Work</h1>
    <p>No signup. No uploads. Just answers — instantly.</p>
  </div>
  <div class="grid">
${cards}
  </div>

  ${faqHome}

  ${aboutHome}

  <nav class="map" aria-label="All tools">
    <h2>All 13 tools</h2>
    ${TOOLS.map(t => `<a href="${t.id}/">${t.name}</a>`).join('\n    ')}
  </nav>
</section>

</main>
${footerBar}
</body>
</html>`;
fs.writeFileSync(path.join(root, 'index.html'), home);

const urls = [{ loc: `${DOMAIN}/`, pr: '1.0' }, ...TOOLS.map(t => ({ loc: `${DOMAIN}/${t.id}/`, pr: '0.8' }))];
fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${u.pr}</priority>\n  </url>`).join('\n')}
</urlset>
`);

fs.writeFileSync(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${DOMAIN}/sitemap.xml\n`);

console.log(`Generated ${TOOLS.length} tool pages + homepage`);
console.log('Assets:', fs.existsSync(path.join(root, 'assets/app.js')) ? 'app.js OK' : 'MISSING', fs.existsSync(path.join(root, 'assets/style.css')) ? 'style.css OK' : 'MISSING');
console.log('app.js size:', (fs.statSync(path.join(root, 'assets/app.js')).size / 1024).toFixed(1), 'KB');
