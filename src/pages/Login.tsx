// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2, Eye, EyeOff, Cloud, Shield, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/services/authService";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
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

    try {
      const res = await login({ username, password });
      
      if (res.token) {
        localStorage.setItem("token", res.token);
        navigate("/");
      } else {
        setError("登录成功但未获取到 Token");
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "登录失败，请检查账号密码";
      setError(msg);
    } finally {
      setLoading(false);
    }
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
            onClick={() => navigate("/register")}
          >
            帮助
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Left Side - Login Form */}
          <div className="p-12">
            <div className="max-w-md mx-auto">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">欢迎回来</h1>
              <p className="text-slate-600 mb-8">随时随地安全访问你的个人文件</p>

              {error && (
                <div className="mb-6 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-slate-700">
                    邮箱或用户名
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="name@example.com"
                      className="pl-10 h-12 bg-slate-50 border-slate-200"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loading}
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                      密码
                    </Label>
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      忘记密码？
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-12 bg-slate-50 border-slate-200"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      autoComplete="current-password"
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

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-slate-600 cursor-pointer"
                  >
                    记住我
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      登录中...
                    </>
                  ) : (
                    <>
                      登录
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-slate-600">
                  还没有账号？{' '}
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    立即注册
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
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">端到端加密</h3>
                    <p className="text-sm text-blue-100">您的数据始终受保护</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-white/60 rounded-full"></div>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-white/60 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Middle Content */}
              <div className="text-center py-8">
                <h2 className="text-3xl font-bold mb-4">企业级安全保障</h2>
                <p className="text-blue-100 text-lg mb-8">
                  加入超过 200 万用户的行列，信任我们的云<br />
                  基础设施来保护他们最敏感的数字资产。
                </p>
                <div className="flex justify-center gap-8">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">数据加密</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">安全备份</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">隐私保护</span>
                  </div>
                </div>
              </div>

              {/* Bottom Icons */}
              <div className="flex justify-center gap-6 opacity-60">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <Cloud className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-8 py-4 text-center text-sm text-slate-500">
        2024 Personal Cloud Drive Inc. · 使用条款和政策 · 隐私政策 · 商务登录
      </footer>
    </div>
  );
}