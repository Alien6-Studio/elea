import { Accordion } from "@alien6-studio/elea-ui";

const questions = [
  {
    value: "publish",
    label: "Who can publish an article?",
    panel: "Editors and owners publish. Writers submit their draft for review.",
  },
  {
    value: "history",
    label: "How long are revisions kept?",
    panel: "Every revision of the last ninety days is kept.",
  },
  {
    value: "export",
    label: "Can I export my articles?",
    panel: "Yes, as Markdown or HTML, one article at a time or all of them.",
  },
];

export function PublishingQuestions() {
  return <Accordion defaultValue={["publish"]} items={questions} />;
}
