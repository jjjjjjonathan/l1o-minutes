import { useState, useEffect } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { Input } from "./ui/input";
import { trpc } from "@/utils/trpc";

type Player = {
  id: number;
  name: string;
  yearOfBirth: number;
};

const PlayerSearch = () => {
  const utils = trpc.useContext()
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
  const { data } = trpc.searchForPlayer.useQuery({ name: debouncedSearchTerm });

  useEffect(() => {
    const searchForPlayer = async () => {
      setIsSearching(true);
      if (debouncedSearchTerm) {
        console.log(debouncedSearchTerm);
        utils.searchForPlayer.invalidate()
      }
      setIsSearching(false);
    };

    searchForPlayer();
  }, [debouncedSearchTerm]);

  return (
    <>
      <Input
        placeholder="Search for a player's name"
        onChange={(event) => setSearchTerm(event.target.value)}
      />
      <ul>
        {data ? data.map((player) => {
          return <li key={player.id}>{player.name}</li>
        }) : null}
      </ul>
    </>

  );
};

export default PlayerSearch;
