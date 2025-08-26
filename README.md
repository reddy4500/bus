# Audit Calculator (React + Vite + Tailwind)

A small web app to enter audit rows, compute payables/deductions, and export results.

## Features
- Add multiple rows (like Excel)
- Auto-calculated fields:
  - AMOUNT PAYABLE = OPT KMS × SLAB RATE
  - TOTAL PAYABLE = AMOUNT PAYABLE + INSURANCE REIM + OIL SAVED
  - TOTAL DEDUCTIONS = INCOME TAX + PENALTY + LESS OTHERS(OIL)
  - NET PAYABLE = TOTAL PAYABLE − TOTAL DEDUCTIONS
- Search/filter
- Charts (Net Payable by Vehicle, KMS: OPT vs SCH)
- Import from Excel (.xlsx)
- Export to Excel (.xlsx)
- Saves to localStorage

## Get Started
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages
1. Create a repository on GitHub, e.g. `audit-calculator`.
2. Push this project to the repo.
3. In `vite.config.js`, set `base: '/<REPO_NAME>/'` (e.g., `/audit-calculator/`).
4. Build and deploy:
   ```bash
   npm run build
   ```
5. Commit and push the `dist/` folder to a `gh-pages` branch or use GitHub Actions.

### Quick GH Pages via `gh-pages` package
```bash
npm install --save-dev gh-pages
# package.json scripts:
# "predeploy": "vite build",
# "deploy": "gh-pages -d dist"
npm run deploy
```

## Notes
- The app expects columns similar to your Excel when importing.
- You can adjust default `slabRate` or add more columns/calculations in `src/App.jsx`.
