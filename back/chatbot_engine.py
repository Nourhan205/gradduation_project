# chatbot_engine.py
import os
import json
import dotenv
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# =============================
# Configuration
# =============================
DATA_PATH = "Front/graduation-project--front/src/data/chatbot_final_data.json"
CHROMA_DIR = "./chroma_optimized_chunks"
dotenv.load_dotenv()
# API key must come from environment
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is not set")

# =============================
# Helper functions
# =============================
def create_search_optimized_document(chunk_data):
    city_ar = chunk_data['metadata'].get('city', {}).get('ar', '')
    city_en = chunk_data['metadata'].get('city', {}).get('en', '')
    location_str = f"الموقع: {city_ar} {city_en} القاهرة الكبرى Greater Cairo"

    interests = ", ".join(chunk_data['metadata'].get('interests', {}).get('ar', []))
    careers = ", ".join(chunk_data['metadata'].get('career_paths', {}).get('ar', []))

    page_content = f"""
    الجامعة: {chunk_data['metadata'].get('university', {}).get('ar', '')}
    الكلية: {chunk_data['metadata'].get('faculty', {}).get('ar', '')}
    القسم: {chunk_data['metadata'].get('department', {}).get('ar', '')}
    {location_str}

    الوصف الأساسي: {chunk_data['page_content'].get('ar', '')}

    مجالات الاهتمام والتخصص: {interests}
    المسارات الوظيفية وفرص العمل: {careers}
    """

    metadata = {
        "id": chunk_data["id"],
        "original_json": json.dumps(chunk_data, ensure_ascii=False)
    }

    return Document(page_content=page_content, metadata=metadata)

# =============================
# Heavy initialization (RUNS ONCE)
# =============================

# Load data
with open(DATA_PATH, "r", encoding="utf-8") as f:
    raw_data = json.load(f)

documents = [create_search_optimized_document(item) for item in raw_data]

# Embeddings
embedding = HuggingFaceEmbeddings(
    model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)

# Vector store (persisted)
vectorstore = Chroma.from_documents(
    documents=documents,
    embedding=embedding,
    persist_directory=CHROMA_DIR
)

retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

# LLM
llm = ChatOpenAI(
    model="llama-3.1-8b-instant",
    openai_api_base="https://api.groq.com/openai/v1",
    openai_api_key=GROQ_API_KEY,
    temperature=0.6,
    max_tokens=800
)

# Prompt
template = """
أنت مرشد أكاديمي ذكي للطلاب المصريين.

مهمتك:
- استخدم فقط المعلومات الواردة في السياق المسترجع أدناه.
- لا تذكر أي جامعة، كلية أو قسم غير موجود حرفياً في السياق.
- ركز على المعلومات المهمة المتعلقة بسؤال الطالب.
- اجعل الإجابة مختصرة، واضحة، ومفيدة.

السياق:
{context}

سؤال الطالب:
{input}

الإجابة:
"""

prompt = PromptTemplate.from_template(template)

# RAG chain
rag_chain = (
    {"context": retriever, "input": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# =============================
# ✅ SINGLE PUBLIC FUNCTION
# =============================
def chatbot_answer(user_message: str) -> str:
    """
    Takes user text and returns chatbot reply.
    This is the ONLY function Flask should call.
    """
    if not user_message or not user_message.strip():
        return "من فضلك اكتب سؤالك."

    return rag_chain.invoke(user_message)
