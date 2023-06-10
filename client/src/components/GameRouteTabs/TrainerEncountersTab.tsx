import {
  ActionIcon,
  Autocomplete,
  Button,
  Checkbox,
  Grid,
  Menu,
  Modal,
  MultiSelect,
  NumberInput,
  ScrollArea,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure, useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconDots } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useEditRoute } from "../../apis/routesApis";
import { usePokemonStore, useRouteStore } from "../../stores";
import { TrainerInfo, Trainers } from "../../types";
import { capitalize, isNullEmptyOrUndefined } from "../../utils";
import PokemonCard from "../PokemonCard";

type TrainerMenuProps = {
  trainerName: string;
  trainerInfo: TrainerInfo;
  functions: {
    updateTrainer: (trainerName: string, trainerInfo: TrainerInfo) => void;
    openSpriteModal: () => void;
    openTrainerVersionsModal: () => void;
    setTrainerVersions: React.Dispatch<React.SetStateAction<string[]>>;
    setTrainerToUpdate: React.Dispatch<
      React.SetStateAction<{
        trainerName: string;
        info: TrainerInfo;
      }>
    >;
  };
};

const TrainerMenu = ({
  trainerInfo,
  trainerName,
  functions,
}: TrainerMenuProps) => {
  const {
    updateTrainer,
    setTrainerToUpdate,
    setTrainerVersions,
    openSpriteModal,
    openTrainerVersionsModal,
  } = functions;
  return (
    <Menu shadow="sm" width={200} position="right-start">
      <Menu.Target>
        <ActionIcon mt={15} ml={10}>
          <IconDots />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          closeMenuOnClick={false}
          rightSection={
            <Checkbox
              mr={10}
              size={"xs"}
              checked={trainerInfo.is_important}
              onChange={() => {
                updateTrainer(trainerName, {
                  ...trainerInfo,
                  is_important: !trainerInfo.is_important,
                });
              }}
            />
          }
        >
          Important Trainer
        </Menu.Item>
        {trainerInfo?.is_important && (
          <>
            <Menu.Item
              onClick={() => {
                setTrainerToUpdate({
                  trainerName,
                  info: trainerInfo,
                });
                openSpriteModal();
              }}
            >
              Update Sprite
            </Menu.Item>
            <Menu.Item
              onClick={() => {
                setTrainerToUpdate({
                  trainerName,
                  info: trainerInfo,
                });
                setTrainerVersions((versions) => [
                  ...versions,
                  ...(trainerInfo?.trainer_versions || []),
                ]);
                openTrainerVersionsModal();
              }}
            >
              Modify Trainer Versions
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};

type TabProps = {
  routeName: string;
};

const TrainersEncounterTab = ({ routeName }: TabProps) => {
  const pokemonList = usePokemonStore((state) => state.pokemonList);
  const routes = useRouteStore((state) => state.routes);
  const setRoutes = useRouteStore((state) => state.setRoutes);

  const [currentTrainer, setCurrentTrainer] = useInputState<string>("");
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

  const viewport: any = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    return viewport.current.scrollTo({
      top: viewport.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const updateTrainer = (trainerName: string, trainerInfo: TrainerInfo) => {
    setTrainers((trainers: Trainers) => {
      return { ...trainers, [trainerName]: trainerInfo };
    });
    submitTrainers();
  };

  const addPokemonToTrainer = () => {
    let sprite_name = "";
    let is_important = false;
    let existingPokemon = trainers[currentTrainer]?.pokemon ?? [];
    let trainer_versions = trainers[currentTrainer]?.trainer_versions ?? [];

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
          level,
        },
      ],
    });
    scrollToBottom();
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
    submitTrainers();
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
      <Grid mt={5} mb={10}>
        <Grid.Col span={2}>
          <TextInput
            label="Trainer Name"
            value={currentTrainer}
            onChange={setCurrentTrainer}
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
      <ScrollArea.Autosize
        mah={"calc(100vh - 300px)"}
        offsetScrollbars
        viewportRef={viewport}
      >
        {!isNullEmptyOrUndefined(trainers) &&
          Object.keys(trainers).map((trainer, index) => {
            return (
              <div key={index}>
                <Grid columns={36}>
                  <Grid.Col span={2}>
                    <Title order={4} mt={20}>
                      {capitalize(trainer)}
                    </Title>
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <TrainerMenu
                      trainerName={trainer}
                      trainerInfo={trainers[trainer]}
                      functions={{
                        updateTrainer,
                        openSpriteModal,
                        openTrainerVersionsModal,
                        setTrainerToUpdate,
                        setTrainerVersions,
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

      <Modal
        opened={spriteModalOpened}
        onClose={closeSpriteModal}
        withCloseButton={false}
        title="Sprite Name"
      >
        <TextInput
          label="Use the names for the sprites found here: https://play.pokemonshowdown.com/sprites/trainers/"
          placeholder="Set a sprite name"
          defaultValue={trainers[trainerToUpdate.trainerName]?.sprite_name}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const { value } = e.target as HTMLInputElement;
              e.preventDefault();
              e.stopPropagation();
              updateTrainer(trainerToUpdate.trainerName, {
                ...trainerToUpdate.info,
                sprite_name: value,
              });
              notifications.show({
                message: "Sprite name updated successfully",
              });
              closeSpriteModal();
            }
          }}
        />
      </Modal>
      <Modal
        opened={trainerVersionsModalOpened}
        onClose={closeTrainerVersionsModal}
        withCloseButton={false}
        title="Sprite Name"
      >
        <MultiSelect
          label="Trainer Versions"
          data={trainerVersions}
          value={trainers[trainerToUpdate?.trainerName]?.trainer_versions}
          onChange={(value) =>
            updateTrainer(trainerToUpdate.trainerName, {
              ...trainerToUpdate.info,
              trainer_versions: value,
            })
          }
          searchable
          creatable
          getCreateLabel={(query) => `Create trainer version "${query}"`}
          onCreate={(query) => {
            setTrainerVersions([...trainerVersions, query]);
            return query;
          }}
        />
      </Modal>
    </>
  );
};

export default TrainersEncounterTab;
