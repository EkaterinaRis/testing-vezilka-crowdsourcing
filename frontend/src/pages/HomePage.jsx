import Navbar from "../components/Navbar.jsx";
import {
  ArrowRight,
  Sparkles,
  Upload,
  CheckCircle,
  Star,
  Gift,
} from "lucide-react";
import { motion } from "framer-motion";
import Button from "../components/Button.jsx";
import { NavLink, useLocation } from "react-router-dom";
import { FileText, Mic, Video, Shield, Users, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { getHomePageStats } from "../api/userApi.js";
import { formatCompactNumber } from "../utils/formatCompactNumber.js";

export default function HomePage() {
  const location = useLocation();

  useEffect(() => {
    document.title = "Почетна";
  }, []);

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.replace("#", ""));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  return (
    <>
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <Footer />
    </>
  );
}

function StatSkeleton() {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-2">
        <svg
          className="w-8 h-8 animate-spin text-primary/40"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
      <div className="w-16 h-3 mx-auto mt-1 rounded-full bg-muted-foreground/20 animate-pulse" />
    </div>
  );
}

function HeroSection() {
  const [stats, setStats] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await getHomePageStats();
        const formattedResult = result.map((item) => ({
          ...item,
          value: formatCompactNumber(item.value),
        }));
        setStats(formattedResult);
        setLoadingStats(false);
      } catch {
        setLoadingStats(true);
      }
    };

    fetchStats();
  }, []);

  return (
    <section
      id="hero"
      className="relative pb-16 overflow-hidden pt-28 sm:pt-32 sm:pb-20 md:pt-44 md:pb-32"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] rounded-full hero-gradient opacity-[0.07] blur-3xl" />
      </div>

      <div className="container px-4 mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Поддршка за вештачка интелигенција на македонски јазик</span>
          </div>
        </motion.div>

        <motion.h1
          className="max-w-4xl mx-auto text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {"Помогни во градењето на иднината на\n"}
          <span className="text-gradient">македонската ВИ</span>
        </motion.h1>

        <motion.p
          className="max-w-2xl mx-auto mt-4 text-base leading-relaxed sm:mt-6 sm:text-lg md:text-xl text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Придонеси со текст, аудио и видео податоци за тренирање на јазични
          модели што го разбираат и зборуваат македонскиот јазик. Заработи
          награди додека го зачувуваш својот јазик.
        </motion.p>

        <motion.div
          className="flex flex-col justify-center gap-3 mt-8 sm:flex-row sm:gap-4 sm:mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <NavLink to="/register" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full gap-2 px-6 text-sm sm:w-auto sm:px-8 sm:text-base"
            >
              Започни да придонесуваш <ArrowRight className="w-4 h-4" />
            </Button>
          </NavLink>
          <NavLink to="#how-it-works" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full px-6 text-sm sm:w-auto sm:px-8 sm:text-base"
            >
              Дознај повеќе
            </Button>
          </NavLink>
        </motion.div>

        <motion.div
          className="grid max-w-xs grid-cols-2 gap-6 mx-auto mt-12 sm:max-w-md sm:gap-8 sm:mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {loadingStats
            ? Array.from({ length: 2 }).map((_, i) => <StatSkeleton key={i} />)
            : stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-xl font-bold sm:text-2xl md:text-3xl text-foreground">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
        </motion.div>
      </div>
    </section>
  );
}

