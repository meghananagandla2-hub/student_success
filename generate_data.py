"""Generates 7 messy source CSVs (academic, attendance, lms, engagement, placement, skills, feedback)."""
import csv, random
random.seed(42)
N = 300
DEPTS = ["CSE", "ECE", "MECH", "CIVIL", "MBA", "IT"]
clip = lambda x, lo, hi: max(lo, min(hi, x))
FN = "Aarav Priya Rohit Sneha Karthik Ananya Vikram Divya Arjun Meera Rahul Kavya Suresh Lakshmi Imran Fatima Nikhil Pooja Sai Harini".split()
LN = "Reddy Sharma Kumar Rao Patel Singh Nair Iyer Khan Das Gupta Verma Naidu Joshi Menon".split()
rows = {k: [] for k in ["academic","attendance","lms","engagement","placement","skills","feedback"]}
for i in range(1, N+1):
    sid = f"S{i:04d}"; a = random.gauss(0,1); e = random.gauss(0,1); p = 0.4*a + random.gauss(0,1)
    dept = random.choice(DEPTS); year = random.randint(1,4)
    cgpa = round(clip(6.8+0.9*a+random.gauss(0,.5),4,9.8),2)
    back = 0 if a > -0.3 else random.choice([0,1,2,3,4])
    rows["academic"].append([sid, f"{random.choice(FN)} {random.choice(LN)}", dept, year, cgpa, back,
                             round(clip(cgpa*10+random.gauss(0,6),30,100),1)])
    att = clip(78+8*e+3*a+random.gauss(0,6),35,100)
    rows["attendance"].append([sid, f"{att:.0f}%" if random.random()<.1 else round(att,1)])
    rows["lms"].append([sid, int(clip(14+7*e+2*a+random.gauss(0,4),0,40)), round(clip(70+14*e+6*a+random.gauss(0,8),5,100),1)])
    rows["engagement"].append([sid, int(clip(3+2*e+random.gauss(0,1.5),0,12)), int(clip(1+e+random.gauss(0,1),0,4)),
                               int(clip(1+0.8*e+random.gauss(0,1),0,5)), int(clip(1.5+0.8*p+random.gauss(0,1),0,6))])
    rows["placement"].append([sid, round(clip(60+14*p+5*a+random.gauss(0,8),10,100),1), round(clip(55+15*p+random.gauss(0,9),5,100),1),
                              round(clip(55+12*p+random.gauss(0,10),5,100),1)])
    rows["skills"].append([sid, round(clip(58+13*p+4*a+random.gauss(0,7),10,100),1), round(clip(62+9*e+random.gauss(0,8),15,100),1)])
    rows["feedback"].append([sid, round(clip(3.6+0.4*a+0.2*e+random.gauss(0,.5),1,5),1), round(clip(3.7+0.3*a+random.gauss(0,.5),1,5),1)])
heads = {"academic":["student_id","name","department","year","cgpa","backlogs","avg_marks"],
 "attendance":["student_id","overall_attendance"],"lms":["student_id","logins_per_month","assignment_completion_pct"],
 "engagement":["student_id","events","clubs","hackathons","certifications"],
 "placement":["student_id","aptitude_score","coding_score","mock_interview_score"],
 "skills":["student_id","technical_score","softskill_score"],"feedback":["student_id","satisfaction","faculty_feedback"]}
for k, r in rows.items():
    for row in r:                       # inject missing values (realistic mess)
        if k not in ("academic",) and random.random() < .03: row[random.randint(1,len(row)-1)] = ""
    if k == "attendance": r += random.sample(r, 5)   # duplicate records
    with open(f"data/{k}.csv","w",newline="") as f:
        w = csv.writer(f); w.writerow(heads[k]); w.writerows(r)
print("Generated source CSVs in data/")
