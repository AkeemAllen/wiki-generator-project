import { ActionIcon, Menu, Modal, TextInput } from "@mantine/core";
import { useDisclosure, useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconDots } from "@tabler/icons-react";
import { useMemo } from "react";
import { useEditTrainers } from "../apis/routesApis";
import { useRouteStore } from "../stores";
import { ImportantTrainers } from "../types";
import UpdateSpriteModal from "./TrainerEncountersModals/UpdateSpriteModal";
import UpdateTrainerVersionsModal from "./TrainerEncountersModals/UpdateTrainerVersionsModal";

type TrainerMenuProps = {
  routeName: string;
  trainerName: string;
  is_important_trainer?: boolean;
};

const TrainerMenu = ({
  is_important_trainer,
  trainerName,
  routeName,
}: TrainerMenuProps) => {
  const routes = useRouteStore((state) => state.routes);
  const setRoutes = useRouteStore((state) => state.setRoutes);

  const [editModalOpened, { close: closeEditModal, open: openEditModal }] =
    useDisclosure(false);
  const [
    spriteModalOpened,
    { close: closeSpriteModal, open: openSpriteModal },
  ] = useDisclosure(false);
  const [
    versionsModalOpened,
    { close: closeVersionsModal, open: openVersionsModal },
  ] = useDisclosure(false);
  const [newTrainerName, setNewTrainerName] = useInputState<string>("");

  const { mutate: submitTrainers } = useEditTrainers((data) =>
    setRoutes(data.routes)
  );

  const trainers = useMemo(() => {
    if (is_important_trainer) {
      return routes[routeName]?.important_trainers;
    }
    return routes[routeName]?.trainers;
  }, [routes]);

  const editTrainerName = () => {
    const currentTrainers = { ...trainers };
    const trainerInfo = currentTrainers[trainerName];
    delete currentTrainers[trainerName];
    currentTrainers[newTrainerName] = trainerInfo;
    if (is_important_trainer) {
      submitTrainers({
        routeName,
        important_trainers: currentTrainers as ImportantTrainers,
      });
    } else {
      submitTrainers({
        routeName,
        trainers: currentTrainers,
      });
    }
    notifications.show({ message: "Trainer Name Changed Successfully" });
  };

  return (
    <>
      <Menu shadow="sm" position="right-start">
        <Menu.Target>
          <ActionIcon variant="transparent">
            <IconDots color="gray" />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item onClick={openEditModal}>Edit Name</Menu.Item>
          {is_important_trainer && (
            <>
              <Menu.Item onClick={openSpriteModal}>Update Sprite</Menu.Item>
              <Menu.Item onClick={openVersionsModal}>
                Modify Trainer Versions
              </Menu.Item>
            </>
          )}
        </Menu.Dropdown>
      </Menu>
      <Modal
        opened={editModalOpened}
        onClose={closeEditModal}
        title="Edit Trainer Name"
        withCloseButton={false}
      >
        <TextInput
          value={newTrainerName}
          onChange={setNewTrainerName}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              editTrainerName();
              closeEditModal();
            }
          }}
        />
      </Modal>
      {is_important_trainer && (
        <>
          <UpdateTrainerVersionsModal
            opened={versionsModalOpened}
            close={closeVersionsModal}
            trainerName={trainerName}
            routeName={routeName}
          />
          <UpdateSpriteModal
            opened={spriteModalOpened}
            close={closeSpriteModal}
            spriteName={
              trainers &&
              (trainers as ImportantTrainers)[trainerName].sprite_name
            }
            trainerName={trainerName}
            routeName={routeName}
          />
        </>
      )}
    </>
  );
};

export default TrainerMenu;
