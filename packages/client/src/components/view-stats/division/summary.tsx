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
  const { data } = trpc.getDivisionSummary.useQuery({
    divisionId,
  });

  return (
    <div className="grid grid-cols-5 gap-x-8">
      <Card className="col-span-3 w-full">
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
      <div className="col-span-2">
        <p>second col</p>
      </div>
    </div>
  );
};

export default DivisionSummary;
