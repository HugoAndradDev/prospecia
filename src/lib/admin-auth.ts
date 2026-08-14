import "server-only";
import { createHash, timingSafeEqual } from "crypto";

export function checkAdminSecret(request: Request): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;

  const provided = request.headers.get("x-admin-secret");
  if (!provided) return false;

  // Comparar por hash, e não com ===, deixa o tempo de resposta igual para
  // qualquer senha errada. Com === o tempo varia conforme quantos caracteres
  // batem, e isso é informação que vaza para quem estiver medindo.
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}
