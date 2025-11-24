from fastapi import FastAPI
from routes.emails_route import router as email_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="MailSense API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the single router
app.include_router(email_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "MailSense API is running 🚀"}
