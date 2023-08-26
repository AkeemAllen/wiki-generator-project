import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useBackupWiki } from "../apis/wikiApis";

const Backups = () => {
  const { mutate: mutateBackups } = useBackupWiki((data: any) => {
    notifications.show({ message: data.message });
  });
  return <Button onClick={() => mutateBackups()}>Backup All Data</Button>;
};

export default Backups;
