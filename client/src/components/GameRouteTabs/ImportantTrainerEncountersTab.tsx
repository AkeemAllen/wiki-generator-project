import { Grid, ScrollAreaAutosize, Title } from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useMemo, useState } from "react";
import { useEditTrainers } from "../../apis/routesApis";
import { usePokemonStore, useRouteStore } from "../../stores";
import { ImportantTrainers, TrainerPokemonOrWildPokemon } from "../../types";
import { capitalize, setUniquePokemonId } from "../../utils";
import PokemonCard from "../PokemonCard";
import TrainerMenu from "../TrainerMenu";
import { TrainerPokemonAddition } from "../TrainerPokemonAddition";

const ImportantTrainerEncountersTab = ({
  routeName,
}: {
  routeName: string;
}) => {
  const pokemonList = usePokemonStore((state) => state.pokemonList);
  const routes = useRouteStore((state) => state.routes);
  const setRoutes = useRouteStore((state) => state.setRoutes);

  const [currentTrainer, setCurrentTrainer] = useInputState<string>("");
  const [pokemonName, setPokemonName] = useInputState<string>("");
  const [level, setLevel] = useState<number>(0);

  const { mutate: submitTrainers } = useEditTrainers((data) =>
    setRoutes(data.routes)
  );

  const trainers = useMemo(
    () => routes[routeName]?.important_trainers,
    [routes]
  );

  const addPokemonToTrainer = () => {
    const currentTrainers = { ...trainers };
    const trainerInfo = currentTrainers[currentTrainer];
    const pokemon: TrainerPokemonOrWildPokemon = {
      name: pokemonName,
      level: level,
      id: pokemonList?.find((p) => p.name === pokemonName)?.id,
      unique_id: setUniquePokemonId(
        trainers as ImportantTrainers,
        currentTrainer,
        pokemonName,
        pokemonList
      ),
    };
    if (trainerInfo) {
      trainerInfo.pokemon.push(pokemon);
      currentTrainers[currentTrainer] = {
        ...currentTrainers[currentTrainer],
        pokemon: trainerInfo.pokemon,
        sprite_name: trainerInfo.sprite_name,
      };
    } else {
      currentTrainers[currentTrainer] = {
        ...currentTrainers[currentTrainer],
        pokemon: [pokemon],
        sprite_name: "",
      };
    }
    submitTrainers({
      routeName,
      important_trainers: currentTrainers,
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
      important_trainers: currentTrainers,
    });
    notifications.show({ message: "Pokemon Removed" });
  };

  return (
    <>
      <TrainerPokemonAddition
        trainer={currentTrainer}
        setTrainer={setCurrentTrainer}
        trainers={trainers as ImportantTrainers}
        pokemonName={pokemonName}
        setPokemonName={setPokemonName}
        level={level}
        setLevel={setLevel}
        addPokemonToTrainer={addPokemonToTrainer}
      />
      <ScrollAreaAutosize mah={"calc(100vh - 300px)"} offsetScrollbars>
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
                      is_important_trainer
                      routeName={routeName}
                      trainerName={trainer}
                    />
                  </Grid.Col>
                </Grid>
                {trainerInfo.sprite_name && (
                  <img
                    style={{ marginTop: 10 }}
                    src={`https://play.pokemonshowdown.com/sprites/trainers/${trainerInfo.sprite_name}.png`}
                  />
                )}
                <Grid mt={10}>
                  {trainerInfo.pokemon.map((pokemon, index) => {
                    return (
                      <Grid.Col span={2} key={index}>
                        <PokemonCard
                          routeName={routeName}
                          pokemon={pokemon}
                          trainers={trainers}
                          trainerName={trainer}
                          trainerInfo={trainerInfo}
                          removePokemon={() =>
                            removePokemonFromTrainer(
                              pokemon.unique_id as string,
                              trainer
                            )
                          }
                          is_important_trainer
                        />
                      </Grid.Col>
                    );
                  })}
                </Grid>
              </div>
            );
          })}
      </ScrollAreaAutosize>
    </>
  );
};

export default ImportantTrainerEncountersTab;
