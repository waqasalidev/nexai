import { createFileRoute } from "@tanstack/react-router";
import { streamText } from "ai";
import { getLovableGateway, DEFAULT_MODEL } from "@/lib/ai-gateway.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { messages, system } = await request.json();
          const gateway = getLovableGateway();
          const result = streamText({
            model: gateway(DEFAULT_MODEL),
            system:
              system ??
              "You are NexAI, a premium, knowledgeable, helpful AI assistant. Use markdown for formatting and code blocks for code.",
            messages,
          });
          return result.toTextStreamResponse();
        } catch (err) {
          const msg = err instanceof Error ? err.message : "AI error";
          return new Response(JSON.stringify({ error: msg }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
