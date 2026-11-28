"""Validate owner-entered daily prices, and generate the public JSON and crawlable snapshot."""
import argparse
import datetime as dt
import html
import json
import math
import os
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
KEYS = {"steel40": "kg", "steel60": "kg", "cementOpc": "bag", "cementSrc": "bag"}
START = "<!-- DAILY_PRICE_SNAPSHOT_START -->"
END = "<!-- DAILY_PRICE_SNAPSHOT_END -->"

def validate(items):
    if not isinstance(items, list) or not 1 <= len(items) <= 40:
        raise ValueError("Enter 1–40 rate items")
    names, keys = set(), set()
    clean = []
    for i in items:
        if not isinstance(i, dict) or set(i) - {"name", "price", "unit", "calculatorKey"}:
            raise ValueError("Unknown item field")
        name, price, unit, key = i.get("name"), i.get("price"), i.get("unit"), i.get("calculatorKey")
        if not isinstance(name, str) or not name.strip() or len(name) > 100 or name.strip().casefold() in names:
            raise ValueError("Missing or duplicate item name")
        if type(price) not in (int, float) or not math.isfinite(price) or not 0 < price <= 1000000:
            raise ValueError("Price must be a positive finite number")
        if unit not in ("kg", "bag"):
            raise ValueError("Unit must be kg or bag (50 kg)")
        if key is not None and (not isinstance(key, str) or KEYS.get(key) != unit or key in keys):
            raise ValueError("Invalid or duplicate calculator mapping")
        names.add(name.strip().casefold())
        row = {"name": name.strip(), "price": price, "unit": unit}
        if key is not None:
            keys.add(key)
            row["calculatorKey"] = key
        clean.append(row)
    return clean

def publish(raw, approved, dry_run=False):
    if approved != "true":
        raise ValueError("Owner confirmation is required")
    items = validate(json.loads(raw))
    date = dt.datetime.now(ZoneInfo("Asia/Karachi")).date().isoformat()
    data = {"schemaVersion": 1, "currency": "PKR", "date": date, "status": "approved", "items": items}
    path = ROOT / "index.html"
    page = path.read_text(encoding="utf-8")
    if page.count(START) != 1 or page.count(END) != 1:
        raise ValueError("Snapshot markers missing or duplicated")
    before, rest = page.split(START, 1)
    _, after = rest.split(END, 1)
    rows = []
    for i in items:
        unit = "per kg / فی کلو" if i["unit"] == "kg" else "per 50 kg bag / فی بوری"
        rows.append('<div class="rate-item"><span class="rate-name">'+html.escape(i["name"])+'</span><div class="rate-value">PKR '+format(i["price"], ",.2f")+'</div><span class="rate-unit">'+unit+'</span></div>')
    snapshot = '<div id="public-rates-snapshot"><p>Owner-approved price snapshot dated '+date+' (Pakistan time). Confirm current availability and final quotation.</p><div class="rate-board">'+''.join(rows)+'</div></div>'
    sitemap = ROOT / "sitemap.xml"
    import re
    sitemap_text = re.sub(r"<lastmod>[^<]+</lastmod>", "<lastmod>"+date+"</lastmod>", sitemap.read_text(encoding="utf-8"))
    if not dry_run:
        (ROOT / "assets/daily-prices.json").write_text(json.dumps(data, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
        path.write_text(before+START+"\n"+snapshot+"\n"+END+after, encoding="utf-8")
        sitemap.write_text(sitemap_text, encoding="utf-8")
    print(f"Validated {len(items)} rates for {date}; dry_run={dry_run}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    publish(os.environ.get("DAILY_ITEMS", ""), os.environ.get("OWNER_APPROVED", ""), args.dry_run)
