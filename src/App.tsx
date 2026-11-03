import type { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import Report from "./pages/report";
import Search from "./pages/search";
import ItemDetail from "./pages/itemdetail";
import Notifications from "./pages/notifications";
import Admin from "./pages/admin";
import ReportFound from "./pages/reportfound";
import Claims from "./pages/claims";
import Profile from "./pages/profile";
import AdminReports from "./pages/adminreports";
import AdminClaims from "./pages/adminclaims";
import AdminUsers from "./pages/adminusers";
import AdminCategories from "./pages/admincategories";
import AdminAuditLog from "./pages/adminauditlog";
import NotFound from "./pages/notfound";
import RequireAuth from "./components/requireauth";

function Protected({ children }: { children: ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}

function AdminOnly({ children }: { children: ReactNode }) {
  return <RequireAuth role="admin">{children}</RequireAuth>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/report" element={<Protected><Report /></Protected>} />
      <Route path="/report/found" element={<Protected><ReportFound /></Protected>} />
      <Route path="/search" element={<Protected><Search /></Protected>} />
      <Route path="/items/:id" element={<Protected><ItemDetail /></Protected>} />
      <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
      <Route path="/claims" element={<Protected><Claims /></Protected>} />
      <Route path="/profile" element={<Protected><Profile /></Protected>} />
      <Route path="/admin" element={<AdminOnly><Admin /></AdminOnly>} />
      <Route path="/admin/reports" element={<AdminOnly><AdminReports /></AdminOnly>} />
      <Route path="/admin/claims" element={<AdminOnly><AdminClaims /></AdminOnly>} />
      <Route path="/admin/users" element={<AdminOnly><AdminUsers /></AdminOnly>} />
      <Route path="/admin/categories" element={<AdminOnly><AdminCategories /></AdminOnly>} />
      <Route path="/admin/audit-log" element={<AdminOnly><AdminAuditLog /></AdminOnly>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
