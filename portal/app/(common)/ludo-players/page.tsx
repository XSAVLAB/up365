'use client';
import CustomizePlayers from '@/components/Pages/LudoTesting/CustomizePlayers';
import { store } from '@/redux/store';
import { Provider } from "react-redux";

const CustomizePage = () => {
    return (
        <Provider store={store}>
            <div className="lg:h-screen overflow-y-auto flex flex-col justify-center items-center">
                <h1 className="lg:mt-auto my-12 py-4 px-4 text-6xl font-bold font-serif mb-8 text-slate-900 text-center">
                    Pick your Nick
                </h1>
                <CustomizePlayers />
            </div>
        </Provider>
    );
};

export default CustomizePage;