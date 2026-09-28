import { Star, Upload, Gift, SquareCheckBig } from "lucide-react";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import RecentActivities from "../components/RecentActivities";
import { getUser, userCanReview } from "../utils/auth";
import { useEffect, useState } from "react";
import { getUserDashboardStats } from "../api/userApi";

export default function DashboardPage() {
  const user = getUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(null);

  useEffect(() => {
    document.title = "Контролна табла";
  }, []);

  useEffect(() => {
    const fetchReviewStatus = async () => {
      try {
        const result = await userCanReview();
        setCanReview(result);
      } catch {
        setCanReview(false);
      }
    };

    fetchReviewStatus();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getUserDashboardStats();
      setStats(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div />;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 pb-20 overflow-auto pt-14 lg:pt-0 lg:pb-0">
        <div className="max-w-6xl px-4 py-6 mx-auto sm:px-6 md:px-8 md:py-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
              Добредојде назад, {user.firstName} 👋
            </h1>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">
              Еве преглед на твоите придонеси
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6 sm:gap-4 sm:mb-8 lg:grid-cols-4">
            <StatCard
              title="Вкупно поени"
              statValue={stats.totalPoints}
              Icon={Star}
              bgClass="bg-warning/10"
              textClass="text-warning"
              i={0}
            />
            <StatCard
              title="Прикачувања"
              statValue={stats.totalUploads}
              Icon={Upload}
              bgClass="bg-primary/10"
              textClass="text-primary"
              i={1}
            />
            <StatCard
              title="Достапни награди"
              statValue={stats.totalRewards}
              Icon={Gift}
              bgClass="bg-accent/10"
              textClass="text-accent"
              i={2}
            />
            <StatCard
              title="Ранг"
              statValue={"#" + stats.rank}
              Icon={Star}
              bgClass="bg-destructive/10"
              textClass="text-destructive"
              i={3}
            />
          </div>

          <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:gap-4 sm:mb-8">
            <a className="flex-1 block" href="/upload">
              <div className="flex items-center gap-3 p-4 border sm:gap-4 sm:p-6 bg-card border-border rounded-xl card-elevated">
                <div className="p-2.5 sm:p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold sm:text-base">
                    Прикачи содржина
                  </h3>
                  <p className="text-xs truncate sm:text-sm text-muted-foreground">
                    Сподели текст, аудио или видео податоци
                  </p>
                </div>
              </div>
            </a>

            {canReview && (
              <a className="flex-1 block" href="/admin">
                <div className="flex items-center gap-3 p-4 border sm:gap-4 sm:p-6 bg-card border-border rounded-xl card-elevated">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-accent/10 text-accent shrink-0">
                    <SquareCheckBig className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold sm:text-base">
                      Прегледај содржина
                    </h3>
                    <p className="text-xs truncate sm:text-sm text-muted-foreground">
                      Помогни во проверката на поставените податоци
                    </p>
                  </div>
                </div>
              </a>
            )}
          </div>

          <RecentActivities />
        </div>
      </main>
    </div>
  );
}
