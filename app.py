from flask import Flask, render_template, request, jsonify
from datetime import datetime

app = Flask(__name__)

# --- Seed Data: Service Categories & Providers ---

SERVICES = [
    {
        "id": "electrical",
        "name": "Electrical Services",
        "icon": "zap",
        "description": "Wiring, switchboards, fixtures, breaker fixes & safety audits.",
        "starting_price": 299,
        "available_providers": 2
    },
    {
        "id": "plumbing",
        "name": "Plumbing & Pipe Repair",
        "icon": "droplet",
        "description": "Leak detection, pipe fittings, drain clearing & tap repairs.",
        "starting_price": 349,
        "available_providers": 2
    },
    {
        "id": "cleaning",
        "name": "Home & Deep Cleaning",
        "icon": "sparkles",
        "description": "Full house deep clean, kitchen, bathroom & sofa sanitization.",
        "starting_price": 699,
        "available_providers": 2
    },
    {
        "id": "ac-repair",
        "name": "AC Repair & Servicing",
        "icon": "wind",
        "description": "Gas refilling, cooling issue resolution, jet service & installation.",
        "starting_price": 499,
        "available_providers": 2
    },
    {
        "id": "appliance-repair",
        "name": "Appliance Repair",
        "icon": "wrench",
        "description": "Washing machine, refrigerator, microwave & chimney repair.",
        "starting_price": 449,
        "available_providers": 2
    },
    {
        "id": "carpentry",
        "name": "Carpentry & Furniture",
        "icon": "hammer",
        "description": "Custom woodwork, door locks, cabinet repair & furniture assembly.",
        "starting_price": 399,
        "available_providers": 2
    },
    {
        "id": "computer-repair",
        "name": "Computer & IT Repair",
        "icon": "laptop",
        "description": "Laptop hardware fix, OS installation, virus removal & upgrades.",
        "starting_price": 449,
        "available_providers": 2
    },
    {
        "id": "painting",
        "name": "Painting & Wall Care",
        "icon": "paintbrush",
        "description": "Interior & exterior painting, wall waterproofing & touchups.",
        "starting_price": 849,
        "available_providers": 2
    }
]

