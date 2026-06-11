import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getPlateReviewImageUrl,
  getPlateReviewManualConfirmLabel,
  hasPlateReviewCandidates,
  normalizePlateInput,
} from './plateCorrectionReview.js';

test('검토 기록의 주차 이력 이미지 경로를 업로드 URL로 변환한다', () => {
  const review = {
    parkingHistory: {
      imagePath: '/uploads/parking/plate-check.jpg',
    },
  };

  assert.equal(
    getPlateReviewImageUrl(review, 'http://localhost:8080'),
    'http://localhost:8080/uploads/parking/plate-check.jpg',
  );
});

test('직접 입력한 번호판의 앞뒤 공백과 중간 공백을 제거한다', () => {
  assert.equal(normalizePlateInput(' 12가 3456 '), '12가3456');
});

test('이미지 경로가 없으면 빈 문자열을 반환한다', () => {
  assert.equal(getPlateReviewImageUrl({ parkingHistory: {} }, 'http://localhost:8080'), '');
});

test('후보 목록이 없으면 후보 없음 상태로 판단한다', () => {
  assert.equal(hasPlateReviewCandidates({ candidateList: [] }), false);
  assert.equal(hasPlateReviewCandidates({ candidateList: ['12가3456'] }), true);
});

test('확정 중 상태에 따라 직접 확정 버튼 문구를 바꾼다', () => {
  assert.equal(getPlateReviewManualConfirmLabel(false), '입력 번호로 확정');
  assert.equal(getPlateReviewManualConfirmLabel(true), '확정 중...');
});
