import { BlurFade } from "@/components/magicui/blur-fade";
import MiddleComponent from "@/components/middle";
import VideoMinsCount from "@/components/totalcount";
import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
import { GithubTag } from "./_components/GithubTag";
import { ProfileTag } from "./_components/ProfileTag";
import SignOutTag from "./_components/SingOutTag";
const font = Poppins({
  subsets: ["latin"],
  weight: ["600"]
});

export default function Home() {
  return (
    <main className="flex flex-col text-center overflow-hidden">
      <div className="fixed inset-0 z-[-10] h-screen w-screen bg-white" style={{ background: 'radial-gradient(125% 125% at 50% 10%, #fff 40%, #ee335d 100%)' }}>
      </div>
      <GithubTag />
      <SignOutTag />
      <div className="overflow-y-auto flex-1 flex flex-col justify-center items-center text-center">

        <div className="container mx-auto px-6 py-10 md:px-0 md:py-0 mt-10 md:mt-9 max-w-4xl">
          <div className="flex flex-row justify-center items-center gap-2 mb-3">
            <VideoMinsCount />
          </div>
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

      <MiddleComponent />

      <div className="grid gap-8 md:gap-20 max-w-7xl mx-auto mt-3 overflow-hidden px-4 md:px-0">
        <div className="container flex flex-col items-center gap-6 md:gap-12">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
            {/* Before Section */}
            <div className="flex flex-col items-center w-full md:w-auto">
              <h2 className="text-xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Before</h2>
              <div className="relative group w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white rounded-xl overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] hover:shadow-[0_0_50px_-12px_rgba(0,0,0,0.35)] transition-all duration-300 w-full aspect-video flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10"></div>
                  <video className="w-full h-full object-contain hover:scale-105 transition-transform duration-300" autoPlay loop muted playsInline controls>
                    <source src="/hindi_reel.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>

            {/* After Section */}
            <div className="flex flex-col items-center w-full md:w-auto">
              <h2 className="text-xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">After</h2>
              <div className="relative group w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white rounded-xl overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] hover:shadow-[0_0_50px_-12px_rgba(0,0,0,0.35)] transition-all duration-300 w-full aspect-video flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10"></div>
                  <video className="w-full h-full object-contain hover:scale-105 transition-transform duration-300" autoPlay loop muted playsInline controls>
                    <source src="/output.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ProfileTag />
    </main >
  );
}
