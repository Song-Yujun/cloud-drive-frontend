import { useState } from "react";
import { X, KeyRound, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword, resetPassword } from "@/services/authService";

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ open, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSendCode = async () => {
    setError("");
    setSuccessMsg("");

    if (!email) {
      setError("请输入邮箱");
      return;
    }

    try {
      setSendingCode(true);
      const res = await forgotPassword({ email });
      if (res.code === 200) {
        setSuccessMsg(res.message || res.msg || "验证码已发送，请查收邮箱");
      } else {
        setError(res.message || res.msg || "发送失败");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "发送失败");
    } finally {
      setSendingCode(false);
    }
  };

  const handleReset = async () => {
    setError("");
    setSuccessMsg("");

    if (!token || !newPassword) {
      setError("请填写重置令牌和新密码");
      return;
    }
    if (newPassword.length < 6) {
      setError("新密码至少 6 位");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("两次输入的新密码不一致");
      return;
    }

    try {
      setResetting(true);
      const res = await resetPassword({ token, new_password: newPassword });
      if (res.code === 200) {
        setSuccessMsg(res.message || res.msg || "密码重置成功，请使用新密码登录");
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setError(res.message || res.msg || "重置失败");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "重置失败");
    } finally {
      setResetting(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setToken("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccessMsg("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-[#334155] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">忘记密码</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1e293b] transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl text-sm text-red-700 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <X className="w-3 h-3 text-red-600" />
              </div>
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-4 rounded-xl text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
              </div>
              <div className="flex-1">{successMsg}</div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-200">邮箱</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入注册邮箱"
              className="h-11 bg-slate-50 dark:bg-[#111b31] border-slate-200 dark:border-[#334155]"
              autoComplete="off"
            />
          </div>

          {/* Token and Send Button */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              重置令牌（邮箱中的 token）
            </Label>
            <div className="flex gap-2">
              <Input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="请输入邮件中的重置令牌"
                className="flex-1 h-11 bg-slate-50 dark:bg-[#111b31] border-slate-200 dark:border-[#334155]"
                autoComplete="off"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleSendCode}
                disabled={sendingCode}
                className="h-11 px-6 border-slate-200 dark:border-[#334155] hover:bg-slate-50 dark:hover:bg-[#1e293b] whitespace-nowrap"
              >
                {sendingCode ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    发送中
                  </>
                ) : (
                  "发送重置邮件"
                )}
              </Button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-200">新密码</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="请设置新密码"
              className="h-11 bg-slate-50 dark:bg-[#111b31] border-slate-200 dark:border-[#334155]"
              autoComplete="new-password"
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-200">确认新密码</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次输入新密码"
              className="h-11 bg-slate-50 dark:bg-[#111b31] border-slate-200 dark:border-[#334155]"
              autoComplete="new-password"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="button"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base"
            onClick={handleReset}
            disabled={resetting}
          >
            {resetting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                重置中...
              </>
            ) : (
              "确认重置"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
