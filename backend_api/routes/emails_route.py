from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from utils.spam_detector import predict_emails 

router = APIRouter()

class EmailInput(BaseModel):
    id: str
    subject: str
    body: str

@router.post("/emails")
async def receive_emails(emails: List[EmailInput]):
    # Call your spam detector
    results = predict_emails(emails)
    return {"message": "Emails processed", "results": results}
