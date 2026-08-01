import { useContext } from 'react';
import { PushAlarmContext } from '../context/PushAlarmContext';

export function usePushAlarm() {
  const context = useContext(PushAlarmContext);
  if (!context) {
    throw new Error('usePushAlarm must be used within a PushAlarmProvider');
  }
  return context;
}
