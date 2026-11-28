"""Insert the figures rendered from the paired ELEA package into the study and atlas."""
from pathlib import Path


def on_page_content(html, *, page, config, **_):
    names = {
        "research/interaction-observatory.md": ("exposure", "outcomes"),
        "research/interaction-observatory/atlas.md": ("slot", "timestamp", "dwell", "contrast"),
    }.get(page.file.src_uri)
    if names is None:
        return html

    figures = Path(config.config_file_path).parent / ".build" / "observatory-figures"
    for name in names:
        marker = f"<!-- elea-observatory:{name} -->"
        if html.count(marker) != 1:
            raise ValueError(f"Expected one Observatory figure marker for {name}")
        html = html.replace(marker, (figures / f"{name}.html").read_text(encoding="utf-8"))
    return html
