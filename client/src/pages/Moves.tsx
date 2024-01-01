import {
  Autocomplete,
  Box,
  Button,
  Grid,
  Modal,
  NativeSelect,
  NumberInput,
  SimpleGrid,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure, useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
// TODO: Find ways to compare objects without lodash
import _ from "lodash";
import { useState } from "react";
import {
  useGetMovesByName,
  usePrepareMoveData,
  useSaveMoveChanges,
} from "../apis/movesApis";
import { Types } from "../constants";
import { useMovesStore } from "../stores/movesStore";
import { MachineDetails, MoveDetails, PokemonVersions } from "../types";
import { capitalize, isNullEmptyOrUndefined } from "../utils";

const Moves = () => {
  const [moveName, setMoveName] = useInputState<string>("");

  // This makes sure the page title doesn't change when moveName changes
  const [currentMoveName, setCurrentMoveName] = useInputState<string>("");
  const [moveDetails, setMoveDetails] = useState<MoveDetails>();

  // To compare original state of moveDetails to the current state
  const [moveDetailsChangeTracker, setMoveDetailsChangeTracker] =
    useState<MoveDetails>();
  const movesList = useMovesStore((state) => state.movesList);
  const setMovesList = useMovesStore((state) => state.setMovesList);
  const machineMovesList = useMovesStore((state) => state.machineMovesList);
  const setMachineMovesList = useMovesStore(
    (state) => state.setMachineMovesList
  );

  const { refetch } = useGetMovesByName({
    moveName,
    onSuccess: (data: any) => {
      setMoveDetails({
        ...data,
        machine_details:
          machineMovesList[moveName as keyof typeof machineMovesList],
      });
      setMoveDetailsChangeTracker({
        ...data,
        machine_details:
          machineMovesList[moveName as keyof typeof machineMovesList],
      });
    },
  });

  const { mutate: mutateMove, isLoading: isLoadingMutateMove } =
    useSaveMoveChanges({
      moveName,
      moveChanges: moveDetails as MoveDetails,
      onSuccess: () => {
        notifications.show({ message: "Changes Saved" });
      },
      onError: () => {
        notifications.show({ message: "Error Saving changes", color: "red" });
      },
    });

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
        <EmptyMoveList movesList={movesList} setMovesList={setMovesList} />
        {movesList.length > 0 && (
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
                onClick={() => {
                  setCurrentMoveName(moveName);
                  refetch();
                }}
                disabled={isNullEmptyOrUndefined(moveName)}
              >
                Search
              </Button>
            </Grid.Col>
            <Grid.Col span={3}>
              <Button
                fullWidth
                loading={isLoadingMutateMove}
                disabled={_.isEqual(moveDetailsChangeTracker, moveDetails)}
                onClick={() => mutateMove()}
              >
                Save Changes
              </Button>
            </Grid.Col>
          </>
        )}
      </Grid>
      {moveDetails && (
        <MoveDetails
          moveName={currentMoveName}
          moveDetails={moveDetails}
          handleMoveDetailChanges={handleMoveDetailChanges}
        />
      )}
    </>
  );
};
export default Moves;

type MoveDetailsProps = {
  moveName: string;
  moveDetails: MoveDetails;
  handleMoveDetailChanges: (e: number | string, detail: string) => void;
};

const MoveDetails = ({
  moveName,
  moveDetails,
  handleMoveDetailChanges,
}: MoveDetailsProps) => {
  const [activeTab, setActiveTab] = useState<string | null>("stats");
  return (
    <>
      <Title order={2} mt="lg">
        {capitalize(moveName)}
      </Title>
      <Tabs mt={20} value={activeTab} onTabChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="stats">Stats</Tabs.Tab>
          <Tabs.Tab value="machine-information">Machine Information</Tabs.Tab>
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
              onChange={(e) => handleMoveDetailChanges(e.target.value, "type")}
              data={Object.keys(Types).map(
                (key: string) => Types[key as keyof typeof Types]
              )}
            />
            <NumberInput
              label="Accuracy"
              value={moveDetails.accuracy}
              onChange={(e: number) => handleMoveDetailChanges(e, "accuracy")}
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
          <MachineInformation moveDetails={moveDetails} />
        </Tabs.Panel>
      </Tabs>
    </>
  );
};

type MachineInformationProps = {
  moveDetails: MoveDetails;
};

const MachineInformation = ({ moveDetails }: MachineInformationProps) => {
  const [
    newVersionModalOpened,
    { open: openNewVersionModal, close: closeNewVersionModal },
  ] = useDisclosure(false);
  const [newMachineVersion, setnewMachineVersion] = useState<MachineDetails>();
  return (
    <>
      <Box w={200} mt="lg">
        <Button
          leftIcon={<IconPlus size={"1rem"} />}
          onClick={openNewVersionModal}
        >
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
      <Modal
        opened={newVersionModalOpened}
        withCloseButton={false}
        onClose={closeNewVersionModal}
        title={"Add New Version"}
        centered
      >
        <NativeSelect
          mt="lg"
          mb="lg"
          label="Game Version"
          onChange={(e) =>
            setnewMachineVersion({
              ...newMachineVersion,
              game_version: e.target.value,
            })
          }
          data={(
            Object.keys(PokemonVersions) as (keyof typeof PokemonVersions)[]
          ).map((key, index) => {
            return PokemonVersions[key];
          })}
        />
        <TextInput
          mb="lg"
          label="Technical Name"
          onChange={(e) =>
            setnewMachineVersion({
              ...newMachineVersion,
              technical_name: e.target.value,
            })
          }
        />
        {/* <Button onClick={() => addNewMove(newMove)}>Save</Button> */}
      </Modal>
    </>
  );
};

const EmptyMoveList = ({ movesList, setMovesList }: any) => {
  if (movesList.length > 0) return null;

  const {
    mutate: mutatePrepareMovesData,
    isLoading: isLoadingPrepareMovesData,
  } = usePrepareMoveData({
    onSuccess: (data: any) => {
      notifications.show({ message: "Data Prepared" });
      console.log(data.moves);
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
  return (
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
  );
};
