'use client';
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks/hooks";
import { FaTrophy, FaMedal, FaRibbon, FaStar } from "react-icons/fa6";


const LeaderBoard = () => {
  const router = useRouter();
  const players = useAppSelector((state) => state.players);
  const winners = useAppSelector((state) => state.gameState.winnerList);
  const isMultiplayer = useAppSelector((state) => state.gameState.isMultiplayer);
  const gameStatus = useAppSelector((state) => state.gameState.gameStatus);

  useEffect(() => {
    if (gameStatus !== 'end')
      router.push('/');
  }, [gameStatus]);

  const soloPlayer = (isMultiplayer && winners.length == 0) ? players.find((p) => p.socketId !== "disconnected") : undefined;

  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0: return <FaTrophy />;
      case 1: return <FaMedal />;
      case 2: return <FaRibbon />;
      default: return <FaStar />;
    }
  };

  const getWinnerClass = (index: number) => {
    const colors = [
      'bg-gradient-to-t from-amber-500 to-amber-300',
      'bg-gradient-to-t from-gray-300 to-gray-200',
      'bg-gradient-to-t from-orange-500 to-orange-400',
      'bg-gradient-to-t from-teal-500 to-teal-400'];
    return colors[index];
  };

  return (
    <div className="text-center">
      <div className="flex flex-col justify-center items-center">
        {winners.map((winner, index) => (
          <div key={index} className={`${getWinnerClass(index)} p-4 rounded-lg my-2`}>
            <p className="flex text-xl font-mono items-center px-2"><span className="text-3xl mr-4">{getMedalIcon(index)}</span>{players[+winner.split('')[1] - 1].name}</p>
          </div>
        ))}
        {
          isMultiplayer && winners.length == 0 &&
          <>
            <div className={`${getWinnerClass(3)} p-4 rounded-lg my-2`}>
              <p className="flex text-xl font-mono items-center px-2"><span className="text-3xl mr-4">{getMedalIcon(3)}</span>{soloPlayer?.name}</p>
            </div>
            <div className="font-mono flex flex-col gap-y-4 text-lg p-8 m-4">
              <p className="font-medium">Uh oh, your <span className="text-red-950 font-bold text-xl">Ludo buddies</span> seem to have taken a sudden <span className="text-orange-700 font-bold text-xl">Dicey Jokes Timeout!</span></p>
              <p className="font-medium">No worries, you do get the <span className="text-xl text-sky-700 font-bold">Star Award</span> & the board's always open for more fun.</p>
              <p className="font-medium">Round up your comrades and hit that <Link className="text-xl underline text-blue-800 font-bold" href="/multiplayer">PLAY</Link> button again!</p>
            </div>
          </>
        }
      </div>
    </div>
  );
};

export default LeaderBoard;

