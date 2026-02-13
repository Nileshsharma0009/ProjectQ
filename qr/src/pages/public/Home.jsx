import { useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Hero from "../../components/home/Hero";
import Features from "../../components/home/Features";
import HowItWorks from "../../components/home/HowItWorks";
import Footer from "../../components/layout/Footer";
import AuthModal from "../../components/auth/AuthModal";

function Home() {
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    return (
        <>
            <Navbar onOpenAuth={() => { console.log("Home: Opening Auth"); setIsAuthOpen(true); }} />
            <div className="pt-16">
                <Hero onOpenAuth={() => { console.log("Home: Opening Auth from Hero"); setIsAuthOpen(true); }} />
                <Features />
                <HowItWorks />
                <Footer />
            </div>
            <AuthModal isOpen={isAuthOpen} setIsOpen={setIsAuthOpen} />
        </>
    );
}

export default Home;
