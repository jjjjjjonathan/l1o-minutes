import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/utils/trpc";
import { useToast } from "@/components/ui/use-toast";

type PlayerOrTeam = {
  id: number;
  name: string;
};

type PlayerPopoverFormProps = {
  player: PlayerOrTeam;
  matchId: number;
  homeTeam: PlayerOrTeam;
  awayTeam: PlayerOrTeam;
};

const formSchema = z.object({
  playerId: z.number().min(1),
  teamName: z.string(),
  matchId: z.number().min(1),
  minutes: z.coerce.number().min(1).max(90),
});

const PlayerMinutePopoverForm = ({
  player,
  matchId,
  homeTeam,
  awayTeam,
}: PlayerPopoverFormProps) => {
  const { toast } = useToast();
  const { mutate } = trpc.insertOrUpdatePlayerMinute.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Stats updated!",
        description: `${player.name} played ${data[0].minutes} minute${
          data[0].minutes === 1 ? "" : "s"
        } for ${
          data[0].teamId === homeTeam.id ? homeTeam.name : awayTeam.name
        } in match #${matchId}.`,
      });
    },
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      playerId: player.id,
      matchId,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Submitting your player details. Hold on!",
      description: "Details should pop up soon.",
    });
    mutate({
      playerId: values.playerId,
      teamId: values.teamName === homeTeam.name ? homeTeam.id : awayTeam.id,
      matchId: values.matchId,
      minutes: values.minutes,
    });
  }
  return (
    <Form {...form}>
      <p className="pb-4 font-semibold">Add stats for {player.name}</p>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="minutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minutes played</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter a number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="playerId"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="hidden" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="teamName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select team</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={homeTeam.name}>
                      {homeTeam.name}
                    </SelectItem>
                    <SelectItem value={awayTeam.name}>
                      {awayTeam.name}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="matchId"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="hidden" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default PlayerMinutePopoverForm;
