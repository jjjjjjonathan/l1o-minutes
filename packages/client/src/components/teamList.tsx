import { trpc } from "@/utils/trpc";

const TeamList = () => {
  const { data } = trpc.getDivisions.useQuery();

  return (
    <>
      <h2>Teams</h2>
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>no data</p>}
    </>
  );
};

export default TeamList;
