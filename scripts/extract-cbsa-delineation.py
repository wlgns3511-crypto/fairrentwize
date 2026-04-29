#!/usr/bin/env python3
"""Extract CBSA→county delineation from the OMB July 2023 xlsx into JSON
that build-db.ts can read.

Why this exists: HUD publishes per-county FMR (METRO_N) only for counties
with a per-county override. Other counties in a metro inherit the umbrella
(METRO_M). Without the OMB CBSA→county map, the umbrella-only counties —
including LA, Cook, Harris, Maricopa — never resolve to county pages.
"""
import json
import os
import sys
from datetime import datetime, timezone

import openpyxl

XLSX = os.path.join(os.path.dirname(__file__), "..", "data", "raw", "cbsa-delineation-2023.xlsx")
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "raw", "cbsa-counties.json")

HEADER_ROW_INDEX = 2  # 0-indexed: row 2 has the column titles


def main() -> int:
    if not os.path.exists(XLSX):
        print(f"missing {XLSX}", file=sys.stderr)
        return 1
    wb = openpyxl.load_workbook(XLSX, read_only=True)
    ws = wb.active

    cbsa_map: dict[str, dict] = {}
    rows = list(ws.iter_rows(values_only=True))
    headers = rows[HEADER_ROW_INDEX]
    print(f"headers: {headers}")

    # column indices (0-based)
    col_cbsa = 0
    col_title = 3
    col_type = 4
    col_county_name = 7
    col_state_name = 8
    col_state_fips = 9
    col_county_fips = 10
    col_central_outlying = 11

    for row in rows[HEADER_ROW_INDEX + 1 :]:
        if not row or not row[col_cbsa]:
            continue
        cbsa_code = str(row[col_cbsa])
        state_fips = str(row[col_state_fips]) if row[col_state_fips] is not None else None
        county_fips = str(row[col_county_fips]) if row[col_county_fips] is not None else None
        if not state_fips or not county_fips:
            continue
        # filter territories (we only cover 50 states + DC)
        if state_fips in {"60", "66", "69", "72", "78"}:
            continue
        fips = f"{int(state_fips):02d}{int(county_fips):03d}"
        entry = cbsa_map.setdefault(
            cbsa_code,
            {
                "cbsa": cbsa_code,
                "title": row[col_title],
                "type": row[col_type],
                "counties": [],
            },
        )
        entry["counties"].append(
            {
                "fips": fips,
                "name": row[col_county_name],
                "state_name": row[col_state_name],
                "central_or_outlying": row[col_central_outlying],
            }
        )

    out = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": "OMB July 2023 CBSA Delineation List 1 (census.gov)",
        "url": "https://www2.census.gov/programs-surveys/metro-micro/geographies/reference-files/2023/delineation-files/list1_2023.xlsx",
        "cbsa_count": len(cbsa_map),
        "county_count": sum(len(c["counties"]) for c in cbsa_map.values()),
        "cbsas": [cbsa_map[k] for k in sorted(cbsa_map.keys())],
    }
    with open(OUT, "w") as f:
        json.dump(out, f, indent=2)
    print(f"wrote {OUT}")
    print(f"  CBSAs: {len(cbsa_map)}")
    print(f"  county-rows: {sum(len(c['counties']) for c in cbsa_map.values())}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
