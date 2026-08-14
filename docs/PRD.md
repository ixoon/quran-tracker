# Product Requirements Document — Quran Tracker

**App name:** Quran Tracker  
**Platforms:** Android (Google Play) primary; iPhone usable via Expo Go / later App Store  
**UI language (v1):** English (more languages later)  
**Stack:** React Native (Expo) · NativeWind (Tailwind) · Supabase  
**Monetization:** Free; only planned paid cost is Google Play developer fee ($25)

---

## 1. Vision

A calm, modern Quran reading + habit tracker that helps users finish the Quran on a chosen schedule, keep a streak, bookmark progress, favorite ayat with notes, listen to reciters (with offline audio), and see prayer times for a chosen city — with optional cloud sync when they create an account.

---

## 2. Goals

- Make daily Quran reading measurable (Madinah mushaf pages, ~604).
- Help users plan a khatma (“finish in X days”) and see today’s page target.
- Support streak via an explicit daily check-in (not forced in-reader tracking).
- Provide a full Quran reader: surah select, translations, reciter audio, last-read resume.
- Sync progress across devices when the user signs in.
- Ship **one complete release** (all features below) before Play Store publish; later additions are optional.

---

## 3. Non-goals (for now)

- Apple App Store distribution (no $99 Apple Developer account yet).
- Multi-language UI beyond English.
- Social features, leaderboards, or public profiles.
- Paid subscriptions / IAP in v1.

---

## 4. Personas

| Persona | Need |
|--------|------|
| Habit reader | Sees pages read, streak, today’s target at a glance |
| Planner | Sets “finish in X days” and follows calculated daily pages |
| Listener | Chooses reciter, streams or downloads audio |
| Traveler / multi-device | Signs in and recovers progress |

---

## 5. Core features

### 5.1 Home
- Pages read (current page / 604) and progress %.
- Streak count + **“Mark today as read”** button (independent of page updates).
- Today’s goal: N pages derived from khatma plan.
- Visual goal met / not met vs. progress since plan start / last mark.
- Next prayer + shortcut to full prayer day view.

### 5.2 Reading progress
- Unit: **Madinah / King Fahd mushaf pages (~604)**.
- User **manually** sets “I’ve read up to page X” (and optional quick log of pages today).
- Single global **last read** (surah + ayah and/or page) for resume.

### 5.3 Khatma goal
- User chooses finish-by duration (e.g. 30 / 60 / 90 days or custom).
- App calculates daily page target: `ceil(remaining_pages / remaining_days)`.
- Home shows today’s target and progress toward it.

### 5.4 Streak
- Separate action: **Mark today as read**.
- Does **not** require reading inside the app.
- Streak increments when marked for that local calendar day; broken if a day is missed (no freeze in v1 unless added later).

### 5.5 Quran reader
- Browse/select surah; open reader.
- Arabic text from public API (e.g. AlQuran / Quran.com), **cached locally after first fetch**.
- **3–5 translations** selectable (v1), cached after load.
- Reciter picker; **stream + download for offline**.
- Update last-read position; mark page progress from reader context where helpful.

### 5.6 Favorites
- Star an ayah; list of favorites.
- Optional **note/comment** per favorite.

### 5.7 Prayer times
- User selects **city manually** (no GPS required).
- Full **daily schedule** + **notifications** for prayer times.
- Calculation offline on-device (Adhan library) after city/coords known.
- User can pick calculation method where relevant; city-based lookup provides coordinates.

### 5.8 Auth & sync
- **Guest mode:** all data local (AsyncStorage).
- Optional account: **email + password** and **Google**.
- On login: merge/upload local data to Supabase; subsequent devices sync.
- Sign out keeps local copy; cloud remains for next login.

### 5.9 Themes
- Light, dark, and **system** default.
- Visual direction: modern clean, soft green accent, whitespace, readable typography.

### 5.10 Notifications
- Prayer time reminders (primary).
- Reading goal reminders are out of scope unless added later.

### 5.11 Offline
- Quran text + selected translations: cache after first load.
- Progress, streak, favorites, settings: local-first; sync when online + signed in.
- Prayer times: computed on device.
- Audio: streaming always; offline via downloaded files.

---

## 6. Information architecture (screens)

1. **Home** — progress, streak, goal, next prayer  
2. **Quran** — surah list → reader  
3. **Prayer** — full day schedule, city & method settings  
4. **Favorites** — starred ayat + notes  
5. **Profile** — auth, theme, goal plan, sync status, about  
6. **Auth** — login / register (email, Google)  
7. **Goal setup** — finish-in-X-days wizard  

---

## 7. Success criteria (ship checklist)

- [ ] Android build runs on device/emulator  
- [ ] Guest can track pages, streak, goal without account  
- [ ] Email + Google auth work with Supabase  
- [ ] Sync restores progress on second install/login  
- [ ] Reader loads Arabic + at least 3 translations (cached)  
- [ ] Audio play + at least one offline download path  
- [ ] Favorites + notes persist  
- [ ] Prayer schedule for chosen city + notifications  
- [ ] Light / dark / system themes  
- [ ] Docs match shipped behavior (`docs/PRD.md`, `Tech.md`, `DB.md`)  

---

## 8. Decisions log (from discovery)

| Topic | Decision |
|-------|----------|
| Distribution | Android Play first; iPhone later / Expo Go |
| Stack | Expo + NativeWind + Supabase |
| Progress unit | Madinah pages (~604) |
| Progress entry | Manual “up to page X” |
| Streak | Separate “Mark today as read” |
| Goal | Finish in X days → daily pages |
| Quran source | Public API + local cache |
| Translations | 3–5 in release |
| Audio | Multiple reciters + offline download |
| Last read | Single global |
| Favorites | Star + note |
| Prayer | Manual city, full day + notifications |
| Auth | Guest + email/password + Google |
| Release strategy | One complete version, then publish |

---

## 9. Open items (implementation-time)

- Exact translation edition IDs from chosen API  
- Exact reciter list and CDN/API for audio  
- City database / geocoding approach (static city list vs. free geocode)  
- Conflict resolution policy when local and cloud diverge (prefer newest `updated_at`)  
