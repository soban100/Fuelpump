import { useApp } from '../App';
import SalesSheet from './SalesSheet';
import PurchasesSheet from './PurchasesSheet';
import ExpensesSheet from './ExpensesSheet';
import CustomersSheet from './CustomersSheet';
import LoansTakenSheet from './LoansTakenSheet';
import LoansGivenSheet from './LoansGivenSheet';

function SheetView() {
  const { currentView } = useApp();

  const sheetComponents = {
    'sales': SalesSheet,
    'purchases': PurchasesSheet,
    'expenses': ExpensesSheet,
    'customers': CustomersSheet,
    'loans-taken': LoansTakenSheet,
    'loans-given': LoansGivenSheet,
  };

  const SheetComponent = sheetComponents[currentView];
  
  if (!SheetComponent) {
    return <div className="empty">Unknown view: {currentView}</div>;
  }

  return <SheetComponent />;
}

export default SheetView;