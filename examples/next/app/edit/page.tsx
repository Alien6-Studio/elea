import { Editor } from "./Editor";

/** The route is a server component; the editor below it carries the client boundary. */
export default function EditPage() {
  return (
    <>
      <h1 style={{ fontSize: "var(--elea-font-size-3xl)" }}>Edit the article</h1>
      <Editor />
    </>
  );
}
