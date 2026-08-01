import { useState, useEffect, useRef, useCallback } from 'react';
import { PushAlarmContext } from './PushAlarmContext';

const STORAGE_KEY = 'descartes_push_alarm_config';

export function PushAlarmProvider({ children }) {
  const [enabled, setEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.enabled ?? false;
      }
    } catch (e) {
      console.error('Failed to read push alarm config:', e);
    }
    return false;
  });

  const [alarmTime, setAlarmTime] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.time || '23:00';
      }
    } catch (e) {
      console.error('Failed to read push alarm time:', e);
    }
    return '23:00';
  });

  const [lastFiredDate, setLastFiredDate] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.lastFiredDate || null;
      }
    } catch (e) {
      console.error('Failed to read push alarm lastFiredDate:', e);
    }
    return null;
  });

  const [permission, setPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const timerRef = useRef(null);

  // Helper to save config to localStorage
  const saveConfig = (newEnabled, newTime, newLastFired) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        enabled: newEnabled,
        time: newTime,
        lastFiredDate: newLastFired
      }));
    } catch (e) {
      console.error('Failed to save push alarm config:', e);
    }
  };

  // Listen for storage changes from other browser tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (typeof parsed.enabled === 'boolean') setEnabled(parsed.enabled);
          if (parsed.time) setAlarmTime(parsed.time);
          if (parsed.lastFiredDate !== undefined) setLastFiredDate(parsed.lastFiredDate);
        } catch (err) {
          console.error('Error handling storage change for push alarm:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const fireNotification = useCallback((isTest = false) => {
    const title = isTest ? '🔔 Test Happiness Reminder' : '😊 Daily Happiness Log Reminder';
    const body = isTest 
      ? `Push alarms are active! You will receive daily reminders at ${alarmTime}.`
      : 'Time to record what made you happy today! Take a moment to reflect ✨';

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/pwa-192x192.png',
          tag: 'happiness-daily-reminder',
          renotify: true
        });
      } catch (err) {
        console.warn('Direct notification failed, trying ServiceWorker registration if available:', err);
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
              body,
              icon: '/pwa-192x192.png',
              tag: 'happiness-daily-reminder'
            });
          }).catch(console.error);
        }
      }
    }
  }, [alarmTime]);

  const scheduleAndCheck = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!enabled || permission !== 'granted' || !alarmTime) return;

    const [targetHour, targetMinute] = alarmTime.split(':').map(Number);
    if (isNaN(targetHour) || isNaN(targetMinute)) return;

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Target date for next alarm
    const nextTarget = new Date(now);
    nextTarget.setHours(targetHour, targetMinute, 0, 0);

    const currentFiredDate = lastFiredDate;
    if (nextTarget.getTime() <= now.getTime() || currentFiredDate === todayStr) {
      if (nextTarget.getTime() <= now.getTime() && currentFiredDate !== todayStr) {
        const timeDiffMinutes = (now.getTime() - nextTarget.getTime()) / 60000;
        if (timeDiffMinutes <= 60) {
          fireNotification(false);
        }
        setTimeout(() => {
          setLastFiredDate(todayStr);
          saveConfig(enabled, alarmTime, todayStr);
        }, 0);
      }
      nextTarget.setDate(nextTarget.getDate() + 1);
      nextTarget.setHours(targetHour, targetMinute, 0, 0);
    }

    const msUntilTarget = nextTarget.getTime() - now.getTime();
    console.log(`[PushAlarm] Next alarm scheduled at ${nextTarget.toLocaleString()} (in ${Math.round(msUntilTarget / 60000)} minutes)`);

    timerRef.current = setTimeout(() => {
      fireNotification(false);
      const firedNow = new Date();
      const firedTodayStr = `${firedNow.getFullYear()}-${String(firedNow.getMonth() + 1).padStart(2, '0')}-${String(firedNow.getDate()).padStart(2, '0')}`;
      setLastFiredDate(firedTodayStr);
      saveConfig(enabled, alarmTime, firedTodayStr);
    }, msUntilTarget);
  }, [enabled, permission, alarmTime, lastFiredDate, fireNotification]);

  // Main lifecycle effect for timer & periodic checks
  useEffect(() => {
    scheduleAndCheck();

    // Check every 15 seconds to catch system wake/time drift
    const intervalId = setInterval(() => {
      scheduleAndCheck();
    }, 15000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        scheduleAndCheck();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [scheduleAndCheck]);

  // Request browser notification permission
  const requestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Browser notifications are not supported by your browser.');
      return 'unsupported';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (e) {
      console.error('Permission request failed:', e);
      return Notification.permission;
    }
  };

  const toggleAlarm = async (shouldEnable) => {
    if (shouldEnable) {
      let currentPermission = permission;
      if (currentPermission !== 'granted') {
        currentPermission = await requestPermission();
      }
      if (currentPermission === 'granted') {
        setEnabled(true);
        saveConfig(true, alarmTime, lastFiredDate);
      } else {
        alert('Notification permission is required to enable daily alarms.');
        setEnabled(false);
        saveConfig(false, alarmTime, lastFiredDate);
      }
    } else {
      setEnabled(false);
      saveConfig(false, alarmTime, lastFiredDate);
    }
  };

  const changeAlarmTime = (newTime) => {
    setAlarmTime(newTime);
    setLastFiredDate(null);
    saveConfig(enabled, newTime, null);
  };

  const testAlarm = async () => {
    let currentPermission = permission;
    if (currentPermission !== 'granted') {
      currentPermission = await requestPermission();
      if (currentPermission !== 'granted') {
        alert('Cannot send test notification: Notification permission denied or not granted.');
        return;
      }
    }
    fireNotification(true);
  };

  const value = {
    enabled,
    alarmTime,
    permission,
    toggleAlarm,
    changeAlarmTime,
    requestPermission,
    testAlarm
  };

  return (
    <PushAlarmContext.Provider value={value}>
      {children}
    </PushAlarmContext.Provider>
  );
}
