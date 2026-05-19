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