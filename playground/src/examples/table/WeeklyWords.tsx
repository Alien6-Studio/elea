import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFoot,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@alien6-studio/elea-ui";

const articles = [
  { author: "Ada Lovelace", title: "Autumn field notes", words: 1240 },
  { author: "Grace Hopper", title: "Cranes over the valley", words: 860 },
  { author: "Alan Turing", title: "A winter herbarium", words: 2105 },
];
const selected = "Cranes over the valley";
const total = articles.reduce((sum, article) => sum + article.words, 0);

export function WeeklyWords() {
  return (
    <Table density="sm" striped>
      <TableCaption>Words written this week</TableCaption>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Author</TableHeaderCell>
          <TableHeaderCell>Article</TableHeaderCell>
          <TableHeaderCell align="end">Words</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {articles.map((article) => (
          <TableRow key={article.title} selected={article.title === selected}>
            <TableHeaderCell scope="row">{article.author}</TableHeaderCell>
            <TableCell>{article.title}</TableCell>
            <TableCell numeric>{article.words}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFoot>
        <TableRow>
          <TableHeaderCell scope="row" colSpan={2}>
            Total
          </TableHeaderCell>
          <TableCell numeric>{total}</TableCell>
        </TableRow>
      </TableFoot>
    </Table>
  );
}
