import { useState } from 'react';
import React from 'react';
import { useApp } from '../App';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const { sum, fmt, dispatch, sheets, today } = useApp();
  const navigate = useNavigate();

  const [petrolPrice, setPetrolPrice] = useState('');
  const [dieselPrice, setDieselPrice] = useState('');
  const [oilPrice, setOilPrice] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [originalPrices, setOriginalPrices] = useState({ petrol: '', diesel: '', oil: '' });

  const sale = sum('sales', 'a');
  const pur = sum('purchases', 'tt');
  const ex = sum('expenses', 'a');
  const owe = sum('loans-taken', 'b');
  const owed = sum('loans-given', 'b');
  const pb = sum('purchases', 'b');
  const cb = sum('customers', 'b');
  const profit = sale - pur - ex;

  const mx = Math.max(sale, pur, ex, 1);
  const bar = (label, value, color) => (
    <div className="bar" key={label}>
      <span>{label}</span>
      <div><i style={{ width: `${value / mx * 100}%`, background: color }}></i></div>
      <span>{fmt(value)}</span>
    </div>
  );

  const quickActions = sheets.filter(s => s.cols && s.id !== 'dashboard');

  const handleQuickAction = (sheetId) => {
    dispatch({ type: 'SET_VIEW', payload: sheetId });
    navigate(`/${sheetId}`);
    setTimeout(() => {
      dispatch({ type: 'ADD_ROW', payload: sheetId });
    }, 100);
  };

  const handleSavePrices = () => {
    setOriginalPrices({});
    setIsEditing(false);
  };

  const revertPrices = () => {
    setPetrolPrice(originalPrices.petrol);
    setDieselPrice(originalPrices.diesel);
    setOilPrice(originalPrices.oil);
    setIsEditing(false);
  };

  return (
    <React.Fragment>
      <div className="cards">
        <div className="card mint"><small>Total Sales</small><b>Rs {fmt(sale)}</b></div>
        <div className="card sky"><small>Total Purchases</small><b>Rs {fmt(pur)}</b></div>
        <div className="card peach"><small>Expenses</small><b>Rs {fmt(ex)}</b></div>
        <div className="card lav"><small>Profit</small><b>Rs {fmt(profit)}</b></div>
      </div>
      <div className="fuel-prices">
        <h3>Fuel & Oil Prices</h3>
        {isEditing ? (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <div className="input-container">
              <input
                type="number"
                onChange={(e) => setPetrolPrice(e.target.value)}
                value={petrolPrice}
                placeholder=" "
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  outline: 'none',
                  background: 'transparent',
                  transition: 'border-color 0.2s ease'
                }}
              />
              <label className="animated-label" style={{ left: '12px', top: '14px', color: '#999', fontSize: '16px', pointerEvents: 'none', transition: '0.2s ease all' }}>
                Petrol Price
              </label>
            </div>
            <div className="input-container">
              <input
                type="number"
                onChange={(e) => setDieselPrice(e.target.value)}
                value={dieselPrice}
                placeholder=" "
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  outline: 'none',
                  background: 'transparent',
                  transition: 'border-color 0.2s ease'
                }}
              />
              <label className="animated-label" style={{ left: '12px', top: '14px', color: '#999', fontSize: '16px', pointerEvents: 'none', transition: '0.2s ease all' }}>
                Diesel Price
              </label>
            </div>
            <div className="input-container">
              <input
                type="number"
                onChange={(e) => setOilPrice(e.target.value)}
                value={oilPrice}
                placeholder=" "
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  outline: 'none',
                  background: 'transparent',
                  transition: 'border-color 0.2s ease'
                }}
              />
              <label className="animated-label" style={{ left: '12px', top: '14px', color: '#999', fontSize: '16px', pointerEvents: 'none', transition: '0.2s ease all' }}>
                Engine Oil Price
              </label>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap' }}>Petrol Price </label>
            <input
              type="number"
              readOnly
              value={petrolPrice}
              style={{
                width: '140px',
                border: '1px solid var(--line)',
                background: 'var(--bg)',
                color: 'var(--ink)',
                borderRadius: '10px',
                padding: '9px 10px',
                font: 'inherit',
                margin: '0',
                boxSizing: 'border-box'
              }}
            />
            <label style={{ fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap' }}>Diesel Price </label>
            <input
              type="number"
              readOnly
              value={dieselPrice}
              style={{
                width: '140px',
                border: '1px solid var(--line)',
                background: 'var(--bg)',
                color: 'var(--ink)',
                borderRadius: '10px',
                padding: '9px 10px',
                font: 'inherit',
                margin: '0',
                boxSizing: 'border-box'
              }}
            />
            <label style={{ fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap' }}>Engine Oil Price </label>
            <input
              type="number"
              readOnly
              value={oilPrice}
              style={{
                width: '140px',
                border: '1px solid var(--line)',
                background: 'var(--bg)',
                color: 'var(--ink)',
                borderRadius: '10px',
                padding: '9px 10px',
                font: 'inherit',
                margin: '0',
                boxSizing: 'border-box'
              }}
            />
            <button className="edit-btn" style={{ marginLeft: '10px', width: '80px', background: 'yellow', color: 'var(--bg)', border: 'none', borderRadius: '8px', padding: '6px 12px' }} onClick={() => setIsEditing(true)}>Edit</button>
          </div>
        )}
      </div>
      <div className="two">
        <div className="box">
          <h3>Money in vs out</h3>
          {bar('Sales', sale, '#14b8a6')}
          {bar('Purchases', pur, '#3b82f6')}
          {bar('Expenses', ex, '#f59e0b')}
        </div>
        <div className="box">
          <h3>Loans & Udhaar</h3>
          <div className="cards" style={{ margin: 0 }}>
            <div className="card rose"><small>We owe</small><b>Rs {fmt(owe)}</b></div>
            <div className="card mint"><small>We are owed</small><b>Rs {fmt(owed)}</b></div>
          </div>
          <p className="hint">Supplier balance unpaid: Rs {fmt(pb)} · Customers ka baqaya: Rs {fmt(cb)}</p>
        </div>
      </div>
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="cards">
          {quickActions.map(sheet => (
            <button 
              key={sheet.id}
              className="card quick-action-card"
              onClick={() => handleQuickAction(sheet.id)}
              style={{ cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s, box-shadow 0.15s' }}
            >
              <small>{sheet.name}</small>
              <b>+ Add Entry</b>
              <p className="hint" style={{ marginTop: '8px', fontSize: '12px' }}>{sheet.sub}</p>
            </button>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
}

export default Dashboard;