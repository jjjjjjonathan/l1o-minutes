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
  const { data } = trpc.searchForPlayer.useQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Player[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const searchForPlayer = async () => {
      setIsSearching(true);
      if (debouncedSearchTerm) {
        console.log(debouncedSearchTerm);
        if (data) {
          setResults(data);
        }
      }
      setIsSearching(false);
    };

    searchForPlayer();
  }, [debouncedSearchTerm]);

  return (
    <Input
      placeholder="Search for a player's name"
      onChange={(event) => setSearchTerm(event.target.value)}
    />
  );
};

export default PlayerSearch;
