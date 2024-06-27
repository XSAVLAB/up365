"use client"
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BsWhatsapp } from 'react-icons/bs';
import { FaWindowClose } from 'react-icons/fa';

function HelpCenter() {
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const navigateToUserHome = () => {
        navigate(-1);
    }

    const handleSendMessage = () => {
        const confirmation = window.confirm(`Send the message: ${message}`);
        if (confirmation) {
            setMessage(message);
        }
        else {
            alert("You cancelled sending a message");
        }
    };

    return (
        <div className="fixed top-0 bg-black/50 left-[-1rem] right-0 bottom-0 flex justify-center items-center">
            <div className="bg-slate-200 absolute lg:w-[60%] md:w-[60%] h-[60%] w-[80%] rounded-lg">
                <div className="flex-col w-[100%] h-[100%] p-8">
                    <div className="flex flex-row justify-center mb-4 mt-4 text-green-700 text-2xl md:text-4xl w-auto font-bold">
                        <BsWhatsapp size={30} style={{ color: '#15803d' }} /> <span className="p-1"> </span> WhatsApp Chat
                    </div>
                    <div className="w-full justify-center flex-col">
                        <div>
                            <input
                                type="text"
                                className='m-auto my-4  shadow-lg ml-4 shadow-slate-900  bg-slate-100 text-black text-center rounded-lg h-10  w-[90%] font-bold'
                                placeholder=". . . . . . Type your message . . . . ."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>
                        <div>
                            <a href={`https://api.whatsapp.com/send?phone=919730219716&text=${message}`} rel="noreferrer" target='_blank'>
                                <button onClick={handleSendMessage} className='m-auto my-4 hover:bg-green-500 shadow-lg ml-4 text-xl shadow-slate-900 border-2  bg-slate-900 text-slate-100 rounded-lg h-10  w-[30%] lg:w-[15%] md:w-[20%] font-bold'>
                                    Send
                                </button>
                            </a>
                        </div>
                    </div>
                </div>
                <button onClick={navigateToUserHome} className="absolute text-red-500 top-2 right-4 z-10 ">
                    <FaWindowClose size={30} className='shadow-lg shadow-red-500' />
                </button>
            </div>
        </div>
    )
}

export default HelpCenter;