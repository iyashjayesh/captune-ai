import MainUpload from "@/app/_components/MainUpload";
import { signIn } from "@/auth";
import { getSession } from "@/lib/getSession";
import { Button } from "./ui/button";

// Server Actions must be async functions.
// export default function SignIn() {
export default async function MiddleComponent() {
    const session = await getSession();
    if (session) {
        return <MainUpload />
    } else {
        return (
            <form
                action={async () => {
                    "use server"
                    await signIn("google")
                }}
            >
                <Button
                    type="submit"
                    className="cursor-pointer bg-[#007bff] text-2xl font-bold text-white mt-12 mb-0"
                >
                    Sign in with Google
                </Button>
            </form >
        )
    }
}