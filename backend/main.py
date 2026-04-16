import json
import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import io
import fitz  # PyMuPDF
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
import nltk

nltk.download('punkt')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# User Storage Logic
USERS_FILE = "users.json"

def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, "r") as f:
            return json.load(f)
    return {}

def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f)

@app.get("/")
def read_root():
    return {"status": "Coach.ai AI Engine is Active"}

@app.post("/signup")
async def signup(email: str = Form(...), password: str = Form(...), fullName: str = Form(...)):
    users = load_users()
    if email in users:
        raise HTTPException(status_code=400, detail="User already exists")
    users[email] = {"password": password, "fullName": fullName}
    save_users(users)
    return {"status": "Success", "fullName": fullName}

@app.post("/login")
async def login(email: str = Form(...), password: str = Form(...)):
    users = load_users()
    if email not in users or users[email]["password"] != password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"status": "Success", "fullName": users[email]["fullName"]}

@app.post("/analyze")
async def analyze_pdf(file: UploadFile = File(...)):
    contents = await file.read()
    doc = fitz.open(stream=contents, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()

    parser = PlaintextParser.from_string(text, Tokenizer("english"))
    summarizer = LsaSummarizer()
    summary_sentences = summarizer(parser.document, 8)
    summary = " \n\n".join([f"• {str(s)}" for s in summary_sentences])

    words = text.split()
    concepts = list(set([w.strip('.,()') for w in words if len(w) > 5 and w[0].isupper()]))[:10]

    return {
        "filename": file.filename,
        "summary": summary,
        "key_concepts": concepts,
        "full_text": text
    }

@app.post("/ask")
async def ask_question(question: str = Form(...), context: str = Form(...)):
    q = question.strip().lower()
    
    # 1. Scripted Professional Vectors (Synchronized)
    if any(greet in q for greet in ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"]):
        return {"answer": "Greetings, Scholar! I am the Coach.ai Intelligence Nexus. How can I assist your mastery today? 👋"}
    
    farewells = ["bye", "goodbye", "exit", "finish", "done", "thank you", "thanks"]
    if any(fw in q for fw in farewells):
        return {"answer": "Synchronizing conclusion... It has been a pleasure assisting your research journey today. Farewell! 🎓"}

    # 2. EXECUTIVE SUMMARY VECTOR (Aggressive ML Priority)
    is_summary_request = any(key in q for key in ["summary", "summarize", "executive brief", "overview"]) or q == "document summary?"
    
    if is_summary_request:
        if not context or len(context) < 50:
            return {"answer": "I don't see an active research corpus (PDF) to summarize right now. Please upload a document to begin deep neural synthesis, or ask me a specific study question!"}
        
        try:
            # TRY ML SUMY FIRST
            from sumy.parsers.plaintext import PlaintextParser
            from sumy.nlp.tokenizers import Tokenizer
            from sumy.summarizers.lsa import LsaSummarizer
            
            parser = PlaintextParser.from_string(context, Tokenizer("english"))
            summarizer = LsaSummarizer()
            summary_sentences = summarizer(parser.document, 5)
            summary_text = " ".join([str(s) for s in summary_sentences])
            
            if len(summary_text) > 20:
                return {"answer": f"Institutional Execution Overview: {summary_text}"}
        except:
            pass

        # ML FALLBACK: Importance Ranking Vector (TextRank Style)
        try:
            clean_text = re.sub(r'\s+', ' ', context).strip()
            sentences = re.split(r'(?<=[.!?])\s+', clean_text)
            
            # Sentence scoring based on keyword frequency (ML Concept)
            from collections import Counter
            words = re.findall(r'\w+', clean_text.lower())
            freq_table = Counter([w for w in words if len(w) > 4])
            
            sent_scores = []
            for s in sentences:
                score = sum(freq_table[w.lower()] for w in re.findall(r'\w+', s) if w.lower() in freq_table)
                sent_scores.append(score)
            
            # Extract top 5 most important sentences
            top_indices = sorted(range(len(sent_scores)), key=lambda i: sent_scores[i], reverse=True)[:5]
            top_sentences = [sentences[i] for i in sorted(top_indices)]
            
            ml_summary = " ".join(top_sentences)
            return {"answer": f"Neural Executive synthesis: {ml_summary}"}
        except Exception as e:
            return {"answer": "I have scanned the corpus, but a structural fracture prevented a high-fidelity summary. Please re-upload the document context."}

    # 3. Strict Punctuation Requirement
    if not question.strip().endswith("?"):
        return {"answer": "I require a specific inquiry ending with a '?' for optimal neural synthesis. Please frame your query as a scholarly question!"}

    if not context or len(re.sub(r'\s+', '', context)) < 20:
        return {"answer": "I'm your Coach.ai Intelligence Nexus! Currently, I don't have an active research corpus (PDF) to analyze. However, feel free to ask me anything about study strategies, or simply upload a document to begin deep neural synthesis!"}

    # 4. ADVANCED DUAL-VECTOR RETRIEVAL (TF-IDF + Cosine Similarity)
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    import re

    try:
        # Deep Structural Cleaning
        clean_context = re.sub(r'\s+', ' ', context).strip()
        sentences = re.split(r'(?<=[.!?])\s+', clean_context)
        
        # Group into semantic blocks for cluster interrogation
        paragraphs = []
        for i in range(0, len(sentences), 2):
            block = " ".join(sentences[i:i+4]).strip()
            if len(block) > 40:
                paragraphs.append(block)

        if not paragraphs:
            return {"answer": "The research corpus appears to have fragmented neural data. I recommend utilizing a document with more substantial selectable text for a higher fidelity interrogation."}

        # PRIMARY: TF-IDF Vectorization
        vectorizer = TfidfVectorizer(stop_words='english', lowercase=True, ngram_range=(1, 2))
        tfidf_matrix = vectorizer.fit_transform(paragraphs)
        query_vec = vectorizer.transform([q])
        
        similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()
        top_idx = similarities.argsort()[-1]
        
        if similarities[top_idx] > 0.1:
            return {"answer": paragraphs[top_idx]}
        
        # SECONDARY: Keyword Density Fallback
        q_terms = [w for w in re.findall(r'\b\w{4,}\b', q)]
        best_density_idx = 0
        max_hits = 0
        for idx, p in enumerate(paragraphs):
            p_lower = p.lower()
            hits = sum(1 for term in q_terms if term in p_lower)
            if hits > max_hits:
                max_hits = hits
                best_density_idx = idx
        
        if max_hits > 0:
            return {"answer": paragraphs[best_density_idx]}
        
        return {"answer": "I have scanned the corpus across all specific topic vectors, but I couldn't find a high-fidelity match for that conceptual query. Try rephrasing with core keywords!"}

    except Exception as e:
        # FINAL FALLBACK: Substring Matching (Bulletproof)
        q_clean = re.sub(r'[^a-zA-Z0-9\s]', '', q)
        q_words = [w for w in q_clean.split() if len(w) > 4]
        for p in paragraphs:
            if any(word in p.lower() for word in q_words):
                return {"answer": p}
        
        return {"answer": "I encountered a neural synchronization error across the local vectors. Please ensure your research corpus consists of a text-based PDF for optimal interrogation."}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
