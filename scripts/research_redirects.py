"""Keep earlier research and laboratory URLs usable."""
from pathlib import Path


def redirect(directory, target, title, label):
    directory.mkdir(parents=True, exist_ok=True)
    (directory / "index.html").write_text(
        f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>{title} · Elea</title>
<meta name="robots" content="noindex"><link rel="canonical" href="{target}">
<script>location.replace("{target}" + location.search + location.hash)</script>
<noscript><meta http-equiv="refresh" content="0;url={target}"></noscript></head>
<body><a href="{target}">{label}</a></body></html>
''', encoding="utf-8")


def on_post_build(*, config):
    site = Path(config.site_dir)
    for old_slug in ("layout-grids", "composition"):
        for part in ("", "atlas/", "laboratory/"):
            directory = site / "research" / old_slug / part
            target = ("../../" if part else "../") + "composition-of-interfaces/" + part
            redirect(directory, target, "Composition of interfaces", "Read Composition of interfaces")
    redirect(site / "observatory", "../research/interaction-observatory/laboratory/",
             "Interaction Observatory", "Open the Interaction laboratory")
