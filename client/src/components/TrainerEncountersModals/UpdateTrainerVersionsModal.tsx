import { Modal, MultiSelect } from "@mantine/core";
import { TrainerInfo, Trainers } from "../../types";

type UpdateTrainerVersionsModalProps = {
  opened: boolean;
  close: () => void;
  versions: string[];
  setVersions: (trainerVersions: string[]) => void;
  trainer: { trainerName: string; info: TrainerInfo };
  trainers: Trainers;
  updateTrainer: (trainerName: string, trainerInfo: TrainerInfo) => void;
};

const UpdateTrainerVersionsModal = ({
  opened,
  close,
  versions,
  setVersions,
  trainers,
  trainer,
  updateTrainer,
}: UpdateTrainerVersionsModalProps) => {
  return (
    <Modal
      opened={opened}
      onClose={close}
      withCloseButton={false}
      title="Sprite Name"
    >
      <MultiSelect
        label="Trainer Versions"
        data={versions}
        value={trainers[trainer?.trainerName]?.trainer_versions}
        onChange={(value) =>
          updateTrainer(trainer.trainerName, {
            ...trainer.info,
            trainer_versions: value,
          })
        }
        searchable
        creatable
        getCreateLabel={(query) => `Create trainer version "${query}"`}
        onCreate={(query) => {
          setVersions([...versions, query]);
          return query;
        }}
      />
    </Modal>
  );
};

export default UpdateTrainerVersionsModal;
