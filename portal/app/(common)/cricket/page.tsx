import HeaderMain from '@/components/Shared/HeaderMain';
import TopCricket from '@/components/Pages/Cricket/TopCricket';
import TopSlider from '@/components/Pages/Cricket/CricketSlider';
import ComingSoon from '@/components/Shared/ComingSoon';
import TopAussieRules from '@/components/Pages/AussieRules/TopAussieRules';

export default function page() {
    return (
        <>
            <HeaderMain />
            {/* <ComingSoon /> */}
            {/* <TopSlider />
            <TopCricket /> */}
            <TopAussieRules />
        </>
    )
}
