import Navbar from "../components/navbar";
import Hero from "../components/hero";
import Features from "../components/features";
import HowItWorks from "../components/howitworks";
import Cta from "../components/cta";
import Footer from "../components/footer";

function Home() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}

export default Home;
