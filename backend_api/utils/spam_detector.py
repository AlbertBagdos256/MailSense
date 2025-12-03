from pydantic import BaseModel
from typing import List
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
import os

load_dotenv()
HF_API_KEY = os.getenv("HF_API_KEY")
client = InferenceClient(api_key=HF_API_KEY)

class EmailInput(BaseModel):
    id: str
    subject: str
    body: str

def predict_emails(emails: List[EmailInput]):
    results = []

    for email in emails:
        # Combine subject + body
        full_text = f"{email.subject}\n{email.body}"
        
        # Slice to max 514 characters
        text = full_text[:350]

        hf_result = client.text_classification(
            text,
            model="dima806/email-spam-detection-roberta"
        )

        # Extract scores
        spam_score = next((r.score for r in hf_result if r.label.lower() == "spam"), 0.0)
        no_spam_score = next((r.score for r in hf_result if r.label.lower() in ["no spam", "not spam"]), 0.0)

        # Threshold logic
        if spam_score >= 0.9991:
            label = "spam"
        else:
            label = "not_spam"

        results.append({
            "id": email.id,
            "label": label,
            "spam_score": spam_score,
            "no_spam_score": no_spam_score
        })

    return results
