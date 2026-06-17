// Seed data — the 8 prototype exercises with realistic settings/history.
// NOT loaded automatically. Exposed via a dev-only action (see the Profile
// screen) so the app starts empty in production per the README.

import { Exercise } from "./types";

export function seedExercises(): Exercise[] {
  return [
    {
      id: "beinpresse",
      name: "Beinpresse",
      group: "Beine & Rumpf",
      photo: null,
      variants: null,
      targetSets: 3,
      targetReps: 10,
      settings: { default: { Schulter: "2", Rückenlehne: "4", Sitz: "3", "Platte Fuss": "Mitte" } },
      note: "Fersen flach lassen, Knie nicht ganz durchstrecken.",
      history: [
        { id: "b1", date: "2026-06-12", variant: "default", sets: [{ reps: 12, weight: 80 }, { reps: 10, weight: 90 }, { reps: 8, weight: 95 }], note: "" },
        { id: "b2", date: "2026-06-04", variant: "default", sets: [{ reps: 12, weight: 75 }, { reps: 10, weight: 85 }, { reps: 8, weight: 90 }], note: "Tempo bewusst langsam" },
        { id: "b3", date: "2026-05-28", variant: "default", sets: [{ reps: 12, weight: 70 }, { reps: 12, weight: 80 }, { reps: 10, weight: 85 }], note: "" },
      ],
    },
    {
      id: "legcurl",
      name: "Leg curl / extension",
      group: "Beine & Rumpf",
      photo: null,
      variants: ["Leg curl", "Leg extension"],
      targetSets: 3,
      targetReps: 10,
      settings: {
        "Leg curl": { Rückenlehne: "3", Sitz: "2", "Obere Rolle": "—", "Untere Rolle": "5", Winkel: "B" },
        "Leg extension": { Rückenlehne: "3", Sitz: "2", "Obere Rolle": "4", "Untere Rolle": "2", Winkel: "A" },
      },
      note: "Bewegung kontrolliert führen, nicht schwingen.",
      history: [
        { id: "l1", date: "2026-06-13", variant: "Leg curl", sets: [{ reps: 12, weight: 35 }, { reps: 12, weight: 40 }, { reps: 10, weight: 42 }], note: "" },
        { id: "l2", date: "2026-06-06", variant: "Leg curl", sets: [{ reps: 12, weight: 32 }, { reps: 12, weight: 38 }, { reps: 10, weight: 40 }], note: "" },
        { id: "l3", date: "2026-06-13", variant: "Leg extension", sets: [{ reps: 12, weight: 30 }, { reps: 10, weight: 35 }], note: "" },
      ],
    },
    {
      id: "hyper",
      name: "Hyperextension",
      group: "Beine & Rumpf",
      photo: null,
      variants: null,
      targetSets: 3,
      targetReps: 10,
      settings: { default: { "Untere Rolle": "4", "Obere Rolle": "2", Winkel: "C" } },
      note: "Rücken gerade halten, nicht überstrecken.",
      history: [],
    },
    {
      id: "backcurl",
      name: "Back curl / extension",
      group: "Oberkörper",
      photo: null,
      variants: ["Back curl", "Back extension"],
      targetSets: 3,
      targetReps: 10,
      settings: {
        "Back curl": { Lehnenhöhe: "4", Lehnenbreite: "3", Sitz: "2", "Hebel Höhe": "5", Fuss: "2", Winkel: "B" },
        "Back extension": { Lehnenhöhe: "4", Lehnenbreite: "3", Sitz: "2", "Hebel Höhe": "3", Fuss: "2", Winkel: "A" },
      },
      note: "",
      history: [
        { id: "bc1", date: "2026-06-10", variant: "Back curl", sets: [{ reps: 12, weight: 25 }, { reps: 12, weight: 30 }], note: "" },
      ],
    },
    {
      id: "ruderzug",
      name: "Ruderzug / Brustpresse",
      group: "Oberkörper",
      photo: null,
      variants: ["Ruderzug", "Brustpresse"],
      targetSets: 3,
      targetReps: 10,
      settings: {
        Ruderzug: { Beugung: "4", Streckung: "6", Lehne: "5 – an Brust" },
        Brustpresse: { Beugung: "2", Streckung: "5", Lehne: "2 – am Rücken" },
      },
      note: "Schulterblätter aktiv zusammenziehen.",
      history: [
        { id: "r1", date: "2026-06-14", variant: "Ruderzug", sets: [{ reps: 12, weight: 40 }, { reps: 10, weight: 45 }, { reps: 8, weight: 50 }], note: "" },
        { id: "r2", date: "2026-06-07", variant: "Ruderzug", sets: [{ reps: 12, weight: 38 }, { reps: 10, weight: 42 }, { reps: 8, weight: 46 }], note: "" },
        { id: "r3", date: "2026-06-11", variant: "Brustpresse", sets: [{ reps: 12, weight: 30 }, { reps: 10, weight: 35 }], note: "" },
      ],
    },
    {
      id: "latzug",
      name: "Latzug",
      group: "Oberkörper",
      photo: null,
      variants: null,
      targetSets: 3,
      targetReps: 10,
      settings: { default: { Sitzpolster: "4", Griff: "breit" } },
      note: "",
      history: [
        { id: "lz1", date: "2026-06-14", variant: "default", sets: [{ reps: 12, weight: 45 }, { reps: 10, weight: 50 }, { reps: 8, weight: 55 }], note: "" },
      ],
    },
    {
      id: "seilzug",
      name: "Seilzug",
      group: "Oberkörper",
      photo: null,
      variants: null,
      targetSets: 3,
      targetReps: 10,
      settings: { default: {} },
      note: "",
      history: [],
    },
    {
      id: "langhantel",
      name: "Langhantel Rack",
      group: "Oberkörper",
      photo: null,
      variants: null,
      targetSets: 3,
      targetReps: 10,
      settings: { default: {} },
      note: "Spotter / Sicherungsablage einstellen.",
      history: [],
    },
  ];
}
