import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Clock, Image, Video, HardDrive, Cloud, Plus, Upload, FolderPlus, Settings, User } from "lucide-react";

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onUploadFile?: () => void;
  onCreateFolder?: () => void;
}

export default function Sidebar({ activeTab = "all", onTabChange, onUploadFile, onCreateFolder }: SidebarProps) {
  const navigate = useNavigate();
  const [showNewDropdown, setShowNewDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const menuItems = [
    { id: "all", label: "所有文件", icon: Home, path: "/" },
    { id: "recent", label: "最近", icon: Clock, path: "/recent" },
    { id: "images", label: "图片", icon: Image, path: "/images" },
    { id: "videos", label: "视频", icon: Video, path: "/videos" },
    { id: "trash", label: "回收站", icon: HardDrive, path: "/recycle" },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNewDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNewAction = (action: string) => {
    setShowNewDropdown(false);
    
    switch (action) {
      case 'upload-file':
        onUploadFile?.();
        break;
      case 'create-folder':
        onCreateFolder?.();
        break;
    }
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-[#e2e8f0] flex flex-col">
      {/* Logo - Indigo Vault Style */}
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#1121d4] rounded-xl flex items-center justify-center shadow-[0px_10px_15px_-3px_rgba(17,33,212,0.2)]">
            <Cloud className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#0f172a] tracking-tight">Save Drive</h1>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">云端存储</p>
          </div>
        </div>
      </div>

      {/* Navigation - Indigo Vault Active States */}
      <nav className="flex-1 px-4 space-y-2">
        {/* New Button with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNewDropdown(!showNewDropdown)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[#1121d4] text-white font-semibold transition-all hover:bg-[#0d19a8] shadow-[0px_10px_15px_-3px_rgba(17,33,212,0.2)]"
          >
            <Plus className="w-5 h-5" />
            <span>新增</span>
          </button>

          {/* Dropdown Menu */}
          {showNewDropdown && (
            <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-[#e2e8f0] py-2 z-50">
              <button
                onClick={() => handleNewAction('upload-file')}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#0f172a] hover:bg-[#f6f6f8] transition-colors"
              >
                <Upload className="w-4 h-4 text-[#64748b]" />
                <span>上传文件</span>
              </button>
              <button
                onClick={() => handleNewAction('create-folder')}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#0f172a] hover:bg-[#f6f6f8] transition-colors"
              >
                <FolderPlus className="w-4 h-4 text-[#64748b]" />
                <span>新建文件夹</span>
              </button>
            </div>
          )}
        </div>

        {/* Menu Items */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                isActive 
                  ? "bg-[#1121d4]/10 text-[#1121d4]" 
                  : "text-[#64748b] hover:bg-[#f6f6f8] hover:text-[#0f172a]"
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

      {/* Storage Info - Indigo Vault Style */}
      {/* <div className="p-4">
        <div className="bg-[#fafafa] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-[#64748b]" />
              <span className="text-sm font-semibold text-[#0f172a]">存储空间</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1121d4] bg-[#1121d4]/10 px-2 py-1 rounded">
              PRO
            </span>
          </div>
          <div className="space-y-2">
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#1121d4] rounded-full transition-all"
                style={{ width: `${storagePercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[#64748b]">
              <span>{storageUsed} GB 已用</span>
              <span>{storageTotal} GB</span>
            </div>
          </div>
          <button className="w-full border border-[#1121d4]/20 text-[#1121d4] font-bold text-xs py-2.5 rounded-lg hover:bg-[#1121d4]/5 transition-colors flex items-center justify-center gap-2">
            <Zap className="w-3.5 h-3.5" />
            升级套餐
          </button>
        </div>
      </div> */}

      {/* Personal Settings Section */}
      <div className="p-4 border-t border-[#e2e8f0]">
        <div className="space-y-2">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-[#64748b] hover:bg-[#f6f6f8] hover:text-[#0f172a] transition-all"
          >
            <User className="w-5 h-5" />
            <span>个人设置</span>
          </button>
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-[#64748b] hover:bg-[#f6f6f8] hover:text-[#0f172a] transition-all"
          >
            <Settings className="w-5 h-5" />
            <span>系统设置</span>
          </button>
        </div>
      </div>
    </div>
  );
}
