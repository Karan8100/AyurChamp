# AYUSHYA v2: Doctor-Patient System Plan

> Ye document AI coding agent ke liye hai. Isse pehle PROJECT_OVERVIEW.md padh chuka hai. Is file me batayi gayi changes hi karni hain, usse zyada nahi.

---

## 0. Agent ke liye Rules (sabse pehle padho)

1. **Minimum changes.** Jo kuch already bana hai (Prakriti engine, diet engine, Ritucharya, Dinacharya clock, RAG, SHA-256 dossier, UI components) usko reuse karo. Rewrite mat karo.
2. **Purane routes, tables, API ko tod ke mat badlo.** Naye modules alongside jodo. Kuch hatana ho to is file ke Section 9 me jo "Hatao" list hai, sirf wahi hatao.
3. **Naya table, DB migration, naya env variable ya API key chahiye ho to PEHLE user ko batao.** Batao ki kya chahiye, kyun chahiye, aur kaun si file/table affect hogi. Permission ke baad hi banao.
4. **Ek baar me ek hi step karo.** User step-by-step prompt dega. Aage ke steps pehle se mat banao.
5. **Har step ke baad purana flow chalna chahiye** (login, Prakriti assessment, dashboard). Step khatam karke short list do: kya change hua, kaun si files touch hui, kaise test karein.
6. **Prototype hai.** QR, complex integrations, over-engineering mat karo. Simple aur chalta hua kaam karo.
7. **Doctor final authority hai.** AI/engine sirf suggest karta hai. Diagnosis, dawai, therapy, investigations aur follow-up doctor khud likhta hai.
8. **Ye plan patthar ki lakeer nahi hai, ek strong guideline hai.** Product ka goal ye hai: ek real clinic me doctor ka time bache aur patient ko plan hamesha mile. Agar tujhe lagta hai ki koi cheez is file me jaisi likhi hai usse behtar ya zyada practical tarike se ho sakti hai (field, screen flow, naming, DB design, status, validation, UX), to wahi banao jo ek real, production-style system me hona chahiye. Rules:
   - Plan se hatke koi **chhota technical/UX faisla** ho (field ka type, screen ka layout, validation, naming) to khud lo aur step ke end me ek line me bata do.
   - Plan se hatke koi **bada faisla** ho (naya feature, kisi feature ko hatana, flow badalna, naya table, API key) to **pehle user ko batao** ki kya aur kyun, phir aage badho.
   - Koi gap ya contradiction dikhe (jaise koi real-clinic scenario jo plan me miss hai), to chhupao mat, user ko batao aur suggestion do.
   - Section 0 ke baaki rules (minimum changes, purana flow na tootna, ek baar me ek step) phir bhi lagu hain.

---

## 1. Product Direction

Pehle: patient ka self-assessment tool.
Ab: **Doctor-led care platform.** Doctor system ka core user hai, patient doctor ke plan ko follow karta hai.

Reason: asli clinic me patient khud se app kam use karta hai, aur doctor ki parchi/prescription gum ho jaati hai. System doctor ka time bachayega (patient ka data pehle se ready) aur patient ko plan hamesha uske phone me dega.

---

## 2. Roles

| Role | Status | Kaam |
|---|---|---|
| **Doctor** | Core, abhi banana hai | Patients dekhna, visit record karna, prescription banana, follow-up set karna |
| **Patient** | Core, abhi banana hai | Profile, Prakriti, history, reports, plan follow karna |
| **Staff** | **Optional, abhi nahi** | Baad me. Abhi sirf data model me jagah chhodo (role enum me `staff` ho sakta hai), koi UI mat banao |

Auth: existing login system ko extend karo, role field jodo (`doctor` / `patient`). Role ke hisaab se alag dashboard.

---

## 3. Onboarding (QR nahi, basic)

