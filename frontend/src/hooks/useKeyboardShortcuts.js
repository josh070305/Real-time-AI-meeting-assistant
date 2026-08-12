import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable) {
        return;
      }

      if (event.key === 'm' || event.key === 'M') {
        event.preventDefault();
        const muteBtn = document.querySelector('[data-mute-btn]');
        if (muteBtn) muteBtn.click();
      }

      if (event.key === 's' || event.key === 'S') {
        event.preventDefault();
        const stopBtn = document.querySelector('[data-stop-btn]');
        if (stopBtn) stopBtn.click();
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        navigate(-1);
      }

      if (event.key === 'd' || event.key === 'D') {
        event.preventDefault();
        navigate('/');
      }

      if (event.key === 'n' || event.key === 'N') {
        event.preventDefault();
        navigate('/live');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
}
