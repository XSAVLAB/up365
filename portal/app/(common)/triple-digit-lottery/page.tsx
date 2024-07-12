import AllLotteryBets from '@/components/Pages/TripleDigitLottery/AllLotteryBets';
import TripleDigitLottery from '@/components/Pages/TripleDigitLottery/TripleDigitLottery';
import ActiveLotterBets from '@/components/Shared/ActiveLotteryBets';
import HeaderMain from '@/components/Shared/HeaderMain';
import LotterResult from '@/components/Shared/LotteryResult';

export default function page() {
    return (
        <>
            <HeaderMain />
            <TripleDigitLottery />
            <LotterResult />
            <ActiveLotterBets />
            <AllLotteryBets />
        </>
    )
}
