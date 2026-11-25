# ZSC — Zia Saria & Cement Dealer

Premium, bilingual static demonstration website for Odigram, Timergara, Lower Dir, Pakistan. Built with HTML, CSS, JavaScript and original SVG artwork. No build process, paid services or backend required.

Live site: https://sohail654312-gif.github.io/zsc-demo/

## Demo status

- All prices are samples, not verified daily market data.
- The business name and location are supplied by the requester, not independently verified. The WhatsApp number +92 311 9556822 was subsequently supplied by the requester and is published as an owner-supplied contact, not independently verified. No opening hours, certification, customer endorsement, completed project or supplier relationship is asserted.
- Infrastructure scenes are original illustrations and illustrative applications, not completed ZSC projects.
- Quotation generation is local and non-binding. Nothing is submitted to ZSC. Downloads contain a demo disclaimer. WhatsApp opens a draft addressed to the owner-supplied number after the visitor clicks the WhatsApp button. Visitors can change or clear the contact in local demo settings. No message is sent automatically.
- Google Maps searches the supplied area. It is not a verified shop pin. The third-party embed loads only when requested.

## Deployment

Publish `main`, root `/`, using GitHub Pages repository Settings → Pages → Deploy from a branch. `index.html` and `.nojekyll` belong at the repository root. All website assets use relative paths compatible with `/zsc-demo/`. No SPA router is used; navigation uses section fragments.

## Editing prices and contact

Edit `assets/rates.json` and commit to `main` for site-wide changes. Price fields: `steel40` and `steel60` in PKR/kg; `cementOpc` and `cementSrc` in PKR per 50 kg bag; `deliveryBase` per trip and `deliveryKm` per one-way kilometre. Change `updated` to the actual sample revision date.

The page's **Edit demo rates** dialog saves local overrides only in the current browser. It is a public demo control, not an authenticated administration system. Reset restores the published file's values. Other visitors do not see local changes.

`whatsapp` is set to `+923119556822`, supplied by the requester for this site. It powers the direct WhatsApp enquiry link and generated quotation drafts. Its business affiliation has not been independently verified. Use only authorised numbers; a visitor can change or clear the number in local settings. No test sends a message to this number.

## Calculation assumptions

- Steel theoretical weight in kg = diameter in mm squared / 162 × length in metres × number of bars. Costs use unrounded weight; displayed values round to two decimals. This common planning approximation may differ from actual mill weights.
- Cement direct mode accepts whole 50 kg bags. Concrete mode uses wet volume × 1.54 / 7 × 1,440 / 50 × (1 + wastage / 100), rounded up. The nominal mix is 1:2:4; this is not an engineered concrete specification.
- Each material calculator replaces its own line in the combined quote. Up to one steel and one cement configuration can be combined.
- Delivery = base + one-way kilometres × per-kilometre rate, for one illustrative trip. Pickup is free in the estimate. Actual vehicle capacity, trip count, taxes, unloading and commercial terms require confirmation. There are no online payments.

## Language, SEO and Google Business Profile readiness

English/Urdu toggle translates the page and quotations and switches document direction to RTL. Preferences and local sample rates use guarded browser storage. Calculators and forms validate ranges and reject fractional bar/bag counts, missing values and negative quantities.

Included: canonical URL, description, Open Graph/Twitter metadata with a PNG preview, theme colour, SVG favicon, sitemap, robots file and LocalBusiness structured data that explicitly describes the demo. No reviews, ratings, exact coordinates, certifications or invented contact details are included. The owner-supplied telephone is included with an explicit demo/unverified description.

For a real Google Business Profile, verify the real name, precise address/map pin, category, phone and opening hours with the owner; replace demo copy with verified facts and complete Google's own verification. This website does not create, claim or verify a Business Profile, nor guarantee search placement. Urdu uses the same URL and therefore does not claim a separate `hreflang` page.

## Local preview

Serve this directory with any static HTTP server, then open its URL. Do not open `index.html` with `file://` because loading the rates file needs HTTP. JavaScript is required for interactive features; catalogue and navigation remain readable without it.

Designed & Developed by Codeedge.
