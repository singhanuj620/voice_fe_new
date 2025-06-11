/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import Image from "next/image";
import {
  loginWithGoogle,
  uploadRedirect,
} from "@/components/ui/server-actions";
import { useState } from "react";

interface NavbarProps {
  session: any;
  signOutAction: () => Promise<void>;
}

const Navbar: React.FC<NavbarProps> = ({ session, signOutAction }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="w-full flex items-center justify-between px-4 md:px-8 py-2 h-16 bg-black bg-opacity-80 shadow-md fixed top-0 left-0 z-40">
      <div className="text-xl font-bold text-indigo-400 tracking-wide">
        <Link href="/">EchoBrief</Link>
      </div>
      {/* Hamburger for mobile */}
      <button
        className="md:hidden text-indigo-300 focus:outline-none"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      {/* Desktop menu */}
      <div className="hidden md:flex gap-8 text-white text-lg items-center">
        {session && (
          <>
            <form action={uploadRedirect}>
              <button
                type="submit"
                className="hover:text-indigo-300 transition-colors bg-transparent border-none p-0 m-0 cursor-pointer text-sm"
                style={{ background: "none", border: "none" }}
              >
                Upload File
              </button>
            </form>
            <form action={uploadRedirect}>
              <button
                type="submit"
                name="chat"
                value="true"
                className="hover:text-indigo-300 transition-colors bg-transparent border-none p-0 m-0 cursor-pointer text-sm"
                style={{ background: "none", border: "none" }}
              >
                Chat
              </button>
            </form>
          </>
        )}
        <div className="ml-8 flex items-center gap-4">
          {session && session.user?.name && (
            <span className="text-indigo-200 font-medium text-sm">
              Hello, {session.user.name}!{" "}
            </span>
          )}
          {session ? (
            <form action={signOutAction}>
              <button
                type="submit"
                className="cursor-pointer px-4 py-2 rounded border-2 border-indigo-400 text-indigo-400 bg-transparent hover:bg-indigo-500 hover:text-white transition-colors flex items-center gap-2 text-sm"
              >
                Sign Out
              </button>
            </form>
          ) : (
            <form action={loginWithGoogle}>
              <button
                id="login-with-google-btn"
                type="submit"
                className="px-4 py-2 rounded bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-80 flex items-center gap-2 text-sm"
              >
                <Image src="/google.svg" alt="Google" width={20} height={20} />
                Login with Google
              </button>
            </form>
          )}
        </div>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-black bg-opacity-95 flex flex-col gap-4 py-4 px-4 md:hidden shadow-lg z-50">
          {session && (
            <>
              <form action={uploadRedirect} onSubmit={() => setMenuOpen(false)}>
                <button
                  type="submit"
                  className="hover:text-indigo-300 transition-colors bg-transparent border-none p-0 m-0 cursor-pointer text-base text-white text-left w-full"
                  style={{ background: "none", border: "none" }}
                >
                  Upload File
                </button>
              </form>
              <form action={uploadRedirect} onSubmit={() => setMenuOpen(false)}>
                <button
                  type="submit"
                  name="chat"
                  value="true"
                  className="hover:text-indigo-300 transition-colors bg-transparent border-none p-0 m-0 cursor-pointer text-base text-white text-left w-full"
                  style={{ background: "none", border: "none" }}
                >
                  Chat
                </button>
              </form>
            </>
          )}
          <div className="flex flex-col gap-2">
            {session && session.user?.name && (
              <span className="text-indigo-200 font-medium">
                Hello, {session.user.name}!{" "}
              </span>
            )}
            {session ? (
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="cursor-pointer px-4 py-2 rounded border-2 border-indigo-400 text-indigo-400 bg-transparent hover:bg-indigo-500 hover:text-white transition-colors flex items-center gap-2 text-base w-full"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Out
                </button>
              </form>
            ) : (
              <form action={loginWithGoogle}>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-80 flex items-center gap-2 text-base w-full"
                  onClick={() => setMenuOpen(false)}
                >
                  <Image
                    src="/google.svg"
                    alt="Google"
                    width={20}
                    height={20}
                  />
                  Login with Google
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
