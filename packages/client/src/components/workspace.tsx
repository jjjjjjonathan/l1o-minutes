import { trpc } from "@/utils/trpc";

const Workspaces = () => {
  const { data } = trpc.getWorkspaces.useQuery();

  return (
    <>
      <h2>Workspaces</h2>
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>no data</p>}
    </>
  );
};

export default Workspaces;
