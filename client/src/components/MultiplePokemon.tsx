import {
  Autocomplete,
  Button,
  Grid,
  MultiSelect,
  NativeSelect,
  SimpleGrid,
} from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { useAddMultipleMoves } from "../apis/pokemonApis";
import { useAbilityStore, useMovesStore, usePokemonStore } from "../stores";

type MoveBeingAdded = {
  name: string;
  differingLevels: boolean;
  levels: number[];
};

const MultiplePokemon = () => {
  const pokemonList = usePokemonStore((state) => state.pokemonList);
  const moveList = useMovesStore((state) => state.movesList);
  const abilityList = useAbilityStore((state) => state.abilityList);

  const [pokemonBeingModified, setPokemonBeingModified] = useInputState<
    string[]
  >([]);
  const [movesBeingAdded, setMovesBeingAdded] = useInputState<string[]>([]);
  const [level, setLevel] = useState<number>(0);

  const [statToEdit, setStatToEdit] = useInputState<string>("Machine Moves");
  const [abilityOne, setAbilityOne] = useInputState<string>("");
  const [abilityTwo, setAbilityTwo] = useInputState<string>("");

  const { mutate: addMovesToPokemon, isPending } = useAddMultipleMoves({});

  const handleSubmit = () => {
    addMovesToPokemon(
      {
        pokemon_being_modified: pokemonBeingModified,
        moves_being_added: movesBeingAdded,
      },
      {
        onSuccess: (data) => {
          setPokemonBeingModified([]);
          setMovesBeingAdded([]);
          notifications.show({ message: data.message });
        },
      }
    );
  };

  return (
    <>
      <Grid mt={20}>
        <Grid.Col span={4}>
          <NativeSelect
            label="Stat to Edit"
            value={statToEdit}
            onChange={setStatToEdit}
            data={["Abilities", "Machine Moves"]}
          />
        </Grid.Col>
      </Grid>
      {statToEdit === "abilities" && (
        <SimpleGrid cols={2} mt={20}>
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
      )}
      {statToEdit === "Machine Moves" && (
        <SimpleGrid mt={20}>
          <MultiSelect
            value={movesBeingAdded}
            onChange={setMovesBeingAdded}
            data={moveList === undefined ? [] : moveList}
            label="Move to Add"
            searchable
          />
        </SimpleGrid>
      )}
      <SimpleGrid mt={20}>
        <MultiSelect
          label="Pokemon to Edit"
          value={pokemonBeingModified}
          onChange={setPokemonBeingModified}
          data={pokemonList.map((pokemon) => pokemon.name)}
          searchable
        />
      </SimpleGrid>

      <Button
        mt={20}
        onClick={handleSubmit}
        loading={isPending}
        disabled={
          pokemonBeingModified.length === 0 || movesBeingAdded.length === 0
        }
      >
        Submit Changes
      </Button>
    </>
  );
};

export default MultiplePokemon;
