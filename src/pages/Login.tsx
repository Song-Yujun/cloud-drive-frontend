import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2, Eye, EyeOff, Cloud, Shield, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/services/authService";
import ForgotPasswordModal from "@/components/ForgotPasswordModal";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.SyntheticEvent) => {
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
      if (res.code === 200 && res.data?.token) {
        localStorage.setItem("token", res.data.token);
        if (rememberMe) localStorage.setItem("remember-username", username);
        else localStorage.removeItem("remember-username");
        navigate("/");
      } else {
        setError(res.message || "登录失败");
      }
    } catch (err: any) {
      if (err.code === "ERR_NETWORK" || err.code === "ECONNABORTED") {
        setError("无法连接到服务器，请检查网络连接或稍后重试");
      } else if (err.response?.status === 401) {
        setError(err.response?.data?.message || "用户名或密码错误");
      } else {
        setError(err.response?.data?.message || err.message || "登录失败，请稍后重试");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const remembered = localStorage.getItem("remember-username");
    if (remembered) {
      setUsername(remembered);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fbff] via-[#f5f7ff] to-[#eef3ff] dark:from-[#020617] dark:via-[#0b1224] dark:to-[#0f172a] flex flex-col">
      <header className="px-8 py-5 flex items-center justify-between bg-white/70 dark:bg-[#0f172a]/70 backdrop-blur-sm border-b border-white/30 dark:border-[#1e293b]">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-slate-900 dark:text-white">轻传文件系统</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6 md:p-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-white/90 dark:bg-[#0f172a]/95 rounded-3xl shadow-2xl overflow-hidden border border-white/40 dark:border-[#1e293b] min-h-[650px]">
          <div className="p-8 md:p-12 flex items-center dark:bg-[#0b1222]">
            <div className="w-full max-w-md mx-auto">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">欢迎回来</h1>
              <p className="text-slate-500 dark:text-slate-300 mb-8 text-sm">随时随地安全访问您的个人文件</p>

              {error && <div className="mb-6 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/30">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-slate-700 dark:text-slate-200">邮箱或用户名</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="username" type="text" placeholder="name@example.com" className="pl-10 h-11 bg-slate-50 dark:bg-[#111b31] border-slate-200 dark:border-[#334155] rounded-lg" value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading} autoComplete="username" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-200">密码</Label>
                    <button type="button" onClick={() => setForgotPasswordOpen(true)} className="text-sm text-blue-600 hover:text-blue-700 font-medium">忘记密码？</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10 h-11 bg-slate-50 dark:bg-[#111b31] border-slate-200 dark:border-[#334155] rounded-lg" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} autoComplete="current-password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" disabled={loading}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="remember" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                  <label htmlFor="remember" className="text-sm text-slate-600 dark:text-slate-300 cursor-pointer">记住我</label>
                </div>

                <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base rounded-lg" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />登录中...</> : <>登录<ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>

                <div className="text-center text-sm text-slate-600 dark:text-slate-300 pt-2">还没有账号？ <button type="button" onClick={() => navigate("/register")} className="text-blue-600 hover:text-blue-700 font-medium">立即注册</button></div>
              </form>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950 p-12 text-white overflow-hidden hidden lg:block">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0"><Shield className="w-6 h-6" /></div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">端到端加密</h3>
                    <p className="text-sm text-blue-100">您的数据由您掌控</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden"><div className="h-full w-3/4 bg-white/70 rounded-full" /></div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden"><div className="h-full w-1/2 bg-white/50 rounded-full" /></div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden"><div className="h-full w-full bg-white/70 rounded-full" /></div>
                </div>
              </div>

              <div className="text-center py-8">
                <h2 className="text-3xl font-bold mb-4">企业级安全保障</h2>
                <p className="text-blue-100 text-lg leading-relaxed mb-8">加密、备份、隐私三重保护，守护您的数字资产</p>
                <div className="flex justify-center gap-8">
                  <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5" /><span className="text-sm">数据加密</span></div>
                  <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5" /><span className="text-sm">安全备份</span></div>
                  <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5" /><span className="text-sm">隐私保护</span></div>
                </div>
              </div>

              <div className="flex justify-center gap-6">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10"><CheckCircle className="w-7 h-7" /></div>
                <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10"><Shield className="w-7 h-7" /></div>
                <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10"><Cloud className="w-7 h-7" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="px-8 py-4 text-center text-xs text-slate-500 dark:text-slate-400">© 2024 Personal Cloud Drive Inc. 隐私政策 · 服务条款</footer>

      <ForgotPasswordModal open={forgotPasswordOpen} onClose={() => setForgotPasswordOpen(false)} />
    </div>
  );
}
