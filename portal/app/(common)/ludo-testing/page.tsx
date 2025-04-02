'use client';
import BoardLayout from '@/components/Pages/LudoTesting/BoardLayout';
import { store } from '@/redux/store';
import { Provider } from "react-redux";

const Game = () => {
    return (
        <Provider store={store}>
            <main className="flex justify-center items-center sm:scale-100 scale-50 w-full h-full">
                <BoardLayout />
            </main>
        </Provider >
    );
};

export default Game;