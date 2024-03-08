import { Autocomplete, Button, Grid, NativeSelect, Title } from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import _, { capitalize } from "lodash";
import { useState } from "react";
import { useGetNature, useSaveNatureChanges } from "../apis/naturesApis";
import { useUpdateEffect } from "../hooks/useUpdateEffect";
import { useNatureStore } from "../stores";
import { NatureProperties } from "../types";
import { isNullEmptyOrUndefined } from "../utils";

const Natures = () => {
  const naturesList = useNatureStore((state) => state.naturesList);
  const [natureName, setNatureName] = useInputState<string>("");
  const [currentNatureName, setCurrentNatureName] = useInputState<string>("");

  const [natureDetails, setNatureDetails] = useState<NatureProperties>(
    {} as NatureProperties
  );
  const [natureDetailsChangeTracker, setNatureDetailsChangeTracker] =
    useState<NatureProperties>({} as NatureProperties);

  const { refetch, data: natureSearchData } = useGetNature({ natureName });

  const { mutate: mutateNature, isPending: isPendingMutateNature } =
    useSaveNatureChanges({
      natureName,
      natureDetails,
      onSuccess: () => {
        notifications.show({ message: "Changes Saved" });
        setNatureDetailsChangeTracker(natureDetails);
      },
      onError: () => {
        notifications.show({ message: "Error Saving changes", color: "red" });
      },
    });

  useUpdateEffect(() => {
    if (natureSearchData) {
      setNatureDetails(natureSearchData);
      setNatureDetailsChangeTracker(natureSearchData);
    }
  }, [natureSearchData]);

  return (
    <>
      <Grid mt={20}>
        {naturesList.length > 0 && (
          <>
            <Grid.Col span={6}>
              <Autocomplete
                placeholder="Nature Name"
                onChange={setNatureName}
                value={natureName}
                data={naturesList}
                limit={5}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <Button
                fullWidth
                onClick={() => {
                  setCurrentNatureName(natureName);
                  refetch();
                }}
                disabled={isNullEmptyOrUndefined(natureName)}
              >
                Search
              </Button>
            </Grid.Col>
            <Grid.Col span={3}>
              <Button
                fullWidth
                loading={isPendingMutateNature}
                disabled={_.isEqual(natureDetailsChangeTracker, natureDetails)}
                onClick={() => mutateNature()}
              >
                Save Changes
              </Button>
            </Grid.Col>
          </>
        )}
      </Grid>
      {!isNullEmptyOrUndefined(currentNatureName) && (
        <>
          <Title mt={"lg"}>{capitalize(currentNatureName)}</Title>
          <NativeSelect
            mt={20}
            label="Increased Stat"
            data={[
              "None",
              "attack",
              "defense",
              "special-attack",
              "special-defense",
              "speed",
            ]}
            onChange={(e) =>
              setNatureDetails({
                ...natureDetails,
                increased_stat: e.currentTarget.value as
                  | "attack"
                  | "defense"
                  | "special-attack"
                  | "special-defense"
                  | "speed",
              })
            }
            value={natureDetails.increased_stat || "None"}
          />
          <NativeSelect
            mt={20}
            label="Decreased Stat"
            data={[
              "None",
              "attack",
              "defense",
              "special-attack",
              "special-defense",
              "speed",
            ]}
            onChange={(e) =>
              setNatureDetails({
                ...natureDetails,
                decreased_stat: e.currentTarget.value as
                  | "attack"
                  | "defense"
                  | "special-attack"
                  | "special-defense"
                  | "speed",
              })
            }
            value={natureDetails.decreased_stat || "None"}
          />
        </>
      )}
    </>
  );
};

export default Natures;
