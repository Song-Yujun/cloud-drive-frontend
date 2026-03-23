import { useState } from "react";
import { Copy, Check, Share2, Lock, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createShare } from "@/services/shareService";

interface ShareDialogProps {
  fileId: number;
  fileName: string;
  onClose: () => void;
}

export default function ShareDialog({ fileId, fileName, onClose }: ShareDialogProps) {
  const [password, setPassword] = useState("");
  const [expireDays, setExpireDays] = useState(7);
  const [shareUrl, setShareUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleCreateShare = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await createShare({
        file_id: fileId,
        password: password || undefined,
        expire_days: expireDays === 0 ? 0 : expireDays,
      });

      if (response.code === 200) {
        setShareUrl(response.data.share_url);
      } else {
        setError(response.msg || "创建分享失败");
      }
    } catch (err: any) {
      setError(err.response?.data?.msg || err.message || "创建分享失败");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = password 
      ? `${shareUrl}\n提取码: ${password}`
      : shareUrl;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Share2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">分享文件</h2>
              <p className="text-sm text-slate-500 truncate max-w-xs">{fileName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {!shareUrl ? (
            <>
              {/* 提取码设置 */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Lock className="w-4 h-4" />
                  提取码（可选）
                </Label>
                <Input
                  id="password"
                  type="text"
                  placeholder="留空则无需提取码"
                  maxLength={20}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                />
                <p className="text-xs text-slate-500">设置提取码可以保护您的文件安全</p>
              </div>

              {/* 有效期设置 */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Calendar className="w-4 h-4" />
                  有效期
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 7, 30, 0].map((days) => (
                    <button
                      key={days}
                      onClick={() => setExpireDays(days)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        expireDays === days
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {days === 0 ? "永久" : `${days}天`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 创建按钮 */}
              <Button
                onClick={handleCreateShare}
                disabled={loading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "创建中..." : "创建分享链接"}
              </Button>
            </>
          ) : (
            <>
              {/* 分享成功 */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">分享链接已创建</span>
                </div>
                <div className="space-y-2">
                  <div className="bg-white rounded p-3 border border-green-200">
                    <p className="text-xs text-slate-500 mb-1">分享链接</p>
                    <p className="text-sm text-slate-900 break-all">{shareUrl}</p>
                  </div>
                  {password && (
                    <div className="bg-white rounded p-3 border border-green-200">
                      <p className="text-xs text-slate-500 mb-1">提取码</p>
                      <p className="text-sm font-mono text-slate-900">{password}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 复制按钮 */}
              <Button
                onClick={handleCopy}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    复制链接{password ? "和提取码" : ""}
                  </>
                )}
              </Button>

              {/* 提示 */}
              <p className="text-xs text-center text-slate-500">
                {expireDays === 0
                  ? "此链接永久有效"
                  : `此链接将在 ${expireDays} 天后失效`}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
