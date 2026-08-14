import * as WebBrowser from 'expo-web-browser';
import type { Session } from '@supabase/supabase-js';

import { createSessionFromUrl } from '@/lib/authSessionFromUrl';
import { getSupabase } from '@/lib/supabase';

/** Must match `scheme` in app.json and Supabase redirect URLs. */
export const GOOGLE_AUTH_REDIRECT = 'qurantracker://google-auth';

/** Must match redirectTo in resetPasswordForEmail and Supabase redirect URLs. */
export const PASSWORD_RESET_REDIRECT = 'qurantracker://reset-password';

WebBrowser.maybeCompleteAuthSession();

export async function performGoogleOAuth(): Promise<Session | null> {
  const { data, error } = await getSupabase().auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: GOOGLE_AUTH_REDIRECT,
      skipBrowserRedirect: true,
      queryParams: { prompt: 'select_account' },
    },
  });

  if (error) throw error;
  if (!data.url) throw new Error('Google sign-in is not available right now.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, GOOGLE_AUTH_REDIRECT, {
    showInRecents: true,
  });

  if (result.type === 'cancel' || result.type === 'dismiss') {
    return null;
  }

  if (result.type === 'success') {
    const session = await createSessionFromUrl(result.url);
    if (!session) {
      throw new Error('Google sign-in did not return a session.');
    }
    return session;
  }

  throw new Error('Google sign-in failed.');
}
