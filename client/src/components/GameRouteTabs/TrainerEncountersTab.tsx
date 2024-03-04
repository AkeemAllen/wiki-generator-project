import { Grid, ScrollArea, Title } from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useMemo, useState } from "react";
import { useEditTrainers } from "../../apis/routesApis";
import { usePokemonStore, useRouteStore } from "../../stores";
import { TrainerPokemonOrWildPokemon, Trainers } from "../../types";
import { capitalize, setUniquePokemonId } from "../../utils";
import PokemonCard from "../PokemonCard";
import TrainerMenu from "../TrainerMenu";
import { TrainerPokemonAddition } from "../TrainerPokemonAddition";

type TabProps = {
  routeName: string;
};

const TrainersEncounterTab = ({ routeName }: TabProps) => {
  const pokemonList = usePokemonStore((state) => state.pokemonList);
  const routes = useRouteStore((state) => state.routes);
  const setRoutes = useRouteStore((state) => state.setRoutes);

  const [currentTrainer, setCurrentTrainer] = useInputState<string>("");
  const [pokemonName, setPokemonName] = useState<string>("");
  const [level, setLevel] = useState<number>(0);

  const trainers = useMemo(() => routes[routeName]?.trainers, [routes]);

  const { mutate: submitTrainers } = useEditTrainers((data) =>
    setRoutes(data.routes)
  );

  const addPokemonToTrainer = () => {
    const currentTrainers = { ...trainers };
    const trainerInfo = currentTrainers[currentTrainer];
    const pokemon: TrainerPokemonOrWildPokemon = {
      name: pokemonName,
      level: level,
      id: pokemonList?.find((p) => p.name === pokemonName)?.id,
      unique_id: setUniquePokemonId(
        trainers as Trainers,
        currentTrainer,
        pokemonName,
        pokemonList
      ),
    };
    if (trainerInfo) {
      trainerInfo.pokemon.push(pokemon);
      currentTrainers[currentTrainer] = {
        pokemon: trainerInfo.pokemon,
      };
    } else {
      currentTrainers[currentTrainer] = {
        pokemon: [pokemon],
      };
    }
    submitTrainers({
      routeName,
      trainers: currentTrainers,
    });
    notifications.show({ message: "Pokemon Added" });
  };

  const removePokemonFromTrainer = (unique_id: string, trainer: string) => {
    let currentTrainers = { ...trainers };
    currentTrainers[trainer] = {
      ...currentTrainers[trainer],
      pokemon: currentTrainers[trainer].pokemon.filter(
        (p) => p.unique_id !== unique_id
      ),
    };
    if (currentTrainers[trainer].pokemon.length === 0) {
      delete currentTrainers[trainer];
    }
    submitTrainers({
      routeName,
      trainers: currentTrainers,
    });
    notifications.show({ message: "Pokemon Removed" });
  };

  return (
    <>
      <TrainerPokemonAddition
        trainer={currentTrainer}
        setTrainer={setCurrentTrainer}
        trainers={trainers as Trainers}
        pokemonName={pokemonName}
        setPokemonName={setPokemonName}
        level={level}
        setLevel={setLevel}
        addPokemonToTrainer={addPokemonToTrainer}
      />
      <ScrollArea.Autosize mah={"calc(100vh - 300px)"} offsetScrollbars>
        {trainers &&
          Object.entries(trainers).map(([trainer, trainerInfo], index) => {
            return (
              <div key={index}>
                <Grid mt={20} align="center">
                  <Grid.Col span={2}>
                    <Title order={4}>{capitalize(trainer)}</Title>
                  </Grid.Col>
                  <Grid.Col span={1}>
                    <TrainerMenu
                      trainerName={trainer}
                      routeName={routeName}
                      is_important_trainer={false}
                    />
                  </Grid.Col>
                </Grid>
                <Grid mt={10}>
                  {trainerInfo.pokemon.map((pokemon, index) => {
                    return (
                      <Grid.Col span={2} key={index}>
                        <PokemonCard
                          pokemon={pokemon}
                          removePokemon={() =>
                            removePokemonFromTrainer(
                              pokemon.unique_id as string,
                              trainer
                            )
                          }
                        />
                      </Grid.Col>
                    );
                  })}
                </Grid>
              </div>
            );
          })}
      </ScrollArea.Autosize>
    </>
  );
};

export default TrainersEncounterTab;
