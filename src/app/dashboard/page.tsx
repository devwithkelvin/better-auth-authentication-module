"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { useEffect } from "react";

export default function DashboardPage() {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    
    // State (Updated to track only string values cleanly)
    const [text, setText] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Local function updated to call your API route handler
    const compose = async () => {
        // Validation check to prevent empty entries
        if (!text.trim()) {
            alert("Please type something before publishing!");
            return;
        }

        if (!session?.user?.id) {
            alert("No user session found. Please log in again.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Making the actual HTTP POST request to your Next.js route handler
            const response = await fetch("/api/blogs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: text,
                    userId: session.user.id, // Grab the authorized user's id dynamically
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to save the blog post");
            }

            console.log("Success! Blog saved to Postgres:", data);
            setText(""); // Clear out the textarea text upon success
            alert("Blog published successfully!");

        } catch (error) {
            console.error("Error submitting blog:", error);
            alert("Failed to submit blog. Check your server console.");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (!isPending && !session?.user) {
            router.push("/sign-in");
        }
    }, [isPending, session, router]);

    if (isPending) return <p className="text-center mt-8 text-white">Loading...</p>;
    if (!session?.user) return <p className="text-center mt-8 text-white">Redirecting...</p>;

    const { user } = session;

    return (
        <main className="max-w-md h-screen flex items-center justify-center flex-col mx-auto p-6 space-y-4 text-white">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p>Welcome, {user.name || "User"}!</p>
            <p>Email: {user.email}</p>
            <button
                onClick={() => signOut()}
                className="bg-white text-black font-medium rounded-md px-4 py-2 hover:bg-gray-200"
            >
                Sign out
            </button>
            <section>
                <p className="mb-2 font-semibold">Compose a blog</p>
                <div>
                    {/* Added value={text} to bind the text state directly to the textarea element */}
                    <textarea 
                        value={text}
                        onChange={(e) => setText(e.target.value)} 
                        placeholder="Write your blog post..."
                        className="text-gray-500 p-2 bg-white rounded-sm h-[100px] w-[300px] block focus:outline-none" 
                    />
                    <div className="flex justify-center gap-4 mt-4">
                        <button 
                            onClick={() => setText("")} 
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-sm bg-red-400 font-medium disabled:opacity-50"
                        >
                            Discard
                        </button>
                        <button 
                            onClick={() => compose()} 
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-sm bg-green-400 font-medium disabled:opacity-50"
                        >
                            {isSubmitting ? "Saving..." : "Write"}
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}