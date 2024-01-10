import {
  Autocomplete,
  Button,
  Checkbox,
  Grid,
  Image,
  NumberInput,
  Tabs,
  Text,
} from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useState } from "react";
import {
  useGetPokemonById,
  useGetPokemonByName,
  usePreparePokemonData,
  useSavePokemonChanges,
} from "../apis/pokemonApis";
import MultiplePokemon from "../components/MultiplePokemon";
import MovesTab from "../components/PokemonTabs/MovesTab";
import StatsAbilitiesEvoTab from "../components/PokemonTabs/StatsAbilityEvoTab";
import { usePokemonStore } from "../stores";
import { PokemonChanges, PokemonData } from "../types";
import { isNullEmptyOrUndefined } from "../utils";

const Pokemon = () => {
  const [pokemonName, setPokemonName] = useState<string>("");
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [pokemonData, setPokemonData] = useState<PokemonData | null>(null);
  const [pokemonChanges, setPokemonChanges] = useState<PokemonChanges | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<string | null>(
    "stats-abilities-evo"
  );
  const [activePokemonTab, setActivePokemonTab] = useState<string | null>(
    "pokemon"
  );
  const pokemonList = usePokemonStore((state) => state.pokemonList);

  const { refetch, isLoading } = useGetPokemonByName({
    pokemonName,
    onSuccess: (data: any) => {
      setPokemonData(data);
      setCurrentId(data.id);
    },
  });

  const { mutate: fetchById, isLoading: isLoadingById } = useGetPokemonById({
    onSuccess: (data: any) => {
      console.log(data);
      setPokemonData(data);
      setPokemonName(data.name);
      setCurrentId(data.id);
    },
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
    setPokemonChanges(null);
    refetch();
  };

  const nextPokemon = () => {
    const nextPokemon = pokemonList.find(
      (p) => p.id === (currentId as number) + 1
    );
    if (nextPokemon) {
      setPokemonData(null);
      setPokemonChanges(null);
      fetchById({ pokemonId: nextPokemon.id });
    } else {
      notifications.show({ message: "No more pokemon" });
    }
  };

  const prevPokemon = () => {
    const prevPokemon = pokemonList.find(
      (p) => p.id === (currentId as number) - 1
    );
    if (prevPokemon) {
      setPokemonData(null);
      setPokemonChanges(null);
      fetchById({ pokemonId: prevPokemon.id });
    } else {
      notifications.show({ message: "No more pokemon" });
    }
  };

  const saveChanges = () => {
    mutatePokemon({
      pokemonName,
      pokemonChanges: pokemonChanges as PokemonChanges,
    });
  };

  return (
    <Tabs value={activePokemonTab} onTabChange={setActivePokemonTab}>
      <Tabs.List>
        <Tabs.Tab value="pokemon">Pokemon</Tabs.Tab>
        <Tabs.Tab value="multiple-pokemon">Edit Multiple Pokemon</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="pokemon">
        <Grid columns={22} mt={20}>
          {pokemonList.length === 0 && <EmptyPokemonList />}
          {pokemonList.length > 0 && (
            <>
              <Grid.Col span={8}>
                <Autocomplete
                  placeholder="Pokemon Name"
                  value={pokemonName}
                  onChange={(value) => setPokemonName(value)}
                  data={
                    pokemonList === undefined
                      ? []
                      : pokemonList.map((p) => p.name)
                  }
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Button
                  fullWidth
                  onClick={handleSearch}
                  disabled={isNullEmptyOrUndefined(pokemonName)}
                >
                  Search
                </Button>
              </Grid.Col>
              <Grid.Col span={6}>
                <Button
                  fullWidth
                  disabled={pokemonChanges === null}
                  onClick={saveChanges}
                >
                  Save Changes
                </Button>
              </Grid.Col>
              <Grid.Col span={1}>
                <Button onClick={prevPokemon} color="gray">
                  <IconChevronLeft size={"1rem"} />
                </Button>
              </Grid.Col>
              <Grid.Col span={1}>
                <Button onClick={nextPokemon} color="gray">
                  <IconChevronRight size={"1rem"} />
                </Button>
              </Grid.Col>
            </>
          )}
        </Grid>
        <Image src={pokemonData?.sprite} maw={200} />
        {pokemonData && (
          <Tabs mt={20} value={activeTab} onTabChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="stats-abilities-evo">
                Stats_Abilities_Evo
              </Tabs.Tab>
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
      </Tabs.Panel>
      <Tabs.Panel value="multiple-pokemon">
        <MultiplePokemon />
      </Tabs.Panel>
    </Tabs>
  );
};

const EmptyPokemonList = () => {
  const [rangeStart, setRangeStart] = useInputState<number>(0);
  const [rangeEnd, setRangeEnd] = useInputState<number>(0);
  const [wipeCurrentData, setWipeCurrentData] = useState<boolean>(false);
  const setPokemonList = usePokemonStore((state) => state.setPokemonList);
  const {
    mutate: mutatePreparePokemonData,
    isLoading: isLoadingPreparePokemonData,
  } = usePreparePokemonData({
    onSuccess: (data: any) => {
      notifications.show({ message: "Data Prepared" });
      setPokemonList(data.pokemon);
    },
    onError: () => {},
  });
  const handlePrepareInitialData = () => {
    mutatePreparePokemonData({
      range_end: rangeEnd,
      range_start: rangeStart,
      wipe_current_data: wipeCurrentData,
    });
  };
  return (
    <>
      <Grid.Col>
        <Text>
          We detected that there is no pokemon data in this wiki right now. Do
          you want to prepare initial data with original pokemon data?
        </Text>
      </Grid.Col>
      <Grid.Col>
        <Text color="red">
          NOTE: THIS WILL TAKE SEVERAL MINUTES TO PREPARE ALL THE DATA DEPENDING
          ON THE RANGE YOU SET. The pokemon data set is being downloaded from
          pokeapi and modified through the download_pokemon_data funtion in the
          backend.
        </Text>
      </Grid.Col>
      <Grid.Col>
        <NumberInput
          label="Range Start"
          onChange={(value: number) => setRangeStart(value)}
          value={rangeStart}
          min={0}
        />
      </Grid.Col>
      <Grid.Col>
        <NumberInput
          label="Range End"
          onChange={(value: number) => setRangeEnd(value)}
          value={rangeEnd}
          min={0}
        />
      </Grid.Col>
      <Grid.Col>
        <Checkbox
          label="Wipe Current Data (Needs to be checked actually run the operation)"
          checked={wipeCurrentData}
          onChange={(event) => setWipeCurrentData(event.currentTarget.checked)}
        />
      </Grid.Col>
      <Grid.Col>
        <Button
          disabled={rangeStart >= rangeEnd || rangeStart <= 0 || rangeEnd <= 0}
          onClick={handlePrepareInitialData}
          loading={isLoadingPreparePokemonData}
        >
          Prepare Initial Data
        </Button>
      </Grid.Col>
    </>
  );
};

export default Pokemon;
