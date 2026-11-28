"""Publish only the previous completed Pakistan-time week, with dated sources."""
import argparse
import datetime as dt
import html
import json
import math
import os
import re
from pathlib import Path
from urllib.parse import urlsplit
from zoneinfo import ZoneInfo
ROOT = Path(__file__).resolve().parents[1]
START = "<!-- DAILY_PRICE_SNAPSHOT_START -->"
END = "<!-- DAILY_PRICE_SNAPSHOT_END -->"

def previous_week(today):
    start = today - dt.timedelta(days=today.weekday()+7)
    return start, start+dt.timedelta(days=6)

def validate(items, start, end):
    if not isinstance(items,list) or not 1 <= len(items) <= 100:
        raise ValueError("Enter 1–100 sourced observations")
    seen=set()
    for i in items:
        if not isinstance(i,dict) or set(i)!={"name","unit","low","high","date","source","url"}:
            raise ValueError("Invalid observation fields")
        for k in ("name","source"):
            if not isinstance(i[k],str) or not i[k].strip() or len(i[k])>120:
                raise ValueError("Invalid name/source")
        if i["unit"] not in ("kg","bag"):
            raise ValueError("Invalid unit")
        for k in ("low","high"):
            if type(i[k]) not in (int,float) or not math.isfinite(i[k]) or not 0<i[k]<=1000000:
                raise ValueError("Invalid price")
        if i["low"]>i["high"]:
            raise ValueError("Invalid range")
        date=dt.date.fromisoformat(i["date"])
        if not start<=date<=end or date.isoformat()!=i["date"]:
            raise ValueError("Observation must be inside previous completed week")
        url=urlsplit(i["url"])
        if url.scheme!="https" or not url.hostname or url.username or url.password:
            raise ValueError("HTTPS source required")
        key=(i["name"].strip().casefold(),i["date"],i["unit"])
        if key in seen:
            raise ValueError("Duplicate observation")
        seen.add(key)
    return sorted(items,key=lambda i:(i["date"],i["name"]))

def publish(raw, approved, dry_run=False):
    if approved!="true":
        raise ValueError("Source review is required")
    today=dt.datetime.now(ZoneInfo("Asia/Karachi")).date()
    start,end=previous_week(today)
    items=validate(json.loads(raw),start,end)
    data={"schemaVersion":2,"currency":"PKR","weekStart":start.isoformat(),"weekEnd":end.isoformat(),"items":items}
    dates={i["date"] for i in items}
    missing=[(start+dt.timedelta(days=n)).isoformat() for n in range(7) if (start+dt.timedelta(days=n)).isoformat() not in dates]
    rows=[]
    for i in items:
        maund=i["unit"]=="kg" and bool(re.search(r"\bgrade\s*[-–]?\s*40\b",i["name"],re.I))
        factor=40 if maund else 1
        price=format(i["low"]*factor,",.2f")
        if i["high"]!=i["low"]:
            price+="–"+format(i["high"]*factor,",.2f")
        unit="per maund (40 kg) / فی من" if maund else ("per kg" if i["unit"]=="kg" else "per 50 kg bag")
        rows.append('<div class="rate-item"><span class="rate-name">'+html.escape(i["name"])+'</span><div class="rate-value">PKR '+price+'</div><span class="rate-unit">'+unit+' · '+i["date"]+'</span><a href="'+html.escape(i["url"],quote=True)+'" rel="noopener noreferrer">'+html.escape(i["source"])+'</a></div>')
    snapshot='<div id="public-rates-snapshot"><p>Historical market references: '+start.isoformat()+' to '+end.isoformat()+'. Dated observations on '+str(len(dates))+'/7 days. Not current ZSC selling prices.</p><div class="rate-board">'+''.join(rows)+'</div><p>Unreported dates: '+(", ".join(missing) or "none")+'. Request a current quotation.</p></div>'
    page=ROOT/"index.html"
    content=page.read_text(encoding="utf-8")
    if content.count(START)!=1 or content.count(END)!=1:
        raise ValueError("Snapshot markers invalid")
    before,rest=content.split(START,1)
    _,after=rest.split(END,1)
    sitemap=ROOT/"sitemap.xml"
    sitemap_text=re.sub(r"<lastmod>[^<]+</lastmod>","<lastmod>"+today.isoformat()+"</lastmod>",sitemap.read_text(encoding="utf-8"))
    if not dry_run:
        (ROOT/"assets/daily-prices.json").write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        page.write_text(before+START+"\n"+snapshot+"\n"+END+after,encoding="utf-8")
        sitemap.write_text(sitemap_text,encoding="utf-8")
    print(f"Validated {len(items)} observations for {start}–{end}; dry_run={dry_run}")

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--dry-run",action="store_true")
    args=parser.parse_args()
    publish(os.environ.get("DAILY_ITEMS",""),os.environ.get("OWNER_APPROVED",""),args.dry_run)
