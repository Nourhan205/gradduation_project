from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import random
import string
import smtplib
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

client = MongoClient("mongodb://localhost:27017/")
db=client["graduation_project"]
users_collection=db["users"]
data_collection=db["data_collection"]
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
print("Connected ")
# Helper functions


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

# # Run server
if __name__ == "__main__":
    app.run(debug=True)
