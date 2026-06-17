"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TextArea, TextField } from "@/components/ui/fields";
import { CheckIcon } from "@/components/ui/icons";
import { Card, SectionLabel } from "@/components/ui/primitives";
import { CenteredNote } from "@/components/ui/states";
import { useGymData, useReplaceAll, useUpdateProfile } from "@/lib/data/hooks";
import { seedExercises } from "@/lib/domain/seed";
import { AccentName, emptyData } from "@/lib/domain/types";
import { ACCENTS, ACCENT_NAMES } from "@/lib/theme/accents";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/use-user";

export default function ProfilPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isPending } = useGymData();
  const updateProfile = useUpdateProfile();
  const replaceAll = useReplaceAll();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (isPending || !data) {
    return (
      <div className="animate-in pt-3.5">
        <h1 className="text-[30px] font-extrabold tracking-[-0.8px] text-ink">Profil</h1>
        <CenteredNote>Lädt …</CenteredNote>
      </div>
    );
  }

  const { profile } = data;

  return (
    <div className="animate-in">
      <header className="pt-3.5 pb-3">
        <h1 className="text-[30px] font-extrabold tracking-[-0.8px] text-ink">Profil</h1>
        <div className="mt-0.5 text-[13px] text-ink-2">Deine Angaben und das Erscheinungsbild.</div>
      </header>

      <div className="flex flex-col gap-5">
        <Field label="Name">
          <TextField
            placeholder="Dein Name"
            value={profile.name}
            onChange={(e) => updateProfile({ name: e.target.value })}
          />
        </Field>

        <Field label="Ziel">
          <TextField
            placeholder="z. B. Kraftaufbau & Rücken stabilisieren"
            value={profile.goal}
            onChange={(e) => updateProfile({ goal: e.target.value })}
          />
        </Field>

        <Field label="Aufwärmen">
          <TextArea
            placeholder="Dein Aufwärm-Ablauf …"
            value={profile.warmup}
            onChange={(e) => updateProfile({ warmup: e.target.value })}
          />
        </Field>

        <Field label="Akzentfarbe">
          <div className="flex gap-3">
            {ACCENT_NAMES.map((name) => (
              <AccentSwatch
                key={name}
                name={name}
                active={profile.accent === name}
                onSelect={() => updateProfile({ accent: name })}
              />
            ))}
          </div>
        </Field>

        <Field label="Entwicklung">
          <Card className="flex flex-col gap-2 p-3">
            <button
              type="button"
              onClick={() => replaceAll({ exercises: seedExercises(), profile })}
              className="h-[44px] rounded-[12px] bg-fill text-[14px] font-bold text-ink"
            >
              Beispieldaten laden
            </button>
            <button
              type="button"
              onClick={() => replaceAll({ ...emptyData(), profile })}
              className="h-[44px] rounded-[12px] text-[14px] font-bold"
              style={{ color: "#b0473b", background: "#f7e9e6" }}
            >
              Alle Übungen löschen
            </button>
          </Card>
        </Field>

        <Field label="Konto">
          <Card className="flex flex-col gap-3 p-4">
            {user?.email ? (
              <div className="text-[13.5px] text-ink-2">
                Angemeldet als <span className="font-semibold text-ink">{user.email}</span>
              </div>
            ) : null}
            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className="h-[44px] rounded-[12px] border border-line text-[14px] font-bold text-ink"
            >
              {signingOut ? "Wird abgemeldet …" : "Abmelden"}
            </button>
          </Card>
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <SectionLabel className="mb-2">{label}</SectionLabel>
      {children}
    </div>
  );
}

function AccentSwatch({
  name,
  active,
  onSelect,
}: {
  name: AccentName;
  active: boolean;
  onSelect: () => void;
}) {
  const { accent } = ACCENTS[name];
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex h-11 w-11 items-center justify-center rounded-full text-white"
      style={{ background: accent, outline: active ? `2px solid ${accent}` : "none", outlineOffset: 3 }}
      aria-label={name}
      aria-pressed={active}
    >
      {active ? <CheckIcon size={16} /> : null}
    </button>
  );
}
