import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "./utils/trpc";
import TeamList from "@/components/teamList";

function App() {
  const [count, setCount] = useState(0);

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

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <h1 className="text-6xl font-bold text-red-500">Vite + React</h1>
        <div className="card">
          <Button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </Button>
          <p className="text-3xl">
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <TeamList />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
