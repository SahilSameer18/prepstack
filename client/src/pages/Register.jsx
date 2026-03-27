import React, { useState } from "react";
import { Link } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Register:", formData);
    // Add register logic here
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] relative overflow-hidden px-4">
      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[380px] text-center bg-[#1a1a1a]/70 border border-[#2a2a2a] rounded-2xl px-8 py-10 backdrop-blur-lg shadow-xl"
      >
        <h1 className="text-white text-3xl font-semibold tracking-wide">Sign Up</h1>

        <p className="text-gray-400 text-sm mt-2 mb-6">
          Create your account
        </p>

        {/* Name field */}
        <div className="flex items-center mt-6 w-full bg-[#0f0f0f] border border-[#2a2a2a] focus-within:border-[#ffa116] h-12 rounded-full px-4 gap-3 transition">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="w-full bg-transparent text-white placeholder-gray-400 outline-none"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Email */}
        <div className="flex items-center mt-4 w-full bg-[#0f0f0f] border border-[#2a2a2a] focus-within:border-[#ffa116] h-12 rounded-full px-4 gap-3 transition">
          <input
            type="email"
            name="email"
            placeholder="Email address"
            className="w-full bg-transparent text-white placeholder-gray-400 outline-none"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Password */}
        <div className="flex items-center mt-4 w-full bg-[#0f0f0f] border border-[#2a2a2a] focus-within:border-[#ffa116] h-12 rounded-full px-4 gap-3 transition">
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full bg-transparent text-white placeholder-gray-400 outline-none"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="mt-6 w-full h-11 rounded-full text-black bg-[#ffa116] hover:bg-[#ffb84d] font-medium transition"
        >
          Create Account
        </button>

        {/* Switch mode */}
        <p className="text-gray-400 text-sm mt-4">
          Already have an account?
          <Link to="/login" className="text-[#ffa116] hover:underline ml-1">
            Click here
          </Link>
        </p>
      </form>

      {/* Background glow */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute left-1/2 top-20 -translate-x-1/2 w-[260px] h-[140px] bg-[#ffa116]/20 rounded-full blur-3xl" />
        <div className="absolute right-10 bottom-10 w-[120px] h-[80px] bg-[#ffa116]/20 rounded-full blur-2xl" />
      </div>
    </div>
  );
};

export default Register;
