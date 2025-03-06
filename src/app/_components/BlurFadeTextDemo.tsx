import { BlurFade } from "@/components/magicui/blur-fade";
import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";

const font = Poppins({
    subsets: ["latin"],
    weight: ["600"]
});

const descriptionFont = Poppins({
    subsets: ["latin"],
    weight: ["400"]
});


export function BlurFadeTextDemo() {
    return (
        <section id="header">
            <BlurFade delay={0.25} inView>
                {/* <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"> */}
                <h2 className={cn("text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none", font.className)}>
                    Hello World 👋
                </h2>
            </BlurFade>
            <BlurFade delay={0.25 * 2} inView>
                {/* <span className="text-pretty text-xl tracking-tighter sm:text-3xl xl:text-4xl/none"> */}
                <span className={cn("text-pretty text-xl tracking-tighter sm:text-3xl xl:text-4xl/none", descriptionFont.className)}>
                    Nice to meet you
                </span>
            </BlurFade>
        </section>
    );
}
