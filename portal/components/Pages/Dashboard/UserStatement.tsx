import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { fetchUserStatement } from '../../../api/firestoreService';

interface Transaction {
    id: string;
    userId: string;
    amount: number;
    status: string;
    timestamp: string;
    type: string;
    rewardAmount?: number;
    balance: number;
}

interface UserStatementProps {
    userId: string;
}

export default function UserStatement({ userId }: UserStatementProps) {
    const [balanceHistory, setBalanceHistory] = useState<Transaction[]>([]);
    const [filteredData, setFilteredData] = useState<Transaction[]>([]);
    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);
    const [tempFromDate, setTempFromDate] = useState<Date | null>(new Date());
    const [tempToDate, setTempToDate] = useState<Date | null>(new Date());

    // Helper function to parse string timestamp into Date object
    const parseDateString = (dateString: string): Date => {
        // Expected format: "dd/MM/yyyy, HH:mm:ss AM/PM"
        const [datePart, timePart] = dateString.split(', ');
        const [day, month, year] = datePart.split('/');
        const date = new Date(`${year}-${month}-${day} ${timePart}`);
        return date;
    };

    useEffect(() => {
        const fetchApprovedData = async () => {
            try {
                const history = await fetchUserStatement(userId);
                setBalanceHistory(history);
                setFilteredData(history);
            } catch (error) {
                console.error('Error fetching balance history:', error);
            }
        };

        fetchApprovedData();
    }, [userId]);

    useEffect(() => {
        if (fromDate && toDate) {
            const filtered = balanceHistory.filter(entry => {
                const timestamp = parseDateString(entry.timestamp);
                return timestamp >= fromDate && timestamp <= toDate;
            });
            setFilteredData(filtered);
        } else {
            setFilteredData(balanceHistory);
        }
    }, [fromDate, toDate, balanceHistory]);

    const handleApply = () => {
        setFromDate(tempFromDate);
        setToDate(tempToDate);
    };

    const handleCancel = () => {
        setTempFromDate(fromDate);
        setTempToDate(toDate);
    };

    const handleDownloadExcel = () => {
        // Map the data, ensuring all rows are properly filled even if some fields are empty
        const data = filteredData.map(entry => ({
            'Timestamp': entry.timestamp || '',  // Ensure this field is not undefined or null
            'Deposit': entry.type === 'Deposit' ? entry.amount : '',
            'Withdraw': entry.type === 'Withdrawal' ? entry.amount : '',
            'Bet': entry.type === 'Bet' ? entry.amount : '',
            'Game Bet': entry.type === 'Game Bet' ? entry.amount : '',
            'Reward': (entry.type === 'Bet' || entry.type === 'Game Bet') ? entry.rewardAmount : '',
            'Balance': entry.balance || ''       // Ensure this field is not undefined or null
        }));

        const headers = [
            'Timestamp',
            'Deposit',
            'Withdraw',
            'Sports Bet Debit',
            'Game Bet Debit',
            'Rewards',
            'Balance',
        ];

        // Create a new workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);  // No skipHeader here

        // Add headers manually after generating the sheet
        XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });

        // Set column widths for better display in Excel
        const columnWidths = [
            { wch: 20 },  // Adjust this for timestamp
            { wch: 15 },
            { wch: 15 },
            { wch: 20 },
            { wch: 20 },
            { wch: 15 },
            { wch: 15 }
        ];
        worksheet['!cols'] = columnWidths;

        // Append the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'BalanceHistory');

        // Write the workbook to a buffer and save it as an Excel file
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(dataBlob, 'BalanceHistory.xlsx');
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["Timestamp", "Deposit", "Withdraw", "Sports Bet Debit", "Game Bet Debit", "Rewards", "Balance"];
        const tableRows: (string | number | undefined)[][] = [];

        filteredData.forEach(entry => {
            const entryData = [
                entry.timestamp,
                entry.type === 'Deposit' ? entry.amount : '',
                entry.type === 'Withdrawal' ? entry.amount : '',
                entry.type === 'Bet' ? entry.amount : '',
                entry.type === 'Game Bet' ? entry.amount : '',
                (entry.type === 'Bet' || entry.type === 'Game Bet') ? entry.rewardAmount : '',
                entry.balance
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
                <div className="mb-4">
                    <label>
                        From:
                        <DatePicker
                            selected={tempFromDate}
                            onChange={(date: Date | null) => setTempFromDate(date)}
                            dateFormat="dd/MM/yyyy"
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                        />
                    </label>
                    <label>
                        To:
                        <DatePicker
                            selected={tempToDate}
                            onChange={(date: Date | null) => setTempToDate(date)}
                            dateFormat="dd/MM/yyyy"
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                        />
                    </label>
                    <button onClick={handleApply} className="btn btn-primary ml-2">Apply</button>
                    <button onClick={handleCancel} className="btn btn-secondary ml-2">Cancel</button>
                </div>
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
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((entry) => (
                            <tr key={entry.id}>
                                <td>{entry.timestamp}</td>
                                <td>{entry.type === 'Deposit' ? entry.amount : '-'}</td>
                                <td>{entry.type === 'Withdrawal' ? entry.amount : '-'}</td>
                                <td>{entry.type === 'Bet' ? entry.amount : '-'}</td>
                                <td>{entry.type === 'Game Bet' ? entry.amount : '-'}</td>
                                <td>{entry.rewardAmount ? entry.rewardAmount : '-'}</td>
                                <td>{entry.balance}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
