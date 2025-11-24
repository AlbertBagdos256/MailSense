from pydantic import BaseModel
from typing import List
from utils.email_embedder import embedder
import joblib

class EmailInput(BaseModel):
    id: str
    subject: str
    body: str

def predict_emails(emails: List[EmailInput]):
    # Load trained Logistic Regression classifier
    clf = joblib.load("models/logreg_spam_classifier.joblib")
    # Concatenate subject + body for embedding
    texts = [email.body for email in emails]

    # Compute embeddings using preloaded embedder
    embeddings = embedder.embed_batch(texts)

    # Predict probabilities for spam class
    spam_probs = clf.predict_proba(embeddings)[:, 1]

    # Apply threshold (e.g., 0.9) to assign labels
    results = []
    for email, prob in zip(emails, spam_probs):
        label = "spam" if prob >= 0.9 else "not_spam"
        results.append({
            "id": email.id,
            "label": label,
        })

    return results
