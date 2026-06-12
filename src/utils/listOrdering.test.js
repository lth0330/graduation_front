import assert from 'node:assert/strict';
import test from 'node:test';

import { sortByNewest } from './listOrdering.js';

test('날짜가 최신인 항목을 먼저 배치한다', () => {
  const rows = [
    { id: '1', requestedAt: '2026-06-10' },
    { id: '2', requestedAt: '2026-06-12' },
    { id: '3', requestedAt: '2026-06-11' },
  ];

  assert.deepEqual(sortByNewest(rows).map((row) => row.id), ['2', '3', '1']);
});

test('날짜가 같거나 없으면 숫자 ID가 큰 항목을 먼저 배치한다', () => {
  const rows = [
    { id: '10', createdAt: '2026-06-12' },
    { id: '12', createdAt: '2026-06-12' },
    { id: '11' },
  ];

  assert.deepEqual(sortByNewest(rows).map((row) => row.id), ['12', '10', '11']);
});

test('원본 배열을 직접 변경하지 않는다', () => {
  const rows = [
    { id: '1', registeredAt: '2026-06-10' },
    { id: '2', registeredAt: '2026-06-12' },
  ];

  sortByNewest(rows);

  assert.deepEqual(rows.map((row) => row.id), ['1', '2']);
});
