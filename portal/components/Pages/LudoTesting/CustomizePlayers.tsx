"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from "@/redux/hooks/hooks";
import { start } from '@/redux/middleware/gameLogic';
import { resetGameState } from '@/redux/slices/game';
import { resetPlayerState } from '@/redux/slices/player';

interface PlayerNames { [key: string]: string; };

const CustomizePlayers = () => {
  const router = useRouter();
  const [numberOfPlayers, setNumberOfPlayers] = useState(2);
  const [playerNames, setPlayerNames] = useState<PlayerNames>({});
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(resetGameState());
    dispatch(resetPlayerState());
  }, []);

  const handleNumberOfPlayersChange = (num: number) => {
    setNumberOfPlayers(num);
    setPlayerNames({});
  };

  const handlePlayerNameChange = (id: string, name: string) => {
    setPlayerNames({ ...playerNames, [id]: name.trim() });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (Object.keys(playerNames).length !== numberOfPlayers || Object.values(playerNames).some((value) => !value.trim())) {
      alert('No Names, no Game! Roll call before rolling the dice.');
    }
    else {
      dispatch(start(playerNames, numberOfPlayers));
      setTimeout(() => {
        router.push('/ludo-testing');
      }, 1000);
    }
  };

  return (
    <form className="flex flex-col items-center justify-center" id="playerNamesForm">
      <div className="mb-12 text-xl md:flex-row flex flex-col items-center">
        <label className="font-mono mx-4 my-2 hover:font-semibold cursor-pointer">
          <input className="mx-2 w-4 h-4 hover:scale-125"
            type="radio"
            value="2"
            checked={numberOfPlayers === 2}
            onChange={() => handleNumberOfPlayersChange(2)} />
          Dice Duos!
        </label>
        <label className="font-mono mx-4 my-4 hover:font-semibold cursor-pointer">
          <input className="mx-2 w-4 h-4 hover:scale-125"
            type="radio"
            value="4"
            checked={numberOfPlayers === 4}
            onChange={() => handleNumberOfPlayersChange(4)} />
          Double the Duos!
        </label>
      </div>
      <div className="flex flex-col h-72 justify-center">
        {Array.from({ length: numberOfPlayers }, (_, index) => (
          <div key={index + 1} className="flex my-4">
            <input
              key={`N${index + 1}`}
              id={`P${index + 1}`}
              type="text"
              placeholder={`Player ${index + 1}`}
              value={playerNames[`P${index + 1}`] || ''}
              onChange={(e) => handlePlayerNameChange(`P${index + 1}`, e.target.value)}
              className="px-2 font-mono border rounded-md mx-8 h-12 focus:outline-none focus:ring-4 focus:ring-sky-600" />
          </div>
        ))}
      </div>
      <button
        type="submit"
        onClick={handleSubmit}
        className="bg-blue-500 px-6 py-3 rounded-md mt-12 text-xl font-mono font-semibold hover:bg-blue-600 mb-10 lg:mb-0">
        Start
      </button>
    </form>
  );
};

export default CustomizePlayers;