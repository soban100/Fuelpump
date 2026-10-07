import { useApp } from '../App';
import { NavLink } from 'react-router-dom';

function Sidebar() {
  const { sheets, dispatch } = useApp();

  let currentGroup = '';
  return (
    <aside>
      <div className="logo"><i>⛽</i>FuelDesk</div>
      <nav id="nav">
        {sheets.map((sheet, idx) => (
          <div key={sheet.id}>
            {sheet.g !== currentGroup && (
              <div className="grp" key={`grp-${sheet.g}`}>{sheet.g}</div>
            )}
            <NavLink
              to={`/${sheet.id}`}
              className={({ isActive }) => ` ${isActive ? 'on' : ''}`}
              onClick={() => dispatch({ type: 'SET_VIEW', payload: sheet.id })}
            >
              {sheet.name}
            </NavLink>
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;