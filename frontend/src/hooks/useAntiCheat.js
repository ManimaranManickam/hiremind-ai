import { useEffect, useRef, useState, useCallback } from 'react';

export default function useAntiCheat({ enabled, onWarning, onTerminate }) {
  const warningCount = useRef(0);
  const terminated = useRef(false);

  const trigger = useCallback((reason) => {
    if (!enabled || terminated.current) return;
    warningCount.current += 1;
    if (warningCount.current === 1) {
      onWarning(reason);
    } else {
      terminated.current = true;
      onTerminate(reason);
    }
  }, [enabled, onWarning, onTerminate]);

  useEffect(() => {
    if (!enabled) return;

    const onVisibility = () => {
      if (document.hidden) trigger('You switched to another tab');
    };
    const onBlur = () => trigger('You left the interview window');
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ['t', 'n', 'w', 'tab'].includes(k)) {
        e.preventDefault();
        e.stopPropagation();
        trigger('You tried to open a new tab');
      }
      if (e.altKey && k === 'tab') {
        e.preventDefault();
        trigger('You tried to switch windows');
      }
    };
    const onContext = (e) => {
      e.preventDefault();
      trigger('Right-click is not allowed during interview');
    };
    const onFullscreen = () => {
      if (!document.fullscreenElement) trigger('You exited fullscreen mode');
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('keydown', onKey, true);
    document.addEventListener('contextmenu', onContext);
    document.addEventListener('fullscreenchange', onFullscreen);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('keydown', onKey, true);
      document.removeEventListener('contextmenu', onContext);
      document.removeEventListener('fullscreenchange', onFullscreen);
    };
  }, [enabled, trigger]);

  const reset = () => { warningCount.current = 0; terminated.current = false; };
  return { reset };
}
