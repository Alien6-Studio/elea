"""Bundle the site's ELEA Sans faces with their installable counterparts."""
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo


def on_post_build(*, config):
    assets = Path(config.site_dir) / "assets"
    files = (
        assets / "ELEASans-Variable.ttf",
        assets / "ELEASans-Italic-Variable.ttf",
        assets / "fonts/ELEASans-Variable.woff2",
        assets / "fonts/ELEASans-Italic-Variable.woff2",
        assets / "fonts/elea-sans.css",
        Path(config.config_file_path).parent.parent / "LICENSE",
    )
    with ZipFile(assets / "ELEA-Sans.zip", "w") as archive:
        for file in files:
            entry = ZipInfo(file.name)
            entry.external_attr = 0o100644 << 16
            archive.writestr(entry, file.read_bytes(), compress_type=ZIP_DEFLATED)
