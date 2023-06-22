import {
  Autocomplete,
  Button,
  Checkbox,
  Grid,
  NativeSelect,
  NumberInput,
  SimpleGrid,
  Text,
  Title,
} from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import {
  useGetMovesByName,
  usePrepareMoveData,
  useSaveMoveChanges,
} from "../apis/movesApis";
import { Types } from "../constants";
import { useMovesStore } from "../stores/movesStore";
import { MoveDetails } from "../types";
import { isNullEmptyOrUndefined } from "../utils";

const Moves = () => {
  const [moveName, setMoveName] = useInputState<string>("");
  const [moveDetails, setMoveDetails] = useInputState<MoveDetails | null>(null);
  const movesList = useMovesStore((state) => state.movesList);
  const setMovesList = useMovesStore((state) => state.setMovesList);

  const [rangeStart, setRangeStart] = useInputState<number>(0);
  const [rangeEnd, setRangeEnd] = useInputState<number>(0);
  const [wipeCurrentData, setWipeCurrentData] = useState<boolean>(false);

  const { refetch } = useGetMovesByName({
    moveName,
    onSuccess: (data: any) => {
      setMoveDetails(data);
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
      range_end: rangeEnd,
      range_start: rangeStart,
      wipe_current_data: wipeCurrentData,
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
              <Text>
                We detected that there is no move data in this wiki right now.
                Do you want to prepare initial data with original moves data?
              </Text>
            </Grid.Col>
            <Grid.Col>
              <Text color="red">
                NOTE: THIS WILL TAKE SEVERAL MINUTES TO PREPARE ALL THE DATA
                DEPENDING ON THE RANGE YOU SET. The move data set is being
                downloaded from pokeapi and modified through the
                prepare_move_data funtion in the backend.
              </Text>
            </Grid.Col>
            <Grid.Col>
              <NumberInput
                label="Range Start"
                onChange={(value: number) => setRangeStart(value)}
                value={rangeStart}
                min={0}
              />
            </Grid.Col>
            <Grid.Col>
              <NumberInput
                label="Range End"
                onChange={(value: number) => setRangeEnd(value)}
                value={rangeEnd}
                min={0}
              />
            </Grid.Col>
            <Grid.Col>
              <Checkbox
                label="Wipe Current Data (Needs to be checked actually run the operation)"
                checked={wipeCurrentData}
                onChange={(event) =>
                  setWipeCurrentData(event.currentTarget.checked)
                }
              />
            </Grid.Col>
            <Grid.Col>
              <Button
                disabled={
                  rangeStart >= rangeEnd || rangeStart <= 0 || rangeEnd <= 0
                }
                onClick={handlePrepareInitialData}
                loading={isLoadingPrepareMovesData}
              >
                Prepare Initial Data
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
            {moveName}
          </Title>
          <SimpleGrid cols={2}>
            <NumberInput
              label="Power"
              value={moveDetails.power}
              onChange={(e: number) => handleMoveDetailChanges(e, "power")}
            />
            <NativeSelect
              label="Type"
              value={moveDetails.type}
              onChange={(e) => handleMoveDetailChanges(e.target.value, "type")}
              data={Object.keys(Types).map((key: string) => Types[key])}
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
        </>
      )}
    </>
  );
};

export default Moves;
