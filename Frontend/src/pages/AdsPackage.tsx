import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function AdsPackage() {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const navigate = useNavigate();

  // Format credit card number (#### #### #### ####)
  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove all non-digits
    value = value.slice(0, 16); // Limit to 16 digits
    value = value.replace(/(.{4})/g, "$1 ").trim(); // Insert space every 4 digits
    setCardNumber(value);
  };

  // Format expiry date (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Only digits
    if (value.length >= 3) {
      value = value.slice(0, 4);
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setExpiry(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  if (!cardNumber || !expiry) {
    alert("Please fill in all fields.");
    return;
  }

  // Simulate successful payment
  localStorage.setItem("hasAds", "false");

  alert("Payment successful! Ads have been disabled.");
  navigate("/profile");
  window.location.reload(); // Refresh to immediately remove ads
};

  const handleBack = () => {
    navigate("/profile");
  };


  return (
    <div className="w-full h-screen flex justify-center items-center p-4 bg-black/50 text-[#3f3f3f] z-50">
      <div className="relative w-full max-w-4xl bg-[#f3f3f3] rounded-2xl border-4 border-[#795a3e] shadow-lg grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* LEFT: Order Summary */}
        <div className="p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#d0bfae]">
          <div>
          <div className="flex flex-row mb-4 justify-start items-center">
                      <button
            onClick={handleBack}
            className="bg-[#f3f3f3] py-3 px-3 rounded-xl items-center flex"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-xl" />
          </button>
            <h1 className="text-2xl font-bold">🪶 Ads-Free Package</h1>
          </div>
            <p className="text-sm text-gray-600 mb-6">
              Enjoy an uninterrupted experience without banner ads forever.
            </p>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Package</span>
                <span>1</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Price</span>
                <span>$2.99</span>
              </div>
            </div>

            <hr className="my-4 border-[#d0bfae]" />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>$2.99</span>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            By proceeding, you agree to our{" "}
            <span className="underline cursor-pointer">Terms of Service</span>.
          </div>
        </div>

        {/* RIGHT: Payment Form */}
        <div className="p-6 flex flex-col justify-center">
          <h2 className="text-xl font-bold mb-4 text-center md:text-left">Payment Details</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1">Cardholder Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#795a3e] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={handleCardChange}
                maxLength={19} // 16 digits + 3 spaces
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#795a3e] outline-none"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={handleExpiryChange}
                  maxLength={5}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#795a3e] outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">CVV</label>
                <input
                  type="password"
                  placeholder="123"
                  maxLength={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#795a3e] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-[#795a3e] text-white font-semibold py-2 rounded-md hover:bg-[#6a4f34] transition"
            >
              Pay $2.99
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