### 3.1 Doctor Registration
Fields:
- Full name
- Phone (OTP/login ke hisaab se, jo existing auth me hai)
- Email
- Qualification (BAMS / MD Ayurveda / MS Ayurveda / other)
- Specialization (Kayachikitsa, Panchakarma, Shalya, Stri-Roga, etc.)
- Ayush council registration number + State council ka naam
- Years of experience
- Clinic / Hospital name
- Clinic address, city, state, pincode
- Consultation timings (simple text ya days + time range)
- Languages spoken
- Profile photo (optional)

Verification: prototype me auto-approved. Field `is_verified` rakho taaki baad me admin approval lag sake.

### 3.2 Patient Registration
Fields:
- Full name
- Age ya date of birth
- Gender (Male / Female / Other)
- Phone, email (optional)
- City / address
- Blood group (optional)
- Height, weight (optional, doctor visit me bhi leta hai)
- Emergency contact (naam + phone, optional)
- Preferred language (English / Hindi)

### 3.3 Doctor-Patient Linking (simple)
- Patient signup/profile ke baad **doctor select** karta hai: doctor list me search (naam / clinic / city) se, ya doctor ka short ID/code dalke.
- Ek simple consent checkbox: "Ye doctor mera health data dekh sakta hai."
- Walk-in case: doctor khud naya patient profile bana sake (naam + phone + basic details). Patient baad me usi phone se login karke claim kare. (Agar ye complex lage to is step me skip karke baad me karo, user se poochho.)

---

## 4. Poora Workflow

### Stage 1: Prakriti Assessment (ek baar)
- Doctor ya staff/students patient ko **bolte hain** ki Prakriti assessment karna hai. System me koi assign button zaroori nahi.
- Patient apne phone par existing 24-question assessment (+ tie-breaker) bharta hai.
- Result system me patient profile par save hota hai.
- Doctor ko patient profile me Prakriti dikhta hai (Vata/Pitta/Kapha %).
- **Doctor override/confirm nahi hai.** Result as-is rakho.
- Doctor ki patient list me badge: "Prakriti: Done / Pending", taaki doctor/staff ko pata chale kise bolna hai.
- Optional later: staff patient ke saath baithke assessment bhare (assisted mode). Abhi nahi.

### Stage 2: Visit se pehle (patient ki taraf se)
Patient visit se pehle jitna ho sake system me daalta hai:
1. **Medical history form** (Section 5.1): purani bimariyan, allergies, ongoing dawai, surgeries.
2. **Reports upload:** blood test, X-ray report, USG, purani prescription, discharge summary, etc. (PDF/photo). AI inhe padh ke structured data nikalta hai (Section 6).

### Stage 3: Visit (doctor ke saath)
1. Doctor appointment list me patient dekhta hai. Patient aaya to **"Arrived" mark** karta hai.
2. Doctor patient ka **pre-visit summary** dekhta hai (Section 6.4): profile, Prakriti, history, ongoing meds, abnormal report values. Ye sab pehle se ready hota hai, doctor ka time bachta hai.
3. Doctor **Visit record** bharta hai (Section 5.2): chief complaint, vitals, Ayurvedic pariksha, aur **Vikriti** (doctor khud, meeting me).
4. Doctor patient ki history verify/update kar sakta hai.
5. Visit ke baad prescription banti hai (Stage 4).

### Stage 4: Prescription Builder
Details Section 7 me. Short me:
- **System suggest karta hai:** Diet (Pathya/Apathya), Dinacharya, Ritucharya.
- Doctor **suggestion le sakta hai/edit kar sakta hai ya khud manually likh sakta hai.** Dono options.
- Baaki sab doctor khud bharta hai: provisional diagnosis, dawaiyan, therapy, investigations, follow-up date.
- Finalize karne par: prescription versioned PDF banti hai (SHA-256 hash ke saath) aur patient ko notification jaata hai.

