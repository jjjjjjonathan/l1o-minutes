import { trpc } from "@/utils/trpc";
import { columns } from "./rankings/columns";
import { DataTable } from "./rankings/data-table";

type DivisionSummaryProps = {
  divisionId: number;
};

const DivisionSummary = ({ divisionId }: DivisionSummaryProps) => {
  const { data } = trpc.getDivisionSummary.useQuery({
    divisionId,
  });

  if (data) {
    return <DataTable columns={columns} data={data} />;
  } else {
    return null;
  }
};

export default DivisionSummary;
