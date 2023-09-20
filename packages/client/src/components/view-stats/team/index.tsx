import PlayerList from "./player-list";
import PlayerMinutesForTeam from "./player-minutes";

type TeamProps = {
  id: number;
};

const TeamView = ({ id }: TeamProps) => {
  return (
    <>
      <PlayerMinutesForTeam id={id} />
      <PlayerList id={id} />
    </>
  );
};

export default TeamView;
