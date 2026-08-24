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
- **100% client-side** — images and passwords never leave the user's device
- **Zero dependencies** — one HTML file (~30 KB), instant load on slow connections
- **SEO-ready** — Open Graph, JSON-LD structured data (WebApplication + FAQPage), sitemap.xml, robots.txt
- **Hash-based routing** — every tool has its own shareable URL (`/#gpa-calculator`)
- **Mobile-first** — designed for phones on slow networks

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
