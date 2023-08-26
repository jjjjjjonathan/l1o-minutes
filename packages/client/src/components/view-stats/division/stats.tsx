import { trpc } from "@/utils/trpc";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type DivisionStatsProps = {
  divisionId: number;
};
const DivisionStats = ({ divisionId }: DivisionStatsProps) => {
  return (
    <div className="col-span-2">
      <Card>
        <CardHeader>
          <CardTitle>Division Stats</CardTitle>
          <CardDescription>A little bit about the division</CardDescription>
        </CardHeader>
        <CardContent>
          <p>content goes here for {divisionId}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DivisionStats;
