
import Link from "next/link";
import "./styles.css";
import CricketMatchOdds from "./CricketMatchOdds";

const matches = [
    {
        match_id: "1",
        title: "India vs Australia",
        date_start: "12-12-2021 12:00 PM",
        teama: {
            back: 1.5,
            lay: 1.6,
        },
        teamb: {
            back: 2.5,
            lay: 2.6,
        },
    },
    {
        match_id: "2",
        title: "England vs South Africa",
        date_start: "12-12-2021 12:00 PM",
        teama: {
            back: 1.5,
            lay: 1.6,
        },
        teamb: {
            back: 2.5,
            lay: 2.6,
        },
    },
    {
        match_id: "3",
        title: "Pakistan vs New Zealand",
        date_start: "12-12-2021 12:00 PM",
        teama: {
            back: 1.5,
            lay: 1.6,
        },
        teamb: {
            back: 2.5,
            lay: 2.6,
        },
    },
    {
        match_id: "4",
        title: "India vs Australia",
        date_start: "12-12-2021 12:00 PM",
        teama: {
            back: 1.5,
            lay: 1.6,
        },
        teamb: {
            back: 2.5,
            lay: 2.6,
        },
    },
    {
        match_id: "5",
        title: "England vs South Africa",
        date_start: "12-12-2021 12:00 PM",
        teama: {
            back: 1.5,
            lay: 1.6,
        },
        teamb: {
            back: 2.5,
            lay: 2.6,
        },
    },
    {
        match_id: "6",
        title: "Pakistan vs New Zealand",
        date_start: "12-12-2021 12:00 PM",
        teama: {
            back: 1.5,
            lay: 1.6,
        },
        teamb: {
            back: 2.5,
            lay: 2.6,
        },
    }
];

export default function CricketMatches() {

    return (
        <>

            <div className="form-container">
                <div className='form-game-name'>Cricket Matches</div>

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
                                    <td>
                                        <Link style={{ color: 'black' }}
                                            href={{
                                                pathname: `/cricket/match/${match.match_id}`,
                                                query: {
                                                    title: match.title,
                                                    date_start: match.date_start,
                                                    teama_back: match.teama.back,
                                                    teama_lay: match.teama.lay,
                                                    teamb_back: match.teamb.back,
                                                    teamb_lay: match.teamb.lay
                                                }
                                            }}
                                        >
                                            <div>
                                                <strong>{match.title} </strong>
                                                {match.date_start}
                                            </div>
                                        </Link>
                                    </td>

                                    <td className="odds blue-bg">{match.teama.back}</td>
                                    <td className="odds pink-bg">{match.teama.lay}</td>

                                    <td className="odds blue-bg">-</td>
                                    <td className="odds pink-bg">-</td>

                                    <td className="odds blue-bg">{match.teamb.back}</td>
                                    <td className="odds pink-bg">{match.teamb.lay}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <CricketMatchOdds />
        </>
    );
}
