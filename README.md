# AI + Economics Research Atlas · Upgraded Version

This version upgrades the original prototype into a **bilingual, JSON-driven, GitHub-Pages-friendly research website**.

## What changed

- Added **Chinese / English language switching**
- Added **keyword search** and **year filtering** for papers
- Switched to **JSON → automatic UI rendering**
- Split the project into **data / js / css directories** for easier maintenance
- Added a more polished **Claude-inspired visual style**
- Added academic UI elements: **citation block, tags, reading paths**
- Added **section reveal animations**, floating cards, and gradient background
- Added **copy citation** interaction

## New project structure

```text
ai-econ-pages-upgraded/
├── index.html
├── assets/
│   ├── css/
│   │   └── main.css
│   └── js/
│       └── app.js
└── data/
    ├── en/
    │   ├── site.json
    │   └── tracks/
    │       ├── ai-for-economics.json
    │       └── agentic-economy.json
    └── zh/
        ├── site.json
        └── tracks/
            ├── ai-for-economics.json
            └── agentic-economy.json
```

## How to add papers

You only need to edit the JSON files under:

- `data/zh/tracks/*.json`
- `data/en/tracks/*.json`

Each paper card supports:

- `title`
- `authors`
- `year`
- `venue`
- `citation`
- `abstract`
- `tags`
- `link`
- `featured`
- `path`

After updating JSON, the pages are rendered automatically. No manual HTML is needed for paper pages.

## Local preview

Because the site uses `fetch()` to read JSON files, do **not** open `index.html` directly with `file://`.
Use a local server instead:

```bash
cd ai-econ-pages-upgraded
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub Pages

This project uses **hash routing** (`#/track/...`), so it works well on GitHub Pages without extra routing configuration.


## New content structure

- `data/{lang}/tracks/*.json`: track and subcategory metadata
- `data/{lang}/chapters/**/*.json`: standalone chapter content files that can be edited independently
- Example: the experimental-economics chapter is now maintained as an independent JSON file and auto-rendered on the site
