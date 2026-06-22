import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './shared/layout/Header';
import { Home } from './pages/Home/Home';
import { CustomerStatus } from './pages/Customer/CustomerStatus';
import { AddCustomer } from './pages/Customer/AddCustomer';
import { EditCustomer } from './pages/Customer/EditCustomer';
import { CustomerDetail } from './pages/Customer/CustomerDetail';
import { ConsultationHistory } from './pages/Consultation/ConsultationHistory';
import { ContractHistory } from './pages/Contract/ContractHistory';
import { ManagerStatus } from './pages/Manager/ManagerStatus';
import { CustomersProvider } from './app/contexts/CustomersContext';
import { ToastProvider } from './app/contexts/ToastContext';

export default function App() {
  return (
    <BrowserRouter>
      <CustomersProvider>
        <ToastProvider>
          <div className="min-h-screen bg-slate-50">
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/customer-status" element={<CustomerStatus />} />
              <Route path="/customers" element={<CustomerStatus />} />
              <Route path="/customer-status/add" element={<AddCustomer />} />
              <Route path="/customer-status/:id" element={<CustomerDetail />} />
              <Route path="/customer-detail/:id" element={<CustomerDetail />} />
              <Route path="/customer-status/:id/edit" element={<EditCustomer />} />
              <Route path="/consultation-history" element={<ConsultationHistory />} />
              <Route path="/contract-history" element={<ContractHistory />} />
              <Route path="/manager-status" element={<ManagerStatus />} />
            </Routes>
          </div>
        </ToastProvider>
      </CustomersProvider>
    </BrowserRouter>
  );
}
