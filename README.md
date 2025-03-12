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

| Component         | Technology                  |
|-------------------|-----------------------------|
| **Frontend**      | React                       |
| **ML Model**      | YOLOv8                      |
| **RFID Code**     | CPP                         |

### 1️⃣ Clone the Repository

Clone the SMARTFLOW repository to your local machine:
```bash
git clone https://github.com/YourOrg/SMARTFLOW.git
cd SMARTFLOW && pip install -r requirements.txt
```


## 🛠️ How It Works

1. **Live Video Input** → Captured from a camera at an intersection.
2. **Vehicle Detection & Counting** → YOLOv8 detects cars, bikes, and buses.
3. **Traffic Density Estimation** → `area_counter.py` calculates the percentage.
4. **Signal Adjustment** → The backend dynamically modifies timings.
5. **Data Logging & Analytics** → Historical trends stored in Firestore.

## 🏆 Future Enhancements
- 🚀 **Reinforcement Learning (RL)** for better traffic predictions.
- 🌍 **Edge Computing** for real-time processing on IoT devices.
- 📊 **Historical Data Insights** to improve urban traffic planning.

## 📜 License
This project is licensed under the MIT License.

## 🤝 Contributing
Pull requests are welcome! Feel free to open an issue or suggest improvements.

## 📧 Contact
For inquiries, reach out to **your-email@example.com** or visit our [GitHub](https://github.com/Karush2807/SMARTFLOW).
