import Link from "next/link";
// import { signOutAction } from "@/actions/actions";
import { signOut } from "@/auth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";

export function SignOutTag() {
    return (
        <Link
            href="https://www.linkedin.com/in/iyashjayesh/"
            target="_blank"
            className="fixed bg-[#ff2626e1] hover:bg-[#ff2626] top-0 right-0 bg-base-100 py-2 px-4 z-50 cursor-pointer rounded-bl-lg border-white border-b border-l border-dashed text-sm font-semibold opacity-95 hover:bg-base-200 hover:opacity-100 hover:border-solid duration-200">
            <div className="flex flex-row justify-center items-center text-center gap-1 text-white">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        {/* <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                        >
                            <User2 className="w-5 h-5" />
                        </Button> */}
                        <div className="flex flex-1 gap-1">
                            <User className="size-5" /> Sign Out {" "}
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <form
                                action={async () => {
                                    "use server"
                                    await signOut()
                                }}
                                className="w-full"
                            >
                                <button className="w-full text-left cursor-pointer">Log out</button>
                            </form>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </Link>
    )
}