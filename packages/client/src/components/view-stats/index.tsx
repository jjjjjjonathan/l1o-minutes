import { useState } from "react";
import { DivisionList } from "./select-division";
import DivisionSummary from "./division/summary";
import DivisionStats from "./division/stats";

const ViewStats = () => {
  const [viewMode, setViewMode] = useState(0);
  const [viewTitle, setViewTitle] = useState("Select a division");

  const changeView = (view: number, title: string) => {
    setViewMode(view);
    setViewTitle(title);
  };

  return (
    <>
      <h2 className="pb-8 text-3xl font-bold tracking-tight">{viewTitle}</h2>
      {viewMode === 0 ? <DivisionList handleClick={changeView} /> : null}
      {viewMode === 1 || viewMode === 2 ? (
        <div className="grid grid-cols-8 gap-8">
          <DivisionStats divisionId={viewMode} />
          <DivisionSummary divisionId={viewMode} />
        </div>
      ) : null}
    </>
  );
};

export default ViewStats;
