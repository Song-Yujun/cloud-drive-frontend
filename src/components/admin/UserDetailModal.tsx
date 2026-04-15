import { X, User, Mail, Calendar, Files, HardDrive } from "lucide-react";
import { UserDetail } from "@/services/adminService";
import { formatDateTime, formatFileSize, getRoleText, getStatusText, getGenderText } from "@/utils/adminUtils";

interface UserDetailModalProps {
  open: boolean;
  onClose: () => void;
  userDetail: UserDetail;
}

export default function UserDetailModal({ open, onClose, userDetail }: UserDetailModalProps) {
  if (!open) return null;

  const { user, file_count, total_size } = userDetail;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">用户详情</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-indigo-600 font-bold text-2xl">
                  {user.username.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h4 className="text-2xl font-bold text-slate-900">{user.username}</h4>
              {user.nickname && <p className="text-slate-500 mt-1">{user.nickname}</p>}
            </div>
          </div>

          {/* User Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                <User className="w-3.5 h-3.5" />
                用户ID
              </div>
              <div className="text-base font-medium text-slate-900">{user.id}</div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                <Mail className="w-3.5 h-3.5" />
                邮箱
              </div>
              <div className="text-base font-medium text-slate-900">{user.email || "未设置"}</div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-xs font-semibold text-slate-500 mb-2">角色</div>
              <div className="text-base font-medium text-slate-900">{getRoleText(user.role)}</div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-xs font-semibold text-slate-500 mb-2">状态</div>
              <div className="text-base font-medium text-slate-900">{getStatusText(user.is_active)}</div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-xs font-semibold text-slate-500 mb-2">性别</div>
              <div className="text-base font-medium text-slate-900">{getGenderText(user.gender)}</div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                <Calendar className="w-3.5 h-3.5" />
                注册时间
              </div>
              <div className="text-base font-medium text-slate-900">{formatDateTime(user.created_at)}</div>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-xs font-semibold text-slate-500 mb-2">个人简介</div>
              <div className="text-base text-slate-900 whitespace-pre-wrap">{user.bio}</div>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-2">
                <Files className="w-3.5 h-3.5" />
                文件数量
              </div>
              <div className="text-2xl font-bold text-blue-700">{file_count}</div>
            </div>

            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-2">
                <HardDrive className="w-3.5 h-3.5" />
                存储空间
              </div>
              <div className="text-2xl font-bold text-indigo-700">{formatFileSize(total_size)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
