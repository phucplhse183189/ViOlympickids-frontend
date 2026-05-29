import PayOS from "@payos/node";

/**
 * PayOS SDK singleton — sử dụng env vars từ Vercel Dashboard
 * PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY
 */
export const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID!,
  process.env.PAYOS_API_KEY!,
  process.env.PAYOS_CHECKSUM_KEY!,
);
