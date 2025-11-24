import torch
import numpy as np
from transformers import AutoTokenizer, AutoModel

class EmailEmbedder:
    def __init__(self, model_name='distilbert-base-uncased', device=None):
        self.device = device or ('cuda' if torch.cuda.is_available() else 'cpu')
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name).to(self.device)

    def embed_text(self, text):
        inputs = self.tokenizer(
            text, return_tensors='pt', truncation=True, padding=True, max_length=512
        )
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        with torch.no_grad():
            outputs = self.model(**inputs)
        cls_embedding = outputs.last_hidden_state[:, 0, :]
        return cls_embedding.cpu().numpy().squeeze()

    def embed_batch(self, messages):
        embeddings = []
        for msg in messages:
            embeddings.append(self.embed_text(msg))
        return np.array(embeddings)

# Load once globally
print("Loading DistilBERT model...")
embedder = EmailEmbedder()
print("Model loaded successfully.")
