import { Modal, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { TrainerInfo, Trainers } from "../../types";

type UpdateSpriteModalProps = {
  opened: boolean;
  close: () => void;
  trainer: { trainerName: string; info: TrainerInfo };
  trainers: Trainers;
  updateTrainer: (trainerName: string, trainerInfo: TrainerInfo) => void;
};

const UpdateSpriteModal = ({
  opened,
  close,
  trainer,
  trainers,
  updateTrainer,
}: UpdateSpriteModalProps) => {
  return (
    <Modal
      opened={opened}
      onClose={close}
      withCloseButton={false}
      title="Sprite Name"
    >
      <TextInput
        label="Use the names for the sprites found here: https://play.pokemonshowdown.com/sprites/trainers/"
        placeholder="Set a sprite name"
        defaultValue={trainers[trainer.trainerName]?.sprite_name}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const { value } = e.target as HTMLInputElement;
            e.preventDefault();
            e.stopPropagation();
            updateTrainer(trainer.trainerName, {
              ...trainer.info,
              sprite_name: value,
            });
            notifications.show({
              message: "Sprite name updated successfully",
            });
            close();
          }
        }}
      />
    </Modal>
  );
};

export default UpdateSpriteModal;
