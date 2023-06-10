import { Autocomplete, Button, Grid, NumberInput } from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { useSavePokemonChanges } from "../apis/pokemonApis";
import { useMovesStore, usePokemonStore } from "../stores";

type MoveBeingAdded = {
  name: string;
  differingLevels: boolean;
  levels: number[];
};

const MultiplePokemon = () => {
  const pokemonList = usePokemonStore((state) => state.pokemonList);
  const moveList = useMovesStore((state) => state.movesList);

  const [pokemonBeingModified, setPokemonBeingModified] =
    useInputState<string>("");
  const [movesBeingAdded, setMovesBeingAdded] = useInputState<string>("");
  const [level, setLevel] = useState<number>(0);

  const { mutate: mutatePokemon, isSuccess, reset } = useSavePokemonChanges({});

  const onSubmit = () => {
    mutatePokemon(
      {
        pokemonName: pokemonBeingModified,
        pokemonChanges: {
          moves: {
            [movesBeingAdded]: {
              learn_method: "level-up",
              level_learned_at: level,
            },
          },
        },
      },
      {
        onSuccess: () => {
          notifications.show({
            message: `${pokemonBeingModified} learned ${movesBeingAdded}`,
          });
        },
      }
    );
  };

  return (
    <>
      <Grid>
        <Grid.Col span={4}>
          <Autocomplete
            placeholder="Moves"
            value={movesBeingAdded}
            onChange={setMovesBeingAdded}
            data={moveList}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Autocomplete
            placeholder="Pokemon"
            value={pokemonBeingModified}
            onChange={setPokemonBeingModified}
            data={pokemonList.map((pokemon) => pokemon.name)}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <NumberInput
            placeholder="Level"
            value={level}
            onChange={(e: number) => setLevel(e)}
          />
        </Grid.Col>
      </Grid>

      <Button mt={20} onClick={onSubmit}>
        Submit Changes
      </Button>
    </>
  );
};

export default MultiplePokemon;
