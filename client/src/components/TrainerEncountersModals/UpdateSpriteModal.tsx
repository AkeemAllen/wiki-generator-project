import { Modal, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMemo } from "react";
import { useEditTrainers } from "../../apis/routesApis";
import { useRouteStore } from "../../stores";

type UpdateSpriteModalProps = {
  opened: boolean;
  close: () => void;
  spriteName?: string;
  trainerName: string;
  routeName: string;
};

const UpdateSpriteModal = ({
  opened,
  close,
  spriteName,
  trainerName,
  routeName,
}: UpdateSpriteModalProps) => {
  const routes = useRouteStore((state) => state.routes);
  const setRoutes = useRouteStore((state) => state.setRoutes);
  const { mutate: submitTrainers } = useEditTrainers((data) =>
    setRoutes(data.routes)
  );

  const trainers = useMemo(
    () => routes[routeName]?.important_trainers,
    [routes]
  );

  const editSprite = (newSprite: string) => {
    const currentTrainers = { ...trainers };
    currentTrainers[trainerName].sprite_name = newSprite;
    submitTrainers({
      routeName,
      important_trainers: currentTrainers,
    });
    notifications.show({ message: "Sprite Changed Successfully" });
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Edit Sprite"
      withCloseButton={false}
    >
      <TextInput
        label="Use the names for the sprites found here: https://play.pokemonshowdown.com/sprites/trainers/"
        placeholder="Set a sprite name"
        defaultValue={spriteName}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const { value } = e.target as HTMLInputElement;
            e.preventDefault();
            e.stopPropagation();
            editSprite(value);
            close();
          }
        }}
      />
    </Modal>
  );
};

export default UpdateSpriteModal;
