"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleLogin = async () => {
        // 👉 Replace with real API later
        if (email && password) {
            console.log("Logging in:", email);

            // Simulate login success
            router.push("/dashboard");
        } else {
            alert("Please enter email and password");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">

            <div className="bg-white p-8 rounded-xl shadow-md w-[350px]">

                <h2 className="text-2xl font-bold mb-6 text-center">
                    Login
                </h2>

                {/* Email */}
                <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full p-2 border rounded mb-4"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                {/* Password */}
                <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full p-2 border rounded mb-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {/* Button */}
                <button
                    onClick={handleLogin}
                    className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
                >
                    Sign In
                </button>

                {/* Extra */}
                <p className="text-sm mt-4 text-center">
                    Don’t have an account?{" "}
                    <Link href="/signup">
                        <span className="text-blue-500 cursor-pointer">
                            Sign Up
                        </span>
                    </Link>
                </p>

            </div>

        </div>
    );
}