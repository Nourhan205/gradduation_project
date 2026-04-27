from bson import ObjectId
from flask import Flask, request, jsonify
from flask_cors import CORS
from crewai import Task , Crew , Process
from comparison_tool import llm, LANG_CONFIG, search_web, create_comparator_agent
import os
from dotenv import load_dotenv
from pymongo import MongoClient
import random
import string
import smtplib
from datetime import datetime, timedelta
# from chatbot_engine import chatbot_answer
import torch
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import re

load_dotenv()
app = Flask(__name__)
CORS(app)
Mongo_url=os.getenv('MONGO_URL')
client = MongoClient("mongodb://localhost:27017/")
db=client["graduation_project"]
users_collection=db["users"]
data_collection=db["data_collection"]
roadmap_collection=db["roadmap_collection"]
data_collection.update_one(
    {"email": "test@example.com"},
    {"$set": {
        "username": "Test User",
        "careerChoices": 4,
        "quizPerformance": 82,
        "roadmapCompleted": 3,
        "totalRoadmaps": 5,
        "activeDays": 6,
        "roadmapPercentage": 75,
        "recentActivity": [
            "Completed Python Basics",
            "Passed AI Quiz",
            "Started Data Science Roadmap"
        ]
    }},
   upsert=True
)
roadmap_collection.update_one(
    {"user_id": ObjectId("64a1f0c8e1b2c9d5f0a1b2c3")},
    {"$set": {
        "interests": "AI and Data Science",
        "level": "Beginner",
        "goal": "Become a Data Scientist",
        "roadmap": "String",
        "user_id": ObjectId("64a1f0c8e1b2c9d5f0a1b2c3")}},
    upsert=True)
print("Connected ")
# Helper functions
db = client["graduation_db"]
careers_collection = db["careers"]

# Home
@app.route("/")
def home():
    return jsonify({"message": "Backend running successfully 🚀"})

# Signup
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    print("Signup data:", data)
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    confirmPassword = data.get("confirmPassword")

    if not all([name , email , password , confirmPassword]):
        return jsonify({"error": "All fields are required"}), 400
    
    if (password != confirmPassword):
        return jsonify({"error":"passwords not match "}),400
    
    
    if users_collection.find_one({"email":email}):
       return jsonify({"error":"Email already exist"})
    
    users_collection.insert_one({
        "name": name,
        "email": email,
        "password": password
    })

    return jsonify({"message": "User registered successfully"}), 201

# Login
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = users_collection.find_one({"email":email})
    if user and user["password"]==password:
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"error": "Invalid email or password"}), 401

def send_email(receiver, subject, body):
    import ssl
    from email.message import EmailMessage
    
    sender = "moelbermawy96@gmail.com"
    password = "imbbkwnngojwxtwx"

    
    msg = EmailMessage()
    msg["From"] = sender
    msg["To"] = receiver
    msg["Subject"] = subject
    msg.set_content(body)

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as smtp:
        smtp.login(sender, password)
        smtp.send_message(msg)

@app.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.json
    email = data.get("email")

    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"error": "Email not found"}), 404

    code = ''.join(random.choices(string.digits, k=6))
    expiration = datetime.utcnow() + timedelta(minutes=10)

    users_collection.update_one(
        {"email": email},
        {"$set": {"code": code, "expires_at": expiration}},
        upsert=True
    )

    # send email
    send_email(email, "Your Password Reset Code", f"Your verification code is: {code}")

    return jsonify({"message": "Verification code sent to your email"}), 200

# 🔹 Route 2: Verify code
@app.route("/verification", methods=["POST"])
def verification():
    data = request.json
    email = data.get("email")
    code = data.get("code")

    record = users_collection.find_one({"email": email, "code": code})
    if not record:
        return jsonify({"error": "Invalid code"}), 400

    if record["expires_at"] < datetime.utcnow():
        return jsonify({"error": "Code expired"}), 400

    return jsonify({"message": "Code verified"}), 200

# 🔹 Route 3: Reset password
@app.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.json
    email = data.get("email")
    new_password = data.get("password")

    record = users_collection.find_one({"email": email})
    if not record:
        return jsonify({"error": "Verification required"}), 400

    users_collection.update_one(
        {"email": email},
        {
            "$set": {"password": new_password},
            "$unset": {"code": "", "expires_at": ""} 
        }
    )

    return jsonify({"message": "Password updated successfully"}), 200

