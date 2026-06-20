# 🚦 SmartFlow — Adaptive Traffic-Signal Control with Reinforcement Learning

SmartFlow controls a traffic intersection's signals with deep reinforcement
learning. Instead of running a fixed timer, a trained agent reads the live
per-lane traffic state and chooses which movement to give green — adapting in
real time to cut waiting and congestion. The agent is trained and evaluated
entirely in the [SUMO](https://www.eclipse.dev/sumo/) traffic simulator against
classical controllers, served through a FastAPI inference API, and paired with a
React dashboard and an ESP32 + RFID module for emergency-vehicle priority.

> The full RL methodology, training, and benchmark analysis live in
> **[`backend/README.md`](backend/README.md)** — start there for the AI/backend work.

---

## Results

Single intersection, randomized one-hour demand, averaged over 3 seeds — every
number comes from a reproducible run (no hand-set figures):

| Controller        | Avg wait (s) ↓ | Avg queue (veh) ↓ | Throughput ↑ |
|-------------------|---------------:|------------------:|-------------:|
| Fixed-time        |          11.37 |              7.37 |       2048.7 |
| Actuated (SUMO)   |           6.87 |              4.55 |       2050.0 |
| Max-pressure      |           5.28 |              3.27 |       2050.7 |
| **RL (DQN)**      |       **5.14** |          **3.19** |   **2054.0** |

The learned policy reduces average waiting time **~55% vs. a fixed-time plan**
and **~25% vs. SUMO's actuated controller**, while moving the most vehicles.

<p align="center">
  <img src="backend/results/comparison.png" alt="RL agent vs. baseline controllers" width="100%">
</p>

---

## Repository structure

| Path | Description |
|------|-------------|
| [`backend/`](backend/README.md) | RL model, SUMO environment, baselines, evaluation, and the FastAPI inference API |
| [`frontend/`](frontend/) | React + Vite web dashboard |
| [`hardware/`](hardware/) | ESP32 + RFID firmware for emergency-vehicle preemption |

---

## How it works

1. **Sense** — per-lane queue lengths and densities describe the intersection
   state (from the simulator today; from camera/CV detection in a deployment).
2. **Decide** — a DQN policy selects the next green phase from that state.
3. **Act** — the phase is applied in SUMO with automatic yellow and minimum-green
   safety, so the agent genuinely controls the signal.
4. **Prioritise** — an RFID-tagged emergency vehicle (ESP32) preempts the signal
   to clear its approach.
5. **Evaluate** — the agent is benchmarked against fixed-time, actuated, and
   max-pressure controllers on identical traffic.

---

## Quick start

**Prerequisite:** [SUMO 1.22+](https://sumo.dlr.de/docs/Installing) installed with
`SUMO_HOME` set.

```bash
git clone https://github.com/Kcodess2807/SMARTFLOW.git
cd SMARTFLOW
```

**Backend — RL & API**

```bash
python -m venv .venv && . .venv/Scripts/activate    # macOS/Linux: . .venv/bin/activate
pip install -r backend/requirements.txt
cd backend
python -m rl.evaluate --model results/dqn_v1.zip    # reproduce the results table
uvicorn api.main:app --reload                       # serve the inference API at :8000
```

**Frontend — dashboard**

```bash
cd frontend
bun install && bun run dev                          # or: npm install && npm run dev
```

For training, the visual SUMO demo, API usage, and the honest limitations, see
**[`backend/README.md`](backend/README.md)**.

---

## Tech stack

| Layer            | Technology |
|------------------|------------|
| RL & simulation  | SUMO · sumo-rl · Gymnasium · Stable-Baselines3 (DQN) · PyTorch |
| Inference API    | FastAPI · Pydantic · Uvicorn · Docker |
| Frontend         | React · Vite · TypeScript · Tailwind |
| Hardware         | ESP32 · RFID (C++ / Arduino) |

---

## Roadmap

- **Multi-intersection coordination** via multi-agent RL (sumo-rl / PettingZoo).
- **Camera → control bridge:** feed live YOLO-based lane counts into the RL state
  for on-street deployment.
- **Edge deployment** of the trained policy on IoT hardware.

---

## Team

A collaborative project spanning the reinforcement-learning backend and API, the
React frontend, and the ESP32/RFID firmware. Contributions are visible in the
repository history.
