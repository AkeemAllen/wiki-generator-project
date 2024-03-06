import {
  Button,
  Modal,
  MultiSelect,
  NumberInput,
  Table,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { Move } from "../types";

type MovesTableProps = {
  moves: Move;
  setMoves: any;
  searchTerm: string;
};

const MovesTable = ({ moves, setMoves, searchTerm }: MovesTableProps) => {
  const [
    editMoveModalOpened,
    { open: openEditMoveModal, close: closeEditMoveModal },
  ] = useDisclosure(false);
  const [moveToEdit, setMoveToEdit] = useState<string>("");

  const displayLearnMethod = (learn_method: string | string[]) => {
    if (Array.isArray(learn_method)) {
      return learn_method.join(", ");
    }
    return learn_method;
  };

  const handleMethodMoveChange = (
    method: string | string[],
    move_name: string
  ) => {
    setMoves((moves: Move) => {
      return {
        ...moves,
        [move_name]: {
          ...moves[move_name],
          learn_method: method,
        },
      };
    });
  };

  const handleLevelMoveChange = (level: number, move_name: string) => {
    setMoves((moves: Move) => {
      return {
        ...moves,
        [move_name]: {
          ...moves[move_name],
          level_learned_at: level,
        },
      };
    });
  };

  const deleteMove = (move_name: string) => {
    setMoves((moves: Move) => {
      return {
        ...moves,
        [move_name]: {
          ...moves[move_name],
          delete: true,
        },
      };
    });
  };

  return (
    <>
      <Table withRowBorders withTableBorder withColumnBorders={false} mt="lg">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>
              <Title order={4}>Move</Title>
            </Table.Th>
            <Table.Th>
              <Title order={4}>Learn Method</Title>
            </Table.Th>
            <Table.Th>
              <Title order={4}>Learn level</Title>
            </Table.Th>
            <Table.Th />
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {/**There might be better ways of sorting here versus using .filter and .map */}
          {Object.keys(moves)
            .filter((key: string) => moves[key].delete !== true)
            .filter((key: string) => key.includes(searchTerm))
            .map((key: string, index: number) => {
              return (
                <Table.Tr key={index}>
                  <Table.Td>{key}</Table.Td>
                  <Table.Td>
                    {displayLearnMethod(moves[key].learn_method)}
                  </Table.Td>
                  <Table.Td>{moves[key].level_learned_at}</Table.Td>
                  <Table.Td>
                    <Button
                      leftSection={<IconEdit size={"1rem"} />}
                      onClick={() => {
                        openEditMoveModal();
                        setMoveToEdit(key);
                      }}
                    >
                      Edit
                    </Button>
                  </Table.Td>
                  <Table.Td>
                    <Button
                      leftSection={<IconTrash size={"1rem"} />}
                      onClick={() => deleteMove(key)}
                    >
                      Delete
                    </Button>
                  </Table.Td>
                </Table.Tr>
              );
            })}
        </Table.Tbody>
      </Table>

      <Modal
        opened={editMoveModalOpened}
        onClose={closeEditMoveModal}
        title={"Edit Move"}
        centered
        withCloseButton={false}
      >
        <TextInput value={moveToEdit} disabled label="Move Name" />
        <MultiSelect
          mt="lg"
          mb="lg"
          label="Learn Method"
          value={
            typeof moves[moveToEdit]?.learn_method === "string"
              ? ([moves[moveToEdit]?.learn_method] as string[])
              : (moves[moveToEdit]?.learn_method as string[])
          }
          onChange={(e) => handleMethodMoveChange(e, moveToEdit)}
          data={["level-up", "machine", "egg", "tutor"]}
        />

        {moves[moveToEdit]?.learn_method.includes("level-up") && (
          <NumberInput
            mb="lg"
            label="Level"
            value={moves[moveToEdit]?.level_learned_at}
            onChange={(e) => handleLevelMoveChange(e as number, moveToEdit)}
          />
        )}
        <Button onClick={closeEditMoveModal}>Close</Button>
      </Modal>
    </>
  );
};

export default MovesTable;
