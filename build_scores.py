"""Integrates sources -> cleans -> Student Success Score -> risk flags -> segments -> explanations."""
import csv, json, statistics as st
SRC = ["academic","attendance","lms","engagement","placement","skills","feedback"]
WEIGHTS = {"academic":30,"attendance":15,"lms":10,"engagement":10,"placement":20,"skills":10,"feedback":5}
log = {"duplicates_removed":0,"missing_imputed":0,"pct_strings_fixed":0}
def num(x):
    if x is None or str(x).strip()=="": return None
    x = str(x).strip()
    if x.endswith("%"): x = x[:-1]
    return float(x)
data = {}
for s in SRC:
    for r in csv.DictReader(open(f"data/{s}.csv")):
        sid = r["student_id"]
        if sid in data and s in data[sid].get("_seen", set()): log["duplicates_removed"]+=1
        d = data.setdefault(sid, {"_seen": set()}); d["_seen"].add(s)
        d.update({k:v for k,v in r.items() if k!="student_id"})
numeric = [c for c in next(iter(data.values())) if c not in ("name","department","_seen")]
for c in numeric:
    vals = [num(d.get(c)) for d in data.values() if num(d.get(c)) is not None]
    med = st.median(vals)
    for d in data.values():
        v = num(d.get(c)); 
        if v is None: v = med; log["missing_imputed"]+=1
        d[c] = v
clip = lambda x: max(0, min(100, x))
students = []
for sid, d in sorted(data.items()):
    comp = {
     "academic": clip(0.7*d["cgpa"]*10 + 0.3*d["avg_marks"] - 4*d["backlogs"]),
     "attendance": clip(d["overall_attendance"]),
     "lms": clip(min(d["logins_per_month"]/25,1)*50 + d["assignment_completion_pct"]*0.5),
     "engagement": clip(d["events"]*8 + d["clubs"]*10 + d["hackathons"]*12 + d["certifications"]*10),
     "placement": clip(.4*d["aptitude_score"] + .4*d["coding_score"] + .2*d["mock_interview_score"]),
     "skills": clip(.6*d["technical_score"] + .4*d["softskill_score"]),
     "feedback": clip(((d["satisfaction"]-1)/4*.5 + (d["faculty_feedback"]-1)/4*.5)*100)}
    score = sum(comp[k]*w/100 for k,w in WEIGHTS.items())
    students.append(dict(id=sid, name=d["name"], dept=d["department"], year=int(d["year"]), cgpa=d["cgpa"], backlogs=int(d["backlogs"]),
        attendance=round(d["overall_attendance"],1), comp={k:round(v,1) for k,v in comp.items()}, score=round(score,1)))
mean = {k: st.mean(s["comp"][k] for s in students) for k in WEIGHTS}
for s in students:
    c, reasons = s["comp"], []
    ar = "High" if s["cgpa"]<5.5 or s["attendance"]<65 or s["backlogs"]>=3 else "Medium" if s["cgpa"]<6.5 or s["attendance"]<75 or s["backlogs"]>=1 else "Low"
    pr = "High" if c["placement"]<35 else "Medium" if c["placement"]<50 else "Low"
    if s["cgpa"]<6.5: reasons.append(f"CGPA {s['cgpa']}")
    if s["attendance"]<75: reasons.append(f"Attendance {s['attendance']}%")
    if s["backlogs"]>=1: reasons.append(f"{s['backlogs']} backlog(s)")
    if c["placement"]<55: reasons.append(f"Placement readiness {c['placement']:.0f}")
    if c["lms"]<40: reasons.append("Low LMS activity")
    overall = "High" if "High" in (ar,pr) or s["score"]<45 else "Medium" if "Medium" in (ar,pr) or s["score"]<60 else "Low"
    s.update(academic_risk=ar, placement_risk=pr, risk=overall, reasons=reasons)
    s["drivers"] = sorted([{"k":k,"impact":round((c[k]-mean[k])*w/100,2),"contrib":round(c[k]*w/100,2)} for k,w in WEIGHTS.items()], key=lambda x:x["impact"])
    A,P = c["academic"], c["placement"]
    s["segment"] = ("Disengaged Low Performers" if c["lms"]<45 and c["engagement"]<35 and A<60 else
        "High Academic, Low Placement Readiness" if A>=65 and P<55 else
        "Placement-Ready, Academically Struggling" if A<55 and P>=60 else
        "Star Performers" if A>=65 and P>=60 else "Steady Middle")
with open("data/student_success_scores.csv","w",newline="") as f:
    cols = ["id","name","dept","year","cgpa","backlogs","attendance",*WEIGHTS,"score","academic_risk","placement_risk","risk","segment","reasons"]
    w = csv.writer(f); w.writerow(cols)
    for s in students: w.writerow([s[k] if k in s else s["comp"][k] for k in cols[:-1]] + ["; ".join(s["reasons"])])
open("dashboard/data.js","w").write("window.DATA="+json.dumps({"students":students,"weights":WEIGHTS,"mean":{k:round(v,1) for k,v in mean.items()}})+";")
print("Cleaning log:", log); print(f"{len(students)} students | High risk: {sum(s['risk']=='High' for s in students)}")
