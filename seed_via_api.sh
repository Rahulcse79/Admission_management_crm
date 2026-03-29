#!/bin/bash
# ═══════════════════════════════════════════════════
# Seed dummy data via API calls
# ═══════════════════════════════════════════════════
set -e

API="http://localhost:8080/api/v1"

echo "🔑 Logging in as admin..."
TOKEN=$(curl -sf "$API/auth/login" -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"rahulcoral12@gmail.com","password":"Rahul@r1.14l"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])")

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"; exit 1
fi
echo "✅ Got token"

AUTH="Authorization: Bearer $TOKEN"
CT="Content-Type: application/json"

# Helper function: POST and return the created ID
post() {
  local url="$1"; local data="$2"
  local resp
  resp=$(curl -sf "$API$url" -X POST -H "$CT" -H "$AUTH" -d "$data")
  echo "$resp" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('id',''))" 2>/dev/null
}

# ═══════════════════════════════════════════════════
# 1. ACADEMIC YEARS
# ═══════════════════════════════════════════════════
echo ""
echo "📅 Creating academic years..."
AY1=$(post "/academic-years" '{"year":"2025-26","start_date":"2025-06-01T00:00:00Z","end_date":"2026-05-31T00:00:00Z","is_current":false,"is_active":true}')
echo "   ✅ 2025-26 → $AY1"
AY2=$(post "/academic-years" '{"year":"2026-27","start_date":"2026-06-01T00:00:00Z","end_date":"2027-05-31T00:00:00Z","is_current":true,"is_active":true}')
echo "   ✅ 2026-27 → $AY2"

# Set 2026-27 as current
curl -sf "$API/academic-years/$AY2/set-current" -X PUT -H "$CT" -H "$AUTH" -d '{}' > /dev/null 2>&1 || true
echo "   ⭐ Set 2026-27 as current"

# ═══════════════════════════════════════════════════
# 2. INSTITUTIONS
# ═══════════════════════════════════════════════════
echo ""
echo "🏛️  Creating institutions..."
INST1=$(post "/institutions" '{"name":"EduMerge University","code":"EMU","address":"123 University Road, Bangalore 560001","phone":"080-12345678","email":"admin@edumerge.edu","website":"https://edumerge.edu"}')
echo "   ✅ EduMerge University → $INST1"
INST2=$(post "/institutions" '{"name":"National Institute of Engineering","code":"NIE","address":"Mysore Road, Mysore 570008","phone":"0821-9876543","email":"admin@nie.ac.in","website":"https://nie.ac.in"}')
echo "   ✅ NIE → $INST2"

# ═══════════════════════════════════════════════════
# 3. CAMPUSES
# ═══════════════════════════════════════════════════
echo ""
echo "🏫 Creating campuses..."
CAMP1=$(post "/campuses" "{\"institution_id\":\"$INST1\",\"name\":\"Main Campus\",\"code\":\"EMU-MC\",\"address\":\"University Road, Bangalore 560001\"}")
echo "   ✅ Main Campus → $CAMP1"
CAMP2=$(post "/campuses" "{\"institution_id\":\"$INST1\",\"name\":\"North Campus\",\"code\":\"EMU-NC\",\"address\":\"Hebbal, Bangalore 560024\"}")
echo "   ✅ North Campus → $CAMP2"
CAMP3=$(post "/campuses" "{\"institution_id\":\"$INST2\",\"name\":\"NIE Main Campus\",\"code\":\"NIE-MC\",\"address\":\"Mananthavady Road, Mysore 570008\"}")
echo "   ✅ NIE Main → $CAMP3"

