import {
  Autocomplete,
  Button,
  Grid,
  SimpleGrid,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import _, { capitalize } from "lodash";
import { useState } from "react";
import { useGetItem, useSaveItemChanges } from "../apis/itemsApis";
import { useUpdateEffect } from "../hooks/useUpdateEffect";
import { useItemsStore } from "../stores";
import { ItemProperties } from "../types";
import { isNullEmptyOrUndefined } from "../utils";

const Items = () => {
  const itemsList = useItemsStore((state) => state.itemsList);
  const [itemName, setItemName] = useInputState<string>("");

  // This makes sure the page title doesn't change when itemName changes
  const [currentItemName, setCurrentItemName] = useInputState<string>("");

  const [itemDetails, setItemDetails] = useState<ItemProperties>(
    {} as ItemProperties
  );

  // To compare original state of itemDetails to the current state
  const [itemDetailsChangeTracker, setItemDetailsChangeTracker] =
    useState<ItemProperties>({} as ItemProperties);

  const handleItemDetailChanges = (e: string, detail: string) => {
    setItemDetails((itemDetails: ItemProperties) => {
      return {
        ...itemDetails,
        [detail]: e,
      };
    });
  };
  const { refetch, data: itemSearchData } = useGetItem({ itemName });

  const { mutate: mutateItem, isPending: isPendingMutateItem } =
    useSaveItemChanges({
      itemName,
      itemDetails,
      onSuccess: () => {
        notifications.show({ message: "Changes Saved" });
        setItemDetailsChangeTracker(itemDetails);
      },
      onError: () => {
        notifications.show({ message: "Error Saving changes", color: "red" });
      },
    });

  useUpdateEffect(() => {
    if (itemSearchData) {
      setItemDetails(itemSearchData);
      setItemDetailsChangeTracker(itemSearchData);
    }
  }, [itemSearchData]);

  return (
    <>
      <Grid mt={20}>
        {itemsList.length > 0 && (
          <>
            <Grid.Col span={6}>
              <Autocomplete
                placeholder="Item Name"
                onChange={setItemName}
                value={itemName}
                data={itemsList}
                limit={5}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <Button
                fullWidth
                onClick={() => {
                  setCurrentItemName(itemName);
                  refetch();
                }}
                disabled={isNullEmptyOrUndefined(itemName)}
              >
                Search
              </Button>
            </Grid.Col>
            <Grid.Col span={3}>
              <Button
                fullWidth
                loading={isPendingMutateItem}
                disabled={_.isEqual(itemDetailsChangeTracker, itemDetails)}
                onClick={() => mutateItem()}
              >
                Save Changes
              </Button>
            </Grid.Col>
          </>
        )}
      </Grid>
      {!isNullEmptyOrUndefined(currentItemName) && (
        <ItemDetailsComponent
          itemName={currentItemName}
          itemDetails={itemDetails}
          handleItemDetailChanges={handleItemDetailChanges}
        />
      )}
    </>
  );
};

type ItemDetailsProps = {
  itemName: string;
  itemDetails: ItemProperties;
  handleItemDetailChanges: (e: string, detail: string) => void;
};

const ItemDetailsComponent = ({
  itemName,
  itemDetails,
  handleItemDetailChanges,
}: ItemDetailsProps) => {
  return (
    <>
      <Title mt="lg">{capitalize(itemName)}</Title>
      <SimpleGrid mt={20}>
        <img src={itemDetails.sprite} alt={itemName} />
        <TextInput
          label="Sprite URL"
          value={itemDetails.sprite}
          onChange={(e) => handleItemDetailChanges(e.target.value, "sprite")}
        />
        <TextInput
          label="Location"
          value={itemDetails.location}
          onChange={(e) => handleItemDetailChanges(e.target.value, "location")}
        />
        <Textarea
          value={itemDetails.effect}
          onChange={(e) => handleItemDetailChanges(e.target.value, "effect")}
          label="Item Effect"
          autosize
        />
      </SimpleGrid>
    </>
  );
};

export default Items;
