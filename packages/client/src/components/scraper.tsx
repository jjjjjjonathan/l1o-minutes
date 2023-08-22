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

type Player = {
  minutes: number;
  matchId: number;
  playerId: number;
  teamId: number;
};

const scraperFormSchema = z.object({
  match: z
    .string()
    .url()
    .startsWith("https://www.league1ontario.com/game/show/", {
      message: "URL is not a League1 Ontario match page",
    }),
});

export const Scraper = () => {
  const [insertedPlayers, setInsertedPlayers] = useState<Player[]>([]);
  const [updatedPlayers, setUpdatedPlayers] = useState<Player[]>([]);
  const [missingPlayers, setMissingPlayers] = useState<string[]>([]);
  const { mutate } = trpc.scrapeMatch.useMutation({
    onSuccess: (data) => {
      setInsertedPlayers(data.insertedPlayers);
      setUpdatedPlayers(data.updatedPlayers);
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
      <p>These players were inserted</p>
      {JSON.stringify(insertedPlayers, null, 2)}
      <p>These players were updated</p>
      {JSON.stringify(updatedPlayers, null, 2)}
      <p>These players were missing</p>
      {JSON.stringify(missingPlayers, null, 2)}
    </>
  );
};
