import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Share2, Copy, Trash2, Calendar, Lock, Unlock, Check, AlertCircle, Loader2, FileText, AlertTriangle } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import ConfirmDialog from "@/components/ConfirmDialog";
import Toast from "@/components/Toast";
import { getMyShares, cancelShare, type Share } from "@/services/shareService";

export default function MyShares() {
  const navigate = useNavigate();
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({ open: false, title: "", description: "", onConfirm: () => {} });
  const [toast, setToast] = useState<{ open: boolean; message: string; type: "success" | "error" | "warning" | "info" }>({ open: false, message: "", type: "info" });

  useEffect(() => {
    fetchShares();
  }, []);

  const fetchShares = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await getMyShares();
      // 后端直接返回数组，确保不为 null
      setShares(response || []);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "获取分享列表失败");
      setShares([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelShare = (shareId: number) => {
    setConfirmDialog({
      open: true,
      title: "取消分享",
      description: "确定要取消这个分享吗？取消后其他人将无法访问此分享链接。",
      onConfirm: async () => {
        try {
          const response = await cancelShare(shareId);
          if (response.code === 200) {
            setShares(shares.filter(s => s.id !== shareId));
            setToast({ open: true, message: "分享已取消", type: "success" });
          } else {
            setToast({ open: true, message: response.msg || "取消分享失败", type: "error" });
          }
        } catch (err: any) {
          setToast({ open: true, message: err.response?.data?.msg || err.message || "取消分享失败", type: "error" });
        }
      }
    });
  };

  const handleCopyLink = (share: Share) => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/s/${share.share_code}`;
    const textToCopy = share.password 
      ? `${shareUrl}\n提取码: ${share.password}`
      : shareUrl;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(share.id);
      setToast({ open: true, message: "分享链接已复制", type: "success" });
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      setToast({ open: true, message: "复制失败，请手动复制", type: "error" });
    });
  };

  const formatExpireTime = (expireAt: string | null) => {
    if (!expireAt) return "永久有效";
    
    const expireDate = new Date(expireAt);
    const now = new Date();
    const diffMs = expireDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "已过期";
    if (diffDays === 0) return "今天过期";
    if (diffDays === 1) return "明天过期";
    return `${diffDays}天后过期`;
  };

  return (
    <div className="flex h-screen bg-[#f6f6f8]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar
          pageTitle="我的分享"
          showBackButton
          showRefreshButton
          onRefresh={fetchShares}
        />

        {/* Content Area - Editorial Spacing */}
        <main className="flex-1 overflow-auto p-8">
          {/* Page Title */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-display text-[#0f172a]">我的分享</h2>
              {shares && shares.length > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] bg-[#fafafa] px-3 py-1.5 rounded-lg">
                  {shares.length} 个分享
                </span>
              )}
            </div>
            <p className="text-sm text-[#64748b]">
              管理您创建的所有分享链接。
            </p>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-red-50 rounded-xl flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#0f172a] mb-1">加载失败</h3>
                <p className="text-sm text-[#64748b]">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-24">
              <Loader2 className="w-12 h-12 animate-spin text-[#1121d4] mx-auto mb-4" />
              <p className="text-sm font-semibold text-[#64748b]">加载中...</p>
            </div>
          ) : shares.length === 0 ? (
            <div className="bg-white rounded-xl p-16 text-center">
              <div className="w-20 h-20 bg-[#fafafa] rounded-full flex items-center justify-center mx-auto mb-6">
                <Share2 className="w-10 h-10 text-[#94a3b8]" />
              </div>
              <h3 className="text-headline text-[#0f172a] mb-2">暂无分享</h3>
              <p className="text-sm text-[#64748b] mb-8">您还没有创建任何分享链接</p>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2.5 bg-[#1121d4] hover:bg-[#0d19a8] text-white font-semibold text-sm rounded-xl shadow-[0px_10px_15px_-3px_rgba(17,33,212,0.2)] transition-all"
              >
                返回文件列表
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {shares.map((share) => {
                const isExpired = share.expire_at && new Date(share.expire_at) < new Date();
                
                return (
                  <div
                    key={share.id}
                    className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all ${
                      isExpired ? 'border-2 border-red-200' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-6">
                      {/* Left: Share Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            share.is_file_exist ? 'bg-blue-100' : 'bg-slate-100'
                          }`}>
                            <FileText className={`w-6 h-6 ${
                              share.is_file_exist ? 'text-blue-600' : 'text-slate-400'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-[#0f172a] truncate text-base">
                                {share.filename}
                              </h3>
                              {!share.is_file_exist && (
                                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-1 rounded">
                                  <AlertTriangle className="w-3 h-3" />
                                  已删除
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#64748b]">
                              分享码: <span className="font-mono font-semibold text-[#0f172a]">{share.share_code}</span>
                            </p>
                          </div>
                        </div>

                        {/* Share Details */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            {share.is_private ? (
                              <>
                                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                                  <Lock className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-[#64748b]">提取码</p>
                                  <p className="text-sm font-mono font-semibold text-[#0f172a]">{share.password}</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                  <Unlock className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-[#64748b]">访问权限</p>
                                  <p className="text-sm font-semibold text-[#0f172a]">无需密码</p>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isExpired ? 'bg-red-100' : 'bg-blue-100'
                            }`}>
                              <Calendar className={`w-4 h-4 ${
                                isExpired ? 'text-red-600' : 'text-blue-600'
                              }`} />
                            </div>
                            <div>
                              <p className="text-xs text-[#64748b]">有效期</p>
                              <p className={`text-sm font-semibold ${
                                isExpired ? 'text-red-600' : 'text-[#0f172a]'
                              }`}>
                                {formatExpireTime(share.expire_at)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Share Link */}
                        <div className="p-4 bg-[#fafafa] rounded-lg">
                          <p className="text-xs font-bold uppercase tracking-wider text-[#64748b] mb-2">分享链接</p>
                          <p className="text-sm font-mono text-[#0f172a] break-all">
                            {window.location.origin}/s/{share.share_code}
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleCopyLink(share)}
                          disabled={!!isExpired || !share.is_file_exist}
                          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                            copiedId === share.id
                              ? 'bg-emerald-100 text-emerald-700'
                              : isExpired || !share.is_file_exist
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-[#1121d4] text-white hover:bg-[#0d19a8] shadow-[0px_4px_8px_-2px_rgba(17,33,212,0.2)]'
                          }`}
                        >
                          {copiedId === share.id ? (
                            <>
                              <Check className="w-4 h-4" />
                              已复制
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              复制链接
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleCancelShare(share.id)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#ef4444] hover:bg-red-50 rounded-lg transition-all whitespace-nowrap"
                        >
                          <Trash2 className="w-4 h-4" />
                          取消分享
                        </button>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-5 pt-5 border-t border-[#e2e8f0] flex items-center justify-between">
                      <div className="text-xs text-[#64748b]">
                        创建于 {new Date(share.created_at).toLocaleString('zh-CN')}
                      </div>
                      {!share.is_file_exist && (
                        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          原文件已被删除，分享链接失效
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant="warning"
      />

      {/* Toast Notification */}
      <Toast
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
}
