import {
  Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Checkbox,
  Dialog, Field, IconButton, Input, Select, Table, TableBody, TableCell, TableHead,
  TableHeaderCell, TableRow, Tabs, Textarea, Toggle, type TabPresentation,
} from "@alien6-studio/elea-ui";
import { useState } from "react";
import "./component-studies.css";

const records = [
  { id: "A-14", name: "Intake workflow", owner: "Design", state: "In review" },
  { id: "A-09", name: "Retention policy", owner: "Legal", state: "Ready" },
  { id: "A-03", name: "Release checklist", owner: "Product", state: "Draft" },
] as const;

type Draft = { title: string; owner: string; note: string };
const draftKey = "elea.design-lab.component-studies";

function readDrafts(): Record<string, Draft> {
  try {
    const stored = JSON.parse(sessionStorage.getItem(draftKey) ?? "{}");
    return Object.fromEntries(records.flatMap(({ id }) => {
      const draft = stored?.[id];
      return typeof draft?.title === "string" && typeof draft.owner === "string" && typeof draft.note === "string"
        ? [[id, draft]] : [];
    }));
  } catch {
    return {};
  }
}

const owners = ["Design", "Legal", "Product"].map(value => ({ label: value, value }));

function ResetIcon() {
  return <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 8a6 6 0 1 1 1.2 6.1M4 3.5v5h5" />
  </svg>;
}

