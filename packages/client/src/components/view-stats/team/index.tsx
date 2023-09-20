import PlayerList from "./player-list";

type TeamProps = {
  id: number;
};

const TeamView = ({ id }: TeamProps) => {
  return <PlayerList id={id} />;
};

export default TeamView;