PROVIDERS = [
    {
        "id": "P101",
        "service_id": "electrical",
        "service_name": "Electrical Services",
        "name": "Raj Electrical Services",
        "rating": 4.8,
        "experience_years": 6,
        "price": 499,
        "availability": "Available Today",
        "service_area": "Central & North Zone",
        "description": "Certified electrician with expertise in domestic wiring & safety upgrades."
    },
    {
        "id": "P102",
        "service_id": "electrical",
        "service_name": "Electrical Services",
        "name": "VoltMaster Solutions",
        "rating": 4.9,
        "experience_years": 9,
        "price": 599,
        "availability": "Available Today",
        "service_area": "All City",
        "description": "Commercial & residential electrical repairs, emergency panel fixes."
    },
    {
        "id": "P103",
        "service_id": "plumbing",
        "service_name": "Plumbing & Pipe Repair",
        "name": "Apex Plumbing Co.",
        "rating": 4.7,
        "experience_years": 5,
        "price": 399,
        "availability": "Available Today",
        "service_area": "South & East Zone",
        "description": "Expert leak detection, high-pressure line clearing and fixture fittings."
    },
    {
        "id": "P104",
        "service_id": "plumbing",
        "service_name": "Plumbing & Pipe Repair",
        "name": "QuickFlow Plumbers",
        "rating": 4.6,
        "experience_years": 4,
        "price": 349,
        "availability": "Available Tomorrow",
        "service_area": "West Zone",
        "description": "Fast and affordable plumbing repairs for homes and small offices."
    },
    {
        "id": "P105",
        "service_id": "cleaning",
        "service_name": "Home & Deep Cleaning",
        "name": "Sparkle Clean Express",
        "rating": 4.9,
        "experience_years": 7,
        "price": 799,
        "availability": "Available Today",
        "service_area": "All City",
        "description": "Eco-friendly deep cleaning with mechanized equipment & trained staff."
    },
    {
        "id": "P106",
        "service_id": "cleaning",
        "service_name": "Home & Deep Cleaning",
        "name": "EcoFresh Home Services",
        "rating": 4.8,
        "experience_years": 5,
        "price": 699,
        "availability": "Available Today",
        "service_area": "Central Zone",
        "description": "Specialized sanitization, carpet shampooing, and kitchen degreasing."
    },
    {
        "id": "P107",
        "service_id": "ac-repair",
        "service_name": "AC Repair & Servicing",
        "name": "CoolCare AC Experts",
        "rating": 4.9,
        "experience_years": 8,
        "price": 549,
        "availability": "Available Today",
        "service_area": "North & West Zone",
        "description": "Split & window AC servicing, compressor diagnostics & gas charging."
    },
    {
        "id": "P108",
        "service_id": "ac-repair",
        "service_name": "AC Repair & Servicing",
        "name": "FreezeTech Climate Solutions",
        "rating": 4.7,
        "experience_years": 6,
        "price": 499,
        "availability": "Available Tomorrow",
        "service_area": "South Zone",
        "description": "Quick response AC maintenance and original spare replacements."
    },
    {
        "id": "P109",
        "service_id": "appliance-repair",
        "service_name": "Appliance Repair",
        "name": "FixIt Appliance Hub",
        "rating": 4.6,
        "experience_years": 5,
        "price": 449,
        "availability": "Available Today",
        "service_area": "East & Central Zone",
        "description": "Multi-brand washing machine, fridge, and microwave repair specialists."
    },
    {
        "id": "P110",
        "service_id": "appliance-repair",
        "service_name": "Appliance Repair",
        "name": "HomeCare Repair Pro",
        "rating": 4.8,
        "experience_years": 10,
        "price": 599,
        "availability": "Available Today",
        "service_area": "All City",
        "description": "Decade of experience in heavy home appliance diagnostics and overhaul."
    },
    {
        "id": "P111",
        "service_id": "carpentry",
        "service_name": "Carpentry & Furniture",
        "name": "Craftsman Woodworks",
        "rating": 4.8,
        "experience_years": 12,
        "price": 649,
        "availability": "Available Tomorrow",
        "service_area": "North Zone",
        "description": "Master woodcraft, custom shelving, hinge replacement and furniture repair."
    },
    {
        "id": "P112",
        "service_id": "carpentry",
        "service_name": "Carpentry & Furniture",
        "name": "WoodShield Carpentry",
        "rating": 4.5,
        "experience_years": 4,
        "price": 399,
        "availability": "Available Today",
        "service_area": "South & West Zone",
        "description": "Rapid door lock installation, desk assembly & general woodwork."
    },
    {
        "id": "P113",
        "service_id": "computer-repair",
        "service_name": "Computer & IT Repair",
        "name": "TechMedic Systems",
        "rating": 4.9,
        "experience_years": 7,
        "price": 499,
        "availability": "Available Today",
        "service_area": "Central & East Zone",
        "description": "Doorstep computer repair, chip-level troubleshooting & SSD upgrades."
    },
    {
        "id": "P114",
        "service_id": "computer-repair",
        "service_name": "Computer & IT Repair",
        "name": "ByteFix Laptop & PC",
        "rating": 4.7,
        "experience_years": 6,
        "price": 449,
        "availability": "Available Today",
        "service_area": "All City",
        "description": "Screen replacement, thermal paste re-application & network setup."
    },
    {
        "id": "P115",
        "service_id": "painting",
        "service_name": "Painting & Wall Care",
        "name": "ColorCraft Painters",
        "rating": 4.8,
        "experience_years": 8,
        "price": 999,
        "availability": "Available Today",
        "service_area": "All City",
        "description": "Dust-free painting, texture walls, moisture treatment & interior styling."
    },
    {
        "id": "P116",
        "service_id": "painting",
        "service_name": "Painting & Wall Care",
        "name": "PrimeFinish Wall Care",
        "rating": 4.6,
        "experience_years": 5,
        "price": 849,
        "availability": "Available Tomorrow",
        "service_area": "West & North Zone",
        "description": "Quick touch-ups, single room painting & waterproof wall putty."
    }
]

PROVIDERS_BY_ID = {p["id"]: p for p in PROVIDERS}
SERVICES_BY_ID = {s["id"]: s for s in SERVICES}

# --- Runtime In-Memory Store ---

