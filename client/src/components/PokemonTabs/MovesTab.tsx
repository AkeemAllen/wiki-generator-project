import { useState } from "react";
import { useUpdateEffect } from "usehooks-ts";
import { Move, PokemonChanges, PokemonData } from "../../types";
import MovesTable from "../MovesTable";

type MovesTabProps = {
  pokemonData: PokemonData;
  pokemonChanges: PokemonChanges | null;
  setPokemonChanges: any;
};

const MovesTab = ({
  pokemonChanges,
  setPokemonChanges,
  pokemonData,
}: MovesTabProps) => {
  const [moves, setMoves] = useState<Move>(pokemonData.moves);
  useUpdateEffect(() => {
    setPokemonChanges({
      ...pokemonChanges,
      moves: moves,
    });
  }, [moves]);
  return <MovesTable setMoves={setMoves} moves={moves} />;
};

export default MovesTab;
