import { ActionIcon, Grid, Tabs, TextInput, Title } from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { useDeleteRoute, useEditRouteName } from "../apis/routesApis";
import ImportantTrainerEncountersTab from "../components/GameRouteTabs/ImportantTrainerEncountersTab";
import TrainersEncounterTab from "../components/GameRouteTabs/TrainerEncountersTab";
import WildEncountersTab from "../components/GameRouteTabs/WildEncountersTab";
import { useRouteStore } from "../stores";

export async function loader({ params }: any) {
  return {
    routeName: params.routeName,
  };
}

type LoaderData = {
  routeName: string;
};

const GameRoutesDetails = () => {
  const { routeName } = useLoaderData() as LoaderData;
  const [activeTab, setActiveTab] = useState<string | null>("wild-encounters");

  return (
    <>
      <RouteNameHeader routeName={routeName} />
      <Tabs mt={20} value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="wild-encounters">Wild Encounters</Tabs.Tab>
          <Tabs.Tab value="trainer-encounters">Trainer Encounters</Tabs.Tab>
          <Tabs.Tab value="important-trainer-encounters">
            Important Trainer Encounters
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="wild-encounters">
          <WildEncountersTab routeName={routeName} />
        </Tabs.Panel>
        <Tabs.Panel value="trainer-encounters">
          <TrainersEncounterTab routeName={routeName} />
        </Tabs.Panel>
        <Tabs.Panel value="important-trainer-encounters">
          <ImportantTrainerEncountersTab routeName={routeName} />
        </Tabs.Panel>
      </Tabs>
    </>
  );
};

const RouteNameHeader = ({ routeName }: { routeName: string }) => {
  const setRoutes = useRouteStore((state) => state.setRoutes);

  const navigate = useNavigate();

  const [isBeingEdited, setIsBeingEdited] = useState<boolean>(false);
  const [newRouteName, setNewRouteName] = useInputState<string>(routeName);

  const { mutate: editRouteName } = useEditRouteName((data) => {
    setRoutes(data.routes);
    notifications.show({ message: "Route name changed successfully!" });
    navigate(`/game-routes/${newRouteName}`);
    setIsBeingEdited(false);
  });

  const { mutate: deleteRoute } = useDeleteRoute((data) => {
    setRoutes(data.routes);
    notifications.show({
      message: "Route deleted successfully!",
      color: "red",
    });
    navigate(`/game-routes`);
  });

  if (isBeingEdited) {
    return (
      <TextInput
        mt={20}
        value={newRouteName}
        onChange={setNewRouteName}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (newRouteName === routeName) {
              setIsBeingEdited(false);
              return;
            }
            editRouteName({ routeNameToEdit: routeName, newRouteName });
          }
        }}
      />
    );
  }
  return (
    <Grid mt={20} columns={24}>
      <Grid.Col span={3}>
        <Title order={4}>{routeName}</Title>
      </Grid.Col>
      <Grid.Col span={1}>
        <ActionIcon variant="outline" color="blue">
          <IconTrash onClick={() => deleteRoute(routeName)} />
        </ActionIcon>
      </Grid.Col>
      <Grid.Col span={1}>
        <ActionIcon variant="outline" color="blue">
          <IconEdit onClick={() => setIsBeingEdited(true)} />
        </ActionIcon>
      </Grid.Col>
    </Grid>
  );
};

export default GameRoutesDetails;
