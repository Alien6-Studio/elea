import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Hero } from "./Hero.js";

afterEach(cleanup);

test("each server-rendered hero takes its accessible name from its own heading", () => {
  const markup = renderToStaticMarkup(<>
    <Hero heading="Field notes" />
    <Hero heading={<>Glacier <em>study</em></>} headingLevel="h2" />
  </>);
  const page = document.createElement("main");
  page.innerHTML = markup;
  const [lead, feature] = within(page).getAllByRole("region");
  assert.ok(lead && feature);
  const leadHeading = within(lead).getByRole("heading", { name: "Field notes", level: 1 });
  const featureHeading = within(feature).getByRole("heading", { name: "Glacier study", level: 2 });
  assert.equal(lead.getAttribute("aria-labelledby"), leadHeading.id);
  assert.equal(feature.getAttribute("aria-labelledby"), featureHeading.id);
  assert.notEqual(leadHeading.id, featureHeading.id);
  assert.equal(lead.querySelector(".elea-hero__actions, .elea-hero__media"), null);
});

test("the split hero keeps rich content and actions accessible in reading order", () => {
  const section = createRef<HTMLElement>();
  let saved = false;
  render(<Hero
    ref={section} className="cover" title="Publication cover" heading="Ice field" layout="split"
    eyebrow="Expedition" description={<p>Notes from the valley.</p>}
    actions={<button onClick={() => { saved = true; }}>Save notes</button>}
    media={<figure><img src="/glacier.jpg" alt="Blue ice on a glacier" /><figcaption>November</figcaption></figure>}
  />);
  const region = screen.getByRole("region", { name: "Ice field" });
  assert.equal(section.current, region);
  assert.ok(region.classList.contains("cover") && region.classList.contains("elea-hero--split"));
  assert.equal(region.title, "Publication cover");
  assert.ok(within(region).getByText("Expedition"));
  assert.ok(within(region).getByText("Notes from the valley."));
  const action = within(region).getByRole("button", { name: "Save notes" });
  const picture = within(region).getByRole("img", { name: "Blue ice on a glacier" });
  assert.ok(action.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_FOLLOWING);
  fireEvent.click(action);
  assert.equal(saved, true);
});

test("hosts can name the section and conditionally omit the media column", () => {
  const { rerender } = render(<Hero heading="Ice field" layout="split" media={false} aria-label="Featured notebook" />);
  const region = screen.getByRole("region", { name: "Featured notebook" });
  assert.equal(region.classList.contains("elea-hero--split"), false);
  assert.equal(region.querySelector(".elea-hero__media"), null);
  rerender(<>
    <span id="notebook-label">Current notebook</span>
    <Hero heading="Ice field" aria-labelledby="notebook-label" media={<img src="/ice.jpg" alt="" />} />
  </>);
  const stacked = screen.getByRole("region", { name: "Current notebook" });
  assert.equal(stacked.classList.contains("elea-hero--split"), false);
  assert.ok(stacked.querySelector(".elea-hero__media"));
});

test("photographic covers support art direction and retain an accessible heading and credit", () => {
  const { rerender } = render(<Hero heading="Coastal survey" layout="cover" image={{
    src: "/coast.jpg", width: 1200, height: 600, alt: "Chalk cliffs seen from the sea",
    sources: [{ media: "(max-width: 36rem)", srcSet: "/cliffs.jpg", width: 400, height: 480 }],
  }} description={<a href="/credits">Photograph by L. Vale</a>} />);
  const section = screen.getByRole("region", { name: "Coastal survey" });
  assert.ok(section.classList.contains("elea-hero--cover"));
  const image = within(section).getByRole("img", { name: "Chalk cliffs seen from the sea" });
  assert.equal(image.closest("picture")?.querySelector("source")?.getAttribute("srcset"), "/cliffs.jpg");
  assert.ok(within(section).getByRole("link", { name: "Photograph by L. Vale" }));
  rerender(<Hero heading="Coastal survey" layout="cover" media={<button>Play recording</button>} />);
  assert.equal(section.classList.contains("elea-hero--cover"), false);
  assert.ok(within(section).getByRole("button", { name: "Play recording" }));
});

test("placing split media on the leading side keeps copy first in document order", () => {
  render(<Hero heading="Tidal lines" layout="split" mediaPosition="start" image={{ src: "/tide.jpg", alt: "Low tide" }} />);
  const section = screen.getByRole("region", { name: "Tidal lines" });
  assert.ok(section.classList.contains("elea-hero--media-start"));
  assert.ok(within(section).getByRole("heading").compareDocumentPosition(within(section).getByRole("img")) & Node.DOCUMENT_POSITION_FOLLOWING);
});
