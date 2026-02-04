#!/usr/bin/env python3
"""
Apply project copy from a PDF to all docs/projects/*.html pages.

Rules:
- The PDF sections are expected to start with: "<Project Title> – <Subtitle>"
- We inject ONLY the body text (do not repeat the title that's already the page H1).
- We replace the first-row text card's <h3> and <p> inside ".first-row-text".
  - If the page H1 matches the PDF title: set <h3> to the PDF subtitle.
  - If the page H1 matches the PDF subtitle (alternate-named pages): set <h3> to the PDF title.

Also cleans up a known-bad script tag: ../P260131-3
"""

from __future__ import annotations

import html
import re
import sys
from dataclasses import dataclass
from pathlib import Path


try:
    from pypdf import PdfReader
except Exception as e:  # pragma: no cover
    raise SystemExit(
        "Missing dependency 'pypdf'. Install with: python3 -m pip install pypdf\n"
        f"Original error: {e}"
    )


ROOT = Path(__file__).resolve().parents[1]
PROJECTS_DIR = ROOT / "docs" / "projects"


PDF_DEFAULT = Path("/Users/mark/Desktop/JAC PROJECTS COPY.pdf")


HEADING_SEP = "–"  # en dash


@dataclass(frozen=True)
class Entry:
    title: str
    subtitle: str
    body: str


def norm(s: str) -> str:
    s = s.lower()
    s = s.replace("’", "'")
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def extract_pdf_text(pdf_path: Path) -> str:
    reader = PdfReader(str(pdf_path))
    parts: list[str] = []
    for page in reader.pages:
        parts.append(page.extract_text() or "")
    return "\n".join(parts)


def parse_entries(text: str) -> list[Entry]:
    # Normalize page markers
    lines = [ln.rstrip() for ln in text.splitlines()]
    cleaned: list[str] = []
    for ln in lines:
        if re.match(r"^\s*--\s*\d+\s+of\s+\d+\s*--\s*$", ln, re.I):
            continue
        if not ln.strip():
            cleaned.append("")
            continue
        cleaned.append(ln.strip())

    entries: list[Entry] = []
    i = 0
    while i < len(cleaned):
        ln = cleaned[i]
        if HEADING_SEP in ln:
            # Heuristic: a heading line should be short-ish and not end with a period.
            # (Avoid catching body sentences with an en dash.)
            if len(ln) <= 120 and not ln.endswith("."):
                title, subtitle = [x.strip() for x in ln.split(HEADING_SEP, 1)]
                i += 1
                body_lines: list[str] = []
                while i < len(cleaned):
                    ln2 = cleaned[i]
                    if HEADING_SEP in ln2 and len(ln2) <= 120 and not ln2.endswith("."):
                        break
                    body_lines.append(ln2)
                    i += 1
                body = "\n".join(body_lines).strip()
                # Collapse linewraps into paragraphs
                paras: list[str] = []
                buf: list[str] = []
                for bl in body.splitlines():
                    if not bl.strip():
                        if buf:
                            paras.append(" ".join(buf).strip())
                            buf = []
                        continue
                    buf.append(bl.strip())
                if buf:
                    paras.append(" ".join(buf).strip())
                paras = [p for p in paras if p]

                # Some PDF extracts insert blank lines between words/phrases.
                # If we detect lots of tiny "paragraphs", treat it as one paragraph.
                if len(paras) > 4:
                    tiny = sum(1 for p in paras if len(p.split()) <= 3)
                    if tiny / len(paras) > 0.5:
                        paras = [" ".join(paras).strip()]

                body_joined = "\n\n".join(paras)
                if title and subtitle and body_joined:
                    entries.append(Entry(title=title, subtitle=subtitle, body=body_joined))
                continue
        i += 1

    return entries


def htmlify_body(body: str) -> str:
    # Convert paragraphs into <br/><br/> inside the existing <p>.
    paras = [p.strip() for p in body.split("\n\n") if p.strip()]
    cleaned = [re.sub(r"\s+", " ", p).strip() for p in paras]
    escaped = [html.escape(p) for p in cleaned]
    return "<br/><br/>".join(escaped)


H1_RE = re.compile(r"<h1[^>]*>(.*?)</h1>", re.I | re.S)
TAG_RE = re.compile(r"<[^>]+>")

FIRST_ROW_TEXT_RE = re.compile(
    r'(<div\s+class="first-row-text"[^>]*>)(.*?)(</div>\s*</div>)',
    re.I | re.S,
)
H3_RE = re.compile(r"(<h3\b[^>]*>)(.*?)(</h3>)", re.I | re.S)
P_RE = re.compile(r"(<p\b[^>]*>)(.*?)(</p>)", re.I | re.S)

