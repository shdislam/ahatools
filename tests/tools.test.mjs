import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { webcrypto } from 'crypto';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

let pass = 0, fail = 0;
const results = [];
function t(name, cond) {
  cond ? pass++ : fail++;
  results.push(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
}

class El {
  #_text = '';
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.value = ''; this.innerHTML = '';
    this.checked = false; this.files = []; this.href = ''; this.content = '';
    this.className = ''; this.id = ''; this.style = {};
    this.children = []; this.parentNode = null;
    this._classes = new Set();
    this.classList = {
      add: c => this._classes.add(c),
      remove: c => this._classes.delete(c),
      contains: c => this._classes.has(c)
    };
  }
  get textContent() { return this.#_text; }
  set textContent(v) { this.#_text = String(v); }
  addEventListener() {}
  appendChild(c) { this.children.push(c); c.parentNode = this; }
  remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(x => x !== this); }
  click() {}
  cloneNode() {
    const c = new El(this.tagName.toLowerCase());
    c.className = this.className;
    Object.assign(c, { value: this.value, checked: this.checked, textContent: this.textContent });
    this.children.forEach(ch => c.appendChild(ch.cloneNode(true)));
    return c;
  }
  _flat() { return this.children.flatMap(ch => [ch, ...ch._flat()]); }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
  querySelectorAll(sel) { return this._flat().filter(el => el.className.split(/\s+/).includes(sel.slice(1)) && sel.startsWith('.')); }
}

const reg = {};
const el = id => (reg[id] ??= new El('div'));
const VIEW_IDS = ['home','age-calculator','bmi-calculator','loan-calculator','discount-calculator','percentage-calculator','gpa-calculator','word-counter','case-converter','image-compressor','password-generator','days-between-dates','unit-converter','tip-calculator'];
VIEW_IDS.forEach(id => { const v = el(id); v.id = id; v.classList.add('view'); if (id === 'home') v.classList.add('active'); });
el('ucType').value = 'length';

const gpaRows = el('gpaRows');
for (let i = 0; i < 3; i++) {
  const row = new El('div'); row.className = 'row gpaRow';
  const grade = new El('select'); grade.className = 'gpaGrade'; grade.value = '3';
  const credit = new El('input'); credit.className = 'gpaCredit'; credit.value = '3';
  row.appendChild(grade); row.appendChild(credit);
  gpaRows.appendChild(row);
}

const REAL_DATE = Date;
const FIXED = new REAL_DATE('2026-08-24T12:00:00').getTime();
class FakeDate extends REAL_DATE {
  constructor(...a) { a.length ? super(...a) : super(FIXED); }
  static now() { return FIXED; }
}

const hashHandlers = [];
const alerts = [];
const location_ = { protocol: 'file:', origin: '', hash: '' };
let clipboardCalled = false;

const documentMock = {
  getElementById: el,
  createElement: tag => new El(tag),
  querySelectorAll: sel => sel === '.view' ? VIEW_IDS.map(el) : sel === '.gpaRow' ? gpaRows.children : [],
  querySelector: sel => documentMock.querySelectorAll(sel)[0] || null
};

const ctx = {
  document: documentMock,
  location: location_,
  alert: m => alerts.push(String(m)),
  console,
  setTimeout,
  crypto: webcrypto,
  Uint32Array,
  Promise,
  URL: { createObjectURL: () => 'blob:test', revokeObjectURL: () => {} },
  Image: class { set src(v) { this._src = v; } get src() { return this._src; } },
  navigator: { clipboard: { writeText: txt => { clipboardCalled = true; clipLast = txt; return Promise.resolve(); } } },
  scrollTo: () => {},
  addEventListener: (ev, fn) => { if (ev === 'hashchange') hashHandlers.push(fn); }
};
let clipLast = '';
ctx.window = ctx;
vm.createContext(ctx);

const mainScript = html.match(/<script>([\s\S]*?)<\/script>/)[1];
vm.runInContext(mainScript, ctx);

const $ = id => el(id);
const show = id => $(id).style.display === 'block';

t('route: home is active on load', $('home').classList.contains('active'));
location_.hash = '#bmi-calculator'; hashHandlers.forEach(f => f());
t('route: hash navigation switches view', $('bmi-calculator').classList.contains('active') && !$('home').classList.contains('active'));
location_.hash = '#home'; hashHandlers.forEach(f => f());
t('route: back to home works', $('home').classList.contains('active'));

$('dob').value = '2000-01-15'; ctx.calcAge();
t('age: exact Y/M/D', $('ageResult').innerHTML.includes('<b>26</b>') && $('ageResult').innerHTML.includes('<b>7</b>') && $('ageResult').innerHTML.includes('<b>9</b>'));
$('dob').value = '2000-08-30'; ctx.calcAge();
t('age: month-end borrow math', $('ageResult').innerHTML.includes('<b>25</b>') && $('ageResult').innerHTML.includes('<b>11</b>') && $('ageResult').innerHTML.includes('<b>25</b>'));
$('dob').value = '2030-01-01'; ctx.calcAge();
t('age: future DOB blocked', $('ageResult').innerHTML.includes('future'));
$('dob').value = ''; alerts.length = 0; ctx.calcAge();
t('age: empty DOB hides result', !show('ageResult'));

$('bmiH').value = '170'; $('bmiW').value = '65'; ctx.calcBmi();
t('bmi: normal 22.5', $('bmiResult').innerHTML.includes('<b>22.5</b>') && $('bmiResult').innerHTML.includes('Normal'));
$('bmiW').value = '50'; ctx.calcBmi();
t('bmi: underweight detected', $('bmiResult').innerHTML.includes('Underweight'));
$('bmiH').value = '190'; $('bmiW').value = '120'; ctx.calcBmi();
t('bmi: obese detected', $('bmiResult').innerHTML.includes('Obese'));
alerts.length = 0; $('bmiH').value = '-170'; ctx.calcBmi();
t('bmi: rejects negatives', alerts.some(a => a.includes('valid')));

$('loanP').value = '500000'; $('loanR').value = '9'; $('loanY').value = '5'; ctx.calcEmi();
const emiMatch = $('emiResult').innerHTML.match(/Monthly payment: <b>([\d,.]+)<\/b>/);
const emiVal = emiMatch ? parseFloat(emiMatch[1].replace(/,/g, '')) : NaN;
const expR = 0.09 / 12, expN = 60;
const expEmi = 500000 * expR * Math.pow(1 + expR, expN) / (Math.pow(1 + expR, expN) - 1);
t(`emi: matches closed-form (${Math.round(expEmi)})`, Math.abs(emiVal - expEmi) < 1);
let bal = 500000; for (let i = 0; i < 60; i++) bal = bal * (1 + expR) - expEmi;
t('emi: full amortization pays off loan (independent sim)', Math.abs(bal) < 0.01);
$('loanP').value = '12000'; $('loanR').value = '0'; $('loanY').value = '1'; ctx.calcEmi();
t('emi: 0% interest divides evenly', $('emiResult').innerHTML.includes('1,000'));
alerts.length = 0; $('loanY').value = '0'; ctx.calcEmi();
t('emi: rejects zero duration', alerts.length > 0);

$('discPrice').value = '2000'; $('discPct').value = '25'; ctx.calcDisc();
t('discount: 25% off 2000 = pay 1500 save 500', $('discResult').innerHTML.includes('1,500') && $('discResult').innerHTML.includes('500'));
alerts.length = 0; $('discPct').value = '150'; ctx.calcDisc();
t('discount: rejects >100%', alerts.length > 0);
alerts.length = 0; $('discPrice').value = '-5'; $('discPct').value = '25'; ctx.calcDisc();
t('discount: rejects negative price', alerts.length > 0);

$('p1a').value = '10'; $('p1b').value = '200'; ctx.pct();
t('percent: X% of Y', $('p1r').innerHTML.includes('<b>20</b>'));
$('p2a').value = '45'; $('p2b').value = '200'; ctx.pct();
t('percent: X is what % of Y', $('p2r').innerHTML.includes('<b>22.50%</b>'));
$('p3a').value = '80'; $('p3b').value = '100'; ctx.pct();
t('percent: % change increase', $('p3r').innerHTML.includes('<b>25.00%</b>') && $('p3r').innerHTML.includes('📈'));

ctx.addGpaRow();
const cloneRow = gpaRows.children[3];
cloneRow.querySelector('.gpaGrade').value = '3';
cloneRow.querySelector('.gpaCredit').value = '3';
const grades = [['4','3'],['3','3'],['0','3']];
gpaRows.children.forEach((r, i) => { if (i < 3) { r.querySelector('.gpaGrade').value = grades[i][0]; r.querySelector('.gpaCredit').value = grades[i][1]; } });
t('gpa: add course row clones', gpaRows.children.length === 4);
ctx.calcGpa();
t('gpa: weighted average 30/12 = 2.50', $('gpaResult').innerHTML.includes('<b>2.50</b>'));
gpaRows.children.forEach(r => { r.querySelector('.gpaCredit').value = '0'; });
alerts.length = 0; ctx.calcGpa();
t('gpa: zero credits warns', alerts.some(a => a.includes('course')));
gpaRows.children.forEach(r => { r.querySelector('.gpaCredit').value = '3'; });

$('wcInput').value = 'Hello world. This is a test!'; ctx.countWords();
t('word counter: 6 words', $('stWords').textContent === '6');
t('word counter: char count', $('stChars').textContent === '28');
t('word counter: 2 sentences', $('stSent').textContent === '2');
t('word counter: reading time min format', $('stRead').textContent === '1 min');
$('wcInput').value = ''; ctx.countWords();
t('word counter: empty text zeros', $('stWords').textContent === '0');

$('caseInput').value = 'hello WORLD. foo bar';
ctx.convertCase('upper'); t('case: UPPER', $('caseInput').value === 'HELLO WORLD. FOO BAR');
ctx.convertCase('lower'); t('case: lower', $('caseInput').value === 'hello world. foo bar');
ctx.convertCase('title'); t('case: Title Case', $('caseInput').value === 'Hello World. Foo Bar');
ctx.convertCase('sentence'); t('case: Sentence case', $('caseInput').value === 'Hello world. Foo bar');

alerts.length = 0; ctx.compressImg();
t('image compressor: guards missing file', alerts.some(a => a.includes('image')));

['pwUpp','pwNum','pwSym'].forEach(id => $(id).checked = true);
$('pwLen').value = '16'; ctx.genPass();
let pw = $('pwOut').textContent;
t('password: length respected', pw.length === 16);
let sawAll = false;
for (let i = 0; i < 50 && !sawAll; i++) { ctx.genPass(); const p2 = $('pwOut').textContent; sawAll = /[A-Z]/.test(p2) && /\d/.test(p2) && /[^A-Za-z0-9\s]/.test(p2); }
t('password: uses upper/digit/symbol', sawAll);
ctx.genPass(); let pw2 = $('pwOut').textContent;
t('password: cryptographically random (two runs differ)', pw !== pw2);
['pwUpp','pwNum','pwSym'].forEach(id => $(id).checked = false); $('pwLen').value = '40'; ctx.genPass();
t('password: charset narrows when boxes unchecked', /^[a-z]{40}$/.test($('pwOut').textContent));
clipboardCalled = false; $('pwOut').textContent = 'Click generate ↓'; ctx.copyPw();
t('password: copy guards placeholder state', !clipboardCalled);

alerts.length = 0; $('dFrom').value = ''; $('dTo').value = ''; ctx.diffDates();
t('date diff: missing dates warn', alerts.length > 0);
$('dFrom').value = '2024-02-28'; $('dTo').value = '2024-03-01'; ctx.diffDates();
t('date diff: leap-year span = 2 days', $('diffResult').innerHTML.includes('<b>2</b> days total'));
const revA = $('dFrom').value, revB = $('dTo').value;
$('dFrom').value = revB; $('dTo').value = revA; ctx.diffDates();
t('date diff: reversed dates same answer', $('diffResult').innerHTML.includes('<b>2</b> days total'));

ctx.fillUnits();
$('ucType').value = 'weight'; ctx.fillUnits();
t('units: weight menu populated', $('ucFrom').innerHTML.includes('lb'));
$('ucType').value = 'length'; ctx.fillUnits();
$('ucFrom').value = 'km'; $('ucTo').value = 'm'; $('ucVal').value = '1'; ctx.convertUnits();
t('units: 1 km = 1000 m', $('ucResult').innerHTML.replace(/,/g, '').includes('1000 m'));
$('ucType').value = 'weight'; ctx.fillUnits();
$('ucFrom').value = 'lb'; $('ucTo').value = 'kg'; ctx.convertUnits();
t('units: 1 lb ≈ 0.453592 kg', Math.abs(parseFloat($('ucResult').innerHTML.match(/<b>([\d.]+) kg/)[1]) - 0.453592) < 0.000001);
$('ucVal').value = ''; alerts.length = 0; ctx.convertUnits();
t('units: empty value hides stale result', !show('ucResult') && alerts.length === 0);

$('tipBill').value = '1500'; $('tipPeople').value = '2'; ctx.setTip(10); ctx.calcTip();
t('tip: 1500 + 10% split x2 = 825 each', $('tipResult').innerHTML.includes('<b>825</b>') && $('tipResult').innerHTML.includes('1,650'));
alerts.length = 0; $('tipBill').value = '-5'; ctx.calcTip();
t('tip: rejects negative bill', alerts.some(a => a.includes('bill')));

const seoChecks = [
  ['canonical tag', /rel="canonical" href="https:\/\/ahatools\.netlify\.app\/"/.test(html)],
  ['og:title tag', html.includes('property="og:title"')],
  ['robots meta', html.includes('name="robots" content="index, follow"')],
  ['13 tool cards linked', [...html.matchAll(/href="#([\w-]+)"/g)].map(m => m[1]).filter(v => v !== 'home').length >= 13],
];
seoChecks.forEach(([n, ok]) => t('SEO: ' + n, ok));
const lds = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
t('SEO: JSON-LD valid & typed', lds.length === 2 && lds[0]['@type'] === 'WebApplication' && lds[1]['@type'] === 'FAQPage');
const robotsTxt = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
t('SEO: robots.txt has sitemap ref', robotsTxt.includes('Sitemap:'));
const sm = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
t('SEO: sitemap.xml valid & fresh', sm.includes('<?xml') && sm.includes(new Date().toISOString().slice(0, 10)));
const sitemapRun = execSync('node update-sitemap.mjs', { cwd: root }).toString();
t('automation: update-sitemap detects 13 tools', sitemapRun.includes('Found 13 tools'));

console.log(results.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