SERVICE_REQUESTS = {
    "QS1001": {
        "id": "QS1001",
        "customer_name": "TESC - Test 1",
        "customer_phone": "+91 98765 00001",
        "customer_email": "test1@quickserve.local",
        "service_id": "electrical",
        "service_name": "Electrical Services",
        "provider_id": "P101",
        "provider_name": "Raj Electrical Services",
        "address": "101 Test Enclave, Anna Nagar, Chennai",
        "preferred_date": "2026-09-25",
        "preferred_time": "10:00 AM",
        "problem_description": "Main circuit breaker inspection and switchboard testing.",
        "urgency": "Standard",
        "status": "Pending",
        "estimated_amount": 499,
        "created_at": "2026-09-23 09:00",
        "feedback": None
    },
    "QS1002": {
        "id": "QS1002",
        "customer_name": "TESC - Test 2",
        "customer_phone": "+91 98765 00002",
        "customer_email": "test2@quickserve.local",
        "service_id": "plumbing",
        "service_name": "Plumbing & Pipe Repair",
        "provider_id": "P103",
        "provider_name": "Apex Plumbing Co.",
        "address": "202 Test Residency, T. Nagar, Chennai",
        "preferred_date": "2026-09-25",
        "preferred_time": "11:30 AM",
        "problem_description": "Bathroom pipe leakage repair and faucet alignment.",
        "urgency": "High",
        "status": "Accepted",
        "estimated_amount": 399,
        "created_at": "2026-09-23 10:15",
        "feedback": None
    },
    "QS1003": {
        "id": "QS1003",
        "customer_name": "TESC - Test 3",
        "customer_phone": "+91 98765 00003",
        "customer_email": "test3@quickserve.local",
        "service_id": "ac-repair",
        "service_name": "AC Repair & Servicing",
        "provider_id": "P107",
        "provider_name": "CoolCare AC Experts",
        "address": "303 Test Heights, Adyar, Chennai",
        "preferred_date": "2026-09-24",
        "preferred_time": "02:00 PM",
        "problem_description": "Split AC cooling diagnostic and gas refilling service.",
        "urgency": "High",
        "status": "In Progress",
        "estimated_amount": 549,
        "created_at": "2026-09-23 11:30",
        "feedback": None
    },
    "QS1004": {
        "id": "QS1004",
        "customer_name": "TESC - Test 4",
        "customer_phone": "+91 98765 00004",
        "customer_email": "test4@quickserve.local",
        "service_id": "cleaning",
        "service_name": "Home & Deep Cleaning",
        "provider_id": "P105",
        "provider_name": "Sparkle Clean Express",
        "address": "404 Test Villa, Velachery, Chennai",
        "preferred_date": "2026-09-22",
        "preferred_time": "09:00 AM",
        "problem_description": "Full home deep sanitization and kitchen degreasing.",
        "urgency": "Standard",
        "status": "Completed",
        "estimated_amount": 799,
        "created_at": "2026-09-22 08:30",
        "feedback": {
            "rating": 5,
            "comment": "Outstanding service! Provider was punctual and thorough.",
            "created_at": "2026-09-22 17:00"
        }
    },
    "QS1005": {
        "id": "QS1005",
        "customer_name": "TESC - Test 5",
        "customer_phone": "+91 98765 00005",
        "customer_email": "test5@quickserve.local",
        "service_id": "appliance-repair",
        "service_name": "Appliance Repair",
        "provider_id": "P109",
        "provider_name": "FixIt Appliance Hub",
        "address": "505 Test Towers, OMR, Chennai",
        "preferred_date": "2026-09-21",
        "preferred_time": "04:00 PM",
        "problem_description": "Washing machine spin cycle error diagnosis.",
        "urgency": "Standard",
        "status": "Cancelled",
        "estimated_amount": 449,
        "created_at": "2026-09-21 14:00",
        "feedback": None
    },
    "QS1006": {
        "id": "QS1006",
        "customer_name": "TESC - Test 6",
        "customer_phone": "+91 98765 00006",
        "customer_email": "test6@quickserve.local",
        "service_id": "carpentry",
        "service_name": "Carpentry & Furniture",
        "provider_id": "P111",
        "provider_name": "Craftsman Woodworks",
        "address": "606 Wood Street, Guindy, Chennai",
        "preferred_date": "2026-09-26",
        "preferred_time": "11:00 AM",
        "problem_description": "Custom bookshelf alignment and door lock replacement.",
        "urgency": "Standard",
        "status": "Pending",
        "estimated_amount": 649,
        "created_at": "2026-09-23 15:20",
        "feedback": None
    },
    "QS1007": {
        "id": "QS1007",
        "customer_name": "TESC - Test 7",
        "customer_phone": "+91 98765 00007",
        "customer_email": "test7@quickserve.local",
        "service_id": "computer-repair",
        "service_name": "Computer & IT Repair",
        "provider_id": "P113",
        "provider_name": "TechMedic Systems",
        "address": "707 IT Corridor, Porur, Chennai",
        "preferred_date": "2026-09-25",
        "preferred_time": "03:00 PM",
        "problem_description": "Desktop PC overheating and SSD upgrade installation.",
        "urgency": "High",
        "status": "Accepted",
        "estimated_amount": 499,
        "created_at": "2026-09-23 16:10",
        "feedback": None
    },
    "QS1008": {
        "id": "QS1008",
        "customer_name": "TESC - Test 8",
        "customer_phone": "+91 98765 00008",
        "customer_email": "test8@quickserve.local",
        "service_id": "painting",
        "service_name": "Painting & Wall Care",
        "provider_id": "P115",
        "provider_name": "ColorCraft Painters",
        "address": "808 Paint Avenue, Mylapore, Chennai",
        "preferred_date": "2026-09-27",
        "preferred_time": "09:30 AM",
        "problem_description": "Living room interior accent wall painting and touchup.",
        "urgency": "Standard",
        "status": "In Progress",
        "estimated_amount": 999,
        "created_at": "2026-09-23 17:00",
        "feedback": None
    }
}

