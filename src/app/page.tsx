import { BlurFade } from "@/components/magicui/blur-fade";
import Iphone15Pro from "@/components/magicui/iphone-15-pro";
import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
import Image from "next/image";
import backimg from "./back.png";
const font = Poppins({
  subsets: ["latin"],
  weight: ["600"]
});

export default function Home() {
  return (
    <main className="flex flex-col text-center overflow-hidden">
      <div className="fixed inset-0 z-[-10] h-screen w-screen bg-white" style={{ background: 'radial-gradient(125% 125% at 50% 10%, #fff 40%, #ee335d 100%)' }}>
      </div>
      <div className="overflow-y-auto flex-1 flex flex-col justify-center items-center text-center">
        <div className="container mx-auto px-6 py-10 md:px-0 md:py-0 mt-14 md:mt-12 max-w-4xl">
          <h1 className={cn("text-3xl md:text-6xl font-semibold text-slate-800 drop-shadow-md mt-6", font.className)}>
            <BlurFade delay={0.25} inView>
              Create
              <span className="relative inline-block mx-2">
                <div className="absolute right-0 top-[2px] bg-[#ee335d] w-full h-full rotate-[1.73deg] rounded-[10px] z-[1] px-3"></div>
                <span className="relative text-white z-[2] px-3">
                  Video Transcription
                </span>
              </span>
            </BlurFade>
            <BlurFade delay={0.25 * 2} inView>
              in
              <span className="relative inline-block mx-2">
                <div className="absolute right-0 top-[2px] bg-[#ee335d] w-full h-full rotate-[1.73deg] rounded-[10px] z-[1] px-3"></div>
                <span className="relative text-white z-[2] px-3">
                  Seconds
                </span>
              </span>
              using AI
            </BlurFade>
          </h1>
        </div>
      </div>

      <div className="grid gap-x-6 grid-cols-3 justify-center max-w-6xl mx-auto overflow-hidden my-24">
        <div className="flex justify-center">
          <Iphone15Pro
            className="w-full md:max-w-[250px] h-full md:max-h-[500px]"
            src="https://via.placeholder.com/430x880"
          />
        </div>
        <div className="flex justify-center items-center h-full">
          <Image
            src={backimg}
            alt="back-img"
            width={190}
            height={190}
          />
        </div>
        <div className="flex justify-center">
          <Iphone15Pro
            className="w-full md:max-w-[250px] h-full md:max-h-[500px]"
            src="https://via.placeholder.com/430x880"
          />
        </div>
      </div>

    </main>
  );
}
