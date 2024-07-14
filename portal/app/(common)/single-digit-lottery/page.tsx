import ActiveLotterBets from '@/components/Pages/SingleDigitLottery/ActiveLotteryBets';
import AllLotteryBets from '@/components/Pages/SingleDigitLottery/AllLotteryBets';
import LotterResult from '@/components/Pages/SingleDigitLottery/LotteryResult';
import SingleDigitLottery from '@/components/Pages/SingleDigitLottery/SingleDigitLottery';
import HeaderMain from '@/components/Shared/HeaderMain';

export default function page() {
    return (
        <>
            <HeaderMain />
            <SingleDigitLottery />
            <LotterResult />
            <ActiveLotterBets />
            <AllLotteryBets />
        </>
    )
}
