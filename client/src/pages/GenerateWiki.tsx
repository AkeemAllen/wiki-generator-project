import { Button, Grid, NumberInput, Select, Tabs, Text } from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { useGeneratePokemon, useGenerateRoutes } from "../apis/wikiApis";
import { PokemonVersions, Wikis } from "../types";

const GenerateWiki = () => {
  const [activeTab, setActiveTab] = useState<string | null>("generate-pokemon");
  const [rangeStart, setRangeStart] = useInputState<number>(0);
  const [rangeEnd, setRangeEnd] = useInputState<number>(0);
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  const [wikiList, __] = useLocalStorage<Wikis>("wikiList", {});
  const [versionGroup, setVersionGroup] = useInputState<string>(
    wikiList[currentWiki]?.settings?.version_group
  );

  const {
    mutate: mutateGeneratePokemon,
    isPending: isPendingGeneratePokemonData,
  } = useGeneratePokemon((data: any) => {
    notifications.show({ message: data.message });
  });

  const {
    mutate: mutateGenerateRoutes,
    isPending: isPendingGenerateRoutesData,
  } = useGenerateRoutes((data: any) => {
    notifications.show({ message: data.message });
  });

  const handleGeneratePokemonData = () => {
    mutateGeneratePokemon({
      wiki_name: currentWiki,
      version_group: versionGroup,
      range_start: rangeStart,
      range_end: rangeEnd,
    });
  };

  const handleGenerateRoutesData = () => {
    mutateGenerateRoutes({
      wiki_name: currentWiki,
    });
  };

  return (
    <Tabs value={activeTab} onChange={setActiveTab}>
      <Tabs.List>
        <Tabs.Tab value="generate-pokemon">Generate Pokemon Pages</Tabs.Tab>
        <Tabs.Tab value="generate-routes">Generate Routes Pages</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="generate-pokemon">
        <Grid mt={20}>
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
            <NumberInput
              label="Range Start"
              onChange={(value) => setRangeStart(value as number)}
              value={rangeStart}
              min={0}
            />
          </Grid.Col>
          <Grid.Col>
            <NumberInput
              label="Range End"
              onChange={(value) => setRangeEnd(value as number)}
              value={rangeEnd}
              min={0}
            />
          </Grid.Col>{" "}
          <Grid.Col>
            <Button
              disabled={
                rangeStart >= rangeEnd || rangeStart <= 0 || rangeEnd <= 0
              }
              onClick={handleGeneratePokemonData}
              loading={isPendingGeneratePokemonData}
            >
              Generate
            </Button>
          </Grid.Col>
        </Grid>
      </Tabs.Panel>
      <Tabs.Panel value="generate-routes">
        <Grid mt={20}>
          <Grid.Col>
            <Text>This will generate the routes of the current wiki</Text>
          </Grid.Col>

          <Grid.Col>
            <Button
              onClick={handleGenerateRoutesData}
              loading={isPendingGenerateRoutesData}
            >
              Generate Routes
            </Button>
          </Grid.Col>
        </Grid>
      </Tabs.Panel>
    </Tabs>
  );
};

export default GenerateWiki;
