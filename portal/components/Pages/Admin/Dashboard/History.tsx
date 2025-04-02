import React, { useState, useEffect } from "react";
import { fetchApprovedData } from "../../../../api/firestoreAdminService";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

interface Transaction {
    id: string;
    userId: string;
    fullName: string;
    amount: string;
    status: string;
    timestamp: string;
    type: "deposit" | "withdrawal";
}

export default function History() {
    const [approvedData, setApprovedData] = useState<Transaction[]>([]);

    useEffect(() => {
        const fetchApprovedDataFromFirestore = async () => {
            try {
                const data = await fetchApprovedData();
                console.log("Fetched Approved Data:", data);
                setApprovedData(data.map(item => ({
                    ...item,
                    type: item.type as "deposit" | "withdrawal"
                })));
            } catch (error) {
                console.error("Error fetching approved data:", error);
            }
        };

        fetchApprovedDataFromFirestore();
    }, []);

    const handleDownloadExcel = () => {
        const data = approvedData.map((item) => ({
            "User Name": item.fullName,
            "User ID": item.userId,
            "Deposit": item.type === "deposit" ? item.amount : "",
            "Withdraw": item.type === "withdrawal" ? item.amount : "",
            "Status": item.status,
            "Timestamp": item.timestamp,
        }));

        const headers = ["User Name", "User ID", "Deposit", "Withdraw", "Status", "Timestamp"];

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data, { skipHeader: true });

        XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });

        const columnWidths = [
            { wch: 20 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 20 },
        ];

        worksheet["!cols"] = columnWidths;

        XLSX.utils.book_append_sheet(workbook, worksheet, "ApprovedData");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

        const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(dataBlob, "ApprovedData.xlsx");
    };

    return (
        <div className="pay_method__tabletwo">
            <div style={{ overflowX: "auto" }} className="pay_method__table-scrollbar">
                <button onClick={handleDownloadExcel} className="btn btn-primary mb-4">
                    Download Excel
                </button>
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
                        {approvedData.map((item) => (
                            <tr key={item.id}>
                                <td>{item.timestamp}</td>
                                <td>{item.fullName}</td>
                                <td>{item.type === "deposit" ? item.amount : "-"}</td>
                                <td>{item.type === "withdrawal" ? item.amount : "-"}</td>
                                <td>{item.status}</td>
                                <td>{item.userId}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
