import Sidebar from "../components/Sidebar.jsx";
import { Star, BookOpen, Award, Zap, Gift } from "lucide-react";
import Button from "../components/Button.jsx";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function RewardsPage() {
  const rewards = [
    {
      key: "course",
      cost: 500,
      icon: BookOpen,
      title: "Курс по македонска ОЈП",
      description: "Онлајн курс за обработка на природен јазик за македонски.",
    },
    {
      key: "badge",
      cost: 200,
      icon: Award,
      title: "Значка за придонесувач",
      description: "Ексклузивна дигитална значка за твојот профил.",
    },
    {
      key: "premium",
      cost: 1000,
      icon: Zap,
      title: "Премиум функции",
      description: "Пристап до напредна аналитика и алатки за 30 дена.",
    },
    {
      key: "merch",
      cost: 1500,
      icon: Gift,
      title: "Везилка артикли",
      description: "Маица и стикери од заедницата на Везилка.",
    },
  ];

  useEffect(() => {
    document.title = "Награди";
  }, []);

  const user = { points: 1000 };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeButtonIndex={3} />

      <main className="flex-1 pb-20 overflow-auto pt-14 lg:pt-0 lg:pb-0">
        <div className="max-w-6xl px-4 py-6 mx-auto sm:px-6 md:px-8 md:py-8">
         
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
              Награди
            </h1>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">
              Размени ги твоите поени за ексклузивни погодности
            </p>
          </div>

          <div className="p-4 mb-6 border bg-card border-border rounded-2xl sm:p-6 md:p-8 sm:mb-8 card-elevated">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 rounded-xl bg-warning/10 text-warning shrink-0">
                <Star className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Твој баланс
                </p>
                <p className="text-2xl font-bold sm:text-3xl">
                  {user.points} поени
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            {rewards.map((reward, i) => {
              const canAfford = user.points >= reward.cost;
              return (
                <motion.div
                  key={reward.key}
                  className="p-4 border bg-card border-border rounded-2xl sm:p-6 card-elevated"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                      <reward.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold sm:text-base">
                        {reward.title}
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                        {reward.description}
                      </p>

                      <div className="flex flex-col gap-2 mt-4 sm:flex-row sm:items-center sm:justify-between">
                        <span className="inline-flex items-center gap-1 text-sm font-medium">
                          <Star className="w-3.5 h-3.5 text-warning shrink-0" />
                          {reward.cost} поени
                        </span>
                        <Button
                          size="sm"
                          disabled={!canAfford}
                          className="w-full sm:w-auto"
                        >
                          {canAfford ? "Размени" : "Нема доволно средства"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
