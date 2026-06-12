export function getUploadedFileUrl(path, baseUrl = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080') {
  if (!path) {
    return '';
  }

  const filePath = String(path).trim();
  const s3ObjectKey = getS3ObjectKey(filePath);

  if (s3ObjectKey) {
    return `${baseUrl}/uploads/s3/${s3ObjectKey}`;
  }

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

function getS3ObjectKey(filePath) {
  if (filePath.startsWith('/uploads/s3/')) {
    return filePath.substring('/uploads/s3/'.length);
  }

  if (!/^https?:\/\//.test(filePath)) {
    return '';
  }

  try {
    const url = new URL(filePath);
    const host = url.hostname;
    if (host.includes('.s3.') && host.endsWith('.amazonaws.com')) {
      return url.pathname.replace(/^\/+/, '');
    }
  } catch (error) {
    return '';
  }

  return '';
}
