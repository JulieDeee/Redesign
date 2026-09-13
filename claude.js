import Anthropic from "@anthropic-ai/sdk";

// One place to build the Claude client.
// Some API keys aren't tied to a workspace; those need the workspace id sent
// as a header. Set ANTHROPIC_WORKSPACE_ID if your key needs it.
export function claude() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  const workspace = process.env.ANTHROPIC_WORKSPACE_ID;
  return new Anthropic({
    apiKey,
    ...(workspace ? { defaultHeaders: { "anthropic-workspace-id": workspace } } : {}),
  });
}

export const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
