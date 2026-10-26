from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import init_db
from app.routers import cloud, contracts, finance, health, invoices, payments, receipts, recon

app = FastAPI(title="Ops Desk API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5177",
        "http://localhost:5177",
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(invoices.router, prefix="/api")
app.include_router(receipts.router, prefix="/api")
app.include_router(cloud.router, prefix="/api")
app.include_router(recon.router, prefix="/api")
app.include_router(contracts.router, prefix="/api")
app.include_router(finance.router, prefix="/api")


@app.on_event("startup")
def on_startup() -> None:
    init_db()
