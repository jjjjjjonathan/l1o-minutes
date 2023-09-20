import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { trpc } from "@/utils/trpc";

type PlayerMinutesForTeamProps = {
  id: number;
};

const PlayerMinutesForTeam = ({ id }: PlayerMinutesForTeamProps) => {
  const { data } = trpc.teams.getTotalMinutesByBirthYear.useQuery({ id });

  if (data) {
    return (
      <Card className="col-span-8 w-full">
        <CardHeader>
          <CardTitle>placeholder title</CardTitle>
          <CardDescription>minutes sorted by year</CardDescription>
        </CardHeader>
        <CardContent>
          {data ? (
            <ResponsiveContainer minHeight={500}>
              <BarChart
                width={500}
                height={300}
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="yearOfBirth" />
                <YAxis />
                <Bar dataKey="totalMinutes" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>nothing yet</p>
          )}
        </CardContent>
      </Card>
    );
  }
};

export default PlayerMinutesForTeam;
