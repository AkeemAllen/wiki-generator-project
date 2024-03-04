import { Autocomplete, Button, Grid, NumberInput } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import { useRef } from "react";
import { usePokemonStore } from "../stores";
import { ImportantTrainers, Trainers } from "../types";
import { isNullEmptyOrUndefined } from "../utils";

type TrainerPokemonAdditionProps = {
  trainer: string;
  setTrainer: any;
  trainers: ImportantTrainers | Trainers;
  pokemonName: string;
  setPokemonName: (value: string) => void;
  level: number;
  setLevel: (e: number) => void;
  addPokemonToTrainer: () => void;
};

export const TrainerPokemonAddition = ({
  trainer,
  setTrainer,
  trainers,
  pokemonName,
  setPokemonName,
  level,
  setLevel,
  addPokemonToTrainer,
}: TrainerPokemonAdditionProps) => {
  const pokemonList = usePokemonStore((state) => state.pokemonList);
  const trainerNameSelectRef = useRef<HTMLInputElement>(null);

  useHotkeys(
    [
      ["alt+l", () => trainerNameSelectRef.current?.focus()], // This speeds up the process of selecting the trainer name to add a new pokemon
    ],
    []
  );
  return (
    <Grid mt={5} mb={10}>
      <Grid.Col span={2}>
        <Autocomplete
          label="Trainer Name"
          value={trainer}
          onChange={setTrainer}
          data={trainers ? Object.keys(trainers) : []}
          ref={trainerNameSelectRef}
        />
      </Grid.Col>
      <Grid.Col span={4}>
        <Autocomplete
          label="Pokemon for current trainer"
          placeholder="Pokemon Name"
          value={pokemonName}
          onChange={(value) => setPokemonName(value)}
          data={pokemonList === undefined ? [] : pokemonList.map((p) => p.name)}
          limit={5}
        />
      </Grid.Col>
      <Grid.Col span={2}>
        <NumberInput
          label="Level"
          value={level}
          onChange={(e) => setLevel(e as number)}
        />
      </Grid.Col>
      <Grid.Col span={2} mt={25}>
        <Button
          disabled={
            isNullEmptyOrUndefined(pokemonName) ||
            level === 0 ||
            isNullEmptyOrUndefined(trainer)
          }
          onClick={addPokemonToTrainer}
        >
          Add Pokemon
        </Button>
      </Grid.Col>
    </Grid>
  );
};
