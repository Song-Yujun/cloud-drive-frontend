import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Upload, Share2, ArrowLeft, RefreshCw, LogOut, ChevronDown } from "lucide-react";

interface TopBarProps {
  // Page identification
  pageTitle?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonPath?: string;
  
  // Search functionality
  showSearch?: boolean;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  
  // Action buttons
  showMySharesButton?: boolean;
  showUploadButton?: boolean;
  showRefreshButton?: boolean;
  onRefresh?: () => void;
  
  // Custom actions (for page-specific buttons)
  customActions?: React.ReactNode;
  
  // User info
  showUserInfo?: boolean;
  userName?: string;
  userRole?: string;
  userInitials?: string;
}

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
  userName = "CodeBoy",
  userRole = "admin",
  userInitials = "Code",
}: TopBarProps) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearchSubmit) {
      onSearchSubmit();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white px-8 py-6">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4 flex-1">
          {/* Back Button */}
          {showBackButton && (
            <>
              <button
                onClick={() => navigate(backButtonPath)}
                className="flex items-center gap-2 text-sm font-semibold text-[#64748b] hover:text-[#0f172a] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {backButtonText}
              </button>
              <div className="w-px h-5 bg-[#e2e8f0]"></div>
            </>
          )}
          
          {/* Page Title */}
          {pageTitle && (
            <h1 className="text-lg font-bold text-[#0f172a] tracking-tight">{pageTitle}</h1>
          )}
          
          {/* Search Bar */}
          {showSearch && (
            <div className="relative flex-1 max-w-xl ml-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="w-full pl-11 pr-4 py-3 bg-[#f1f5f9] border-0 rounded-lg text-sm font-medium text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#1121d4]/20 transition-all"
              />
            </div>
          )}
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-3 ml-6">
          {/* Custom Actions */}
          {customActions}
          
          {/* Refresh Button */}
          {showRefreshButton && onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#64748b] hover:text-[#0f172a] hover:bg-[#f6f6f8] rounded-lg transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              刷新
            </button>
          )}
          
          {/* My Shares Button */}
          {showMySharesButton && (
            <button
              onClick={() => navigate('/shares')}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#64748b] hover:text-[#0f172a] hover:bg-[#f6f6f8] rounded-lg transition-all"
            >
              <Share2 className="h-4 w-4" />
              我的分享
            </button>
          )}
          
          {/* Upload Button */}
          {showUploadButton && (
            <button className="flex items-center gap-2 px-6 py-2.5 bg-[#1121d4] hover:bg-[#0d19a8] text-white font-semibold text-sm rounded-xl shadow-[0px_10px_15px_-3px_rgba(17,33,212,0.2)] transition-all">
              <Upload className="h-4 w-4" />
              上传文件
            </button>
          )}
          
          {/* User Info with Dropdown */}
          {showUserInfo && (
            <div className="relative ml-2" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 hover:bg-[#f6f6f8] rounded-lg px-3 py-2 transition-all"
              >
                <div className="w-10 h-10 bg-[#1121d4] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{userInitials}</span>
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-[#0f172a]">{userName}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#1121d4]">{userRole}</div>
                </div>
                <ChevronDown className={`w-4 h-4 text-[#64748b] transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#e2e8f0] py-2 z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#ef4444] hover:bg-red-50 transition-colors"
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
  );
}
