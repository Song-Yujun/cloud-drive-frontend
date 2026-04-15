import { useEffect, useState } from "react";
import { Search, RefreshCw, Eye, Ban, CheckCircle, Shield, Key, Trash2, UserX } from "lucide-react";
import {
  getAllUsers,
  getUserDetail,
  updateUserStatus,
  updateUserRole,
  resetUserPassword,
  deleteUser,
  AdminUser,
  UserDetail,
} from "@/services/adminService";
import { formatDateTime, getRoleText, getStatusText, debounce } from "@/utils/adminUtils";
import UserDetailModal from "@/components/admin/UserDetailModal";
import ResetPasswordModal from "@/components/admin/ResetPasswordModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import Toast from "@/components/Toast";

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | "user" | "admin">("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    type: "info",
  });

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers({
        page,
        pageSize,
        keyword: keyword || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      });

      if (response.code === 200) {
        setUsers(response.data);
        setTotal(response.total);
      } else {
        setToast({ open: true, message: response.message || "获取用户列表失败", type: "error" });
      }
    } catch (err: any) {
      setToast({
        open: true,
        message: err.response?.data?.message || err.message || "获取用户列表失败",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = debounce(() => {
    setPage(1);
    fetchUsers();
  }, 500);

  const handleViewDetail = async (user: AdminUser) => {
    try {
      const response = await getUserDetail(user.id);
      if (response.code === 200) {
        setUserDetail(response.data);
        setSelectedUser(user);
        setShowDetailModal(true);
      }
    } catch (err: any) {
      setToast({
        open: true,
        message: err.response?.data?.message || "获取用户详情失败",
        type: "error",
      });
    }
  };

  const handleToggleStatus = (user: AdminUser) => {
    setConfirmDialog({
      open: true,
      title: user.is_active ? "禁用用户" : "启用用户",
      description: `确定要${user.is_active ? "禁用" : "启用"}用户 "${user.username}" 吗？`,
      onConfirm: async () => {
        try {
          const response = await updateUserStatus(user.id, !user.is_active);
          if (response.code === 200) {
            setToast({ open: true, message: "状态更新成功", type: "success" });
            fetchUsers();
          }
        } catch (err: any) {
          setToast({
            open: true,
            message: err.response?.data?.message || "状态更新失败",
            type: "error",
          });
        }
      },
    });
  };

  const handleToggleRole = (user: AdminUser) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    setConfirmDialog({
      open: true,
      title: newRole === "admin" ? "设为管理员" : "取消管理员",
      description: `确定要将用户 "${user.username}" ${newRole === "admin" ? "设为管理员" : "取消管理员权限"}吗？`,
      onConfirm: async () => {
        try {
          const response = await updateUserRole(user.id, newRole);
          if (response.code === 200) {
            setToast({ open: true, message: "角色更新成功", type: "success" });
            fetchUsers();
          }
        } catch (err: any) {
          setToast({
            open: true,
            message: err.response?.data?.message || "角色更新失败",
            type: "error",
          });
        }
      },
    });
  };

  const handleResetPassword = (user: AdminUser) => {
    setSelectedUser(user);
    setShowResetPasswordModal(true);
  };

  const handleResetPasswordConfirm = async (newPassword: string) => {
    if (!selectedUser) return;

    try {
      const response = await resetUserPassword(selectedUser.id, newPassword);
      if (response.code === 200) {
        setToast({ open: true, message: "密码重置成功", type: "success" });
        setShowResetPasswordModal(false);
      }
    } catch (err: any) {
      setToast({
        open: true,
        message: err.response?.data?.message || "密码重置失败",
        type: "error",
      });
    }
  };

  const handleDeleteUser = (user: AdminUser) => {
    setConfirmDialog({
      open: true,
      title: "删除用户",
      description: `确定要删除用户 "${user.username}" 吗？此操作将禁用该账号。`,
      onConfirm: async () => {
        try {
          const response = await deleteUser(user.id);
          if (response.code === 200) {
            setToast({ open: true, message: "用户已禁用", type: "success" });
            fetchUsers();
          }
        } catch (err: any) {
          setToast({
            open: true,
            message: err.response?.data?.message || "删除失败",
            type: "error",
          });
        }
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">用户管理</h1>
        <p className="text-slate-500 mt-1">管理系统中的所有用户账号</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索用户名、邮箱、昵称..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  handleSearch();
                }}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as "" | "user" | "admin");
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="">全部角色</option>
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as "" | "active" | "inactive");
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="">全部状态</option>
              <option value="active">启用</option>
              <option value="inactive">禁用</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            共 {total} 个用户，当前第 {page} 页
          </div>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            刷新
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-500">加载中...</p>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <UserX className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">暂无用户数据</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    用户信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    邮箱
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    角色
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    注册时间
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-indigo-600 font-semibold text-sm">
                              {user.username.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{user.username}</div>
                          {user.nickname && <div className="text-xs text-slate-500">{user.nickname}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {user.role === "admin" && <Shield className="w-3 h-3" />}
                        {getRoleText(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {getStatusText(user.is_active)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatDateTime(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetail(user)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.is_active
                              ? "text-red-600 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={user.is_active ? "禁用" : "启用"}
                        >
                          {user.is_active ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleToggleRole(user)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title={user.role === "admin" ? "取消管理员" : "设为管理员"}
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(user)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="重置密码"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除用户"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <span className="text-sm text-slate-600">
              第 {page} 页，共 {Math.ceil(total / pageSize)} 页
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(total / pageSize)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showDetailModal && userDetail && (
        <UserDetailModal
          open={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          userDetail={userDetail}
        />
      )}

      {showResetPasswordModal && selectedUser && (
        <ResetPasswordModal
          open={showResetPasswordModal}
          onClose={() => setShowResetPasswordModal(false)}
          username={selectedUser.username}
          onConfirm={handleResetPasswordConfirm}
        />
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant="danger"
      />

      <Toast
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
}
