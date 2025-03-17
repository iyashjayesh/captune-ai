import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Menu, MoonStar, SparklesIcon } from "lucide-react";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import config from "../../../config";
import { DashboardLinks } from "../_components/DashboardLinks";

const font = Poppins({
    subsets: ["latin"],
    weight: ["600"]
});

const normalfont = Poppins({
    subsets: ["latin"],
    weight: ["400"]
});

export default async function DashboardLayout({ children }:
    { children: ReactNode }) {

    const session = await auth();
    if (!session) {
        redirect("/")
    }

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            {/* Sidebar */}
            <div className="hidden bg-gray-100 border-r md:block">
                <div className="flex flex-col h-full">
                    <header className="h-14 flex items-center px-4 lg:h-[60px] lg:px-6">
                        <Link href="/" className="flex items-center">
                            <h1 className={cn("text-3xl font-bold", font.className)}>
                                {config.appName}
                            </h1>
                        </Link>
                    </header>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-4">
                        <DashboardLinks />
                    </nav>

                    {/* <div className="flex px-4 py-6">
                        <Card className="flex-1 flex justify-center items-center">
                            <CardHeader className="px-3 py-2 mt-1 flex justify-center">
                                <CardTitle
                                    className={cn(
                                        "text-sm font-semibold text-red-500 bg-red-100 rounded-md px-2 py-1 w-fit text-center",
                                        normalfont.className)}
                                >
                                    Free Plan (Beta)
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </div> */}

                    {/* Footer */}
                    <footer className="flex flex-col border-t px-4 mb-3 gap-y-1" >
                        <Link
                            className={cn(
                                "px-2 py-2 flex items-center gap-1.5 text-md text-gray-900 hover:bg-gray-200  rounded-md",
                                normalfont.className)}
                            href="https://x.com/codingyash/"
                            target="_blank" rel="noopener noreferrer"
                        >
                            <MoonStar className="size-4" /> Feature Requests
                        </Link>

                        <p className="text-sm text-gray-500 text-center justify-center mt-2">
                            © {new Date().getFullYear()} {config.appName}. All rights reserved.
                        </p>
                    </footer>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col">
                {/* Top Header */}
                {/* Top Header */}
                <header className="flex items-center bg-red-100/70 py-1">
                    <div className="p-4">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button

                                    variant="outline"
                                    size="icon"
                                    className="md:hidden"
                                >
                                    <Menu className="w-5 h-5" />
                                </Button>
                            </SheetTrigger>

                            <SheetContent side="left" className="w-64 max-w-full">
                                <div className="p-4">
                                    <nav className="mt-4 space-y-2">
                                        <DashboardLinks />
                                    </nav>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <div className="flex-1 flex items-center justify-center gap-2 py-1.5">
                        <div className="flex flex-row items-center px-4 gap-2">
                            <span
                                className={cn("text-sm text-red-500", normalfont.className)}>
                                Captune is in beta & free to use ☺️
                            </span>
                            <button
                                className={cn(
                                    "flex flex-row items-center md:gap-1 rounded-md text-sm bg-red-500 text-white px-1 py-1.5 hover:bg-red-600 transition-colors",
                                    normalfont.className)}
                            >
                                <SparklesIcon className="hidden md:block md:size-4" /> Please share feedback 🙏🏻
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 bg-gray-50 space-y-6">
                    {children}
                </main>
            </div >
        </div >
    );
}