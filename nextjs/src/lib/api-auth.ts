import { auth } from "./auth";

/**
 * Verify API key from Authorization: Bearer <key> header.
 * Returns the user ID (referenceId) if valid, null if not.
 */
export async function verifyApiKey(
  request: Request
): Promise<{ userId: string } | null> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;

  const key = header.slice(7);
  if (!key) return null;

  try {
    const result = await auth.api.verifyApiKey({ body: { key } });
    if (!result?.valid) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const keyData = (result as any).key;
    if (!keyData?.referenceId) return null;
    return { userId: keyData.referenceId as string };
  } catch {
    return null;
  }
}

export function unauthorized() {
  return Response.json(
    {
      error: {
        code: "auth_required",
        message: 'Include Authorization: Bearer <api_key> header',
      },
    },
    { status: 401 }
  );
}
