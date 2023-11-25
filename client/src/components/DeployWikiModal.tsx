import { Button, Modal, SimpleGrid, Text, TextInput } from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useLocalStorage } from "usehooks-ts";
import { useDeployWiki } from "../apis/wikiApis";
import { isNullEmptyOrUndefined } from "../utils";

type DeployWikiModalProps = {
  opened: boolean;
  onClose: () => void;
};

const DeployWikiModal = ({ opened, onClose }: DeployWikiModalProps) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  const [wikiList, __] = useLocalStorage("wikiList", {});
  const [deploymentUrl, setDeploymentUrl] = useInputState<string>(
    wikiList[currentWiki]?.settings?.deployment_url
  );
  const { mutate, isLoading } = useDeployWiki((data: any) => {
    console.log(data);
    notifications.show({ message: data.message });
    onClose();
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Deploy Wiki"
      withCloseButton={false}
    >
      <SimpleGrid cols={1}>
        <Text color="red">
          Ensure that a repository with the same name as this wiki{" "}
          <strong>{currentWiki}</strong> exists in your github account before
          proceeding
        </Text>
        <TextInput
          label="Repository Url"
          placeholder="Paste repository url: Ex. 'https://github.com/<author>/<wiki_name>.git' or 'git@github.com:<author>/<wiki_name>.git'"
          value={deploymentUrl}
          onChange={setDeploymentUrl}
        />
        <Text>
          Check server terminal to see if github credentials need to be entered
        </Text>
        <Button
          disabled={isNullEmptyOrUndefined(deploymentUrl)}
          loading={isLoading}
          onClick={() =>
            mutate({ wiki_name: currentWiki, deployment_url: deploymentUrl })
          }
        >
          Deploy
        </Button>
      </SimpleGrid>
    </Modal>
  );
};

export default DeployWikiModal;
