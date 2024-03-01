import {
  ActionIcon,
  Box,
  Button,
  Grid,
  Menu,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure, useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconDotsVertical, IconPlus } from "@tabler/icons-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAddNewRoute,
  useDeleteRoute,
  useDuplicateRoute,
} from "../apis/routesApis";
import RouteNameModal from "../components/RouteNameModal";
import { useRouteStore } from "../stores";
import classes from "../styles/GameRoute.module.css";

const Routes = () => {
  const routes = useRouteStore((state) => state.routes);
  const setRoutes = useRouteStore((state) => state.setRoutes);

  const [newRouteName, setNewRouteName] = useInputState<string>("");
  const [
    newRouteNameModalOpen,
    { open: openNewRouteNameModal, close: closeNewRouteNameModal },
  ] = useDisclosure(false);
  const [searchTerm, setSearchTerm] = useInputState<string>("");
  const navigate = useNavigate();

  // Is this even necessary?
  const routeNames = useMemo(() => Object.keys(routes), [routes]);

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

  return (
    <>
      <Grid mb={50}>
        <Grid.Col span={2}>
          <Button leftSection={<IconPlus />} onClick={openNewRouteNameModal}>
            Add Route
          </Button>
        </Grid.Col>
        <Grid.Col span={2}>
          <TextInput
            placeholder="Search Routes"
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </Grid.Col>
      </Grid>
      <Grid mih={300}>
        {routeNames
          .filter((routeName) =>
            routeName.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((routeName, index) => {
            return (
              <Grid.Col key={index} span={3} className="draggable-source">
                <Box className={classes.box}>
                  <Grid style={{ alignItems: "center" }}>
                    <Grid.Col
                      span={10}
                      onClick={() => navigate(`${routeName}`)}
                      style={{ "&:hover": { cursor: "pointer" } }}
                    >
                      <Title order={5}>{routeName}</Title>
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <Menu shadow="sm" width={200}>
                        <Menu.Target>
                          <ActionIcon
                            variant="transparent"
                            size="sm"
                            color="gray"
                          >
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
      <RouteNameModal
        isOpen={newRouteNameModalOpen}
        close={closeNewRouteNameModal}
        saveFunction={() => addNewRoute(newRouteName)}
        routeName={newRouteName}
        setRouteName={setNewRouteName}
      />
    </>
  );
};

export default Routes;