@app.route("/dashboard", methods=["GET"])
def dashboard():
    email = request.args.get("email")
    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = users_collection.find_one({"email": email}, {"_id": 0})
    if not user:
        return jsonify({"error": "User not found"}), 404

    dashboard_data = {
        "username": user.get("name", "User"),
        "careerChoices": user.get("careerChoices", 3),
        "quizPerformance": user.get("quizPerformance", 78),
        "roadmapCompleted": user.get("roadmapCompleted", 2),
        "totalRoadmaps": user.get("totalRoadmaps", 5),
        "activeDays": user.get("activeDays", 4),
        "roadmapPercentage": user.get("roadmapPercentage", 40),
        "recentActivity": user.get("recentActivity", [
            "Completed Python Basics",
            "Took AI Career Quiz",
            "Started Web Development Roadmap"
        ])
    }

    return jsonify(dashboard_data), 200



@app.route("/chatbot", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "")

    reply = chatbot_answer(user_message)

    return jsonify({"reply": reply})



##Roadmap Generation with Qwen2.5-3B-Instruct
MODEL_NAME = "Qwen/Qwen2.5-3B-Instruct"

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_NAME,
    trust_remote_code=True
)

model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float16,
    device_map="auto",
    trust_remote_code=True
)
class RoadmapRequest(BaseModel):
    interests: str
    level: str
    goal: str

# =====================
# Roadmap generation
# =====================
def generate_roadmap(interests: str, level: str, goal: str) -> str:
    prompt = f"""
You are an expert learning planner.

The user wants a roadmap.

User request:
"Interests: {interests}, Level: {level}, Goal: {goal}"

Create a clear and structured roadmap.
Divide it into phases or months.
Use simple bullet points.
"""

    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

    outputs = model.generate(
        **inputs,
        max_new_tokens=600,
        temperature=0.7
    )

    return tokenizer.decode(outputs[0], skip_special_tokens=True)

# =====================
# Parsing function
# =====================
def parse_roadmap_string(roadmap_str: str):
    parsed = {}
    current_phase = None

    for line in roadmap_str.split("\n"):
        line = line.strip()
        if not line:
            continue

        if line.startswith("###"):
            current_phase = line.replace("###", "").strip()
            parsed[current_phase] = []
        elif current_phase and line.startswith(("-", "*")):
            task = re.sub(r"\*\*(.*?)\*\*", r"\1", line[1:].strip())
            parsed[current_phase].append(task)

    return {k: v for k, v in parsed.items() if v}
@app.route("/roadmap", methods=["POST"])
def roadmap():
    try:
        data = request.json
        interests = data.get("interests")
        level = data.get("level")
        goal = data.get("goal")
       

        roadmap_text = generate_roadmap(interests, level, goal)
        roadmap_parsed = parse_roadmap_string(roadmap_text)
        roadmap_collection.insert_one({
            "interests": interests,
            "level": level,
            "goal": goal,
            "roadmap":roadmap_text
        })
        return jsonify({
            "raw_text": roadmap_text,
            "parsed": roadmap_parsed
        }), 200


    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Failed to generate roadmap"}), 500

@app.route("/compare", methods=["POST"])
def compare():
    try:
        data = request.json
        lang          = data.get("lang", "en")
        tracks        = data.get("tracks", "")
        location      = data.get("location", "Global")
        currency      = data.get("currency", "USD")
        year          = data.get("year", "2026")
        criteria_nums = data.get("criteria", "4")

        if not tracks:
            return jsonify({"error": "tracks field is required"}), 400

        cfg = LANG_CONFIG.get(lang, LANG_CONFIG['en'])
        criteria = ", ".join([
            cfg['criteria'][n.strip()]
            for n in criteria_nums.split(",")
            if n.strip() in cfg['criteria']
        ])

        comparator = create_comparator_agent(lang)
        task = Task(
            description=cfg['task_prompt'].format(
                tracks=tracks, location=location,
                currency=currency, year=year, criteria=criteria
            ),
            expected_output=cfg['expected_output'],
            agent=comparator
        )
        crew = Crew(agents=[comparator], tasks=[task], process=Process.sequential, verbose=False)
        result = crew.kickoff(inputs={
            "tracks": tracks, "location": location,
            "currency": currency, "year": year, "criteria": criteria
        })

        return jsonify({"result": result.raw}), 200

    except Exception as e:
        print("Comparison error:", e)
        return jsonify({"error": "Failed to run comparison"}), 500



# # Run server
if __name__ == "__main__":
    app.run(debug=True)
