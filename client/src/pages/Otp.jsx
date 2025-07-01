import { BsFillShieldLockFill, BsTelephoneFill } from "react-icons/bs";
import { CgSpinner } from "react-icons/cg";
import OtpInput from "otp-input-react";
import { useState, useCallback } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { auth } from "./firebase.config";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { toast, Toaster } from "react-hot-toast";

/**
 * OTP Authentication Component
 *
 * Provides phone number verification using Firebase Authentication.
 * Uses a two-step process:
 * 1. Phone number input and SMS code sending
 * 2. OTP verification
 */
const OTP = () => {
  // State management
  const [otp, setOtp] = useState(""); // Stores the OTP input by user
  const [phoneNumber, setPhoneNumber] = useState(""); // Stores the phone number
  const [loading, setLoading] = useState(false); // Tracks loading state during API calls
  const [showOTP, setShowOTP] = useState(false); // Controls which form to display
  const [user, setUser] = useState(null); // Stores authenticated user data

  /**
   * Sets up the reCAPTCHA verifier if not already initialized
   * Required by Firebase for phone authentication
   */
  const setupRecaptchaVerifier = useCallback(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {
            // Callback intentionally left empty as we handle the flow manually
          },
          "expired-callback": () => {
            toast.error("reCAPTCHA has expired. Please refresh the page.");
          },
        },
        auth
      );
    }
  }, []);

  /**
   * Initiates the phone number verification process
   * Sends an OTP to the provided phone number
   */
  const handleSendOTP = useCallback(async () => {
    // Validate phone number input
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setLoading(true);

    try {
      // Setup reCAPTCHA verification
      setupRecaptchaVerifier();
      const appVerifier = window.recaptchaVerifier;

      // Format phone number with + prefix for international format
      const formattedPhoneNumber = "+" + phoneNumber;

      // Request SMS verification code from Firebase
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhoneNumber,
        appVerifier
      );

      // Store confirmation result for later verification
      window.confirmationResult = confirmationResult;

      // Update UI state to show OTP input form
      setShowOTP(true);
      toast.success("OTP sent successfully!");
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error(error?.message || "Failed to send OTP. Please try again.");

      // Reset reCAPTCHA on failure
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  }, [phoneNumber, setupRecaptchaVerifier]);

  /**
   * Verifies the OTP entered by the user
   * Completes the authentication process if OTP is correct
   */
  const handleVerifyOTP = useCallback(async () => {
    // Validate OTP input
    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      // Verify the OTP with Firebase
      const result = await window.confirmationResult.confirm(otp);

      // Store authenticated user data
      setUser(result.user);
      toast.success("Phone number verified successfully!");
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error(error?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [otp]);

  return (
    <section className="bg-emerald-500 flex items-center justify-center h-screen">
      <div>
        {/* Toast notifications container */}
        <Toaster toastOptions={{ duration: 4000 }} />

        {/* Hidden reCAPTCHA container */}
        <div id="recaptcha-container"></div>

        {/* Conditional rendering based on authentication state */}
        {user ? (
          // Success state after verification
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h2 className="text-emerald-600 font-medium text-2xl mb-4">
              🎉 Đăng nhập thành công
            </h2>
            <p className="text-gray-700">
              Bạn đã xác thực số điện thoại thành công
            </p>
            <p className="text-gray-500 mt-2">Số điện thoại: {phoneNumber}</p>
          </div>
        ) : (
          // Auth flow container
          <div className="w-80 flex flex-col gap-4 rounded-lg p-4 bg-white/10 backdrop-blur-sm shadow-lg">
            <h1 className="text-center leading-normal text-white font-medium text-3xl mb-6">
              Chào mừng đến với <br /> Đặt lịch khám bệnh
            </h1>

            {showOTP ? (
              // OTP verification form
              <>
                <div className="bg-white text-emerald-500 w-fit mx-auto p-4 rounded-full shadow-md">
                  <BsFillShieldLockFill size={30} aria-hidden="true" />
                </div>

                <label
                  htmlFor="otp"
                  className="font-bold text-xl text-white text-center"
                >
                  Điền mã OTP
                </label>

                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  OTPLength={6}
                  otpType="number"
                  disabled={loading}
                  autoFocus
                  className="opt-container"
                  inputClassName="mx-1 text-xl p-2 rounded-md text-center w-12 h-12 bg-white border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                  aria-label="Enter 6-digit OTP"
                />

                <button
                  onClick={handleVerifyOTP}
                  className="bg-emerald-600 hover:bg-emerald-700 transition-colors w-full flex gap-1 items-center justify-center py-2.5 text-white rounded disabled:opacity-70"
                  disabled={loading || otp.length !== 6}
                  aria-label="Verify OTP"
                >
                  {loading && (
                    <CgSpinner
                      size={20}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  <span>Xác thực OTP</span>
                </button>

                {/* Option to go back and change phone number */}
                <button
                  onClick={() => {
                    setShowOTP(false);
                    setOtp("");
                  }}
                  className="text-white text-sm hover:underline"
                  aria-label="Change phone number"
                >
                  Đổi số điện thoại
                </button>
              </>
            ) : (
              // Phone number input form
              <>
                <div className="bg-white text-emerald-500 w-fit mx-auto p-4 rounded-full shadow-md">
                  <BsTelephoneFill size={30} aria-hidden="true" />
                </div>

                <label
                  htmlFor="phone"
                  className="font-bold text-xl text-white text-center"
                >
                  Xác thực số điện thoại
                </label>

                <PhoneInput
                  country={"in"}
                  value={phoneNumber}
                  onChange={setPhoneNumber}
                  inputProps={{
                    id: "phone",
                    name: "phone",
                    required: true,
                    "aria-label": "Phone number",
                  }}
                  containerClass="mx-auto"
                  inputClass="!w-full p-2.5"
                  disabled={loading}
                />

                <button
                  onClick={handleSendOTP}
                  className="bg-emerald-600 hover:bg-emerald-700 transition-colors w-full flex gap-1 items-center justify-center py-2.5 text-white rounded disabled:opacity-70"
                  disabled={loading || phoneNumber.length < 10}
                  aria-label="Send verification code"
                >
                  {loading && (
                    <CgSpinner
                      size={20}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  <span>Gửi code qua SMS</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default OTP;
