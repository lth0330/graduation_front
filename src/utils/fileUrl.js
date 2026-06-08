export function getUploadedFileUrl(path, baseUrl = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080') {
  if (!path) {
    return '';
  }

  const filePath = String(path).trim();

  if (
    filePath.startsWith('http://') ||
    filePath.startsWith('https://') ||
    filePath.startsWith('data:') ||
    filePath.startsWith('blob:')
  ) {
    return filePath;
  }

  if (/^[A-Za-z]:[\\/]/.test(filePath)) {
    return '';
  }

  return `${baseUrl}/${filePath.replace(/^\/+/, '')}`;
}
