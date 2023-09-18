import { trpc } from "@/utils/trpc";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Radar,
  RadarChart,
  PolarGrid,
  Legend,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type DivisionStatsProps = {
  divisionId: number;
};
const DivisionStats = ({ divisionId }: DivisionStatsProps) => {
  const { data } = trpc.divisions.getDivisionStats.useQuery({ divisionId });
  return (
    <div className="col-span-4">
      <Card>
        <CardHeader>
          <CardTitle>Average minutes by age group</CardTitle>
          <CardDescription>
            Comparing the division split in half by rank
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data ? (
            <>
              <ResponsiveContainer minHeight={500}>
                <RadarChart data={data}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[3500, data[0].fullMark + 1000]}
                  />
                  <Radar
                    name="Top Half"
                    dataKey="A"
                    fill="#315aff"
                    stroke="#b4c3ff"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Bottom Half"
                    dataKey="B"
                    fill="#ff4594"
                    stroke="#ffbad7"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="All Teams"
                    dataKey="C"
                    stroke="#fff93b"
                    fill="#fffca6"
                    fillOpacity={0.3}
                  />
                  <Tooltip contentStyle={{ backgroundColor: "#020817" }} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default DivisionStats;
