import { Button, Modal, TextInput } from "@mantine/core";

type RouteNameModalProps = {
  isOpen: boolean;
  close: () => void;
  saveFunction: () => void;
  routeName: string;
  setRouteName: any;
};

const RouteNameModal = ({
  isOpen,
  close,
  saveFunction,
  routeName,
  setRouteName,
}: RouteNameModalProps) => {
  return (
    <Modal opened={isOpen} withCloseButton={false} onClose={close}>
      <TextInput label="Route Name" value={routeName} onChange={setRouteName} />
      <Button onClick={saveFunction} mt={20}>
        Save Route
      </Button>
    </Modal>
  );
};

export default RouteNameModal;
