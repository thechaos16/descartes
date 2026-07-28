import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY = 'descartes_push_alarm_config';

export function usePushAlarm() {
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

  const [permission, setPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const timerRef = useRef(null);
  const scheduleNextAlarmRef = useRef(null);

  // Helper to save config to localStorage
  const saveConfig = (newEnabled, newTime) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled: newEnabled, time: newTime }));
    } catch (e) {
      console.error('Failed to save push alarm config:', e);
    }
  };

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

  const scheduleNextAlarm = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!enabled || permission !== 'granted') return;

    const [targetHour, targetMinute] = alarmTime.split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(targetHour, targetMinute, 0, 0);

    // If target time has already passed today, schedule for tomorrow
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }

    const msUntilTarget = target.getTime() - now.getTime();
    console.log(`[PushAlarm] Next alarm scheduled at ${target.toLocaleString()} (in ${Math.round(msUntilTarget / 60000)} minutes)`);

    timerRef.current = setTimeout(() => {
      fireNotification(false);
      // Reschedule next day's alarm
      if (scheduleNextAlarmRef.current) {
        scheduleNextAlarmRef.current();
      }
    }, msUntilTarget);
  }, [enabled, permission, alarmTime, fireNotification]);

  useEffect(() => {
    scheduleNextAlarmRef.current = scheduleNextAlarm;
  }, [scheduleNextAlarm]);

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
        saveConfig(true, alarmTime);
      } else {
        alert('Notification permission is required to enable daily alarms.');
        setEnabled(false);
        saveConfig(false, alarmTime);
      }
    } else {
      setEnabled(false);
      saveConfig(false, alarmTime);
    }
  };

  const changeAlarmTime = (newTime) => {
    setAlarmTime(newTime);
    saveConfig(enabled, newTime);
  };

  const testAlarm = async () => {
    if (permission !== 'granted') {
      const res = await requestPermission();
      if (res !== 'granted') {
        alert('Cannot send test notification: Notification permission denied or not granted.');
        return;
      }
    }
    fireNotification(true);
  };

  useEffect(() => {
    scheduleNextAlarm();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scheduleNextAlarm]);

  return {
    enabled,
    alarmTime,
    permission,
    toggleAlarm,
    changeAlarmTime,
    requestPermission,
    testAlarm
  };
}
