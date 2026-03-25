import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Upload, Share2, ArrowLeft, RefreshCw, LogOut, ChevronDown, User, KeyRound, X, Loader2 } from "lucide-react";
import { getUserInfo } from "@/services/fileService";
import { changePassword } from "@/services/authService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  pageTitle?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonPath?: string;
  showSearch?: boolean;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  showMySharesButton?: boolean;
  showUploadButton?: boolean;
  showRefreshButton?: boolean;
  onRefresh?: () => void;
  customActions?: React.ReactNode;
  showUserInfo?: boolean;
}

const normalizeAvatarUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `/api${url}`;
  return url;
};

export default function TopBar({
  pageTitle,
  showBackButton = false,
  backButtonText = "文件空间",
  backButtonPath = "/",
  showSearch = false,
  searchValue = "",
  searchPlaceholder = "搜索文件、图片、文档...",
  onSearchChange,
  onSearchSubmit,
  showMySharesButton = false,
  showUploadButton = false,
  showRefreshButton = false,
  onRefresh,
  customActions,
  showUserInfo = false,
}: TopBarProps) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [profileName, setProfileName] = useState("默认用户");
  const [profileInitials, setProfileInitials] = useState("DU");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [resetOpen, setResetOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetMsg, setResetMsg] = useState("");

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && onSearchSubmit) onSearchSubmit();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const fetchUserProfile = async () => {
    try {
      const res = await getUserInfo();
      const profile = res.data;
      if (!profile) return;

      const displayName = (profile as any).nickname || profile.username || "默认用户";
      setProfileName(displayName);
      setProfileInitials(displayName.slice(0, 2).toUpperCase());
      if (profile.avatar) setAvatarUrl(normalizeAvatarUrl(profile.avatar));
    } catch (error) {
      console.error("获取用户信息失败:", error);
    }
  };

  const openResetModal = () => {
    setResetOpen(true);
    setResetError("");
    setResetMsg("");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleChangePassword = async () => {
    setResetError("");
    setResetMsg("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setResetError("请完整填写旧密码、新密码、确认密码");
      return;
    }
    if (newPassword.length < 6) {
      setResetError("新密码至少 6 位");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("两次输入的新密码不一致");
      return;
    }

    try {
      setResetLoading(true);
      const res = await changePassword({ old_password: oldPassword, new_password: newPassword });
      if (res.code === 200) {
        setResetMsg(res.message || res.msg || "密码修改成功，即将退出登录");
        setTimeout(() => {
          setResetOpen(false);
          handleLogout();
        }, 1000);
      } else {
        setResetError(res.message || res.msg || "修改失败");
      }
    } catch (err: any) {
      setResetError(err.response?.data?.message || err.message || "修改失败");
    } finally {
      setResetLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showUserInfo) fetchUserProfile();
  }, [showUserInfo]);

  return (
    <>
      <header className="bg-white px-8 py-4 border-b border-[#eef2f7] dark:bg-[#0f172a] dark:border-[#1e293b]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {showBackButton && (
              <>
                <button
                  onClick={() => navigate(backButtonPath)}
                  className="flex items-center gap-2 text-sm font-semibold text-[#64748b] hover:text-[#0f172a] transition-colors dark:text-[#94a3b8] dark:hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {backButtonText}
                </button>
                <div className="w-px h-5 bg-[#e2e8f0] dark:bg-[#334155]" />
              </>
            )}

            {pageTitle && <h1 className="text-lg font-bold text-[#0f172a] tracking-tight dark:text-white">{pageTitle}</h1>}

            {showSearch && (
              <div className="relative flex-1 max-w-xl ml-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  onKeyDown={handleSearchKeyPress}
                  className="w-full pl-11 pr-4 py-2.5 bg-[#f5f7fb] border border-transparent rounded-lg text-sm font-medium text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#1121d4]/20 dark:bg-[#1e293b] dark:text-white"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 ml-6">
            {customActions}

            {showRefreshButton && onRefresh && (
              <button
                onClick={onRefresh}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#64748b] hover:text-[#0f172a] hover:bg-[#f6f6f8] rounded-lg transition-all dark:text-[#94a3b8] dark:hover:text-white dark:hover:bg-[#1e293b]"
              >
                <RefreshCw className="w-4 h-4" />
                刷新
              </button>
            )}

            {showMySharesButton && (
              <button
                onClick={() => navigate("/shares")}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#64748b] hover:text-[#0f172a] hover:bg-[#f6f6f8] rounded-lg transition-all dark:text-[#94a3b8] dark:hover:text-white dark:hover:bg-[#1e293b]"
              >
                <Share2 className="h-4 w-4" />
                我的分享
              </button>
            )}

            {showUploadButton && (
              <button className="flex items-center gap-2 px-6 py-2.5 bg-[#1121d4] hover:bg-[#0d19a8] text-white font-semibold text-sm rounded-xl shadow-[0px_10px_15px_-3px_rgba(17,33,212,0.2)] transition-all">
                <Upload className="h-4 w-4" />
                上传文件
              </button>
            )}

            {showUserInfo && (
              <div className="relative ml-2" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="h-11 pl-2.5 pr-3 flex items-center gap-2 rounded-full border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] transition-all dark:bg-[#1e293b] dark:border-[#334155]"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-[#1121d4] flex items-center justify-center">
                    {avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <span className="text-white text-xs font-bold">{profileInitials}</span>}
                  </div>
                  <div className="leading-none text-left mr-1">
                    <div className="text-xs font-semibold text-[#334155] dark:text-[#e2e8f0] truncate max-w-[80px]">{profileName}</div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[#64748b] transition-transform ${showDropdown ? "rotate-180" : ""}`} />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-[calc(100%+10px)] w-72 bg-white rounded-2xl shadow-[0_20px_45px_rgba(15,23,42,0.15)] border border-[#e8edf5] overflow-hidden z-50 dark:bg-[#0f172a] dark:border-[#334155]">
                    <div className="px-5 pt-5 pb-4 border-b border-[#eef2f7] dark:border-[#334155]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-[#f1f5f9] flex items-center justify-center border border-[#e2e8f0]">
                          {avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-[#64748b]" />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[18px] font-bold text-[#0f172a] truncate dark:text-white">{profileName}</div>
                          <div className="text-sm text-[#64748b] truncate dark:text-[#94a3b8]">个人中心</div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        openResetModal();
                      }}
                      className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-[#0f172a] hover:bg-[#f8fafc] dark:text-white dark:hover:bg-[#1e293b]"
                    >
                      <KeyRound className="w-4 h-4 text-[#64748b]" />
                      重置密码
                    </button>

                    <div className="border-t border-[#eef2f7] dark:border-[#334155]" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-5 py-4 text-sm font-semibold text-[#ef4444] hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <LogOut className="w-4 h-4" />
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {resetOpen && (
        <div className="fixed inset-0 z-[90] bg-black/45 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-[#e2e8f0] dark:border-[#334155]">
            <div className="p-5 border-b border-[#e2e8f0] dark:border-[#334155] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0f172a] dark:text-white flex items-center gap-2"><KeyRound className="w-5 h-5" />登录后重置密码</h3>
              <button onClick={() => setResetOpen(false)} className="p-2 rounded-lg hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b]"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-5 space-y-4">
              {resetError && <div className="p-2.5 rounded-lg text-sm text-red-600 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">{resetError}</div>}
              {resetMsg && <div className="p-2.5 rounded-lg text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30">{resetMsg}</div>}

              <div className="space-y-1.5">
                <Label>旧密码</Label>
                <Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="请输入当前密码" />
              </div>

              <div className="space-y-1.5">
                <Label>新密码</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="至少 6 位" />
              </div>

              <div className="space-y-1.5">
                <Label>确认新密码</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="再次输入新密码" />
              </div>

              <Button type="button" className="w-full" onClick={handleChangePassword} disabled={resetLoading}>
                {resetLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />提交中...</> : "确认重置并退出登录"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
