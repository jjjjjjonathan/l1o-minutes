import { trpc } from "@/utils/trpc";

const DivisionSummary = () => {
  const { data } = trpc.getDivisionSummary.useQuery({
    divisionId: 1,
  });
  return (
    <>
      {data ? `${typeof data[0].totalU20Minutes}` : null}
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>no data</p>}
    </>
  );
};

export default DivisionSummary;
