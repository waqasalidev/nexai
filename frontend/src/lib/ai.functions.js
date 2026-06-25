import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { getLovableGateway, DEFAULT_MODEL } from "./ai-gateway.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  prompt: z.string().min(1).max(50000),
  system: z.string().max(4000).optional(),
  tool: z.string().min(1).max(64),
  title: z.string().max(200).optional(),
  saveHistory: z.boolean().optional(),
});

export const runAiTool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => Input.parse(input))
  .handler(async ({ data, context }) => {
    const gateway = getLovableGateway();
    const { text } = await generateText({
      model: gateway(DEFAULT_MODEL),
      system: data.system,
      prompt: data.prompt,
    });

    if (data.saveHistory !== false) {
      await context.supabase.from("ai_history").insert({
        user_id: context.userId,
        tool: data.tool,
        title: data.title ?? data.prompt.slice(0, 80),
        input: { prompt: data.prompt, system: data.system },
        output: text,
      });
    }

    return { text };
  });
