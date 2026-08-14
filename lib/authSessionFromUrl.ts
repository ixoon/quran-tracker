import * as QueryParams from 'expo-auth-session/build/QueryParams';
import type { Session } from '@supabase/supabase-js';

import { getSupabase } from '@/lib/supabase';

export async function createSessionFromUrl(url: string): Promise<Session | null> {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    throw new Error(errorCode);
  }

  const { access_token, refresh_token, code } = params;

  if (code) {
    const { data, error } = await getSupabase().auth.exchangeCodeForSession(code);
    if (error) throw error;
    return data.session;
  }

  if (access_token && refresh_token) {
    const { data, error } = await getSupabase().auth.setSession({
      access_token,
      refresh_token,
    });
    if (error) throw error;
    return data.session;
  }

  return null;
}
