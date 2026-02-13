
import scanqr from "../../assets/icons/scanning1.svg";
import marked from "../../assets/icons/marked.svg";
import generateqr from "../../assets/icons/generateqr.svg";


function HowItWorks() {
  return (
    <section id="how" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 text-center">

        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
          How It Works
        </h2>
        <p className="mt-4 text-slate-600 text-lg">
          Simple steps to get started
        </p>

        <div className="mt-16 grid md:grid-cols-3 gap-10">

          {/* Step 1 */}
          <div className="bg-white p-8 rounded-2xl transition hover:shadow-lg">

            <div className="flex justify-center mb-6">
             
                <img src={generateqr} alt="Generate QR" className="w-25" />
          
            </div>

            <h3 className="text-xl font-semibold text-slate-800">
              Teacher Generates QR
            </h3>

            <p className="mt-3 text-slate-600">
              Selects class and generates a secure, time-based unique QR code.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-8 rounded-2xl transition hover:shadow-lg">

            <div className="flex justify-center mb-6">
              
                <img src={scanqr} alt="Scan QR" className="w-25" />
              
            </div>

            <h3 className="text-xl font-semibold text-slate-800">
              Student Scans
            </h3>

            <p className="mt-3 text-slate-600">
              Students scan the QR using their registered device securely.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-8 rounded-2xl transition hover:shadow-lg">

            <div className="flex justify-center mb-6">
    
                <img src={marked} alt="Attendance Marked" className="w-25" />
              
            </div>

            <h3 className="text-xl font-semibold text-slate-800">
              Attendance Marked
            </h3>

            <p className="mt-3 text-slate-600">
              Attendance is verified with device ID and location validation.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
