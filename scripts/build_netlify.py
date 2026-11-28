"""Build the existing static ZSC site with canonical URLs for the actual hosting origin."""
import os
import re
import shutil
from pathlib import Path
from urllib.parse import urlsplit
import json
import html
from render_weekly_report import refresh

ROOT = Path(__file__).resolve().parents[1]
OLD = "https://sohail654312-gif.github.io/zsc-demo/"

def build(origin, preview=False):
    url = urlsplit(origin)
    if url.scheme != "https" or not url.hostname or url.username or url.password or url.path not in ("", "/") or url.query or url.fragment:
        raise ValueError("Use the real HTTPS site origin without a path")
    new = origin.rstrip("/") + "/"
    out = ROOT / "dist"
    if out.exists():
        shutil.rmtree(out)
    out.mkdir()
    shutil.copytree(ROOT / "assets", out / "assets")
    for name in ("index.html", "robots.txt", "sitemap.xml"):
        content = (ROOT / name).read_text(encoding="utf-8").replace(OLD, new)
        if name == "index.html":
            content = re.sub(r'<meta name="google-site-verification"[^>]*>\s*', '', content)
            content = refresh(content, json.loads((ROOT / "assets/daily-prices.json").read_text()))
            for env_key, meta_name in (("GOOGLE_SITE_VERIFICATION", "google-site-verification"), ("BING_SITE_VERIFICATION", "msvalidate.01")):
                value = os.environ.get(env_key)
                if value and not preview:
                    content = content.replace('</head>', '<meta name="'+meta_name+'" content="'+html.escape(value, quote=True)+'">\n</head>')
            if preview:
                content = content.replace('content="index,follow,max-image-preview:large"', 'content="noindex,nofollow"')
        if name == "robots.txt" and preview:
            # Allow crawlers to read the page's noindex directive.
            content = "User-agent: *\nAllow: /\n"
        (out / name).write_text(content, encoding="utf-8")
    if preview:
        (out / "_headers").write_text("/*\n  X-Robots-Tag: noindex, nofollow\n", encoding="utf-8")
    print("Built ZSC static site; canonical origin:", new, "preview:", preview)

if __name__ == "__main__":
    origin = os.environ.get("ZSC_SITE_URL") or os.environ.get("URL") or os.environ.get("CF_PAGES_URL")
    if not origin:
        raise SystemExit("Set ZSC_SITE_URL or deploy using Netlify's URL environment variable")
    preview = os.environ.get("ZSC_NOINDEX") == "true" or os.environ.get("CONTEXT") in ("deploy-preview", "branch-deploy") or (os.environ.get("CF_PAGES_BRANCH") is not None and os.environ.get("CF_PAGES_BRANCH") != "main")
    build(origin, preview)
