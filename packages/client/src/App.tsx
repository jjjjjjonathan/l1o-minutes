import { useState, useEffect } from "react";
import { Workspace } from "types";
import { Button } from "@/components/ui/button";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "./utils/trpc";
import Workspaces from "@/components/workspace";

function App() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState<Workspace[]>([]);

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

  // useEffect(() => {
  //   fetch("http://localhost:3001/workspaces")
  //     .then((response) => response.json())
  //     .then(({ data }) => {
  //       setData(data);
  //     });
  // });

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
        <Workspaces />
        {/* <h2>Workspaces</h2>
        <pre>{JSON.stringify(data, null, 2)}</pre> */}
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
