"""Render Markdown tables with the ELEA table styles."""
import re
from html import escape, unescape

BARE_TABLE = re.compile(r"<table>(.*?)</table>", re.DOTALL)
HEADING = re.compile(r"<th[^>]*>(.*?)</th>", re.DOTALL)
TAG = re.compile(r"<[^>]+>")


def scrolling_region(match):
    """Name the region after its column headings, so the keyboard can reach a table that scrolls."""
    headings = (unescape(TAG.sub("", heading)).strip() for heading in HEADING.findall(match.group(1)))
    label = escape(", ".join(filter(None, headings)), quote=True)
    region = f' role="region" aria-label="{label}" tabindex="0"' if label else ""
    return f'<div class="elea-table"{region}><table>{match.group(1)}</table></div>'


def on_page_content(html, **_):
    return BARE_TABLE.sub(scrolling_region, html)
