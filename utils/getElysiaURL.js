/**
 * Elysia URL Utility
 * Fetches tunnel URL from server or storage endpoint
 */

/**
 * Fetch Elysia tunnel URL from remote server
 * @returns {Promise<string>} The tunnel URL as text
 * @throws {Error} If the fetch request fails
 */
export async function getElysiaURL() {
  const res = await fetch(
    "https://your-server-or-storage/tunnel_url.txt"
  );
  return await res.text();
}