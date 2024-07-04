import SingleDigitLottery from '@/components/Pages/SingleDigitLottery/SingleDigitLottery';
import ActiveLotterBets from '@/components/Shared/ActiveLotteryBets';
import AllLotteryBets from '@/components/Shared/AllLotteryBets';
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
