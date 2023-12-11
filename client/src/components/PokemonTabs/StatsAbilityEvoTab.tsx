import {
  Autocomplete,
  Box,
  Grid,
  NativeSelect,
  NumberInput,
  SimpleGrid,
  TextInput,
} from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { useState } from "react";
import { useUpdateEffect } from "usehooks-ts";
import { Types } from "../../constants";
import { useAbilityStore, useItemsStore, usePokemonStore } from "../../stores";
import { Evolution, PokemonChanges, PokemonData, Stats } from "../../types";
import StatsInputs from "../StatsInputs";

type StatsProps = {
  pokemonData: PokemonData;
  pokemonChanges: PokemonChanges | null;
  setPokemonChanges: any;
};

const StatsAbilitiesEvoTab = ({
  pokemonData,
  pokemonChanges,
  setPokemonChanges,
}: StatsProps) => {
  const [typeOne, setTypeOne] = useInputState<string>(pokemonData.types[0]);
  const [typeTwo, setTypeTwo] = useInputState<string>(
    pokemonData.types[1] === undefined ? Types.NONE : pokemonData.types[1]
  );
  const [abilityOne, setAbilityOne] = useInputState<string>(
    pokemonData.abilities[0]
  );
  const [abilityTwo, setAbilityTwo] = useInputState<string>(
    pokemonData.abilities[1] === undefined ? "" : pokemonData.abilities[1]
  );
  const [evolution, setEvolution] = useState<Evolution>(
    pokemonData.evolution ? pokemonData.evolution : {}
  );
  const [stats, setStats] = useState<Stats>({
    hp: pokemonData.stats.hp,
    attack: pokemonData.stats.attack,
    defense: pokemonData.stats.defense,
    sp_attack: pokemonData.stats.sp_attack,
    sp_defense: pokemonData.stats.sp_defense,
    speed: pokemonData.stats.speed,
  });

  const pokemonList = usePokemonStore((state) => state.pokemonList);
  const items = useItemsStore((state) => state.itemsList);
  const abilityList = useAbilityStore((state) => state.abilityList);

  // perhaps some performance gains can be made here
  useUpdateEffect(() => {
    setPokemonChanges({
      ...pokemonChanges,
      types: [typeOne, typeTwo],
    });
  }, [typeOne, typeTwo]);

  useUpdateEffect(() => {
    setPokemonChanges({
      ...pokemonChanges,
      abilities: [abilityOne, abilityTwo],
    });
  }, [abilityOne, abilityTwo]);

  useUpdateEffect(() => {
    setPokemonChanges({
      ...pokemonChanges,
      stats: stats,
    });
  }, [stats]);

  useUpdateEffect(() => {
    setPokemonChanges({
      ...pokemonChanges,
      evolution: evolution,
    });
  }, [evolution]);

  return (
    <>
      <Grid mt="xl" grow>
        <Grid.Col span={5}>
          <SimpleGrid cols={2} mt="xl">
            <NativeSelect
              label={`Type 1`}
              value={typeOne}
              onChange={setTypeOne}
              data={Object.keys(Types).map(
                (key: string) => Types[key as keyof typeof Types]
              )}
            />
            <NativeSelect
              label={`Type 2`}
              value={typeTwo}
              onChange={setTypeTwo}
              data={Object.keys(Types).map(
                (key: string) => Types[key as keyof typeof Types]
              )}
            />
          </SimpleGrid>
          <SimpleGrid cols={2} mt="xl">
            <Autocomplete
              value={abilityOne}
              onChange={setAbilityOne}
              data={abilityList === undefined ? [] : abilityList}
              label="Ability 1"
            />
            <Autocomplete
              value={abilityTwo}
              onChange={setAbilityTwo}
              data={abilityList === undefined ? [] : abilityList}
              label="Ability 2"
            />
          </SimpleGrid>
        </Grid.Col>
        <Grid.Col>
          <Box sx={{ width: 700 }}>
            <SimpleGrid cols={3}>
              <NativeSelect
                label="Evolution Method"
                data={["no change", "item", "level-up", "other"]}
                value={evolution.method}
                onChange={(e) => setEvolution({ method: e.target.value })}
              />
              {evolution.method === "level-up" && (
                <NumberInput
                  label="level"
                  value={evolution.level}
                  min={1}
                  max={100}
                  onChange={(e: number) =>
                    setEvolution({ ...evolution, level: e })
                  }
                />
              )}
              {evolution.method === "item" && (
                <Autocomplete
                  label="item"
                  value={evolution.item}
                  onChange={(e) => setEvolution({ ...evolution, item: e })}
                  data={items === undefined ? [] : items}
                />
              )}
              {evolution.method === "other" && (
                <TextInput
                  label="other"
                  value={evolution.other}
                  onChange={(e) =>
                    setEvolution({ ...evolution, other: e.target.value })
                  }
                />
              )}
              {evolution.method !== "no change" &&
                evolution.method !== undefined && (
                  <Autocomplete
                    label="Evolved Pokemon"
                    value={evolution.evolved_pokemon}
                    onChange={(e) =>
                      setEvolution({ ...evolution, evolved_pokemon: e })
                    }
                    data={
                      pokemonList === undefined
                        ? []
                        : pokemonList.map((p) => p.name)
                    }
                  />
                )}
            </SimpleGrid>
          </Box>
        </Grid.Col>
      </Grid>
      <StatsInputs setStats={setStats} stats={stats} />
    </>
  );
};

export default StatsAbilitiesEvoTab;
