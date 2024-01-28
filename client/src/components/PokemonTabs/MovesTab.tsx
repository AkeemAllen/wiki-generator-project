import {
  Autocomplete,
  Box,
  Button,
  Modal,
  NativeSelect,
  NumberInput,
  SimpleGrid,
  Table,
  Title,
} from "@mantine/core";
import { getHotkeyHandler, useDisclosure, useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { useUpdateEffect } from "usehooks-ts";
import { useModifyLevelMoves } from "../../apis/pokemonApis";
import { useMovesStore } from "../../stores";
import { Move, MoveChange, PokemonChanges, PokemonData } from "../../types";
import MovesTable from "../MovesTable";

type MovesTabProps = {
  pokemonData: PokemonData;
  pokemonChanges: PokemonChanges | null;
  setPokemonChanges: any;
  refreshSearch: () => void;
};

const MovesTab = ({
  pokemonChanges,
  setPokemonChanges,
  pokemonData,
  refreshSearch,
}: MovesTabProps) => {
  const movesList = useMovesStore((state) => state.movesList);

  const [moves, setMoves] = useState<Move>(pokemonData.moves);
  const [searchTerm, setSearchTerm] = useInputState<string>("");
  const [opened, { open, close }] = useDisclosure(false);
  const [moveSetChangeList, setMoveSetChangeList] = useState<MoveChange[]>([]);

  const { mutate: modifyLevelMoves, isLoading: isLoadingModifyLevelMoves } =
    useModifyLevelMoves({
      onSuccess: (data: any) => {
        refreshSearch();
        notifications.show({ message: data.message });
      },
    });

  const addNewRow = () => {
    setMoveSetChangeList((moveSetChangeList) => {
      return [
        ...moveSetChangeList,
        {
          move_name: "",
          operation: "add",
          level: 0,
        },
      ];
    });
  };

  // feels inefficient
  const handleMoveSetChange = (
    index: number,
    change: "move_name" | "level" | "operation",
    value: string | number
  ) => {
    setMoveSetChangeList((moveSetChangeList) => {
      const newMoveSetChangeList = [...moveSetChangeList];
      newMoveSetChangeList[index] = {
        ...newMoveSetChangeList[index],
        [change]: value,
      };
      return newMoveSetChangeList;
    });
  };

  const saveLevelMoveChanges = () => {
    modifyLevelMoves({
      pokemon_move_changes: {
        pokemon: pokemonData.name,
        move_changes: moveSetChangeList,
      },
    });
  };

  useUpdateEffect(() => {
    setPokemonChanges({
      ...pokemonChanges,
      moves: moves,
    });
  }, [moves]);

  return (
    <>
      <SimpleGrid cols={3} mt="50px">
        <Title order={2}>Moves</Title>
        <Autocomplete
          icon={<IconSearch size={"1rem"} />}
          placeholder="Search Moves"
          onChange={setSearchTerm}
          value={searchTerm}
          onKeyDown={getHotkeyHandler([["enter", () => console.log("enter")]])}
          data={Object.keys(moves)}
        />
        <Box w={200}>
          <Button leftIcon={<IconPlus size={"1rem"} />} onClick={open}>
            Modify MoveSet
          </Button>
        </Box>
      </SimpleGrid>
      <MovesTable setMoves={setMoves} moves={moves} searchTerm={searchTerm} />;
      <Modal
        opened={opened}
        withCloseButton={false}
        onClose={close}
        title={"Add New Move"}
        centered
      >
        <Button onClick={addNewRow}>Add Row</Button>
        <Table withBorder>
          <thead>
            <tr>
              <th>Move</th>
              <th>Operation</th>
              <th>Level</th>
            </tr>
            {moveSetChangeList.map((moveChange, index) => {
              return (
                <tr key={index}>
                  <td>
                    <Autocomplete
                      value={moveChange.move_name}
                      onChange={(value) =>
                        handleMoveSetChange(index, "move_name", value)
                      }
                      data={movesList}
                    />
                  </td>
                  <td>
                    <NativeSelect
                      value={moveChange.operation}
                      onChange={(event) =>
                        handleMoveSetChange(
                          index,
                          "operation",
                          event.currentTarget.value
                        )
                      }
                      data={["add", "replace", "shift"]}
                    />
                  </td>
                  <td>
                    <NumberInput
                      value={moveChange.level}
                      onChange={(value) =>
                        handleMoveSetChange(index, "level", value)
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </thead>
        </Table>
        <Button onClick={saveLevelMoveChanges}>Save Changes</Button>
      </Modal>
    </>
  );
};

export default MovesTab;
