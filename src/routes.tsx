import { Navigate } from 'react-router-dom';
import App from './App';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import Dashboard from './pages/Dashboard';
import Recent from './pages/Recent';
import Images from './pages/Images';
import Videos from './pages/Videos';
import RecycleBin from './pages/RecycleBin';
import MyShares from './pages/MyShares';

// Admin pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminFiles from './pages/admin/Files';

export const routes = [
  {
    path: '/',
    element: <App />,
    children: [
      { path: '', element: <Dashboard /> },
      { path: 'recent', element: <Recent /> },
      { path: 'images', element: <Images /> },
      { path: 'videos', element: <Videos /> },
      { path: 'recycle', element: <RecycleBin /> },
      { path: 'shares', element: <MyShares /> },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { path: '', element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'files', element: <AdminFiles /> },
    ],
  },
];
