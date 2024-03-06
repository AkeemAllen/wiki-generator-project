import {
  Autocomplete,
  Button,
  Grid,
  Modal,
  MultiSelect,
  Title,
} from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useMemo } from "react";
import { useEditTrainers } from "../apis/routesApis";
import {
  useAbilityStore,
  useItemsStore,
  useMovesStore,
  useNatureStore,
  useRouteStore,
} from "../stores";
import {
  ImportantTrainerInfo,
  ImportantTrainers,
  TrainerInfo,
  TrainerPokemonOrWildPokemon,
  Trainers,
} from "../types";
import { capitalize } from "../utils";

type PokemonCardModalProps = {
  opened: boolean;
  close: () => void;
  pokemon: TrainerPokemonOrWildPokemon;
  trainerInfo: TrainerInfo | ImportantTrainerInfo;
  trainers: Trainers | ImportantTrainers;
  routeName: string;
  trainerName: string;
};

const PokemonCardModal = ({
  opened,
  close,
  routeName,
  pokemon,
  trainers,
  trainerName,
  trainerInfo,
}: PokemonCardModalProps) => {
  const setRoutes = useRouteStore((state) => state.setRoutes);
  const movesList = useMovesStore((state) => state.movesList);
  const naturesList = useNatureStore((state) => state.naturesList);
  const abilityList = useAbilityStore((state) => state.abilityList);
  const itemsList = useItemsStore((state) => state.itemsList);

  const [item, setItem] = useInputState<string>(pokemon?.item || "");
  const [nature, setNature] = useInputState<string>(pokemon?.nature || "");
  const [ability, setAbility] = useInputState<string>(pokemon?.ability || "");
  const [pokemonMoves, setPokemonMoves] = useInputState<string[]>(
    pokemon?.moves || []
  );
  const [trainerVersionsPokemonBelongsTo, setTrainerVersionsPokemonBelongsTo] =
    useInputState<string[]>(pokemon?.trainer_version || []);

  const { mutate: submitTrainers } = useEditTrainers((data) =>
    setRoutes(data.routes)
  );

  const trainerVersions = useMemo(() => {
    return (trainerInfo as ImportantTrainerInfo)?.trainer_versions || [];
  }, [trainerInfo]);

  const updatePokemon = () => {
    let currentTrainers = { ...trainers };
    const updatedPokemon = currentTrainers[trainerName].pokemon.map((p) => {
      if (p.id === pokemon.id) {
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
    });
    currentTrainers[trainerName] = {
      ...trainerInfo,
      pokemon: updatedPokemon,
    };
    submitTrainers({
      routeName,
      important_trainers: currentTrainers as ImportantTrainers,
    });
    notifications.show({ message: "Pokemon Updated Successfully" });
  };

  return (
    <Modal opened={opened} onClose={close} withCloseButton={false} size={500}>
      <Title order={2} mb={20}>
        {capitalize((pokemon?.name as string) || "")}
      </Title>
      <Grid mb={20}>
        <Grid.Col span={6}>
          <Autocomplete
            label="Held Item"
            placeholder="<empty>"
            value={item}
            onChange={setItem}
            data={itemsList}
            limit={10}
          />
          <Autocomplete
            label="Ability"
            placeholder="<empty>"
            value={ability}
            onChange={setAbility}
            data={abilityList}
            limit={10}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Autocomplete
            placeholder="<empty>"
            label="Nature"
            value={nature}
            onChange={setNature}
            data={naturesList}
            limit={10}
          />
          <MultiSelect
            label="Trainer Version"
            placeholder="<empty>"
            value={trainerVersionsPokemonBelongsTo}
            onChange={setTrainerVersionsPokemonBelongsTo}
            data={trainerVersions}
          />
        </Grid.Col>
      </Grid>
      Moves
      <MultiSelect
        value={pokemonMoves}
        onChange={setPokemonMoves}
        data={movesList}
        searchable
        limit={5}
      />
      <Button mt={"lg"} onClick={updatePokemon}>
        Update
      </Button>
    </Modal>
  );
};

export default PokemonCardModal;
