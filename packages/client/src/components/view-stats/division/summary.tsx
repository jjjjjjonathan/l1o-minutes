import { trpc } from "@/utils/trpc";
import { columns } from "./rankings/columns";
import { DataTable } from "./rankings/data-table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type DivisionSummaryProps = {
  divisionId: number;
};

const DivisionSummary = ({ divisionId }: DivisionSummaryProps) => {
  const { data } = trpc.divisions.getDivisionSummary.useQuery({
    divisionId,
  });

  return (
    <Card className="col-span-8 w-full">
      <CardHeader>
        <CardTitle>Summary</CardTitle>
        <CardDescription>
          Standings from 2023 with total U-23 and U-20 minutes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data ? (
          <DataTable columns={columns} data={data} />
        ) : (
          <p>nothing yet</p>
        )}
      </CardContent>
    </Card>
  );
};

export default DivisionSummary;
