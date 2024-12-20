"use client";

import React, { ChangeEvent, FormEvent, useState } from "react";
import { atom, useAtom } from "jotai";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { getUserIdAtom } from "../atoms/userIdAtom";

// Jotai Atoms
const emailAtom = atom("");
const passwordAtom = atom("");

const Login = () => {
  const [email, setEmail] = useAtom(emailAtom);
  const [password, setPassword] = useAtom(passwordAtom);
  const [userId, setUserId] = useAtom(getUserIdAtom);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: "",
  });

  // Define the type for validation errors
  interface ValidationErrors {
    email: string;
    password: string;
  }

  // Handle input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
  };

  // Validate inputs
  const validateForm = () => {
    const errors: ValidationErrors = { email: "", password: "" };
    let isValid = true;

    if (!email.trim()) {
      errors.email = "Email is required.";
      isValid = false;
    }

    if (!password.trim()) {
      errors.password = "Password is required.";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  // Handle form submit
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // login API
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setErrorMessage("Login failed. Please try again.");
        return;
      }

      const data = await response.json();
      setSuccessMessage("Login successful!");
      setEmail("");
      setPassword("");
      if (response.ok) {
        setUserId(data.userId);
        console.log("this is userid", userId);
        localStorage.setItem("userId", data.userId);
        router.push("/taskboard");
      }
    } catch (err) {
      const errMsg = "Can not create chat completion";

      if (err instanceof Error) {
        throw new Error(errMsg, err);
      }

      throw new Error(errMsg, { cause: err });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div
        className="flex h-screen items-center justify-start bg-black bg-center"
        style={{ backgroundImage: "url('/img/img-homeblack.jpg')" }}
      >
        <div className="ps-20">
          <div className="w-full max-w-lg p-10 bg-white rounded-lg shadow-md border-4 border-black">
            <h2 className="text-2xl font-extrabold text-center text-yellow-500 mb-6">Login</h2>

            {successMessage && <p className="text-green-600">{successMessage}</p>}
            {errorMessage && <p className="text-red-600">{errorMessage}</p>}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-semibold text-yellow-500">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="mt-1 w-[350px] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {validationErrors.email && <p className="text-red-600 text-xs mt-1 ps-2">{validationErrors.email}</p>}
              </div>

              {/* Password */}
              <div className="mb-8">
                <label htmlFor="password" className="block text-sm font-semibold text-yellow-500">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="mt-1 w-[350px] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {validationErrors.password && (
                  <p className="text-red-600 text-xs mt-1 ps-2">{validationErrors.password}</p>
                )}
              </div>

              {/* Submission */}
              <button
                type="submit"
                className={`w-full mb-2 px-4 py-2 font-bold text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Logging In..." : "Login"}
              </button>
              <div className="text-center text-small text-yellow-500">
                <p>
                  Create New Account?
                  <span
                    className="cursor-pointer underline ps-2 text-yellow-600 hover:text-yellow-700"
                    onClick={() => router.push("/signup")}
                  >
                    Sign Up
                  </span>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
