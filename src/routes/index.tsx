import { Navigate } from 'react-router-dom';
import Dashboard from "@/pages/Dashboard";
import LoginPage from "@/pages/Login";
import RegisterPage from "@/pages/Register";
import RecycleBin from "@/pages/RecycleBin";
import MyShares from "@/pages/MyShares";
import ShareAccess from "@/pages/ShareAccess";
import FilePreview from "@/pages/FilePreview";
import Recent from "@/pages/Recent";
import Images from "@/pages/Images";
import Videos from "@/pages/Videos";

// 路由保护组件
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// 路由配置
export const routes = [
  {
    path: '/login',
    element: <LoginPage />,
    meta: { title: '登录', public: true }
  },
  {
    path: '/register',
    element: <RegisterPage />,
    meta: { title: '注册', public: true }
  },
  {
    path: '/reset-password',
    element: <LoginPage />,
    meta: { title: '重置密码', public: true }
  },
  {
    path: '/s/:code',
    element: <ShareAccess />,
    meta: { title: '分享访问', public: true }
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    meta: { title: '我的文件', protected: true }
  },
  {
    path: '/preview/:id',
    element: (
      <ProtectedRoute>
        <FilePreview />
      </ProtectedRoute>
    ),
    meta: { title: '文件预览', protected: true }
  },
  {
    path: '/shares',
    element: (
      <ProtectedRoute>
        <MyShares />
      </ProtectedRoute>
    ),
    meta: { title: '我的分享', protected: true }
  },
  {
    path: '/recycle',
    element: (
      <ProtectedRoute>
        <RecycleBin />
      </ProtectedRoute>
    ),
    meta: { title: '回收站', protected: true }
  },
  {
    path: '/recent',
    element: (
      <ProtectedRoute>
        <Recent />
      </ProtectedRoute>
    ),
    meta: { title: '最近使用', protected: true }
  },
  {
    path: '/images',
    element: (
      <ProtectedRoute>
        <Images />
      </ProtectedRoute>
    ),
    meta: { title: '图片', protected: true }
  },
  {
    path: '/videos',
    element: (
      <ProtectedRoute>
        <Videos />
      </ProtectedRoute>
    ),
    meta: { title: '视频', protected: true }
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
    meta: { title: '404' }
  }
];
