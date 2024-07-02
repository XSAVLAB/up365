import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useService } from "../../hooks/useService";
import { MdOutlineArrowDropDownCircle } from "react-icons/md";

function GameTable() {
  const [gamesTable, setGamesTable] = useState([]);
  const service = useService();
  const [showGames, setshowGames] = useState(false);
  const handleShowGames = () => {
    setshowGames(!showGames);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const gamesResponse = await service.get(
          "/games/singleDigitLottery/games"
        );
        const gamesData = gamesResponse.data;
        setGamesTable(gamesData);
        if (!gamesTable || gamesTable === 0)
          console.log("No Games Found. Wait for 5 to 15 minutes");
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    const interval = setInterval(async () => {
      await fetchData();
    }, 1000); // Fetch data every 2 second
    return () => {
      clearInterval(interval);
    };
  }, [gamesTable, service]);

  return (
    <div className="px-4 pb-10 flex flex-col items-center">
      <div
        onClick={handleShowGames}
        className="text-center font-semibold bg-black cursor-pointer text-white rounded-lg text-lg md:text-xl p-4 my-4 border-4 flex flex-row"
      >
        Games & Results
        <MdOutlineArrowDropDownCircle size={30} className="ml-4" />
      </div>
      {showGames ? (
        <div className="w-full md:w-auto flex h-auto overflow-x-auto lg:overflow-hidden rounded-lg text-white items-center">
          <table className="table-auto h-auto text-sm text-slate-900 border-4">
            <thead className="text-white bg-black font-bold text-sm md:text-xl">
              <tr>
                <th className="text-center border-4 p-1">ID</th>
                <th className="text-center border-4 p-1">Game-ID</th>
                <th className="text-center border-4 p-1">Date</th>
                <th className="text-center border-4 p-1">Start Time</th>
                <th className="text-center border-4 p-1">End Time</th>
                <th className="text-center border-4 p-1">Total Bets</th>
                <th className="text-center border-4 p-1">Total Amount</th>
                <th className="text-center border-4 p-1">Result</th>
              </tr>
            </thead>
            <tbody className="font-bold text-xs md:text-sm">
              {gamesTable
                .slice()
                .reverse()
                .map((row, index) => (
                  <tr key={index} className="bg-white">
                    <td className="text-center border-2 p-1">
                      {gamesTable.length - index}
                    </td>
                    <td className="text-center border-2 p-1">{row.gameID}</td>
                    <td className="text-center border-2 p-1">
                      {format(new Date(row.gameID * 1000), "dd/MM/yyyy")}
                    </td>
                    <td className="text-center border-2 p-1">
                      {format(new Date(row.gameID * 1000), "HH:mm:ss")}
                    </td>
                    <td className="text-center border-2 p-1">
                      {format(new Date(row.endTime * 1000), "HH:mm:ss")}
                    </td>
                    <td className="text-center border-2 p-1">
                      {row.totalBets}
                    </td>
                    <td className="text-center border-2 p-1">
                      {row.totalAmount}
                    </td>
                    <td className="text-center border-2 p-1 text-green-600 text-base hover:scale-125 cursor-pointer">
                      {row.winningNumber}
                    </td>
                  </tr>
                ))}
              <tr className="bg-black">
                <td className="border-4 p-4"></td>
                <td className="border-4 p-4"></td>
                <td className="border-4 p-4"></td>
                <td className="border-4 p-4"></td>
                <td className="border-4 p-4"></td>
                <td className="border-4 p-4"></td>
                <td className="border-4 p-4"></td>
                <td className="border-4 p-4"></td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default GameTable;
