# AhaTools ⚡

13 free online tools in a single-file website — no backend, no frameworks, no build step.

**Live site:** _coming soon_ · **YouTube tutorials:** [@Shahid-Ul-Islam-z5l](https://www.youtube.com/@Shahid-Ul-Islam-z5l)

## Tools
| | | |
|---|---|---|
| 🎂 Age Calculator | ⚖️ BMI Calculator | 🏦 Loan EMI Calculator |
| 🏷️ Discount Calculator | ％ Percentage Calculator | 🎓 GPA Calculator |
| 📝 Word Counter | 🔤 Case Converter | 🖼️ Image Compressor |
| 🔐 Password Generator | 📅 Days Between Dates | 📏 Unit Converter |
| 🍽️ Tip Calculator | | |

## Highlights
- **Real subpages** — each tool is its own crawlable URL (`/bmi-calculator/`) with unique title, meta description and canonical
- **100% client-side** — images and passwords never leave the user's device
- **Zero dependencies** — shared CSS/JS assets, instant load on slow connections
- **SEO-ready** — Open Graph, JSON-LD structured data, sitemap.xml, robots.txt, internal cross-linking
- **Mobile-first** — designed for phones on slow networks

## Structure
```
index.html            homepage (index of all tools)
<tool-slug>/index.html  one page per tool (13×)
assets/style.css      shared styles
assets/app.js         shared tool logic
generate-pages.mjs    regenerates all pages from metadata
update-sitemap.mjs    refreshes sitemap dates / sets domain
```

## SEO Automation
Run after adding/changing tools:
```bash
node update-sitemap.mjs                          # refresh sitemap lastmod + list tools
node update-sitemap.mjs https://your-domain.com  # also set your domain everywhere
```

## Run locally
Just open `index.html` in any browser.

## Tech
HTML5 · CSS3 · Vanilla JavaScript · Web Crypto API · Canvas API
