import {
  Badge,
  Tab,
  TabList,
  TabPanel,
  TabsRoot,
} from "@alien6-studio/elea-ui";

export function CommentsRail() {
  return (
    <TabsRoot defaultValue="open">
      <TabList label="Comments" presentation="rail">
        <Tab value="open">
          Open{" "}
          <Badge tone="primary" variant="subtle">
            3
          </Badge>
        </Tab>
        <Tab value="resolved">
          Resolved <Badge variant="subtle">12</Badge>
        </Tab>
      </TabList>
      <p>
        <strong>Comments on “Field notes”</strong>
      </p>
      <TabPanel value="open">Three comments wait for an answer.</TabPanel>
      <TabPanel value="resolved">
        Twelve comments were resolved this month.
      </TabPanel>
    </TabsRoot>
  );
}
