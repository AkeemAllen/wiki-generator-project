import {
  AppShell,
  Burger,
  Grid,
  Header,
  MediaQuery,
  Menu,
  Navbar,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconArrowBackUp,
  IconBallBasketball,
  IconDisc,
  IconDotsVertical,
  IconGitBranch,
  IconSettings,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useLocalStorage, useUpdateEffect } from "usehooks-ts";
import { useGetAbilities } from "../apis/abilitiesApis";
import { useGetItems } from "../apis/itemsApis";
import { useGetMoves } from "../apis/movesApis";
import { useGetNatures } from "../apis/naturesApis";
import { useGetPokemon } from "../apis/pokemonApis";
import { useGetRoutes } from "../apis/routesApis";
import {
  useAbilityStore,
  useItemsStore,
  useMovesStore,
  useNatureStore,
  usePokemonStore,
  useRouteStore,
} from "../stores";
import DeleteWikiModal from "./DeleteWikiModal";
import DeployWikiModal from "./DeployWikiModal";
import NavButton from "./NavButton";
import NewWikiModal from "./NewWikiModal";

const MainAppshell = () => {
  const setPokemonList = usePokemonStore((state) => state.setPokemonList);
  const setMovesList = useMovesStore((state) => state.setMovesList);
  const setRoutes = useRouteStore((state) => state.setRoutes);
  const setItemsList = useItemsStore((state) => state.setItemsList);
  const setAbilityList = useAbilityStore((state) => state.setAbilityList);
  const setNatureList = useNatureStore((state) => state.setNaturesList);

  const [wikiList, _] = useLocalStorage("wikiList", {});
  const [currentWiki, setCurrentWiki] = useLocalStorage("currentWiki", "none");

  const { pathname } = useLocation();
  const [navBarOpened, setNavBarOpened] = useState(false);
  const [createModalOpened, { close: closeCreate, open: openCreate }] =
    useDisclosure(false);
  const [deleteModalOpened, { close: closeDelete, open: openDelete }] =
    useDisclosure(false);
  const [deployModalOpened, { close: closeDeploy, open: openDeploy }] =
    useDisclosure(false);

  const { refetch: refetchPokemon } = useGetPokemon((data: any) =>
    setPokemonList(data)
  );
  const { refetch: refetchMoves } = useGetMoves((data: any) =>
    setMovesList(data)
  );

  const { refetch: refetchRoutes } = useGetRoutes((data: any) =>
    setRoutes(data)
  );

  const { refetch: refetchItems } = useGetItems((data: any) =>
    setItemsList(data)
  );

  const { refetch: refetchAbilities } = useGetAbilities((data: any) =>
    setAbilityList(data)
  );

  const { refetch: refetchNatures } = useGetNatures((data: any) =>
    setNatureList(data)
  );

  // Currently using 2 effects because
  // 1. If the currentWiki is not empty, we want to fetch the data
  // 2. If the currentWiki is changed, we want to refetch the data
  useEffect(() => {
    if (currentWiki === "none") {
      return;
    }
    refetchPokemon();
    refetchMoves();
    refetchRoutes();
    refetchItems();
    refetchAbilities();
    refetchNatures();
  }, []);

  useUpdateEffect(() => {
    if (currentWiki === "none") {
      return;
    }
    refetchPokemon();
    refetchMoves();
    refetchRoutes();
    refetchItems();
    refetchAbilities();
    refetchNatures();
  }, [currentWiki]);

  return (
    <>
      <AppShell
        header={
          <Header height={{ base: 70 }} p="xl" zIndex={101}>
            <MediaQuery largerThan="sm" styles={{ display: "none" }}>
              <Burger
                opened={navBarOpened}
                onClick={() => setNavBarOpened((o) => !o)}
                size="sm"
                mr="xl"
              />
            </MediaQuery>
            <Grid>
              <Grid.Col span={2}>
                <Text>Wiki Generator Interface</Text>
              </Grid.Col>
              <Grid.Col span={2}></Grid.Col>
            </Grid>
          </Header>
        }
        navbarOffsetBreakpoint="sm"
        navbar={
          <Navbar
            p="md"
            hiddenBreakpoint="sm"
            hidden={!navBarOpened}
            width={{ sm: 200, lg: 300 }}
          >
            {currentWiki !== "none" && (
              <Navbar.Section grow>
                <Link to={"/pokemon"} style={{ textDecoration: "none" }}>
                  <NavButton
                    text="Pokemon"
                    color="blue"
                    isActive={pathname === "/pokemon"}
                    icon={<IconBallBasketball size={"1rem"} />}
                  />
                </Link>

                <Link to={"/moves"} style={{ textDecoration: "none" }}>
                  <NavButton
                    text="Moves"
                    color="blue"
                    isActive={pathname.includes("/moves")}
                    icon={<IconDisc size={"1rem"} />}
                  />
                </Link>

                <Link to={"/game-routes"} style={{ textDecoration: "none" }}>
                  <NavButton
                    text="Game Routes"
                    color="blue"
                    isActive={pathname.includes("/game-routes")}
                    icon={<IconGitBranch size={"1rem"} />}
                  />
                </Link>

                <Link to={"/backups"} style={{ textDecoration: "none" }}>
                  <NavButton
                    text="Manage Backups"
                    color="blue"
                    isActive={pathname.includes("/backups")}
                    icon={<IconArrowBackUp size={"1rem"} />}
                  />
                </Link>
                <Link to={"/settings"} style={{ textDecoration: "none" }}>
                  <NavButton
                    text="Wiki Settings"
                    color="blue"
                    isActive={pathname.includes("/settings")}
                    icon={<IconSettings size={"1rem"} />}
                  />
                </Link>
              </Navbar.Section>
            )}
            <Navbar.Section>
              <Menu width={200} shadow="lg" withArrow>
                <Grid>
                  <Grid.Col span={10}>
                    <Text weight={600}>
                      {wikiList[currentWiki]?.site_name || "Select Wiki"}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={2}>
                    <Menu.Target>
                      <IconDotsVertical
                        size={"1.2rem"}
                        style={{ cursor: "pointer" }}
                      />
                    </Menu.Target>
                  </Grid.Col>
                </Grid>
                <Menu.Dropdown>
                  <Menu.Label>Wikis</Menu.Label>
                  {Object.keys(wikiList).map((wiki, index) => (
                    <Menu.Item
                      key={index}
                      onClick={() => {
                        setCurrentWiki(wiki);
                        window.location.reload();
                      }}
                    >
                      {wikiList[wiki]?.site_name}
                    </Menu.Item>
                  ))}
                  <Menu.Divider />
                  <Menu.Label>Actions</Menu.Label>
                  <Menu.Item onClick={openCreate}>Create New Wiki</Menu.Item>
                  <Menu.Item onClick={openDeploy}>Deploy Wiki</Menu.Item>
                  <Menu.Item color="red" onClick={openDelete}>
                    Delete a Wiki
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Navbar.Section>
          </Navbar>
        }
      >
        <Outlet />
      </AppShell>
      <NewWikiModal opened={createModalOpened} onClose={closeCreate} />
      <DeleteWikiModal opened={deleteModalOpened} onClose={closeDelete} />
      <DeployWikiModal opened={deployModalOpened} onClose={closeDeploy} />
    </>
  );
};

export default MainAppshell;
