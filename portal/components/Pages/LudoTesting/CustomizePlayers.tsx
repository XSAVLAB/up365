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
  const [numberOfPlayers, setNumberOfPlayers] = useState(4);
  const [playerNames, setPlayerNames] = useState<PlayerNames>({
    P1: 'Suresh',
    P2: 'Ramesh',
    P3: 'Rahul',
    P4: 'Manish'
  });
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(resetGameState());
    dispatch(resetPlayerState());
    // Automatically submit the form after setting the player names and number of players
    handleSubmit();
  }, []);

  const handleNumberOfPlayersChange = (num: number) => {
    setNumberOfPlayers(num);
    setPlayerNames({});
  };

  const handlePlayerNameChange = (id: string, name: string) => {
    setPlayerNames({ ...playerNames, [id]: name.trim() });
  };

  const handleSubmit = (e?: any) => {
    if (e) e.preventDefault(); 
    if (Object.keys(playerNames).length !== numberOfPlayers || Object.values(playerNames).some((value) => !value.trim())) {
      alert('No Names, no Game! Roll call before rolling the dice.');
    } else {
      dispatch(start(playerNames, numberOfPlayers));
      setTimeout(() => {
        router.push('/ludo-testing');
      }, 1000);
    }
  };

  return (
    <div className="loading-body">
      <div className="ring">Waiting<span className="loading-span"></span></div>
    </div>
  );
};

export default CustomizePlayers;
