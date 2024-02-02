import { Button, Grid, NativeSelect, Select, TextInput } from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useLocalStorage } from "usehooks-ts";
import { useEditWikiSettings } from "../apis/wikiApis";
import { PokemonVersions, Wikis } from "../types";

const Settings = () => {
  const [currentWiki, _] = useLocalStorage<string>("currentWiki", "none");
  const [wikiList, setWikiList] = useLocalStorage<Wikis>("wikiList", {});
  const [versionGroup, setVersionGroup] = useInputState<string>(
    wikiList[currentWiki].settings.version_group
  );
  const [deploymentUrl, setDeploymentUrl] = useInputState<string>(
    wikiList[currentWiki].settings.deployment_url
  );
  const [matchupGeneration, setMatchupGeneration] = useInputState<
    "current" | "gen1" | "gen2"
  >(wikiList[currentWiki].settings.matchup_generation);

  const { mutate, isLoading } = useEditWikiSettings((data: any) => {
    notifications.show({ message: data.message });
    setWikiList(data.wikis);
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
        <TextInput
          label="Deployment URL"
          onChange={setDeploymentUrl}
          value={deploymentUrl}
        />
      </Grid.Col>
      <Grid.Col>
        <NativeSelect
          label="Matchup Generation"
          onChange={setMatchupGeneration}
          value={matchupGeneration}
          data={["current", "gen1", "gen2"]}
        />
      </Grid.Col>
      <Grid.Col>
        <Button
          onClick={() =>
            mutate({
              wikiName: currentWiki,
              settings: {
                version_group: versionGroup,
                deployment_url: deploymentUrl,
                matchup_generation: matchupGeneration,
              },
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
