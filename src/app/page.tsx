
import { BlurFade } from "@/components/magicui/blur-fade";
import SignIn from "@/components/sign-in";
import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
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

      <div className="container mx-auto px-6 py-10 md:px-0 md:py-0 mt-14 md:mt-12 max-w-4xl">
        <SignIn />
      </div>

      <div className="grid gap-20 md:gap-40 max-w-6xl mx-auto mt-20 md:mt-12 overflow-hidden">
        <div className="container flex flex-col items-center gap-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-52">
            {/* Before Section */}
            <div className="flex flex-col items-center">
              <h2 className="text-3xl font-semibold text-gray-800 mb-4">Before</h2>
              <div className="border-2 border-dashed border-gray-400 rounded-xl overflow-hidden shadow-lg w-[300px] h-[500px] flex items-center justify-center bg-gray-100">
                <video className="w-full h-full object-contain p-3" autoPlay loop muted playsInline controls>
                  <source src="/reel.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            {/* After Section */}
            <div className="flex flex-col items-center">
              <h2 className="text-3xl font-semibold text-gray-800 mb-4">After</h2>
              <div className="border-2 border-dashed border-gray-400 rounded-xl overflow-hidden shadow-lg w-[300px] h-[500px] flex items-center justify-center bg-gray-100">
                <video className="w-full h-full object-contain p-3" autoPlay loop muted playsInline controls>
                  <source src="/reel.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
