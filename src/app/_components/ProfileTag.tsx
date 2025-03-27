import Image from "next/image";
import Link from "next/link";
import YashImg from "../../../public/yash-img.png";
export function ProfileTag() {
    return (
        <Link
            href="https://yashchauhan.dev"
            target="_blank"
            className="fixed bg-[#ff2626e1] hover:bg-[#ff2626] bottom-0 right-0 bg-base-100 py-2 px-4 z-50 cursor-pointer rounded-tl-lg border-white border-t border-l border-dashed text-sm font-semibold opacity-95 hover:bg-base-200 hover:opacity-100 hover:border-solid duration-200 group">
            <div className="flex flex-row justify-center items-center text-center gap-1 text-white">
                <div>By {" "}
                    <span className="link link-accent">
                        Yash
                    </span>
                </div>
                <div className="avatar -mt-1 -mb-1">
                    <div className="relative w-7 rounded-full">
                        <Image
                            src={YashImg}
                            alt="Yash Chauhan"
                            className="rounded-full"
                        />
                    </div>
                </div>
            </div>
        </Link>
    )
}