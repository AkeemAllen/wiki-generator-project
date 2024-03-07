import { Autocomplete, Button, Grid, Textarea, Title } from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import _ from "lodash";
import { useState } from "react";
import { useGetAbility, useSaveAbilityChanges } from "../apis/abilitiesApis";
import { useUpdateEffect } from "../hooks/useUpdateEffect";
import { useAbilityStore } from "../stores";
import { AbilityProperties } from "../types";
import { capitalize, isNullEmptyOrUndefined } from "../utils";

const Abilities = () => {
  const abilityList = useAbilityStore((state) => state.abilityList);

  const [abilityName, setAbilityName] = useInputState<string>("");
  const [currentAbilityName, setCurrentAbilityName] = useInputState<string>("");
  const [abilityDetails, setAbilityDetails] = useState<AbilityProperties>(
    {} as AbilityProperties
  );

  const [abilityDetailsChangeTracker, setAbilityDetailsChangeTracker] =
    useState<AbilityProperties>({} as AbilityProperties);

  const { refetch, data: abilitySearchData } = useGetAbility({ abilityName });

  const { mutate: mutateAbility, isPending: isPendingMutateAbility } =
    useSaveAbilityChanges({
      abilityName,
      abilityDetails,
      onSuccess: () => {
        notifications.show({ message: "Changes Saved" });
        setAbilityDetailsChangeTracker(abilityDetails);
      },
      onError: () => {
        notifications.show({ message: "Error Saving changes", color: "red" });
      },
    });

  useUpdateEffect(() => {
    if (abilitySearchData) {
      setAbilityDetails(abilitySearchData);
      setAbilityDetailsChangeTracker(abilitySearchData);
    }
  }, [abilitySearchData]);

  return (
    <>
      <Grid mt={20}>
        {abilityList.length > 0 && (
          <>
            <Grid.Col span={6}>
              <Autocomplete
                placeholder="Ability Name"
                onChange={setAbilityName}
                value={abilityName}
                data={abilityList}
                limit={5}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <Button
                fullWidth
                onClick={() => {
                  setCurrentAbilityName(abilityName);
                  refetch();
                }}
                disabled={isNullEmptyOrUndefined(abilityName)}
              >
                Search
              </Button>
            </Grid.Col>
            <Grid.Col span={3}>
              <Button
                fullWidth
                loading={isPendingMutateAbility}
                disabled={_.isEqual(
                  abilityDetailsChangeTracker,
                  abilityDetails
                )}
                onClick={() => mutateAbility()}
              >
                Save Changes
              </Button>
            </Grid.Col>
          </>
        )}
      </Grid>
      {!isNullEmptyOrUndefined(currentAbilityName) && (
        <>
          <Title mt={"lg"}>{capitalize(currentAbilityName)}</Title>
          <Textarea
            mt={20}
            value={abilityDetails.effect}
            onChange={(e) =>
              setAbilityDetails({
                ...abilityDetails,
                effect: e.currentTarget.value,
              })
            }
            placeholder="Effect"
            label="Ability Effect"
            autosize
          />
        </>
      )}
    </>
  );
};

export default Abilities;
