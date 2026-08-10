# 2026-07-29 — Debugging: "Failed to fetch" on signup

**Roadmap phase:** none — live bug report, not a planned phase

## Symptom
User reported `Failed to fetch` shown under the email field when submitting
the signup form.

## Investigation
1. Confirmed `.env.local` unchanged and correct
2. Ran `npm run check:supabase` — reported success. **This was a false
   positive** (see Bug found below)
3. Asked the user for the actual browser console error:
   `POST https://uqfpbusconhsxpvwwqjp.supabase.co/auth/v1/signup
   net::ERR_NAME_NOT_RESOLVED` — a DNS resolution failure, not a CORS or
   application-level error
4. Confirmed the Bash/PowerShell tools in this session run directly on the
   user's own machine (not an isolated remote sandbox), so local network
   diagnostics here are representative of what the browser experiences
5. `nslookup` reproduced the same failure independently of the browser,
   using DNS server `172.28.57.65` (the active Wi-Fi adapter's configured
   resolver)
6. Flushed DNS (`ipconfig /flushdns`) and retried — still failed. Not a
   stale cache
7. Queried Google (`8.8.8.8`) and Cloudflare (`1.1.1.1`) directly via
   `Resolve-DnsName -Server ...` — **both independently reported the
   hostname does not exist**, ruling out a local network/router/ISP-DNS
   problem specifically
8. Sanity-checked the parent domain: `supabase.co` itself resolves fine
   (`76.76.21.21`), and general internet/DNS on the machine works —
   isolating the failure to this one project's subdomain specifically

## Root cause
`uqfpbusconhsxpvwwqjp.supabase.co` does not currently resolve in DNS,
confirmed independently via the local resolver, Google, and Cloudflare.
Since the parent domain and general connectivity are fine, this points to
something on Supabase's side for this specific project — most likely an
auto-paused free-tier project (Supabase pauses inactive free-tier projects,
which can stop the project's subdomain from resolving). **Not a code bug,
not a local network problem.** User was asked to check the Supabase
dashboard for a paused/restore state — outside what this session can see
or fix directly.

## Bug found and fixed along the way
`scripts/check-supabase.js` used `supabase.auth.getSession()` to test
connectivity. That method reads local storage and **never makes a network
request**, so it reported "Connected" even with DNS completely broken —
a false positive that had been masking real connectivity status since
Phase 0. Fixed to query a real table (`notes`) instead, which forces an
actual HTTP round trip through DNS + TLS + PostgREST; RLS blocking
anonymous rows is fine, what matters is that a real response comes back.
Re-ran after the fix: correctly now reports
`Could not reach Supabase: TypeError: fetch failed`, matching the real
DNS failure.

## Files touched
- `scripts/check-supabase.js` (fixed false-positive connectivity check)

## Notes for next time
- If DNS resolves again (project resumed) but this keeps recurring on the
  free tier, that's worth a product-level conversation — auto-pause is
  fine during development but not for anything meant to stay reachable
- `check:supabase` is now a real check — trust it going forward instead of
  the pattern used in Phases 1-4 (spinning up a throwaway script that
  makes a real auth/table call). It's a faster first thing to run whenever
  something looks like a connectivity issue
