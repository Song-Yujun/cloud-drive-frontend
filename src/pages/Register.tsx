// src/pages/Register.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, Mail, Loader2, Eye, EyeOff, Cloud, Shield, CheckCircle, ArrowRight, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { register } from "@/services/authService";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username || !password) {
      setError("请填写用户名和密码");
      setLoading(false);
      return;
    }

    if (!email) {
      setError("注册时需要填写邮箱");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("密码长度至少为6位");
      setLoading(false);
      return;
    }

    try {
      const res = await register({ username, password, email });
      if (res.code === 200) {
        setShowSuccessDialog(true);
      } else {
        setError(res.message || "注册失败");
      }
    } catch (err: any) {
      console.error(err);

      // 根据不同的错误类型显示不同的提示
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
        setError("无法连接到服务器，请检查网络连接或稍后重试");
      } else if (err.response?.status === 409) {
        setError(err.response?.data?.message || "用户名或邮箱已被注册");
      } else {
        const msg = err.response?.data?.message || err.message || "注册失败，请稍后重试";
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">个人云盘</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">支持</span>
          <Button 
            variant="default"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate("/login")}
          >
            登录
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Left Side - Register Form */}
          <div className="p-12">
            <div className="max-w-md mx-auto">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">创建账户</h1>
              <p className="text-slate-600 mb-8">开始您的云存储之旅，安全便捷</p>

              {error && (
                <div className="mb-6 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-slate-700">
                    用户名
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="请输入用户名"
                      className="pl-10 h-12 bg-slate-50 border-slate-200"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loading}
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    邮箱地址
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10 h-12 bg-slate-50 border-slate-200"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                    密码
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="至少6位密码"
                      className="pl-10 pr-10 h-12 bg-slate-50 border-slate-200"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                    确认密码
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="再次输入密码"
                      className="pl-10 h-12 bg-slate-50 border-slate-200"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer">
                    我同意{' '}
                    <button type="button" className="text-blue-600 hover:text-blue-700">
                      服务条款
                    </button>
                    {' '}和{' '}
                    <button type="button" className="text-blue-600 hover:text-blue-700">
                      隐私政策
                    </button>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base"
                  disabled={loading || !agreeTerms}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      注册中...
                    </>
                  ) : (
                    <>
                      创建账户
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-slate-600">
                  已有账户？{' '}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    立即登录
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Side - Feature Showcase */}
          <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-12 text-white overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)',
              }}></div>
            </div>

            <div className="relative z-10 h-full flex flex-col justify-between">
              {/* Top Card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">快速开始</h3>
                    <p className="text-sm text-blue-100">几分钟内即可完成设置</p>
                  </div>
                </div>
              </div>

              {/* Middle Content */}
              <div className="text-center py-8">
                <h2 className="text-3xl font-bold mb-4">加入我们的社区</h2>
                <p className="text-blue-100 text-lg mb-8">
                  超过 200 万用户信赖我们的云存储服务<br />
                  安全、快速、可靠的文件管理体验
                </p>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Users className="w-8 h-8" />
                    </div>
                    <div className="text-2xl font-bold">200万+</div>
                    <div className="text-sm text-blue-100">活跃用户</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Shield className="w-8 h-8" />
                    </div>
                    <div className="text-2xl font-bold">100%</div>
                    <div className="text-sm text-blue-100">数据加密</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <div className="text-2xl font-bold">99.9%</div>
                    <div className="text-sm text-blue-100">可用性</div>
                  </div>
                </div>
              </div>

              {/* Bottom Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span>10GB 免费存储空间</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span>多设备同步</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span>7x24 技术支持</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-8 py-4 text-center text-sm text-slate-500">
        © 2024 Personal Cloud Drive Inc. · 使用条款和政策 · 隐私政策 · 商务登录
      </footer>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <AlertDialogTitle className="text-xl">注册成功！</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base text-slate-600">
              您的账户已创建成功，现在可以使用您的账号登录了。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              onClick={handleSuccessDialogClose}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700"
            >
              前往登录
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
