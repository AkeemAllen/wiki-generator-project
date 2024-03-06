import {
  NativeSelect,
  NumberInput,
  SimpleGrid,
  Tabs,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { Types } from "../constants";
import { MachineVersion, MoveDetails } from "../types";
import { capitalize } from "../utils";
import MachineDetails from "./MachineDetails";

type MoveDetailsProps = {
  moveName: string;
  moveDetails: MoveDetails;
  handleMoveDetailChanges: (
    e: number | string | MachineVersion[],
    detail: string
  ) => void;
};

const MoveDetailsComponent = ({
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
      <Tabs mt={20} value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="stats">Stats</Tabs.Tab>
          <Tabs.Tab value="machine-information">Machine Information</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="stats">
          <SimpleGrid cols={2} mt={20}>
            <NumberInput
              label="Power"
              value={moveDetails.power}
              onChange={(e) => handleMoveDetailChanges(e as number, "power")}
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
              onChange={(e) => handleMoveDetailChanges(e as number, "accuracy")}
            />
            <NumberInput
              label="PP"
              value={moveDetails.pp}
              onChange={(e) => handleMoveDetailChanges(e as number, "pp")}
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

export default MoveDetailsComponent;