### Stage 5: Patient ka Roz ka Experience
- **My Plan:** latest prescription hamesha app me (parchi gum hone ka solution).
- **Aaj ka plan:** kya khana hai, kya nahi, dawai kab leni hai, routine.
- **Dawai reminders** + "li / nahi li" tick. Doctor ko adherence summary dikhti hai.
- **Reports upload** kabhi bhi.
- **Follow-up date** dikhti hai.
- **PDF download / WhatsApp share** (offline fallback).
- **NAHI hai:** weekly Vikriti check-in, Vikriti tracking.

### Stage 6: Follow-up
1. Doctor prescription me follow-up date set karta hai. Usse ek **appointment** ban jaata hai (status `scheduled`).
2. **Follow-up se 1 din pehle patient ko notification** jaata hai (default subah 9 baje IST, configurable). Channel: in-app notification (+ browser push agar aasaan ho). SMS/WhatsApp baad me.
3. **Patient nahi aaya:** appointment `missed` ho jaata hai (follow-up date nikalne ke baad), doctor ko dashboard me "Missed / Overdue" list dikhti hai, aur doctor **reschedule** kar sakta hai (nayi date, patient ko naya notification).
4. **Patient aaya:** doctor **"Arrived" mark** karta hai, phir visit start hota hai.
5. Follow-up visit par doctor ko dikhta hai: pichhli prescription, dawai adherence, nayi reports. Doctor naya visit record + nayi prescription version banata hai.

**Appointment statuses:** `scheduled → arrived → completed`, ya `missed`, `rescheduled`, `cancelled`.

---

## 5. Fields (Kaun kya bharta hai)

### 5.1 Patient khud bharta hai (visit se pehle)
- Personal profile (Section 3.2)
- Purani bimariyan / chronic conditions (checklist + other): Diabetes, Hypertension, Thyroid, Asthma, Heart disease, Kidney, Liver, Arthritis, Skin, other
- Allergies (dawai / khana / other)
- **Ongoing dawaiyan** (naam, kisliye, kitne time se): allopathic/Ayurvedic/other
- Past surgeries
- Family history (checklist)
- Pregnancy / menstrual info (agar female, optional)
- Habits: smoking, alcohol, tobacco (optional)
- Reports upload

Doctor ye sab dekh ke visit me verify/correct kar sakta hai.

### 5.2 Doctor har visit me bharta hai (Vikriti assessment questionnaire hata di gayi hai)
**A. Chief complaint**
- Main complaint, kab se (duration), onset (sudden/gradual), severity
- Associated symptoms, aggravating/relieving factors
- Nidana (possible causes, free text)

**B. Vitals**
- BP (systolic/diastolic), pulse, temperature, SpO2, respiratory rate
- Weight, height (BMI auto-calc)

**C. Ayurvedic Pariksha (structured + free text)**
- Agni (sama / vishama / tikshna / manda)
- Koshtha (mridu / madhyama / krura)
- Ama lakshana (present/absent)
- Nidra, kshudha (bhookh), pipasa (pyaas)
- Mala (frequency/consistency), Mutra
- Nadi (rate + character: vata/pitta/kapha gati)
- Jihva (coating etc.), Sparsha, Druk (eyes), Akriti, Shabda
- Bala, Satva (mental strength), Vaya (age group)

**D. Vikriti (doctor ki entry, meeting me)**
- Har dosha (Vata/Pitta/Kapha) ke liye: **Normal / Vriddhi (increased) / Kshaya (decreased)**
- Optional: dushya, srotas (free text)
- Doctor ka free-text note

**E. Provisional diagnosis** (free text, optional ICD/NAMASTE code baad me)

---

## 6. AI Report Extraction (Feature Design)

**Goal:** patient jo reports upload karta hai, unka important data doctor ko ek clean, scannable form me dikhe, taaki doctor ko 10 PDF kholne na padein.

**Principle:** AI sirf **padhta aur copy karta hai.** Diagnose nahi karta, dawai suggest nahi karta, aur missing value guess nahi karta. Doctor hamesha original file bhi dekh sakta hai.

