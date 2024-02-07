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
  Title,
} from "@mantine/core";
import {
  getHotkeyHandler,
  useDisclosure,
  useHotkeys,
  useInputState,
} from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { useUpdateEffect } from "usehooks-ts";
import { useModifyLevelMoves } from "../../apis/pokemonApis";
import { useMovesStore } from "../../stores";
import { Move, MoveChange, PokemonChanges, PokemonData } from "../../types";
import MovesTable from "../MovesTable";
import classes from "./MovesTab.module.css";

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
    change: "move_name" | "level" | "operation" | "move_to_swap",
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
    ],
    []
  );

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
        <SimpleGrid cols={1}>
          <Button onClick={addNewRow}>Add Row</Button>
          <Table withBorder>
            <thead>
              <tr>
                <th>Move</th>
                <th>Operation</th>
                <th>Level</th>
                <th></th>
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
                        classNames={{
                          input: classes.input,
                        }}
                        error={movesList.indexOf(moveChange.move_name) === -1}
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
                        classNames={{ input: classes.input }}
                        rightSection={<div></div>}
                        data={["add", "replace", "shift", "swap"]}
                      />
                    </td>
                    <td>
                      {
                        // if operation is swap, show move_to_swap
                        moveChange.operation === "swap" ? (
                          <Autocomplete
                            value={moveChange.move_to_swap ?? ""}
                            onChange={(value) =>
                              handleMoveSetChange(index, "move_to_swap", value)
                            }
                            classNames={{
                              input: classes.input,
                            }}
                            error={
                              movesList.indexOf(
                                moveChange.move_to_swap ?? ""
                              ) === -1
                            }
                            data={movesList}
                          />
                        ) : (
                          <NumberInput
                            value={moveChange.level}
                            onChange={(value) =>
                              handleMoveSetChange(index, "level", value)
                            }
                            classNames={{ input: classes.input }}
                            rightSection={<div></div>}
                            min={1}
                            max={100}
                          />
                        )
                      }
                    </td>
                    <td>
                      <ActionIcon variant="subtle">
                        <IconTrash
                          size={"1rem"}
                          onClick={() => removeRow(index)}
                        />
                      </ActionIcon>
                    </td>
                  </tr>
                );
              })}
            </thead>
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
