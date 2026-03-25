import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Clock,
  Image,
  Video,
  HardDrive,
  Cloud,
  Plus,
  Upload,
  FolderPlus,
  Settings,
  User,
  Sun,
  Moon,
  Monitor,
  X,
  KeyRound,
  Camera,
} from "lucide-react";
import { getUserInfo, uploadAvatar } from "@/services/fileService";

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onUploadFile?: () => void;
  onCreateFolder?: () => void;
}

type ThemeMode = "auto" | "light" | "dark";

const getAutoTheme = () => {
  const hour = new Date().getHours();
  return hour >= 7 && hour < 19 ? "light" : "dark";
};

const applyTheme = (mode: ThemeMode) => {
  const theme = mode === "auto" ? getAutoTheme() : mode;
  document.documentElement.classList.toggle("dark", theme === "dark");
};

const normalizeAvatarUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `/api${url}`;
  return url;
};

export default function Sidebar({ activeTab = "all", onTabChange, onUploadFile, onCreateFolder }: SidebarProps) {
  const navigate = useNavigate();
  const [showNewDropdown, setShowNewDropdown] = useState(false);
  const [showSystemSettings, setShowSystemSettings] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState("默认用户");
  const [profileEmail, setProfileEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("auto");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const menuItems = [
    { id: "all", label: "所有文件", icon: Home, path: "/" },
    { id: "recent", label: "最近", icon: Clock, path: "/recent" },
    { id: "images", label: "图片", icon: Image, path: "/images" },
    { id: "videos", label: "视频", icon: Video, path: "/videos" },
    { id: "trash", label: "回收站", icon: HardDrive, path: "/recycle" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setShowNewDropdown(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(target)) {
        setShowSystemSettings(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const mode = (localStorage.getItem("theme-mode") as ThemeMode) || "auto";
    setThemeMode(mode);
    applyTheme(mode);

    const syncTheme = () => {
      const latest = (localStorage.getItem("theme-mode") as ThemeMode) || "auto";
      setThemeMode(latest);
      applyTheme(latest);
    };

    window.addEventListener("theme-mode-change", syncTheme);
    return () => window.removeEventListener("theme-mode-change", syncTheme);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getUserInfo();
        const profile = res.data;
        if (!profile) return;

        const name = profile.nickname || profile.username || "默认用户";
        setProfileName(name);
        setProfileEmail(profile.email || "");
        setAvatarUrl(normalizeAvatarUrl(profile.avatar));
      } catch (error) {
        console.error("获取用户信息失败:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleNewAction = (action: string) => {
    setShowNewDropdown(false);
    if (action === "upload-file") onUploadFile?.();
    if (action === "create-folder") onCreateFolder?.();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const res = await uploadAvatar(file);
      if (res.data?.avatar) setAvatarUrl(normalizeAvatarUrl(res.data.avatar));
      if (res.data?.nickname || res.data?.username) {
        setProfileName(res.data.nickname || res.data.username || "默认用户");
      }
    } catch (error) {
      console.error("上传头像失败:", error);
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem("theme-mode", mode);
    applyTheme(mode);
    window.dispatchEvent(new Event("theme-mode-change"));
  };

  return (
    <>
      <div className="w-64 h-screen bg-white border-r border-[#e2e8f0] flex flex-col dark:bg-[#0f172a] dark:border-[#1e293b]">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#1121d4] rounded-xl flex items-center justify-center shadow-[0px_10px_15px_-3px_rgba(17,33,212,0.2)]">
              <Cloud className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#0f172a] tracking-tight dark:text-white">Save Drive</h1>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] dark:text-[#94a3b8]">云端存储</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNewDropdown(!showNewDropdown)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[#1121d4] text-white font-semibold transition-all hover:bg-[#0d19a8]"
            >
              <Plus className="w-5 h-5" />
              <span>新增</span>
            </button>

            {showNewDropdown && (
              <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-[#e2e8f0] py-2 z-50 dark:bg-[#1e293b] dark:border-[#334155]">
                <button
                  onClick={() => handleNewAction("upload-file")}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#0f172a] hover:bg-[#f6f6f8] dark:text-white dark:hover:bg-[#334155]"
                >
                  <Upload className="w-4 h-4 text-[#64748b]" />
                  上传文件
                </button>
                <button
                  onClick={() => handleNewAction("create-folder")}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#0f172a] hover:bg-[#f6f6f8] dark:text-white dark:hover:bg-[#334155]"
                >
                  <FolderPlus className="w-4 h-4 text-[#64748b]" />
                  新建文件夹
                </button>
              </div>
            )}
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-[#1121d4]/10 text-[#1121d4]"
                    : "text-[#64748b] hover:bg-[#f6f6f8] hover:text-[#0f172a] dark:text-[#94a3b8] dark:hover:bg-[#1e293b] dark:hover:text-white"
                }`}
                onClick={() => {
                  navigate(item.path);
                  onTabChange?.(item.id);
                }}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#e2e8f0] relative dark:border-[#334155]" ref={settingsRef}>
          <div className="mb-3 flex items-center gap-3 px-2 py-2">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1121d4] flex items-center justify-center text-white text-sm font-bold">
              {avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : profileName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[#0f172a] truncate dark:text-white">{profileName}</div>
              <div className="text-xs text-[#64748b] dark:text-[#94a3b8]">个人中心</div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setShowProfileModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-[#64748b] hover:bg-[#f6f6f8] hover:text-[#0f172a] dark:text-[#94a3b8] dark:hover:bg-[#1e293b] dark:hover:text-white"
            >
              <User className="w-5 h-5" />
              个人设置
            </button>
            <button
              onClick={() => setShowSystemSettings((v) => !v)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-[#64748b] hover:bg-[#f6f6f8] hover:text-[#0f172a] dark:text-[#94a3b8] dark:hover:bg-[#1e293b] dark:hover:text-white"
            >
              <Settings className="w-5 h-5" />
              系统设置
            </button>
          </div>

          {showSystemSettings && (
            <div className="absolute left-4 right-4 bottom-[92px] bg-white border border-[#e2e8f0] rounded-xl shadow-xl p-3 z-50 dark:bg-[#1e293b] dark:border-[#334155]">
              <div className="text-xs font-bold text-[#64748b] mb-2 dark:text-[#94a3b8]">主题模式</div>
              <div className="space-y-1">
                <button onClick={() => setTheme("auto")} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${themeMode === "auto" ? "bg-[#1121d4]/10 text-[#1121d4]" : "text-[#475569] hover:bg-[#f8fafc] dark:text-[#cbd5e1] dark:hover:bg-[#334155]"}`}><Monitor className="w-4 h-4" /> 自动（按时间）</button>
                <button onClick={() => setTheme("light")} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${themeMode === "light" ? "bg-[#1121d4]/10 text-[#1121d4]" : "text-[#475569] hover:bg-[#f8fafc] dark:text-[#cbd5e1] dark:hover:bg-[#334155]"}`}><Sun className="w-4 h-4" /> 明亮</button>
                <button onClick={() => setTheme("dark")} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${themeMode === "dark" ? "bg-[#1121d4]/10 text-[#1121d4]" : "text-[#475569] hover:bg-[#f8fafc] dark:text-[#cbd5e1] dark:hover:bg-[#334155]"}`}><Moon className="w-4 h-4" /> 暗黑</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showProfileModal && (
        <div className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-[#e2e8f0] dark:border-[#334155]">
            <div className="p-5 border-b border-[#e2e8f0] dark:border-[#334155] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">个人设置</h3>
              <button onClick={() => setShowProfileModal(false)} className="p-2 rounded-lg hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b]"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-5 space-y-4">
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-[#1121d4] text-white flex items-center justify-center font-bold">
                  {avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : profileName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[#0f172a] dark:text-white">{profileName}</div>
                  <div className="text-xs text-[#64748b] dark:text-[#94a3b8]">{profileEmail || "未设置邮箱"}</div>
                </div>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="px-3 py-2 text-sm rounded-lg bg-[#1121d4] text-white hover:bg-[#0d19a8] inline-flex items-center gap-1"
                  disabled={uploadingAvatar}
                >
                  <Camera className="w-4 h-4" /> {uploadingAvatar ? "上传中" : "修改头像"}
                </button>
              </div>

              <button
                onClick={() => {
                  setShowProfileModal(false);
                  window.dispatchEvent(new Event("open-reset-password-modal"));
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#e2e8f0] hover:bg-[#f8fafc] dark:border-[#334155] dark:hover:bg-[#1e293b]"
              >
                <KeyRound className="w-4 h-4" /> 重置密码
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
