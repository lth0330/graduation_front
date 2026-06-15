import { useEffect, useRef } from 'react';

export default function useAutoRefresh(callback, intervalMs, enabled = true) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    // setInterval이 오래 유지되어도 최신 callback을 실행하도록 ref에 보관합니다.
    // 이 처리가 없으면 이전 렌더링 시점의 상태를 참조할 수 있습니다.
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || !intervalMs) {
      return undefined;
    }

    let isRunning = false;

    const run = async () => {
      // 이전 새로고침이 끝나기 전에 다음 새로고침이 겹치거나,
      // 사용자가 다른 탭을 보고 있을 때 불필요한 API 호출이 발생하지 않게 합니다.
      if (isRunning || document.visibilityState === 'hidden') {
        return;
      }

      try {
        isRunning = true;
        await callbackRef.current?.();
      } catch {
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

    // 컴포넌트가 사라질 때 타이머와 이벤트를 제거해 중복 호출과 메모리 누수를 막습니다.
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', run);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, intervalMs]);
}