### 6.1 Flow (simple, async)
1. Patient file upload karta hai (PDF/JPG/PNG, max ~10 MB) aur optional category chunta hai (Blood test / X-ray / USG / Prescription / Other).
2. File secure storage me save hoti hai. Report row banti hai, status `processing`. Patient ko turant "Uploaded" dikhta hai, wait nahi karna padta.
3. **Background job** chalta hai:
   - Agar PDF me text layer hai, to text extract karo (PyMuPDF/pdfplumber).
   - Agar scanned PDF ya photo hai, to page images vision-capable LLM ko bhejo (ya OCR).
4. LLM ko **strict JSON schema** deke bolo ki sirf report me jo likha hai wo nikalo:
```
{
  "report_type": "blood_test | xray | usg | prescription | other",
  "report_date": "YYYY-MM-DD or null",
  "lab_or_hospital": "string or null",
  "patient_name_on_report": "string or null",
  "tests": [
    {"name": "Hemoglobin", "value": 11.2, "unit": "g/dL",
     "reference_range": "13.0-17.0", "flag_in_report": "L or null"}
  ],
  "impression_text": "radiologist/doctor ka likha hua impression (copy as written) or null",
  "medicines_listed": ["agar purani prescription hai"],
  "notes": "string or null"
}
```
5. **Code me validation (AI se nahi):**
   - JSON schema check, numbers parse
   - Abnormal flag **deterministic** compute karo: value vs reference range
   - Report par likha patient name profile ke naam se match na kare to warning flag
6. Status `ready` (ya `failed` / `needs_review`). Doctor ko "new reports" count dikhta hai.

### 6.2 Doctor ko kya dikhta hai
- Patient profile me **Reports tab**: har report ka card (type, date, lab).
- Abnormal values **highlight** (High/Low) ek chhoti table me.
- **Original file side me** open ho sake.
- Badge: "AI-extracted, original se verify karein."
- Doctor galat value **edit** kar sakta hai, aur "Verified" mark kar sakta hai.
- X-ray/USG: sirf report ka **likha hua impression** dikhega. AI image ko khud interpret nahi karega. Agar sirf film ki photo hai bina text ke, to sirf file store hogi, extraction nahi.

### 6.3 Failure handling
- Extraction fail ho to bhi file doctor ko dikhti hai (original). "Auto-extraction nahi ho paya" ka message.
- Koi value unclear ho to `null` rakho, guess mat karo.

### 6.4 Pre-Visit Summary (complex mat banao)
Patient profile ke top par ek **summary panel**, jo **code/template se** banta hai (LLM zaroori nahi):
- Name, age, gender, Prakriti
- Known conditions, allergies, ongoing dawaiyan
- Latest vitals (agar pichhli visit hai)
- Abnormal report values (report-wise, date ke saath)
- Pending items (reports nahi aayi, history incomplete)

Optional v2: ek 4-5 line ka LLM-written readable summary. Abhi nahi.

### 6.5 Privacy aur Cost notes
- Files private storage me, public URL nahi. Access sirf linked doctor aur khud patient ko.
- Upload ke time consent line: "Report ko AI se padha jayega taaki doctor ko summary mile."
- External LLM API ko bhejne se pehle jahan possible ho, name/phone jaise identifiers strip karo.
- Cost: har report par 1 LLM call. Prototype me chalega.
- **Naya API key (vision-capable LLM) aur file storage chahiye hoga. Banane se pehle user se poochho.**

---

## 7. Prescription Builder

### 7.1 Doctor screen par ek jagah sab dikhe
Prakriti, Vikriti (is visit ki), vitals, history, ongoing meds, reports summary. Isse doctor dekh ke prescription likhta hai.

### 7.2 Sections

