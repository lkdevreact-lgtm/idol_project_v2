import { SOCKET_URL } from "./constant";

/**
 * Upload a file to the backend and return its server path.
 * @param {File} file  - The File object to upload
 * @param {"video"|"avatar"|"overlay"} type - Upload endpoint type
 * @returns {Promise<string>} Server path, e.g. "/overlay/xxx.webm"
 */
export async function uploadFile(file, type) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${SOCKET_URL}/api/upload/${type}`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const body = await res.json();
      if (body.error) msg = body.error;
    } catch (_) {
      // ignore parse errors
    }
    throw new Error(msg);
  }
  const data = await res.json();
  return data.path; // e.g. '/overlay/123-overlay-effect.webm'
}
