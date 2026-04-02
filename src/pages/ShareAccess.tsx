import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Download, Lock, FileText, Cloud, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verifyShare, downloadSharedFile } from "@/services/shareService";
import { formatFileSize } from "@/utils/fileUtils";

export default function ShareAccess() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [fileInfo, setFileInfo] = useState<{
    file_name: string;
    file_size: number;
    file_type: string;
    mime_type: string;
    created_at: string;
  } | null>(null);

  // 尝试无密码访问
  useEffect(() => {
    if (code) {
      tryVerify();
    }
  }, [code]);

  const tryVerify = async (pwd?: string) => {
    if (!code) return;
    
    setVerifying(true);
    setError("");

    try {
      const response = await verifyShare(code, pwd ? { password: pwd } : undefined);
      
      if (response.code === 200) {
        setFileInfo(response.data);
      } else {
        setError(response.msg || "验证失败");
      }
    } catch (err: any) {
      const msg = err.response?.data?.msg || err.message;
      if (msg.includes("密码") || msg.includes("提取码")) {
        setError("需要提取码");
      } else {
        setError(msg || "分享链接无效或已过期");
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleVerify = () => {
    if (!password.trim()) {
      setError("请输入提取码");
      return;
    }
    tryVerify(password);
  };

  const handleDownload = () => {
    if (!code) return;
    
    setLoading(true);
    const downloadUrl = downloadSharedFile(code, password || undefined);
    
    // 创建隐藏的 a 标签触发下载
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileInfo?.file_name || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="px-8 py-4 flex items-center justify-between bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">轻传文件系统</span>
        </div>
        <Button
          variant="default"
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate("/login")}
        >
          登录
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Icon Header */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">文件分享</h1>
              <p className="text-blue-100 text-sm">
                {code ? `分享码: ${code}` : "无效的分享链接"}
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              {verifying ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                  <p className="text-slate-600">验证中...</p>
                </div>
              ) : fileInfo ? (
                // 验证成功，显示文件信息
                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">文件名</span>
                      <span className="text-sm font-medium text-slate-900">{fileInfo.file_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">大小</span>
                      <span className="text-sm font-medium text-slate-900">
                        {formatFileSize(fileInfo.file_size)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">类型</span>
                      <span className="text-sm font-medium text-slate-900">{fileInfo.file_type}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleDownload}
                    disabled={loading}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        下载中...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        下载文件
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-slate-500">
                    下载后请及时保存，链接可能会过期
                  </p>
                </div>
              ) : (
                // 需要输入提取码
                <div className="space-y-6">
                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Lock className="w-4 h-4" />
                      请输入提取码
                    </label>
                    <Input
                      type="text"
                      placeholder="请输入提取码"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                      className="h-12 text-center text-lg tracking-wider"
                      maxLength={20}
                    />
                  </div>

                  <Button
                    onClick={handleVerify}
                    disabled={!password.trim()}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    验证并查看
                  </Button>

                  <div className="text-center">
                    <p className="text-xs text-slate-500">
                      如果您没有提取码，请联系分享者
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Tips */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              使用轻传文件系统，安全分享您的文件
            </p>
            <button
              onClick={() => navigate("/register")}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2"
            >
              立即注册 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
