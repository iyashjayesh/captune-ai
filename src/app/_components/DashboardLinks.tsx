"use client";


import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Video } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const dashboardLinks = [
    {
        id: 0,
        name: "All Projects",
        href: "/dashboard",
        icon: Video,
    }
];

export function DashboardLinks() {
    const pathname = usePathname();
    const splitPathname = pathname.split("/");

    return (
        <>
            {dashboardLinks.map(({ id, name, href, icon: Icon }) => {
                const splitHref = href.split("/");
                const isLinkActive = splitPathname[2] === splitHref[2];

                return (
                    <Link
                        className={cn(
                            isLinkActive ? "text-white font-semibold bg-red-500" : "text-muted-foreground hover:text-foreground",
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all mb-6"
                        )}
                        key={id}
                        href={href}
                    >
                        <Icon className="w-4 h-4" />
                        <span className="text-md">{name}</span>
                    </Link>
                );
            })}

            <Separator className="my-4 text-slate-700" />
        </>
    );
}
