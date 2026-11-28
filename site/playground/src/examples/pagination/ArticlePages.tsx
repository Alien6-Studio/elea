import { useState } from "react";
import { Pagination } from "@alien6-studio/elea-ui";

const labels = {
  navigation: "Pagination",
  previous: "Previous page",
  next: "Next page",
  page: "Page {page}",
  summary: "{from}–{to} of {total}",
};

export function ArticlePages() {
  const [page, setPage] = useState(3);

  return (
    <Pagination
      page={page}
      pageCount={12}
      onPageChange={setPage}
      totalItems={115}
      pageSize={10}
      labels={labels}
    />
  );
}
