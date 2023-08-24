import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "./utils/trpc";
import { DivisionList } from "./components/view-stats/division";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scraper } from "@/components/view-scraper/";
import { Toaster } from "./components/ui/toaster";

function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "http://localhost:3001/trpc",
        }),
      ],
    }),
  );
  const [view, setView] = useState<"viewer" | "scraper">("viewer");

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <div className="container relative flex flex-col p-8">
          <div className="flex flex-row items-center justify-between">
            <header>
              <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">
                Minutes Scraper
              </h1>
              <span className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
                League1 Ontario minutes grouped by team and player birth year
              </span>
            </header>
            <Tabs defaultValue="viewer">
              <TabsList>
                <TabsTrigger value="viewer" onClick={() => setView("viewer")}>
                  View stats
                </TabsTrigger>
                <TabsTrigger value="scraper" onClick={() => setView("scraper")}>
                  Scrape match
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <main className="pt-8">
            {view === "viewer" ? <DivisionList /> : null}
            {view === "scraper" ? <Scraper /> : null}
          </main>
        </div>
        <Toaster />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
