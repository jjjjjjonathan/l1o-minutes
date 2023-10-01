import { trpc } from "@/utils/trpc";

type ReserveStatsProps = {
  divisionId: number;
};
const ReserveStats = ({ divisionId }: ReserveStatsProps) => {
  const { data, error } = trpc.divisions.getReserveStats.useQuery({
    divisionId,
  });
  if (error) {
    return <p>{error.message}</p>;
  }
  if (data) {
    return (
      <>
        <p>{data.length}</p>
        <p>{data.map((player) => player.name).join(", ")}</p>
      </>
    );
  }
};

export default ReserveStats;
