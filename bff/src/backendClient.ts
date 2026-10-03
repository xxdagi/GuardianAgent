import { config } from "./config.js";

// Types mirror contracts/backend.openapi.yaml (snake_case). Do not import across services.
export interface BackendItem {
  id: string;
  name: string;
  created_at: string;
}

export class UpstreamError extends Error {
  constructor(
    message: string,
    public status = 502,
    public details: unknown = {},
  ) {
    super(message);
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${config.backendUrl}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new UpstreamError("Backend unreachable");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new UpstreamError("Backend returned an error", res.status, body);
  }
  return (await res.json()) as T;
}

export const backend = {
  listItems: () => call<BackendItem[]>("/api/v1/items"),
  createItem: (name: string) =>
    call<BackendItem>("/api/v1/items", { method: "POST", body: JSON.stringify({ name }) }),
};
