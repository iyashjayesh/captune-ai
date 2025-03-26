import { auth } from "@/auth";
import { cache } from "react";

export const getSession = cache(async () => {
    return await auth();
});
