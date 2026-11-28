# ZSC daily price publishing
No external paid price API is needed. This is an owner-confirmed manual workflow, not an automatic market scraper.

1. Confirm today's actual selling rates with the shop, including brand, grade and unit.
2. After this feature is merged into main, open GitHub Actions → Prepare daily ZSC prices → Run workflow (main).
3. Enter a JSON array of items, select owner_approved, and keep dry_run enabled for validation. Disable dry_run to create the review branch.
4. Review the link in the run summary, create and merge a pull request using an authorized GitHub account, then confirm the actual deployed page. GitHub Pages deployment must be enabled; this workflow does not configure hosting.
5. Repeat on each day with newly confirmed rates. Old snapshots are labelled as historical; their prices do not feed the current-day calculator.

Illustrative input only — REPLACE these numbers with confirmed shop prices, do not publish the examples:
```json
[
  {"name":"FF Steel Grade 60","price":260,"unit":"kg","calculatorKey":"steel60"},
  {"name":"FF Steel Grade 80","price":280,"unit":"kg"},
  {"name":"Lucky Cement OPC","price":1600,"unit":"bag","calculatorKey":"cementOpc"}
]
```
Allowed units: kg (steel) and bag (50 kg cement). Calculator mappings are optional and must be unique: steel40, steel60, cementOpc, cementSrc. Map only a verified product to its actual grade/type. Extra brands and grade 80 can be displayed on the public board without affecting the existing calculator. Unmapped or stale calculator inputs remain labelled sample estimates. Transport inputs are always illustrative. Local visitor edits are not published and override approved prices only in that browser. Reset restores the applicable current published values.

Never publish a national market estimate as ZSC's actual selling price. No confirmed rates are bundled at launch. Date is assigned in Asia/Karachi; no guarantee of future price, stock or delivery. If the update is not merged until a later date, repeat with fresh confirmation rather than presenting it as today's price.
