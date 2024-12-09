import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
    cookies().delete("access-token");
    cookies().delete("refresh-token");

    return NextResponse.json({
        message: "Logged out successfully",
    })
}
