import {
  Box,
  Grid,
  NativeSelect,
  SimpleGrid,
  TextInput,
  Title,
} from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { useState } from "react";
import { useUpdateEffect } from "usehooks-ts";
import { Types } from "../../constants";
import { PokemonChanges, PokemonData, Stats } from "../../types";
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
  const [evolution, setEvolution] = useInputState<string>(
    pokemonData.evolution ? pokemonData.evolution : ""
  );
  const [stats, setStats] = useState<Stats>({
    hp: pokemonData.stats.hp,
    attack: pokemonData.stats.attack,
    defense: pokemonData.stats.defense,
    sp_attack: pokemonData.stats.sp_attack,
    sp_defense: pokemonData.stats.sp_defense,
    speed: pokemonData.stats.speed,
  });

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
            <TextInput
              value={abilityOne}
              onChange={setAbilityOne}
              label="Ability 1"
            />
            <TextInput
              value={abilityTwo}
              onChange={setAbilityTwo}
              label="Ability 2"
            />
          </SimpleGrid>
        </Grid.Col>
      </Grid>
      <Title order={2} mt={20}>
        Evolution Change
      </Title>
      <Box sx={{ width: 500 }}>
        <TextInput
          mt="lg"
          placeholder="Write a sentence about evolution change here"
          onChange={setEvolution}
          value={evolution}
        />
      </Box>
      <StatsInputs setStats={setStats} stats={stats} />
    </>
  );
};

export default StatsAbilitiesEvoTab;
