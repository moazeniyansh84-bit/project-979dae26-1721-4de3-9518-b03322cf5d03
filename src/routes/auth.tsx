import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/unicorn-logo.jpg.asset.json";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "ورود مدیر | تک شاخ کیدز" },
      { name: "description", content: "ورود به پنل مدیریت فروشگاه تک شاخ کیدز." },
      { property: "og:title", content: "ورود مدیر | تک شاخ کیدز" },
      { property: "og:description", content: "ورود به پنل مدیریت فروشگاه." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage("ایمیل یا رمز عبور درست نیست.");
      else navigate({ to: "/admin", replace: true });
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + "/admin" },
      });
      if (error) setMessage("ثبت‌نام انجام نشد: " + error.message);
      else if (!data.session)
        setMessage("ایمیل تأیید برای شما ارسال شد؛ پس از تأیید وارد شوید.");
      else navigate({ to: "/admin", replace: true });
    }
    setBusy(false);
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
      <img
        src={logo.url}
        alt="تک شاخ کیدز"
        width={72}
        height={72}
        className="size-18 rounded-full object-cover"
      />
      <h1 className="mt-4 text-lg font-extrabold text-foreground">
        {mode === "login" ? "ورود مدیر فروشگاه" : "ساخت حساب مدیر"}
      </h1>

      <form
        onSubmit={submit}
        className="mt-6 w-full space-y-3 rounded-3xl border border-border bg-card p-5"
      >
        <input
          type="email"
          required
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ایمیل"
          className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <input
          type="password"
          required
          minLength={6}
          dir="ltr"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="رمز عبور"
          className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
        />
        {message && <p className="text-xs text-destructive">{message}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {busy ? "لطفاً صبر کنید…" : mode === "login" ? "ورود" : "ثبت‌نام"}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="w-full text-xs text-muted-foreground"
        >
          {mode === "login" ? "حساب مدیر ندارید؟ ثبت‌نام" : "قبلاً حساب ساخته‌اید؟ ورود"}
        </button>
      </form>
      <p className="mt-4 text-center text-xs leading-6 text-muted-foreground">
        اولین حسابی که ساخته شود، به‌طور خودکار مدیر فروشگاه می‌شود.
      </p>
    </div>
  );
}
