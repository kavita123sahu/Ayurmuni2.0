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

export const parseTimeToSeconds = (value: any): number => {
  if (value == null || value === '') return 0;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, value);
  }
  const raw = String(value).trim();
  if (!raw) return 0;
  if (/^\d+(\.\d+)?$/.test(raw)) return Math.max(0, Number(raw));
  const parts = raw.split(':').map(p => Number(p));
  if (parts.some(n => !Number.isFinite(n))) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
};

export const formatYogaTime = (seconds: number): string => {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
};

export type YogaBreakdownItem = {
  id: string;
  title: string;
  time: string;
  startSeconds: number;
};

const toBreakdownItem = (raw: any, index: number): YogaBreakdownItem | null => {
  if (raw == null) return null;
  if (typeof raw === 'string') {
    const title = raw.trim();
    if (!title) return null;
    return {
      id: `pose-${index}`,
      title,
      time: formatYogaTime(0),
      startSeconds: 0,
    };
  }
  const title = String(
    raw.title ?? raw.name ?? raw.pose ?? raw.asana ?? raw.label ?? '',
  ).trim();
  if (!title) return null;
  const startSeconds = parseTimeToSeconds(
    raw.start_seconds ??
      raw.start_time ??
      raw.timestamp ??
      raw.time_seconds ??
      raw.time ??
      raw.offset ??
      0,
  );
  return {
    id: String(raw.id ?? `pose-${index}`),
    title,
    time: formatYogaTime(startSeconds),
    startSeconds,
  };
};

/** Session poses / chapters from common API shapes. */
export const getYogaSessionBreakdown = (item?: any): YogaBreakdownItem[] => {
  if (!item || typeof item !== 'object') return [];
  const candidates = [
    item.session_breakdown,
    item.breakdown,
    item.poses,
    item.yoga_poses,
    item.asanas,
    item.steps,
    item.segments,
    item.chapters,
    item.sequence,
    item.timeline,
    item.sections,
  ];
  for (const list of candidates) {
    if (!Array.isArray(list) || !list.length) continue;
    const mapped = list
      .map((row, i) => toBreakdownItem(row, i))
      .filter(Boolean) as YogaBreakdownItem[];
    if (mapped.length) return mapped;
  }
  return [];
};

export const getYogaInstructor = (item?: any) => {
  const src =
    item?.instructor ||
    item?.mentor ||
    item?.teacher ||
    item?.guided_by ||
    item?.coach ||
    null;
  if (!src) return null;
  if (typeof src === 'string') {
    return { name: src, subtitle: '', description: '', imageUri: '' };
  }
  return {
    name: String(src.full_name || src.name || 'Yoga Mentor'),
    subtitle: String(
      src.designation || src.specialization || src.title || '',
    ),
    description: String(src.bio || src.description || ''),
    imageUri: String(src.profile_image || src.image_url || src.image || ''),
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
