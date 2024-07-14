import ActiveLotterBets from '@/components/Pages/ColorBallGame/ActiveLotteryBets';
import AllLotteryBets from '@/components/Pages/ColorBallGame/AllLotteryBets';
import ColorBallGame from '@/components/Pages/ColorBallGame/ColorBallGame';
import LotterResult from '@/components/Pages/ColorBallGame/LotteryResult';
import HeaderMain from '@/components/Shared/HeaderMain';

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
