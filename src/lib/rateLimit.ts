interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry>;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = { maxRequests: 100, windowMs: 60000 }) {
    this.limits = new Map();
    this.config = config;
  }

  check(identifier: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const entry = this.limits.get(identifier);

    if (!entry || now > entry.resetTime) {
      const resetTime = now + this.config.windowMs;
      this.limits.set(identifier, {
        count: 1,
        resetTime,
      });

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime,
      };
    }

    if (entry.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    entry.count += 1;
    this.limits.set(identifier, entry);

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  reset(identifier: string): void {
    this.limits.delete(identifier);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [identifier, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(identifier);
      }
    }
  }
}

export const globalRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000,
});

export const authRateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 300000,
});

export const apiRateLimiter = new RateLimiter({
  maxRequests: 1000,
  windowMs: 3600000,
});

setInterval(() => {
  globalRateLimiter.cleanup();
  authRateLimiter.cleanup();
  apiRateLimiter.cleanup();
}, 60000);

export function getRateLimitKey(userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  if (typeof window !== 'undefined') {
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      new Date().getTimezoneOffset(),
    ].join('|');

    return `fingerprint:${btoa(fingerprint)}`;
  }

  return 'anonymous';
}

export function createRateLimitedFunction<T extends (...args: any[]) => any>(
  fn: T,
  limiter: RateLimiter = globalRateLimiter,
  keyGenerator: (...args: Parameters<T>) => string = () => getRateLimitKey()
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    const result = limiter.check(key);

    if (!result.allowed) {
      const secondsUntilReset = Math.ceil(
        (result.resetTime - Date.now()) / 1000
      );
      throw new Error(
        `Rate limit exceeded. Please try again in ${secondsUntilReset} seconds.`
      );
    }

    return fn(...args);
  }) as T;
}

export { RateLimiter };
export type { RateLimitConfig, RateLimitEntry };
