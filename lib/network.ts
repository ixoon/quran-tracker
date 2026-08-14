const PING_URL = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions.min.json';

export async function isOnline(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(PING_URL, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}
