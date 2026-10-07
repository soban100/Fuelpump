import { useEffect, useReducer, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import SheetView from './views/SheetView';
import DateBar from './components/DateBar';
import Modal from './components/Modal';
import './App.css';

const STORAGE_KEY = 'fueldesk-v4';

const SHEETS = [
  { id: 'dashboard', name: 'Dashboard', sub: 'Your station at a glance', g: 'Overview' },
  { id: 'sales', name: 'Sales', sub: 'Daily fuel sales by nozzle', g: 'Operations', cols: [
    { k: 'd', l: 'Date', t: 'date' },
    { k: 'f', l: 'Fuel', t: 'text' },
    { k: 'o', l: 'Opening Reading', t: 'n' },
    { k: 'c', l: 'Closing Reading', t: 'n' },
    { k: 'lt', l: 'Litres', t: 'c', f: r => N(r.c) - N(r.o), sum: true },
    { k: 'rt', l: 'Rate', t: 'n' },
    { k: 'a', l: 'Amount', t: 'c', f: r => (N(r.c) - N(r.o)) * N(r.rt), sum: true },
  ], demo: [
    { d: today(), f: 'Petrol', o: 120000, c: 120450, rt: 275 },
    { d: today(), f: 'Diesel', o: 98000, c: 98320, rt: 283 },
    { d: ago(1), f: 'Petrol', o: 119500, c: 120000, rt: 275 },
    { d: ago(2), f: 'Diesel', o: 97600, c: 98000, rt: 281 },
  ]},
  { id: 'purchases', name: 'Purchases', sub: 'Fuel bought from suppliers', g: 'Operations', cols: [
    { k: 'd', l: 'Date', t: 'date' },
    { k: 'p', l: 'Supplier', t: 'text' },
    { k: 'f', l: 'Fuel', t: 'text' },
    { k: 'lt', l: 'Litres', t: 'n', sum: true },
    { k: 'rt', l: 'Rate', t: 'n' },
    { k: 'tt', l: 'Total', t: 'c', f: r => N(r.lt) * N(r.rt), sum: true },
    { k: 'pd', l: 'Paid', t: 'n', sum: true },
    { k: 'b', l: 'Balance', t: 'c', f: r => N(r.lt) * N(r.rt) - N(r.pd), sum: true },
  ], demo: [
    { d: today(), p: 'PSO Depot', f: 'Petrol', lt: 5000, rt: 262, pd: 1000000 },
    { d: ago(2), p: 'Shell Depot', f: 'Diesel', lt: 3000, rt: 270, pd: 810000 },
  ]},
  { id: 'expenses', name: 'Expenses', sub: 'Running costs of the station', g: 'Operations', cols: [
    { k: 'd', l: 'Date', t: 'date' },
    { k: 'w', l: 'Description', t: 'text' },
    { k: 'a', l: 'Amount', t: 'n', sum: true },
  ], demo: [
    { d: today(), w: 'Electricity bill', a: 25000 },
    { d: today(), w: 'Staff salaries', a: 60000 },
    { d: ago(1), w: 'Generator diesel', a: 12000 },
  ]},
  { id: 'customers', name: 'Customers', sub: 'Customer-wise fuel sales and udhaar (credit) details', g: 'Customers', cols: [
    { k: 'd', l: 'Date', t: 'date' },
    { k: 'n', l: 'Customer Name', t: 'text' },
    { k: 'ph', l: 'Phone', t: 'text' },
    { k: 'f', l: 'Fuel', t: 'text' },
    { k: 'lt', l: 'Litres', t: 'n', sum: true },
    { k: 'rt', l: 'Rate', t: 'n' },
    { k: 'tt', l: 'Total', t: 'c', f: r => N(r.lt) * N(r.rt), sum: true },
    { k: 'pd', l: 'Paid', t: 'n', sum: true },
    { k: 'b', l: 'Balance', t: 'c', f: r => N(r.lt) * N(r.rt) - N(r.pd), sum: true },
  ], demo: [
    { d: today(), n: 'Hamid', ph: '0300-1234567', f: 'Petrol', lt: 40, rt: 275, pd: 5000 },
    { d: ago(1), n: 'Bilal', ph: '0311-7654321', f: 'Diesel', lt: 60, rt: 283, pd: 0 },
  ]},
  { id: 'loans-taken', name: 'Loans Taken', sub: 'Money we borrowed and still need to repay', g: 'Loans', cols: [
    { k: 'd', l: 'Date', t: 'date' },
    { k: 'p', l: 'Borrowed From', t: 'text' },
    { k: 'w', l: 'Note', t: 'text' },
    { k: 'a', l: 'Amount Taken', t: 'n', sum: true },
    { k: 'r', l: 'Repaid', t: 'n', sum: true },
    { k: 'b', l: 'We Owe', t: 'c', f: r => N(r.a) - N(r.r), sum: true },
  ], demo: [
    { d: today(), p: 'Ahmad Ali', w: 'Tank payment', a: 500000, r: 200000 },
    { d: ago(2), p: 'Usman', w: 'Cash', a: 100000, r: 0 },
  ]},
  { id: 'loans-given', name: 'Loans Given', sub: 'Money we lent and still need to collect', g: 'Loans', cols: [
    { k: 'd', l: 'Date', t: 'date' },
    { k: 'p', l: 'Lent To', t: 'text' },
    { k: 'w', l: 'Note', t: 'text' },
    { k: 'a', l: 'Amount Given', t: 'n', sum: true },
    { k: 'r', l: 'Received Back', t: 'n', sum: true },
    { k: 'b', l: 'We Are Owed', t: 'c', f: r => N(r.a) - N(r.r), sum: true },
  ], demo: [
    { d: today(), p: 'Hamid (customer)', w: 'Fuel on credit', a: 80000, r: 30000 },
    { d: ago(1), p: 'Bilal (customer)', w: 'Fuel on credit', a: 16980, r: 0 },
  ]},
];

function today() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function ago(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function N(v) {
  return parseFloat(v) || 0;
}

function fmt(v) {
  return Math.round(v).toLocaleString('en-US');
}

function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  const initial = {};
  SHEETS.forEach(s => {
    if (s.cols && s.demo) {
      initial[s.id] = JSON.parse(JSON.stringify(s.demo));
    }
  });
  return initial;
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
}

const initialState = {
  data: loadData(),
  selectedDate: today(),
  calMonth: { y: new Date().getFullYear(), m: new Date().getMonth() },
  calOpen: false,
  currentView: 'dashboard',
  modal: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_DATE': {
      const d = action.payload;
      if (d > today()) return { ...state, selectedDate: today() };
      return { ...state, selectedDate: d, calMonth: d ? { y: +d.slice(0, 4), m: +d.slice(5, 7) - 1 } : state.calMonth };
    }
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'TOGGLE_CAL':
      return { ...state, calOpen: !state.calOpen };
    case 'SET_CAL_MONTH': {
      const { y, m } = action.payload;
      if (m < 0) return { ...state, calMonth: { y: y - 1, m: 11 } };
      if (m > 11) return { ...state, calMonth: { y: y + 1, m: 0 } };
      const maxMonth = new Date(today()).getMonth();
      const maxYear = new Date(today()).getFullYear();
      if (y > maxYear || (y === maxYear && m > maxMonth)) return state;
      return { ...state, calMonth: { y, m } };
    }
    case 'OPEN_MODAL':
      return { ...state, modal: action.payload };
    case 'CLOSE_MODAL':
      return { ...state, modal: null };
    case 'UPDATE_CELL': {
      const { sheetId, rowIndex, key, value } = action.payload;
      const newData = { ...state.data };
      newData[sheetId] = [...newData[sheetId]];
      newData[sheetId][rowIndex] = { ...newData[sheetId][rowIndex], [key]: value };
      const sheet = SHEETS.find(s => s.id === sheetId);
      sheet.cols.filter(c => c.t === 'c').forEach(c => {
        newData[sheetId][rowIndex][c.k] = c.f(newData[sheetId][rowIndex]);
      });
      saveData(newData);
      return { ...state, data: newData };
    }
    case 'ADD_ROW': {
      const sheet = SHEETS.find(s => s.id === action.payload);
      const newRow = { d: state.selectedDate || today() };
      if (sheet) {
        sheet.cols.filter(c => c.t !== 'c').forEach(c => {
          newRow[c.k] = '';
        });
      }
      const newData = { ...state.data };
      newData[action.payload] = [...newData[action.payload], newRow];
      saveData(newData);
      return { ...state, data: newData };
    }
    case 'DELETE_ROW': {
      const { sheetId, rowIndex } = action.payload;
      const newData = { ...state.data };
      newData[sheetId] = newData[sheetId].filter((_, i) => i !== rowIndex);
      saveData(newData);
      return { ...state, data: newData };
    }
    case 'SAVE_FORM': {
      const { sheetId, rowIndex, values } = action.payload;
      const newData = { ...state.data };
      newData[sheetId] = [...newData[sheetId]];
      const newRow = { ...values };
      if (!newRow.d) newRow.d = state.selectedDate || today();
      if (newRow.d > today()) return state;
      if (rowIndex < 0) {
        newData[sheetId].push(newRow);
      } else {
        newData[sheetId][rowIndex] = newRow;
      }
      const sheet = SHEETS.find(s => s.id === sheetId);
      sheet.cols.filter(c => c.t === 'c').forEach(c => {
        newData[sheetId][rowIndex < 0 ? newData[sheetId].length - 1 : rowIndex][c.k] = c.f(newData[sheetId][rowIndex < 0 ? newData[sheetId].length - 1 : rowIndex]);
      });
      saveData(newData);
      return { ...state, data: newData, modal: null };
    }
    case 'CLEAR_SHEET': {
      const newData = { ...state.data };
      newData[action.payload] = [];
      saveData(newData);
      return { ...state, data: newData };
    }
    case 'TOGGLE_THEME': {
      const root = document.documentElement;
      const isDark = root.dataset.theme === 'dark';
      root.dataset.theme = isDark ? 'light' : 'dark';
      return state;
    }
    default:
      return state;
  }
}