const HowItWorksSection = () => {
  const steps = [
    {
      icon: Upload,
      key: "upload",
      color: "bg-primary/10 text-primary",
      title: "Прикачи",
      description:
        "Сподели текст, аудио или видео на македонски. Секој придонес е важен.",
    },
    {
      icon: Star,
      key: "earn",
      color: "bg-warning/10 text-warning",
      title: "Освои поени",
      description: "Биди награден за секој придонес и преглед што го правиш.",
    },
    {
      icon: Gift,
      key: "redeem",
      color: "bg-destructive/10 text-destructive",
      title: "Искористи награди",
      description:
        "Размени поени за курсеви, погодности и ексклузивни награди.",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-32">
      <div className="container px-4 mx-auto">
        <div className="mb-10 text-center sm:mb-16">
          <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
            Како функционира
          </h2>
          <p className="max-w-xl mx-auto mt-3 text-base sm:mt-4 sm:text-lg text-muted-foreground">
            Три едноставни чекори за придонес кон македонската јазична ВИ
          </p>
        </div>

        <div className="grid max-w-5xl grid-cols-1 gap-4 mx-auto sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.key}
              className="relative p-5 text-center border sm:p-6 rounded-2xl bg-card card-elevated border-border"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="mb-3 text-xs font-bold sm:mb-4 text-muted-foreground">
                Чекор {i + 1}
              </div>
              <div
                className={`inline-flex p-3 rounded-xl ${step.color} mb-3 sm:mb-4`}
              >
                <step.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="mb-2 text-base font-semibold sm:text-lg">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

function FeaturesSection() {
  const features = [
    {
      icon: FileText,
      key: "text",
      title: "Текстуални податоци",
      description: "Поднеси статии, реченици и преводи на македонски.",
    },
    {
      icon: Mic,
      key: "audio",
      title: "Аудио податоци",
      description:
        "Сними говорни примероци за тренирање на гласовно препознавање.",
    },
    {
      icon: Video,
      key: "video",
      title: "Видео податоци",
      description: "Прикачи видеа со македонски говор за мултимодална ВИ.",
    },
    {
      icon: Shield,
      key: "quality",
      title: "Загарантиран квалитет",
      description:
        "Прегледот од заедницата обезбедува висококвалитетни податоци.",
    },
    {
      icon: Users,
      key: "community",
      title: "Заедница",
      description:
        "Придружи се на илјадници придонесувачи што го зачувуваат македонскиот.",
    },
    {
      icon: Trophy,
      key: "gamified",
      title: "Со награди",
      description:
        "Освојувај значки, искачувај се на ранг-листи и отклучувај достигнувања.",
    },
  ];

  return (
    <section id="features" className="py-16 md:py-32 bg-secondary/50">
      <div className="container px-4 mx-auto">
        <div className="mb-10 text-center sm:mb-16">
          <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
            Што можеш да правиш
          </h2>
          <p className="max-w-xl mx-auto mt-3 text-base sm:mt-4 sm:text-lg text-muted-foreground">
            Повеќе начини да придонесеш и да оставиш печат
          </p>
        </div>

        <div className="grid max-w-5xl grid-cols-1 gap-4 mx-auto sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.key}
              className="p-5 border sm:p-6 rounded-2xl bg-card border-border card-elevated"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div className="inline-flex p-2.5 rounded-lg bg-primary/10 text-primary mb-3 sm:mb-4">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="mb-1.5 sm:mb-2 text-sm sm:text-base font-semibold">
                {f.title}
              </h3>
              <p className="text-xs leading-relaxed sm:text-sm text-muted-foreground">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-10 border-t sm:py-12 border-border">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col items-center gap-5 sm:gap-6 md:flex-row md:justify-between">
          <div className="text-lg font-bold text-gradient">Везилка</div>
          <div className="flex flex-wrap justify-center gap-5 text-sm sm:gap-8 text-muted-foreground">
            <a href="#hero" className="transition-colors hover:text-foreground">
              Почетна
            </a>
            <a
              href="#how-it-works"
              className="transition-colors hover:text-foreground"
            >
              Kako функционира
            </a>
            <a
              href="#features"
              className="transition-colors hover:text-foreground"
            >
              Можности
            </a>
          </div>
          <p className="text-xs text-center sm:text-sm text-muted-foreground md:text-right">
            © 2026 Везилка. Сите права се задржани.
          </p>
        </div>
      </div>
    </footer>
  );
}
