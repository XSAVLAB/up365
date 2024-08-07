// History.js
import React, { useState, useEffect } from 'react';
import { fetchApprovedTransactions, fetchApprovedWithdrawals } from '../../../../api/firestoreAdminService';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

interface Transaction {
    id: string;
    userId: string;
    amount: string;
    status: string;
    timestamp: string; // Add timestamp
}

interface Withdrawal {
    id: string;
    userId: string;
    amount: string;
    status: string;
    timestamp: string; // Add timestamp
}
export default function History() {
    const [approvedTransactions, setApprovedTransactions] = useState<Transaction[]>([]);
    const [approvedWithdrawals, setApprovedWithdrawals] = useState<Withdrawal[]>([]);
    useEffect(() => {
        const fetchApprovedData = async () => {
            try {
                const transactions = await fetchApprovedTransactions();
                console.log('Approved Transactions:', transactions);
                const withdrawals = await fetchApprovedWithdrawals();
                console.log('Approved Withdrawals:', withdrawals);
                setApprovedTransactions(transactions);
                setApprovedWithdrawals(withdrawals);
            } catch (error) {
                console.error('Error fetching approved data:', error);
            }
        };

        fetchApprovedData();
    }, []);

    const handleDownloadExcel = () => {
        const data = [
            ...approvedTransactions.map(transaction => ({
                'User ID': transaction.userId,
                'Deposit': transaction.amount,
                'Withdraw': '',
                'Status': transaction.status,
                'Timestamp': transaction.timestamp // Add timestamp
            })),
            ...approvedWithdrawals.map(withdrawal => ({
                'User ID': withdrawal.userId,
                'Deposit': '',
                'Withdraw': withdrawal.amount,
                'Status': withdrawal.status,
                'Timestamp': withdrawal.timestamp // Add timestamp
            }))
        ];

        const headers = [
            'User ID',
            'Deposit',
            'Withdraw',
            'Status',
            'Timestamp' // Add timestamp header
        ];

        const workbook = XLSX.utils.book_new();

        const worksheet = XLSX.utils.json_to_sheet(data, { skipHeader: true });

        XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });

        const columnWidths = [
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 20 } // Add column width for timestamp
        ];

        worksheet['!cols'] = columnWidths;

        XLSX.utils.book_append_sheet(workbook, worksheet, 'ApprovedData');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(dataBlob, 'ApprovedData.xlsx');
    };


    return (
        <div className="pay_method__tabletwo">
            <div style={{ overflowX: 'auto' }} className="pay_method__table-scrollbar">
                <button onClick={handleDownloadExcel} className="btn btn-primary mb-4">Download Excel</button>
                <table className="w-100 text-center p2-bg">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Deposit</th>
                            <th>Withdraw</th>
                            <th>Status</th>
                            <th>User ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {approvedTransactions.map((transaction) => (
                            <tr key={transaction.id}>
                                <td>{transaction.timestamp}</td>
                                <td>{transaction.amount}</td>
                                <td>-</td>
                                <td>{transaction.status}</td>
                                <td>{transaction.userId}</td>
                            </tr>
                        ))}
                        {approvedWithdrawals.map((withdrawal) => (
                            <tr key={withdrawal.id}>
                                <td>{withdrawal.timestamp}</td>
                                <td>-</td>
                                <td>{withdrawal.amount}</td>
                                <td>{withdrawal.status}</td>
                                <td>{withdrawal.userId}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
