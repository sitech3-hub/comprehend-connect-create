import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";

type Payload = {
  email?: string | null;
  uid?: string | null;
  reason?: string;
  path?: string;
};

function maskEmail(email: string | null | undefined): string {
  if (!email) return "<none>";
  const [local, domain] = email.split("@");
  if (!domain) return "<invalid>";
  const head = local.slice(0, 2);
  return `${head}***@${domain}`;
}

function maskUid(uid: string | null | undefined): string {
  if (!uid) return "<none>";
  // keep only first 8 chars of UUID for traceability
  return `${uid.slice(0, 8)}…`;
}

export const logTeacherAccessDenied = createServerFn({ method: "POST" })
  .inputValidator((input: Payload) => ({
    email: typeof input?.email === "string" ? input.email.slice(0, 254) : null,
    uid: typeof input?.uid === "string" ? input.uid.slice(0, 64) : null,
    reason: typeof input?.reason === "string" ? input.reason.slice(0, 80) : "unspecified",
    path: typeof input?.path === "string" ? input.path.slice(0, 200) : "/teacher",
  }))
  .handler(async ({ data }) => {
    let ip = "unknown";
    try {
      ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
    } catch {
      // ignore
    }
    const entry = {
      kind: "teacher_access_denied",
      at: new Date().toISOString(),
      path: data.path,
      reason: data.reason,
      email: maskEmail(data.email),
      uid: maskUid(data.uid),
      ip,
    };
    // Stringified so it's easy to grep in worker logs
    console.warn(`[ACCESS_DENIED] ${JSON.stringify(entry)}`);
    return { ok: true };
  });
