"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";

// Define an interface matching your Prisma Blog model schema
interface Blog {
    id: string;
    content: string;
    createdAt: string;
    userId: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    
    // States
    const [text, setText] = useState<string>("");
    const [blogs, setBlogs] = useState<Blog[]>([]); // To store the user's fetched blogs
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isLoadingBlogs, setIsLoadingBlogs] = useState<boolean>(true);

    // 1. Fetch user's blogs when the component mounts and the session becomes available
    useEffect(() => {
        const fetchUserBlogs = async () => {
            if (!session?.user?.id) return; // Prevent executing while user session is null

            try {
                setIsLoadingBlogs(true);
                // Send userId via a clean URL query string instead of an HTTP Body
                const response = await fetch(`/api/blogs?userId=${session.user.id}`, {
                    method: "GET",
                });
                
                const data = await response.json();
                if (response.ok) {
                    setBlogs(data); // Store array in our state wrapper
                } else {
                    console.error("Failed to load blogs:", data.error);
                }
            } catch (error) {
                console.error("Network error fetching blogs:", error);
            } finally {
                setIsLoadingBlogs(false);
            }
        };

        fetchUserBlogs();
    }, [session?.user?.id]); // Fires once on mount, and re-triggers once the session user id resolves

    // Route guard effect
    useEffect(() => {
        if (!isPending && !session?.user) {
            router.push("/sign-in");
        }
    }, [isPending, session, router]);

    // Form composition function
    const compose = async () => {
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
            const response = await fetch("/api/blogs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: text,
                    userId: session.user.id,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to save the blog post");
            }

            console.log("Success! Blog saved to Postgres:", data);
            
            // OPTIONAL BONUS: Push the new blog post straight into your UI array state so you see it instantly without refreshing!
            setBlogs((prev) => [data, ...prev]); 
            
            setText(""); 
            alert("Blog published successfully!");
        } catch (error) {
            console.error("Error submitting blog:", error);
            alert("Failed to submit blog.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isPending) return <p className="text-center mt-8 text-white">Loading...</p>;
    if (!session?.user) return <p className="text-center mt-8 text-white">Redirecting...</p>;

    const { user } = session;

    return (
        <main className="max-w-md min-h-screen flex items-center justify-start flex-col mx-auto p-6 space-y-6 text-white pt-12流动">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p>Welcome, {user.name || "User"}!</p>
            <p className="text-sm text-gray-400">Email: {user.email}</p>
            <button
                onClick={() => signOut()}
                className="bg-white text-black font-medium rounded-md px-4 py-2 hover:bg-gray-200 text-sm"
            >
                Sign out
            </button>
            
            <section className="border-t border-gray-700 pt-4 w-full max-w-[300px]">
                <p className="mb-2 font-semibold">Compose a blog</p>
                <div>
                    <textarea 
                        value={text}
                        onChange={(e) => setText(e.target.value)} 
                        placeholder="Write your blog post..."
                        className="text-gray-900 p-2 bg-white rounded-sm h-[100px] w-full block focus:outline-none text-sm" 
                    />
                    <div className="flex justify-center gap-4 mt-4">
                        <button 
                            onClick={() => setText("")} 
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm rounded-sm bg-red-500 font-medium disabled:opacity-50"
                        >
                            Discard
                        </button>
                        <button 
                            onClick={compose} 
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm rounded-sm bg-green-500 font-medium disabled:opacity-50"
                        >
                            {isSubmitting ? "Saving..." : "Publish"}
                        </button>
                    </div>
                </div>
            </section>

            {/* 2. DISPLAY COMPONENT: Displaying the blogs on your UI */}
            <section className="w-full max-w-[300px] border-t border-gray-700 pt-4">
                <h2 className="font-semibold mb-3">Your Published Blogs ({blogs.length})</h2>
                {isLoadingBlogs ? (
                    <p className="text-xs text-gray-400">Loading blogs...</p>
                ) : blogs.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No entries published yet.</p>
                ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {blogs.map((blog) => (
                            <div key={blog.id} className="p-3 bg-gray-800 rounded-sm border border-gray-700">
                                <p className="text-sm text-gray-200 whitespace-pre-wrap">{blog.content}</p>
                                <span className="text-[10px] text-gray-500 block mt-2">
                                    {new Date(blog.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}