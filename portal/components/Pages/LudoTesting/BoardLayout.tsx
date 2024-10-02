'use client';
import PlayerCard from "./PlayerCard";
import DynamicLudoBoard from "./DynamicLudoBoard";

const BoardLayout = () => {
  return (
    <div className="ludo-board-layout">
      <div className="my-4 flex justify-between">
        <PlayerCard key="P2" id="P2" />
        <PlayerCard key="P3" id="P3" />
      </div>
      <div className="w-auto h-auto">
        <DynamicLudoBoard />
      </div>
      <div className="my-4 flex justify-between">
        <PlayerCard key="P1" id="P1" />
        <PlayerCard key="P4" id="P4" />
      </div>
    </div>
  );
};

export default BoardLayout;