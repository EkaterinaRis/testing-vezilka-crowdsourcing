import {
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  AlertCircle,
  Key,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { saveAuth } from "../utils/auth";

export default function RegisterPage() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    code: "",
  });

  const [codeSent, setCodeSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);

  useEffect(() => {
    document.title = "Регистрација";
  }, []);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (e) => {
    setError("");
    setForm({
      ...form,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (codeSent && !form.code) {
      setError("Внеси го кодот за потврда испратен на твојата е-пошта.");
      return;
    }

    let res;
    try {
      res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
    } catch (networkErr) {
      setError(
        "Во моментот не може да пристапиме до серверот. Проверете ја вашата интернет врска и обидете се повторно.",
      );
      return;
    }

    try {
      if (!res.ok) {
        const msg = await res.text();
        if (res.status == 400)
          setError(
            "Внесените податоци се невалидни или кодот за верификација е погрешен. Провери ги полињата.",
          );
        else if (res.status == 409)
          setError("Веќе постои сметка со оваа е-пошта.");
        else
          setError(
            "Нешто тргна наопаку. Провери ја врската и обиди се повторно.",
          );
        return;
      }

      const data = await res.json();
      saveAuth(data);
      navigate("/dashboard");
    } catch (err) {
      console.error(err.message);
      setError("Настана неочекувана грешка. Обиди се повторно.");
    }
  };

  const handleSendCode = async () => {
    if (!form.email) {
      setError("Внеси валидна е-пошта за да го испратиме кодот.");
      return;
    }

    setIsSendingCode(true);
    setError("");

    let res;
    try {
      res = await fetch(`${BACKEND_URL}/api/auth/register/send-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: form.email }),
      });
    } catch (networkErr) {
      setError(
        "Во моментот не може да пристапиме до серверот. Проверете ја вашата интернет врска и обидете се повторно.",
      );
      setIsSendingCode(false);
      return;
    }

    try {
      if (!res.ok) {
        throw new Error(
          "Не успеавме да го испратиме кодот. Обиди се повторно.",
        );
      }

      setCodeSent(true);
      setCooldown(30);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSendingCode(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <a className="text-2xl font-bold text-gradient" href="/">
            Везилка
          </a>
          <h1 className="mt-6 text-2xl font-bold">Создај сметка</h1>
          <p className="mt-2 text-muted-foreground">
            Придружи се на заедницата за развивање на македонската вештачка
            интелигенција
          </p>
        </div>
        <div className="p-8 border bg-card border-border rounded-2xl card-elevated">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="firstName"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Име
              </label>
              <div className="relative mt-2">
                <Mail className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground"></Mail>
                <input
                  className="flex w-full h-10 px-3 py-2 pl-10 text-base border rounded-md border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  id="firstName"
                  placeholder="Петко"
                  value={form.firstName}
                  onChange={handleChange}
                  type="text"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="lastName"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Презиме
              </label>
              <div className="relative mt-2">
                <Mail className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground"></Mail>
                <input
                  className="flex w-full h-10 px-3 py-2 pl-10 text-base border rounded-md border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  id="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Петковски"
                  type="text"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Е-пошта
              </label>
              <div className="relative flex items-center mt-2">
                <Mail className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground"></Mail>
                <input
                  className="flex w-full h-10 px-3 py-2 pl-10 pr-[110px] text-base border rounded-md border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  id="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  type="email"
                  required
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={cooldown > 0 || isSendingCode || !form.email}
                  className="absolute h-8 px-3 text-xs font-medium transition-colors border rounded-sm right-1 bg-background border-input hover:bg-accent hover:text-accent-foreground text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingCode
                    ? "Испраќање..."
                    : cooldown > 0
                      ? `Почекај ${cooldown}s`
                      : "Испрати код"}
                </button>
              </div>
            </div>
            {codeSent && (
              <div className="space-y-2 duration-300 animate-in fade-in slide-in-from-top-2">
                <label
                  htmlFor="code"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Код за потврда
                </label>
                <div className="relative mt-2">
                  <Key className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground"></Key>
                  <input
                    className="flex w-full h-10 px-3 py-2 pl-10 text-base border rounded-md border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
                    id="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="123456"
                    type="text"
                    required
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Лозинка
              </label>
              <div className="relative mt-2">
                <Lock className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground"></Lock>
                <input
                  className="flex w-full h-10 px-3 py-2 pl-10 text-base border rounded-md border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  id="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  type="password"
                  required
                />
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <button
              className="inline-flex mt-5 cursor-pointer items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-xl px-8 w-full gap-2"
              type="submit"
            >
              Создај сметка <ArrowRight className="w-4 h-4"></ArrowRight>
            </button>
          </form>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center w-full gap-2 px-8 mt-3 text-sm font-medium transition-colors border cursor-pointer whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-border bg-card hover:bg-muted h-11 rounded-xl"
            type="button"
          >
            <ArrowLeft className="w-4 h-4" /> Назад
          </button>
          <p className="mt-6 text-sm text-center text-muted-foreground">
            Веќе имаш сметка?{" "}
            <a
              className="font-medium text-primary hover:underline"
              href="/login"
            >
              Најави се
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