REQUEST_COUNTER = 1008

VALID_TRANSITIONS = {
    "Pending": ["Accepted", "Cancelled"],
    "Accepted": ["In Progress", "Cancelled"],
    "In Progress": ["Completed", "Cancelled"],
    "Completed": [],
    "Cancelled": []
}

# --- Utility Functions ---

def success_response(data, code=200):
    """Returns standard JSON success response."""
    return jsonify({"success": True, **data}), code

def error_response(message, code=400):
    """Returns standard JSON error response."""
    return jsonify({"success": False, "error": message}), code

def find_request(request_id):
    """O(1) lookup for service request by ID."""
    return SERVICE_REQUESTS.get(request_id.upper())

def find_provider(provider_id):
    """O(1) lookup for provider by ID."""
    return PROVIDERS_BY_ID.get(provider_id)

def generate_request_id():
    """Generates sequential request IDs like QS1009."""
    global REQUEST_COUNTER
    REQUEST_COUNTER += 1
    return f"QS{REQUEST_COUNTER}"

def validate_request_payload(data):
    """Validates service request submission fields."""
    required_fields = [
        "customer_name", "customer_phone", "customer_email",
        "service_id", "provider_id", "address",
        "preferred_date", "preferred_time", "problem_description"
    ]
    for field in required_fields:
        val = data.get(field)
        if not val or not str(val).strip():
            return False, f"Field '{field.replace('_', ' ').title()}' is required."
    
    if data.get("service_id") not in SERVICES_BY_ID:
        return False, "Invalid service category selected."
        
    provider = find_provider(data.get("provider_id"))
    if not provider:
        return False, "Selected service provider does not exist."
        
    if provider["service_id"] != data.get("service_id"):
        return False, "Selected provider does not offer the requested service."
        
    return True, None

def validate_status_transition(current_status, new_status):
    """Verifies whether transition from current_status -> new_status is allowed."""
    allowed = VALID_TRANSITIONS.get(current_status, [])
    return new_status in allowed

# --- Page Template Routes ---

@app.route("/")
def index_page():
    return render_template("index.html")

@app.route("/services")
def services_page():
    return render_template("services.html")

@app.route("/providers")
def providers_page():
    return render_template("providers.html")

@app.route("/request")
def request_page():
    return render_template("request.html")

@app.route("/tracking")
def tracking_page():
    return render_template("tracking.html")

@app.route("/dashboard")
def dashboard_page():
    return render_template("dashboard.html")

@app.route("/feedback")
def feedback_page():
    return render_template("feedback.html")

# --- REST API Endpoints ---

@app.route("/api/services", methods=["GET"])
def get_services():
    return success_response({"services": SERVICES})

@app.route("/api/providers", methods=["GET"])
def get_all_providers():
    return success_response({"providers": PROVIDERS})

@app.route("/api/providers/<service_id>", methods=["GET"])
def get_providers_by_service(service_id):
    matched = [p for p in PROVIDERS if p["service_id"] == service_id]
    return success_response({"service_id": service_id, "providers": matched})

