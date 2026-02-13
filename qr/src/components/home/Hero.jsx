import testerGif from '../../assets/icons/qr-code-scan.svg';

function Hero() {
    return (
        <section className="bg-slate-50 py-20">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

                {/* Left Content */}
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                        QR-based Attendance System for Easy & Accurate Check-ins
                    </h1>

                    <p className="mt-6 text-slate-600 text-lg">
                        Simplify attendance tracking with secure QR codes and real-time reports.
                    </p>

                    <div className="mt-8 flex gap-4">
                        <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition">
                            Get Started
                        </button>

                        <button className="border border-slate-300 px-6 py-3 rounded-xl text-slate-700">
                            Watch Demo
                        </button>
                    </div>
                </div>

                {/* Right Image Placeholder */}
                <div className="flex items-center justify-center">
       

                    <img
                        src={testerGif}
                        alt="Attendance Animation"
                        className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-6 items-cente"
                    />
                </div>
            </div>
        </section>
    );
}

export default Hero;
