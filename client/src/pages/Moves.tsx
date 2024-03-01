import {
  Autocomplete,
  Button,
  Grid,
  Progress,
  Tabs,
  Text,
} from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
// TODO: Find ways to compare objects without lodash
import _ from "lodash";
import { useState } from "react";
import useWebSocket from "react-use-websocket";
import { useGetMovesByName, useSaveMoveChanges } from "../apis/movesApis";
import MoveDetailsComponent from "../components/MoveDetailsComponent";
import { useUpdateEffect } from "../hooks/useUpdateEffect";
import { useMovesStore } from "../stores/movesStore";
import { MachineVersion, MoveDetails, PreparationState } from "../types";
import { isNullEmptyOrUndefined } from "../utils";

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

  const { refetch, data: moveSearchData } = useGetMovesByName({
    moveName,
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

  useUpdateEffect(() => {
    if (moveSearchData) {
      setMoveDetails(moveSearchData);
      setMoveDetailsChangeTracker(moveSearchData);
    }
  }, [moveSearchData]);

  return (
    <Tabs value={activeMoveTab} onChange={setActiveMoveTab}>
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
                  limit={5}
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
          <MoveDetailsComponent
            moveName={currentMoveName}
            moveDetails={moveDetails}
            handleMoveDetailChanges={handleMoveDetailChanges}
          />
        )}
      </Tabs.Panel>
      <Tabs.Panel value="prepare-move-data">
        <p>Prepare Data</p>
        <MovePreparationTab movesList={movesList} setMovesList={setMovesList} />
      </Tabs.Panel>
    </Tabs>
  );
};
export default Moves;

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
          <Text c="red">
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
