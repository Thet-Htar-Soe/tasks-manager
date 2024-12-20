"use client";

import React, { useEffect, ChangeEvent, FormEvent, useState } from "react";
import { atom, useAtom } from "jotai";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

// Jotai Atoms
const nameAtom = atom("");
const emailAtom = atom("");
const passwordAtom = atom("");

const Signup = () => {
  const [name, setName] = useAtom(nameAtom);
  const [email, setEmail] = useAtom(emailAtom);
  const [password, setPassword] = useAtom(passwordAtom);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    console.log("Component mounted");
  }, []);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    email: "",
    password: "",
  });

  //types for validation errors
  interface ValidationErrors {
    name: string;
    email: string;
    password: string;
  }

  //Handle input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "name") setName(value);
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
  };

  //Validations
  const validateForm = () => {
    const errors: ValidationErrors = { name: "", email: "", password: "" };
    let isValid = true;

    if (!name.trim()) {
      errors.name = "Name is required.";
      isValid = false;
    }

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

  // Handle form submission
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
      // sign-up api
      const response = await fetch("http://localhost:4000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        setErrorMessage("Sign-up failed. Please try again.");
        return;
      }

      const data = await response.json();
      console.log("this is data", data);
      setSuccessMessage("Sign-up successful! Please check your email.");
      setName("");
      setEmail("");
      setPassword("");
      if (response.ok) {
        console.log("Navigating to login page");
        router.push("/login");
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
  if (!mounted) return null;

  return (
    <>
      <Navbar />
      <div
        className="flex h-screen items-center justify-start bg-gray-100 bg-center"
        style={{ backgroundImage: "url('/img/img-homeblack.jpg')" }}
      >
        <div className="ps-20">
          <div className="w-full max-w-lg p-10 bg-white rounded-lg shadow-md border-4 border-black">
            <h2 className="text-2xl font-extrabold text-center text-yellow-500 mb-6">Create New Account</h2>

            {successMessage && <p className="text-green-600">{successMessage}</p>}
            {errorMessage && <p className="text-red-600">{errorMessage}</p>}

            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div className="mb-6">
                <label htmlFor="name" className="block text-sm font-semibold text-yellow-500">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="mt-1 w-[350px] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {validationErrors.name && <p className="text-red-600 text-xs mt-1 ps-2">{validationErrors.name}</p>}
              </div>

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
                {loading ? "Signing Up..." : "Sign Up"}
              </button>
              <div className="text-center text-small text-yellow-500">
                <p>
                  Already Registered?
                  <span
                    className="cursor-pointer underline ps-2 text-yellow-600 hover:text-yellow-700"
                    onClick={() => router.push("/login")}
                  >
                    Login
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

export default Signup;
