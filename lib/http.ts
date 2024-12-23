/* eslint-disable @typescript-eslint/no-explicit-any */
type CustomRequestInit = RequestInit & { baseUrl?: string };

export interface HTTPResponseType {
    message: string;
    data: Record<string, any>[];
}

class AccessToken {
    private token = "";
    get value() {
        return this.token;
    }
    set value(token: string) {
        if (typeof window === "undefined") {
            throw new Error("Cannot set token on server side");
        }
        this.token = token;
    }
}
class RefreshToken {
    private refreshToken = ''
    set value(token: string) {
        if (typeof window === "undefined") {
            throw new Error("Cannot set token on server side");
        }
        this.refreshToken = token;
    }
    get value() {
        return this.refreshToken;
    }
}

export const accessToken = new AccessToken();
export const refreshToken = new RefreshToken();

const request = async <Response>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    url: string,
    options: CustomRequestInit = {},
): Promise<{
    status: number;
    payload: Response;
}> => {
    const body = options.body ? JSON.stringify(options.body) : undefined;
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };
    if (accessToken.value) {
        headers['Authorization'] = `Bearer ${accessToken.value}`;
    }
    const baseUrl = options?.baseUrl || process.env.NEXT_PUBLIC_BASE_URL;
    const fullUrl = url.startsWith("/")
        ? `${baseUrl}${url}`
        : `${baseUrl}/${url}`;

    const response = await fetch(fullUrl, {
        ...options,
        headers: {
            ...headers
        },
        body: body,
        method: method,
    });

    const payload: Response = await response.json();
    if (response.status === 401) {
        if (accessToken.value === "" || refreshToken.value === "") {
            window.location.href = "/login";
        }
        // handle refresh token
        const refreshResponse = await http.post<{access: string}>(
            "/auth/refresh/",
            {
                refresh: refreshToken.value,
            }
        )
        if (refreshResponse.status === 200) {
            accessToken.value = refreshResponse.payload.access;
            await fetch(`${process.env.NEXT_PUBLIC_NEXT_SERVER_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access: refreshResponse.payload.access,
                }),
            });
            return request(method, url, options);
        } else {
            // logout
            accessToken.value = "";
            refreshToken.value = "";
            window.location.href = "/login";
        }
    }

    return {
        status: response.status,
        payload,
    };
};

const http = {
    get<Response>(url: string, options?: Omit<CustomRequestInit, "body">) {
        return request<Response>("GET", url, options);
    },
    post<Response>(
        url: string,
        body: any,
        options?: Omit<CustomRequestInit, "body">,
    ) {
        return request<Response>("POST", url, { ...options, body });
    },
    put<Response>(
        url: string,
        body: any,
        options?: Omit<CustomRequestInit, "body">,
    ) {
        return request<Response>("PUT", url, { ...options, body });
    },
    delete<Response>(
        url: string,
        options?: Omit<CustomRequestInit, "body">,
    ) {
        return request<Response>("DELETE", url, { ...options });
    },
};

export default http;
