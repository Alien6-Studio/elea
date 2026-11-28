import { useState } from "react";
import {
  Button,
  Dialog,
  Field,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@alien6-studio/elea-ui";

const articles = [
  { title: "Autumn field notes", words: 1240 },
  { title: "Cranes over the valley", words: 860 },
  { title: "A winter herbarium", words: 2105 },
];

export function ArticleWorkspace() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = articles.filter((article) =>
    article.title.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const total = results.reduce((sum, article) => sum + article.words, 0);

  return (
    <section aria-label="Article workspace" data-elea-density="compact">
      <Field label="Filter articles" help="Search by title.">
        {(control) => (
          <Input
            {...control}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        )}
      </Field>
      <Table label="Search results">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Article</TableHeaderCell>
            <TableHeaderCell align="end">Words</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map((article) => (
            <TableRow key={article.title}>
              <TableHeaderCell scope="row">{article.title}</TableHeaderCell>
              <TableCell numeric>{article.words}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={() => setOpen(true)}>Word count</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Word count"
        closeLabel="Close word count"
        actions={<Button onClick={() => setOpen(false)}>Done</Button>}
      >
        {total} words across {results.length} articles.
      </Dialog>
    </section>
  );
}
