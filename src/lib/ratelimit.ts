/**
 * A simple in-memory rate limiter.
 * Note: In a serverless environment (like Vercel), memory is not shared across lambda instances.
 * For production with high traffic, consider replacing this with @upstash/ratelimit and Redis.
 */
class MemoryRateLimiter {
  private cache = new Map<string, { count: number; expiresAt: number }>();

  /**
   * Check if a request should be rate-limited.
   * @param identifier - Unique ID (e.g. user ID or IP)
   * @param limit - Max requests allowed in the time window
   * @param windowMs - Time window in milliseconds
   * @returns { success: boolean, remaining: number }
   */
  public limit(identifier: string, limit: number, windowMs: number) {
    const now = Date.now();
    const record = this.cache.get(identifier);

    if (record) {
      if (now > record.expiresAt) {
        // Reset window
        this.cache.set(identifier, { count: 1, expiresAt: now + windowMs });
        return { success: true, remaining: limit - 1 };
      }

      if (record.count >= limit) {
        return { success: false, remaining: 0 };
      }

      record.count += 1;
      return { success: true, remaining: limit - record.count };
    }

    // New record
    this.cache.set(identifier, { count: 1, expiresAt: now + windowMs });
    
    // Clean up expired entries periodically to prevent memory leaks
    if (this.cache.size > 1000) {
      this.cleanup(now);
    }

    return { success: true, remaining: limit - 1 };
  }

  private cleanup(now: number) {
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

export const rateLimiter = new MemoryRateLimiter();
