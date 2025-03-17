import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "./ui/button";

// Server Actions must be async functions.
// export default function SignIn() {
export default async function SignIn() {

    const session = await auth();
    if (session) {
        console.log("session", session)
        redirect("/dashboard")
    } else {
        console.log("no session")
    }

    return (
        <form
            action={async () => {
                "use server"
                await signIn("google")
            }}
        >
            <Button type="submit">
                Sign in with Google
            </Button>
        </form>
    )
} 