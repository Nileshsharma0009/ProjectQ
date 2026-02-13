import qrIcon from "../../assets/icons/qr.svg";
import locationIcon from "../../assets/icons/img2.svg";
import deviceIcon from "../../assets/icons/img1.svg";

function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">

        <h2 className="text-3xl font-bold text-slate-900">
          Powerful Features for Smart Attendance Management
        </h2>

        <div className="mt-12 grid md:grid-cols-3 gap-8">

          {/* Feature 1 */}
          <div className="bg-slate-50 p-8 rounded-2xl shadow-sm">
            <div className="h-40 bg-white rounded-xl mb-6 flex items-center justify-center">
              {/* 
                  Adjust icon size here:
                  - w-16 h-16 (4rem)
                  - w-20 h-20 (5rem)
                  - w-24 h-24 (6rem)
              */}
              <img src={qrIcon} alt="QR Code Check-in" className="w-20 h-" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">
              QR Code Check-in
            </h3>
            <p className="mt-3 text-slate-600">
              Instantly mark attendance by scanning unique QR codes.
            </p>
          </div>

          {/* Feature 2 - Location Validation */}
          <div className="bg-slate-50 p-8 rounded-2xl shadow-sm">
            <div className="h-40 bg-white rounded-xl mb-6 flex items-center justify-center">
              {/* Adjust icon size here */}
              <img src={locationIcon} alt="Location Validation" className="w-45" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">
              Accurate Location Validation
            </h3>
            <p className="mt-3 text-slate-600">
              Verify student location within the geofenced campus.
            </p>
          </div>

          {/* Feature 3 - Device Login */}
          <div className="bg-slate-50 p-8 rounded-2xl shadow-sm">
            <div className="h-40 bg-white rounded-xl mb-6 flex items-center justify-center">
              {/* Adjust icon size here */}
              <img src={deviceIcon} alt="One-Device Login" className="w-30" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">
              One-Device Login
            </h3>
            <p className="mt-3 text-slate-600">
              Restrict login to a single registered device for security.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Features;
