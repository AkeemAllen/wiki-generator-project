import {
  Box,
  Button,
  Modal,
  NativeSelect,
  Table,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { MachineVersion, MoveDetails, PokemonVersions } from "../types";
import { isNullEmptyOrUndefined } from "../utils";

type MachineDetailsProps = {
  moveDetails: MoveDetails;
  handleMoveDetailsChange: (
    e: number | string | MachineVersion[],
    detail: string
  ) => void;
};

const MachineDetails = ({
  moveDetails,
  handleMoveDetailsChange,
}: MachineDetailsProps) => {
  const [
    newVersionModalOpened,
    { open: openNewVersionModal, close: closeNewVersionModal },
  ] = useDisclosure(false);
  const [newMachineVersion, setNewMachineVersion] = useState<MachineVersion>(
    {} as MachineVersion
  );

  const handleClose = () => {
    setNewMachineVersion({} as MachineVersion);
    closeNewVersionModal();
  };

  const addMachineVersion = () => {
    handleMoveDetailsChange(
      [...(moveDetails.machine_details as MachineVersion[]), newMachineVersion],
      "machine_details"
    );
    handleClose();
  };

  const deleteMachineVersion = (index: number) => {
    const newMachineDetails = [
      ...(moveDetails.machine_details as MachineVersion[]),
    ];
    newMachineDetails.splice(index, 1);
    handleMoveDetailsChange(newMachineDetails, "machine_details");
    handleClose();
  };

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
          </tr>
        </thead>
        <tbody>
          {moveDetails.machine_details?.map((machineVersion, index) => {
            return (
              <tr key={index}>
                <td>{machineVersion.game_version}</td>
                <td>{machineVersion.technical_name}</td>
                <td>
                  <Button
                    leftIcon={<IconTrash size={"1rem"} />}
                    onClick={() => deleteMachineVersion(index)}
                  >
                    Delete
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
        onClose={handleClose}
        title={"Add New Version"}
        centered
      >
        <NativeSelect
          mt="lg"
          mb="lg"
          label="Game Version"
          onChange={(e) =>
            setNewMachineVersion({
              ...newMachineVersion,
              game_version: e.target.value,
            })
          }
          data={[
            "",
            ...(
              Object.keys(PokemonVersions) as (keyof typeof PokemonVersions)[]
            ).map((key, index) => {
              return PokemonVersions[key];
            }),
          ]}
        />
        <TextInput
          mb="lg"
          label="Technical Name"
          onChange={(e) =>
            setNewMachineVersion({
              ...newMachineVersion,
              technical_name: e.target.value,
            })
          }
        />
        <Button
          onClick={() => addMachineVersion()}
          disabled={
            isNullEmptyOrUndefined(newMachineVersion.game_version) ||
            isNullEmptyOrUndefined(newMachineVersion.technical_name)
          }
        >
          Save
        </Button>
      </Modal>
    </>
  );
};

export default MachineDetails;
