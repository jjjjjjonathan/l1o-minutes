import { trpc } from "@/utils/trpc";
import { TeamRanking, columns } from "./rankings/columns";
import { DataTable } from "./rankings/data-table";

const DivisionSummary = () => {
  const { data } = trpc.getDivisionSummary.useQuery({
    divisionId: 1,
  });

  if (data) {
    return <DataTable columns={columns} data={data} />;
  } else {
    return <p>no data</p>;
  }
};

export default DivisionSummary;
