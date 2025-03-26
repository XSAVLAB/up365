"use client";
import HeaderMain from '@/components/Shared/LogRegHeader';
import { useSearchParams, useParams } from 'next/navigation';

export default function CricketMatchOdds() {
    const params = useParams();
    const searchParams = useSearchParams();

    const matchId = params.match_odds;
    const title = searchParams.get('title');
    const date_start = searchParams.get('date_start');
    const teama_back = searchParams.get('teama_back');
    const teama_lay = searchParams.get('teama_lay');
    const teamb_back = searchParams.get('teamb_back');
    const teamb_lay = searchParams.get('teamb_lay');

    return (
        <>
            <HeaderMain />
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
                            <tr >
                                <td>

                                    <div>
                                        <strong>{title} </strong>
                                        {date_start}
                                    </div>
                                </td>

                                <td className="odds blue-bg">{teama_back}</td>
                                <td className="odds pink-bg">{teama_lay}</td>

                                <td className="odds blue-bg">-</td>
                                <td className="odds pink-bg">-</td>

                                <td className="odds blue-bg">{teamb_back}</td>
                                <td className="odds pink-bg">{teamb_lay}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>

    );
}
