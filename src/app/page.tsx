"use client";
import { SparklesPreview } from "@/components/sparkles/sparkles";
import codeinter from "@/assests/codeinter.png";
import Image from "next/image";
import { uploadRedirect } from "@/components/ui/server-actions";

const HomePage = () => {
  return (
    <div>
      <div className="h-[50%] flex justify-center flex-col items-center gap-4">
        <div className="h-20vh w-[30vw] -mb-4 mt-4">
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
          <form action={uploadRedirect}>
            <button
              type="submit"
              className="p-[3px] relative cursor-pointer w-full"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
              <span className="px-8 py-2 bg-black rounded-[6px] relative group transition duration-200 text-white hover:bg-transparent z-10 inline-block">
                Upload Report and Get Started
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
