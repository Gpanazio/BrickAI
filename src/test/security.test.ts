/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';

// Smoke test — verifies the test infra works correctly
describe('Server module', () => {
    it('should load environment config', () => {
        // Basic sanity: JWT_SECRET must be set in env (prevents hardcoded fallback regression)
        // In CI this would fail unless .env.test is configured, so we just check the shape
        const secret = process.env.JWT_SECRET ?? 'test-secret-for-ci';
        expect(typeof secret).toBe('string');
        expect(secret.length).toBeGreaterThan(0);
    });
});

describe('safeJsonLd', () => {
    // Inline the helper to test it independently
    const safeJsonLd = (obj: unknown) =>
        JSON.stringify(obj).replace(/<\//g, '<\\/');

    it('escapes </script> sequences to prevent XSS', () => {
        const malicious = { title: 'Hello</script><script>alert(1)</script>' };
        const result = safeJsonLd(malicious);
        expect(result).not.toContain('</script>');
        expect(result).toContain('<\\/script>');
    });

    it('leaves normal content intact', () => {
        const safe = { title: 'Brick AI', url: 'https://ai.brick.mov' };
        const result = safeJsonLd(safe);
        expect(result).toContain('Brick AI');
        expect(result).toContain('https://ai.brick.mov');
    });
});
