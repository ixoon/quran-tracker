# Technical Architecture — Quran Tracker

## 1. Overview

```
┌─────────────────────────────┐
│  Expo (React Native) App    │
│  Expo Router · NativeWind   │
│  Zustand · AsyncStorage     │
└─────────────┬───────────────┘
              │ HTTPS
┌─────────────▼───────────────┐
│  Supabase                   │
│  Auth · Postgres · RLS      │
│  (optional Storage later)   │
└─────────────┬───────────────┘
              │
┌─────────────▼───────────────┐
│  External Quran APIs        │
│  Text / translations / audio│
└─────────────────────────────┘
```

**Local-first:** guest and signed-in users write to device storage first. Signed-in users sync to Supabase when online.

---

## 2. Tech stack

| Layer | Choice | Why |
|-------|--------|-----|
| App framework | Expo SDK 57 + Expo Router | Fast Android shipping, OTA-friendly, no Mac required for daily dev |
| Styling | NativeWind 4 (Tailwind) | Utility-first, shared design tokens |
| State | Zustand | Small, simple persistence hooks |
| Local DB/cache | AsyncStorage (+ FileSystem for audio) | Simple offline without heavy native DB |
| Backend | Supabase (Auth + Postgres + RLS) | Free tier, email + Google OAuth |
| Prayer math | `adhan` | Works offline once coordinates known |
| Audio | `expo-av` + FileSystem downloads | Stream + offline files |
| Push | `expo-notifications` | Prayer reminders |

---

## 3. App structure

```
app/
  _layout.tsx          # Providers, fonts, theme
  (tabs)/
    index.tsx          # Home
    quran.tsx          # Surah list
    prayer.tsx         # Prayer times
    favorites.tsx
    profile.tsx
  auth/login.tsx
  auth/register.tsx
  reader/[surahId].tsx
  goal.tsx
components/
lib/
  supabase.ts
  quran-api.ts
  prayer.ts
  sync.ts
  storage.ts
stores/
  authStore.ts
  progressStore.ts
  settingsStore.ts
  favoritesStore.ts
docs/
supabase/schema.sql
```

---

## 4. Design system

- **Direction:** modern clean — light surfaces, soft green accent (`brand-600`), generous whitespace.
- **Themes:** light / dark / system (`userInterfaceStyle: automatic` + settings override).
- **Home composition:** brand + progress + streak/goal + next prayer (no card clutter in hero).
- **Avoid:** purple gradients, cream/terracotta clichés, dense newspaper layouts.

CSS variables / Tailwind tokens live in `tailwind.config.js` (`brand`, `ink`).

---

## 5. Data flow

### 5.1 Progress & streak
1. User updates `current_page` or taps “Mark today as read”.
2. Zustand store updates → AsyncStorage persist.
3. If authenticated and online → upsert `user_progress` / `streak_days` in Supabase.

### 5.2 Quran content
1. First open of surah/translation → fetch API → cache JSON under a content key.
2. Subsequent opens read cache; background revalidate optional later.

### 5.3 Audio
1. Stream URL from API/CDN via `expo-av`.
2. Download → `FileSystem.documentDirectory/audio/{reciter}/{surah}.mp3`.
3. Playback prefers local file if present.

### 5.4 Prayer
1. User picks city → resolve lat/lng (static city table or one-time lookup, stored locally).
2. `adhan` computes today’s times offline.
3. Schedule local notifications for each prayer (respect user toggles).

### 5.5 Auth
- Email/password: Supabase Auth.
- Google: Supabase + Expo AuthSession / browser flow.
- Guest: `user_id = null`; data stays local until account linking/sync.

---

## 6. External APIs

| Concern | Approach |
|---------|----------|
| Arabic text | Public Quran API (e.g. api.alquran.cloud / quran.com API) |
| Translations | Same API; ship with 3–5 edition IDs |
| Audio | Reciter edition endpoints / CDN; cache files on device |
| Pages | Madinah 604 mapping from API page metadata |

All network calls go through `lib/quran-api.ts` so providers can be swapped.

---

## 7. Offline strategy

| Data | Offline behavior |
|------|------------------|
| Arabic + selected translations | Cached after first fetch |
| Progress / streak / favorites / settings | Always local; sync when possible |
| Prayer times | On-device calculation |
| Audio | Offline only if downloaded |
| Auth | Session persisted via SecureStore / AsyncStorage adapter |

---

## 8. Sync & conflicts

- Each mutable row has `updated_at` (ISO).
- Sync pull: merge by newest `updated_at`.
- Sync push: upsert authenticated user’s rows.
- Favorites keyed by `(user_id, surah, ayah)`.
- Streak: store last marked date + current count; recompute carefully on sync.

---

## 9. Security

- Supabase **RLS**: users read/write only their rows (`auth.uid() = user_id`).
- Anon key in app is expected; never put service role key in the client.
- SecureStore for session tokens where supported.

---

## 10. Build & release

| Target | Path |
|--------|------|
| Dev | `npx expo start` (Android emulator / Expo Go) |
| Android store | EAS Build → Play Console ($25 one-time) |
| iOS personal test | Expo Go (no Apple Developer $99) |
| iOS store | Deferred until Apple Developer account |

Env vars: see `.env.example`.

---

## 11. Testing plan (manual)

1. Guest: set page, mark streak, set goal — kill app — data remains.  
2. Register — data uploads — reinstall — login — data restored.  
3. Airplane mode: open cached surah; prayer still shows; audio offline file plays.  
4. Toggle theme light/dark/system.  
5. Change city — prayer times update — notifications reschedule.

---

## 12. Future (post-publish)

- Additional UI languages  
- More translations / reciters  
- Reading reminders  
- Widgets  
- Apple App Store  
