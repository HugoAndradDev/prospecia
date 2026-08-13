import "server-only";

export function checkAdminSecret(request: Request): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const provided = request.headers.get("x-admin-secret");
  return provided === expected;
}
