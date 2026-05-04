import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { error } from "@sveltejs/kit"
import { generateText } from "ai"

import { env } from "$env/dynamic/private"

import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async ({ request }) => {
    let { prompt, model } = await request.json()

    if (!prompt) throw error(400)

    if (!model) model = env.RENAME_AI_MODEL || "google/gemini-pro-vision"

    const openrouter = createOpenRouter({
        apiKey: env["OPENROUTER_API_KEY"]
    })

    const { text } = await generateText({
        model: openrouter.chat(model),
        prompt: prompt
    })

    return new Response(text || "", {
        status: 200
    })
}
