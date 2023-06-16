import {
  AppShell,
  Burger,
  Button,
  Grid,
  Header,
  MediaQuery,
  Navbar,
  Popover,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBallBasketball,
  IconDisc,
  IconGitBranch,
} from "@tabler/icons-react";
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useLocalStorage } from "usehooks-ts";
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
import NavButton from "./NavButton";
import NewWikiModal from "./NewWikiModal";

const MainAppshell = () => {
  const setPokemonList = usePokemonStore((state) => state.setPokemonList);
  const setMovesList = useMovesStore((state) => state.setMovesList);
  const setRoutes = useRouteStore((state) => state.setRoutes);
  const setItemsList = useItemsStore((state) => state.setItemsList);
  const setAbilityList = useAbilityStore((state) => state.setAbilityList);
  const setNatureList = useNatureStore((state) => state.setNaturesList);

  //   const wikiList = useWikiStore((state) => state.wikis);
  const [wikiList, setWikiList] = useLocalStorage("wikiList", {});
  const [currentWiki, setCurrentWiki] = useLocalStorage("currentWiki", "none");

  const { pathname } = useLocation();
  const [navBarOpened, setNavBarOpened] = useState(false);
  const [wikiModalOpened, { close, open }] = useDisclosure(false);

  useGetPokemon((data: any) => setPokemonList(data));

  useGetMoves((data: any) => setMovesList(data));

  useGetRoutes((data: any) => setRoutes(data));

  useGetItems((data: any) => setItemsList(data));

  useGetAbilities((data: any) => setAbilityList(data));

  useGetNatures((data: any) => setNatureList(data));

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
            <Navbar.Section grow>
              <Link to={"/pokemon"} style={{ textDecoration: "none" }}>
                <NavButton
                  text="Pokemon"
                  color="blue"
                  isActive={pathname === "/pokemon"}
                  icon={<IconBallBasketball size={"1rem"} />}
                />
              </Link>
              <Link to={"/multiple-pokemon"} style={{ textDecoration: "none" }}>
                <NavButton
                  text="Multiple Pokemon"
                  color="blue"
                  isActive={pathname.includes("/multiple-pokemon")}
                  icon={<IconBallBasketball size={"1rem"} />}
                />
              </Link>

              <Link to={"/moves"} style={{ textDecoration: "none" }}>
                <NavButton
                  text="Moves"
                  color="teal"
                  isActive={pathname.includes("/moves")}
                  icon={<IconDisc size={"1rem"} />}
                />
              </Link>

              <Link to={"/game-routes"} style={{ textDecoration: "none" }}>
                <NavButton
                  text="GameRoutes"
                  color="yellow"
                  isActive={pathname.includes("/game-routes")}
                  icon={<IconGitBranch size={"1rem"} />}
                />
              </Link>
            </Navbar.Section>
            <Navbar.Section>
              <Popover withArrow>
                <Popover.Target>
                  <Button fullWidth sx={{ backgroundColor: "rgba(0,0,0,50%)" }}>
                    {currentWiki}
                  </Button>
                </Popover.Target>
                <Popover.Dropdown>
                  <Grid>
                    {Object.keys(wikiList).map((wiki) => (
                      <Grid.Col>
                        <Button
                          onClick={() => {
                            setCurrentWiki(wiki);
                            location.reload();
                          }}
                          fullWidth
                        >
                          {wiki}
                        </Button>
                      </Grid.Col>
                    ))}
                  </Grid>
                </Popover.Dropdown>
              </Popover>
              <Button mt={20} onClick={open} fullWidth>
                Create New Wiki
              </Button>
            </Navbar.Section>
          </Navbar>
        }
      >
        <Outlet />
      </AppShell>
      <NewWikiModal opened={wikiModalOpened} onClose={close} />
    </>
  );
};

export default MainAppshell;
