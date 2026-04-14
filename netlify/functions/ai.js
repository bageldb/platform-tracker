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

When given unstructured content, proactively extract ALL actionable items and call the relevant tools. After all tool calls, write a concise summary of what you did and any suggestions.`;
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { messages, state } = JSON.parse(event.body);

    let msgs = messages;
    const allToolCalls = [];

    // Agentic loop — Claude may call multiple tools before finishing
    for (let round = 0; round < 10; round++) {
      const res = await fetch("https://ungate.bagel.to/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
          ...(process.env.AI_API_KEY ? { "x-api-key": process.env.AI_API_KEY } : {}),
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 4096,
          system: buildSystem(state),
          messages: msgs,
          tools: TOOLS,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? JSON.stringify(data));

      const toolBlocks = (data.content ?? []).filter(b => b.type === "tool_use");

      if (data.stop_reason !== "tool_use" || toolBlocks.length === 0) {
        const text = (data.content ?? []).filter(b => b.type === "text").map(b => b.text).join("");
        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, toolCalls: allToolCalls }),
        };
      }

      allToolCalls.push(...toolBlocks.map(b => ({ name: b.name, input: b.input })));

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

    return { statusCode: 200, body: JSON.stringify({ text: "Done.", toolCalls: allToolCalls }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
