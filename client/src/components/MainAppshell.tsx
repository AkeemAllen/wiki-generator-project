import { AppShell, Grid, Menu, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconAdjustmentsUp,
  IconArrowBackUp,
  IconBallBasketball,
  IconBottleFilled,
  IconDisc,
  IconDotsVertical,
  IconGitBranch,
  IconSettings,
  IconSitemap,
  IconTree,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useLocalStorage } from "usehooks-ts";
import { useGetAbilities } from "../apis/abilitiesApis";
import { useGetItems } from "../apis/itemsApis";
import { useGetMoves } from "../apis/movesApis";
import { useGetNatures } from "../apis/naturesApis";
import { useGetPokemon } from "../apis/pokemonApis";
import { useGetRoutes } from "../apis/routesApis";
import { useUpdateEffect } from "../hooks/useUpdateEffect";
import {
  useAbilityStore,
  useItemsStore,
  useMovesStore,
  useNatureStore,
  usePokemonStore,
  useRouteStore,
} from "../stores";
import { Wikis } from "../types";
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

  const [wikiList, _] = useLocalStorage<Wikis>("wikiList", {});
  const [currentWiki, setCurrentWiki] = useLocalStorage("currentWiki", "none");

  const { pathname } = useLocation();
  const [navBarOpened, setNavBarOpened] = useState(false);
  const [createModalOpened, { close: closeCreate, open: openCreate }] =
    useDisclosure(false);
  const [deleteModalOpened, { close: closeDelete, open: openDelete }] =
    useDisclosure(false);
  const [deployModalOpened, { close: closeDeploy, open: openDeploy }] =
    useDisclosure(false);

  const { refetch: refetchPokemon, data: pokemonData } = useGetPokemon();
  const { refetch: refetchMoves, data: moveData } = useGetMoves();
  const { refetch: refetchRoutes, data: routeData } = useGetRoutes();
  const { refetch: refetchItems, data: itemData } = useGetItems();
  const { refetch: refetchAbilities, data: abilityData } = useGetAbilities();
  const { refetch: refetchNatures, data: natureData } = useGetNatures();

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

  useEffect(() => {
    if (pokemonData) {
      setPokemonList(pokemonData);
    }
  }, [pokemonData]);

  useEffect(() => {
    if (moveData) {
      setMovesList(moveData);
    }
  }, [moveData]);

  useEffect(() => {
    if (routeData) {
      setRoutes(routeData);
    }
  }, [routeData]);

  useEffect(() => {
    if (itemData) {
      setItemsList(itemData);
    }
  }, [itemData]);

  useEffect(() => {
    if (abilityData) {
      setAbilityList(abilityData);
    }
  }, [abilityData]);

  useEffect(() => {
    if (natureData) {
      setNatureList(natureData);
    }
  }, [natureData]);

  return (
    <>
      <AppShell
        header={{ height: 56.8 }}
        navbar={{
          width: 250,
          breakpoint: "sm",
          collapsed: { mobile: !navBarOpened },
        }}
        layout="alt"
        padding="md"
      >
        <AppShell.Header>
          {/* <Burger
            opened={navBarOpened}
            onClick={() => setNavBarOpened((o) => !o)}
            size="sm"
            mr="xl"
          /> */}
          <Text p="md">Wiki Generator Interface</Text>
        </AppShell.Header>
        <AppShell.Navbar p="md">
          {currentWiki !== "none" && (
            <AppShell.Section grow>
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

              <Link to={"/items"} style={{ textDecoration: "none" }}>
                <NavButton
                  text="Items"
                  color="blue"
                  isActive={pathname.includes("/items")}
                  icon={<IconBottleFilled size={"1rem"} />}
                />
              </Link>

              <Link to={"/abilities"} style={{ textDecoration: "none" }}>
                <NavButton
                  text="Abilities"
                  color="blue"
                  isActive={pathname.includes("/abilities")}
                  icon={<IconAdjustmentsUp size={"1rem"} />}
                />
              </Link>

              <Link to={"/natures"} style={{ textDecoration: "none" }}>
                <NavButton
                  text="Natures"
                  color="blue"
                  isActive={pathname.includes("/natures")}
                  icon={<IconTree size={"1rem"} />}
                />
              </Link>

              <Link to={"/game-routes"} style={{ textDecoration: "none" }}>
                <NavButton
                  text="Game Routes"
                  color="blue"
                  isActive={pathname.includes("/game-routes")}
                  icon={<IconSitemap size={"1rem"} />}
                />
              </Link>

              <Link to={"/generate-wiki"} style={{ textDecoration: "none" }}>
                <NavButton
                  text="Generate Wiki Pages"
                  color="blue"
                  isActive={pathname.includes("/generate-wiki")}
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
            </AppShell.Section>
          )}
          <AppShell.Section>
            <Menu width={200} shadow="lg" withArrow>
              <Grid>
                <Grid.Col span={10}>
                  <Text fw={600}>
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
                    {wikiList[wiki].site_name}
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
          </AppShell.Section>
        </AppShell.Navbar>
        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
      </AppShell>
      <NewWikiModal opened={createModalOpened} onClose={closeCreate} />
      <DeleteWikiModal opened={deleteModalOpened} onClose={closeDelete} />
      <DeployWikiModal opened={deployModalOpened} onClose={closeDeploy} />
    </>
  );
};

export default MainAppshell;
