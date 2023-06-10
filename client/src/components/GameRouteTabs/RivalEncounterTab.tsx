import {
  Autocomplete,
  Button,
  Checkbox,
  Grid,
  NumberInput,
  ScrollArea,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useEditRoute } from "../../apis/routesApis";
import { usePokemonStore, useRouteStore } from "../../stores";
import { Trainers } from "../../types";
import { capitalize, isNullEmptyOrUndefined } from "../../utils";
import PokemonCard from "../PokemonCard";

type ModalProps = {
  routeName: string;
};

const RivalsEncounterTab = ({ routeName }: ModalProps) => {
  const pokemonList = usePokemonStore((state) => state.pokemonList);
  const routes = useRouteStore((state) => state.routes);
  const setRoutes = useRouteStore((state) => state.setRoutes);

  const [currentTrainer, setCurrentTrainer] = useInputState<string>("");
  const [pokemonName, setPokemonName] = useState<string>("");
  const [level, setLevel] = useState<number>(0);
  const [rivalVersion, setRivalVersion] = useInputState<string>("");
  const [trainers, setTrainers] = useState<Trainers>({} as Trainers);

  const addPokemonToTrainer = () => {
    setTrainers((trainers: Trainers) => {
      let sprite_name = "";
      let is_important = false;
      let existingPokemon = trainers[currentTrainer]?.pokemon ?? [];

      if (!isNullEmptyOrUndefined(trainers[currentTrainer]?.sprite_name)) {
        sprite_name = trainers[currentTrainer]?.sprite_name;
      }
      if (!isNullEmptyOrUndefined(trainers[currentTrainer]?.is_important)) {
        is_important = trainers[currentTrainer]?.is_important;
      }

      return {
        ...trainers,
        [currentTrainer]: {
          sprite_name,
          is_important,
          pokemon: [
            ...existingPokemon,
            {
              name: pokemonName,
              id: pokemonList?.find((p) => p.name === pokemonName)?.id,
              level,
            },
          ],
        },
      };
    });
  };

  const updateTrainerImportance = (trainer: string, isImportant: boolean) => {
    setTrainers((trainers: Trainers) => {
      return {
        ...trainers,
        [trainer]: {
          ...trainers[trainer],
          is_important: isImportant,
        },
      };
    });
  };

  const updateTrainerSprite = (trainer: string, sprite: string) => {
    setTrainers((trainers: Trainers) => {
      return {
        ...trainers,
        [trainer]: {
          ...trainers[trainer],
          sprite_name: sprite,
        },
      };
    });
  };

  const removePokemonFromTrainer = (pokemonName: string, trainer: string) => {
    let currentTrainers = {
      ...trainers,
      [trainer]: {
        ...trainers[trainer],
        pokemon: trainers[trainer].pokemon.filter(
          (p) => p.name !== pokemonName
        ),
      },
    };
    if (currentTrainers[trainer].pokemon.length === 0) {
      delete currentTrainers[trainer];
    }
    setTrainers(currentTrainers);
  };

  const { mutate: submitTrainers } = useEditRoute({
    routeName,
    body: {
      trainers,
    },
    onSuccess: (data: any) => {
      close();
      setRoutes(data.routes);
      notifications.show({ message: "Trainers updated successfully" });
    },
  });

  useEffect(() => {
    setTrainers(routes[routeName]?.trainers || {});
  }, [routeName]);

  return (
    <>
      <Grid mt={5}>
        <Grid.Col span={2}>
          <TextInput
            label="Rival Name"
            value={currentTrainer}
            onChange={setCurrentTrainer}
          />
        </Grid.Col>
        <Grid.Col span={2}>
          <Tooltip label="Rival Teams may differ based on different factors such as the starter pokemon selected">
            <TextInput
              label="Rival Version"
              value={rivalVersion}
              onChange={setRivalVersion}
            />
          </Tooltip>
        </Grid.Col>
        <Grid.Col span={3}>
          <Autocomplete
            label="Pokemon for current trainer"
            placeholder="Pokemon Name"
            value={pokemonName}
            onChange={(value) => setPokemonName(value)}
            data={
              pokemonList === undefined ? [] : pokemonList.map((p) => p.name)
            }
          />
        </Grid.Col>
        <Grid.Col span={2}>
          <NumberInput
            label="Level"
            value={level}
            onChange={(e: number) => setLevel(e)}
          />
        </Grid.Col>
        <Grid.Col span={2} mt={25}>
          <Button
            disabled={
              isNullEmptyOrUndefined(pokemonName) ||
              level === 0 ||
              isNullEmptyOrUndefined(currentTrainer)
            }
            onClick={addPokemonToTrainer}
          >
            Add Pokemon
          </Button>
        </Grid.Col>
      </Grid>
      <ScrollArea.Autosize mah={800}>
        {!isNullEmptyOrUndefined(trainers) &&
          Object.keys(trainers).map((trainer, index) => {
            return (
              <div key={index}>
                <Grid columns={24}>
                  <Grid.Col span={3}>
                    <Title order={4} mt={20}>
                      {capitalize(trainer)}
                    </Title>
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <Checkbox
                      mt={24}
                      size={"xs"}
                      label="Important Trainer"
                      checked={trainers[trainer].is_important}
                      onChange={() => {
                        updateTrainerImportance(
                          trainer,
                          !trainers[trainer].is_important
                        );
                      }}
                    />
                  </Grid.Col>
                  {trainers[trainer].is_important && (
                    <Grid.Col span={3} mt={10}>
                      <Tooltip label="Use names for sprites on https://play.pokemonshowdown.com/sprites/trainers/">
                        <TextInput
                          placeholder="Set a sprite name"
                          defaultValue={trainers[trainer]?.sprite_name || ""}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const { value, blur } =
                                e.target as HTMLInputElement;
                              e.preventDefault();
                              e.stopPropagation();
                              updateTrainerSprite(trainer, value);
                              notifications.show({
                                message: "Sprite name updated successfully",
                              });
                            }
                          }}
                          onKeyUp={(e) => {
                            if (e.key === "Escape" || e.key === "Enter") {
                              const { blur } = e.target as HTMLInputElement;
                              blur();
                            }
                          }}
                        />
                      </Tooltip>
                    </Grid.Col>
                  )}
                </Grid>
                <Grid mt={10}>
                  {trainers[trainer].pokemon.map((pokemon, index) => {
                    return (
                      <Grid.Col span={2} key={index}>
                        <PokemonCard
                          trainers={trainers}
                          trainerName={trainer}
                          setTrainers={setTrainers}
                          pokemonId={pokemon.id as number}
                          pokemonName={pokemon.name as string}
                          removePokemon={() =>
                            removePokemonFromTrainer(
                              pokemon.name as string,
                              trainer
                            )
                          }
                          level={pokemon.level as number}
                        />
                      </Grid.Col>
                    );
                  })}
                </Grid>
              </div>
            );
          })}
      </ScrollArea.Autosize>
      <Button fullWidth mt={20} onClick={() => submitTrainers()}>
        Submit Trainers
      </Button>
    </>
  );
};

export default RivalsEncounterTab;
