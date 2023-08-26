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
  const { data } = trpc.getDivisionStats.useQuery({ divisionId });
  return (
    <div className="col-span-3">
      <Card>
        <CardHeader>
          <CardTitle>Division Stats</CardTitle>
          <CardDescription>A little bit about the division</CardDescription>
        </CardHeader>
        <CardContent>
          <p>content goes here for {divisionId}</p>
          {data ? (
            <>
              <p>{data[0].averageU23MinutesTop} is the avg u23 minutes</p>
              <p>{data[0].averageU20MinutesTop} is the avg u20 minutes</p>
              <p>{data[0].averageU23MinutesBottom} is the avg u23 minutes</p>
              <p>{data[0].averageU20MinutesBottom} is the avg u20 minutes</p>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default DivisionStats;
