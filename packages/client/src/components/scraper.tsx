import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { trpc } from "@/utils/trpc";
import { useState } from "react";
import { useToast } from "./ui/use-toast";
import PlayerSearch from "./playerSearch";

type Player = {
  minutes: number;
  matchId: number;
  playerId: number;
  teamId: number;
  name?: string;
};

type PlayerListProps = {
  players: Player[];
  message: string;
};

const scraperFormSchema = z.object({
  match: z
    .string()
    .url()
    .startsWith("https://www.league1ontario.com/game/show/", {
      message: "URL is not a League1 Ontario match page",
    }),
});

const PlayerList = ({ players, message }: PlayerListProps) => {
  return (
    <>
      <p>{message}</p>
      <ul>
        {players.map((player) => (
          <li key={player.name}>
            {player.name} who played {player.minutes} minutes.
          </li>
        ))}
      </ul>
    </>
  );
};

export const Scraper = () => {
  const [missingPlayers, setMissingPlayers] = useState<Player[]>([]);
  const { mutate } = trpc.scrapeMatch.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Match has been scraped!",
        description: `Match #${data.matchId} between ${data.homeTeam.name} and ${data.awayTeam.name} is now in the system.`,
      });
      if (data.missingPlayers.length > 0) {
        toast({
          title: "Some players couldn't be added.",
          description:
            "Check the list and see if you can find the players in the database.",
        });
      }
      setMissingPlayers(data.missingPlayers);
    },
  });
  const form = useForm<z.infer<typeof scraperFormSchema>>({
    resolver: zodResolver(scraperFormSchema),
    defaultValues: {
      match: "",
    },
  });

  function onSubmit(values: z.infer<typeof scraperFormSchema>) {
    toast({
      title: "Match submitted. Hang tight!",
      description: "Details should pop up soon.",
    });
    mutate(values);
  }

  const { toast } = useToast();
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight">
        Scrape a League1 Ontario match
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pt-8">
          <FormField
            control={form.control}
            name="match"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Match URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://www.league1ontario.com/game/show/..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Write the match URL page from the League1 Ontario website
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
      {missingPlayers.length > 0 ? (
        <>
          <PlayerList
            players={missingPlayers}
            message="I can't find info on these players:"
          />
          <PlayerSearch />
        </>
      ) : null}
    </>
  );
};
