import { auth } from "@/auth";
import { cache } from "react";
import client from "./db";

export const getSession = cache(async () => {
    await client.connect();
    return await auth();
});
