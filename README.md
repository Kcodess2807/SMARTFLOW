# 🚦 Intelligent Traffic Signal Control System (SMARTFLOW)

## 📝 Project Overview

The **Intelligent Traffic Signal Control System** (SMARTFLOW) aims to optimize urban traffic flow using AI-based real-time traffic density analysis. The system dynamically adjusts signal timings based on live vehicle counts and density, ensuring smoother traffic management and reduced congestion at intersections.


<p align="center">
  <img src="https://github.com/user-attachments/assets/04d68a3f-16be-4871-80e8-399707323969" alt="vehicle annotated result">
</p>


## Key Features

🔍 Real-Time Object Detection

Uses YOLOv8 to detect vehicles like cars, buses, trucks, and motorcycles in each frame.


🔄 Robust Object Tracking

Employs BYTETracker to maintain consistent vehicle identities across frames, ensuring smooth and reliable tracking.


📏 Virtual Line Monitoring

Implements a configurable virtual line to count vehicles and analyze traffic patterns as they cross a defined boundary.


✏ Dynamic Annotations

Annotates video streams with bounding boxes, labels, and trace lines to visualize vehicle trajectories and crossing events.


🎥 Flexible Video Input

Supports both live webcam feeds and recorded video files, making it adaptable to various deployment scenarios.


📡 Hardware Integration for IoT-based Smart Traffic Control

ESP32 with RFID Scanner: Detects RFID tags on authorized vehicles (e.g., emergency vehicles, buses) for priority access.


<p align="center">
  <img src="https://github.com/user-attachments/assets/567daffa-cd11-4985-a070-4a18c1538929" alt="vehicle annotated result">
</p>


## 📌 Tech Stack

| Component             | Technology                                  |
|-----------------------|---------------------------------------------|
| **Frontend**          | React + Vite (`frontend/`)                  |
| **RL backend + API**  | SUMO · sumo-rl · Stable-Baselines3 · FastAPI (`backend/`) |
| **RFID firmware**     | C++ / ESP32 (`hardware/`)                   |

*(An earlier Expo / React Native mobile prototype is preserved in git history.)*

> **The reinforcement-learning traffic controller, training/evaluation, and
> inference API live in [`backend/`](backend/README.md) — start there for the
> backend/AI work, including real benchmark results.**

### 1️⃣ Clone the Repository

Clone the SMARTFLOW repository to your local machine:
```bash
git clone https://github.com/YourOrg/SMARTFLOW.git
cd SMARTFLOW && pip install -r backend/requirements.txt
```


## 🛠️ How It Works

1. **Traffic state** → per-lane queue lengths and densities at the intersection
   (in simulation today; from camera/CV detection in a deployment).
2. **RL agent decides** → a DQN policy chooses which green phase to run next.
3. **Signal actuation** → the chosen phase is applied in SUMO (and would drive the
   physical signal controller in deployment), with automatic yellow + min-green.
4. **Emergency preemption** → an RFID-tagged emergency vehicle (ESP32, `hardware/`)
   triggers green priority for its approach.
5. **Evaluation** → the agent is benchmarked against fixed-time, actuated, and
   max-pressure controllers on identical scenarios; see [`backend/README.md`](backend/README.md).

## 🏆 Future Enhancements
- 🌐 **Multi-intersection coordination** via multi-agent RL (sumo-rl PettingZoo).
- 🌍 **Edge Computing** for real-time processing on IoT devices.
- 📷 **CV → control bridge**: feed live YOLOv8 lane counts into the RL state.

## 📧 Contact
For inquiries, reach out to **your-email@example.com** or visit our [GitHub](https://github.com/Karush2807/SMARTFLOW).
