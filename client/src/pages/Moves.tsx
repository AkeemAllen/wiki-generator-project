import {
  Autocomplete,
  Button,
  Grid,
  NativeSelect,
  NumberInput,
  SimpleGrid,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
// TODO: Find ways to compare objects without lodash
import _ from "lodash";
import { useState } from "react";
import {
  useGetMovesByName,
  usePrepareMoveData,
  useSaveMoveChanges,
} from "../apis/movesApis";
import MachineDetails from "../components/MachineDetails";
import { Types } from "../constants";
import { useMovesStore } from "../stores/movesStore";
import { MachineVersion, MoveDetails } from "../types";
import { capitalize, isNullEmptyOrUndefined } from "../utils";

const Moves = () => {
  const [moveName, setMoveName] = useInputState<string>("");

  // This makes sure the page title doesn't change when moveName changes
  const [currentMoveName, setCurrentMoveName] = useInputState<string>("");
  const [moveDetails, setMoveDetails] = useState<MoveDetails>(
    {} as MoveDetails
  );

  // To compare original state of moveDetails to the current state
  const [moveDetailsChangeTracker, setMoveDetailsChangeTracker] =
    useState<MoveDetails>({} as MoveDetails);
  const movesList = useMovesStore((state) => state.movesList);
  const setMovesList = useMovesStore((state) => state.setMovesList);

  const { refetch } = useGetMovesByName({
    moveName,
    onSuccess: (data: any) => {
      setMoveDetails(data);
      setMoveDetailsChangeTracker(data);
    },
  });

  const { mutate: mutateMove, isLoading: isLoadingMutateMove } =
    useSaveMoveChanges({
      moveName,
      moveDetails,
      onSuccess: () => {
        notifications.show({ message: "Changes Saved" });
        setMoveDetailsChangeTracker(moveDetails);
      },
      onError: () => {
        notifications.show({ message: "Error Saving changes", color: "red" });
      },
    });

  const handleMoveDetailChanges = (
    e: number | string | MachineVersion[],
    detail: string
  ) => {
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
      {!isNullEmptyOrUndefined(currentMoveName) && (
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
  handleMoveDetailChanges: (
    e: number | string | MachineVersion[],
    detail: string
  ) => void;
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
          <MachineDetails
            moveDetails={moveDetails}
            handleMoveDetailsChange={handleMoveDetailChanges}
          />
        </Tabs.Panel>
      </Tabs>
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
