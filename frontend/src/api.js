const API_BASE = "/api";

// this function is used to upload headshot to the server
export async function uploadHeadshot(file) {
    const form = new FormData();
    form.append("file", file);

    const response = await fetch(`${API_BASE}/upload-headshot`, {
        method: "POST",
        body: form
    });

    if (!response.ok) {
        throw new Error("Failed to upload headshot");
    }
    return response.json();
}

// this function is used to create job
export async function createJob(prompt, headshotUrl, numThumbnails) {
    const response = await fetch(`${API_BASE}/jobs`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            prompt,
            headshot_url: headshotUrl,
            num_thumbnails: numThumbnails
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to create job");
    }

    return response.json();
}

// this function is used to stream thumbnails from the server
export async function streamThumbnails(jobId, { onThumbnailReady, onThumbnailFailed, onJobComplete, onError }) {
    const eventSource = new EventSource(`${API_BASE}/jobs/${jobId}/stream`);
    eventSource.addEventListener("thumbnail_ready", (event) => {
        onThumbnailReady(JSON.parse(event.data))
    });

    eventSource.addEventListener("thumbnail_failed", (event) => {
        onThumbnailFailed(JSON.parse(event.data))
    });

    eventSource.addEventListener("job_completed", (event) => {
        onJobComplete(JSON.parse(event.data))
    });

    eventSource.addEventListener("error", (event) => {
        onError(JSON.parse(event.data))
    });

    return eventSource;
}