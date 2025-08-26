# Excel Audit & Calculator (GitHub Pages)

A single-page web app that lets you upload Excel/CSV files, preview data, compute column-wise statistics, and run simple group-by aggregations — all **in the browser** (no server required).

## Features
- Drag-and-drop or file picker to upload `.xlsx`, `.xls`, or `.csv`
- Sheet selector (when multiple sheets exist)
- Data preview (first 1000 rows for performance)
- **Analysis** of numeric columns: `count`, `sum`, `mean`, `min`, `max`, `std`
- **Group-by** (pivot-lite): choose a category column, then aggregate numeric columns with `sum`, `mean`, `count`, `min`, or `max`
- Export results as **CSV** (summary & group-by) and **JSON** (summary)
- Downloadable **template** workbook to start from

## How to Deploy on GitHub Pages
1. Create a new repo on GitHub (e.g., `excel-audit`).
2. Upload `index.html` to the root of the repo (you can add `README.md` too).
3. In the repo: **Settings → Pages → Build and deployment → Deploy from a branch**.
4. Choose branch `main` (or `master`) and folder `/root`, click **Save**.
5. Wait for Pages to publish; your site will be live at the URL shown in the Pages section.

> Tip: If you prefer a custom domain, add it in **Settings → Pages** after the site is live.

## Local Testing
Just double-click `index.html` to open it in your browser. Because the app runs entirely on the client side, it works from a local file too.

## Privacy
All processing happens in your browser. Files are **not** uploaded to any server.
