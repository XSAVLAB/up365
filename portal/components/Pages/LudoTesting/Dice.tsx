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
    if (isRolling) return;
    dispatch(passTurn());
  };

  const diceIcons = [
    <FaDiceD6 size={40} />,
    <FaDiceOne size={40} />,
    <FaDiceTwo size={40} />,
    <FaDiceThree size={40} />,
    <FaDiceFour size={40} />,
    <FaDiceFive size={40} />,
    <FaDiceSix size={40} />
  ];

  return (
    <>
      <button
        className={`dice-btn common-btn ${playerId === currentTurn ? 'breathing' : ''} ${isRolling || hasRolled ? 'disabled' : ''}`}
        onClick={handleDiceClick}
        disabled={isRolling || hasRolled}>
        <span className="flex justify-center">
          {isRolling ? diceIcons[rollingDice] : diceIcons[diceNumber]}
        </span>
      </button>

      {/* {currentTurn === playerId &&
        <button
          key={`PT${playerId}`}
          disabled={isRolling}
          onClick={handlePassTurn}
          className={`pass-turn-btn common-btn ${isRolling ? 'disabled' : ''}`}>
          Pass Turn
        </button>
      } */}
    </>
  );
};

export default Dice;
