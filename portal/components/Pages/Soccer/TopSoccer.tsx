'use client'
import Image from "next/image";
import { fetchFootballMatches } from "@/api/firestoreService";
import { useEffect, useState } from "react";
import BettingModal from "../../Shared/BettingModal";

export default function TopSoccer() {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const getMatchData = async () => {
      try {
        const matchData = await fetchFootballMatches();
        // console.log("Football match data:");
        // console.log(matchData);
        setMatches(matchData);
      } catch (error) {
        console.error("Error fetching data! " + error);
      }
    };

    getMatchData();
  }, []);

  const handleMatchClick = (team1: any, team2: any, team1Img: any, team2Img: any, seriesName: any, dateTime: any) => {

    const match = {
      matchType: "soccer",
      seriesName,
      dateTime,
      team1,
      team2,
      team1Img,
      team2Img,
    };
    setSelectedMatch(match);
    setIsModalOpen(true);
  };

  return (
    <>
      <section className="top_matches">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 gx-0 gx-sm-4">
              <div className="top_matches__main pt-20">
                <div className="row w-100 pt-md-5">
                  <div className="col-12">
                    <div className="top_matches__title d-flex align-items-center gap-2 mb-4 mb-md-5">
                      <Image src="/images/icon/king.png" width={32} height={32} alt="Icon" />
                      <h3>Top Soccer</h3>
                    </div>

                    <div className="top_matches__content">
                      {matches.map(
                        ({
                          id, area, awayTeam, competition, group, homeTeam, lastUpdated, matchday, referees, score, season, status, utcDate,
                        }) => (
                          <div
                            className="top_matches__cmncard p2-bg p-4 rounded-3 mb-4"
                            key={id}
                            onClick={() => handleMatchClick(homeTeam.name, awayTeam.name, homeTeam.crest, awayTeam.crest, competition.name, utcDate)}
                          >
                            <div className="row gx-0 gy-xl-0 gy-7">
                              <div className="col-xl-5 col-xxl-4">
                                <div className="top_matches__clubname">
                                  <div className="top_matches__cmncard-right d-flex align-items-start justify-content-between pb-4 mb-4 gap-4 ">
                                    <div className="d-flex align-items-center gap-1">
                                      <Image src={competition.emblem} width={16} height={16} alt="Icon" />{" "}
                                      <span className="fs-eight cpoint">
                                        {competition.name}
                                      </span>
                                    </div>
                                    <div className="d-flex align-items-center gap-4 pe-xl-15 flex-nowrap flex-xl-wrap">
                                      <span className="fs-eight cpoint">
                                        {new Date(utcDate).toLocaleString()}
                                      </span>
                                      <div className="d-flex align-items-center gap-1">
                                        <Image
                                          src={"/images/icon/updwon.png"}
                                          width={16}
                                          height={16}
                                          alt="Icon"
                                        />
                                        <Image
                                          src={"/images/icon/t-shart.png"}
                                          width={16}
                                          height={16}
                                          alt="Icon"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="top_matches__cmncard-left d-flex align-items-center justify-content-between pe-xl-10">
                                    <div>
                                      <div className="d-flex align-items-center gap-2 mb-4">
                                        <Image
                                          src={homeTeam.crest}
                                          width={24}
                                          height={24}
                                          alt="Icon"
                                        />{" "}
                                        <span className="fs-seven cpoint">
                                          {homeTeam.name}
                                        </span>
                                      </div>
                                      <div className="d-flex align-items-center gap-2">
                                        <Image
                                          src={awayTeam.crest}
                                          width={24}
                                          height={24}
                                          alt="Icon"
                                        />{" "}
                                        <span className="fs-seven cpoint">
                                          {awayTeam.name}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-4 position-relative pe-xl-15">
                                      <div className="d-flex align-items-center flex-column gap-1">
                                        <span className="top_matches__cmncard-countcercle  rounded-17 fs-seven">
                                          {score.fullTime.home}:{score.fullTime.away}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-4 position-relative pe-xl-15">
                                      <span className="v-line lg d-none d-xl-block"></span>
                                      <div className="d-flex flex-column gap-5">
                                        <Image
                                          className="cpoint"
                                          src={"/images/icon/line-chart.png"}
                                          width={16}
                                          height={16}
                                          alt="Icon"
                                        />
                                        <Image
                                          className="cpoint"
                                          src={"/images/icon/star2.png"}
                                          width={16}
                                          height={16}
                                          alt="Icon"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="col-xl-7 col-xxl-8">
                                <div className="top_matches__clubdata">
                                  <div className="table-responsive">
                                    <table className="table mb-0 pb-0">
                                      <thead>
                                        <tr className="text-center">
                                          <th scope="col">
                                            <span className="fs-eight">
                                              1x2
                                            </span>
                                          </th>
                                          <th scope="col">
                                            <span className="fs-eight">
                                              Double chance
                                            </span>
                                          </th>
                                          <th scope="col">
                                            <span className="fs-eight">
                                              Total
                                            </span>
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr>
                                          <td className="pt-4">
                                            <div className="top_matches__innercount d-flex align-items-center gap-2 ">
                                              <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                                                <span className="fs-seven d-block mb-2">
                                                  draw
                                                </span>
                                                <span className="fw-bold d-block">
                                                  2.7
                                                </span>
                                              </div>
                                              <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                                                <span className="fs-seven d-block mb-2">
                                                  draw
                                                </span>
                                                <span className="fw-bold d-block">
                                                  2.5
                                                </span>
                                              </div>
                                              <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                                                <span className="fs-seven d-block mb-2">
                                                  draw
                                                </span>
                                                <span className="fw-bold d-block">
                                                  1.1
                                                </span>
                                              </div>
                                            </div>
                                          </td>
                                          <td className="pt-4">
                                            <div className="top_matches__innercount d-flex align-items-center gap-2 ">
                                              <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                                                <span className="fs-seven d-block mb-2">
                                                  draw
                                                </span>
                                                <span className="fw-bold d-block">
                                                  1.7
                                                </span>
                                              </div>
                                              <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                                                <span className="fs-seven d-block mb-2">
                                                  draw
                                                </span>
                                                <span className="fw-bold d-block">
                                                  3.6
                                                </span>
                                              </div>
                                              <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                                                <span className="fs-seven d-block mb-2">
                                                  draw
                                                </span>
                                                <span className="fw-bold d-block">
                                                  4.4
                                                </span>
                                              </div>
                                            </div>
                                          </td>
                                          <td className="pt-4">
                                            <div className="top_matches__innercount d-flex align-items-center gap-2 ">
                                              <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                                                <span className="fs-seven d-block mb-2">
                                                  draw
                                                </span>
                                                <span className="fw-bold d-block">
                                                  3.3
                                                </span>
                                              </div>
                                              <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                                                <span className="fs-seven d-block mb-2">
                                                  draw
                                                </span>
                                                <span className="fw-bold d-block">
                                                  2.5
                                                </span>
                                              </div>
                                              <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                                                <span className="fs-seven d-block mb-2">
                                                  draw
                                                </span>
                                                <span className="fw-bold d-block">
                                                  1.5
                                                </span>
                                              </div>
                                            </div>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {selectedMatch && (
        <BettingModal
          match={selectedMatch}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      )}
    </>
  );
}
