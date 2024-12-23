import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const data = await request.json();
    const access = data["access"];
    const refresh = data["refresh"];
    if (access) {
        cookies().set("access-token", access, {
            httpOnly: true,
            path: "/",
            sameSite: "strict",
            secure: true,
        });
    }
    if (refresh) {
        cookies().set("refresh-token", refresh, {
            httpOnly: true,
            path: "/",
            sameSite: "strict",
            secure: true,
        });
    }
    return NextResponse.json({
        message: "Logged in successfully",
    });
}
