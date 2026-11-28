# Elea documentation

This branch contains the MkDocs site with its Elea theme and the interactive
playground deployed to GitHub Pages. The design system and its release scripts
live on `main`.

With Node 24 and Python 3.12, install the dependencies in an Elea source
checkout, then build the site from this branch.

```sh
npm --prefix /path/to/elea ci
python -m pip install -r requirements.txt
scripts/build.sh /path/to/elea
python -m http.server 4174 --bind 127.0.0.1 --directory .build/elea
```

Open port 4174. The build installs local archives made from the
specified checkout and compiles the private Next.js fixture in
`playground/tests/fixtures/next` against those archives. The Interaction Observatory uses the independent
Observe archive, so the paired source checkout must include `packages/observe`.

## Browser checks

Run `scripts/browser-check.sh` after building the site. CI uses the same pinned
Playwright Linux AMD64 image. Chromium runs the complete suite. Firefox and
WebKit also exercise the keyboard stepper, searchable multi-select, calendar
field, dialog motion and theme qualification.

The visual project compares four reference PNGs covering Réserve and Rasance
buttons, a focused invalid field and the current step on a phone, in light and
dark appearances. Inspect the expected, actual and difference images in the
Playwright HTML report on failure. For an intentional design change, generate
the candidate images in the pinned environment, inspect the changed PNGs and
include them in the review with the source change.

```sh
scripts/browser-check.sh --project=visual
scripts/browser-check.sh --project=visual --update-snapshots=all
```

For native browser interactions, install the three Playwright browsers in
`playground` and run `npm --prefix playground test`. To test an already served
build, set `ELEA_TEST_URL` to its origin, for example `http://127.0.0.1:4310`.

Pull requests targeting `gh-pages` run these checks against the proposed site.
A push to `gh-pages` deploys the checked static files through GitHub Actions.
