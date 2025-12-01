from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from utils.spam_detector import predict_emails
from utils.email_categorizer import EmailCategorizer

router = APIRouter()
categorizer = EmailCategorizer(max_clusters=20)  # Initialize once

class EmailInput(BaseModel):
    id: str
    subject: str
    body: str

@router.post("/emails")
async def receive_emails(emails: List[EmailInput]):

    print("\n========== NEW /emails REQUEST ==========")
    print(f"Total incoming emails: {len(emails)}")

    # Step 1: Spam detection
    spam_results = predict_emails(emails)
    print("Spam detection results:")
    for e, r in zip(emails, spam_results):
        print(f"- {e.id}: {r['label']}")

    # Step 2: Filter non-spam
    non_spam_emails = [
        email for email, res in zip(emails, spam_results) if res["label"] == "not_spam"
    ]
    print(f"Non-spam emails: {len(non_spam_emails)}")

    # Step 3: If none → return early
    if not non_spam_emails:
        print("No non-spam emails. Returning early.")
        return {
            "message": "Emails processed",
            "spam_results": spam_results,
            "categorized_results": []
        }

    # Step 4: Add non-spam emails to categorizer
    print("\n--- Adding emails to categorizer ---")
    reclustered = categorizer.add_emails([email.model_dump() for email in non_spam_emails])
    print(f"Reclustered? {reclustered}")

    # Step 5: Generate cluster categories if reclustered
    if reclustered:
        print("\n--- Generating cluster category names ---")
        categorizer.generate_cluster_categories()
        print("Cluster names generated:")
        print(categorizer.cluster_names)

    # Step 6: Assign categories to each email
    print("\n--- Assigning categories to emails ---")

    email_to_cluster = {
        email["id"]: cid
        for email, cid in zip(categorizer.cluster_engine.emails,
                              categorizer.cluster_engine.cluster_labels)
    }

    print("Email → Cluster mapping:")
    for eid, cid in email_to_cluster.items():
        print(f"- {eid} → cluster {cid}")

    categorized_results = []
    for email in non_spam_emails:
        cluster_id = email_to_cluster.get(email.id)
        label = (
            categorizer.cluster_names.get(cluster_id, "Uncategorized")
            if cluster_id is not None else "Uncategorized"
        )
        print(f"Email {email.id} => Category: {label}")

        categorized_results.append({
            "id": email.id,
            "category": label
        })

    print("\n========== END PROCESS ==========\n")
    
    return {
    "message": "Emails processed",
    "spam_results": spam_results,
    "categorized_results": categorized_results,
    "cluster_version": categorizer.cluster_engine.cluster_version
    }
