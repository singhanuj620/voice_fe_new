"use client";
import { SparklesPreview } from "@/components/sparkles/sparkles";
import codeinter from "@/assests/codeinter.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/useSession";

const HomePage = () => {
  const { session, loading } = useSession();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;
    if (session && session.user) {
      router.push("/user/upload");
    } else {
      // Try to click the login button in the navbar
      const btn = document.getElementById(
        "login-with-google-btn"
      ) as HTMLButtonElement | null;
      if (btn) {
        btn.click();
      } else {
        // fallback: go to /login
        router.push("/login");
      }
    }
  };

  return (
    <div className="pt-16 h-screen">
      <div className="h-[50%] flex justify-center flex-col items-center gap-4 mt-[45px]">
        <div className="h-20vh w-[90vw] sm:w-[60vw] md:w-[40vw] lg:w-[30vw] -mb-4 mt-4">
          <Image
            src={codeinter}
            alt="Code Inter Logo"
            className="w-full h-auto object-cover"
          />
        </div>
        <div className="">
          <SparklesPreview />
        </div>
        <div className="-mt-36">
          <button
            type="button"
            className="p-[3px] relative cursor-pointer w-full"
            onClick={handleClick}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
            <span className="px-8 py-2 bg-black rounded-[6px] relative group transition duration-200 text-white hover:bg-transparent z-10 inline-block">
              Upload Report and Get Started
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
