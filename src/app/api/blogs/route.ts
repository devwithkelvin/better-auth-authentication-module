import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { content, userId } = body
    if (!content || !userId) {
      return NextResponse.json(
        { error: "content and userid fields are required fields" },
        { status: 400 }//bad req
      )
    }
    //when succesfull
    const newBlog = await prisma.blog.create({
      data: {
        content: content,
        userId: userId//connects the blog post to the specific user profile
      }
    })
    return NextResponse.json(newBlog, { status: 201 })
  } catch (error) {
    console.error("Database error creating blog:", error);

    // 5. Handle fallback server errors gracefully
    return NextResponse.json(
      { error: "Internal Server Error. Failed to publish blog." },
      { status: 500 }
    );
  }
}

//getting the blogs of users
export async function GET(request: Request) {
  try {
    // 1. Extract the URL from the incoming request
    const { searchParams } = new URL(request.url);
    
    // 2. Get the 'userId' query parameter
    const userId = searchParams.get("userId");

    // 3. Handle validation if no userId is provided
    if (!userId) {
      return NextResponse.json(
        { error: "Missing required query parameter: userId" },
        { status: 400 }
      );
    }

    // 4. Query the database using Prisma to find blogs belonging to this user
    const userBlogs = await prisma.blog.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc", // Optional: returns the newest blogs first
      },
    });

    // 5. Return the blogs back to the client
    return NextResponse.json(userBlogs, { status: 200 });

  } catch (error: any) {
    console.error("Database error fetching blog:", error);
    
    // Handle fallback server errors gracefully
    return NextResponse.json(
      { error: "Internal Server Error. Failed to fetch blog." },
      { status: 500 }
    );
  }
}