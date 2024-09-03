'use client';

import { useState } from "react";
import { passTurn } from "@/redux/slices/game";
import { useAppSelector, useAppDispatch } from "@/redux/hooks/hooks";
import { diceRoll, validateTurn } from "@/redux/middleware/gameLogic";
import { FaDiceD6, FaDiceOne, FaDiceTwo, FaDiceThree, FaDiceFour, FaDiceFive, FaDiceSix } from "react-icons/fa6";

interface DiceProps { playerId: string; };

const Dice: React.FC<DiceProps> = ({ playerId }) => {
  const diceNumber = useAppSelector(state => state.gameState.diceRoll);
  const hasRolled = useAppSelector(state => state.gameState.hasRolled);
  const currentTurn = useAppSelector((state) => state.gameState.currentTurn);
  const dispatch = useAppDispatch();
  const [isRolling, setIsRolling] = useState(false);
  const [rollingDice, setRollingDice] = useState(0);


  const handleDiceClick = () => {
    if (!hasRolled) {
      setIsRolling(true);
      const rolling = setInterval(() => {
        setRollingDice((prev) => Math.floor(Math.random() * 6) + 1);
      }, 50);

      setTimeout(() => {
        dispatch(diceRoll());
        dispatch(validateTurn());
        setIsRolling(false);
        clearInterval(rolling);
      }, 1500);
    }
  };

  const handlePassTurn = () => {
    if (isRolling)
      return;
    dispatch(passTurn());
  };

  const diceIcons = [<FaDiceD6 />, <FaDiceOne />, <FaDiceTwo />, <FaDiceThree />, <FaDiceFour />, <FaDiceFive />, <FaDiceSix />];

  const common_CSS = "border-2 rounded-2xl shadow-lg shadow-slate-700 transition-all duration-400 ease-in-out hover:shadow-md";

  const diceCursorClass = (isRolling || hasRolled) ? 'cursor-not-allowed' : 'cursor-pointer';

  const passTurnClass = isRolling ? 'cursor-not-allowed' : 'cursor-pointer';

  const breathingAnim = (playerId === currentTurn) ? 'breathingAnim' : '';


  return (
    <>
      <button className={`mx-3 w-20 h-20 bg-slate-600 text-white ${breathingAnim} ${common_CSS} ${diceCursorClass} hover:bg-slate-700`}
        onClick={handleDiceClick}
        disabled={isRolling || hasRolled}>
        <span className="flex justify-center text-6xl">
          {isRolling ? diceIcons[rollingDice] : diceIcons[diceNumber]}
        </span>
      </button>
      {currentTurn === playerId &&
        <button
          key={`PT${playerId}`}
          disabled={isRolling}
          onClick={handlePassTurn}
          className={`w-36 h-20 mx-1 ml-2 px-6 py-2 border-orange-700 bg-amber-500 text-slate-900 text-xl font-mono font-semibold ${passTurnClass} ${common_CSS}`}>
          Pass Turn
        </button>
      }
    </>
  );
};
export default Dice;