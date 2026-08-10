/** Resolve yoga session video URL from common API shapes. */
export const resolveYogaVideoUri = (item?: any): string | null => {
  if (!item || typeof item !== 'object') return null;

  const candidates = [
    item.video_url,
    item.session_video,
    item.session_video_url,
    item.preview_video,
    item.preview_video_url,
    item.media_url,
    item.video,
    item.file_url,
    item.file,
    item.hls_url,
    item.stream_url,
    item.media?.video_url,
    item.media?.url,
    item.media?.file,
    item.session?.video_url,
    item.session?.media_url,
  ];

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return null;
};

/** Thumbnail / poster image for yoga cards. */
export const resolveYogaThumbnailUri = (item?: any): string => {
  if (!item || typeof item !== 'object') return '';
  const candidates = [
    item.thumbnail_url,
    item.thumbnail,
    item.cover_image,
    item.image_url,
    item.image,
    item.poster_url,
    item.banner_url,
    item.media?.thumbnail_url,
    item.media?.image_url,
  ];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
};

export const mapYogaSessionForList = (item: any) => {
  if (!item || typeof item !== 'object') return null;
  const id = item.id ?? item.session_id;
  if (id == null) return null;

  const video_url = resolveYogaVideoUri(item);
  const thumbnail_url = resolveYogaThumbnailUri(item);

  return {
    ...item,
    id: String(id),
    type: 'yoga',
    title: String(item.title ?? item.name ?? 'Yoga Session'),
    name: String(item.name ?? item.title ?? 'Yoga Session'),
    short_description:
      item.short_description ||
      item.description ||
      item.difficulty ||
      item.duration ||
      '',
    difficulty: item.difficulty ?? item.level ?? '',
    duration: item.duration ?? item.duration_minutes ?? '',
    thumbnail_url,
    video_url: video_url || item.video_url,
  };
};

export const normalizeYogaSessionList = (response: any): any[] => {
  if (!response) return [];
  if (Array.isArray(response)) {
    return response.map(mapYogaSessionForList).filter(Boolean);
  }

  const data = response?.data ?? response?.results ?? response;
  if (Array.isArray(data)) {
    return data.map(mapYogaSessionForList).filter(Boolean);
  }

  if (data && typeof data === 'object') {
    const list =
      data.results ||
      data.sessions ||
      data.yoga_sessions ||
      data.items ||
      null;
    if (Array.isArray(list)) {
      return list.map(mapYogaSessionForList).filter(Boolean);
    }
    if (data.id || data.title || data.name) {
      const mapped = mapYogaSessionForList(data);
      return mapped ? [mapped] : [];
    }
  }

  return [];
};
