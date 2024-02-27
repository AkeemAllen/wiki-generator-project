import {
  Autocomplete,
  Button,
  Grid,
  Modal,
  MultiSelect,
  Title,
} from "@mantine/core";
import {
  useAbilityStore,
  useItemsStore,
  useMovesStore,
  useNatureStore,
} from "../stores";
import { capitalize } from "../utils";

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
            value={trainerVersions}
            onChange={setTrainerVersions}
            data={trainerVersionsList}
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
