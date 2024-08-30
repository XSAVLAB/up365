import React, { useEffect, useState } from "react";
import { fetchTotalAmount, fetchActiveUsersInGame } from "../../../../api/firestoreAdminService";

export default function Status() {
    const [totalDayDeposit, setTotalDayDeposit] = useState(0);
    const [totalMonthDeposit, setTotalMonthDeposit] = useState(0);
    const [totalYearDeposit, setTotalYearDeposit] = useState(0);
    const [totalDayWithdrawal, setTotalDayWithdrawal] = useState(0);
    const [totalMonthWithdrawal, setTotalMonthWithdrawal] = useState(0);
    const [totalYearWithdrawal, setTotalYearWithdrawal] = useState(0);
    const [totalActiveUsers, setTotalActiveUsers] = useState(0);
    const [activeUsersSingle, setActiveUsersSingle] = useState(0);
    const [activeUsersDouble, setActiveUsersDouble] = useState(0);
    const [activeUsersTriple, setActiveUsersTriple] = useState(0);
    const [activeUsersColorBall, setActiveUsersColorBall] = useState(0);

    useEffect(() => {
        const fetchAmountsAndUsers = async () => {
            try {
                // Fetch deposit amounts
                const dayDeposit = await fetchTotalAmount("transactions", "day");
                const monthDeposit = await fetchTotalAmount("transactions", "month");
                const yearDeposit = await fetchTotalAmount("transactions", "year");

                // Fetch withdrawal amounts
                const dayWithdrawal = await fetchTotalAmount("withdrawals", "day");
                const monthWithdrawal = await fetchTotalAmount("withdrawals", "month");
                const yearWithdrawal = await fetchTotalAmount("withdrawals", "year");

                setTotalDayDeposit(dayDeposit);
                setTotalMonthDeposit(monthDeposit);
                setTotalYearDeposit(yearDeposit);

                setTotalDayWithdrawal(dayWithdrawal);
                setTotalMonthWithdrawal(monthWithdrawal);
                setTotalYearWithdrawal(yearWithdrawal);

                // Create a Set to collect unique user IDs across all games
                const uniqueActiveUsers = new Set();

                // Fetch active users for each game type
                const activeSingle = await fetchActiveUsersInGame("Single Digit Lottery");
                const activeDouble = await fetchActiveUsersInGame("Double Digit Lottery");
                const activeTriple = await fetchActiveUsersInGame("Triple Digit Lottery");
                const activeColorBall = await fetchActiveUsersInGame("Color Ball Game");

                // Update state for individual game active users
                setActiveUsersSingle(activeSingle.size);
                setActiveUsersDouble(activeDouble.size);
                setActiveUsersTriple(activeTriple.size);
                setActiveUsersColorBall(activeColorBall.size);

                // Add users from each game to the uniqueActiveUsers set
                activeSingle.forEach(userID => uniqueActiveUsers.add(userID));
                activeDouble.forEach(userID => uniqueActiveUsers.add(userID));
                activeTriple.forEach(userID => uniqueActiveUsers.add(userID));
                activeColorBall.forEach(userID => uniqueActiveUsers.add(userID));

                // Set total active users as the size of the uniqueActiveUsers set
                setTotalActiveUsers(uniqueActiveUsers.size);

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchAmountsAndUsers();
    }, []);

    return (
        <div className="status__container p-4 p-lg-6 p2-bg rounded-8">
            <div className="status__title mb-5 mb-md-6">
                <h3 className="status__title-text">Status Overview</h3>
            </div>
            <div className="status__content">
                <span className="status__item-title">Total Deposits: </span>
                <div className="status__item">
                    <span className="status__item-title">Day: </span>
                    <span className="status__item-value">{totalDayDeposit}</span>
                    <span className="status__item-title">Month: </span>
                    <span className="status__item-value">{totalMonthDeposit}</span>
                    <span className="status__item-title">Year: </span>
                    <span className="status__item-value">{totalYearDeposit}</span>
                </div>

                <span className="status__item-title">Total Withdrawals: </span>
                <div className="status__item">
                    <span className="status__item-title">Day:</span>
                    <span className="status__item-value">{totalDayWithdrawal}</span>
                    <span className="status__item-title">Month: </span>
                    <span className="status__item-value">{totalMonthWithdrawal}</span>
                    <span className="status__item-title">Year: </span>
                    <span className="status__item-value">{totalYearWithdrawal}</span>
                </div>

                <div className="status__item">
                    <span className="status__item-title">Total Active Users:</span>
                    <span className="status__item-value">{totalActiveUsers}</span>
                </div>
                {/* Display active users per game type */}
                <span className="status__item-title">Active Users in Individual Games:</span>
                <div className="status__item">
                    <span className="status__item-title">Single Digit Lottery:</span>
                    <span className="status__item-value">{activeUsersSingle}</span>
                </div>
                <div className="status__item">
                    <span className="status__item-title">Double Digit Lottery:</span>
                    <span className="status__item-value">{activeUsersDouble}</span>
                </div>
                <div className="status__item">
                    <span className="status__item-title">Triple Digit Lottery:</span>
                    <span className="status__item-value">{activeUsersTriple}</span>
                </div>
                <div className="status__item">
                    <span className="status__item-title">Color Ball Game:</span>
                    <span className="status__item-value">{activeUsersColorBall}</span>
                </div>
            </div>
        </div>
    );
}
