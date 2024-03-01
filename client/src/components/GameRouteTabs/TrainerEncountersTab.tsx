import {
  Autocomplete,
  Button,
  Grid,
  NumberInput,
  ScrollArea,
  Title,
} from "@mantine/core";
import { useDisclosure, useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useEditRoute } from "../../apis/routesApis";
import { usePokemonStore, useRouteStore } from "../../stores";
import { TrainerInfo, Trainers } from "../../types";
import { capitalize, isNullEmptyOrUndefined } from "../../utils";
import PokemonCard from "../PokemonCard";
import UpdateSpriteModal from "../TrainerEncountersModals/UpdateSpriteModal";
import UpdateTrainerVersionsModal from "../TrainerEncountersModals/UpdateTrainerVersionsModal";
import TrainerMenu from "../TrainerMenu";

type TabProps = {
  routeName: string;
};

const TrainersEncounterTab = ({ routeName }: TabProps) => {
  const pokemonList = usePokemonStore((state) => state.pokemonList);
  const routes = useRouteStore((state) => state.routes);
  const setRoutes = useRouteStore((state) => state.setRoutes);

  const [currentTrainer, setCurrentTrainer] = useInputState<string>("");
  // Try using usememo where applicable for this.
  const [trainerVersions, setTrainerVersions] = useState<string[]>([]);
  const [pokemonName, setPokemonName] = useState<string>("");
  const [level, setLevel] = useState<number>(0);
  const [trainers, setTrainers] = useState<Trainers>({} as Trainers);
  const [trainerToUpdate, setTrainerToUpdate] = useState<{
    trainerName: string;
    info: TrainerInfo;
  }>({ trainerName: "", info: {} as TrainerInfo });
  const [
    spriteModalOpened,
    { close: closeSpriteModal, open: openSpriteModal },
  ] = useDisclosure(false);
  const [
    trainerVersionsModalOpened,
    { close: closeTrainerVersionsModal, open: openTrainerVersionsModal },
  ] = useDisclosure(false);

  const updateTrainer = (trainerName: string, trainerInfo: TrainerInfo) => {
    setTrainers((trainers: Trainers) => {
      return { ...trainers, [trainerName]: trainerInfo };
    });
    submitTrainers();
  };

  const editTrainerName = (trainerName: string, newTrainerName: string) => {
    const currentTrainers = { ...trainers };
    const trainerInfo = currentTrainers[trainerName];
    delete currentTrainers[trainerName];
    currentTrainers[newTrainerName] = trainerInfo;
    setTrainers(currentTrainers);
    submitTrainers();
  };

  const setUniqueId = () => {
    let teamLength = 0;

    if (!isNullEmptyOrUndefined(trainers[currentTrainer])) {
      if (!isNullEmptyOrUndefined(trainers[currentTrainer].pokemon)) {
        teamLength = trainers[currentTrainer].pokemon.length;
      }
    }
    return `${
      pokemonList?.find((p) => p.name === pokemonName)?.id
    }_${teamLength}_${Math.floor(Math.random() * 9000 + 1000)}`;
  };

  const addPokemonToTrainer = () => {
    let sprite_name = "";
    let is_important = false;
    let existingPokemon: any = [];
    let trainer_versions: any = [];

    if (!isNullEmptyOrUndefined(trainers[currentTrainer]?.pokemon)) {
      existingPokemon = trainers[currentTrainer].pokemon;
    }
    if (!isNullEmptyOrUndefined(trainers[currentTrainer]?.trainer_versions)) {
      trainer_versions = trainers[currentTrainer].trainer_versions;
    }
    if (!isNullEmptyOrUndefined(trainers[currentTrainer]?.sprite_name)) {
      sprite_name = trainers[currentTrainer]?.sprite_name;
    }
    if (!isNullEmptyOrUndefined(trainers[currentTrainer]?.is_important)) {
      is_important = trainers[currentTrainer]?.is_important;
    }

    updateTrainer(currentTrainer, {
      sprite_name,
      is_important,
      trainer_versions,
      pokemon: [
        ...existingPokemon,
        {
          name: pokemonName,
          id: pokemonList?.find((p) => p.name === pokemonName)?.id,
          unique_id: setUniqueId(),
          level,
          trainer_version: [],
        },
      ],
    });
  };

  const removePokemonFromTrainer = (
    unique_id: string,
    pokemonName: string,
    trainer: string
  ) => {
    let currentTrainers = { ...trainers };
    currentTrainers[trainer] = {
      ...trainers[trainer],
      pokemon: trainers[trainer].pokemon.filter(
        (p) => p.unique_id !== unique_id
      ),
    };
    if (currentTrainers[trainer].pokemon.length === 0) {
      delete currentTrainers[trainer];
    }
    setTrainers(currentTrainers);
    submitTrainers();
  };

  const { mutate: submitTrainers } = useEditRoute({
    routeName,
    body: {
      trainers,
    },
    onSuccess: (data: any) => {
      close();
      console.log(data.routes);
      setRoutes(data.routes);
      notifications.show({ message: "Trainers updated successfully" });
    },
  });

  useEffect(() => {
    setTrainers(routes[routeName]?.trainers || {});
    // When the page is refreshed, the routes are not loaded yet, so we also have to listen for
    // changes to the routes and update the wild encounters when the routes are loaded
    //
    // TODO: This causes more rerenders than I'd like so I should find a better way to do this at some point
  }, [routeName, routes]);

  return (
    <>
      <Grid mt={5} mb={10}>
        <Grid.Col span={2}>
          <Autocomplete
            label="Trainer Name"
            value={currentTrainer}
            onChange={setCurrentTrainer}
            data={Object.keys(trainers)}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Autocomplete
            label="Pokemon for current trainer"
            placeholder="Pokemon Name"
            value={pokemonName}
            onChange={(value) => setPokemonName(value)}
            data={
              pokemonList === undefined ? [] : pokemonList.map((p) => p.name)
            }
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
              isNullEmptyOrUndefined(currentTrainer)
            }
            onClick={addPokemonToTrainer}
          >
            Add Pokemon
          </Button>
        </Grid.Col>
      </Grid>
      <ScrollArea.Autosize mah={"calc(100vh - 300px)"} offsetScrollbars>
        {!isNullEmptyOrUndefined(trainers) &&
          Object.keys(trainers).map((trainer, index) => {
            return (
              <div key={index}>
                <Grid mt={20} align="center">
                  <Grid.Col span={2}>
                    <Title order={4}>{capitalize(trainer)}</Title>
                  </Grid.Col>
                  <Grid.Col span={1}>
                    <TrainerMenu
                      trainerName={trainer}
                      trainerInfo={trainers[trainer]}
                      functions={{
                        updateTrainer,
                        openSpriteModal,
                        openTrainerVersionsModal,
                        setTrainerToUpdate,
                        setTrainerVersions,
                        editTrainerName,
                      }}
                    />
                  </Grid.Col>
                </Grid>
                {trainers[trainer].is_important && (
                  <img
                    style={{ marginTop: 10 }}
                    src={`https://play.pokemonshowdown.com/sprites/trainers/${trainers[trainer].sprite_name}.png`}
                  />
                )}
                <Grid mt={10}>
                  {trainers[trainer].pokemon.map((pokemon, index) => {
                    return (
                      <Grid.Col span={2} key={index}>
                        <PokemonCard
                          trainers={trainers}
                          trainerName={trainer}
                          pokemonId={pokemon.id as number}
                          pokemonName={pokemon.name as string}
                          removePokemon={() =>
                            removePokemonFromTrainer(
                              pokemon?.unique_id as string,
                              pokemon.name as string,
                              trainer
                            )
                          }
                          level={pokemon.level as number}
                          updateTrainer={updateTrainer}
                        />
                      </Grid.Col>
                    );
                  })}
                </Grid>
              </div>
            );
          })}
      </ScrollArea.Autosize>
      <UpdateSpriteModal
        opened={spriteModalOpened}
        close={closeSpriteModal}
        trainer={trainerToUpdate}
        trainers={trainers}
        updateTrainer={updateTrainer}
      />
      <UpdateTrainerVersionsModal
        opened={trainerVersionsModalOpened}
        close={closeTrainerVersionsModal}
        versions={trainerVersions}
        setVersions={setTrainerVersions}
        trainer={trainerToUpdate}
        trainers={trainers}
        updateTrainer={updateTrainer}
      />
    </>
  );
};

export default TrainersEncounterTab;