export function ComponentStudies({ theme, presentation, siteIdentity, identityHref }: {
  theme: string;
  presentation: TabPresentation;
  siteIdentity: boolean;
  identityHref: string;
}) {
  const [activeId, setActiveId] = useState<string>(records[0].id);
  const [saved, setSaved] = useState(readDrafts);
  const [edits, setEdits] = useState(saved);
  const active = records.find(record => record.id === activeId) ?? records[0];
  const values = edits[active.id] ?? { title: active.name, owner: active.owner, note: "" };
  const [attachment, setAttachment] = useState(true);
  const [notify, setNotify] = useState(false);
  const [sort, setSort] = useState<"ascending" | "descending">("descending");
  const [open, setOpen] = useState(false);
  const [message, announce] = useState("");
  const ordered = sort === "ascending" ? [...records].reverse() : records;
  const close = () => setOpen(false);

  function update(change: Partial<typeof values>) {
    setEdits(current => ({ ...current, [active.id]: { ...values, ...change } }));
    announce("");
  }

  function reset() {
    setEdits(current => {
      const next = { ...current };
      const draft = saved[active.id];
      if (draft) next[active.id] = draft;
      else delete next[active.id];
      return next;
    });
    setAttachment(true);
    setNotify(false);
    announce("Draft reset.");
  }

  function saveDraft() {
    const next = { ...saved, [active.id]: values };
    setSaved(next);
    try {
      sessionStorage.setItem(draftKey, JSON.stringify(next));
      announce("Draft saved for this tab.");
    } catch {
      announce("Draft saved in this view.");
    }
  }

  return <section className="component-study" data-elea-theme={theme} aria-labelledby="component-study-title">
    <div className="component-study-inner">
      <header className="component-study-head">
        <h1 id="component-study-title">Component Studies</h1>
        <Button href={identityHref} variant="outline" size="sm">
          {siteIdentity ? "Use direction colors and type" : "Use site colors and type"}
        </Button>
      </header>
      {siteIdentity && <p className="component-study-mode">Comparing control treatments with the site’s colors, type and appearance.</p>}
      <div className="component-study-grid">
        <section className="component-study-panel" aria-labelledby="study-actions">
          <h2 id="study-actions">Actions</h2>
          <div className="component-study-actions">
            <Button onClick={() => setOpen(true)} disabled={!values.title.trim()}>Review changes</Button>
            <Button variant="outline" onClick={saveDraft} disabled={!values.title.trim()}>Save draft</Button>
            <IconButton label="Reset draft" title="Reset draft" variant="outline" onClick={reset}><ResetIcon /></IconButton>
          </div>
          <p className="component-study-status" role="status">{message}</p>
          <h2>Selection</h2>
          <Tabs className="component-study-tabs" label="Review view" presentation={presentation} items={[
            { value: "summary", label: "Summary", panel: <p>Current revision is ready for a second pass.</p> },
            { value: "activity", label: "Activity", panel: <p>The document was assigned to {values.owner}.</p> },
            { value: "archive", label: "Archive", panel: null, disabled: true },
          ]} />
          <div className="component-study-options">
            <Checkbox label="Include attachments" checked={attachment} onCheckedChange={setAttachment} />
            <Toggle label="Notify reviewers" checked={notify} onCheckedChange={setNotify} />
          </div>
        </section>
        <section className="component-study-panel" aria-labelledby="study-fields">
          <h2 id="study-fields">Fields</h2>
          <div className="component-study-fields">
            <Field label="Document title" required error={!values.title.trim() ? "Enter a title." : undefined}>
              {control => <Input {...control} value={values.title} onChange={event => update({ title: event.currentTarget.value })} />}
            </Field>
            <div className="component-study-select">
              <span id="study-reviewer">Reviewer</span>
              <Select labelledBy="study-reviewer" value={values.owner} options={owners} onChange={owner => update({ owner })} />
            </div>
          </div>
          <Field label="Review note">
            {control => <Textarea {...control} rows={3} placeholder="Add a note for the next reviewer…" value={values.note}
              onChange={event => update({ note: event.currentTarget.value })} />}
          </Field>
        </section>
        <section className="component-study-panel" aria-labelledby="study-surface">
          <h2 id="study-surface">Surface &amp; dialog</h2>
          <Card className="component-study-card">
            <CardHeader><CardTitle as="h3">{values.title.trim() || "Untitled document"}</CardTitle>
              <CardDescription>Assigned to {values.owner}</CardDescription></CardHeader>
            <CardContent><p>{values.note.trim() || "Confirm the review details before sending this revision."}</p></CardContent>
            <CardFooter className="component-study-card-actions"><Button size="sm" variant="outline" onClick={() => setOpen(true)} disabled={!values.title.trim()}>Open review</Button></CardFooter>
          </Card>
        </section>
        <section className="component-study-panel" aria-labelledby="study-table">
          <h2 id="study-table">Review queue</h2>
          <Table label="Review queue" density="sm" hoverable>
            <TableHead><TableRow>
              <TableHeaderCell sort={sort} onSort={() => setSort(sort === "ascending" ? "descending" : "ascending")}>Ref</TableHeaderCell>
              <TableHeaderCell>Document</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell>
            </TableRow></TableHead>
            <TableBody>{ordered.map(record => <TableRow key={record.id} selected={activeId === record.id}>
              <TableCell className="component-study-ref">{record.id}</TableCell>
              <TableHeaderCell scope="row"><Button variant="ghost" size="sm" className="component-study-row-action" aria-pressed={activeId === record.id}
                onClick={() => { setActiveId(record.id); announce(""); }}>{edits[record.id]?.title.trim() || record.name}</Button></TableHeaderCell>
              <TableCell>{record.state}</TableCell>
            </TableRow>)}</TableBody>
          </Table>
        </section>
      </div>
      <Dialog open={open} size="sm" title="Confirm review" description={values.title} onClose={close} closeLabel="Close review"
        actions={<><Button variant="outline" onClick={close}>Cancel</Button>
          <Button onClick={() => { announce("Review confirmed."); close(); }}>Confirm</Button></>}>
        <dl className="component-study-summary">
          <div><dt>Reviewer</dt><dd>{values.owner}</dd></div>
          <div><dt>Attachments</dt><dd>{attachment ? "Included" : "Excluded"}</dd></div>
          <div><dt>Notifications</dt><dd>{notify ? "On" : "Off"}</dd></div>
        </dl>
      </Dialog>
    </div>
  </section>;
}
