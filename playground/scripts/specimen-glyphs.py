"""Extract the typography plate's real outlines and handles from ELEA Sans Regular."""
import argparse
import json
from pathlib import Path
from string import ascii_letters, digits
from unicodedata import category, name

from fontTools.pens.areaPen import AreaPen
from fontTools.pens.basePen import BasePen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.recordingPen import DecomposingRecordingPen, replayRecording
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont


class Quadratics(BasePen):
    """Expose the on-curve midpoints implied by consecutive TrueType controls."""
    def __init__(self, glyphs):
        super().__init__(glyphs)
        self.segments = []

    def _moveTo(self, point):
        pass

    def _lineTo(self, point):
        pass

    def _qCurveToOne(self, control, end):
        start = self._getCurrentPoint()
        arm_x, arm_y = control[0] - start[0], control[1] - start[1]
        chord_x, chord_y = end[0] - start[0], end[1] - start[1]
        if arm_x * chord_y != arm_y * chord_x:
            self.segments.append((start, control, end))


def representative_curve(glyphs, commands):
    # Use the largest clockwise, curved contour: leave counters and detached accents
    # out when the body offers its own curve. Pick a segment on the outlined side.
    candidates = []
    start = 0
    for i, (op, _) in enumerate(commands):
        if op != "closePath":
            continue
        contour = commands[start:i + 1]
        start = i + 1
        area, bounds, curves = AreaPen(glyphs), BoundsPen(glyphs), Quadratics(glyphs)
        for pen in (area, bounds, curves):
            replayRecording(contour, pen)
        if area.value >= 0 or not curves.segments:
            continue
        left, bottom, right, top = bounds.bounds

        def score(segment):
            # Evaluate the actual midpoint on the quadratic, not its control handle.
            p, c, q = segment
            x, y = ((p[k] + 2*c[k] + q[k]) / 4 for k in range(2))
            return ((x - left)/(right - left) - .88)**2 + ((y - bottom)/(top - bottom) - .78)**2

        candidates.append((-area.value, right, min(curves.segments, key=score)))
    # Equal-size detached contours can be the two dots of a diaeresis.
    return max(candidates, key=lambda candidate: candidate[:2])[2] if candidates else None


def number(value):
    return int(value) if value == int(value) else value


def extract(font):
    glyphs = font.getGlyphSet(location={"wght": 400}) if "fvar" in font else font.getGlyphSet()
    cmap = font.getBestCmap()
    extra = [chr(cp) for cp in sorted(cmap) if chr(cp) not in ascii_letters
             and category(chr(cp)).startswith("L") and "LATIN" in name(chr(cp), "")]
    entries = []
    signs = [chr(cp) for cp in sorted(cmap) if category(chr(cp))[0] in {"P", "S"}]
    for letter in [*ascii_letters, *extra, *digits, *signs]:
        glyph = glyphs[cmap[ord(letter)]]
        outline = DecomposingRecordingPen(glyphs)
        glyph.draw(outline)
        bounds, svg = BoundsPen(glyphs), SVGPathPen(glyphs, ntos=lambda value: str(number(value)))
        outline.replay(bounds)
        outline.replay(svg)
        curve = representative_curve(glyphs, outline.value)
        fields = {
            "d": svg.getCommands(),
            "advance": number(glyph.width),
            "bounds": [number(value) for value in bounds.bounds],
            "curve": [[number(x), number(y)] for x, y in curve] if curve else None,
        }
        # Keep the four fields legible in a generated file without splitting coordinate pairs.
        lines = [f'    "{key}": {json.dumps(value, ensure_ascii=False)}' for key, value in fields.items()]
        key = json.dumps(letter, ensure_ascii=False)
        entries.append(f'  {key}: {{\n' + ",\n".join(lines) + "\n  }")
    return "{\n" + ",\n".join(entries) + "\n}\n"


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("font", type=Path, help="The local Regular TTF or upright variable font")
    parser.add_argument("output", type=Path, nargs="?", default=Path(__file__).resolve().parents[1] / "src/data/specimen-glyphs.json")
    args = parser.parse_args()
    with TTFont(args.font) as font:
        args.output.write_text(extract(font), encoding="utf-8")
