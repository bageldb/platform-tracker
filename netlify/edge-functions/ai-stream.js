const TOOLS = [
  {
    name: "add_module_task",
    description: "Add a new task to a specific module",
    input_schema: {
      type: "object",
      properties: {
        moduleId:    { type: "string", description: "Module ID, e.g. 'blox', 'auth', 'payment'" },
        text:        { type: "string", description: "Task title/description" },
        priority:    { type: "string", enum: ["high", "medium", "low"] },
        description: { type: "string", description: "Optional detailed notes" },
      },
      required: ["moduleId", "text", "priority"],
    },
  },
  {
    name: "update_module_task",
    description: "Update an existing module task's text, status, priority, or description",
    input_schema: {
      type: "object",
      properties: {
        moduleId:    { type: "string" },
        taskId:      { type: "number" },
        text:        { type: "string" },
        status:      { type: "string", enum: ["todo", "inprogress", "done", "blocked"] },
        priority:    { type: "string", enum: ["high", "medium", "low"] },
        description: { type: "string" },
      },
      required: ["moduleId", "taskId"],
    },
  },
  {
    name: "add_project_task",
    description: "Add a new task directly to a project (not tied to a module)",
    input_schema: {
      type: "object",
      properties: {
        project:     { type: "string", description: "Exact project name" },
        text:        { type: "string" },
        priority:    { type: "string", enum: ["high", "medium", "low"] },
        description: { type: "string" },
      },
      required: ["project", "text", "priority"],
    },
  },
  {
    name: "update_project_task",
    description: "Update an existing project-level task",
    input_schema: {
      type: "object",
      properties: {
        project:     { type: "string" },
        taskId:      { type: "number" },
        text:        { type: "string" },
        status:      { type: "string", enum: ["todo", "inprogress", "done", "blocked"] },
        priority:    { type: "string", enum: ["high", "medium", "low"] },
        description: { type: "string" },
      },
      required: ["project", "taskId"],
    },
  },
  {
    name: "add_project_to_module",
    description: "Tag a module as belonging to a project",
    input_schema: {
      type: "object",
      properties: {
        moduleId: { type: "string" },
        project:  { type: "string" },
      },
      required: ["moduleId", "project"],
    },
  },
];

function buildSystem(state) {
  const moduleList = state.modules.map(m =>
    `- ${m.name} (id: "${m.id}", subtitle: "${m.subtitle}", projects: [${m.projects.join(", ")}])\n` +
    m.tasks.map(t => `    • [${t.id}] ${t.text} [${t.status}/${t.priority}]`).join("\n")
  ).join("\n");

  const projList = Object.entries(state.projectTasks)
    .map(([proj, tasks]) =>
      `- ${proj}:\n` + tasks.map(t => `    • [${t.id}] ${t.text} [${t.status}/${t.priority}]`).join("\n")
    ).join("\n") || "  (none)";

  const focus = state.focus;
  let focusLine = "";
  if (focus?.type === "module" && focus.id) {
    const m = state.modules.find(m => m.id === focus.id);
    focusLine = `\n## User's current focus\nModule: ${m ? `${m.name} (id: "${m.id}")` : focus.id} — prefer adding tasks here unless context clearly indicates another module.`;
  } else if (focus?.type === "project" && focus.name) {
    focusLine = `\n## User's current focus\nProject: "${focus.name}" — prefer adding tasks to this project unless context clearly indicates otherwise.`;
  }

  return `You are an AI task management assistant for a software platform development tracker.

## Modules & their tasks
${moduleList}

## Project-level tasks
${projList}
${focusLine}

## Your job
- Parse emails, meeting notes, transcripts, or free-form text into actionable tasks
- Create, update, and prioritize tasks across modules and projects
- Suggest which module a task belongs to based on context
- Help the team plan and focus

When given unstructured content, proactively extract ALL actionable items and call the relevant tools. After all tool calls, write a concise summary of what you did and any suggestions. Use markdown formatting in your responses (headers, bullet points, bold text, code blocks where relevant).`;
}

function sseEvent(type, data) {
  return `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
}

/** Non-streaming API call — used for tool-call rounds */
async function callApi(msgs, state, apiKey) {
  const res = await fetch("https://ungate.bagel.to/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      ...(apiKey ? { "x-api-key": apiKey } : {}),
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      system: buildSystem(state),
      messages: msgs,
      tools: TOOLS,
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

/** Streaming API call — used for the final text response. Forwards tokens via enqueue. */
async function streamFinal(msgs, state, apiKey, enqueue) {
  const res = await fetch("https://ungate.bagel.to/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      ...(apiKey ? { "x-api-key": apiKey } : {}),
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      system: buildSystem(state),
      messages: msgs,
      tools: TOOLS,
      stream: true,
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let inText = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });

    const lines = buf.split("\n");
    buf = lines.pop();

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      let evt;
      try { evt = JSON.parse(line.slice(6)); } catch { continue; }

      if (evt.type === "content_block_start") {
        inText = evt.content_block?.type === "text";
      } else if (evt.type === "content_block_delta" && inText && evt.delta?.type === "text_delta") {
        enqueue(sseEvent("token", { text: evt.delta.text }));
      } else if (evt.type === "content_block_stop") {
        inText = false;
      }
    }
  }
}

export default async function handler(req) {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const { messages, state } = await req.json();
  const apiKey = Deno.env.get("AI_API_KEY");
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (str) => controller.enqueue(encoder.encode(str));

      try {
        let msgs = messages;
        const allToolCalls = [];

        // ── Agentic loop: non-streaming rounds until no more tool calls ──
        for (let round = 0; round < 10; round++) {
          const data = await callApi(msgs, state, apiKey);
          const toolBlocks = (data.content ?? []).filter(b => b.type === "tool_use");

          if (data.stop_reason !== "tool_use" || toolBlocks.length === 0) {
            // No more tool calls — do final streaming text response
            // Append the last assistant text to msgs so Claude has context
            const lastText = (data.content ?? []).filter(b => b.type === "text").map(b => b.text).join("");

            if (allToolCalls.length === 0) {
              // No tools were ever called — just stream this response directly
              await streamFinal(msgs, state, apiKey, enqueue);
            } else {
              // Tools were called — ask Claude to now write its summary (streaming)
              await streamFinal(msgs, state, apiKey, enqueue);
            }

            enqueue(sseEvent("done", { toolCalls: allToolCalls }));
            controller.close();
            return;
          }

          // Emit tool calls to the client
          for (const tb of toolBlocks) {
            allToolCalls.push({ name: tb.name, input: tb.input });
            enqueue(sseEvent("tool_call", { name: tb.name, input: tb.input }));
          }

          // Feed tool results back for next round
          msgs = [
            ...msgs,
            { role: "assistant", content: data.content },
            {
              role: "user",
              content: toolBlocks.map(b => ({
                type: "tool_result",
                tool_use_id: b.id,
                content: "Success",
              })),
            },
          ];
        }

        enqueue(sseEvent("done", { toolCalls: allToolCalls }));
        controller.close();
      } catch (err) {
        try {
          controller.enqueue(encoder.encode(sseEvent("error", { message: err.message })));
          controller.close();
        } catch {}
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export const config = { path: "/api/ai-stream" };
