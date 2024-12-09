import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const data = await request.json();
    const access = data['access'];
    const refresh = data['refresh'];

    cookies().set("access-token", access, {
        httpOnly: true,
        path: "/",
        sameSite: "strict",
        secure: true,
    });
    cookies().set("refresh-token", refresh, {
        httpOnly: true,
        path: "/",
        sameSite: "strict",
        secure: true,
    });

    return NextResponse.json({
        message: "Logged in successfully",
    })
}
