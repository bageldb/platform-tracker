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

  return `You are an AI task management assistant for a software platform development tracker.

## Modules & their tasks
${moduleList}

## Project-level tasks
${projList}

## Your job
- Parse emails, meeting notes, transcripts, or free-form text into actionable tasks
- Create, update, and prioritize tasks across modules and projects
- Suggest which module a task belongs to based on context
- Help the team plan and focus

When given unstructured content, proactively extract ALL actionable items and call the relevant tools. After all tool calls, write a concise summary of what you did and any suggestions. Use markdown formatting in your responses (headers, bullet points, bold text, code blocks where relevant).`;
}

/** Encode an SSE event */
function sseEvent(type, data) {
  return `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
}

export default async function handler(req, context) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { messages, state } = await req.json();
  const apiKey = Deno.env.get("AI_API_KEY");

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (str) => controller.enqueue(encoder.encode(str));

      try {
        let msgs = messages;
        const allToolCalls = [];

        // ── Agentic loop: run non-streaming rounds for tool calls ──
        for (let round = 0; round < 10; round++) {
          const isLastRound = round === 9;

          // On the last round, force a text-only response (no tools) and stream it
          const requestBody = {
            model: "claude-sonnet-4-5",
            max_tokens: 4096,
            system: buildSystem(state),
            messages: msgs,
            tools: TOOLS,
          };

          // If we haven't entered a tool-use loop yet, try streaming immediately
          // Otherwise do a non-streaming tool round first
          if (round === 0 && allToolCalls.length === 0) {
            // Attempt streaming from the first round
            requestBody.stream = true;
          }

          const res = await fetch("https://ungate.bagel.to/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "anthropic-version": "2023-06-01",
              ...(apiKey ? { "x-api-key": apiKey } : {}),
            },
            body: JSON.stringify(requestBody),
          });

          if (!res.ok) {
            const err = await res.text();
            enqueue(sseEvent("error", { message: err }));
            controller.close();
            return;
          }

          // ── Streaming response ──
          if (requestBody.stream) {
            let stopReason = null;
            let toolBlocks = [];
            let currentToolBlock = null;
            let currentToolInput = "";
            let inTextBlock = false;

            const reader = res.body.getReader();
            const dec = new TextDecoder();
            let buf = "";

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buf += dec.decode(value, { stream: true });

              // SSE lines
              const lines = buf.split("\n");
              buf = lines.pop(); // keep incomplete line

              for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                const raw = line.slice(6).trim();
                if (raw === "[DONE]") break;

                let event;
                try { event = JSON.parse(raw); } catch { continue; }

                // Handle Anthropic streaming event types
                if (event.type === "message_start") {
                  // nothing yet
                } else if (event.type === "content_block_start") {
                  const block = event.content_block;
                  if (block.type === "text") {
                    inTextBlock = true;
                  } else if (block.type === "tool_use") {
                    inTextBlock = false;
                    currentToolBlock = { id: block.id, name: block.name };
                    currentToolInput = "";
                  }
                } else if (event.type === "content_block_delta") {
                  const delta = event.delta;
                  if (delta.type === "text_delta" && inTextBlock) {
                    // Stream text token to client
                    enqueue(sseEvent("token", { text: delta.text }));
                  } else if (delta.type === "input_json_delta" && currentToolBlock) {
                    currentToolInput += delta.partial_json;
                  }
                } else if (event.type === "content_block_stop") {
                  if (currentToolBlock) {
                    let input = {};
                    try { input = JSON.parse(currentToolInput); } catch {}
                    toolBlocks.push({ ...currentToolBlock, input });
                    currentToolBlock = null;
                    currentToolInput = "";
                  }
                  inTextBlock = false;
                } else if (event.type === "message_delta") {
                  if (event.delta?.stop_reason) stopReason = event.delta.stop_reason;
                } else if (event.type === "message_stop") {
                  // done
                }
              }
            }

            if (stopReason === "tool_use" && toolBlocks.length > 0) {
              // Emit tool calls to client
              for (const tb of toolBlocks) {
                allToolCalls.push({ name: tb.name, input: tb.input });
                enqueue(sseEvent("tool_call", { name: tb.name, input: tb.input }));
              }

              // Continue agentic loop with tool results
              msgs = [
                ...msgs,
                { role: "assistant", content: toolBlocks.map(tb => ({ type: "tool_use", id: tb.id, name: tb.name, input: tb.input })) },
                {
                  role: "user",
                  content: toolBlocks.map(tb => ({
                    type: "tool_result",
                    tool_use_id: tb.id,
                    content: "Success",
                  })),
                },
              ];

              // Next round will also stream (text response after tools)
              continue;
            }

            // Text response complete (stop_reason = end_turn)
            enqueue(sseEvent("done", { toolCalls: allToolCalls }));
            controller.close();
            return;
          }

          // ── Non-streaming fallback (shouldn't normally hit this) ──
          const data = await res.json();
          const toolBlocksFallback = (data.content ?? []).filter(b => b.type === "tool_use");

          if (data.stop_reason !== "tool_use" || toolBlocksFallback.length === 0) {
            const text = (data.content ?? []).filter(b => b.type === "text").map(b => b.text).join("");
            enqueue(sseEvent("token", { text }));
            enqueue(sseEvent("done", { toolCalls: allToolCalls }));
            controller.close();
            return;
          }

          allToolCalls.push(...toolBlocksFallback.map(b => ({ name: b.name, input: b.input })));
          for (const b of toolBlocksFallback) {
            enqueue(sseEvent("tool_call", { name: b.name, input: b.input }));
          }

          msgs = [
            ...msgs,
            { role: "assistant", content: data.content },
            {
              role: "user",
              content: toolBlocksFallback.map(b => ({
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
        enqueue(sseEvent("error", { message: err.message }));
        controller.close();
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
