// import { signOutAction } from "@/actions/actions";
import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { User2 } from "lucide-react";
import { Poppins } from "next/font/google";

const font = Poppins({
    subsets: ["latin"],
    weight: ["600"]
});


interface DashboardTitleProps {
    title: string;
    showDropdown?: boolean;
}

export function DashboardTitle({ title, showDropdown = true }: DashboardTitleProps) {
    return (
        <div className="flex mt-3 justify-between px-5 md:px-0 ">
            <h1 className={cn("text-3xl font-bold text-slate-700", font.className)}>
                {title}
            </h1>
            {showDropdown &&
                (<DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                        >
                            <User2 className="w-5 h-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {/* <DropdownMenuItem asChild>
                            <Link href="/dashboard">Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/invoices">Invoices</Link>
                        </DropdownMenuItem> */}
                        {/* <DropdownMenuSeparator /> */}
                        <DropdownMenuItem asChild>
                            <form
                                action={async () => {
                                    "use server"
                                    await signOut()
                                }}
                                className="w-full"
                            >
                                <button className="w-full text-left">Log out</button>
                            </form>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                )
            }
        </div >
    );
}