| Section | Kaun bharta hai |
|---|---|
| Provisional diagnosis | **Doctor (manual)** |
| Dawaiyan (naam, form, dose, anupana, timing, khane se pehle/baad, duration) | **Doctor (manual)** |
| Therapy advised (Panchakarma, Abhyanga, etc.) | **Doctor (manual)** |
| Investigations advised (tests ki list, free text/checklist) | **Doctor (manual)** |
| Follow-up date | **Doctor (manual)** |
| **Diet: Pathya / Apathya** | **System suggest karta hai, doctor accept/edit ya manual likhe** |
| **Dinacharya (routine)** | **System suggest karta hai, doctor accept/edit ya manual likhe** |
| **Ritucharya (seasonal advice)** | **System suggest karta hai, doctor accept/edit ya manual likhe** |

### 7.3 Suggestion kaise aata hai
- Existing diet/Dinacharya/Ritucharya engine reuse karo.
- Inputs: patient ki **Prakriti** + doctor ne is visit me jo **Vikriti** (dosha vriddhi/kshaya) bhari + **current season**.
- Pehle ke engine me Vikriti weekly pulse ke scores se aati thi. Ab doctor ki selection se aayegi. Agent check kare ki engine ka input format kya hai, aur doctor ki Vriddhi/Kshaya selection ko usme map karne ke liye chhota adapter bana de. Engine ko rewrite mat karo.
- UI: har section ke upar do option: **"Use suggestion"** (edit kar sakte hain) ya **"Write manually"**.
- Suggestion deterministic engine se aata hai. Isme LLM guess nahi hona chahiye.

### 7.4 Finalize aur versioning
- Doctor "Finalize" karta hai to prescription lock hoti hai. Edit karne par **nayi version** banti hai, purani safe rehti hai.
- PDF generate hota hai: clinic/doctor details, patient details, saari sections, version number, date, **SHA-256 hash** (existing dossier logic reuse). Hash verify karne ka simple page hona chahiye.
- Patient ko notification: "Doctor ne aapki prescription update ki hai."
- Follow-up date set hai to appointment auto-ban jaata hai.

---

## 8. AyurMitra: Role-wise Behaviour

Existing RAG pipeline reuse karo. Role ke hisaab se **system prompt, data access aur permissions** alag.

### Patient Mode
- **Context:** sirf us patient ki apni latest prescription, Prakriti, aur plan.
- **Kya karta hai:** "Mera plan samjhao", "ye dawai kab leni hai", "ye pathya kyun hai", general Ayurveda education, Shloka citations ke saath.
- **Kya nahi karta:** nayi dawai/dose/treatment suggest nahi karta, doctor ka plan badalne ko nahi kehta. Serious/new symptoms par "apne doctor se baat karein" bolta hai.
- **Emergency guardrail jaisa abhi hai waise hi rehne do. Isko mat chhuo.** (Ye existing safety feature hai.)

### Doctor Mode
- **Context:** sirf us doctor ke apne patients ka data.
- **Kya karta hai:** Samhita lookup (Charaka, Sushruta, Ashtanga Hridaya) citations ke saath, case summary ("is patient ki history aur reports ka saar"), dravya/dosha/pathya reference, plan drafting me help.
- **Zimmedari:** AI decision support hai, final decision doctor ka. Output me ye note rakho.
- **Access control:** doctor kisi doosre doctor ke patient ka data nahi dekh sakta.

### Staff Mode
- Abhi nahi. Role aane par baad me jodenge (app kaise use karein type help).

---

## 9. Hatao / Badlo / Rakho

### Hatao (remove): jo current plan me nahi hai

**Rule:** current plan (Sections 3 to 8) me jo feature nahi hai, wo hatana hai. Neeche ki list pakki hai. Iske alawa codebase me aur koi aisa feature mile jo is plan me nahi hai (jaise koi leftover self-assessment screen, gamification, extra report/chart), to **hatane se pehle user ko list dikhao aur poochho.** Apne se mat hatao.