# ═══════════════════════════════════════════════════
# 4. DEPARTMENTS
# ═══════════════════════════════════════════════════
echo ""
echo "📚 Creating departments..."
DEPT_CSE=$(post "/departments" "{\"campus_id\":\"$CAMP1\",\"name\":\"Computer Science & Engineering\",\"code\":\"CSE\"}")
echo "   ✅ CSE → $DEPT_CSE"
DEPT_ECE=$(post "/departments" "{\"campus_id\":\"$CAMP1\",\"name\":\"Electronics & Communication\",\"code\":\"ECE\"}")
echo "   ✅ ECE → $DEPT_ECE"
DEPT_ME=$(post "/departments" "{\"campus_id\":\"$CAMP1\",\"name\":\"Mechanical Engineering\",\"code\":\"ME\"}")
echo "   ✅ ME → $DEPT_ME"
DEPT_IS=$(post "/departments" "{\"campus_id\":\"$CAMP2\",\"name\":\"Information Science\",\"code\":\"IS\"}")
echo "   ✅ IS → $DEPT_IS"
DEPT_CV=$(post "/departments" "{\"campus_id\":\"$CAMP2\",\"name\":\"Civil Engineering\",\"code\":\"CV\"}")
echo "   ✅ CV → $DEPT_CV"
DEPT_CSE2=$(post "/departments" "{\"campus_id\":\"$CAMP3\",\"name\":\"Computer Science (NIE)\",\"code\":\"CSE-N\"}")
echo "   ✅ CSE-NIE → $DEPT_CSE2"
DEPT_EEE=$(post "/departments" "{\"campus_id\":\"$CAMP3\",\"name\":\"Electrical & Electronics\",\"code\":\"EEE\"}")
echo "   ✅ EEE → $DEPT_EEE"

# ═══════════════════════════════════════════════════
# 5. PROGRAMS
# ═══════════════════════════════════════════════════
echo ""
echo "🎓 Creating programs..."
PROG_CSE=$(post "/programs" "{\"department_id\":\"$DEPT_CSE\",\"name\":\"B.Tech Computer Science\",\"code\":\"BTCSE\",\"course_type\":\"UG\",\"duration\":4}")
echo "   ✅ B.Tech CSE → $PROG_CSE"
PROG_ECE=$(post "/programs" "{\"department_id\":\"$DEPT_ECE\",\"name\":\"B.Tech Electronics & Communication\",\"code\":\"BTECE\",\"course_type\":\"UG\",\"duration\":4}")
echo "   ✅ B.Tech ECE → $PROG_ECE"
PROG_ME=$(post "/programs" "{\"department_id\":\"$DEPT_ME\",\"name\":\"B.Tech Mechanical\",\"code\":\"BTME\",\"course_type\":\"UG\",\"duration\":4}")
echo "   ✅ B.Tech ME → $PROG_ME"
PROG_IS=$(post "/programs" "{\"department_id\":\"$DEPT_IS\",\"name\":\"B.Tech Information Science\",\"code\":\"BTIS\",\"course_type\":\"UG\",\"duration\":4}")
echo "   ✅ B.Tech IS → $PROG_IS"
PROG_CV=$(post "/programs" "{\"department_id\":\"$DEPT_CV\",\"name\":\"B.Tech Civil Engineering\",\"code\":\"BTCV\",\"course_type\":\"UG\",\"duration\":4}")
echo "   ✅ B.Tech CV → $PROG_CV"
PROG_CSE2=$(post "/programs" "{\"department_id\":\"$DEPT_CSE2\",\"name\":\"B.Tech CS (NIE)\",\"code\":\"BTCSN\",\"course_type\":\"UG\",\"duration\":4}")
echo "   ✅ B.Tech CSE NIE → $PROG_CSE2"
PROG_EEE=$(post "/programs" "{\"department_id\":\"$DEPT_EEE\",\"name\":\"B.Tech Electrical\",\"code\":\"BTEEE\",\"course_type\":\"UG\",\"duration\":4}")
echo "   ✅ B.Tech EEE → $PROG_EEE"
PROG_MTCSE=$(post "/programs" "{\"department_id\":\"$DEPT_CSE\",\"name\":\"M.Tech Computer Science\",\"code\":\"MTCSE\",\"course_type\":\"PG\",\"duration\":2}")
echo "   ✅ M.Tech CSE → $PROG_MTCSE"
PROG_MTVLSI=$(post "/programs" "{\"department_id\":\"$DEPT_ECE\",\"name\":\"M.Tech VLSI Design\",\"code\":\"MTVLSI\",\"course_type\":\"PG\",\"duration\":2}")
echo "   ✅ M.Tech VLSI → $PROG_MTVLSI"

