import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Clock,
  Image,
  Video,
  HardDrive,
  Cloud,
  Settings,
  User,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { getUserInfo } from "@/services/userService";
import ProfileModal from "./ProfileModal";
import type { UserProfile } from "@/services/userService";

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
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

export default function Sidebar({ activeTab = "all", onTabChange }: SidebarProps) {
  const navigate = useNavigate();
  const [showSystemSettings, setShowSystemSettings] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState("默认用户");
  const [profileEmail, setProfileEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [themeMode, setThemeMode] = useState<ThemeMode>("auto");

  const settingsRef = useRef<HTMLDivElement>(null);

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

        const name = profile.nickname || profile.Username || "默认用户";
        setProfileName(name);
        setProfileEmail(profile.Email || "");
        setAvatarUrl(normalizeAvatarUrl(profile.avatar));
      } catch (error) {
        console.error("获取用户信息失败:", error);
      }
    };

    fetchProfile();

    // 监听全局的个人信息更新事件
    const handleProfileUpdated = (event: any) => {
      const profile = event.detail;
      setProfileName(profile.nickname || profile.Username || "默认用户");
      setProfileEmail(profile.Email || "");
      setAvatarUrl(normalizeAvatarUrl(profile.avatar));
    };

    window.addEventListener("profile-updated", handleProfileUpdated);
    return () => window.removeEventListener("profile-updated", handleProfileUpdated);
  }, []);

  const handleProfileUpdate = (profile: UserProfile) => {
    setProfileName(profile.nickname || profile.Username || "默认用户");
    setProfileEmail(profile.Email || "");
    setAvatarUrl(normalizeAvatarUrl(profile.avatar));

    // 触发全局事件，通知其他组件更新
    window.dispatchEvent(new CustomEvent("profile-updated", { detail: profile }));
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem("theme-mode", mode);
    applyTheme(mode);
    window.dispatchEvent(new Event("theme-mode-change"));
  };

  return (
    <>
      <div className="w-64 h-screen bg-white flex flex-col dark:bg-[#0f172a] dark:border-[#1e293b]">
        {/* Brand Header */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 bg-linear-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#0f172a]"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">轻传文件系统</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">快速便捷的文件传输</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 pt-4">
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

      <ProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onProfileUpdate={handleProfileUpdate}
      />
    </>
  );
}
