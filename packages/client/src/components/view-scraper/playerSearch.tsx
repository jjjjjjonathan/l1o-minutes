import { useState, useEffect } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { Input } from "@/components/ui/input";
import { trpc } from "@/utils/trpc";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import PlayerPopoverForm from "./playerMinutePopoverForm";
import NewPlayerPopoverForm from "./newPlayerPopoverForm";

type Team = {
  id: number;
  name: string;
};

type PlayerSearchProps = {
  matchId: number;
  homeTeam: Team;
  awayTeam: Team;
};

const PlayerSearch = ({ matchId, homeTeam, awayTeam }: PlayerSearchProps) => {
  const utils = trpc.useContext();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
  const { data, isLoading, isSuccess } = trpc.searchForPlayer.useQuery({
    name: debouncedSearchTerm,
  });

  useEffect(() => {
    const searchForPlayer = async () => {
      if (debouncedSearchTerm.length >= 3) {
        utils.searchForPlayer.invalidate();
      }
    };

    searchForPlayer();
  }, [debouncedSearchTerm]);

  return (
    <>
      <Input
        className="mt-4"
        placeholder="Search for a player's name"
        onChange={(event) => setSearchTerm(event.target.value)}
      />

      <Table className="mt-4">
        <TableCaption>
          {debouncedSearchTerm.length >= 3 && isLoading
            ? "Loading..."
            : isSuccess && debouncedSearchTerm.length < 3
            ? "Search with at least three characters."
            : isSuccess && data.length <= 0
            ? "No results."
            : `Search results loaded. Refine your search if needed.`}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Year of Birth</TableHead>
            <TableHead>Select</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data
            ? data.map((player) => (
                <TableRow key={player.id}>
                  <TableCell>{player.name}</TableCell>
                  <TableCell>{player.yearOfBirth}</TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button>Select player</Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <PlayerPopoverForm
                          player={{ id: player.id, name: player.name }}
                          matchId={matchId}
                          homeTeam={homeTeam}
                          awayTeam={awayTeam}
                        />
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              ))
            : null}
        </TableBody>
      </Table>
      <p className="pb-8 pt-16">
        If you can't find a player but you know their birth year, add them into
        the database below.
      </p>
      <Popover>
        <PopoverTrigger asChild>
          <Button>Add new player</Button>
        </PopoverTrigger>
        <PopoverContent>
          <NewPlayerPopoverForm />
        </PopoverContent>
      </Popover>
    </>
  );
};

export default PlayerSearch;
