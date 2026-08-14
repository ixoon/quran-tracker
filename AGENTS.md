# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Project source of truth
Before implementing features, check the relevant project docs:
- Product requirements: `docs/PRD.md`
- Architecture: `docs/Tech.md`
- Database schema: `docs/DB.md`

Rules:
- Do not invent product requirements that are not in PRD/SoW.
- Follow the architecture docs before introducing new patterns.
- Follow the database schema before creating or changing tables.
- Follow the design system from cursor rules before building UI.

# MCP servers (`.cursor/mcp.json`)
- **Supabase MCP** — database, migrations, RLS; scoped to project `zayhykmuvgwjmjdxldag`. OAuth login on first use in Cursor Settings → Tools & MCP.
- **shadcn MCP** — browse/install shadcn/ui components. This app is React Native + NativeWind; adapt web shadcn patterns to RN (Pressable, View, Text), not DOM. Prefer [react-native-reusables](https://reactnativereusables.com/) when a direct RN port exists.

# Supabase client
- Env: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env`
- Client: `lib/supabase.ts` · Auth store: `stores/authStore.ts`
- Schema: `supabase/schema.sql` · Types: `docs/DB.md`