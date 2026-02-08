import Navbar from '@/components/layout/navbar';
import HeroSection from '@/components/sections/heroSection';
import FeaturesSection from '@/components/sections/featuresSection';
import RolesSection from '@/components/sections/rolesSection';
import CtaSection from '@/components/sections/ctaSection';
import Footer from '@/components/layout/footer';

export default function Home() {
  return (
    <div className="landing-page">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <RolesSection />
      <CtaSection />
      <Footer />
    </div>
  );
}