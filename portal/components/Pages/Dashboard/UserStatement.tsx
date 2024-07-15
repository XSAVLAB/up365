import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { fetchUserStatement } from '../../../api/firestoreService';

interface Transaction {
    id: string;
    userId: string;
    amount: number;
    status: string;
    timestamp: any; // Change this to Date if your timestamp is a Date object
    type: string;
    rewardAmount?: number;
}

interface UserStatementProps {
    userId: string;
}

export default function UserStatement({ userId }: UserStatementProps) {
    const [balanceHistory, setBalanceHistory] = useState<Transaction[]>([]);

    useEffect(() => {
        const fetchApprovedData = async () => {
            try {
                const history = await fetchUserStatement(userId);
                setBalanceHistory(history);
            } catch (error) {
                console.error('Error fetching balance history:', error);
            }
        };

        fetchApprovedData();
    }, [userId]);

    const handleDownloadExcel = () => {
        const data = balanceHistory.map(entry => ({
            // 'User ID': entry.userId,
            'Timestamp': entry.timestamp.seconds ? new Date(entry.timestamp.seconds * 1000).toLocaleString() : entry.timestamp,
            'Deposit': entry.type === 'Deposit' ? entry.amount : '',
            'Withdraw': entry.type === 'Withdrawal' ? entry.amount : '',
            'Bet': entry.type === 'Bet' ? entry.amount : '',
            'Game Bet': entry.type === 'Game Bet' ? entry.amount : '',
            'Reward': (entry.type === 'Bet' || entry.type === 'Game Bet') ? entry.rewardAmount : '',
            // 'Status': entry.status,
        }));

        const headers = [
            // 'User ID',
            'Timestamp',
            'Deposit',
            'Withdraw',
            'Sports Bet Debit',
            'Game Bet Debit',
            'Rewards',
            // 'Status',
        ];

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data, { skipHeader: true });
        XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });

        const columnWidths = [
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 20 }
        ];
        worksheet['!cols'] = columnWidths;

        XLSX.utils.book_append_sheet(workbook, worksheet, 'BalanceHistory');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(dataBlob, 'BalanceHistory.xlsx');
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["Timestamp", "Deposit", "Withdraw", "Sports Bet Debit", "Game Bet Debit", "Rewards"];
        const tableRows: (string | number | undefined)[][] = [];

        balanceHistory.forEach(entry => {
            const entryData = [
                // entry.userId,
                entry.timestamp.seconds ? new Date(entry.timestamp.seconds * 1000).toLocaleString() : entry.timestamp,
                entry.type === 'Deposit' ? entry.amount : '',
                entry.type === 'Withdrawal' ? entry.amount : '',
                entry.type === 'Bet' ? entry.amount : '',
                entry.type === 'Game Bet' ? entry.amount : '',
                (entry.type === 'Bet' || entry.type === 'Game Bet') ? entry.rewardAmount : '',
                // entry.status,
            ];
            tableRows.push(entryData);
        });

        (doc as any).autoTable(tableColumn, tableRows, { startY: 20 });
        doc.text("Balance History", 14, 15);
        doc.save(`BalanceHistory_${userId}.pdf`);
    };

    return (
        <div className="pay_method__tabletwo">
            <div style={{ overflowX: 'auto' }} className="pay_method__table-scrollbar">
                <button onClick={handleDownloadExcel} className="btn btn-primary mb-4">Download Excel</button>
                <button onClick={handleDownloadPDF} className="btn btn-primary mb-4">Download PDF</button>
                <table className="w-100 text-center p2-bg">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Deposit</th>
                            <th>Withdraw</th>
                            <th>Sports Bet Debit</th>
                            <th>Game Bet Debit</th>
                            <th>Rewards</th>
                            {/* <th>Status</th>
                            <th>User ID</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {balanceHistory.map((entry) => (
                            <tr key={entry.id}>
                                <td>{entry.timestamp.seconds ? new Date(entry.timestamp.seconds * 1000).toLocaleString() : entry.timestamp}</td>
                                <td>{entry.type === 'Deposit' ? entry.amount : '-'}</td>
                                <td>{entry.type === 'Withdrawal' ? entry.amount : '-'}</td>
                                <td>{entry.type === 'Bet' ? entry.amount : '-'}</td>
                                <td>{entry.type === 'Game Bet' ? entry.amount : '-'}</td>
                                <td>{entry.rewardAmount ? entry.rewardAmount : '-'}</td>
                                {/* <td>{entry.status}</td>
                                <td>{entry.userId}</td> */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
