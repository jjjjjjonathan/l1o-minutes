import { trpc } from "@/utils/trpc"

type TeamProps = {
  id: number
}

const TeamView = ({ id }: TeamProps) => {
  const { data } = trpc.teams.getPlayersFromTeam.useQuery({ id })
  if (data) {
    return <p>{data[0].playerName}: is {data[0].isU23 ? "" : "not"} U23 {typeof data[0].isU23}</p>
  }
}

export default TeamView