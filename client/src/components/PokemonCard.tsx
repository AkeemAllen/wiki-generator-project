import { ActionIcon, Box, Card } from "@mantine/core";
import { useDisclosure, useInputState } from "@mantine/hooks";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useUpdateEffect } from "../hooks/useUpdateEffect";
import classes from "../styles/PokemonCard.module.css";
import { TrainerInfo, Trainers } from "../types";
import { capitalize, isNullEmptyOrUndefined } from "../utils";
import PokemonCardModal from "./PokemonCardModal";

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
  const [pokemonMoves, setPokemonMoves] = useInputState<string[]>([]);

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

  useUpdateEffect(() => {
    // Updates to the trainer versions was not immediately being reflected when selecting the version the pokemon belongs to
    // This is a fix to that problem
    setTrainerVersions(trainers[trainerName].trainer_versions || []);
  }, [trainers[trainerName]]);

  return (
    <>
      <Card withBorder shadow="sm" className={classes.pokemonCard}>
        {Object.keys(trainers).length > 0 &&
          trainers[trainerName].is_important && (
            <ActionIcon
              variant="filled"
              color="gray"
              classNames={{
                root: `${classes.actionIcon} ${classes.editIcon}`,
              }}
            >
              <IconEdit onClick={open} />
            </ActionIcon>
          )}
        <ActionIcon
          color="gray"
          variant="filled"
          classNames={{ root: `${classes.actionIcon} ${classes.deleteIcon}` }}
        >
          <IconTrash onClick={removePokemon} />
        </ActionIcon>
        <Card.Section style={{ display: "grid" }}>
          <img
            src={getSpriteUrl()}
            alt={pokemonName}
            width={80}
            style={{ justifySelf: "center" }}
          />
        </Card.Section>
        <Box
          style={{
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
