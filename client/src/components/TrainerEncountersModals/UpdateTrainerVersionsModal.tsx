import { Button, Grid, Modal, Pill, Text, TextInput } from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useMemo } from "react";
import { useEditTrainers } from "../../apis/routesApis";
import { useRouteStore } from "../../stores";

type UpdateTrainerVersionsModalProps = {
  opened: boolean;
  close: () => void;
  routeName: string;
  trainerName: string;
};

const UpdateTrainerVersionsModal = ({
  opened,
  close,
  trainerName,
  routeName,
}: UpdateTrainerVersionsModalProps) => {
  const routes = useRouteStore((state) => state.routes);
  const setRoutes = useRouteStore((state) => state.setRoutes);
  const [newTrainerVersion, setNewTrainerVersion] = useInputState<string>("");

  const { mutate: submitTrainers } = useEditTrainers((data) =>
    setRoutes(data.routes)
  );

  const trainers = useMemo(
    () => routes[routeName]?.important_trainers,
    [routes]
  );

  const versions = useMemo(
    () => (trainers && trainers[trainerName]?.trainer_versions) || [],
    [trainers]
  );
  const addNewVersion = () => {
    if (
      newTrainerVersion === "" ||
      (versions && versions.includes(newTrainerVersion))
    )
      return;

    const tempVersions = versions ? versions : [];
    const newVersions = [...tempVersions, newTrainerVersion];
    const currentTrainers = { ...trainers };
    currentTrainers[trainerName].trainer_versions = newVersions;
    submitTrainers({
      routeName,
      important_trainers: currentTrainers,
    });
    notifications.show({ message: "Trainer Version Added" });
    setNewTrainerVersion("");
  };

  const removeVersion = (index: number) => {
    const currentTrainers = { ...trainers };
    currentTrainers[trainerName].trainer_versions = versions.filter(
      (_, versionIndex) => versionIndex !== index
    );
    submitTrainers({
      routeName,
      important_trainers: currentTrainers,
    });
    notifications.show({ message: "Trainer Version Removed" });
  };

  return (
    <Modal opened={opened} onClose={close} title="Trainer Versions">
      <Grid>
        {versions &&
          versions.map((version, index) => {
            return (
              <Grid.Col key={index} span={3}>
                <Pill withRemoveButton onRemove={() => removeVersion(index)}>
                  {version}
                </Pill>
              </Grid.Col>
            );
          })}
        <Grid align="center">
          <Grid.Col>
            <Text>Add Trainer Version</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              value={newTrainerVersion}
              onChange={setNewTrainerVersion}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <Button onClick={addNewVersion} fullWidth>
              Add
            </Button>
          </Grid.Col>
        </Grid>
      </Grid>
    </Modal>
  );
};

export default UpdateTrainerVersionsModal;
