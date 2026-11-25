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
python -m http.server 4174 --bind 127.0.0.1 --directory .build
```

Open `/elea/` on port 4174. The build installs local archives made from the
specified checkout and compiles the private Next.js fixture in
`playground/tests/fixtures/next` against those archives. To test the generated site, install
Playwright Chromium and run `npm --prefix playground test`.

GitHub Pages uses the GitHub Actions source. A push to `gh-pages` builds and tests
the site, then deploys the resulting static files.
