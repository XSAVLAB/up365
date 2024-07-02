'use client'
import React from 'react'
import Form from './Form'
import GameTable from './GameTable'
import BetsTable from './BetsTable'
import { FaWindowClose } from 'react-icons/fa';
import History from './History';
import useScrollToTop from '../../hooks/useScrollToTop';

function Game() {
    useScrollToTop();
    return (
        <div className=' text-white font-bold'>
            <Form />
            {/* <GameTable /> */}
            <BetsTable />
            <History />
        </div>
    )
}

export default Game;