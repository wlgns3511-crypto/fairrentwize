#!/usr/bin/env python3
"""Generate static sitemap.xml from SQLite DB → public/sitemap.xml

Next.js 16 turbopack + VPS 환경에서 동적 sitemap.ts가 500 에러를 발생시키므로,
빌드 전에 이 스크립트로 정적 sitemap.xml을 생성합니다.

사용법: python3 scripts/gen-sitemap.py
빌드 전에 실행하거나 mac-build-deploy.sh에 추가하세요.

커스터마이즈: 사이트별 추가 라우트(state, industry 등)는 이 파일을 수정하세요.
"""
import sqlite3
import json
from pathlib import Path
from datetime import datetime

PROJECT = Path(__file__).parent.parent
DB_PATH = PROJECT / "data" / "main.db"
OUT_PATH = PROJECT / "public" / "sitemap.xml"

# site.config.ts에서 domain 읽기 (간단한 파싱)
config_text = (PROJECT / "site.config.ts").read_text()
domain = ""
for line in config_text.split("\n"):
    if "domain:" in line and "'" in line:
        domain = line.split("'")[1]
        break
    elif 'domain:' in line and '"' in line:
        domain = line.split('"')[1]
        break

if not domain:
    print("ERROR: domain not found in site.config.ts")
    exit(1)

BASE = f"https://{domain}"

# entity slug 추출
entity_slug = "item"
for line in config_text.split("\n"):
    if "slug:" in line and "'" in line and "entity" not in line:
        entity_slug = line.split("'")[1]
        break

# table name 추출
table_name = "items"
for line in config_text.split("\n"):
    if "tableName:" in line and "'" in line:
        table_name = line.split("'")[1]
        break

# slug column 추출
slug_col = "slug"
for line in config_text.split("\n"):
    if "slugColumn:" in line and "'" in line:
        slug_col = line.split("'")[1]
        break


def main():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    urls = []

    # Static pages
    for page in ['/', '/compare/', '/search/', '/blog/', '/about/', '/methodology/',
                 '/privacy/', '/terms/', '/contact/', '/disclaimer/', '/rankings/all/']:
        urls.append((f"{BASE}{page}", 1.0 if page == '/' else 0.5))

    # All entity detail pages
    for row in c.execute(f"SELECT {slug_col} as slug FROM {table_name} ORDER BY {slug_col}"):
        urls.append((f"{BASE}/{entity_slug}/{row['slug']}/", 0.7))

    # Top comparison pairs (first 50 slugs → C(50,2) = 1,225 pairs)
    slugs = [row['slug'] for row in c.execute(
        f"SELECT {slug_col} as slug FROM {table_name} ORDER BY rowid LIMIT 50"
    )]
    for i, a in enumerate(slugs):
        for b in slugs[i+1:]:
            urls.append((f"{BASE}/compare/{a}-vs-{b}/", 0.5))

    conn.close()

    # Blog posts (scan lib/blog.ts for slugs)
    blog_file = PROJECT / "lib" / "blog.ts"
    if blog_file.exists():
        text = blog_file.read_text()
        import re
        for m in re.finditer(r"slug:\s*['\"]([^'\"]+)['\"]", text):
            urls.append((f"{BASE}/blog/{m.group(1)}/", 0.6))

    # Write XML
    today = datetime.now().strftime('%Y-%m-%d')
    OUT_PATH.parent.mkdir(exist_ok=True)
    with open(OUT_PATH, 'w') as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        f.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        for url, priority in urls:
            f.write(f'  <url><loc>{url}</loc><lastmod>{today}</lastmod><priority>{priority}</priority></url>\n')
        f.write('</urlset>\n')

    print(f"Sitemap: {OUT_PATH} ({len(urls)} URLs)")


if __name__ == "__main__":
    main()