| Item | Kaise hatana hai |
|---|---|
| **Weekly Vikriti Pulse / 2-minute check-in** (page, route, nav link, reminders) | UI + route + nav hatao |
| **Vikriti questionnaire** (patient side ya kahin bhi) | UI + route hatao. Vikriti ab doctor visit me manually bharta hai (Section 5.2 D) |
| **Vikriti tracking graph / trend chart / history chart** | Chart component aur usko dikhane wale sab places hatao |
| **Vikriti deviation calculation aur alerts** (dashboard par "is hafte Pitta badha hai" type banners, deviation formula ka UI) | UI/alerts hatao |
| **Prakriti complete hone ke baad generate hone wali report** (Clinical Health Dossier / A4 print report / PDF jo Prakriti result ke baad banti hai) | Generate/download button, page aur route hatao. Prakriti result sirf profile par Vata/Pitta/Kapha % me dikhega |
| **Report verify page** jo purani dossier ke liye tha | Hatao. Naya verify page sirf **prescription PDF** ke liye banega (Section 7.4) |
| **Prakriti ke baad auto "recommendations" / diet / routine** jo patient ko seedha (bina doctor) dikhti thi | Hatao. Plan ab sirf doctor ki prescription se aata hai |
| **Dashboard par self-diagnosis wale elements** ("Aapka dosha ye hai, ye karo" style advice cards) | Hatao. Dashboard par sirf Prakriti result, Dinacharya clock aur "My Plan" |
| **Prakriti "provisional / doctor confirm / override"** idea | Nahi banana, result as-is |
| **QR based linking** | Nahi banana |

> **Sirf code/UI hatao, DB tables mat drop karo.** Purana data tables me rehne do. Tables hatane ka faisla user karega, agent nahi.
> Hatane ke baad check karo: koi import/route/link toot to nahi gaya, login aur Prakriti assessment ab bhi chal rahe hain.
> **SHA-256 hash ka logic (function) mat hatao**, wo prescription PDF me reuse hoga. Sirf purani Prakriti-report wala UI/page hatao.

### Badlo (change)
| Item | Change |
|---|---|
| Auth | Role jodo (doctor/patient) |
| Dashboard | Role ke hisaab se alag dashboard |
| Diet planner | Doctor ke liye prescription ka suggestion generator ban jaye. Doctor-linked patient ke liye standalone planner ka nav link chhupao (route rakh sakte ho), uski jagah "My Plan" dikhao |
| AyurMitra | Role-wise modes (Section 8) |
| Landing/pitch text | "Self-diagnosis" ki language hatao, "Doctor-led, patient-continued care" karo |
| SHA-256 hash logic | Purani Prakriti dossier se hata ke **Prescription PDF** me use karo |
| Tridosha chart (dashboard) | Rakho, bas sirf Prakriti dikhaye (Vikriti overlay/deviation hatao) |

### Rakho (keep as-is)
Prakriti assessment + tie-breaker, Tridosha breakdown chart (sirf Prakriti), Ritucharya engine, Dinacharya clock, Samhita RAG, emergency guardrail (AyurMitra me), SHA-256 hash function, EN/Hindi toggle, Guest mode (sirf demo ke liye, seeded demo doctor + demo patient).

### Final check (har cleanup step ke baad agent ye confirm kare)
- Koi page/route/nav link bacha hai kya jo Vikriti questionnaire, Vikriti graph ya Prakriti-report par jaata ho? Nahi hona chahiye.
- Guest mode demo ab bhi chal raha hai?
- Patient dashboard par ab sirf: Prakriti result, Dinacharya clock, My Plan, reports, follow-up.

---

## 10. Future-Ready Hooks (abhi implement NAHI karna, bas design aisa rakho)

