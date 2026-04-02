import { useState, useEffect, useRef } from "react";
import { X, Camera, User, Mail, Lock, Save, Eye } from "lucide-react";
import { getUserInfo, updateProfile, uploadAvatar, changePassword } from "@/services/userService";
import type { UserProfile } from "@/services/userService";
import Toast from "./Toast";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  onProfileUpdate?: (profile: UserProfile) => void;
  viewOnly?: boolean; // 新增：只读模式
}

type TabType = "profile" | "password";

const normalizeAvatarUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `/api${url}`;
  return url;
};

export default function ProfileModal({ open, onClose, onProfileUpdate, viewOnly = false }: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 表单数据
  const [formData, setFormData] = useState({
    nickname: "",
    email: "",
    gender: "" as "male" | "female" | "other" | "",
    bio: "",
  });

  // 密码表单
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [toast, setToast] = useState<{ open: boolean; message: string; type: "success" | "error" | "warning" | "info" }>({
    open: false,
    message: "",
    type: "info",
  });

  useEffect(() => {
    if (open) {
      loadUserInfo();
    }
  }, [open]);

  const loadUserInfo = async () => {
    try {
      const response = await getUserInfo();
      if (response.code === 200) {
        setProfile(response.data);
        setFormData({
          nickname: response.data.nickname || "",
          email: response.data.Email || "",
          gender: response.data.gender || "",
          bio: response.data.bio || "",
        });
        setAvatarPreview(normalizeAvatarUrl(response.data.avatar));
      }
    } catch (error: any) {
      setToast({ open: true, message: error.response?.data?.message || "获取用户信息失败", type: "error" });
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件大小
    if (file.size > 2 * 1024 * 1024) {
      setToast({ open: true, message: "头像大小不能超过 2MB", type: "warning" });
      return;
    }

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      setToast({ open: true, message: "请选择图片文件", type: "warning" });
      return;
    }

    setLoading(true);
    try {
      const response = await uploadAvatar(file);
      if (response.code === 200) {
        setAvatarPreview(normalizeAvatarUrl(response.data.avatar));
        setToast({ open: true, message: "头像上传成功", type: "success" });
        if (onProfileUpdate) {
          onProfileUpdate(response.data);
        }
      }
    } catch (error: any) {
      setToast({ open: true, message: error.response?.data?.message || "头像上传失败", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const updateData: any = {
        nickname: formData.nickname,
        email: formData.email,
        bio: formData.bio,
      };

      // 只有当性别不为空时才添加
      if (formData.gender) {
        updateData.gender = formData.gender;
      }

      const response = await updateProfile(updateData);
      if (response.code === 200) {
        setProfile(response.data);
        if (onProfileUpdate) {
          onProfileUpdate(response.data);
        }
        // 延迟关闭弹窗，让用户看到成功提示
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (error: any) {
      setToast({ open: true, message: error.response?.data?.message || "更新失败", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.old_password || !passwordData.new_password) {
      setToast({ open: true, message: "请填写完整的密码信息", type: "warning" });
      return;
    }

    if (passwordData.new_password.length < 6) {
      setToast({ open: true, message: "新密码至少需要6位", type: "warning" });
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setToast({ open: true, message: "两次输入的密码不一致", type: "warning" });
      return;
    }

    setLoading(true);
    try {
      const response = await changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });
      if (response.code === 200) {
        setToast({ open: true, message: "密码修改成功", type: "success" });
        setPasswordData({ old_password: "", new_password: "", confirm_password: "" });
      }
    } catch (error: any) {
      setToast({ open: true, message: error.response?.data?.message || "密码修改失败", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">{viewOnly ? "个人信息" : "个人设置"}</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          {!viewOnly && (
            <div className="px-6 pt-4 border-b border-slate-200">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === "profile"
                      ? "bg-white text-indigo-600 border-b-2 border-indigo-600"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  个人信息
                </button>
                <button
                  onClick={() => setActiveTab("password")}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === "password"
                      ? "bg-white text-indigo-600 border-b-2 border-indigo-600"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  修改密码
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {viewOnly ? (
              // 只读模式：纯展示样式
              <div className="space-y-6">
                {/* Avatar */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-lg">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="头像" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white text-2xl font-bold">
                        {profile?.Username?.slice(0, 2).toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Cards */}
                <div className="space-y-4">
                  {/* Username */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                      <User className="w-3.5 h-3.5" />
                      账号
                    </div>
                    <div className="text-base font-medium text-slate-900">
                      {profile?.Username || "—"}
                    </div>
                  </div>

                  {/* Nickname */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-xs font-semibold text-slate-500 mb-2">昵称</div>
                    <div className="text-base font-medium text-slate-900">
                      {formData.nickname || "未设置"}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                      <Mail className="w-3.5 h-3.5" />
                      邮箱
                    </div>
                    <div className="text-base font-medium text-slate-900">
                      {formData.email || "未设置"}
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-xs font-semibold text-slate-500 mb-2">性别</div>
                    <div className="text-base font-medium text-slate-900">
                      {formData.gender === "male" ? "男" : formData.gender === "female" ? "女" : formData.gender === "other" ? "其他" : "未设置"}
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-xs font-semibold text-slate-500 mb-2">个人简介</div>
                    <div className="text-base text-slate-900 whitespace-pre-wrap">
                      {formData.bio || "未设置"}
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === "profile" ? (
              <div className="space-y-6">
                {/* Avatar */}
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-lg">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="头像" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white text-2xl font-bold">
                          {profile?.Username?.slice(0, 2).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    {!viewOnly && (
                      <>
                        <button
                          onClick={handleAvatarClick}
                          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Camera className="w-6 h-6 text-white" />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </>
                    )}
                  </div>
                  {!viewOnly && <p className="mt-2 text-sm text-slate-500">点击头像更换（最大2MB）</p>}
                </div>

                {/* Username (readonly) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    账号
                  </label>
                  <input
                    type="text"
                    value={profile?.Username || ""}
                    disabled
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                  />
                </div>

                {/* Nickname */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">昵称</label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    placeholder="请输入昵称"
                    maxLength={50}
                    disabled={viewOnly}
                    className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${
                      viewOnly
                        ? "bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                        : "border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    }`}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    邮箱
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="请输入邮箱"
                    disabled={viewOnly}
                    className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${
                      viewOnly
                        ? "bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                        : "border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    }`}
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">性别</label>
                  <div className="flex gap-4">
                    {[
                      { value: "male", label: "男" },
                      { value: "female", label: "女" },
                      { value: "other", label: "其他" },
                    ].map((option) => (
                      <label key={option.value} className={`flex items-center ${viewOnly ? "cursor-not-allowed" : "cursor-pointer"}`}>
                        <input
                          type="radio"
                          name="gender"
                          value={option.value}
                          checked={formData.gender === option.value}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                          disabled={viewOnly}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                        />
                        <span className={`ml-2 text-sm ${viewOnly ? "text-slate-500" : "text-slate-700"}`}>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">个人简介</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="介绍一下自己吧..."
                    maxLength={500}
                    rows={4}
                    disabled={viewOnly}
                    className={`w-full px-4 py-2 border rounded-lg outline-none transition-all resize-none ${
                      viewOnly
                        ? "bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                        : "border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    }`}
                  />
                  {!viewOnly && <p className="mt-1 text-xs text-slate-500 text-right">{formData.bio.length}/500</p>}
                </div>

                {/* Save Button */}
                {!viewOnly && (
                  <button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? "保存中..." : "保存更改"}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Old Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Lock className="w-4 h-4 inline mr-1" />
                    当前密码
                  </label>
                  <input
                    type="password"
                    value={passwordData.old_password}
                    onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                    placeholder="请输入当前密码"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">新密码</label>
                  <input
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    placeholder="请输入新密码（至少6位）"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">确认新密码</label>
                  <input
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    placeholder="请再次输入新密码"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                {/* Info */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>密码要求：</strong>
                    <br />• 至少6位字符
                    <br />• 建议包含字母、数字和特殊字符
                  </p>
                </div>

                {/* Change Password Button */}
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock className="w-4 h-4" />
                  {loading ? "修改中..." : "修改密码"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Toast
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
        type={toast.type}
      />
    </>
  );
}
