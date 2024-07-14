import ActiveLotterBets from '@/components/Pages/DoubleDigitLottery/ActiveLotteryBets';
import AllLotteryBets from '@/components/Pages/DoubleDigitLottery/AllLotteryBets';
import DoubleDigitLottery from '@/components/Pages/DoubleDigitLottery/DoubleDigitLottery';
import LotterResult from '@/components/Pages/DoubleDigitLottery/LotteryResult';

import HeaderMain from '@/components/Shared/HeaderMain';

export default function page() {
    return (
        <>
            <HeaderMain />
            <DoubleDigitLottery />
            <LotterResult />
            <ActiveLotterBets />
            <AllLotteryBets />
        </>
    )
}
