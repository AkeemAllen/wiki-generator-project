import { Autocomplete, Button, Grid, Image, Tabs } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import {
  useGetPokemonByName,
  useSavePokemonChanges,
} from "../apis/pokemonApis";
import MovesTab from "../components/PokemonTabs/MovesTab";
import StatsAbilitiesEvoTab from "../components/PokemonTabs/StatsAbilityEvoTab";
import { usePokemonStore } from "../stores";
import { PokemonChanges, PokemonData } from "../types";
import { isNullEmptyOrUndefined } from "../utils";

const Pokemon = () => {
  const [pokemonName, setPokemonName] = useState<string>("");
  const [pokemonData, setPokemonData] = useState<PokemonData | null>(null);
  const [pokemonChanges, setPokemonChanges] = useState<PokemonChanges | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<string | null>("moves");
  const pokemonList = usePokemonStore((state) => state.pokemonList);

  const { refetch, isLoading } = useGetPokemonByName({
    pokemonName,
    onSuccess: (data: any) => setPokemonData(data),
  });

  const { mutate: mutatePokemon } = useSavePokemonChanges({
    onSuccess: () => {
      notifications.show({ message: "Changes Saved" });
      setPokemonChanges(null);
    },
    onError: () => {
      notifications.show({ message: "Error Saving changes", color: "red" });
    },
  });

  const handleSearch = () => {
    setPokemonData(null);
    refetch();
  };

  const saveChanges = () => {
    mutatePokemon({
      pokemonName,
      pokemonChanges: pokemonChanges as PokemonChanges,
    });
  };

  return (
    <>
      <Grid>
        <Grid.Col span={6}>
          <Autocomplete
            placeholder="Pokemon Name"
            onChange={(value) => setPokemonName(value)}
            data={
              pokemonList === undefined ? [] : pokemonList.map((p) => p.name)
            }
          />
        </Grid.Col>
        <Grid.Col span={3}>
          <Button
            fullWidth
            onClick={handleSearch}
            disabled={isNullEmptyOrUndefined(pokemonName)}
          >
            Search
          </Button>
        </Grid.Col>
        <Grid.Col span={3}>
          <Button
            fullWidth
            disabled={pokemonChanges === null}
            onClick={saveChanges}
          >
            Save Changes
          </Button>
        </Grid.Col>
      </Grid>
      <Image src={pokemonData?.sprite} maw={200} />
      {!isLoading && pokemonData && (
        <Tabs mt={20} value={activeTab} onTabChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="stats-abilities-evo">Stats_Abilities_Evo</Tabs.Tab>
            <Tabs.Tab value="moves">Moves</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="stats-abilities-evo">
            <StatsAbilitiesEvoTab
              pokemonData={pokemonData}
              setPokemonChanges={setPokemonChanges}
              pokemonChanges={pokemonChanges}
            />
          </Tabs.Panel>
          <Tabs.Panel value="moves">
            <MovesTab
              pokemonChanges={pokemonChanges}
              pokemonData={pokemonData}
              setPokemonChanges={setPokemonChanges}
            />
          </Tabs.Panel>
        </Tabs>
      )}
    </>
  );
};

export default Pokemon;
