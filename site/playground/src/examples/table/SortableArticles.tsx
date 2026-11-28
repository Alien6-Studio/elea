import { useState } from "react";
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  type TableSort,
} from "@alien6-studio/elea-ui";

type Column = "title" | "words" | "readers";
type Direction = Exclude<TableSort, "none">;

const articles = [
  {
    title: "Autumn field notes",
    status: "Published",
    words: 1240,
    readers: 3812,
  },
  {
    title: "Cranes over the valley",
    status: "In review",
    words: 860,
    readers: 0,
  },
  {
    title: "A winter herbarium",
    status: "Draft",
    words: 2105,
    readers: 0,
  },
];

export function SortableArticles() {
  const [column, setColumn] = useState<Column>("words");
  const [direction, setDirection] = useState<Direction>("descending");

  const sorted = [...articles].sort((a, b) => {
    const result =
      column === "title"
        ? a.title.localeCompare(b.title)
        : a[column] - b[column];
    return direction === "ascending" ? result : -result;
  });

  const sortBy = (name: Column) => ({
    sort: column === name ? direction : ("none" as const),
    onSort: () => {
      const ascending = column === name && direction === "ascending";
      setColumn(name);
      setDirection(ascending ? "descending" : "ascending");
    },
  });

  return (
    <Table label="Articles" hoverable>
      <TableHead>
        <TableRow>
          <TableHeaderCell {...sortBy("title")}>Article</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell align="end" {...sortBy("words")}>
            Words
          </TableHeaderCell>
          <TableHeaderCell align="end" {...sortBy("readers")}>
            Readers
          </TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sorted.map((article) => (
          <TableRow key={article.title}>
            <TableHeaderCell scope="row">{article.title}</TableHeaderCell>
            <TableCell>
              <Badge variant="subtle">{article.status}</Badge>
            </TableCell>
            <TableCell numeric>{article.words}</TableCell>
            <TableCell numeric>{article.readers}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
