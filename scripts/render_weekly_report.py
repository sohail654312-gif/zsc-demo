"""Crawlable, date-safe rendering shared by builds and weekly maintenance."""
import datetime as dt
import html
import json
from pathlib import Path
from zoneinfo import ZoneInfo
ROOT = Path(__file__).resolve().parents[1]
START = '<!-- DAILY_PRICE_SNAPSHOT_START -->'
END = '<!-- DAILY_PRICE_SNAPSHOT_END -->'
def previous_week(today):
    start = today - dt.timedelta(days=today.weekday() + 7)
    return start, start + dt.timedelta(days=6)
def render(data, today=None):
    start, end = previous_week(today or dt.datetime.now(ZoneInfo('Asia/Karachi')).date())
    esc = lambda v: html.escape(str(v), quote=True)
    heading = f'<p>Previous completed week / گزشتہ مکمل ہفتہ: {start} — {end}. Historical references only; not today’s ZSC selling prices.</p>'
    if data.get('weekStart') != str(start) or data.get('weekEnd') != str(end):
        return '<div id="public-rates-snapshot">' + heading + '<p>No reviewed historical data for this week. / اس ہفتے کے تصدیق شدہ تاریخی نرخ دستیاب نہیں۔ Ask ZSC for today’s quotation.</p></div>'
    rows = []
    local = data.get('localEstimates', {})
    if local.get('weekStart') == str(start) and local.get('weekEnd') == str(end):
        for i in local.get('items', []):
            unit = {'maund':'per maund (40 kg) / فی من','kg':'per kg / فی کلو','bag':'per 50 kg bag / فی بوری'}[i['unit']]
            rows.append(f'<div class="rate-item"><span class="rate-name">{esc(i["name"])}</span><div class="rate-value">PKR {i["low"]:,}–{i["high"]:,}</div><span class="rate-unit">{unit}</span></div>')
    estimates = ''
    if rows:
        estimates = '<div id="local-estimates"><h4>Lower Dir planning estimates / دیر لوئر کے تخمینی نرخ</h4><p>User-suggested estimates for '+str(start)+' — '+str(end)+'. Not independently verified historical transaction prices or current shop prices. / صارف کے تجویز کردہ مقامی اندازے؛ تصدیق شدہ تاریخی یا آج کے فروخت کے نرخ نہیں۔</p><div class="rate-board">'+''.join(rows)+'</div></div>'
    rows = []
    for i in data.get('items', []):
        if not str(start) <= i['date'] <= str(end):
            continue
        factor = 40 if i['unit']=='kg' and 'grade 40' in i['name'].lower() else 1
        unit = 'per maund (40 kg)' if factor==40 else ('per kg' if i['unit']=='kg' else 'per 50 kg bag')
        price = f'{i["low"]*factor:,.2f}' + (f'–{i["high"]*factor:,.2f}' if i['low']!=i['high'] else '')
        rows.append(f'<div class="rate-item"><span class="rate-name">{esc(i["name"])}</span><div class="rate-value">PKR {price}</div><span class="rate-unit">{unit} · {esc(i["date"])}</span><a href="{esc(i["url"])}" rel="noopener noreferrer">{esc(i["source"])}</a></div>')
    seen = {i['date'] for i in data.get('items', [])}
    missing = ', '.join(str(start+dt.timedelta(days=n)) for n in range(7) if str(start+dt.timedelta(days=n)) not in seen) or 'none'
    return '<div id="public-rates-snapshot">'+heading+estimates+'<details><summary>Original regional/national source observations (unadjusted)</summary><div class="rate-board">'+''.join(rows)+'</div><p>Missing observation dates: '+missing+'. FF Steel Grade 60/80 brand-specific historical prices unavailable; contact ZSC. Source observations are market references, not local transaction prices.</p></details></div>'
def refresh(content, data, today=None):
    before, rest = content.split(START, 1)
    _, after = rest.split(END, 1)
    return before+START+'\n'+render(data,today)+'\n'+END+after
if __name__ == '__main__':
    page=ROOT/'index.html'
    page.write_text(refresh(page.read_text(), json.loads((ROOT/'assets/daily-prices.json').read_text())), encoding='utf-8')
