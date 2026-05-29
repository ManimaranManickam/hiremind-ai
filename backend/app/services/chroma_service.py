import os
import chromadb
from chromadb.config import Settings

CHROMADB_URL = os.getenv("CHROMADB_URL", "http://localhost:8000")

def get_chroma_client():
    if "http" in CHROMADB_URL:
        # Connect to ChromaDB server
        host = CHROMADB_URL.split("://")[1].split(":")[0]
        port = CHROMADB_URL.split(":")[-1]
        client = chromadb.HttpClient(host=host, port=port)
    else:
        # Local persistent client for testing if url is not http
        client = chromadb.PersistentClient(path="./chroma_db")
    return client

def get_resume_collection():
    client = get_chroma_client()
    return client.get_or_create_collection(name="resumes")

def get_job_collection():
    client = get_chroma_client()
    return client.get_or_create_collection(name="jobs")
