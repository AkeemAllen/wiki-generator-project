import { Button, Grid, Select } from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useLocalStorage } from "usehooks-ts";
import { useEditWikiSettings } from "../apis/wikiApis";
import { PokemonVersions } from "../types";

const Settings = () => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  const [wikiList, __] = useLocalStorage("wikiList", {});
  const [versionGroup, setVersionGroup] = useInputState<string>(
    wikiList[currentWiki]?.settings?.version_group
  );

  const { mutate, isLoading } = useEditWikiSettings((data: any) => {
    notifications.show({ message: data.message });
  });
  return (
    <Grid>
      <Grid.Col>
        <Select
          label="Version Group"
          onChange={setVersionGroup}
          value={versionGroup}
          data={(
            Object.keys(PokemonVersions) as (keyof typeof PokemonVersions)[]
          ).map((key, index) => {
            return PokemonVersions[key];
          })}
        />
      </Grid.Col>
      <Grid.Col>
        <Button
          onClick={() =>
            mutate({
              wikiName: currentWiki,
              settings: { version_group: versionGroup },
            })
          }
          loading={isLoading}
        >
          Save
        </Button>
      </Grid.Col>
    </Grid>
  );
};

export default Settings;
