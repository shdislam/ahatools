import fs from 'fs';
import path from 'path';

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const DOMAIN_DEFAULT = 'https://shdislam.github.io/ahatools';

const toolDirs = fs.readdirSync(root, { withFileTypes: true })
  .filter(d => d.isDirectory() && !['assets', 'tests', 'node_modules', '.git'].includes(d.name) && fs.existsSync(path.join(root, d.name, 'index.html')))
  .map(d => d.name);

console.log(`Found ${toolDirs.length} tool pages: ${toolDirs.join(', ')}`);

const domain = process.argv[2];
const files = ['index.html', 'robots.txt', 'sitemap.xml', ...toolDirs.map(d => path.join(d, 'index.html'))];

if (domain) {
  const clean = domain.replace(/\/+$/, '');
  if (!/^https:\/\/[\w.-]+$/.test(clean)) {
    console.error('Domain must look like: https://your-site.pages.dev');
    process.exit(1);
  }
  for (const f of files) {
    const p = path.join(root, f);
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace(/https:\/\/[a-z0-9-]*\.pages\.dev/g, clean);
    fs.writeFileSync(p, c);
  }
  console.log(`Domain set to ${clean} in ${files.length} files`);
}

const today = new Date().toISOString().slice(0, 10);
const sm = path.join(root, 'sitemap.xml');
let s = fs.readFileSync(sm, 'utf8');
s = s.replace(/<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${today}</lastmod>`);
fs.writeFileSync(sm, s);
console.log(`sitemap.xml lastmod refreshed to ${today}`);
console.log('Done. Commit & push to redeploy.');
