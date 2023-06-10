import {
  ActionIcon,
  Autocomplete,
  Box,
  Button,
  Card,
  Grid,
  Modal,
  MultiSelect,
  Title,
} from "@mantine/core";
import { useDisclosure, useInputState } from "@mantine/hooks";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import {
  useAbilityStore,
  useItemsStore,
  useMovesStore,
  useNatureStore,
} from "../stores";
import { TrainerInfo, Trainers } from "../types";
import { capitalize, isNullEmptyOrUndefined } from "../utils";

type PokemonCardModalProps = {
  opened: boolean;
  close: () => void;
  pokemonName: string;
  pokemonMoves: string[];
  ability: string;
  nature: string;
  item: string;
  trainerVersionsList: string[];
  trainerVersions: string[];
  setTrainerVersions: (trainerVersions: string[]) => void;
  setPokemonMoves: (moves: string[]) => void;
  setAbility: (ability: string) => void;
  setNature: (nature: string) => void;
  setItem: (item: string) => void;
  updatePokemon: () => void;
};

const PokemonCardModal = ({
  opened,
  close,
  pokemonName,
  pokemonMoves,
  ability,
  nature,
  item,
  setPokemonMoves,
  setAbility,
  setNature,
  setItem,
  updatePokemon,
  trainerVersionsList,
  trainerVersions,
  setTrainerVersions,
}: PokemonCardModalProps) => {
  const movesList = useMovesStore((state) => state.movesList);
  const naturesList = useNatureStore((state) => state.naturesList);
  const abilityList = useAbilityStore((state) => state.abilityList);
  const itemsList = useItemsStore((state) => state.itemsList);

  const handleMoveChange = (index: number, value: string) => {
    pokemonMoves[index] = value;
    setPokemonMoves([...pokemonMoves]);
  };

  return (
    <Modal opened={opened} onClose={close} withCloseButton={false} size={500}>
      <Title order={2} mb={20}>
        {capitalize(pokemonName)}
      </Title>
      <Grid mb={20}>
        <Grid.Col span={6}>
          <Autocomplete
            label="Held Item"
            placeholder="<empty>"
            value={item}
            onChange={setItem}
            data={itemsList}
          />
          <Autocomplete
            label="Ability"
            placeholder="<empty>"
            value={ability}
            onChange={setAbility}
            data={abilityList}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Autocomplete
            placeholder="<empty>"
            label="Nature"
            value={nature}
            onChange={setNature}
            data={naturesList}
          />
          <MultiSelect
            label="Trainer Version"
            placeholder="<empty>"
            value={trainerVersions}
            onChange={setTrainerVersions}
            data={trainerVersionsList}
          />
        </Grid.Col>
      </Grid>
      Moves
      <Grid>
        {pokemonMoves.map((move, index) => {
          return (
            <Grid.Col key={index} span={6}>
              <Autocomplete
                placeholder="<empty>"
                key={index}
                value={move}
                onChange={(value: string) => handleMoveChange(index, value)}
                data={movesList}
              />
            </Grid.Col>
          );
        })}
      </Grid>
      <Button mt={"lg"} onClick={updatePokemon}>
        Update
      </Button>
    </Modal>
  );
};

type PokemonCardProps = {
  removePokemon: () => void;
  pokemonName: string;
  pokemonId: number;
  encounterRate?: number;
  level?: number;
  routeName?: string;
  trainerName?: string;
  trainers?: Trainers;
  updateTrainer?: (trainerName: string, trainerInfo: TrainerInfo) => void;
};

const PokemonCard = ({
  removePokemon,
  pokemonName,
  pokemonId,
  encounterRate,
  level,
  trainers = {},
  trainerName = "",
  updateTrainer = () => {},
}: PokemonCardProps) => {
  const getSpriteUrl = () => {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
  };

  const [opened, { open, close }] = useDisclosure(false);
  const [item, setItem] = useInputState<string>("?");
  const [nature, setNature] = useInputState<string>("?");
  const [ability, setAbility] = useInputState<string>("?");
  const [trainerVersionsPokemonBelongsTo, setTrainerVersionsPokemonBelongsTo] =
    useInputState<string[]>([]);
  const [trainerVersions, setTrainerVersions] = useState<string[]>([]);
  const [pokemonMoves, setPokemonMoves] = useInputState<string[]>([
    "",
    "",
    "",
    "",
  ]);

  const updatePokemon = () => {
    updateTrainer(trainerName, {
      ...trainers[trainerName],
      pokemon: trainers[trainerName].pokemon.map((p) => {
        if (p.name === pokemonName) {
          return {
            ...p,
            item,
            nature,
            ability,
            moves: pokemonMoves.filter((m) => m !== ""),
            trainer_version: trainerVersionsPokemonBelongsTo,
          };
        }
        return p;
      }),
    });
    close();
  };

  useEffect(() => {
    if (trainers && trainerName && trainers[trainerName]) {
      const pokemon = trainers[trainerName].pokemon.find(
        (p) => p.name === pokemonName
      );
      if (pokemon) {
        setItem(pokemon.item);
        setNature(pokemon.nature);
        setAbility(pokemon.ability);
        setTrainerVersionsPokemonBelongsTo(pokemon.trainer_version);
        if (pokemon.moves) {
          while (pokemon.moves?.length < 4) {
            pokemon.moves.push("");
          }
          setPokemonMoves(pokemon.moves);
        }
        setTrainerVersions(trainers[trainerName].trainer_versions || []);
      }
    }
  }, [pokemonName]);

  return (
    <>
      <Card
        withBorder
        shadow="sm"
        sx={{
          ":hover > #action-icon": {
            display: "block",
          },
        }}
      >
        {Object.keys(trainers).length > 0 &&
          trainers[trainerName].is_important && (
            <ActionIcon
              variant="filled"
              id="action-icon"
              sx={{
                display: "none",
                position: "absolute",
                right: 50,
                top: 10,
                zIndex: 1,
              }}
            >
              <IconEdit onClick={open} />
            </ActionIcon>
          )}
        <ActionIcon
          variant="filled"
          id="action-icon"
          sx={{
            display: "none",
            position: "absolute",
            right: 10,
            top: 10,
            zIndex: 1,
          }}
        >
          <IconTrash onClick={removePokemon} />
        </ActionIcon>
        <Card.Section sx={{ display: "grid" }}>
          <img
            src={getSpriteUrl()}
            alt={pokemonName}
            width={80}
            style={{ justifySelf: "center" }}
          />
        </Card.Section>
        <Box
          sx={{
            border: "2px solid #e9ecef",
            borderRadius: "5px",
            textAlign: "center",
          }}
          p={10}
          pt={2}
          pb={2}
        >
          {capitalize(pokemonName)}
          <br />
          {!isNullEmptyOrUndefined(encounterRate)
            ? `${encounterRate}%`
            : `lv.${level}`}
        </Box>
      </Card>
      <PokemonCardModal
        opened={opened}
        close={close}
        pokemonName={pokemonName}
        pokemonMoves={pokemonMoves}
        ability={ability}
        nature={nature}
        item={item}
        trainerVersionsList={trainerVersions}
        trainerVersions={trainerVersionsPokemonBelongsTo}
        setTrainerVersions={setTrainerVersionsPokemonBelongsTo}
        setPokemonMoves={setPokemonMoves}
        setAbility={setAbility}
        setNature={setNature}
        setItem={setItem}
        updatePokemon={updatePokemon}
      />
    </>
  );
};

export default PokemonCard;
