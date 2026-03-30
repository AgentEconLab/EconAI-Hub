# AI + Economics Research Atlas · GitHub Pages Starter

This project is a static GitHub Pages site for a high-visual-quality academic portal inspired by modern product landing pages.

## Included structure

- Home page with two main tracks:
  - AI for Economics
  - Agentic Economy
- Track pages with clickable subcategories
- Subcategory pages with:
  - fine-grained field tags
  - paper list cards
  - an extra timeline for **Economic Agent Behavior Modeling**
- Hash-based routing, so it works directly on GitHub Pages with no backend

## Files

- `index.html` — page shell
- `styles.css` — visual system, layout, glassmorphism, animations
- `content.js` — all editable research content
- `app.js` — client-side rendering and routing

## How to deploy on GitHub Pages

1. Create a GitHub repository.
2. Upload all files in this folder.
3. In GitHub, go to **Settings → Pages**.
4. Under **Build and deployment**, choose:
   - **Source**: Deploy from a branch
   - **Branch**: `main` / root
5. Save. GitHub will publish the site.

## How to edit content

Open `content.js` and replace the placeholder entries:

- `title`
- `abstract`
- `year`
- `field`
- `link`

You can also:

- add more subcategories
- add more papers per subcategory
- modify the modeling timeline

## Notes

This package currently focuses on **front-end structure and presentation**.
The paper entries are **placeholder/demo cards**, so you can replace them with your curated literature list.
