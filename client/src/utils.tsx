import { ImportantTrainers, Trainers } from "./types";

export const isNullEmptyOrUndefined = (value: any) => {
  return value === null || value === "" || value === undefined;
};

export const capitalize = (value: string) => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const setUniquePokemonId = (
  trainers: ImportantTrainers | Trainers,
  trainerName: string,
  pokemonName: string,
  pokemonList: any
) => {
  let teamLength = 0;

  if (isNullEmptyOrUndefined(trainers)) {
    return `${
      pokemonList?.find((p: any) => p.name === pokemonName)?.id
    }_${teamLength}_${Math.floor(Math.random() * 9000 + 1000)}`;
  }

  if (trainerName in trainers) {
    if (!isNullEmptyOrUndefined(trainers[trainerName].pokemon)) {
      teamLength = trainers[trainerName].pokemon.length;
    }
  }
  return `${
    pokemonList?.find((p: any) => p.name === pokemonName)?.id
  }_${teamLength}_${Math.floor(Math.random() * 9000 + 1000)}`;
};