@app.route("/api/requests", methods=["GET"])
def get_requests():
    requests_list = sorted(list(SERVICE_REQUESTS.values()), key=lambda x: x["id"], reverse=True)
    stats = {
        "total": len(requests_list),
        "pending": sum(1 for r in requests_list if r["status"] == "Pending"),
        "active": sum(1 for r in requests_list if r["status"] in ["Accepted", "In Progress"]),
        "completed": sum(1 for r in requests_list if r["status"] == "Completed"),
        "cancelled": sum(1 for r in requests_list if r["status"] == "Cancelled")
    }
    return success_response({"requests": requests_list, "stats": stats})

@app.route("/api/requests/<request_id>", methods=["GET"])
def get_request_by_id(request_id):
    req = find_request(request_id)
    if not req:
        return error_response(f"Request '{request_id}' not found.", 404)
    return success_response({"request": req})

@app.route("/api/requests", methods=["POST"])
def create_request():
    data = request.get_json() or {}
    
    is_valid, err_msg = validate_request_payload(data)
    if not is_valid:
        return error_response(err_msg, 400)
        
    provider = find_provider(data["provider_id"])
    service = SERVICES_BY_ID[data["service_id"]]
    
    new_id = generate_request_id()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    new_request = {
        "id": new_id,
        "customer_name": data["customer_name"].strip(),
        "customer_phone": data["customer_phone"].strip(),
        "customer_email": data["customer_email"].strip(),
        "service_id": service["id"],
        "service_name": service["name"],
        "provider_id": provider["id"],
        "provider_name": provider["name"],
        "address": data["address"].strip(),
        "preferred_date": data["preferred_date"].strip(),
        "preferred_time": data["preferred_time"].strip(),
        "problem_description": data["problem_description"].strip(),
        "urgency": data.get("urgency", "Standard"),
        "status": "Pending",
        "estimated_amount": provider["price"],
        "created_at": now_str,
        "feedback": None
    }
    
    SERVICE_REQUESTS[new_id] = new_request
    
    return success_response({
        "message": "Service request submitted successfully.",
        "request_id": new_id,
        "status": "Pending",
        "request": new_request
    }, 201)

@app.route("/api/requests/<request_id>/status", methods=["PATCH"])
def update_request_status(request_id):
    req = find_request(request_id)
    if not req:
        return error_response(f"Request '{request_id}' not found.", 404)
        
    data = request.get_json() or {}
    new_status = data.get("status")
    
    if not new_status:
        return error_response("Target status is required.", 400)
        
    current_status = req["status"]
    if current_status == new_status:
        return success_response({"message": f"Request status is already '{new_status}'.", "request": req})
        
    if not validate_status_transition(current_status, new_status):
        return error_response(
            f"Invalid status transition from '{current_status}' to '{new_status}'.", 409
        )
        
    req["status"] = new_status
    return success_response({
        "message": f"Request {request_id} status updated to '{new_status}'.",
        "request_id": request_id,
        "status": new_status,
        "request": req
    })

@app.route("/api/requests/<request_id>/feedback", methods=["POST"])
def submit_feedback(request_id):
    req = find_request(request_id)
    if not req:
        return error_response(f"Request '{request_id}' not found.", 404)
        
    if req["status"] != "Completed":
        return error_response(
            f"Feedback can only be submitted for completed requests. Current status: '{req['status']}'.", 409
        )
        
    if req["feedback"] is not None:
        return error_response("Feedback has already been submitted for this request.", 409)
        
    data = request.get_json() or {}
    try:
        rating = int(data.get("rating", 0))
    except (TypeError, ValueError):
        rating = 0
        
    if rating < 1 or rating > 5:
        return error_response("Rating must be an integer between 1 and 5.", 400)
        
    comment = str(data.get("comment", "")).strip()
    if not comment:
        return error_response("Feedback comment is required.", 400)
        
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    req["feedback"] = {
        "rating": rating,
        "comment": comment,
        "created_at": now_str
    }
    
    return success_response({
        "message": "Thank you! Your feedback has been saved successfully.",
        "request": req
    }, 201)

# --- Error Handlers & App Startup ---

@app.errorhandler(404)
def not_found_error(e):
    if request.path.startswith("/api/"):
        return error_response("Endpoint not found.", 404)
    return render_template("index.html"), 404

@app.errorhandler(500)
def internal_error(e):
    if request.path.startswith("/api/"):
        return error_response("An internal server error occurred.", 500)
    return jsonify({"error": "Internal Server Error"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
