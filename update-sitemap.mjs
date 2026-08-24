import fs from 'fs';
import path from 'path';

const dir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const files = ['index.html', 'robots.txt', 'sitemap.xml'];

const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const tools = [...html.matchAll(/<section id="([\w-]+)" class="view">/g)].map(m => m[1]).filter(id => id !== 'home');

console.log(`Found ${tools.length} tools: ${tools.join(', ')}`);

if (process.argv[2]) {
  const domain = process.argv[2].replace(/\/+$/, '');
  if (!/^https:\/\/[\w.-]+$/.test(domain)) {
    console.error('Domain must look like: https://your-site.netlify.app');
    process.exit(1);
  }
  for (const f of files) {
    const p = path.join(dir, f);
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace(/https:\/\/[a-z0-9-]*\.netlify\.app/g, domain);
    fs.writeFileSync(p, c);
    console.log(`Updated domain in ${f}`);
  }
}

const today = new Date().toISOString().slice(0, 10);
const sm = path.join(dir, 'sitemap.xml');
let s = fs.readFileSync(sm, 'utf8');
s = s.replace(/<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${today}</lastmod>`);
fs.writeFileSync(sm, s);
console.log(`sitemap.xml lastmod set to ${today}`);
console.log('Done. Redeploy the folder to publish changes.');
