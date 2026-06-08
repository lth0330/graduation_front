import assert from 'node:assert/strict';
import test from 'node:test';

import { getUploadedFileUrl } from './fileUrl.js';

test('업로드 파일 경로를 백엔드 파일 URL로 변환한다', () => {
  assert.equal(
    getUploadedFileUrl('/uploads/parking/error-1.jpg', 'http://localhost:8080'),
    'http://localhost:8080/uploads/parking/error-1.jpg',
  );
});

test('이미 완성된 URL이나 data URL은 그대로 사용한다', () => {
  assert.equal(
    getUploadedFileUrl('https://example.com/error.jpg', 'http://localhost:8080'),
    'https://example.com/error.jpg',
  );
  assert.equal(
    getUploadedFileUrl('data:image/jpeg;base64,abc123', 'http://localhost:8080'),
    'data:image/jpeg;base64,abc123',
  );
});

test('브라우저에서 직접 접근할 수 없는 로컬 파일 경로는 URL로 만들지 않는다', () => {
  assert.equal(
    getUploadedFileUrl('C:\\Users\\xm300\\Desktop\\snapshots\\error.jpg', 'http://localhost:8080'),
    '',
  );
});
