import DoubleDigitLottery from '@/components/Pages/DoubleDigitLottery/DoubleDigitLottery';
import ActiveLotterBets from '@/components/Shared/ActiveLotteryBets';
import AllLotteryBets from '@/components/Shared/AllLotteryBets';
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
