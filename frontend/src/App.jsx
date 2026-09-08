import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RoleGuard from './layouts/RoleGuard';

// Auth
import Login         from './auth/Login';
import Register      from './auth/Register';
import ResetPassword from './auth/ResetPassword';

// Layouts
import ManagerLayout from './layouts/ManagerLayout';
import MRLayout      from './layouts/MRLayout';

// Manager pages
import ManagerDashboard      from './pages/manager/ManagerDashboard';
import DoctorList            from './pages/doctors/DoctorList';
import ChemistList           from './pages/chemists/ChemistList';
import ManageQualifications  from './pages/manager/ManageQualifications';
import ManageSpecialisations from './pages/manager/ManageSpecialisations';
import VisitReview           from './pages/visits/VisitReview';
import TourPlanReview        from './pages/manager/TourPlanReview';
import ProductList           from './pages/products/ProductList';
import DistributionLog       from './pages/distribution/DistributionLog';
import LiveTracking          from './pages/tracking/LiveTracking';

// MR pages
import MRDashboard    from './pages/mr/MRDashboard';
import LogVisit       from './pages/visits/LogVisit';
import UploadTourPlan from './pages/mr/UploadTourPlan';
import MyDoctors      from './pages/mr/MyDoctors';
import RecordProduct  from './pages/mr/RecordProduct';
import DoctorPreference from './pages/doctorPreference/DoctorPreference';
import LocationToggle from './pages/tracking/LocationToggle';
import ProfilePage from './pages/profile/ProfilePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Auth */}
          <Route path="/login"          element={<Login />} />
          <Route path="/register"       element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Manager */}
          <Route
            path="/manager"
            element={
              <RoleGuard allowedRole="MANAGER">
                <ManagerLayout />
              </RoleGuard>
            }
          >
            <Route index                  element={<ManagerDashboard />} />
            <Route path="doctors"         element={<DoctorList />} />
            <Route path="chemists"        element={<ChemistList />} />
            <Route path="visits"          element={<VisitReview />} />
            <Route path="tour-plans"      element={<TourPlanReview />} />
            <Route path="products"        element={<ProductList />} />
            <Route path="distribution"    element={<DistributionLog />} />
            <Route path="tracking"        element={<LiveTracking />} />
            <Route path="qualifications"  element={<ManageQualifications />} />
            <Route path="specialisations" element={<ManageSpecialisations />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* MR */}
          <Route
            path="/mr"
            element={
              <RoleGuard allowedRole="MR">
                <MRLayout />
              </RoleGuard>
            }
          >
            <Route index                  element={<MRDashboard />} />
            <Route path="log-visit"       element={<LogVisit />} />
            <Route path="tour-plan"       element={<UploadTourPlan />} />
            <Route path="doctors"         element={<MyDoctors />} />
            <Route path="record-product"  element={<RecordProduct />} />
            <Route path="distribution"    element={<DistributionLog />} />
            <Route path="preference"      element={<DoctorPreference />} />
            <Route path="location"        element={<LocationToggle />} />
            <Route path="profile"         element={<ProfilePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
