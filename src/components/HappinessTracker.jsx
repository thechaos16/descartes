import { useState } from 'react';
import { Smile, Tag, PlusCircle, Calendar, Briefcase, Users, Gamepad, Sparkles, Sun, Bell, BellOff, Clock, Send, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { usePushAlarm } from '../hooks/usePushAlarm';
import './HappinessTracker.css';

const getInitialDate = () => {
  const tzOffset = new Date().getTimezoneOffset() * 60000;
  return new Date(Date.now() - tzOffset).toISOString().split('T')[0];
};

const HappinessTracker = ({ onAddEntry }) => {
  const [date, setDate] = useState(getInitialDate());
  const [moment, setMoment] = useState('');
  const [category, setCategory] = useState('other');
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    enabled,
    alarmTime,
    permission,
    toggleAlarm,
    changeAlarmTime,
    testAlarm
  } = usePushAlarm();

  const categories = [
    { id: 'work', label: 'Work & Learning', icon: Briefcase, colorVar: 'var(--label-work)' },
    { id: 'social', label: 'Relationships & Social', icon: Users, colorVar: 'var(--label-social)' },
    { id: 'leisure', label: 'Hobbies & Leisure', icon: Gamepad, colorVar: 'var(--label-leisure)' },
    { id: 'health', label: 'Self-Care & Health', icon: Sparkles, colorVar: 'var(--label-health)' },
    { id: 'nature', label: 'Nature & Environment', icon: Sun, colorVar: 'var(--label-nature)' },
    { id: 'other', label: 'Other Joy', icon: Smile, colorVar: 'var(--label-other)' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!moment.trim()) return;
    
    const timeStr = '23:30';
    const newEntry = {
      id: Date.now().toString(),
      date,
      timeStr,
      moment: moment.trim(),
      category,
      timestamp: new Date()
    };
    
    if (onAddEntry) onAddEntry(newEntry);
    
    // Clear the form except date and category
    setMoment('');
  };

  return (
    <div className="tracker-wrapper flex-col gap-6">
      {/* Alarm Settings Card (Compact by default) */}
      <div className={`glass-panel alarm-card ${isExpanded ? 'expanded' : 'compact'} animate-fade-in`}>
        <div className="alarm-card-header">
          <div className="alarm-title-group">
            <div className={`alarm-icon-badge ${enabled ? 'active' : ''}`}>
              {enabled ? <Bell size={18} /> : <BellOff size={18} />}
            </div>
            <div className="alarm-header-text">
              <span className="alarm-title-text">Daily Push Alarm</span>
              <span className={`alarm-status-pill ${enabled ? 'status-on' : 'status-off'}`}>
                {enabled ? `ON (${alarmTime})` : 'OFF'}
              </span>
            </div>
          </div>
          
          <div className="alarm-header-controls">
            <label className="switch" title="Toggle Push Alarm">
              <input 
                type="checkbox" 
                checked={enabled} 
                onChange={(e) => toggleAlarm(e.target.checked)} 
              />
              <span className="slider round"></span>
            </label>

            <button 
              type="button"
              className="alarm-expand-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Collapse alarm details' : 'Expand alarm settings'}
              aria-expanded={isExpanded}
            >
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="alarm-card-body animate-fade-in">
            <p className="alarm-subtitle">
              Receive a daily push notification every day at <strong>{alarmTime}</strong> to log your day's happy moments.
            </p>

            <div className="alarm-setting-row">
              <div className="alarm-time-picker">
                <Clock size={16} />
                <label htmlFor="alarm-time-select">Alert Time:</label>
                <input 
                  id="alarm-time-select"
                  type="time" 
                  className="input-field alarm-time-input"
                  value={alarmTime}
                  onChange={(e) => changeAlarmTime(e.target.value)}
                />
              </div>

              <div className="permission-badge">
                {permission === 'granted' && (
                  <span className="badge badge-success">
                    <CheckCircle2 size={13} /> Push Permission Granted
                  </span>
                )}
                {permission === 'denied' && (
                  <span className="badge badge-warning" title="Please enable notifications in your browser settings">
                    <AlertCircle size={13} /> Permission Denied
                  </span>
                )}
                {permission === 'default' && (
                  <span className="badge badge-info">
                    <AlertCircle size={13} /> Permission Prompt Required
                  </span>
                )}
              </div>
            </div>

            <div className="alarm-actions">
              <button 
                type="button" 
                className="btn-secondary test-alarm-btn"
                onClick={testAlarm}
              >
                <Send size={15} /> Send Test Alert Now
              </button>
            </div>
          </div>
        )}
      </div>


      {/* Main Happiness Entry Form */}
      <div className="glass-panel tracker-card animate-fade-in">
        <div className="tracker-header">
          <div className="icon-wrapper happiness-icon-wrapper">
            <Smile size={24} color="var(--accent-primary)" />
          </div>
          <h2>Capture Your Happiness</h2>
          <p className="subtitle">Log the happiest moment of your day.</p>
        </div>

        <form onSubmit={handleSubmit} className="tracker-form">
          <div className="form-group">
            <label>
              <Calendar size={16} /> Date
            </label>
            <input 
              type="date" 
              className="input-field date-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="moment-input">
              <Smile size={16} /> What made you happy?
            </label>
            <textarea 
              id="moment-input"
              className="input-field textarea-field" 
              placeholder="e.g. Took a long walk in the park during lunchtime and saw the cherry blossoms in full bloom."
              value={moment}
              onChange={(e) => setMoment(e.target.value)}
              required
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>
              <Tag size={16} /> Category
            </label>
            <div className="categories-grid">
              {/* eslint-disable-next-line no-unused-vars */}
              {categories.map(({ id, label, icon: IconComponent, colorVar }) => {
                const isSelected = category === id;
                return (
                  <button
                    type="button"
                    key={id}
                    className={`category-chip ${isSelected ? 'selected' : ''}`}
                    style={{
                      '--cat-color': colorVar,
                      backgroundColor: isSelected ? 'var(--cat-color)' : 'rgba(255,255,255,0.02)',
                      color: isSelected ? '#000' : 'var(--text-secondary)',
                      borderColor: isSelected ? 'var(--cat-color)' : 'var(--border-color)',
                    }}
                    onClick={() => setCategory(id)}
                  >
                    <IconComponent size={14} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary submit-btn"
            disabled={!moment.trim()}
          >
            <PlusCircle size={18} /> Record Moment
          </button>
        </form>
      </div>
    </div>
  );
};

export default HappinessTracker;

