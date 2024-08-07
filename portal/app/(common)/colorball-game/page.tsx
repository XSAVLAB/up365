import AllLotteryBets from '@/components/Pages/ColorBallGame/AllLotteryBets';
import ColorBallGame from '@/components/Pages/ColorBallGame/ColorBallGame';
import ActiveLotterBets from '@/components/Shared/ActiveLotteryBets';
import HeaderMain from '@/components/Shared/HeaderMain';
import LotterResult from '@/components/Shared/LotteryResult';

export default function page() {
    return (
        <>
            <HeaderMain />
            <ColorBallGame />
            <LotterResult />
            <ActiveLotterBets />
            <AllLotteryBets />
        </>
    )
}
