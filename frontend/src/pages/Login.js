import React from "react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#dcdcdc] flex flex-col border border-black">
      
      {/* HEADER */}
      <header className="w-full flex justify-between items-center px-6 py-3 border-b border-black bg-[#d9d9d9]">
        <h1 className="text-xl font-bold tracking-wide">TRIPSHIELD</h1>
        <button className="text-lg font-semibold">SOS</button>
      </header>

      {/* BODY */}
      <div className="flex flex-1">
        
        {/* LEFT SIDE LABEL */}
        <div className="w-1/3 text-left text-3xl font-semibold p-10">
          LOGIN <br /> (Popup)
        </div>

        {/* POPUP CARD */}
        <div className="flex justify-center items-center w-2/3">
          <div className="w-[350px] bg-[#e6e6e6] border border-black rounded-md p-6 shadow-lg">
            
            {/* USERNAME + SIGN UP */}
            <div className="flex justify-between items-center mb-3">
              <label className="font-semibold text-gray-800">UserName</label>
              <button className="px-3 py-1 text-sm bg-gray-300 border border-gray-500 rounded">
                Sign Up
              </button>
            </div>

            <input
              type="text"
              className="w-full mb-4 p-2 bg-gray-300 border border-gray-500 rounded"
            />

            {/* PASSWORD */}
            <label className="font-semibold text-gray-800">Password</label>
            <input
              type="password"
              className="w-full mt-1 p-2 bg-gray-300 border border-gray-500 rounded"
            />

            <p className="text-xs text-red-500 mt-1 mb-4">Forgot password?</p>

            {/* BUTTONS */}
            <div className="flex justify-between mt-4">
              <button className="px-5 py-2 bg-gray-300 border border-gray-600 rounded">
                reset
              </button>
              <button className="px-5 py-2 bg-gray-400 border border-gray-600 rounded">
                Submit
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="w-full text-center py-3 border-t border-black text-sm">
        © Copyright
      </footer>
    </div>
  );
}
