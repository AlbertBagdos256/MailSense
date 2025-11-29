import openai
import random
from numpy import array, linalg, argmin
from dotenv import load_dotenv
from os import getenv
from sklearn.cluster import KMeans

load_dotenv()
api_key = getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY not found in environment variables.")

client = openai.OpenAI(api_key=api_key)

class EmailCategorizer:
    """
    Handles email clustering and category assignment using OpenAI embeddings.

    Workflow:
    1. Input: non-spam emails
    2. Convert emails to embeddings using OpenAI
    3. Cluster embeddings (limit number of clusters)
    4. Assign user-friendly category labels to clusters
    5. Incrementally classify new emails
    """
    
    def __init__(self, max_clusters = 20):
        """
        Initialize the clusterizer.
        :param max_clusters: maximum number of clusters to create
        """
        self.max_clusters = max_clusters
        self.embeddings = []  # temporary storage for latest batch
        self.cluster_engine = EmailClusterEngine(max_clusters=max_clusters)
        self.cluster_names = {} 
    def add_emails(self, emails: list):
        """
        Add new non-spam emails.
        Extract body, embed, and pass to cluster engine.
        """
        # Combine subject + body for embedding
        texts = [f"{email['subject']}\n{email['body']}" for email in emails]
        # Compute embeddings
        self.embeddings = self.compute_embeddings(texts)
        # Delegate clustering to the cluster engine
        reclustered = self.cluster_engine.add_items(emails, self.embeddings)
        # If cluster structure changed → regenerate cluster names
        if reclustered:
            self.generate_cluster_categories()
    
    def compute_embeddings(self, texts: list):
        """
        Use OpenAI embeddings to convert text to vectors.
        :param texts: list of email text content
        :return: list of embedding vectors
        """
        
        if not texts:
            return []
        
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=texts
        )
        
        # New OpenAI Python SDK returns objects, not dicts
        embeddings = [item.embedding for item in response.data]
        return embeddings
    
    def get_clusters(self):
        """Return {cluster_id: [emails]} dict"""

        clusters = {}
        for email, cid in zip(self.cluster_engine.emails,
                              self.cluster_engine.cluster_labels):
            clusters.setdefault(cid, []).append(email)

        return clusters
    
    def generate_cluster_categories(self):
        clusters = self.get_clusters()
        cluster_names = {}
        
        for cid, emails in clusters.items():
            examples = random.sample(emails, min(len(emails), 5))
            
            examples_text = "\n\n--- EMAIL ---\n\n".join(
                f"Subject: {e['subject']}\nBody: {e['body']}" for e in examples
            )
            
            prompt = f"""
               You are an AI that creates clean, short category names.
               Below are up to 5 example emails from a cluster. 
               Give ONE short unified category name.
               Do NOT explain anything.
               Output ONLY the category name.
               Emails: {examples_text}
            """
            
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}]
            )
            
            # FIX: new SDK uses .message.content
            label = response.choices[0].message.content.strip()
            cluster_names[cid] = label
            # assign only once
            self.cluster_names = cluster_names


    

class EmailClusterEngine:
    """
    Handles clustering of email embeddings.
    Supports initial clustering and incremental assignment.
    """
    
    def __init__(self, max_clusters = 20, recluster_threshold = 100):
        self.max_clusters = max_clusters
        self.recluster_threshold = recluster_threshold

        self.emails = []          # list of email dicts
        self.embeddings = []      # list of np.array embeddings
        self.cluster_labels = []  # cluster index per email
        self.cluster_centers = None
        self.new_email_counter = 0
    
    def add_items(self, emails, embeddings):
        """
        Add new emails + embeddings and assign clusters.
        """
        reclustered = False

        for email, emb in zip(emails, embeddings):
            self.emails.append(email)
            self.embeddings.append(emb)

            # Assign cluster
            if self.cluster_centers is None:
                # Not clustered yet
                self.cluster_labels.append(None)
            else:
                cid = self.assign_to_cluster(emb)
                self.cluster_labels.append(cid)

            self.new_email_counter += 1

        # Recluster if threshold reached
        if self.cluster_centers is None or self.new_email_counter >= self.recluster_threshold:
            reclustered = self.re_cluster()
        
        return reclustered  # will return either true or false

    def re_cluster(self):
        """
        Perform full clustering using KMeans.
        """
        if not self.embeddings:
            return

        X = array(self.embeddings)
        n_clusters = min(self.max_clusters, len(self.embeddings))
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        labels = kmeans.fit_predict(X)

        self.cluster_labels = labels.tolist()
        self.cluster_centers = kmeans.cluster_centers_
        self.new_email_counter = 0
        print(f"Re-clustered {len(self.embeddings)} emails into {n_clusters} clusters.")
        
        return True # just a flag so we now when reclusterization happened

    def assign_to_cluster(self, emb):
        """
        Assign a new embedding to the nearest existing cluster.
        """
        if self.cluster_centers is None:
            return None

        distances = linalg.norm(self.cluster_centers - emb, axis=1)
        return int(argmin(distances))