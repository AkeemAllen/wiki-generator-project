import {
  Autocomplete,
  Button,
  Grid,
  NativeSelect,
  NumberInput,
  ScrollArea,
  TextInput,
  Title,
} from "@mantine/core";
import { useHotkeys, useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useEffect, useRef, useState } from "react";
import { useEditRoute } from "../../apis/routesApis";
import { usePokemonStore, useRouteStore } from "../../stores";
import { AreaLevels, EncounterTypes, Encounters } from "../../types";
import { capitalize, isNullEmptyOrUndefined } from "../../utils";
import PokemonCard from "../PokemonCard";

// TODO: Fix bug where changing wikis leaves you on the same page, though it doesn't exist
const WildEncountersTab = ({ routeName }: { routeName: string }) => {
  const routes = useRouteStore((state) => state.routes);
  const setRoutes = useRouteStore((state) => state.setRoutes);
  const pokemonList = usePokemonStore((state) => state.pokemonList);

  const [currentEncountertype, setCurrentEncountertype] =
    useInputState<string>("grass-normal");
  const [specialEncounterArea, setSpecialEncounterArea] =
    useInputState<string>("");
  const [pokemonName, setPokemonName] = useInputState<string>("");
  const [encounterRate, setEncounterRate] = useState<number>(0);
  const [areaLevels, setAreaLevels] = useState<AreaLevels>({} as AreaLevels);
  const [wildEncounters, setWildEncounters] = useState<Encounters>(
    {} as Encounters
  );

  const addPokemonToEncountertype = () => {
    setWildEncounters((wildEncounters: Encounters) => {
      let encounterType = currentEncountertype;
      if (
        currentEncountertype === "special-encounter" ||
        currentEncountertype === "legendary-encounter"
      ) {
        encounterType = `${currentEncountertype} ${specialEncounterArea}`;
      }
      if (currentEncountertype === "other") {
        encounterType = specialEncounterArea;
      }

      return {
        ...wildEncounters,
        [encounterType]: [
          ...(wildEncounters[encounterType] ?? []),
          {
            name: pokemonName,
            id: pokemonList?.find((p) => p.name === pokemonName)?.id,
            encounter_rate: encounterRate,
          },
        ],
      };
    });
    submitWildEncounters();
    setPokemonName("");
  };

  const removePokemonFromEncountertype = (
    pokemonName: string,
    encounterType: string
  ) => {
    setWildEncounters((wildEncounters: Encounters) => {
      let currentEncounters = {
        ...wildEncounters,
        [encounterType]: wildEncounters[encounterType].filter(
          (pokemon) => pokemon.name !== pokemonName
        ),
      };
      if (currentEncounters[encounterType].length === 0) {
        delete currentEncounters[encounterType];
      }
      return currentEncounters;
    });
    submitWildEncounters();
  };

  const { mutate: submitWildEncounters } = useEditRoute({
    routeName,
    body: {
      wild_encounters: wildEncounters,
      wild_encounters_area_levels: areaLevels,
    },
    onSuccess: (data: any) => {
      close();
      setRoutes(data.routes);
      notifications.show({ message: "Successfully updated wild encounters" });
    },
  });

  useEffect(() => {
    setWildEncounters(routes[routeName]?.wild_encounters || {});
    setAreaLevels(routes[routeName]?.wild_encounters_area_levels || {});
    // When the page is refreshed, the routes are not loaded yet, so we also have to listen for
    // changes to the routes and update the wild encounters when the routes are loaded
    //
    // TODO: This causes more rerenders than I'd like so I should find a better way to do this at some point
  }, [routeName, routes]);

  const encounterTypeSelectRef = useRef<HTMLSelectElement>(null);

  useHotkeys(
    [
      ["alt+l", () => encounterTypeSelectRef.current?.focus()], // This speeds up the process of selecting the encounter type dropdown to add a new pokemon
    ],
    []
  );

  return (
    <>
      <Grid mt={5} mb={10}>
        <Grid.Col span={2}>
          <NativeSelect
            label="Encounter Type"
            onChange={(value) => setCurrentEncountertype(value)}
            value={currentEncountertype}
            data={EncounterTypes.map((type) => type)}
            ref={encounterTypeSelectRef}
          />
        </Grid.Col>
        {(currentEncountertype === "special-encounter" ||
          currentEncountertype === "legendary-encounter" ||
          currentEncountertype === "other") && (
          <Grid.Col span={2}>
            <TextInput
              label="Special Encounter Area"
              value={specialEncounterArea}
              onChange={setSpecialEncounterArea}
            />
          </Grid.Col>
        )}
        <Grid.Col span={4}>
          <Autocomplete
            label="Pokemon for current encounter type"
            placeholder="Pokemon Name"
            value={pokemonName}
            onChange={(value) => setPokemonName(value)}
            data={
              pokemonList === undefined ? [] : pokemonList.map((p) => p.name)
            }
            limit={5}
          />
        </Grid.Col>
        <Grid.Col span={2}>
          <NumberInput
            label="Encounter Rate"
            value={encounterRate}
            onChange={(e) => setEncounterRate(e as number)}
          />
        </Grid.Col>
        <Grid.Col span={2} mt={25}>
          <Button
            disabled={isNullEmptyOrUndefined(pokemonName)}
            onClick={addPokemonToEncountertype}
          >
            Add Pokemon
          </Button>
        </Grid.Col>
      </Grid>
      <ScrollArea.Autosize mah={"calc(100vh - 300px)"} offsetScrollbars>
        {!isNullEmptyOrUndefined(wildEncounters) &&
          Object.keys(wildEncounters).map((encounterType, index) => {
            return (
              <div key={index}>
                <Title order={4} mt={20}>
                  {capitalize(encounterType)} Encounters{" "}
                </Title>
                <TextInput
                  placeholder="Level Range. Eg.'20 - 30'"
                  mt={10}
                  style={{ width: "12rem" }}
                  value={areaLevels[encounterType] || ""}
                  onChange={(e) =>
                    setAreaLevels({
                      ...areaLevels,
                      [encounterType]: e.target.value,
                    })
                  }
                />
                <Grid mt={10}>
                  {wildEncounters[encounterType]?.map((pokemon, index) => {
                    return (
                      <Grid.Col key={index} span={2}>
                        <PokemonCard
                          pokemon={pokemon}
                          removePokemon={() =>
                            removePokemonFromEncountertype(
                              pokemon.name as string,
                              encounterType
                            )
                          }
                        />
                      </Grid.Col>
                    );
                  })}
                </Grid>
              </div>
            );
          })}
      </ScrollArea.Autosize>
    </>
  );
};

export default WildEncountersTab;
