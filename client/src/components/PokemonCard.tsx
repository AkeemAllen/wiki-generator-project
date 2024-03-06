import { ActionIcon, Box, Card } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import classes from "../styles/PokemonCard.module.css";
import {
  ImportantTrainerInfo,
  ImportantTrainers,
  TrainerInfo,
  TrainerPokemonOrWildPokemon,
  Trainers,
} from "../types";
import { capitalize, isNullEmptyOrUndefined } from "../utils";
import PokemonCardModal from "./PokemonCardModal";

type PokemonCardProps = {
  removePokemon: () => void;
  routeName?: string;
  trainerName?: string;
  is_important_trainer?: boolean;
  trainerInfo?: TrainerInfo | ImportantTrainerInfo;
  trainers?: Trainers | ImportantTrainers;
  pokemon: TrainerPokemonOrWildPokemon;
};

const PokemonCard = ({
  removePokemon,
  trainerName = "",
  is_important_trainer,
  routeName = "",
  trainers = {} as Trainers | ImportantTrainers,
  trainerInfo = {} as TrainerInfo | ImportantTrainerInfo,
  pokemon,
}: PokemonCardProps) => {
  const [
    pokemonCardModalOpened,
    { open: openPokemonCardModal, close: closePokemonCardModal },
  ] = useDisclosure(false);

  const getSpriteUrl = () => {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon?.id}.png`;
  };

  return (
    <>
      <Card withBorder shadow="sm" className={classes.pokemonCard}>
        {is_important_trainer && (
          <ActionIcon
            variant="filled"
            color="gray"
            classNames={{
              root: `${classes.actionIcon} ${classes.editIcon}`,
            }}
          >
            <IconEdit onClick={openPokemonCardModal} />
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
            alt={pokemon?.name}
            width={80}
            style={{ justifySelf: "center" }}
          />
        </Card.Section>
        <Box className={classes.nameBox} p={10} pt={2} pb={2}>
          {capitalize((pokemon?.name as string) || "")}
          <br />
          {!isNullEmptyOrUndefined(pokemon?.encounter_rate)
            ? `${pokemon?.encounter_rate}%`
            : `lv.${pokemon?.level}`}
        </Box>
      </Card>
      {is_important_trainer && (
        <PokemonCardModal
          opened={pokemonCardModalOpened}
          close={closePokemonCardModal}
          routeName={routeName}
          trainerName={trainerName}
          pokemon={pokemon}
          trainers={trainers}
          trainerInfo={trainerInfo}
        />
      )}
    </>
  );
};

export default PokemonCard;
