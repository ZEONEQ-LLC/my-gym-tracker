"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TextField } from "@/components/ui/fields";
import { SectionLabel } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "register";

/** Maps Supabase auth errors to friendly German messages. */
function germanError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-Mail oder Passwort ist nicht korrekt.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "Diese E-Mail ist bereits registriert. Melde dich stattdessen an.";
  if (m.includes("password should be at least") || m.includes("password should contain"))
    return "Das Passwort muss mindestens 6 Zeichen lang sein.";
  if (m.includes("email not confirmed")) return "Bitte bestätige zuerst deine E-Mail-Adresse.";
  if (m.includes("unable to validate email") || (m.includes("email") && m.includes("invalid")))
    return "Bitte gib eine gültige E-Mail-Adresse ein.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Zu viele Versuche. Bitte warte einen Moment und versuche es erneut.";
  return "Etwas ist schiefgelaufen. Bitte versuche es erneut.";
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setInfo(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setInfo(null);
    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setError(germanError(error.message));
        setLoading(false);
        return;
      }
      router.replace("/");
      router.refresh();
      return;
    }

    // register
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    if (error) {
      setError(germanError(error.message));
      setLoading(false);
      return;
    }
    // If email confirmation is enabled, no session is returned yet.
    if (!data.session) {
      setInfo("Fast geschafft! Wir haben dir eine E-Mail zur Bestätigung geschickt. Bestätige sie und melde dich dann an.");
      setMode("login");
      setLoading(false);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col justify-center px-[22px]">
      <div className="animate-in">
        <div className="mb-7">
          <div className="text-[13px] font-semibold tracking-[0.3px] text-accent">Gym Tracker</div>
          <h1 className="mt-1 text-[30px] font-extrabold tracking-[-0.8px] text-ink">
            {mode === "login" ? "Anmelden" : "Registrieren"}
          </h1>
          <p className="mt-1 text-[13.5px] leading-snug text-ink-2">
            {mode === "login"
              ? "Melde dich an, um deine Übungen und Trainings zu sehen."
              : "Erstelle ein Konto, um deine Trainings zu speichern."}
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <SectionLabel className="mb-2">E-Mail</SectionLabel>
            <TextField
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="du@beispiel.ch"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <SectionLabel className="mb-2">Passwort</SectionLabel>
            <TextField
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder={mode === "login" ? "Dein Passwort" : "Mindestens 6 Zeichen"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error ? (
            <div
              className="rounded-[12px] px-3.5 py-3 text-[13.5px] leading-snug"
              style={{ color: "#b0473b", background: "#f7e9e6" }}
              role="alert"
            >
              {error}
            </div>
          ) : null}

          {info ? (
            <div className="rounded-[12px] bg-accent-soft px-3.5 py-3 text-[13.5px] leading-snug text-accent" role="status">
              {info}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              "mt-1 h-[50px] w-full rounded-[14px] text-[15px] font-bold text-white transition-colors",
              canSubmit ? "bg-accent" : "bg-[#cfd2cf]",
            )}
          >
            {loading ? "Bitte warten …" : mode === "login" ? "Anmelden" : "Konto erstellen"}
          </button>
        </form>

        <div className="mt-5 text-center text-[13.5px] text-ink-2">
          {mode === "login" ? (
            <>
              Noch kein Konto?{" "}
              <button type="button" onClick={() => switchMode("register")} className="font-bold text-accent">
                Registrieren
              </button>
            </>
          ) : (
            <>
              Schon ein Konto?{" "}
              <button type="button" onClick={() => switchMode("login")} className="font-bold text-accent">
                Anmelden
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
