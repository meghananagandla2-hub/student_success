# Student Success Platform
## Run
    python3 generate_data.py     # creates 7 source CSVs in data/ (skip if you have real data)
    python3 build_scores.py      # integrates, cleans, scores -> data/student_success_scores.csv + dashboard/data.js
    # then open dashboard/index.html (double-click) or: cd dashboard && python3 -m http.server 8000
Python 3.8+, standard library only. No internet needed.
## Student Success Score (0-100) = weighted sum of indicator sub-scores (each 0-100)
Academic 30% (0.7*CGPA*10 + 0.3*avg marks - 4*backlogs) | Attendance 15% | LMS 10% (logins + assignment completion)
Engagement 10% (events, clubs, hackathons, certifications) | Placement readiness 20% (40% aptitude, 40% coding, 20% mock interview)
Skills 10% (60% technical, 40% soft) | Feedback 5% (satisfaction + faculty feedback)
## Risk
Academic risk: High if CGPA<5.5 or attendance<65 or backlogs>=3; Medium if CGPA<6.5 or attendance<75 or any backlog.
Placement risk: High if placement readiness<35, Medium if <50. Overall High if either High or score<45; Medium if either Medium or score<60.
## Explainability
Impact of an indicator = (student sub-score - cohort mean) x weight. Negative impacts are the drivers of risk and map to suggested actions.
## Segments
Star Performers | High Academic, Low Placement Readiness | Placement-Ready but Academically Struggling | Disengaged Low Performers | Steady Middle
## Cleaning
Duplicate rows removed, "82%" strings fixed, missing values median-imputed, scores clipped to 0-100.
## Replacing with real data
Keep column names in data/*.csv (student_id is the join key) and re-run build_scores.py.
