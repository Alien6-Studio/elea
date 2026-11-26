import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ResponsiveImage } from "./ResponsiveImage.js";
import { Card, CardImage } from "./Card.js";

afterEach(cleanup);

test("a single source keeps the native img target and browser loading defaults", () => {
  const ref = createRef<HTMLImageElement>();
  let loaded = false;
  render(<ResponsiveImage ref={ref} src="/survey.jpg" alt="Raised shoreline" width={960} height={640}
    className="survey" id="plate" srcSet="/survey.jpg 960w, /survey-large.jpg 1920w" sizes="50vw" onLoad={() => { loaded = true; }} />);
  const image = screen.getByRole("img", { name: "Raised shoreline" });
  assert.equal(ref.current, image);
  assert.equal(image.id, "plate");
  assert.ok(image.classList.contains("survey"));
  assert.equal(image.getAttribute("width"), "960");
  assert.equal(image.getAttribute("height"), "640");
  assert.equal(image.getAttribute("sizes"), "50vw");
  assert.equal(image.getAttribute("srcset"), "/survey.jpg 960w, /survey-large.jpg 1920w");
  assert.equal(image.closest("picture"), null);
  assert.equal(image.getAttribute("loading"), null);
  assert.equal(image.getAttribute("fetchpriority"), null);
  fireEvent.load(image);
  assert.ok(loaded);
});

test("art-directed sources precede the server-rendered fallback in declared order", () => {
  const root = document.createElement("div");
  root.innerHTML = renderToStaticMarkup(<ResponsiveImage src="/shore.jpg" alt="" loading="eager" fetchPriority="high"
    sources={[
      { media: "(max-width: 40rem)", type: "image/avif", srcSet: "/detail.avif 400w", sizes: "100vw", width: 400, height: 600 },
      { type: "image/webp", srcSet: "/shore.webp" },
    ]} />);
  const picture = root.querySelector("picture")!;
  const [detail, wider, fallback] = picture.children;
  assert.deepEqual(Array.from(picture.children, el => el.tagName), ["SOURCE", "SOURCE", "IMG"]);
  assert.equal(detail?.getAttribute("media"), "(max-width: 40rem)");
  assert.equal(detail?.getAttribute("width"), "400");
  assert.equal(detail?.getAttribute("height"), "600");
  assert.equal(detail?.getAttribute("sizes"), "100vw");
  assert.equal(wider?.getAttribute("srcset"), "/shore.webp");
  assert.equal(fallback?.getAttribute("alt"), "");
  assert.equal(fallback?.getAttribute("fetchpriority"), "high");
  assert.equal(fallback?.getAttribute("loading"), "eager");
});

test("CardImage keeps its native target and existing class when opting into art direction", () => {
  const ref = createRef<HTMLImageElement>();
  render(<Card><CardImage ref={ref} alt="Surface detail" src="/ice.jpg" className="plate"
    sources={[{ srcSet: "/detail.webp", media: "(max-width: 36rem)" }]} /></Card>);
  assert.equal(screen.getByRole("img", { name: "Surface detail" }), ref.current);
  assert.equal(ref.current?.className, "elea-card__image plate");
  assert.equal(ref.current?.parentElement?.tagName, "PICTURE");
});
