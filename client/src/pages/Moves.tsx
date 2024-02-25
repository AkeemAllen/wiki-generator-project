import {
  Autocomplete,
  Button,
  Grid,
  NativeSelect,
  NumberInput,
  Progress,
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
import useWebSocket from "react-use-websocket";
import { useGetMovesByName, useSaveMoveChanges } from "../apis/movesApis";
import MachineDetails from "../components/MachineDetails";
import { Types } from "../constants";
import { useUpdateEffect } from "../hooks/useUpdateEffect";
import { useMovesStore } from "../stores/movesStore";
import { MachineVersion, MoveDetails, PreparationState } from "../types";
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

  const [activeMoveTab, setActiveMoveTab] = useState<string | null>("moves");

  const { refetch } = useGetMovesByName({
    moveName,
    onSuccess: (data: any) => {
      setMoveDetails(data);
      setMoveDetailsChangeTracker(data);
    },
  });

  const { mutate: mutateMove, isPending: isPendingMutateMove } =
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
    <Tabs value={activeMoveTab} onTabChange={setActiveMoveTab}>
      <Tabs.List>
        {movesList.length > 0 && <Tabs.Tab value="moves">Moves</Tabs.Tab>}
        <Tabs.Tab value="prepare-move-data">Prepare Data</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="moves">
        <Grid mt={20}>
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
                  loading={isPendingMutateMove}
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
      </Tabs.Panel>
      <Tabs.Panel value="prepare-move-data">
        <MovePreparationTab movesList={movesList} setMovesList={setMovesList} />
      </Tabs.Panel>
    </Tabs>
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

const SOCKET_URL = `${
  import.meta.env.VITE_WEBSOCKET_BASE_URL
}/moves/prepare-data`;

const MovePreparationTab = ({ movesList, setMovesList }: any) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const { sendJsonMessage, lastMessage } = useWebSocket(SOCKET_URL, {
    shouldReconnect: () => true,
  });

  const handlePrepareData = () => {
    sendJsonMessage({
      range_start: 1,
      range_end: 904,
      wipe_current_data: true,
    });
  };

  useUpdateEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);

      if (data["state"] === PreparationState.START) {
        notifications.show({ message: data["message"] });
        setIsLoading(true);
      }

      if (data["state"] === PreparationState.IN_PROGRESS)
        setProgress(data["progress"]);

      if (data["state"] === PreparationState.COMPLETE) {
        notifications.show({ message: data["message"] });
        setIsLoading(false);
      }

      if (data["state"] === PreparationState.FINISHED) {
        notifications.show({ message: data["message"] });
        setIsLoading(false);

        setMovesList(data["moves"]);
      }
    }
  }, [lastMessage]);

  return (
    <Grid mt={20}>
      {movesList.length == 0 ? (
        <Grid.Col>
          <Text>No move Data detected. Prepare all moves</Text>
          <Text color="red">
            Note: All Move data must be prepared or else errors will occur
            durint wiki generation
          </Text>
        </Grid.Col>
      ) : (
        <Grid.Col>
          <Text>Move Data detected. No need for regeneration</Text>
        </Grid.Col>
      )}
      <Grid.Col>
        <Button onClick={handlePrepareData} loading={isLoading}>
          Prepare Move Data
        </Button>
      </Grid.Col>
      <Grid.Col>
        {progress > 0 && progress < 100 && <Progress value={progress} />}
      </Grid.Col>
    </Grid>
  );
};
