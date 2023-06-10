import {
  Autocomplete,
  Button,
  Grid,
  NativeSelect,
  NumberInput,
  SimpleGrid,
  Title,
} from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useGetMovesByName, useSaveMoveChanges } from "../apis/movesApis";
import { Types } from "../constants";
import { useMovesStore } from "../stores/movesStore";
import { MoveDetails } from "../types";
import { isNullEmptyOrUndefined } from "../utils";

const Moves = () => {
  const [moveName, setMoveName] = useInputState<string>("");
  const [moveDetails, setMoveDetails] = useInputState<MoveDetails | null>(null);
  const movesList = useMovesStore((state) => state.movesList);

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
