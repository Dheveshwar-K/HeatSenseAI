"""
Main FastAPI Server
===================
Project: EXTREME HEATWAVE EARLY WARNING & HUMAN THERMAL STRESS INDEX
Server Entrypoint & Route Registrations
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.database.database import init_db
from backend.api.routes import router as core_router
from backend.api.emergency_routes import router as emergency_router
from backend.api.websocket import router as ws_router
from backend.api.weather import router as weather_router
from backend.api.thermal_stress import router as thermal_router
from backend.websocket.weather_stream import router as weather_ws_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("heatwave_main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing SQLite database tables...")
    init_db()
    logger.info(f"{settings.APP_NAME} operational on port {settings.PORT}.")
    yield
    logger.info("Shutting down server.")


app = FastAPI(
    title=settings.APP_NAME,
    description="Mission-critical climate intelligence, thermal stress classification, The Weather Company (TWC) real-time integration, and emergency telephony escalation engine.",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend Vite/React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(core_router)
app.include_router(emergency_router)
app.include_router(ws_router)
app.include_router(weather_router)
app.include_router(thermal_router)
app.include_router(weather_ws_router)


@app.get("/")
def read_root():
    return {
        "system": settings.APP_NAME,
        "status": "ONLINE",
        "documentation": "/docs",
        "endpoints": {
            "twc_current_weather": "/api/weather/current?latitude=11.0168&longitude=76.9558",
            "pws_observations": "/api/weather/pws/{station_id}",
            "nearest_pws": "/api/weather/pws/nearest?latitude=11.0168&longitude=76.9558",
            "thermal_stress_calc": "/api/thermal-stress/calculate",
            "websocket_live": "/ws/live",
            "websocket_weather": "/ws/weather"
        },
        "disclaimer": "This system estimates environmental human thermal-stress risk and is NOT a medical diagnostic device."
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=True)
