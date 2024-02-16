import { ActionIcon, Checkbox, Menu, Modal, TextInput } from "@mantine/core";
import { useDisclosure, useInputState } from "@mantine/hooks";
import { IconDots } from "@tabler/icons-react";
import React from "react";
import { TrainerInfo } from "../types";

type TrainerMenuProps = {
  trainerName: string;
  trainerInfo: TrainerInfo;
  functions: {
    updateTrainer: (trainerName: string, trainerInfo: TrainerInfo) => void;
    openSpriteModal: () => void;
    openTrainerVersionsModal: () => void;
    editTrainerName: (trainerName: string, newTrainerName: string) => void;
    setTrainerVersions: React.Dispatch<React.SetStateAction<string[]>>;
    setTrainerToUpdate: React.Dispatch<
      React.SetStateAction<{
        trainerName: string;
        info: TrainerInfo;
      }>
    >;
  };
};
const TrainerMenu = ({
  trainerInfo,
  trainerName,
  functions,
}: TrainerMenuProps) => {
  const {
    updateTrainer,
    setTrainerToUpdate,
    setTrainerVersions,
    openSpriteModal,
    openTrainerVersionsModal,
    editTrainerName,
  } = functions;

  const [opened, { close, open }] = useDisclosure(false);
  const [newTrainerName, setNewTrainerName] = useInputState<string>("");

  return (
    <Menu shadow="sm" width={200} position="right-start">
      <Menu.Target>
        <ActionIcon mt={15} ml={10}>
          <IconDots />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item onClick={open}>Edit Name</Menu.Item>
        <Menu.Item
          closeMenuOnClick={false}
          rightSection={
            <Checkbox
              mr={10}
              size={"xs"}
              checked={trainerInfo.is_important}
              onChange={() => {
                updateTrainer(trainerName, {
                  ...trainerInfo,
                  is_important: !trainerInfo.is_important,
                });
              }}
            />
          }
        >
          Important Trainer
        </Menu.Item>
        {trainerInfo?.is_important && (
          <>
            <Menu.Item
              onClick={() => {
                setTrainerToUpdate({
                  trainerName,
                  info: trainerInfo,
                });
                openSpriteModal();
              }}
            >
              Update Sprite
            </Menu.Item>
            <Menu.Item
              onClick={() => {
                setTrainerToUpdate({
                  trainerName,
                  info: trainerInfo,
                });
                setTrainerVersions((versions) => [
                  ...versions,
                  ...(trainerInfo?.trainer_versions || []),
                ]);
                openTrainerVersionsModal();
              }}
            >
              Modify Trainer Versions
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
      <Modal
        opened={opened}
        onClose={close}
        title="Edit Trainer Name"
        withCloseButton={false}
      >
        <TextInput
          value={newTrainerName}
          onChange={setNewTrainerName}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              editTrainerName(trainerName, newTrainerName);
              close();
            }
          }}
        />
      </Modal>
    </Menu>
  );
};

export default TrainerMenu;
