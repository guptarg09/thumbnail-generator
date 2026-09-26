import { supabase } from './supabaseClient';

const API_BASE = "/api";

/**
 * Retrieves the current Supabase session access token.
 */
export async function getAccessToken() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (err) {
    console.error('Error fetching Supabase access token:', err);
    return null;
  }
}

/**
 * Builds request headers including Bearer authorization if a session exists.
 */
export async function getAuthHeaders(extraHeaders = {}) {
  const token = await getAccessToken();
  const headers = { ...extraHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Upload creator headshot to server with authentication.
 */
export async function uploadHeadshot(file) {
  const headers = await getAuthHeaders();
  const form = new FormData();
  form.append("file", file);

  const response = await fetch(`${API_BASE}/upload-headshot`, {
    method: "POST",
    headers,
    body: form,
  });

  if (!response.ok) {
    let errorDetail = "Failed to upload headshot";
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      // Use status text if body not json
      errorDetail = response.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

/**
 * Create thumbnail generation job with prompt, headshot URL, and count.
 */
export async function createJob(prompt, headshotUrl, numThumbnails) {
  const headers = await getAuthHeaders({
    "Content-Type": "application/json",
  });

  const response = await fetch(`${API_BASE}/jobs`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      prompt,
      headshot_url: headshotUrl,
      num_thumbnails: numThumbnails,
    }),
  });

  if (!response.ok) {
    let errorDetail = "Failed to create generation job";
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      errorDetail = response.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

/**
 * Fetch authenticated user's job history.
 */
export async function fetchHistory() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/history`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Your session has expired. Please sign in again.");
    }
    let errorDetail = "Failed to retrieve thumbnail history";
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      errorDetail = response.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

/**
 * Streams generation events using authenticated fetch with ReadableStream.
 * Browser EventSource cannot set arbitrary Authorization headers; fetch/ReadableStream
 * securely carries 'Authorization: Bearer <access_token>' without exposing tokens in URLs.
 */
export async function streamThumbnails(jobId, { onThumbnailReady, onThumbnailFailed, onJobComplete, onError }) {
  const token = await getAccessToken();
  const controller = new AbortController();

  (async () => {
    try {
      const headers = {
        "Accept": "text/event-stream",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/jobs/${jobId}/stream`, {
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorMsg = `Server stream returned ${response.status}`;
        try {
          const jsonErr = await response.json();
          errorMsg = jsonErr.detail || errorMsg;
        } catch {
          // ignore
        }
        if (onError) onError({ error: errorMsg });
        return;
      }

      if (!response.body) {
        throw new Error("ReadableStream not supported by this browser.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split(/\r?\n\r?\n/);
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (!part.trim()) continue;
          const lines = part.split(/\r?\n/);
          let eventType = "message";
          let dataStr = "";

          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventType = line.replace(/^event:\s*/, "").trim();
            } else if (line.startsWith("data:")) {
              dataStr += line.replace(/^data:\s*/, "");
            }
          }

          if (dataStr) {
            try {
              const payload = JSON.parse(dataStr);
              if (eventType === "thumbnail_ready" && onThumbnailReady) {
                onThumbnailReady(payload);
              } else if (eventType === "thumbnail_failed" && onThumbnailFailed) {
                onThumbnailFailed(payload);
              } else if (eventType === "job_completed" && onJobComplete) {
                onJobComplete(payload);
              } else if (eventType === "error" && onError) {
                onError(payload);
              }
            } catch (err) {
              console.warn("Error parsing SSE payload:", dataStr, err);
            }
          }
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Authenticated stream error:", err);
        if (onError) onError({ error: err.message || "Streaming connection interrupted." });
      }
    }
  })();

  return {
    close: () => {
      try {
        controller.abort();
      } catch {
        // ignore
      }
    }
  };
}