const AppContext = createContext();

export function useApp() {
  return useContext(AppContext);
}

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = {
    ...state,
    dispatch,
    sheets: SHEETS,
    today: today(),
    fmt,
    N,
    getSheet: (id) => SHEETS.find(s => s.id === id),
    getRows: (id) => {
      const sel = state.selectedDate;
      return state.data[id]?.map((r, i) => ({ r, originalIndex: i })).filter(x => !sel || x.r.d === sel) || [];
    },
    sum: (id, key) => {
      const sheet = SHEETS.find(s => s.id === id);
      const col = sheet?.cols.find(c => c.k === key);
      if (!col) return 0;
      const rows = state.data[id]?.map((r, i) => ({ r, i })).filter(x => !state.selectedDate || x.r.d === state.selectedDate) || [];
      return rows.reduce((t, x) => t + (col.t === 'c' ? col.f(x.r) : N(x.r[key])), 0);
    },
    exportCSV: (sheetId) => {
      const sheet = SHEETS.find(s => s.id === sheetId);
      const sel = state.selectedDate;
      const rows = state.data[sheetId]?.map((r, i) => ({ r, i })).filter(x => !sel || x.r.d === sel) || [];
      const q = x => '"' + String(x).replace(/"/g, '""') + '"';
      const lines = [sheet.cols.map(c => q(c.l)).join(',')].concat(
        rows.map(x => sheet.cols.map(c => q(c.t === 'c' ? c.f(x.r) : (x.r[c.k] ?? ''))).join(','))
      );
      const csv = '\ufeff' + lines.join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = sheetId + (sel ? '-' + sel : '') + '.csv';
      a.click();
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function AppContent() {
  const { currentView, dispatch, exportCSV } = useApp();

  const view = SHEETS.find(s => s.id === currentView);

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <div className="top">
          <div>
            <h1 id="ttl">{view?.name || 'Dashboard'}</h1>
            <p id="sub">{view?.sub || ''}</p>
          </div>
          <div className="acts">
            {currentView === 'dashboard' ? (
              <button className="btn o" onClick={() => dispatch({ type: 'TOGGLE_THEME' })}>Dark / Light</button>
            ) : (
              <>
                <button className="btn" onClick={() => dispatch({ type: 'ADD_ROW', payload: currentView })}>+ Add row</button>
                <button className="btn o" onClick={() => exportCSV(currentView)}>Export to Excel</button>
                <button className="btn o" onClick={() => {
                  if (confirm('Is sheet ki saari rows delete karni hain?')) {
                    dispatch({ type: 'CLEAR_SHEET', payload: currentView });
                  }
                }}>Clear sheet</button>
                <button className="btn o" onClick={() => dispatch({ type: 'TOGGLE_THEME' })}>Dark / Light</button>
              </>
            )}
          </div>
        </div>
        <DateBar />
        <div id="view">
          {currentView === 'dashboard' ? <Dashboard /> : <SheetView />}
        </div>
      </main>
      <Modal />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </Router>
  );
}

export default App;