// Cloudflare Pages Function — AI requests proxy karta hai AI Gateway ke zariye
// Route: /api/ai
// Sirf POST allowed hai

interface Env {
  AI: any; // Workers AI binding (wrangler.toml mein defined)
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;

  // Method check
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Frontend se aata hai: { systemPrompt, userInput }
    const body = (await request.json()) as {
      systemPrompt?: string;
      userInput?: string;
    };

    const { systemPrompt, userInput } = body;

    // Validation
    if (!systemPrompt || !userInput) {
      return new Response(
        JSON.stringify({ error: 'systemPrompt and userInput are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Workers AI call — AI Gateway ke zariye route hoga
    const response = await env.AI.run(
      '@cf/meta/llama-3.1-8b-instruct',
      {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      },
      { gateway: { id: 'default' } } // AI Gateway se guzarta hai
    );

    // Workers AI binding dono formats return kar sakta hai — dono handle karo
    const text =
      (response as any)?.response ??
      (response as any)?.choices?.[0]?.message?.content ??
      '';

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message ?? 'AI request failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
