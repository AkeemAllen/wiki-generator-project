import { Button, Modal, Select, SimpleGrid } from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useLocalStorage } from "usehooks-ts";
import { useDeleteWiki } from "../apis/wikiApis";

type DeleteWikiModalProps = {
  opened: boolean;
  onClose: () => void;
};

const DeleteWikiModal = ({ opened, onClose }: DeleteWikiModalProps) => {
  const [wikiList, setWikiList] = useLocalStorage("wikiList", {});
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  const [selectedWiki, setSelectedWiki] = useInputState<string>("");

  const { mutate: deleteWiki } = useDeleteWiki((data: any) => {
    notifications.show({ message: data.message });
    setWikiList(data.wikis);
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Delete Wiki">
      <SimpleGrid cols={1}>
        <Select
          label="Wiki"
          placeholder="Select Wiki to Delete"
          value={selectedWiki}
          onChange={setSelectedWiki}
          data={Object.keys(wikiList).filter((wiki) => wiki !== currentWiki)}
          styles={{ dropdown: { position: "unset" } }}
        />
        <Button
          color="red"
          variant="light"
          disabled={selectedWiki === ""}
          onClick={() => {
            deleteWiki(selectedWiki);
            onClose();
          }}
        >
          Delete Wiki
        </Button>
      </SimpleGrid>
    </Modal>
  );
};

export default DeleteWikiModal;
