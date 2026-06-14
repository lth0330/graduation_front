export function formatManagerNotificationCreatedAt(value) {
  if (!value) {
    return '';
  }

  return String(value).replace('T', ' ').slice(0, 16);
}

export function formatManagerNotificationMessage(message) {
  const compactMessage = String(message || '')
    .replace(/\s*이미지:\s*.*$/g, '')
    .replace(/\s*시간:\s*20\d{2}[-/.]\d{1,2}[-/.]\d{1,2}[ T]\d{1,2}:\d{2}(?::\d{2})?\.?/g, '')
    .replace(/\s*관리자 확인 후 확정하세요\.?/g, '')
    .replace(/\s*거리값:\s*\d+\.?/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+\./g, '.')
    .trim();

  return compactMessage || '-';
}
