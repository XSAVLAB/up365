// "use client";
// import { useState, useEffect } from "react";
// import "./styles.css";  // Import custom CSS

// interface Match {
//     match_id: number;
//     title: string;
//     date_start: string;
//     date_end: string;
//     odds_1: string;
//     odds_x: string;
//     odds_2: string;
//     platform: string; // e.g., "f", "BM"
// }

// export default function Home() {
//     const [matches, setMatches] = useState<Match[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         const fetchMatches = async () => {
//             try {
//                 const mid = 52428;
//                 const response = await fetch(`/api/cricket?type=matches&mid=${mid}/scorecard`);
//                 // const response = await fetch("https://rest.entitysport.com/v2/competitions/127579/matches/?token=ec471071441bb2ac538a0ff901abd249&per_page=50&&paged=1");

//                 console.log(response);
//                 if (!response.ok) {
//                     throw new Error("Failed to fetch matches");
//                 }

//                 const data = await response.json();
//                 console.log(data);

//                 // Mocking odds and platform values since API might not have them
//                 const formattedMatches = data.response.items.map((match: any) => ({
//                     match_id: match.match_id,
//                     title: match.title,
//                     date_start: new Date(match.date_start).toLocaleString(),
//                     date_end: new Date(match.date_end).toLocaleString(),
//                     odds_1: (Math.random() * (2.0 - 1.5) + 1.5).toFixed(2),
//                     odds_x: (Math.random() * (3.0 - 2.0) + 2.0).toFixed(2),
//                     odds_2: (Math.random() * (2.5 - 1.8) + 1.8).toFixed(2),
//                     scoreCard: match.scoreCard,
//                 }));


//                 setMatches(formattedMatches);
//                 console.log(formattedMatches);
//                 setLoading(false);
//             } catch (err: any) {
//                 setError(err.message);
//                 setLoading(false);
//             }
//         };

//         fetchMatches();
//     }, []);

//     if (loading) return <p>Loading matches...</p>;
//     if (error) return <p>Error: {error}</p>;

//     return (
//         <div className="container">
//             <h1 className="title">Current Matches</h1>

//             <div className="table-container">
//                 <table className="custom-table">
//                     <thead>
//                         <tr>
//                             <th>Game</th>
//                             <th>Start Time</th>
//                             <th>End Time</th>
//                             <th className="odds blue-bg">1</th>
//                             <th className="odds pink-bg">X</th>
//                             <th className="odds blue-bg">2</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {matches.map((match) => (
//                             <tr key={match.match_id}>
//                                 <td>{match.title}</td>
//                                 <td>{match.date_start}</td>
//                                 <td>{match.date_end}</td>
//                                 <td className="odds blue-bg">{match.odds_1}</td>
//                                 <td className="odds pink-bg">{match.odds_x}</td>
//                                 <td className="odds blue-bg">{match.odds_2}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }
// 222222222222222222222
"use client";
import { useState, useEffect } from "react";
import "./styles.css";  // Import custom CSS

interface Match {
    match_id: number;
    title: string;
    date_start: string;
    date_end: string;
    odds_1x: string;
    odds_xx: string;
    odds_2x: string;
    odds_1: string;
    odds_x: string;
    odds_2: string;
}

export default function TopAussieRules() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchIplMatches = async () => {
            try {
                const response = await fetch("/api/cricket?type=ipl");  // Fetch IPL matches
                if (!response.ok) {
                    throw new Error("Failed to fetch IPL matches");
                }

                const data = await response.json();

                const formattedMatches = data.response.items.map((match: any) => ({
                    match_id: match.match_id,
                    title: match.title,
                    date_start: new Date(match.date_start).toLocaleString(),
                    date_end: new Date(match.date_end).toLocaleString(),
                    odds_1x: (Math.random() * (2.0 - 1.5) + 1.5).toFixed(2),
                    odds_xx: "-",
                    odds_2x: (Math.random() * (2.5 - 1.8) + 1.8).toFixed(2),
                    odds_1: (Math.random() * (2.0 - 1.5) + 1.5).toFixed(2),
                    odds_x: "-",
                    odds_2: (Math.random() * (2.5 - 1.8) + 1.8).toFixed(2),
                }));

                setMatches(formattedMatches);
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchIplMatches();
    }, []);

    if (loading) return <p>Loading IPL matches...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="container">
            <h1 className="title">IPL Matches</h1>

            <div className="table-container">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Game</th>
                            <th className="odds" colSpan={2}>1</th>
                            <th className="odds" colSpan={2}>X</th>
                            <th className="odds" colSpan={2}>2</th>
                        </tr>
                    </thead>
                    <tbody>
                        {matches.map((match) => (
                            <tr key={match.match_id}>
                                <td>{match.title} / {match.date_start}</td>

                                {/* Grouped under "1" */}
                                <td className="odds blue-bg">{match.odds_1}</td>
                                <td className="odds blue-bg">{match.odds_2}</td>

                                {/* Grouped under "X" */}
                                <td className="odds pink-bg">{match.odds_x}</td>
                                <td className="odds pink-bg">{match.odds_x}</td>

                                {/* Grouped under "2" */}
                                <td className="odds blue-bg">{match.odds_2}</td>
                                <td className="odds blue-bg">{match.odds_2x}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        </div>
    );
}


// // pages/index.js
// import EntityFixtureWidget from '../../Shared/EntityFixtureWidget';

// const HomePage = () => (
//     <div>
//         <h1>Welcome to Our Sports Page</h1>
//         {/* Other content */}
//         <EntityFixtureWidget />
//         {/* More content */}
//     </div>
// );

// export default HomePage;
