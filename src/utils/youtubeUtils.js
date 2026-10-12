/**
 * Extracts YouTube Video ID from any valid YouTube URL format or raw ID.
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 * - VIDEO_ID (11 char alphanumeric string)
 */
export const extractYouTubeVideoId = (url) => {
  if (!url || typeof url !== "string") return "9ThLarUCcas";
  const trimmed = url.trim();

  // If raw 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex match for standard Youtube patterns
  const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|live\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = trimmed.match(regExp);

  if (match && match[1] && match[1].length === 11) {
    return match[1];
  }

  // Fallback cleanup if extra query params are present
  try {
    const parsedUrl = new URL(trimmed);
    if (parsedUrl.searchParams.has("v")) {
      return parsedUrl.searchParams.get("v");
    }
    const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    if (lastSegment && lastSegment.length === 11) {
      return lastSegment;
    }
  } catch (e) {
    // Not a valid URL structure, return trimmed or default
  }

  return trimmed || "9ThLarUCcas";
};

/**
 * Returns a clean YouTube embed URL with options.
 */
export const getYouTubeEmbedUrl = (urlOrId, options = {}) => {
  const videoId = extractYouTubeVideoId(urlOrId);
  const { autoplay = 1, mute = 0, rel = 0 } = options;
  return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay}&mute=${mute}&rel=${rel}`;
};
