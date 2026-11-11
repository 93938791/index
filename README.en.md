# FLOWERKERNEL Website

Official website of Inner Mongolia Huayun Digital Core Information Technology Co., Ltd. A static single-page site with no build step and no framework dependencies.

## Contents

- **Product case study**: Rural Collective Three-Assets Information Management System (<https://sanzi.765.run>)
- **Services**: industry management platforms, data visualization, mobile / mini programs, system integration, private deployment, long-term support
- **Process** and **contact**

## Preview

Open `index.html` directly, or start a static server in this directory:

```bash
python -m http.server 8123
```

Then visit <http://127.0.0.1:8123/>.

## Structure

```
index.html              page structure and copy
styles.css              styles, responsive layout, animation
app.js                  interactions: reveals, product tabs, counters, particle field
assets/
  fonts/                local fonts (Space Grotesk, JetBrains Mono, Noto Sans SC)
  logo/                 brand mark and favicon
  product/              product screenshots
```

## Deployment

Upload the directory to any static host or Nginx; no build required. The page supports desktop and mobile, with no-JS and reduced-motion fallbacks.

## Contact

- Phone / WeChat: +86 155 4080 9080
- Email: 93938791@qq.com
