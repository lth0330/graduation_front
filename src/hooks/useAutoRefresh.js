import { useEffect, useRef } from 'react';

export default function useAutoRefresh(callback, intervalMs, enabled = true) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || !intervalMs) {
      return undefined;
    }

    let isRunning = false;

    const run = async () => {
      if (isRunning || document.visibilityState === 'hidden') {
        return;
      }

      try {
        isRunning = true;
        await callbackRef.current?.();
      } catch (error) {
        // 자동 갱신 실패는 기존 화면을 유지하고, 수동 새로고침에서 오류를 확인합니다.
      } finally {
        isRunning = false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        run();
      }
    };

    const intervalId = window.setInterval(run, intervalMs);
    window.addEventListener('focus', run);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', run);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, intervalMs]);
}
