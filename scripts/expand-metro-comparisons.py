#!/usr/bin/env python3
import sqlite3, os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'rents.db')
conn = sqlite3.connect(DB_PATH)

conn.execute("""
CREATE TABLE IF NOT EXISTS metro_comparisons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    metro_a_slug TEXT NOT NULL,
    metro_b_slug TEXT NOT NULL
)
""")

metros = conn.execute("SELECT slug FROM metros ORDER BY fmr_2br DESC").fetchall()
slugs = [r[0] for r in metros]

batch = []
for i in range(len(slugs)):
    for j in range(i+1, len(slugs)):
        a, b = sorted([slugs[i], slugs[j]])
        slug = f"{a}-vs-{b}"
        batch.append((slug, a, b))

conn.executemany(
    "INSERT OR IGNORE INTO metro_comparisons (slug, metro_a_slug, metro_b_slug) VALUES (?,?,?)",
    batch
)
conn.commit()
count = conn.execute("SELECT COUNT(*) FROM metro_comparisons").fetchone()[0]
print(f"✅ metro_comparisons: {count:,} rows")
conn.close()
