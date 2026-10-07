import { useState, useRef } from 'react';
import { useApp } from '../App';

function SheetContent({ 
  currentView, 
  sheet, 
  rows, 
  sheetData, 
  editableKeys, 
  today, 
  sum, 
  fmt, 
  dispatch 
}) {
  const [editingRow, setEditingRow] = useState(null);
  const [originalValues, setOriginalValues] = useState({});
  const editingRowRef = useRef(null);
  const tbodyRef = useRef(null);

  const handleInput = (e) => {
    const target = e.target;
    const tr = target.closest('tr');
    const rowIndex = +tr.dataset.i;
    const key = target.dataset.k;
    const value = target.value;

    if (key === 'd' && value > today) {
      alert('Aanay wali date ka data enter nahi ho sakta.');
      const correctedValue = sheetData[rowIndex]?.d || today;
      target.value = correctedValue;
      dispatch({ type: 'UPDATE_CELL', payload: { sheetId: currentView, rowIndex, key, value: correctedValue } });
      return;
    }

    if (editingRow !== rowIndex) {
      const currentRow = sheetData[rowIndex] || {};
      const snapshot = {};
      editableKeys.forEach(k => {
        snapshot[k] = currentRow[k] ?? '';
      });
      setOriginalValues(snapshot);
      setEditingRow(rowIndex);
      editingRowRef.current = rowIndex;
    }

    dispatch({ type: 'UPDATE_CELL', payload: { sheetId: currentView, rowIndex, key, value } });
  };

  const handleBlur = (e) => {
    const tr = e.target.closest('tr');
    const rowIndex = +tr.dataset.i;
    if (editingRowRef.current === rowIndex) {
      setTimeout(() => {
        if (editingRowRef.current === rowIndex) {
          revertRow(rowIndex);
          setEditingRow(null);
          editingRowRef.current = null;
        }
      }, 100);
    }
  };

  const handleSave = (rowIndex) => {
    setOriginalValues({});
    setEditingRow(null);
    editingRowRef.current = null;
  };

  const revertRow = (rowIndex) => {
    const original = originalValues;
    if (Object.keys(original).length > 0) {
      Object.entries(original).forEach(([key, value]) => {
        dispatch({ type: 'UPDATE_CELL', payload: { sheetId: currentView, rowIndex, key, value } });
      });
      setOriginalValues({});
    }
  };

  const handleClick = (e) => {
    const target = e.target;
    if (target.dataset.del !== undefined) {
      if (confirm('Ye entry delete karni hai?')) {
        dispatch({ type: 'DELETE_ROW', payload: { sheetId: currentView, rowIndex: +target.dataset.del } });
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.target.tagName !== 'INPUT') return;
    const tr = e.target.closest('tr');
    const inputs = [...tr.querySelectorAll('input[data-k]')].filter(inp => editableKeys.includes(inp.dataset.k));
    const cellIndex = inputs.indexOf(e.target);
    const rowIndex = +tr.dataset.i;

    if (e.key === 'Enter') {
      e.preventDefault();
      if (cellIndex < inputs.length - 1) {
        inputs[cellIndex + 1].focus();
        inputs[cellIndex + 1].select();
      } else {
        // Save the current cell value
        const currentInput = inputs[cellIndex];
        const currentKey = currentInput?.dataset?.k;
        const currentValue = currentInput?.value ?? '';
        if (currentKey) {
          dispatch({ type: 'UPDATE_CELL', payload: { sheetId: currentView, rowIndex, key: currentKey, value: currentValue } });
        }
        handleSave(rowIndex);
      }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cellIndex < inputs.length - 1) {
        inputs[cellIndex + 1].focus();
        inputs[cellIndex + 1].select();
      } else {
        const nextRow = tr.nextElementSibling;
        if (nextRow) {
          const nextInputs = [...nextRow.querySelectorAll('input[data-k]')].filter(inp => editableKeys.includes(inp.dataset.k));
          if (nextInputs[0]) nextInputs[0].focus();
        }
      }
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cellIndex > 0) {
        inputs[cellIndex - 1].focus();
        inputs[cellIndex - 1].select();
      } else {
        const prevRow = tr.previousElementSibling;
        if (prevRow) {
          const prevInputs = [...prevRow.querySelectorAll('input[data-k]')].filter(inp => editableKeys.includes(inp.dataset.k));
          if (prevInputs[prevInputs.length - 1]) prevInputs[prevInputs.length - 1].focus();
        }
      }
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (cellIndex < inputs.length - 1) {
        inputs[cellIndex + 1].focus();
        inputs[cellIndex + 1].select();
      }
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (cellIndex > 0) {
        inputs[cellIndex - 1].focus();
        inputs[cellIndex - 1].select();
      }
    }
    if (e.key === 'Escape') {
      revertRow(rowIndex);
      setEditingRow(null);
      editingRowRef.current = null;
      e.target.blur();
    }
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (cellIndex > 0) {
          e.preventDefault();
          inputs[cellIndex - 1].focus();
          inputs[cellIndex - 1].select();
        }
      } else {
        if (cellIndex < inputs.length - 1) {
          e.preventDefault();
          inputs[cellIndex + 1].focus();
          inputs[cellIndex + 1].select();
        } else {
          const currentInput = inputs[cellIndex];
          const currentKey = currentInput?.dataset?.k;
          const currentValue = currentInput?.value ?? '';
          if (currentKey) {
            dispatch({ type: 'UPDATE_CELL', payload: { sheetId: currentView, rowIndex, key: currentKey, value: currentValue } });
          }
          handleSave(rowIndex);
        }
      }
    }
  };

  const renderRow = (rowData, index) => {
    const { r, originalIndex } = rowData;
    const isEditing = editingRow === originalIndex;
    return (
      <tr key={originalIndex} data-i={originalIndex}>
        <td className="i">{index + 1}</td>
        {sheet.cols.map(col => (
          <td key={col.k} className={col.t === 'c' ? 'c' : ''}>
            {col.t === 'c' ? (
              <input
                className="n"
                readOnly
                tabIndex="-1"
                data-c={col.k}
                value={fmt(col.f(r))}
              />
            ) : (
              <input
                type={col.t === 'date' ? 'date' : 'text'}
                className={col.t === 'n' ? 'n' : ''}
                inputMode={col.t === 'n' ? 'decimal' : undefined}
                max={col.t === 'date' ? today : undefined}
                data-k={col.k}
                value={r[col.k] ?? ''}
                onChange={handleInput}
                onBlur={handleBlur}
              />
            )}
          </td>
        ))}
        <td className="x">
          {isEditing && (
            <button 
              className="undo-btn" 
              title="Undo changes" 
              aria-label="Undo changes"
              onClick={() => { revertRow(originalIndex); setEditingRow(null); editingRowRef.current = null; }}
            >↶</button>
          )}
          <button data-del={originalIndex} title="Delete" aria-label="Delete entry">✕</button>
        </td>
      </tr>
    );
  };

  const renderTotals = () => {
    return sheet.cols.map(col => {
      if (!col.sum) return <td key={col.k} data-s={col.k}></td>;
      return <td key={col.k} data-s={col.k}>{col === sheet.cols[0] ? 'Total' : ''} {fmt(sum(currentView, col.k))}</td>;
    });
  };

  const emptyMessage = rows.length === 0 
    ? (today ? `${today} ka koi record nahi. "+ Add entry" dabayein.` : 'Koi record nahi. "+ Add entry" dabayein.')
    : null;

  return (
    <>
      <div className="wrap">
        <table>
          <thead>
            <tr>
              <th></th>
              {sheet.cols.map(col => <th key={col.k}>{col.l}</th>)}
              <th></th>
            </tr>
          </thead>
          <tbody ref={tbodyRef} onInput={handleInput} onClick={handleClick} onKeyDown={handleKeyDown}>
            {rows.length > 0 ? rows.map(renderRow) : (
              <tr>
                <td className="empty" colSpan={sheet.cols.length + 2}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td></td>
              {renderTotals()}
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="hint">
        Excel ki tarah: cell par click karke type karein. Enter/Tab se agle column jayein, Arrow keys se navigate karein. Aakhri column par Enter se row save hoti hai. Escape se changes undo. ✕ se delete. Aanay wali date ka data enter nahi ho sakta.
      </p>
    </>
  );
}

export function createSheetComponent(sheetId) {
  function SheetWrapper() {
    const { currentView, getSheet, getRows, sum, fmt, dispatch, today, data } = useApp();
    
    const sheet = getSheet(currentView);
    const rows = getRows(currentView);
    const sheetData = data[currentView] || [];
    const editableCols = sheet.cols.filter(c => c.t !== 'c');
    const editableKeys = editableCols.map(c => c.k);

    return (
      <SheetContent
        sheet={sheet}
        rows={rows}
        sheetData={sheetData}
        editableKeys={editableKeys}
        currentView={currentView}
        today={today}
        sum={sum}
        fmt={fmt}
        dispatch={dispatch}
      />
    );
  }
  
  SheetWrapper.displayName = `${sheetId}Sheet`;
  return SheetWrapper;
}

export { SheetContent };