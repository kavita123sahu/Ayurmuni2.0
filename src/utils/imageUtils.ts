/** Normalize RN image values (string uri, { uri }, require) for `<Image source={{ uri }} />`. */
export const resolveImageUri = (image: unknown): string => {
  if (!image) {
    return '';
  }

  if (typeof image === 'string') {
    return image;
  }

  if (typeof image === 'object' && image !== null && 'uri' in image) {
    const uri = (image as { uri?: unknown }).uri;
    return uri != null ? String(uri) : '';
  }

  return '';
};

export const resolveImageSource = (image: unknown) => {
  const uri = resolveImageUri(image);
  if (uri) {
    return { uri };
  }

  if (typeof image === 'number') {
    return image;
  }

  return null;
};
