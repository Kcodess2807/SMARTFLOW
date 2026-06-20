// Site copy + technical facts, all sourced from the repository
// (backend/rl/config.py, env.py, rewards.py, train.py, api/*).
// Personal links use clearly-marked placeholders until confirmed by the owner.

export const LINKS = {
  github: "https://github.com/Karush2807/SMARTFLOW", // TODO: confirm canonical repo URL
  liveDemo: "#demo",
  // Owner contact — replace placeholders once confirmed.
  ownerName: "[[Your Name]]",
  ownerGithub: "https://github.com/[[your-handle]]",
  ownerLinkedin: "https://www.linkedin.com/in/[[your-handle]]",
  ownerEmail: "[[you@example.com]]",
};

export const HERO = {
  kicker: "Reinforcement learning · SUMO · signal control",
  headline: "A traffic light that learns to clear the queue.",
  sub: "An RL agent observes lane-level demand at an intersection and chooses the next green phase — trained in the SUMO traffic simulator and benchmarked against fixed-time, actuated, and max-pressure control.",
};

// --- The MDP, straight from backend/rl/env.py + rewards.py + config.py ---
export const MDP = {
  state: {
    title: "State",
    dims: 19,
    summary: "What the agent sees at each decision",
    items: [
      "Current phase, one-hot (2)",
      "Min-green-elapsed flag (1)",
      "Per-lane density, 8 lanes (8)",
      "Per-lane queue ratio, 8 lanes (8)",
    ],
    note: "All values normalised to [0, 1] — the same vector the live API consumes.",
  },
  action: {
    title: "Action",
    dims: 2,
    summary: "What the agent decides",
    items: ["Activate NS-green next", "Activate EW-green next"],
    note: "sumo-rl inserts the yellow transition and enforces min/max-green, so every action is physically valid.",
  },
  reward: {
    title: "Reward",
    summary: "What the agent optimises",
    formula: "rₜ = (Wₜ₋₁ − Wₜ) − α · mean_queueₜ",
    items: [
      "(Wₜ₋₁ − Wₜ): responsive — positive when the last action reduced delay",
      "mean_queueₜ ∈ [0,1]: dense, bounded penalty on standing queues",
      "α = 0.5 balances clearing delay against starving an approach",
    ],
    note: "A custom reward chosen over the sparse built-in diff-waiting-time for stabler value learning.",
  },
};

export const ENV_CONFIG = [
  { label: "Decision interval", value: "5 s" },
  { label: "Yellow time", value: "3 s" },
  { label: "Min green", value: "10 s" },
  { label: "Max green", value: "60 s" },
  { label: "Episode length", value: "3600 s" },
  { label: "Incoming lanes", value: "8" },
];

export const TRAINING = [
  { label: "Algorithm", value: "DQN (Stable-Baselines3)" },
  { label: "Training steps", value: "100,000" },
  { label: "Network", value: "MLP [128, 128]" },
  { label: "Discount γ", value: "0.95" },
  { label: "Exploration", value: "ε 1.0 → 0.02" },
  { label: "Seed", value: "42 (reproducible)" },
];

// --- Architecture: state → agent → SUMO → reward → API ---
export const ARCHITECTURE = [
  {
    id: "state",
    title: "Traffic state",
    detail: "Per-lane density + queue + phase, normalised to a 19-dim vector.",
  },
  {
    id: "agent",
    title: "RL agent",
    detail: "DQN policy maps the state to a green-phase decision (NS / EW).",
  },
  {
    id: "sumo",
    title: "SUMO env",
    detail: "sumo-rl switches the physical signal phase; the simulation advances.",
  },
  {
    id: "reward",
    title: "Reward",
    detail: "queue_wait scores the outcome and feeds back to training.",
  },
  {
    id: "api",
    title: "FastAPI",
    detail: "/predict, /simulate, /metrics serve the trained policy over HTTP.",
  },
];

// --- Tech & roles ---
export interface RoleGroup {
  area: string;
  owner: "me" | "team";
  items: string[];
}

export const ROLES: RoleGroup[] = [
  {
    area: "RL model & environment",
    owner: "me",
    items: ["SUMO MDP design", "Custom queue_wait reward", "DQN / PPO training"],
  },
  {
    area: "Baselines & evaluation",
    owner: "me",
    items: ["Fixed-time · actuated · max-pressure", "Seeded SUMO benchmark harness"],
  },
  {
    area: "Backend API",
    owner: "me",
    items: ["FastAPI service", "Pydantic-validated /predict · /simulate · /metrics"],
  },
  {
    area: "Emergency preemption",
    owner: "me",
    items: ["RFID-triggered green priority", "Validated in the SUMO digital twin"],
  },
  {
    area: "Computer vision (YOLOv8)",
    owner: "team",
    items: ["Vehicle detection & counting", "Demo footage"],
  },
  {
    area: "Hardware (ESP32 / RFID)",
    owner: "team",
    items: ["Reader/writer firmware", "Tagged-vehicle detection"],
  },
  {
    area: "Mobile app",
    owner: "team",
    items: ["Expo / React Native dashboard"],
  },
];

export const STACK = [
  "Python",
  "PyTorch",
  "Stable-Baselines3",
  "Gymnasium",
  "SUMO / sumo-rl",
  "FastAPI",
  "Pydantic",
  "NumPy",
  "React",
  "TypeScript",
  "Vite",
  "Tailwind",
];
