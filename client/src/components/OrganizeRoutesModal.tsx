import { Box, Button, createStyles } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Reorder } from "framer-motion";
import { useEffect, useState } from "react";
import { useUpdateRoutePositions } from "../apis/routesApis";
import { useRouteStore } from "../stores";

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
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
}));

const OrganizeRoutesModal = () => {
  const { classes } = useStyles();
  const routes = useRouteStore((state) => state.routes);
  const setRoutes = useRouteStore((state) => state.setRoutes);
  const [routeNames, setRouteNames] = useState<string[]>([]);

  useEffect(() => {
    setRouteNames([...Object.keys(routes)]);
  }, [routes]);

  const { mutate: updateRoutePositions } = useUpdateRoutePositions((data) => {
    setRoutes(data.routes);
    notifications.show({
      message: "Route positions updated!",
    });
  });

  return (
    <>
      <Reorder.Group
        axis="y"
        as="div"
        values={routeNames}
        onReorder={setRouteNames}
      >
        {routeNames.map((routeName, index) => {
          return (
            <Reorder.Item key={routeName} value={routeName} as="div">
              <Box key={index} className={classes.box}>
                {routeName}
              </Box>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
      <Button onClick={() => updateRoutePositions(routeNames)}>
        Update Positions
      </Button>
    </>
  );
};

export default OrganizeRoutesModal;
