export const MAX_BODY_BYTES: number;
export function createRateLimiter(options?: { limit?: number; windowMs?: number; now?: () => number }): (ip?: string) => boolean;
export function handleContact(request: { method: string; origin?: string | null; contentType?: string | null; rawBody?: string; ip?: string }, options?: { env?: Record<string, string | undefined>; fetchEmail?: typeof fetch; fetchCaptcha?: typeof fetch; allowRequest?: (ip?: string) => boolean }): Promise<{ status: number; body: Record<string, unknown>; headers: Record<string, string> }>;
