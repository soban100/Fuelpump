import { useEffect, useRef } from 'react';
import { useApp } from '../App';

function Modal() {
  const { modal, dispatch, getSheet, data, today } = useApp();
  const dialogRef = useRef(null);

  if (!modal) return null;

  const sheet = getSheet(modal.sheetId);
  const sheetData = data[modal.sheetId] || [];
  const row = modal.rowIndex < 0 ? { d: modal.selectedDate || today } : sheetData[modal.rowIndex] || {};
  const editableCols = sheet.cols.filter(c => c.t !== 'c');

  useEffect(() => {
    dialogRef.current?.showModal();
    const firstInput = dialogRef.current?.querySelector('input');
    firstInput?.focus();
    return () => dialogRef.current?.close();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {};
    dialogRef.current?.querySelectorAll('[data-f]').forEach(input => {
      formData[input.dataset.f] = input.value;
    });
    if (!formData.d) formData.d = modal.selectedDate || today;
    if (formData.d > today) {
      alert('Aanay wali date ka data enter nahi ho sakta.');
      return;
    }
    dispatch({ 
      type: 'SAVE_FORM', 
      payload: { 
        sheetId: modal.sheetId, 
        rowIndex: modal.rowIndex, 
        values: formData 
      } 
    });
  };

  const handleCancel = () => {
    dispatch({ type: 'CLOSE_MODAL' });
  };

  return (
    <dialog ref={dialogRef} onClose={handleCancel}>
      <form onSubmit={handleSubmit}>
        <h3>{modal.rowIndex < 0 ? 'Nayi entry' : 'Entry edit karein'} · {sheet.name}</h3>
        <div className="fg">
          {editableCols.map(col => (
            <label key={col.k}>
              {col.l}
              <input
                type={col.t === 'date' ? 'date' : 'text'}
                inputMode={col.t === 'n' ? 'decimal' : undefined}
                max={col.t === 'date' ? today : undefined}
                data-f={col.k}
                value={row[col.k] ?? ''}
                required
              />
            </label>
          ))}
        </div>
        <div className="acts">
          <button type="submit" className="btn" id="sv">Save</button>
          <button type="button" className="btn o" id="cx" onClick={handleCancel}>Cancel</button>
        </div>
      </form>
    </dialog>
  );
}

export default Modal;