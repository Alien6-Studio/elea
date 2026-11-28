import { useState } from "react";
import { Pagination } from "@alien6-studio/elea-ui";

const labels = {
  navigation: "Pagination",
  previous: "Previous",
  next: "Next",
  page: "Page {page}",
};

export function PageLabels() {
  const [page, setPage] = useState(3);

  return (
    <Pagination
      showLabels
      page={page}
      pageCount={12}
      onPageChange={setPage}
      labels={labels}
    />
  );
}
