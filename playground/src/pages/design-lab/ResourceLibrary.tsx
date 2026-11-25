import { ContentView } from "@alien6-studio/elea-content-viewer";
import "@alien6-studio/elea-content-viewer/styles.css";
import {
  Button, Card, CardDescription, CardFooter, CardHeader, CardTitle, Dialog,
  Field, Input, Pagination, Select, Tooltip,
} from "@alien6-studio/elea-ui";
import { useState } from "react";
import { sitePath } from "../../links.js";
import "./resource-library.css";

const resources = [
  { title: "Reading a changing glacier", kind: "Report", summary: "A season of observations from the edge of the ice.", note: "Repeat each observation from the same point. Include the time of day and conditions so a later reader can compare what changed with what was simply lit differently." },
  { title: "Choosing a repeat viewpoint", kind: "Method", summary: "Make field photographs comparable across visits.", note: "Choose a place that can be reached again. Record a simple landmark, the direction of the camera and one object that gives the photograph scale." },
  { title: "A notebook for the return visit", kind: "Guide", summary: "A structure for notes that another reader can use.", note: "Begin with the place and conditions. Record what you observed before adding an interpretation. End with one question to take back to the field." },
  { title: "Recording the snow line", kind: "Method", summary: "Describe a boundary that shifts with the weather.", note: "Record a clear view of the boundary at several points. Keep the uncertainties visible when conditions obscure part of the slope." },
  { title: "Notes from the lower valley", kind: "Report", summary: "Observations from a walk below the survey area.", note: "Group related observations by location. Keep the sequence of the walk in the captions so a reader can reconstruct the route." },
  { title: "Preparing a shared image set", kind: "Guide", summary: "Select, describe and order photographs for review.", note: "Choose the smallest set that tells the story. Give each photograph a caption with a location and an observation." },
  { title: "Comparing two survey dates", kind: "Method", summary: "Pair photographs and separate change from uncertainty.", note: "Put each pair side by side before making an interpretation. Note differences in lighting and position alongside differences in the landscape." },
];

type Resource = (typeof resources)[number];

const treatments = [{ value: "current", label: "Default composition" }, { value: "proposal", label: "Proposal" }] as const;
const appearances = [{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }] as const;
const categories = [
  { value: "all", label: "All types" },
  { value: "Report", label: "Reports" },
  { value: "Method", label: "Methods" },
  { value: "Guide", label: "Guides" },
];
const paginationLabels = { navigation: "Resource pages", previous: "Previous", next: "Next", page: "Page {page}" };
const pageSize = 3;

export default function ResourceLibrary() {
  const [treatment, setTreatment] = useState<"current" | "proposal">("proposal");
  const [appearance, setAppearance] = useState<"light" | "dark">("light");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [reading, setReading] = useState<Resource | null>(null);

  const needle = query.trim().toLowerCase();
  const results = resources.filter(({ title, kind, summary }) =>
    (category === "all" || category === kind) && (title + " " + summary).toLowerCase().includes(needle),
  );
  const visible = results.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section className="resource-study" data-elea-theme="editorial" data-elea-appearance={appearance} data-treatment={treatment}>
      <div className="resource-study__frame">
        <div className="resource-study__bar">
          <a href="#/design-lab">Component Studies</a>
          <div className="resource-study__settings">
            <div className="resource-study__treatments" role="group" aria-label="Treatment">
              {treatments.map(({ value, label }) => (
                <Button key={value} size="sm" variant={value === treatment ? "primary" : "ghost"}
                  aria-pressed={value === treatment} onClick={() => setTreatment(value)}>{label}</Button>
              ))}
            </div>
            <Select label="Appearance" size="sm" value={appearance} options={appearances}
              onChange={(value) => setAppearance(value === "dark" ? "dark" : "light")} />
          </div>
        </div>

        <header className="resource-study__hero">
          <div>
            <h1>Field library</h1>
            <p>Reports, methods and guides for reading a changing landscape.</p>
          </div>
          <figure>
            <img src={sitePath + "assets/glacier.webp"} alt="Aerial view of blue crevasses in a glacier" />
            <figcaption>Aerial study of a glacier</figcaption>
          </figure>
        </header>

        <section className="resource-study__browse" aria-label="Browse resources">
          <div className="resource-study__filters">
            <Field label="Find a resource">{(control) => (
              <Input {...control} type="search" value={query} onChange={(event) => { setQuery(event.currentTarget.value); setPage(1); }} />
            )}</Field>
            <Field label="Resource type">{({ id }) => (
              <Select id={id} value={category} options={categories}
                onChange={(value) => { setCategory(value ?? "all"); setPage(1); }} />
            )}</Field>
          </div>
          <p className="resource-study__count" role="status">{results.length} {results.length === 1 ? "resource" : "resources"}</p>
          {visible.length ? (
            <ul className="resource-study__results">
              {visible.map((resource) => (
                <li key={resource.title}>
                  <Card className="resource-study__resource">
                    <CardHeader className="resource-study__resource-copy">
                      <p className="resource-study__kind">{resource.kind}</p>
                      <CardTitle as="h2">{resource.title}</CardTitle>
                      <CardDescription>{resource.summary}</CardDescription>
                    </CardHeader>
                    <CardFooter className="resource-study__action">
                      <Tooltip content="Read without leaving the library">
                        <Button size="sm" variant="outline" aria-label={"Read resource, " + resource.title} onClick={() => setReading(resource)}>
                          Read resource
                        </Button>
                      </Tooltip>
                    </CardFooter>
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            <div className="resource-study__empty">
              <p>No matching resources.</p>
              <Button size="sm" variant="outline" onClick={() => { setQuery(""); setCategory("all"); setPage(1); }}>Clear filters</Button>
            </div>
          )}
          <Pagination page={page} pageCount={Math.ceil(results.length / pageSize)} onPageChange={setPage} labels={paginationLabels} showLabels />
        </section>
      </div>

      <Dialog open={reading !== null} title={reading?.title} description={reading?.kind} size="md"
        className="resource-study__reading" onClose={() => setReading(null)} closeLabel="Close resource"
        actions={<Button variant="outline" onClick={() => setReading(null)}>Back to resources</Button>}>
        {reading && <ContentView typography="inherit" data={{ blocks: [
          { type: "paragraph", data: { text: reading.summary } },
          { type: "paragraph", data: { text: reading.note } },
        ] }} />}
      </Dialog>
    </section>
  );
}
