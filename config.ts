interface ConfigProps {
    appName: string;
    appDescription: string;
    domainName: string;
    auth: {
        loginUrl: string;
        callbackUrl: string;
    };
}

const config = {
    appName: "Caption AI",
    appDescription:
        "Caption AI is a tool that helps you transcribe videos and generate captions for free.",
    domainName: "caption-ai.vercel.app",
    auth: {
        loginUrl: "/",
        callbackUrl: "/dashboard",
    },
} as ConfigProps;

export default config;