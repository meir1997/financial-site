"""Build the accessible HTML edition of the investor guide from its text source."""

from __future__ import annotations

import html
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "tmp/pdfs/source-rtl-fixed.txt"
OUTPUT = ROOT / "guide.html"


def clean_line(line: str) -> str:
    line = " ".join(line.split())
    if not line or line.startswith("המדריך הכלכלי |"):
        return ""
    return line


def parse_pages() -> dict[int, list[str]]:
    pages: dict[int, list[str]] = {}
    page_no: int | None = None
    for raw_line in SOURCE.read_text(encoding="utf-8").splitlines():
        marker = re.fullmatch(r"===== PAGE (\d+) =====", raw_line.strip())
        if marker:
            page_no = int(marker.group(1))
            pages[page_no] = []
        elif page_no is not None:
            line = clean_line(raw_line)
            if line:
                pages[page_no].append(line)
    return pages


def is_subheading(line: str) -> bool:
    starts = ("שלב ", "טעות ", "מה ", "איך ", "למה ", "איפה ", "מתי ", "סיכום", "דוגמה", "תובנה ", "טיפ ", "הכלל ")
    return len(line) < 100 and (line.endswith("?") or line.startswith(starts))


def tag(name: str, text: str, **attrs: str) -> str:
    attributes = "".join(f' {key}="{html.escape(value, quote=True)}"' for key, value in attrs.items())
    return f"<{name}{attributes}>{html.escape(text)}</{name}>"


def build() -> None:
    pages = parse_pages()
    pages[3] = [
        "למה כתבתי את המדריך",
        "אני מאמין שהמפתח לשלווה אמיתית עובר דרך יציבות כלכלית.",
        "מצב כלכלי מאוזן לא נועד רק לשקט הנפשי, אלא גם כבסיס לצמיחה, חופש ובחירה.",
        "כל אחד ואחת יכולים לשפר את המצב הכלכלי, להשתחרר מחובות ולבנות עתיד בטוח - לא בעזרת קסמים או קיצורי דרך, אלא דרך הבנה, תכנון, משמעת ופעולה נכונה.",
        "מי שפועל מתוך הבנה ולא מתוך פחד או בלבול, מרוויח יותר שליטה וביטחון. לכן כתבתי את המדריך בשפה ברורה, שיטתית וישימה.",
        "המטרה היא לעזור לך לקבל החלטות טובות יותר, להימנע מטעויות נפוצות ולהבין איך הכסף יכול לשרת את המטרות שלך.",
        "אני מקווה שיהיו כאן כלים שיעזרו לך להתחיל - ובעיקר אמונה בכך ששינוי הוא אפשרי.",
        "מאיר כהן",
        "ייעוץ ותכנון פיננסי",
    ]
    title = "המדריך למשקיע המתחיל"
    chunks = [
        "<!doctype html>",
        '<html lang="he" dir="rtl">',
        "<head>",
        '  <meta charset="utf-8">',
        '  <meta name="viewport" content="width=device-width, initial-scale=1">',
        f"  <title>{title} | מאיר כהן</title>",
        '  <meta name="description" content="גרסת HTML נגישה של המדריך למשקיע המתחיל מאת מאיר כהן.">',
        '  <link rel="preconnect" href="https://fonts.googleapis.com">',
        '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
        '  <link href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@500;600;700&family=Heebo:wght@400;500;600;700&display=swap" rel="stylesheet">',
        '  <link rel="stylesheet" href="css/style.css">',
        "  <style>",
        "    .guide-page{padding-block:7rem 4rem}.guide-layout{max-width:52rem;margin-inline:auto}.guide-intro{padding:2rem;border:1px solid var(--sage);border-radius:1rem;background:var(--paper)}.guide-toc{margin-block:2rem;padding:1.5rem 2rem;background:var(--forest-soft);border-radius:1rem}.guide-toc ol{padding-inline-start:1.5rem}.guide-content section{padding-block:2rem;border-block-end:1px solid var(--line)}.guide-content h2{margin-block:0 1.5rem}.guide-content h3{margin-block:2rem .65rem}.guide-content p{max-width:72ch;margin-block:.75rem}.guide-disclaimer{padding:1rem 1.25rem;border-inline-start:4px solid var(--sage);background:var(--forest-soft)}",
        "  </style>",
        "</head>",
        "<body>",
        '  <a class="skip-link" href="#guide-content">דילוג לתוכן המדריך</a>',
        '  <header class="site-header"><div class="container nav-wrap"><a class="brand" href="index.html" aria-label="מאיר כהן — דף הבית">מאיר כהן</a><nav aria-label="ניווט ראשי"><a href="index.html">דף הבית</a><a href="blog.html">ידע וכלים</a><a href="calculators.html">מחשבונים</a></nav></div></header>',
        '  <main class="guide-page"><article class="container guide-layout" id="guide-content">',
        f"    <p class=\"eyebrow\">גרסה נגישה</p><h1>{title}</h1>",
        '    <div class="guide-intro"><p>זוהי גרסת HTML נגישה של המדריך. אפשר לנווט בה באמצעות כותרות, מקלדת וקורא מסך.</p><p class="guide-disclaimer">המידע כללי ואינו תחליף לייעוץ פיננסי, משפטי או מס אישי. ריביות, תקרות והוראות עשויות להשתנות.</p></div>',
        '    <nav class="guide-toc" aria-label="תוכן העניינים"><h2>תוכן העניינים</h2><ol>',
    ]
    for page_no in range(3, 27):
        if pages.get(page_no):
            chunks.append(f'      <li><a href="#chapter-{page_no}">{html.escape(pages[page_no][0])}</a></li>')
    chunks.extend(["    </ol></nav>", '    <div class="guide-content">'])
    for page_no in range(3, 27):
        lines = pages.get(page_no, [])
        if not lines:
            continue
        chunks.append(f'      <section aria-labelledby="chapter-{page_no}">')
        chunks.append("        " + tag("h2", lines[0], id=f"chapter-{page_no}"))
        paragraph: list[str] = []
        for line in lines[1:]:
            if is_subheading(line):
                if paragraph:
                    chunks.append("        " + tag("p", " ".join(paragraph)))
                    paragraph = []
                chunks.append("        " + tag("h3", line))
                continue
            paragraph.append(line)
            if line.endswith((".", "!", "…")):
                chunks.append("        " + tag("p", " ".join(paragraph)))
                paragraph = []
        if paragraph:
            chunks.append("        " + tag("p", " ".join(paragraph)))
        chunks.append("      </section>")
    chunks.extend([
        "    </div>",
        "  </article></main>",
        '  <footer class="site-footer"><div class="container"><a href="index.html">מאיר כהן — תכנון פיננסי</a></div></footer>',
        "</body></html>",
    ])
    OUTPUT.write_text("\n".join(chunks) + "\n", encoding="utf-8")


if __name__ == "__main__":
    build()
