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
import { Button } from "./ui/button";
import { trpc } from "@/utils/trpc";
import { useToast } from "./ui/use-toast";

const formSchema = z.object({
  name: z.string().min(2),
  yearOfBirth: z.coerce.number(),
});

const NewPlayerPopoverForm = () => {
  const utils = trpc.useContext();
  const { toast } = useToast();
  const { mutate } = trpc.addNewPlayer.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Stats updated!",
        description: `${data[0].name} is now in the database for future matches.`,
      });
      utils.searchForPlayer.invalidate();
    },
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Submitting your new player details. Hold on!",
      description: "Details should pop up soon.",
    });
    mutate(values);
  }
  return (
    <Form {...form}>
      <p className="pb-4 font-semibold">Create a new player</p>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Player name</FormLabel>
              <FormControl>
                <Input type="text" {...field} placeholder="Enter their name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="yearOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year of birth</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter their year of birth"
                  {...field}
                />
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

export default NewPlayerPopoverForm;
