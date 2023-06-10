import {
  ActionIcon,
  Box,
  Button,
  Grid,
  Menu,
  Modal,
  ScrollArea,
  TextInput,
  Title,
  createStyles,
} from "@mantine/core";
import { useDisclosure, useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconDotsVertical, IconPlus } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAddNewRoute,
  useDeleteRoute,
  useDuplicateRoute,
} from "../apis/routesApis";
import OrganizeRoutesModal from "../components/OrganizeRoutesModal";
import { useMeasurePosition } from "../hooks/useMeasurePosition";
import { usePositionReorder } from "../hooks/usePositionReorder";
import { useRouteStore } from "../stores";

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

const useStyles = createStyles((theme) => ({
  box: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    boxShadow: theme.shadows.sm,
    border: `1px solid`,
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    borderColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[4]
        : theme.colors.gray[2],
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
}));

const Routes = () => {
  const { classes } = useStyles();
  const [newRouteName, setNewRouteName] = useInputState<string>("");
  const [
    newRouteNameModalOpen,
    { open: openNewRouteNameModal, close: closeNewRouteNameModal },
  ] = useDisclosure(false);
  const [
    organizeRouteModalOpen,
    { open: openOrganizeRoutesModal, close: closeOrganizeRoutesModal },
  ] = useDisclosure(false);
  const [searchTerm, setSearchTerm] = useInputState<string>("");
  const navigate = useNavigate();

  const routes = useRouteStore((state) => state.routes);
  const setRoutes = useRouteStore((state) => state.setRoutes);

  const [order, updatePosition, updateOrder, setOrder] = usePositionReorder([]);

  const { mutate: addNewRoute } = useAddNewRoute((data) => {
    setRoutes(data.routes);
    setNewRouteName("");
    notifications.show({ message: "Route added successfully!" });
    closeNewRouteNameModal();
    navigate(`${newRouteName}`);
  });

  const { mutate: deleteRoute } = useDeleteRoute((data) => {
    setRoutes(data.routes);
    notifications.show({
      message: "Route deleted successfully!",
      color: "red",
    });
  });

  const { mutate: duplicateRoute } = useDuplicateRoute((data) => {
    setRoutes(data.routes);
    notifications.show({
      message: "Route duplicated successfully!",
    });
  });

  useEffect(() => {
    setOrder(
      Object.keys(routes).map((routeName, index) => {
        return {
          routeName,
          position: routes[routeName].position,
        };
      })
    );
    console.log("order", order);
  }, [routes]);

  useEffect(() => {
    console.log("order", order);
  }, [order]);

  return (
    <>
      <Grid mb={50}>
        <Grid.Col span={2}>
          <Button leftIcon={<IconPlus />} onClick={openNewRouteNameModal}>
            Add Route
          </Button>
        </Grid.Col>
        <Grid.Col span={2} onClick={openOrganizeRoutesModal}>
          <Button>Organize Routes</Button>
        </Grid.Col>
        <Grid.Col span={2}>
          <TextInput
            placeholder="Route Name"
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </Grid.Col>
      </Grid>
      <ScrollArea.Autosize mah={"calc(100vh - 200px)"}>
        <Grid className="draggable-list">
          {/* {order.map(
            (route: { routeName: string; position: number }, index: number) => {
              return (
                <Grid.Col key={index} span={3}>
                  <SingleRoute
                    key={index}
                    route={route}
                    index={index}
                    updatePosition={updatePosition}
                    updateOrder={updateOrder}
                  />
                </Grid.Col>
              );
            }
          )} */}
          {Object.keys(routes)
            .filter((routeName) =>
              routeName.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((routeName, index) => {
              return (
                <Grid.Col key={index} span={3} className="draggable-source">
                  <Box className={classes.box}>
                    <Grid sx={{ alignItems: "center" }}>
                      <Grid.Col
                        span={10}
                        onClick={() => navigate(`${routeName}`)}
                        sx={{ "&:hover": { cursor: "pointer" } }}
                      >
                        <Title order={5}>{routeName}</Title>
                      </Grid.Col>
                      <Grid.Col span={2}>
                        <Menu shadow="sm" width={200}>
                          <Menu.Target>
                            <ActionIcon color="gray">
                              <IconDotsVertical />
                            </ActionIcon>
                          </Menu.Target>

                          <Menu.Dropdown>
                            <Menu.Item
                              onClick={() =>
                                duplicateRoute({
                                  routeName,
                                  newRouteName: `${routeName} copy`,
                                })
                              }
                            >
                              Duplicate
                            </Menu.Item>
                            <Menu.Item
                              color="red"
                              onClick={() => deleteRoute(routeName)}
                            >
                              Delete
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Grid.Col>
                    </Grid>
                  </Box>
                </Grid.Col>
              );
            })}
        </Grid>
      </ScrollArea.Autosize>
      <RouteNameModal
        isOpen={newRouteNameModalOpen}
        close={closeNewRouteNameModal}
        saveFunction={() => addNewRoute(newRouteName)}
        routeName={newRouteName}
        setRouteName={setNewRouteName}
      />
      <Modal
        opened={organizeRouteModalOpen}
        withCloseButton={false}
        onClose={closeOrganizeRoutesModal}
        size={500}
      >
        <OrganizeRoutesModal />
      </Modal>
    </>
  );
};

type SingleRouteProps = {
  route: { routeName: string; position: number };
  index: number;
  updatePosition: any;
  updateOrder: any;
};

const SingleRoute = ({
  index,
  route,
  updateOrder,
  updatePosition,
}: SingleRouteProps) => {
  const { classes } = useStyles();
  const [isDragging, setDragging] = useState(false);

  const ref = useMeasurePosition((pos: number) => updatePosition(index, pos));
  return (
    <motion.div
      drag={true}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      ref={ref}
      initial={false}
      layout
      whileHover={{
        scale: 1.03,
        boxShadow: "0px 3px 3px rgba(0,0,0,0.15)",
      }}
      whileTap={{
        scale: 1.12,
        boxShadow: "0px 5px 5px rgba(0,0,0,0.1)",
      }}
      onViewportEnter={() => {
        isDragging && updateOrder(index);
      }}
      onViewportLeave={() => {
        isDragging && updateOrder(index);
      }}
    >
      <Box className={classes.box}>{route.routeName}</Box>
    </motion.div>
  );
};

export default Routes;
