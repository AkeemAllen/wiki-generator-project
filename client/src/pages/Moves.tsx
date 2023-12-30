import {
  Autocomplete,
  Box,
  Button,
  Grid,
  NativeSelect,
  NumberInput,
  SimpleGrid,
  Table,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import {
  useGetMovesByName,
  usePrepareMoveData,
  useSaveMoveChanges,
} from "../apis/movesApis";
import { Types } from "../constants";
import { useMovesStore } from "../stores/movesStore";
import { MoveDetails } from "../types";
import { capitalize, isNullEmptyOrUndefined } from "../utils";

const Moves = () => {
  const [moveName, setMoveName] = useInputState<string>("");
  const [moveDetails, setMoveDetails] = useInputState<MoveDetails | null>(null);
  const movesList = useMovesStore((state) => state.movesList);
  const setMovesList = useMovesStore((state) => state.setMovesList);
  const machineMovesList = useMovesStore((state) => state.machineMovesList);
  const setMachineMovesList = useMovesStore(
    (state) => state.setMachineMovesList
  );
  const [activeTab, setActiveTab] = useState<string | null>("stats");

  const { refetch } = useGetMovesByName({
    moveName,
    onSuccess: (data: any) => {
      setMoveDetails({ ...data, machine_details: machineMovesList[moveName] });
    },
  });

  const { mutate: mutateMove } = useSaveMoveChanges({
    moveName,
    moveChanges: moveDetails as MoveDetails,
    onSuccess: () => {
      notifications.show({ message: "Changes Saved" });
      setMoveDetails(null);
    },
    onError: () => {
      notifications.show({ message: "Error Saving changes", color: "red" });
    },
  });

  const {
    mutate: mutatePrepareMovesData,
    isLoading: isLoadingPrepareMovesData,
  } = usePrepareMoveData({
    onSuccess: (data: any) => {
      notifications.show({ message: "Data Prepared" });
      setMovesList(data.moves);
    },
    onError: () => {},
  });

  const handlePrepareInitialData = () => {
    mutatePrepareMovesData({
      range_start: 1,
      range_end: 904,
      wipe_current_data: true,
    });
  };

  const handleSearch = () => {
    setMoveDetails(null);
    refetch();
  };

  const saveChanges = () => {
    mutateMove();
  };

  const handleMoveDetailChanges = (e: number | string, detail: string) => {
    setMoveDetails((moveDetails: MoveDetails) => {
      return {
        ...moveDetails,
        [detail]: e,
      };
    });
  };

  return (
    <>
      <Grid>
        {movesList.length === 0 ? (
          <>
            <Grid.Col>
              <Text>No move Data detected. Prepare all moves</Text>
            </Grid.Col>
            <Grid.Col>
              <Button
                onClick={handlePrepareInitialData}
                loading={isLoadingPrepareMovesData}
              >
                Prepare Move Data
              </Button>
            </Grid.Col>
          </>
        ) : (
          <>
            <Grid.Col span={6}>
              <Autocomplete
                placeholder="Move Name"
                onChange={setMoveName}
                data={movesList}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <Button
                fullWidth
                onClick={handleSearch}
                disabled={isNullEmptyOrUndefined(moveName)}
              >
                Search
              </Button>
            </Grid.Col>
            <Grid.Col span={3}>
              <Button
                fullWidth
                disabled={isNullEmptyOrUndefined(moveDetails)}
                onClick={saveChanges}
              >
                Save Changes
              </Button>
            </Grid.Col>
          </>
        )}
      </Grid>
      {moveDetails && (
        <>
          <Title order={2} mt="lg">
            {capitalize(moveName)}
          </Title>
          <Tabs mt={20} value={activeTab} onTabChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="stats">Stats</Tabs.Tab>
              <Tabs.Tab value="machine-information">
                Machine Information
              </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="stats">
              <SimpleGrid cols={2} mt={20}>
                <NumberInput
                  label="Power"
                  value={moveDetails.power}
                  onChange={(e: number) => handleMoveDetailChanges(e, "power")}
                />
                <NativeSelect
                  label="Type"
                  value={moveDetails.type}
                  onChange={(e) =>
                    handleMoveDetailChanges(e.target.value, "type")
                  }
                  data={Object.keys(Types).map((key: string) => Types[key])}
                />
                <NumberInput
                  label="Accuracy"
                  value={moveDetails.accuracy}
                  onChange={(e: number) =>
                    handleMoveDetailChanges(e, "accuracy")
                  }
                />
                <NumberInput
                  label="PP"
                  value={moveDetails.pp}
                  onChange={(e: number) => handleMoveDetailChanges(e, "pp")}
                />
                <NativeSelect
                  label="Damage Class"
                  value={moveDetails.damage_class}
                  onChange={(e) =>
                    handleMoveDetailChanges(e.target.value, "damage_class")
                  }
                  data={["physical", "special", "status"]}
                />
              </SimpleGrid>
            </Tabs.Panel>
            <Tabs.Panel value="machine-information">
              <Box w={200} mt="lg">
                <Button leftIcon={<IconPlus size={"1rem"} />}>
                  Add Version
                </Button>
              </Box>
              <Table withBorder mt="lg">
                <thead>
                  <tr>
                    <th>
                      <Title order={4}>Game Version</Title>
                    </th>
                    <th>
                      <Title order={4}>Technical Name</Title>
                    </th>
                    <th />
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {moveDetails.machine_details &&
                    moveDetails.machine_details.map((machineMove, index) => {
                      return (
                        <tr key={index}>
                          <td>{machineMove.game_version}</td>
                          <td>{machineMove.technical_name}</td>
                          <td>
                            <Button
                              leftIcon={<IconTrash size={"1rem"} />}
                              // onClick={() => deleteMove(key)}
                            >
                              Delete
                            </Button>
                          </td>
                          <td>
                            <Button
                              leftIcon={<IconEdit size={"1rem"} />}
                              // onClick={() => {
                              //   openEditMoveModal();
                              //   setMoveToEdit(key);
                              // }}
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </Table>
            </Tabs.Panel>
          </Tabs>
        </>
      )}
    </>
  );
};

export default Moves;
