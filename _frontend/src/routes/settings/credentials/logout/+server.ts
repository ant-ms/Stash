import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async ({ cookies }) => {
    cookies.delete("session", { path: "/" })

    return new Response(null, {
        status: 307,
        headers: {
            location: "/settings/credentials/login"
        }
    })
}