BAD_SCRIPT_RE = re.compile(
    r"""\s*<script\s+defer\s+src=(['"])\.\./P260131-3\1></script>\s*""",
    re.I,
)


def get_h1(html_text: str) -> str:
    m = H1_RE.search(html_text)
    if not m:
        return ""
    raw = m.group(1)
    return TAG_RE.sub("", raw).strip()


def apply_to_html(html_text: str, entry: Entry, page_h1: str) -> tuple[str, bool]:
    changed = False
    out = html_text

    # remove known-bad script tag
    out2, n = BAD_SCRIPT_RE.subn("\n", out)
    if n:
        out = out2
        changed = True

    m = FIRST_ROW_TEXT_RE.search(out)
    if not m:
        return out, changed

    open_div, inner, close_div = m.group(1), m.group(2), m.group(3)

    page_norm = norm(page_h1)
    title_norm = norm(entry.title)
    subtitle_norm = norm(entry.subtitle)

    if page_norm == title_norm:
        new_h3 = entry.subtitle
    elif page_norm == subtitle_norm:
        new_h3 = entry.title
    else:
        # fallback: prefer subtitle to avoid repeating the likely page title
        new_h3 = entry.subtitle
    new_h3 = re.sub(r"\s+", " ", new_h3).strip()

    inner2 = inner
    h3m = H3_RE.search(inner2)
    if h3m:
        inner2 = (
            inner2[: h3m.start()]
            + h3m.group(1)
            + html.escape(new_h3)
            + h3m.group(3)
            + inner2[h3m.end() :]
        )
    pm = P_RE.search(inner2)
    if pm:
        inner2 = (
            inner2[: pm.start()]
            + pm.group(1)
            + htmlify_body(entry.body)
            + pm.group(3)
            + inner2[pm.end() :]
        )

    if inner2 != inner:
        changed = True
        out = out[: m.start()] + open_div + inner2 + close_div + out[m.end() :]

    return out, changed


def pick_entry(entries: list[Entry], page_h1: str) -> Entry | None:
    by_title = {norm(e.title): e for e in entries}
    by_subtitle = {norm(e.subtitle): e for e in entries}
    key = norm(page_h1)
    if key in by_title:
        return by_title[key]
    if key in by_subtitle:
        return by_subtitle[key]

    # explicit aliases for pages that don't match title/subtitle exactly
    aliases = {
        "peary way": "peary place",
        "jamm visual": "jamm agency office",
        "beverly hills ii": "sherbourne",
        "beverly hills alpine": "alpine",
        "mulholland estate": "mulholland drive",
        "panorama views": "river homestead",
        "yellowstone club": "river homestead",
        "madison club": "columbus way",
        "madison club ii": "peary place",
        "calabasas residence": "colette way",
        "venice boho house": "frances",
    }
    if key in aliases:
        alias_key = aliases[key]
        if alias_key in by_title:
            return by_title[alias_key]
        if alias_key in by_subtitle:
            return by_subtitle[alias_key]

    # contains fallback (e.g., "Beverly Hills Alpine" -> "Alpine")
    for e in entries:
        t = norm(e.title)
        if t and t in key:
            return e

    return None


def main(argv: list[str]) -> int:
    pdf_path = Path(argv[1]) if len(argv) > 1 else PDF_DEFAULT
    if not pdf_path.exists():
        print(f"PDF not found: {pdf_path}", file=sys.stderr)
        return 2
    if not PROJECTS_DIR.exists():
        print(f"Projects folder not found: {PROJECTS_DIR}", file=sys.stderr)
        return 2

    pdf_text = extract_pdf_text(pdf_path)
    entries = parse_entries(pdf_text)
    if not entries:
        print("No entries parsed from PDF text.", file=sys.stderr)
        return 3

    updated = 0
    missing: list[str] = []
    no_slot: list[str] = []

    for p in sorted(PROJECTS_DIR.glob("*.html")):
        original = p.read_text("utf-8", errors="ignore")
        h1 = get_h1(original)
        entry = pick_entry(entries, h1)
        if not entry:
            missing.append(f"{p.name}\t{h1}")
            continue
        new_text, changed = apply_to_html(original, entry, h1)
        if "first-row-text" not in original:
            no_slot.append(f"{p.name}\t{h1}")
            continue
        if changed:
            p.write_text(new_text, "utf-8")
            updated += 1

    print(f"Parsed {len(entries)} PDF entries.")
    print(f"Updated {updated} project page(s).")
    if missing:
        print("\nMissing mapping for:")
        for m in missing:
            print(" -", m)
    if no_slot:
        print("\nPages missing '.first-row-text' slot:")
        for n in no_slot:
            print(" -", n)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))

