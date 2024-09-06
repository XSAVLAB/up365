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
                const dayDeposit = await fetchTotalAmount("transactions", "day");
                const monthDeposit = await fetchTotalAmount("transactions", "month");
                const yearDeposit = await fetchTotalAmount("transactions", "year");

                const dayWithdrawal = await fetchTotalAmount("withdrawals", "day");
                const monthWithdrawal = await fetchTotalAmount("withdrawals", "month");
                const yearWithdrawal = await fetchTotalAmount("withdrawals", "year");

                setTotalDayDeposit(dayDeposit);
                setTotalMonthDeposit(monthDeposit);
                setTotalYearDeposit(yearDeposit);

                setTotalDayWithdrawal(dayWithdrawal);
                setTotalMonthWithdrawal(monthWithdrawal);
                setTotalYearWithdrawal(yearWithdrawal);

                const uniqueActiveUsers = new Set();

                const activeSingle = await fetchActiveUsersInGame("Single Digit Lottery");
                const activeDouble = await fetchActiveUsersInGame("Double Digit Lottery");
                const activeTriple = await fetchActiveUsersInGame("Triple Digit Lottery");
                const activeColorBall = await fetchActiveUsersInGame("Color Ball Game");

                setActiveUsersSingle(activeSingle.size);
                setActiveUsersDouble(activeDouble.size);
                setActiveUsersTriple(activeTriple.size);
                setActiveUsersColorBall(activeColorBall.size);

                activeSingle.forEach(userID => uniqueActiveUsers.add(userID));
                activeDouble.forEach(userID => uniqueActiveUsers.add(userID));
                activeTriple.forEach(userID => uniqueActiveUsers.add(userID));
                activeColorBall.forEach(userID => uniqueActiveUsers.add(userID));

                setTotalActiveUsers(uniqueActiveUsers.size);

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchAmountsAndUsers();
    }, []);

    return (
        <div className="status__container">
            <div className="status__title">
                <h3 className="status__title-text">Status Overview</h3>
            </div>
            <div className="status__content">
                <div className="status__item">
                    <span className="status__item-title">Day Deposits:</span>
                    <span className="status__item-value">{totalDayDeposit}</span>
                    <span className="status__item-title">Month Deposits:</span>
                    <span className="status__item-value">{totalMonthDeposit}</span>
                    <span className="status__item-title">Year Deposits:</span>
                    <span className="status__item-value">{totalYearDeposit}</span>
                </div>
                <div className="status__item">
                    <span className="status__item-title">Day Withdrawals:</span>
                    <span className="status__item-value">{totalDayWithdrawal}</span>
                    <span className="status__item-title">Month Withdrawals:</span>
                    <span className="status__item-value">{totalMonthWithdrawal}</span>
                    <span className="status__item-title">Year Withdrawals:</span>
                    <span className="status__item-value">{totalYearWithdrawal}</span>
                </div>


                <div className="status__item">
                    <span className="status__item-title">Total Active Users:</span>
                    <span className="status__item-value">{totalActiveUsers}</span>
                </div>

                <span className="status__item-title">Active Users per Game:</span>
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
