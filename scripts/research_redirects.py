"""Keep the original study links pointing to Composition of interfaces."""
from pathlib import Path


def on_post_build(*, config):
    research = Path(config.site_dir) / "research"
    for old_slug in ("layout-grids", "composition"):
        for part in ("", "atlas/", "laboratory/"):
            directory = research / old_slug / part
            directory.mkdir(parents=True, exist_ok=True)
            target = ("../../" if part else "../") + "composition-of-interfaces/" + part
            (directory / "index.html").write_text(
                f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Composition of interfaces · Elea</title>
<meta name="robots" content="noindex"><link rel="canonical" href="{target}">
<script>location.replace("{target}" + location.search + location.hash)</script>
<noscript><meta http-equiv="refresh" content="0;url={target}"></noscript></head>
<body><a href="{target}">Read Composition of interfaces</a></body></html>
''', encoding="utf-8")
