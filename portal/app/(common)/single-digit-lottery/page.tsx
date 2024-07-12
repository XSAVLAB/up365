import AllLotteryBets from '@/components/Pages/SingleDigitLottery/AllLotteryBets';
import SingleDigitLottery from '@/components/Pages/SingleDigitLottery/SingleDigitLottery';
import ActiveLotterBets from '@/components/Shared/ActiveLotteryBets';
import HeaderMain from '@/components/Shared/HeaderMain';
import LotterResult from '@/components/Shared/LotteryResult';

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
