"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { IconCricket } from "@tabler/icons-react";
import { fetchCricketMatches } from "../../../api/firestoreService";
import BettingModal from "../../Shared/BettingModal";

export default function CricketSlider() {
    const [matches, setMatches] = useState<any[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const getMatchData = async () => {
            try {
                const matchData = await fetchCricketMatches();
                const sortedMatches = sortMatches(matchData);
                setMatches(sortedMatches);
            } catch (error) {
                console.error('Error fetching cricket matches: ', error);
            }
        };

        getMatchData();

        const interval = setInterval(() => {
            setMatches((prevMatches) => sortMatches(prevMatches));
        }, 600000);

        return () => clearInterval(interval);
    }, []);

    const sortMatches = (matches: any[]) => {
        const now = new Date().getTime();
        return matches.sort((a: any, b: any) => {
            const dateA = new Date(a.dateTimeGMT).getTime();
            const dateB = new Date(b.dateTimeGMT).getTime();
            if (dateA > now && dateB > now) {
                return dateA - dateB;
            } else if (dateA < now && dateB < now) {
                return dateB - dateA;
            } else if (dateA > now) {
                return -1;
            } else {
                return 1;
            }
        });
    };

    const handleMatchClick = (seriesName: any, dateTime: any, team1: any, team2: any, team1Img: any, team2Img: any) => {
        const match = {
            matchType: "cricket",
            seriesName,
            dateTime,
            team1,
            team2,
            team1Img,
            team2Img
        };
        setSelectedMatch(match);
        setIsModalOpen(true);
    };

    return (
        <>
            <section className="hero_area pb-5">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12 gx-0 gx-sm-4">
                            <div className="hero_area__main">
                                <div className="row w-100">
                                    <div className="col-12">
                                        <div className="live-playing">
                                            <div className="hero_area__topslider swiper-wrapper">
                                                <Swiper
                                                    className="slider_hero"
                                                    loop
                                                    speed={5000}
                                                    autoplay={{
                                                        delay: 0,
                                                        disableOnInteraction: false,
                                                        pauseOnMouseEnter: true,

                                                    }}
                                                    slidesPerView="auto"
                                                    modules={[Autoplay]}
                                                    breakpoints={{
                                                        0: {
                                                            slidesPerView: 1,
                                                        },
                                                        480: {
                                                            slidesPerView: 1.5,
                                                            spaceBetween: 20,
                                                        },
                                                        575: {
                                                            slidesPerView: 2,
                                                            spaceBetween: 20,
                                                        },
                                                        991: {
                                                            slidesPerView: 2,
                                                            spaceBetween: 20,
                                                        },
                                                        1499: {
                                                            slidesPerView: 3,
                                                            spaceBetween: 24,
                                                        },
                                                        1799: {
                                                            slidesPerView: 3.5,
                                                            spaceBetween: 24,
                                                        },
                                                    }}>
                                                    {matches && matches.map((match: any) => (
                                                        <SwiperSlide key={match.id}>
                                                            <div className="hero_area__topslider-card swiper-slide p-4 p-md-6" onClick={() => handleMatchClick(match.series, match.dateTimeGMT, match.t1, match.t2, match.t1img, match.t2img)}>
                                                                <div className="hero_area__topslider-cardtop d-flex align-items-center justify-content-between mb-4 mb-md-6">
                                                                    <div className="d-flex align-items-center gap-2">
                                                                        <IconCricket className="n5-color" />
                                                                        <span className="fs-seven n5-color cpoint">
                                                                            {match.series}
                                                                        </span>
                                                                    </div>{" "}
                                                                    <span className="fs-seven n5-color cpoint">
                                                                        {new Date(match.dateTimeGMT).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                                <div className="hero_area__topslider-cardbody d-flex align-items-center justify-content-between mb-4 mb-md-6">
                                                                    <div className="hero_area__topslider-flag">
                                                                        <div className="hero_area__topslider-flagbox mb-2">
                                                                            <Image
                                                                                width={40}
                                                                                height={40}
                                                                                src={match.t1img}
                                                                                alt="icon"
                                                                            />
                                                                        </div>
                                                                        <h6 className="cpoint">{match.t1}</h6>
                                                                    </div>
                                                                    <div className="hero_area__topslider-vs">
                                                                        <span className="fw-bold n5-color">VS</span>
                                                                    </div>
                                                                    <div className="hero_area__topslider-flag text-end d-flex flex-column justify-content-end align-items-end ">
                                                                        <div className="hero_area__topslider-flagbox mb-2">
                                                                            <Image
                                                                                width={40}
                                                                                height={40}
                                                                                src={match.t2img}
                                                                                alt="icon"
                                                                            />
                                                                        </div>
                                                                        <h6 className="cpoint">{match.t2}</h6>
                                                                    </div>
                                                                </div>
                                                                <div className="hero_area__topslider-cardfooter d-flex align-items-center justify-content-between gap-4">
                                                                    <div className="hero_area__topslider-cfitem d-flex align-items-center gap-4 py-2 justify-content-center w-100 p2-bg cpoint">
                                                                        <span className="fs-eight n5-color">1</span>
                                                                        <span className="fw-bold fs-eight">1.87</span>
                                                                    </div>
                                                                    <div className="hero_area__topslider-cfitem d-flex align-items-center gap-4 py-2 justify-content-center w-100 p2-bg cpoint">
                                                                        <span className="fs-eight n5-color">X</span>
                                                                        <span className="fw-bold fs-eight">1.87</span>
                                                                    </div>
                                                                    <div className="hero_area__topslider-cfitem d-flex align-items-center gap-4 py-2 justify-content-center w-100 p2-bg cpoint">
                                                                        <span className="fs-eight n5-color">2</span>
                                                                        <span className="fw-bold fs-eight">1.87</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </SwiperSlide>
                                                    ))}
                                                </Swiper>
                                            </div>
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