# ═══════════════════════════════════════════════════
# 6. SEAT MATRICES
# ═══════════════════════════════════════════════════
echo ""
echo "💺 Creating seat matrices..."

create_seat_matrix() {
  local prog_id="$1" intake="$2" label="$3"
  local kcet=$((intake * 40 / 100))
  local comedk=$((intake * 35 / 100))
  local mgmt=$((intake - kcet - comedk))
  post "/seat-matrices" "{
    \"program_id\":\"$prog_id\",
    \"academic_year_id\":\"$AY2\",
    \"total_intake\":$intake,
    \"quotas\":[
      {\"quota_type\":\"KCET\",\"total_seats\":$kcet,\"filled_seats\":0,\"remaining_seats\":$kcet},
      {\"quota_type\":\"COMEDK\",\"total_seats\":$comedk,\"filled_seats\":0,\"remaining_seats\":$comedk},
      {\"quota_type\":\"Management\",\"total_seats\":$mgmt,\"filled_seats\":0,\"remaining_seats\":$mgmt}
    ],
    \"supernumerary\":[
      {\"category\":\"J&K\",\"max_seats\":2,\"used_seats\":0},
      {\"category\":\"Foreign\",\"max_seats\":3,\"used_seats\":0}
    ]
  }"
  echo "   ✅ $label (intake: $intake)"
}

SM_CSE=$(create_seat_matrix "$PROG_CSE" 120 "B.Tech CSE")
SM_ECE=$(create_seat_matrix "$PROG_ECE" 60 "B.Tech ECE")
SM_ME=$(create_seat_matrix "$PROG_ME" 60 "B.Tech ME")
SM_IS=$(create_seat_matrix "$PROG_IS" 60 "B.Tech IS")
SM_CV=$(create_seat_matrix "$PROG_CV" 60 "B.Tech CV")
SM_CSE2=$(create_seat_matrix "$PROG_CSE2" 60 "B.Tech CSE NIE")
SM_EEE=$(create_seat_matrix "$PROG_EEE" 60 "B.Tech EEE")
SM_MTCSE=$(create_seat_matrix "$PROG_MTCSE" 30 "M.Tech CSE")
SM_MTVLSI=$(create_seat_matrix "$PROG_MTVLSI" 20 "M.Tech VLSI")

# ═══════════════════════════════════════════════════
# 7. APPLICANTS
# ═══════════════════════════════════════════════════
echo ""
echo "📝 Creating applicants..."

FIRST_NAMES=("Aarav" "Vivaan" "Aditya" "Vihaan" "Arjun" "Sai" "Reyansh" "Ayaan" "Krishna" "Ishaan" "Ananya" "Diya" "Myra" "Aadhya" "Pihu" "Prisha" "Anika" "Sara" "Navya" "Aanya" "Rohit" "Amit" "Sneha" "Pooja" "Rahul" "Priya" "Deepak" "Kavitha" "Suresh" "Lakshmi" "Nikhil" "Tanvi" "Harsh" "Megha" "Karthik" "Divya" "Varun" "Anjali" "Pranav" "Shruti" "Ravi" "Neha" "Akash" "Pallavi" "Gaurav" "Swati" "Manish" "Rashmi" "Sanjay" "Meera")
LAST_NAMES=("Sharma" "Patel" "Kumar" "Singh" "Reddy" "Rao" "Gupta" "Verma" "Joshi" "Nair" "Iyer" "Bhat" "Hegde" "Shetty" "Gowda" "Menon" "Pillai" "Das" "Mishra" "Tiwari")
GENDERS=("Male" "Female")
CATEGORIES=("GM" "SC" "ST" "OBC" "2A" "2B" "3A" "3B")
QUOTAS=("KCET" "COMEDK" "Management")
EXAMS=("KCET-2026" "COMEDK-2026" "JEE Main 2026")

PROG_IDS=("$PROG_CSE" "$PROG_ECE" "$PROG_ME" "$PROG_IS" "$PROG_CV" "$PROG_CSE2" "$PROG_EEE" "$PROG_MTCSE" "$PROG_MTVLSI")
PROG_COUNTS=(25 12 12 12 10 10 10 6 5)  # applicants per program

APP_NUM=1000
APPLICANT_IDS=()
APPLICANT_PROGS=()
APPLICANT_QUOTAS=()
APPLICANT_COUNT=0

for pi in "${!PROG_IDS[@]}"; do
  PROGID="${PROG_IDS[$pi]}"
  COUNT="${PROG_COUNTS[$pi]}"

  for ((i=0; i<COUNT; i++)); do
    APP_NUM=$((APP_NUM + 1))
    FN="${FIRST_NAMES[$((RANDOM % ${#FIRST_NAMES[@]}))]}"
    LN="${LAST_NAMES[$((RANDOM % ${#LAST_NAMES[@]}))]}"
    GN="${GENDERS[$((RANDOM % 2))]}"
    CAT="${CATEGORIES[$((RANDOM % ${#CATEGORIES[@]}))]}"
    QT="${QUOTAS[$((RANDOM % ${#QUOTAS[@]}))]}"
    EX="${EXAMS[$((RANDOM % ${#EXAMS[@]}))]}"
    MARKS=$(( (RANDOM % 4000 + 5000) ))  # 50.00 - 90.00
    MARKS_F="$(( MARKS / 100 )).$(printf '%02d' $(( MARKS % 100 )))"
    RANK=$(( RANDOM % 40000 + 1000 ))
    PHONE="9$(printf '%09d' $((RANDOM * RANDOM % 1000000000)))"
    DOB="200$((RANDOM % 5 + 3))-$(printf '%02d' $((RANDOM % 12 + 1)))-$(printf '%02d' $((RANDOM % 28 + 1)))T00:00:00Z"

    if [ "$QT" = "Management" ]; then
      ADMODE="Management"
    else
      ADMODE="Government"
    fi

    ENTRY="Regular"
    if [ $((RANDOM % 10)) -eq 0 ]; then
      ENTRY="Lateral"
    fi

    ALLOT=""
    if [ "$QT" = "KCET" ]; then
      ALLOT="KCET-$((RANDOM % 900000 + 100000))"
    elif [ "$QT" = "COMEDK" ]; then
      ALLOT="CMK-$((RANDOM % 900000 + 100000))"
    fi

    APPID=$(post "/applicants" "{
      \"first_name\":\"$FN\",
      \"last_name\":\"$LN\",
      \"email\":\"${FN,,}.${LN,,}${APP_NUM}@example.com\",
      \"phone\":\"$PHONE\",
      \"date_of_birth\":\"$DOB\",
      \"gender\":\"$GN\",
      \"category\":\"$CAT\",
      \"address\":\"$((RANDOM % 200 + 1)), Sector $((RANDOM % 50 + 1)), Bangalore\",
      \"program_id\":\"$PROGID\",
      \"academic_year_id\":\"$AY2\",
      \"entry_type\":\"$ENTRY\",
      \"quota_type\":\"$QT\",
      \"admission_mode\":\"$ADMODE\",
      \"allotment_number\":\"$ALLOT\",
      \"qualifying_exam\":\"$EX\",
      \"marks\":$MARKS_F,
      \"rank\":$RANK
    }")

    if [ -n "$APPID" ] && [ "$APPID" != "" ]; then
      APPLICANT_IDS+=("$APPID")
      APPLICANT_PROGS+=("$pi")
      APPLICANT_QUOTAS+=("$QT")
      APPLICANT_COUNT=$((APPLICANT_COUNT + 1))
    fi
  done
  echo "   ✅ Program $((pi+1))/9: created ${COUNT} applicants"
done
echo "   📊 Total applicants: $APPLICANT_COUNT"

# ═══════════════════════════════════════════════════
# 8. ALLOCATE SEATS & CONFIRM ADMISSIONS
# ═══════════════════════════════════════════════════
echo ""
echo "🎫 Allocating seats for ~65% of applicants..."

ALLOCATED=0
CONFIRMED=0

for idx in "${!APPLICANT_IDS[@]}"; do
  # ~65% get seat allocated
  if [ $((RANDOM % 100)) -lt 65 ]; then
    AID="${APPLICANT_IDS[$idx]}"

    ADM_RESP=$(curl -sf "$API/admissions/allocate" -X POST -H "$CT" -H "$AUTH" \
      -d "{\"applicant_id\":\"$AID\"}" 2>/dev/null || echo "")

    ADM_ID=$(echo "$ADM_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('id',''))" 2>/dev/null || echo "")

    if [ -n "$ADM_ID" ] && [ "$ADM_ID" != "" ]; then
      ALLOCATED=$((ALLOCATED + 1))

      # ~70% of allocated get confirmed
      if [ $((RANDOM % 100)) -lt 70 ]; then
        curl -sf "$API/admissions/$ADM_ID/confirm" -X PUT -H "$CT" -H "$AUTH" -d '{}' > /dev/null 2>&1 || true
        CONFIRMED=$((CONFIRMED + 1))

        # Update fee status to Paid for confirmed
        curl -sf "$API/admissions/$ADM_ID/fee-status" -X PUT -H "$CT" -H "$AUTH" -d '{"fee_status":"Paid"}' > /dev/null 2>&1 || true
      fi
    fi
  fi
done

echo "   ✅ Seats allocated: $ALLOCATED"
echo "   ✅ Admissions confirmed: $CONFIRMED"

# ═══════════════════════════════════════════════════
# 9. REGISTER EXTRA USERS
# ═══════════════════════════════════════════════════
echo ""
echo "👤 Registering additional users..."
curl -sf "$API/auth/register" -X POST -H "$CT" -H "$AUTH" \
  -d '{"name":"Admission Officer","email":"officer@edumerge.com","password":"Officer@123","role":"admission_officer"}' > /dev/null 2>&1 || true
echo "   ✅ officer@edumerge.com (Officer@123)"

curl -sf "$API/auth/register" -X POST -H "$CT" -H "$AUTH" \
  -d '{"name":"Management Viewer","email":"management@edumerge.com","password":"Mgmt@123","role":"management"}' > /dev/null 2>&1 || true
echo "   ✅ management@edumerge.com (Mgmt@123)"

# ═══════════════════════════════════════════════════
# DONE
# ═══════════════════════════════════════════════════
echo ""
echo "🎉 ═══════════════════════════════════════════"
echo "   SEEDING COMPLETED!"
echo "═══════════════════════════════════════════════"
echo ""
echo "📊 Data Created:"
echo "   • 2 Institutions"
echo "   • 3 Campuses"
echo "   • 7 Departments"
echo "   • 9 Programs (7 UG + 2 PG)"
echo "   • 2 Academic Years"
echo "   • 9 Seat Matrices"
echo "   • $APPLICANT_COUNT Applicants"
echo "   • $ALLOCATED Seats Allocated"
echo "   • $CONFIRMED Admissions Confirmed"
echo ""
echo "🔑 Login Credentials:"
echo "   Admin:   rahulcoral12@gmail.com / Rahul@r1.14l"
echo "   Officer: officer@edumerge.com / Officer@123"
echo "   Mgmt:    management@edumerge.com / Mgmt@123"
echo ""
echo "🌐 Open http://localhost:3000 to see the dashboard!"
