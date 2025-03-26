import HeaderMain from '@/components/Shared/HeaderMain';
import TopBoxing from '@/components/Pages/Boxing/TopBoxing';
import UpCmingBoxing from '@/components/Pages/Boxing/UpCmingBoxing';
import TopCricket from '@/components/Pages/Cricket/TopCricket';

export default function page() {
    return (
        <>
            <HeaderMain />
            {/* <TopBoxing />
            <UpCmingBoxing /> */}
            <TopCricket />
        </>
    )
}