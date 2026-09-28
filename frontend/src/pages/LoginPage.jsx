import { ArrowRight, Lock, Mail, AlertCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { saveAuth } from "../utils/auth";

export default function LoginPage() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    document.title = "Најава";
  }, []);

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

    let res;
    try {
      res = await fetch(`${BACKEND_URL}/api/auth/login`, {
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
        if (res.status === 400 || res.status === 403) {
          setError("Погрешна е-пошта или лозинка. Обиди се повторно.");
        } else if (res.status == 423) {
          setError(
            "Вашиот профил е блокиран. Ве молиме контактирајте за повеќе информации.",
          );
        } else {
          setError(msg || "Најавата не успеа. Обиди се повторно.");
        }
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

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <a className="text-2xl font-bold text-gradient" href="/">
            Везилка
          </a>
          <h1 className="mt-6 text-2xl font-bold">Добредојде назад</h1>
          <p className="mt-2 text-muted-foreground">
            Најави се за да продолжиш со придонесите за Везилка
          </p>
        </div>
        <div className="p-8 border bg-card border-border rounded-2xl card-elevated">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Е-пошта
              </label>
              <div className="relative mt-2">
                <Mail className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground"></Mail>
                <input
                  className="flex w-full h-10 px-3 py-2 pl-10 text-base border rounded-md border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  id="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  type="email"
                  required
                ></input>
              </div>
            </div>
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
                ></input>
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <button
              className="inline-flex mt-5 items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-xl px-8 w-full gap-2 cursor-pointer"
              type="submit"
            >
              Најави се <ArrowRight className="w-4 h-4"></ArrowRight>
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
            Немаш сметка?{" "}
            <a
              className="font-medium text-primary hover:underline"
              href="/register"
            >
              Регистрирај се
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
