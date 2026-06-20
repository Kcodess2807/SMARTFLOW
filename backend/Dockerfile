# SmartFlow inference API container.
# Build (context = backend/):   docker build -t smartflow-api backend/
# Run:                          docker run -p 8000:8000 smartflow-api
#
# SUMO is installed from apt and used via pure-python traci inside the container
# (LIBSUMO_AS_TRACI=0) to avoid pinning libsumo to the apt SUMO version. /predict
# needs only the model; /simulate additionally drives SUMO.
FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive \
    SUMO_HOME=/usr/share/sumo \
    LIBSUMO_AS_TRACI=0 \
    PYTHONUNBUFFERED=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends sumo sumo-tools \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps first for layer caching. Drop the libsumo pin: it is tied
# to a specific SUMO build and the code falls back to traci automatically.
COPY requirements.txt .
RUN sed -i '/^libsumo==/d' requirements.txt \
    && pip install --no-cache-dir -r requirements.txt

# App code (api/, rl/, and the published model under results/).
COPY . /app

ENV SMARTFLOW_MODEL=/app/results/dqn_v1.zip

EXPOSE 8000
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
