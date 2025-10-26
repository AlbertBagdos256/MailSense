from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

# Simple in-memory storage for demo
EMAIL_STORAGE: List["EmailInput"] = []

class EmailInput(BaseModel):
    id: str
    subject: str
    body: str

# POST: receive emails from extension
@router.post("/emails")
async def receive_emails(emails: List[EmailInput]):
    EMAIL_STORAGE.extend(emails)
    print(f"Received {len(emails)} emails.")
    return {"message": f"Received {len(emails)} emails successfully."}

# GET: return all stored emails
@router.get("/emails", response_model=List[EmailInput])
async def get_emails():
    return EMAIL_STORAGE
