import { useEffect, useRef } from 'react';
import { useApp } from '../App';

function DateBar() {
  const { selectedDate, calOpen, calMonth, dispatch, today, sheets, data, currentView } = useApp();
  const dpRef = useRef(null);

  const usedDates = new Set();
  const sheetsToCheck = currentView === 'dashboard' 
    ? sheets.filter(s => s.cols).map(s => s.id) 
    : [currentView];
  
  sheetsToCheck.forEach(id => {
    data[id]?.forEach(r => r.d && usedDates.add(r.d));
  });

  const firstDay = new Date(calMonth.y, calMonth.m, 1).getDay();
  const daysInMonth = new Date(calMonth.y, calMonth.m + 1, 0).getDate();
  const monthName = new Date(calMonth.y, calMonth.m, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const label = selectedDate 
    ? new Date(selectedDate + 'T00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : 'Saari dates (All)';

  const handleAction = (action) => {
    switch (action) {
      case 'pv':
        shiftDate(-1);
        break;
      case 'nx':
        shiftDate(1);
        break;
      case 'td':
        dispatch({ type: 'SET_DATE', payload: today });
        break;
      case 'al':
        dispatch({ type: 'SET_DATE', payload: '' });
        break;
      case 'cb':
        dispatch({ type: 'TOGGLE_CAL' });
        break;
      case 'pm':
        dispatch({ type: 'SET_CAL_MONTH', payload: { y: calMonth.y, m: calMonth.m - 1 } });
        break;
      case 'nm':
        dispatch({ type: 'SET_CAL_MONTH', payload: { y: calMonth.y, m: calMonth.m + 1 } });
        break;
    }
  };

  const shiftDate = (n) => {
    const base = selectedDate || today;
    const d = new Date(base + 'T00:00');
    d.setDate(d.getDate() + n);
    const iso = d.toISOString().slice(0, 10);
    if (iso > today) return;
    dispatch({ type: 'SET_DATE', payload: iso });
  };

  const handleDayClick = (day) => {
    const dateStr = `${calMonth.y}-${String(calMonth.m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (dateStr > today) return;
    dispatch({ type: 'SET_DATE', payload: dateStr });
  };

  const handleDateChange = (e) => {
    dispatch({ type: 'SET_DATE', payload: e.target.value });
  };

  useEffect(() => {
    if (dpRef.current && selectedDate) {
      dpRef.current.value = selectedDate;
    }
  }, [selectedDate]);

  const calButtons = [];
  for (let i = 0; i < firstDay; i++) {
    calButtons.push(<span key={`empty-${i}`}></span>);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calMonth.y}-${String(calMonth.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isFuture = dateStr > today;
    const hasData = usedDates.has(dateStr);
    const isToday = dateStr === today;
    const isSelected = dateStr === selectedDate;
    
    calButtons.push(
      <button
        key={dateStr}
        data-day={dateStr}
        disabled={isFuture}
        className={`${hasData ? 'has ' : ''}${isToday ? 'td ' : ''}${isSelected ? 'on' : ''}`}
        onClick={() => handleDayClick(d)}
      >
        {d}
      </button>
    );
  }

  return (
    <>
      <div className="dbar">
        <button className="btn o s" data-a="pv" aria-label="Previous day" onClick={() => handleAction('pv')}>◀</button>
        <input 
          type="date" 
          id="dp" 
          ref={dpRef}
          max={today} 
          value={selectedDate || ''} 
          onChange={handleDateChange}
        />
        <button className="btn o s" data-a="nx" aria-label="Next day" onClick={() => handleAction('nx')}>▶</button>
        <button className="btn o s" data-a="td" onClick={() => handleAction('td')}>Aaj</button>
        <button className="btn o s" data-a="al" onClick={() => handleAction('al')}>Sab dates</button>
        <button className="btn s" data-a="cb" onClick={() => handleAction('cb')}>📅 Calendar</button>
        <b>{label}</b>
      </div>
      {calOpen && (
        <div className="cal">
          <div className="hd">
            <button className="btn o s" data-a="pm" onClick={() => handleAction('pm')}>◀</button>
            <span>{monthName}</span>
            <button className="btn o s" data-a="nm" onClick={() => handleAction('nm')}>▶</button>
          </div>
          <div className="cg">
            <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
            {calButtons}
          </div>
          <p className="hint">Orange dot = us din ka data maujood hai.</p>
        </div>
      )}
    </>
  );
}

export default DateBar;