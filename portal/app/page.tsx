import HeaderMain from '@/components/Shared/HeaderMain';
import CricketLive from '@/components/Pages/Cricket/CricketLive';
import TopCricket from '@/components/Pages/Cricket/TopCricket';
import UpCmingCricket from '@/components/Pages/Cricket/UpCmingCricket';
import TopSlider from '@/components/Pages/Cricket/CricketSlider';

export default function page() {
  return (
    <>
      <HeaderMain />
      <TopSlider />
      <TopCricket />
      <CricketLive />
      <UpCmingCricket />
    </>
  )
}
