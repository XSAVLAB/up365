"use client";
import { fetchUnsettledCricketBets } from "@/api/firestoreAdminService";
import { useEffect, useState } from "react";

interface TeamStats {
    [teamName: string]: {
        back: { amount: number; bets: number };
        lay: { amount: number; bets: number };
    };
}

export default function CricketBets() {
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [teamStats, setTeamStats] = useState<TeamStats>({});

    useEffect(() => {
        const fetchData = async () => {
            const bets = await fetchUnsettledCricketBets();

            const users = new Set();
            let amount = 0;
            const stats: TeamStats = {};

            bets.forEach((bet) => {
                users.add(bet.userId);
                amount += parseFloat(bet.betAmount);

                const team = bet.selectedTeam;
                const oddType = bet.oddType;

                if (!stats[team]) {
                    stats[team] = {
                        back: { amount: 0, bets: 0 },
                        lay: { amount: 0, bets: 0 },
                    };
                }

                if (oddType === "back") {
                    stats[team].back.amount += parseFloat(bet.betAmount);
                    stats[team].back.bets += 1;
                } else if (oddType === "lay") {
                    stats[team].lay.amount += parseFloat(bet.betAmount);
                    stats[team].lay.bets += 1;
                }
            });

            setTotalUsers(users.size);
            setTotalAmount(amount);
            setTeamStats(stats);
        };

        fetchData();
    }, []);

    return (
        <div className="status__container">
            <div className="status__title">
                <h3 className="status__title-text">Cricket Bets Overview</h3>
            </div>
            <div className="status__content">
                <div className="status__item">
                    <span className="status__item-title">Total Users:</span>
                    <span >{totalUsers}</span>
                </div>
                <div className="status__item">
                    <span className="status__item-title">Total Amount:</span>
                    <span >{totalAmount}</span>
                </div>

                {Object.keys(teamStats).map((team) => (
                    <div key={team} className="team__section">
                        <h4 className="team__name">{team}</h4>
                        <div className="team__stats">
                            <div className="status__item">
                                <span className="status__item-title">Back:</span>
                                <span>
                                    Bets: {teamStats[team].back.bets}
                                </span>
                                <span>
                                    Amount: {teamStats[team].back.amount}
                                </span>
                            </div>
                            <div className="status__item">
                                <span className="status__item-title">Lay:</span>
                                <span>
                                    Bets: {teamStats[team].lay.bets}
                                </span>
                                <span>
                                    Amount: {teamStats[team].lay.amount}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}