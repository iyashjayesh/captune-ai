import { GithubIcon } from "lucide-react";
import Link from "next/link";

export function GithubTag() {
    return (
        <Link
            href="https://github.com/iyashjayesh/captune-ai"
            target="_blank"
            className="fixed bg-[#0d1117] hover:bg-[#161b22] top-0 left-0 py-3 px-6 z-50 cursor-pointer rounded-br-xl border-[#30363d] border-b border-r border-dashed text-base font-medium text-white opacity-90 hover:opacity-100 hover:border-solid duration-300 group shadow-lg hover:shadow-xl">
            <div className="flex flex-row justify-center items-center text-center gap-2">
                <GithubIcon className="w-5 h-5" />
                <span className="group-hover:text-[#58a6ff] transition-colors duration-300">Github Repository</span>
            </div>
        </Link>
    )
}