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

const scraperFormSchema = z.object({
  match: z
    .string()
    .url()
    .startsWith("https://www.league1ontario.com/game/show/", {
      message: "URL is not a League1 Ontario match page",
    }),
});

export const Scraper = () => {
  const form = useForm<z.infer<typeof scraperFormSchema>>({
    resolver: zodResolver(scraperFormSchema),
    defaultValues: {
      match: "",
    },
  });

  function onSubmit(values: z.infer<typeof scraperFormSchema>) {
    console.log(values);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
  );
};