### Communication (chat / voice / video)
- **Abhi kuch mat banao.**
- Appointment table me `mode` field rakho (`in_person` default, baad me `video`, `voice`, `chat`).
- Notification system **generic** rakho (type, user, payload, read/unread, scheduled_at) taaki naye notification types baad me jud sakein.
- Baad me `conversations` aur `messages` tables jodenge. Abhi nahi.
- Missed-connection handling (doctor/patient available nahi) tabhi jab communication aayega.
- Communication me emergency flow abhi nahi.

### Referral / Specialist / Department
- **Baad me.** Abhi prescription me "Investigations advised" ek simple list hai, aur kuch nahi.
- Table design me kuch aisa mat karo jo baad me referral jodne me rukawat bane (visit aur prescription ko clean IDs se rakho).

### Staff role
- Role enum me jagah, UI nahi.

---

## 11. Expected Data (agent ko confirm karna hai, user se poochke banana)

Ye sirf andaza hai. Agent existing schema dekhe, jo reuse ho sakta hai reuse kare, aur naya table banane se pehle user se poochhe.

- `users` me `role` field
- `doctor_profiles`
- `patient_profiles` (+ medical history fields ya alag `patient_history`)
- `doctor_patient_links` (consent ke saath)
- `appointments` (status, scheduled_at, mode)
- `visits` (chief complaint, vitals, ayurvedic exam, vikriti, diagnosis)
- `reports` + `report_extractions` (file path, status, JSON, verified flag)
- `prescriptions` (version, status, hash) + `prescription_medicines`
- `medicine_logs` (li/nahi li)
- `notifications` (generic)

**Naye env variables / keys jo lag sakte hain:** vision-capable LLM API key (report extraction), file storage (S3-compatible ya local disk for prototype), scheduler (cron/background worker) for D-1 notifications.

---

## 12. Build Order (ek-ek step, user prompt dega)

1. **Roles + Auth + Doctor/Patient profiles + simple linking + consent**
2. **Doctor dashboard:** patient list (Prakriti Done/Pending badge) + patient profile page
3. **Patient intake:** medical history form + report upload (AI abhi nahi, sirf upload aur storage)
4. **Appointments + Visit flow:** doctor "Arrived" mark, visit record (complaint, vitals, Ayurvedic pariksha, Vikriti)
5. **AI report extraction** + pre-visit summary
6. **Prescription builder:** suggestion/manual dono, versioning, PDF + hash
7. **Patient My Plan:** medicine reminders + adherence tick
8. **Follow-up:** D-1 notification, missed list, reschedule
9. **AyurMitra role-wise modes**
10. **Cleanup:** Section 9 ki "Hatao" list (Vikriti pulse, questionnaire, tracking graph, deviation alerts, Prakriti ke baad ki report, self-diagnosis cards), landing text badalna, guest mode demo seed
    - Agar pehle hi step me purana UI doctor/patient flow me aa raha ho (jaise Vikriti link nav me dikh raha ho), to usi step me chhupa do, aur poora hatana is step 10 me.

Communication aur Referral abhi scope me nahi.

---

## 13. Demo Flow (end-to-end, jury ke liye)
Doctor registers → Patient registers aur doctor select karta hai → Patient Prakriti karta hai, history aur report upload → Doctor patient ko dekhta hai (summary + report highlights) → Doctor visit record aur Vikriti bharta hai → Prescription (suggestion + manual) finalize → Patient My Plan dekhta hai → D-1 notification → Patient miss kare to doctor ko missed list → reschedule.

---

## 14. Assumptions (user se confirm hone baaki)
1. Vikriti ab **sirf doctor visit me manually** bharta hai (patient side questionnaire/check-in/tracking nahi).
2. AyurMitra ki existing emergency guardrail rakhi gayi hai (communication wale emergency flow ka isse koi lena dena nahi).
3. Patient appointment khud book nahi karta abhi, doctor appointment/follow-up banata hai. Walk-in me doctor seedha visit start karta hai.
4. Doctor verification prototype me auto-approve.
