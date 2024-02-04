import { Button, Modal, SimpleGrid, Text, TextInput } from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import useWebSocket from "react-use-websocket";
import { useLocalStorage, useUpdateEffect } from "usehooks-ts";
import { DeploymentState, Wikis } from "../types";
import { isNullEmptyOrUndefined } from "../utils";

const SOCKET_URL = `${import.meta.env.VITE_WEBSOCKET_BASE_URL}/wikis/deploy`;

type DeployWikiModalProps = {
  opened: boolean;
  onClose: () => void;
};

const DeployWikiModal = ({ opened, onClose }: DeployWikiModalProps) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  const [wikiList, __] = useLocalStorage<Wikis>("wikiList", {});
  const [deploymentUrl, setDeploymentUrl] = useInputState<string>(
    wikiList[currentWiki]?.settings?.deployment_url
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [messageHistory, setMessageHistory] = useState<string[]>([]);

  const { sendJsonMessage, lastMessage } = useWebSocket(SOCKET_URL, {
    shouldReconnect: () => true,
  });

  useUpdateEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);

      if (data["state"] === DeploymentState.START) setIsLoading(true);

      if (data["state"] === DeploymentState.COMPLETE) {
        notifications.show({ message: data["message"] });
        setIsLoading(false);
        onClose();

        setMessageHistory([]);
      }

      setMessageHistory((prev) => [...prev, data["message"]]);
    }
  }, [lastMessage]);

  useUpdateEffect(() => {
    setDeploymentUrl(wikiList[currentWiki]?.settings?.deployment_url);
  }, [wikiList]);

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
          label="Deployment Url"
          placeholder="Paste repository url: Ex. 'https://github.com/<author>/<wiki_name>.git' or 'git@github.com:<author>/<wiki_name>.git'"
          value={deploymentUrl}
          onChange={setDeploymentUrl}
        />
        <Text>
          Check server terminal to see if github credentials need to be entered
        </Text>
        {messageHistory &&
          messageHistory.map((message) => {
            return <Text italic>{message}</Text>;
          })}
        <Button
          disabled={isNullEmptyOrUndefined(deploymentUrl)}
          loading={isLoading}
          onClick={() =>
            sendJsonMessage({
              wiki_name: currentWiki,
              deployment_url: deploymentUrl,
            })
          }
        >
          Deploy
        </Button>
      </SimpleGrid>
    </Modal>
  );
};

export default DeployWikiModal;
