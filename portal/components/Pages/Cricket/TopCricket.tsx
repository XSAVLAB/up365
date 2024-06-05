'use client'
import Image from "next/image";
import { useState, useEffect } from "react";

export default function TopCricket() {

  // Fetching Cricket Data
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    const fetchCricketMatches = async () => {
      try {
        const response = await fetch('https://api.cricapi.com/v1/cricScore?apikey=30003ac7-c7ef-4828-bcce-4a461e26902d');
        console.log(response)
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Cricket Matches:', data);
        setMatches(data.data);
      } catch (error) {
        console.error('Error fetching cricket matches: ', error);
      }
    };

    fetchCricketMatches();
  }, []);

  return (
    <section className="top_matches">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 gx-0 gx-sm-4">
            <div className="top_matches__main pt-20">
              <div className="row w-100 pt-md-5">
                <div className="col-12">
                  <div className="top_matches__title d-flex align-items-center gap-2 mb-4 mb-md-5">
                    <Image src="/images/icon/king.png" width={32}
                      height={32} alt="Icon" />
                    <h3>Top Cricket</h3>
                  </div>
                  <div className="top_matches__content">
                    {matches && matches.map((match: any) => (

                      <div className="top_matches__cmncard p2-bg p-4 rounded-3 mb-4">
                        <div className="row gx-0 gy-xl-0 gy-7">
                          <div className="col-xl-5 col-xxl-4">
                            <div className="top_matches__clubname">
                              <div className="top_matches__cmncard-right d-flex align-items-start justify-content-between pb-4 mb-4 gap-4 ">
                                <div className="d-flex align-items-center gap-1">
                                  {/* <Image
                                    src={match.cricket} width={16} height={16}
                                    alt="Icon"
                                  />{" "} */}
                                  <span className="fs-eight cpoint">
                                    {match.series}
                                  </span>
                                </div>
                                <div className="d-flex align-items-center gap-2 pe-xl-19 flex-nowrap flex-xl-wrap">
                                  {/* <Image
                                    src="/images/icon/live.png" width={16} height={16}
                                    alt="icon"
                                  /> */}
                                  <span className="fs-eight cpoint">
                                    {match.dateTimeGMT}
                                  </span>
                                  {/* <Image
                                    src="/images/icon/updwon.png" width={16} height={16}
                                    alt="icon"
                                  /> */}
                                </div>
                              </div>
                              <div className="top_matches__cmncard-left d-flex align-items-center justify-content-between pe-xl-10">
                                <div>
                                  <div className="d-flex align-items-center gap-2 mb-4">
                                    <Image
                                      src={match.t1img} width={16} height={16}
                                      alt="Icon"
                                    />{" "}
                                    <span className="fs-seven cpoint">
                                      {match.t1}
                                    </span>
                                  </div>
                                  <div className="d-flex align-items-center gap-2">
                                    <Image
                                      src={match.t2img} width={16} height={16}
                                      alt="Icon"
                                    />{" "}
                                    <span className="fs-seven cpoint">
                                      {match.t2}
                                    </span>
                                  </div>
                                </div>
                                <div className="d-flex align-items-center gap-4 position-relative pe-xl-15">
                                  <div className="d-flex flex-column gap-1">
                                    <span className="top_matches__cmncard-countcercle  rounded-17 fs-seven">
                                      {match.t1s}
                                    </span>
                                    <span className="top_matches__cmncard-countcercle  rounded-17 fs-seven text-center">
                                      {match.t2s}
                                    </span>
                                  </div>
                                  <span className="v-line lg d-none d-xl-block"></span>
                                  <div className="d-flex flex-column gap-5">
                                    {/* <Image
                                      className="cpoint"
                                      src="/images/icon/line-chart.png" width={16} height={16}
                                      alt="Icon"
                                    /> */}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-xl-7 col-xxl-8 d-xl-flex">
                            <div className="top_matches__clubdata top_matches__clubdatatwo">
                              <div className="table-responsive">
                                <table className="table mb-0 pb-0">
                                  <thead>
                                    <tr className="text-center">
                                      <th scope="col">
                                        <span className="fs-eight">
                                          Draw no bet
                                        </span>
                                      </th>
                                      <th scope="col">
                                        <span className="fs-eight">
                                          First innings
                                        </span>
                                      </th>
                                      <th scope="col">
                                        <span className="fs-eight">
                                          First over 96
                                        </span>
                                      </th>
                                    </tr>
                                  </thead>

                                  <tbody>
                                    <tr>
                                      <td className="pt-4">
                                        <div className="top_matches__innercount d-flex align-items-center gap-2 ">
                                          <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                                            <span className="fs-seven text-center d-block mb-2">
                                              1
                                            </span>
                                            <span className="fw-bold d-block">
                                              1.5
                                            </span>
                                          </div>
                                          <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                                            <span className="fs-seven text-center d-block mb-2">
                                              2
                                            </span>
                                            <span className="fw-bold d-block">
                                              3.8
                                            </span>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="pt-4">
                                        <div className="top_matches__innercount d-flex align-items-center gap-2 ">
                                          <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                                            <span className="fs-seven text-center d-block mb-2">
                                              1
                                            </span>
                                            <span className="fw-bold d-block">
                                              1.39
                                            </span>
                                          </div>
                                          <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                                            <span className="fs-seven text-center d-block mb-2">
                                              2
                                            </span>
                                            <span className="fw-bold d-block">
                                              2.85
                                            </span>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="pt-4">
                                        <div className="top_matches__innercount d-flex align-items-center gap-2 ">
                                          <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                                            <span className="fs-seven text-center d-block mb-2">
                                              1
                                            </span>
                                            <span className="fw-bold d-block">
                                              3.45
                                            </span>
                                          </div>
                                          <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                                            <span className="fs-seven text-center d-block mb-2">
                                              2
                                            </span>
                                            <span className="fw-bold d-block">
                                              1.39
                                            </span>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            <hr className=" w-100 mt-8 d-none d-xl-block n4-color" />
                          </div>
                        </div>
                      </div>

                    ))}

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
