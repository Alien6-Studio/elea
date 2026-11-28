import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@alien6-studio/elea-ui";

// In the stylesheet of the application:
//
// .revisions {
//   max-block-size: 14rem;
// }

const editors = ["Ada Lovelace", "Grace Hopper", "Alan Turing"];
const revisions = Array.from({ length: 14 }, (_, index) => ({
  number: 14 - index,
  editor: editors[index % editors.length],
  words: 2105 - index * 37,
}));

export function RevisionHistory() {
  return (
    <Table label="Revisions" stickyHeader density="sm" className="revisions">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Revision</TableHeaderCell>
          <TableHeaderCell>Editor</TableHeaderCell>
          <TableHeaderCell align="end">Words</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {revisions.map((revision) => (
          <TableRow key={revision.number}>
            <TableHeaderCell scope="row">
              Revision {revision.number}
            </TableHeaderCell>
            <TableCell>{revision.editor}</TableCell>
            <TableCell numeric>{revision.words}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
