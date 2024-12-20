"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { getUserIdAtom } from "@/app/atoms/userIdAtom";
import axios from "axios";

const Navbar = () => {
  const [userId, setUserId] = useAtom(getUserIdAtom);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      //logout API
      const response = await axios.post("http://localhost:4000/logout");

      if (response.status === 200) {
        setUserId(null);
        localStorage.removeItem("userId");
        router.push("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  return (
    <nav className={`px-20 top-0 left-0 w-full  z-50 py-5 ${userId ? "bg-black" : "fixed bg-transparent"}`}>
      <div className="sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Image src="/img/img-resize.jpg" alt="Logo" width={200} height={60} className="object-contain" />
          </div>
          <div>
            <ul className="flex space-x-8">
              {!userId && (
                <>
                  <li>
                    <a href="/signup" className="hover:text-yellow-700 text-yellow-500">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-yellow-700 text-yellow-500">
                      Features
                    </a>
                  </li>
                </>
              )}
              {userId && (
                <li>
                  <button onClick={handleLogout} className="hover:text-yellow-700 text-yellow-500">
                    Logout
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
