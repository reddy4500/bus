# Form-based Audit Ledger Site (from 1.jan audit.xlsx)

This static site provides a form-based interface matching the columns in your uploaded Excel (`1.jan audit.xlsx`):
- Date
- PARTICULARS
- Vch Type
- Vch No.
- Debit
- Credit

Features included:
- Add / Edit / Delete rows via form
- Running Balance computed cumulatively (Debit - Credit) in date order
- Monthly totals (group by YYYY-MM)
- Group-by voucher type summary (count, totals, difference)
- Filters by month and voucher type
- Export current view to CSV or Excel (.xlsx)
- Data stored in browser `localStorage` (no server)
- Ready to deploy on GitHub Pages

## Deploy
Upload `index.html` to a GitHub repo root and enable GitHub Pages (branch `main`, folder `/root`).

