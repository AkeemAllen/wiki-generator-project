import {
  ActionIcon,
  Autocomplete,
  Box,
  Button,
  Modal,
  NativeSelect,
  NumberInput,
  SimpleGrid,
  Table,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure, useHotkeys, useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useModifyLevelMoves } from "../../apis/pokemonApis";
import { useUpdateEffect } from "../../hooks/useUpdateEffect";
import { useMovesStore } from "../../stores";
import classes from "../../styles/MovesTab.module.css";
import {
  Move,
  MoveChange,
  Operation,
  PokemonChanges,
  PokemonData,
} from "../../types";
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
  const seachMovesRef = useRef<HTMLInputElement>(null);

  const { mutate: modifyLevelMoves } = useModifyLevelMoves({
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
          move_to_swap: "",
          level: 1,
        },
      ];
    });
  };

  const removeRow = (index: number) => {
    setMoveSetChangeList((moveSetChangeList) => {
      const newMoveSetChangeList = [...moveSetChangeList];
      newMoveSetChangeList.splice(index, 1);
      return newMoveSetChangeList;
    });
  };

  // feels inefficient
  const handleMoveSetChange = (
    index: number,
    change: "move_name" | "level" | "operation" | "secondary_move",
    value: string | number
  ) => {
    setMoveSetChangeList((moveSetChangeList) => {
      const newMoveSetChangeList = [...moveSetChangeList];
      newMoveSetChangeList[index] = {
        ...newMoveSetChangeList[index],
        [change]: value,
      };

      // Setting current level of the move
      if (
        change === "move_name" &&
        Object.keys(moves).includes(value as string) &&
        moves[value as string].learn_method.includes("level-up")
      ) {
        newMoveSetChangeList[index].level =
          moves[value as string].level_learned_at;
      }
      return newMoveSetChangeList;
    });
  };

  const saveLevelMoveChanges = () => {
    if (moveSetChangeList.length === 0) {
      return;
    }
    for (let i = 0; i < moveSetChangeList.length; i++) {
      if (movesList.indexOf(moveSetChangeList[i].move_name) === -1) {
        notifications.show({
          message: `Move ${moveSetChangeList[i].move_name} does not exist`,
          color: "red",
        });
        return;
      }
    }
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

  useHotkeys(
    [
      ["alt+m", open],
      ["alt+l", addNewRow],
      ["alt+enter", saveLevelMoveChanges],
      ["alt+s", () => seachMovesRef.current?.focus()],
    ],
    []
  );

  return (
    <>
      <SimpleGrid cols={3} mt="50px">
        <Title order={2}>Moves</Title>
        <TextInput
          leftSection={<IconSearch size={"1rem"} />}
          placeholder="Search Moves"
          onChange={setSearchTerm}
          value={searchTerm}
          ref={seachMovesRef}
        />
        <Box w={200}>
          <Button leftSection={<IconPlus size={"1rem"} />} onClick={open}>
            Modify MoveSet
          </Button>
        </Box>
      </SimpleGrid>
      <MovesTable setMoves={setMoves} moves={moves} searchTerm={searchTerm} />
      <Modal
        opened={opened}
        withCloseButton={false}
        onClose={() => {
          setMoveSetChangeList([]);
          close();
        }}
        title={"Add New Move"}
        centered
        size={"lg"}
      >
        <SimpleGrid cols={1} mt={20}>
          <Button onClick={addNewRow}>Add Row</Button>
          <Table withTableBorder withRowBorders withColumnBorders={false}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Operation</Table.Th>
                <Table.Th>Move</Table.Th>
                <Table.Th>Level</Table.Th>
                <Table.Th>Secondary Move</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
              {moveSetChangeList.map((moveChange, index) => {
                const {
                  operation,
                  move_name: moveName,
                  secondary_move: secondaryMove,
                  level,
                } = moveChange;
                return (
                  <Table.Tr key={index}>
                    <Table.Td>
                      <NativeSelect
                        value={operation}
                        onChange={(event) =>
                          handleMoveSetChange(
                            index,
                            "operation",
                            event.currentTarget.value
                          )
                        }
                        classNames={{ input: classes.input }}
                        rightSection={<div></div>}
                        data={Object.values(Operation)}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Autocomplete
                        value={moveName}
                        onChange={(value) =>
                          handleMoveSetChange(index, "move_name", value)
                        }
                        classNames={{
                          input: classes.input,
                        }}
                        error={movesList.indexOf(moveName) === -1}
                        data={movesList}
                        limit={10}
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={level}
                        onChange={(value) =>
                          handleMoveSetChange(index, "level", value)
                        }
                        classNames={{ input: classes.input }}
                        rightSection={<div></div>}
                        disabled={
                          operation === Operation.DELETE ||
                          operation === Operation.SWAP_MOVES
                        }
                        min={1}
                        max={100}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Autocomplete
                        value={secondaryMove ?? ""}
                        onChange={(value) =>
                          handleMoveSetChange(index, "secondary_move", value)
                        }
                        classNames={{
                          input: classes.input,
                        }}
                        error={movesList.indexOf(secondaryMove ?? "") === -1}
                        disabled={
                          operation === Operation.DELETE ||
                          operation === Operation.ADD ||
                          operation === Operation.SHIFT ||
                          operation === Operation.REPLACE_BY_LEVEL
                        }
                        data={movesList}
                        limit={10}
                      />
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon variant="subtle">
                        <IconTrash
                          size={"1rem"}
                          onClick={() => removeRow(index)}
                        />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Thead>
          </Table>
          <Button
            onClick={saveLevelMoveChanges}
            disabled={moveSetChangeList.length === 0}
          >
            Save Changes
          </Button>
        </SimpleGrid>
      </Modal>
    </>
  );
};

export default MovesTab;
