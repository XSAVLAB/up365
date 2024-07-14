import ActiveLotterBets from '@/components/Pages/TripleDigitLottery/ActiveLotteryBets';
import AllLotteryBets from '@/components/Pages/TripleDigitLottery/AllLotteryBets';
import LotterResult from '@/components/Pages/TripleDigitLottery/LotteryResult';
import TripleDigitLottery from '@/components/Pages/TripleDigitLottery/TripleDigitLottery';
import HeaderMain from '@/components/Shared/HeaderMain';

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
