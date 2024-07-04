import AllLotteryBets from '@/components/Pages/DoubleDigitLottery/AllLotteryBets';
import DoubleDigitLottery from '@/components/Pages/DoubleDigitLottery/DoubleDigitLottery';
import ActiveLotterBets from '@/components/Shared/ActiveLotteryBets';

import HeaderMain from '@/components/Shared/HeaderMain';
import LotterResult from '@/components/Shared/LotteryResult';

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
