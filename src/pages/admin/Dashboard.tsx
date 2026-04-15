import { useEffect, useState } from "react";
import { Users, UserCheck, Shield, Files, HardDrive, Trash2 } from "lucide-react";
import { getSystemStats, SystemStats } from "@/services/adminService";
import { formatFileSize } from "@/utils/adminUtils";

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getSystemStats();
      if (response.code === 200) {
        setStats(response.data);
      } else {
        setError(response.message || "获取统计信息失败");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "获取统计信息失败");
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats
    ? [
        {
          title: "总用户数",
          value: stats.total_users,
          icon: Users,
          color: "bg-blue-500",
          bgColor: "bg-blue-50",
          textColor: "text-blue-600",
        },
        {
          title: "活跃用户",
          value: stats.active_users,
          icon: UserCheck,
          color: "bg-green-500",
          bgColor: "bg-green-50",
          textColor: "text-green-600",
        },
        {
          title: "管理员数量",
          value: stats.admin_users,
          icon: Shield,
          color: "bg-purple-500",
          bgColor: "bg-purple-50",
          textColor: "text-purple-600",
        },
        {
          title: "总文件数",
          value: stats.total_files,
          icon: Files,
          color: "bg-orange-500",
          bgColor: "bg-orange-50",
          textColor: "text-orange-600",
        },
        {
          title: "存储空间",
          value: formatFileSize(stats.total_storage_size),
          icon: HardDrive,
          color: "bg-indigo-500",
          bgColor: "bg-indigo-50",
          textColor: "text-indigo-600",
        },
        {
          title: "回收站文件",
          value: stats.deleted_files,
          icon: Trash2,
          color: "bg-red-500",
          bgColor: "bg-red-50",
          textColor: "text-red-600",
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">系统概览</h1>
        <p className="text-slate-500 mt-1">查看系统整体运行状态和统计数据</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-slate-900">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
