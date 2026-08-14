# Database Schema — Quran Tracker (Supabase / Postgres)

This schema supports authenticated sync. Guest users keep the same shapes in AsyncStorage and upload on first login.

Apply via Supabase SQL editor or CLI: `supabase/schema.sql`.

---

## 1. ER overview

```
auth.users
    │
    ├── profiles (1:1)
    ├── user_progress (1:1)
    ├── reading_goals (1:1 current)
    ├── streak_state (1:1)
    ├── favorites (1:N)
    ├── settings (1:1)
    └── audio_downloads (1:N)   -- optional metadata; files stay on device
```

Quran text/translations are **not** stored in Postgres (fetched + cached on device).

---

## 2. Tables

### 2.1 `profiles`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | `= auth.users.id` |
| display_name | text | nullable |
| avatar_url | text | nullable |
| created_at | timestamptz | default `now()` |
| updated_at | timestamptz | default `now()` |

### 2.2 `user_progress`

Tracks mushaf page progress and last-read resume point.

| Column | Type | Notes |
|--------|------|-------|
| user_id | uuid PK FK → auth.users | |
| current_page | int | 1–604, Madinah |
| last_surah | int | 1–114, nullable |
| last_ayah | int | nullable |
| pages_read_total | int | derived/helper; optional |
| updated_at | timestamptz | conflict key |

**Check:** `current_page BETWEEN 1 AND 604`

### 2.3 `reading_goals`

Active khatma plan (“finish in X days”).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK | unique among active |
| start_page | int | page at plan start |
| target_end_page | int | usually 604 |
| start_date | date | |
| end_date | date | finish-by date |
| daily_pages_target | int | cached calculation |
| is_active | boolean | default true |
| updated_at | timestamptz | |

Daily target formula (app-side):  
`ceil((target_end_page - current_page + 1) / max(1, days_remaining))`

### 2.4 `streak_state`

| Column | Type | Notes |
|--------|------|-------|
| user_id | uuid PK FK | |
| current_streak | int | default 0 |
| longest_streak | int | default 0 |
| last_marked_date | date | local calendar day last “Mark today as read” |
| updated_at | timestamptz | |

Marking rules (app):
- If `last_marked_date == today` → no-op  
- If `last_marked_date == yesterday` → `current_streak += 1`  
- Else → `current_streak = 1`  
- Always set `last_marked_date = today`; update `longest_streak`

### 2.5 `favorites`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK | |
| surah | int | 1–114 |
| ayah | int | |
| note | text | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Unique:** `(user_id, surah, ayah)`

### 2.6 `user_settings`

| Column | Type | Notes |
|--------|------|-------|
| user_id | uuid PK FK | |
| theme | text | `light` \| `dark` \| `system` |
| translation_ids | int[] / jsonb | selected edition IDs |
| reciter_id | text | |
| prayer_city | text | |
| prayer_lat | double precision | |
| prayer_lng | double precision | |
| prayer_method | text | e.g. `MuslimWorldLeague` |
| prayer_notifications | boolean | default true |
| asr_method | text | optional `Standard` \| `Hanafi` |
| updated_at | timestamptz | |

### 2.7 `audio_downloads` (optional sync metadata)

Device files are authoritative; this table can sync “what I downloaded” across devices as a wishlist.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK | |
| reciter_id | text | |
| surah | int | |
| updated_at | timestamptz | |

**Unique:** `(user_id, reciter_id, surah)`

---

## 3. RLS policies (summary)

Enable RLS on all public tables.

- **SELECT / INSERT / UPDATE / DELETE:** `auth.uid() = user_id` (or `id` for profiles).
- No public read of user data.
- Profile auto-create: trigger on `auth.users` insert → `profiles` + empty `user_progress` / `streak_state` / `user_settings`.

---

## 4. Indexes

- `favorites (user_id, updated_at desc)`
- `reading_goals (user_id) WHERE is_active = true`
- `audio_downloads (user_id, reciter_id)`

---

## 5. Local (AsyncStorage) mirror keys

| Key | Shape |
|-----|--------|
| `progress` | `{ currentPage, lastSurah, lastAyah, updatedAt }` |
| `streak` | `{ currentStreak, longestStreak, lastMarkedDate, updatedAt }` |
| `goal` | `{ startPage, endDate, startDate, dailyTarget, ... }` |
| `favorites` | `Favorite[]` |
| `settings` | settings object |
| `quran_cache:{edition}:{surah}` | ayah payload |
| `session_guest` | boolean / guest flag |

---

## 6. Auth providers

- Email + password (Supabase)  
- Google OAuth (Supabase provider; Expo Auth Session redirect `qurantracker://`)

---

## 7. Migration notes

1. Run `supabase/schema.sql` on a fresh project.  
2. Enable Google provider in Supabase Auth settings.  
3. Add redirect URL for Expo scheme.  
4. Never commit real keys; use `.env` / EAS secrets.  
