import React, { useState, useEffect } from 'react';
import { fetchApprovedTransactions, fetchApprovedWithdrawals } from '../../../../api/firestoreAdminService';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

interface Transaction {
    id: string;
    userId: string;
    fullName: string;  
    amount: string;
    status: string;
    timestamp: string;
}

interface Withdrawal {
    id: string;
    userId: string;
    fullName: string; 
    amount: string;
    status: string;
    timestamp: string;
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
                'User Name': transaction.fullName,
                'User ID': transaction.userId,
                'Deposit': transaction.amount,
                'Withdraw': '',
                'Status': transaction.status,
                'Timestamp': transaction.timestamp
            })),
            ...approvedWithdrawals.map(withdrawal => ({
                'User Name': withdrawal.fullName,
                'User ID': withdrawal.userId,
                'Deposit': '',
                'Withdraw': withdrawal.amount,
                'Status': withdrawal.status,
                'Timestamp': withdrawal.timestamp
            }))
        ];

        const headers = [
            'User Name',
            'User ID',
            'Deposit',
            'Withdraw',
            'Status',
            'Timestamp'
        ];

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data, { skipHeader: true });

        XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });

        const columnWidths = [
            { wch: 20 },  // User Name
            { wch: 15 },  // User ID
            { wch: 15 },  // Deposit
            { wch: 15 },  // Withdraw
            { wch: 15 },  // Status
            { wch: 20 }   // Timestamp
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
                            <th>User Name</th>
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
                                <td>{transaction.fullName}</td>
                                <td>{transaction.amount}</td>
                                <td>-</td>
                                <td>{transaction.status}</td>
                                <td>{transaction.userId}</td>
                            </tr>
                        ))}
                        {approvedWithdrawals.map((withdrawal) => (
                            <tr key={withdrawal.id}>
                                <td>{withdrawal.timestamp}</td>
                                <td>{withdrawal.fullName}</td>
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
