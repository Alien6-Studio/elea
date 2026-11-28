import { SearchField } from "@alien6-studio/elea-ui";

export function ArticleSearch() {
  return (
    <SearchField
      label="Search articles"
      clearLabel="Clear article search"
      name="q"
    />
  );
}
