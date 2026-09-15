# RoG-उपाttam — Clinical History Assistant

<p align="center">

**A patient-friendly clinical history assistant for structured pre-consultation health information**

<br>

[![Live Demo](https://img.shields.io/badge/Live-Demo-0f766e?style=for-the-badge\&logo=github\&logoColor=white)](https://ayushgautamcodes.github.io/SIH-2026/)
[![Smart India Hackathon](https://img.shields.io/badge/Smart%20India%20Hackathon-2026-ff6b35?style=for-the-badge)](https://www.sih.gov.in/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge\&logo=html5\&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge\&logo=css3\&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge\&logo=javascript\&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

</p>

<p align="center">
  <img src="https://img.shields.io/badge/English%20%7C%20Hindi-Supported-0d9488?style=flat-square">
  <img src="https://img.shields.io/badge/Voice%20Input-Web%20Speech%20API-0d9488?style=flat-square">
  <img src="https://img.shields.io/badge/Accessibility-Enabled-0d9488?style=flat-square">
  <img src="https://img.shields.io/badge/Frontend-Prototype-64748b?style=flat-square">
</p>

---

## Preview

<p align="center">
  <img src="./assets/screenshots/home.png" width="60%" alt="RoG-Upattam Home Screen">
</p>

<p align="center">
  <sub>Patient-focused clinical history assistant interface</sub>
</p>

---

## What is RoG-उपाttam?

RoG-उपाttam helps patients prepare a structured health history before meeting a physician.

Instead of asking patients to remember and explain everything manually, the application guides them through concern-specific questions, accepts voice/touch/text input, allows previous medical documents to be added, performs transparent safety screening, and produces a structured clinical summary for physician review.

---

## Core Workflow

```mermaid
flowchart LR

    A["Patient"] --> B["Consent"]

    B --> C["Select Health Concern"]

    C --> D["Guided Clinical Questions"]

    D --> E1["Voice Input"]
    D --> E2["Touch Input"]
    D --> E3["Text Input"]

    E1 --> F["Collected Patient History"]
    E2 --> F
    E3 --> F

    F --> G["Medical Documents"]

    G --> H["Safety / Red-Flag Screening"]

    H --> I["Structured Clinical Summary"]

    I --> J["Physician Review"]

    J --> K["Clinical Decision"]
```

---

## System Architecture

```mermaid
flowchart TB

    subgraph CLIENT["Frontend Application"]
        UI["Patient Interface"]

        VOICE["Web Speech API"]
        LANG["English / Hindi"]
        ACCESS["Accessibility Controls"]
        QUESTIONS["Adaptive Question Bank"]
        DOCS["Medical Document Upload"]
    end

    subgraph LOGIC["Application Logic"]
        STATE["In-Memory Application State"]
        SAFETY["Deterministic Safety Rules"]
        SUMMARY["Summary Generation"]
        AYUSH["AYUSH History"]
    end

    subgraph OUTPUT["Clinical Output"]
        RECORD["Structured Clinical History"]
        ALERT["Safety Alert"]
        REVIEW["Physician Review"]
    end

    UI --> QUESTIONS
    UI --> VOICE
    UI --> DOCS
    UI --> LANG
    UI --> ACCESS

    QUESTIONS --> STATE
    VOICE --> STATE
    DOCS --> STATE
    AYUSH --> STATE

    STATE --> SAFETY
    STATE --> SUMMARY

    SAFETY --> ALERT
    SUMMARY --> RECORD

    RECORD --> REVIEW
    ALERT --> REVIEW
```

## The current implementation uses in-memory state and a frontend-only architecture; backend services, OCR/AI processing, and production health-record integration are future components.

## Feature Map

```mermaid
mindmap
  root((RoG-उपाttam))
    Patient Assessment
      Concern Selection
      Adaptive Questions
      Voice Input
      Touch Input
      Text Input
    Accessibility
      Large Text
      High Contrast
      Touch Only
      Audio Questions
    Clinical History
      Symptoms
      Previous History
      Medical Documents
      Structured Summary
    Safety
      Red Flag Rules
      Urgent Alerts
      No Diagnosis
    Healthcare Workflow
      Physician Review
      Verification
      AYUSH History
    Interoperability
      ABHA
      HIS
      EMR
      FHIR R4
```

---

## Patient Journey

<p align="center">

| 01         | 02         | 03            | 04         | 05           |
| ---------- | ---------- | ------------- | ---------- | ------------ |
| 🧑 Patient | 🩺 Concern | 🎙️ Questions | 🛡️ Safety | 👨‍⚕️ Review |
| Start      | Select     | Answer        | Screen     | Verify       |

</p>

```text
        START
          │
          ▼
   ┌──────────────┐
   │ Patient      │
   │ enters app   │
   └──────┬───────┘
          ▼
   ┌──────────────┐
   │ Select       │
   │ concern      │
   └──────┬───────┘
          ▼
   ┌──────────────┐
   │ Guided       │
   │ questions    │
   └──────┬───────┘
          ▼
   ┌──────────────┐
   │ Safety       │
   │ screening    │
   └──────┬───────┘
          ▼
   ┌──────────────┐
   │ Structured   │
   │ summary      │
   └──────┬───────┘
          ▼
   ┌──────────────┐
   │ Physician    │
   │ review       │
   └──────────────┘
```

---

## Clinical Safety Flow

The prototype uses deterministic red-flag rules rather than diagnostic prediction. For example, the current rules flag combinations such as severe chest pain with breathing difficulty and sudden severe headache with vision-related symptoms.

```mermaid
flowchart TD

    A["Patient Responses"] --> B{"Red Flag Detected?"}

    B -- "No" --> C["Continue to Clinical Summary"]

    B -- "Yes" --> D["Priority Medical Assessment Alert"]

    D --> E["Inform Patient"]
    E --> F["Seek Appropriate Medical Attention"]

    C --> G["Physician Review"]
    F --> G
```

---

## Example Clinical Output

<p align="center">
  <img src="./assets/screenshots/clinical-summary.png" width="50%" alt="Clinical Summary">
</p>

```text
┌───────────────────────────────────────────────┐
│            CLINICAL HISTORY SUMMARY           │
├───────────────────────────────────────────────┤
│ Chief Complaint                               │
│ Fever and persistent cough                    │
│                                               │
│ Symptoms                                      │
│ • Duration                                    │
│ • Severity                                    │
│ • Associated symptoms                         │
│                                               │
│ Previous History                              │
│ • Medical conditions                          │
│ • Previous episodes                           │
│                                               │
│ Medical Documents                             │
│ • Prescription                                │
│ • Laboratory report                           │
│                                               │
│ Safety Screening                              │
│ • Clinical attention may be required          │
│                                               │
│ Physician Review                              │
│ ✓ Ready for verification                      │
└───────────────────────────────────────────────┘
```

The project organizes collected responses, relevant symptoms, documents and safety screening into a structured clinical summary for physician review.

---

## Technology

```mermaid
graph LR

    HTML["HTML5"]
    CSS["CSS3"]
    JS["JavaScript"]

    SPEECH["Web Speech API"]
    FILE["FileReader API"]

    HTML --> JS
    CSS --> JS
    JS --> SPEECH
    JS --> FILE
```

### Current stack

| Layer         | Technology                 |
| ------------- | -------------------------- |
| Structure     | HTML5                      |
| Styling       | CSS3                       |
| Logic         | Vanilla JavaScript         |
| Voice         | Web Speech API             |
| File handling | FileReader API             |
| Language      | English + Hindi            |
| State         | In-memory JavaScript state |

## The base HTML loads `style.css` and `script.js`, while the JavaScript implementation contains the application state, translations, question bank, voice interface, document upload, safety rules and summary generation.

## Project Structure

```text
SIH-2026/
│
├── index.html
├── script.js
├── style.css
│
├── assets/
│   └── screenshots/
│       ├── home.png
│       ├── assessment.png
│       ├── document-upload.png
│       ├── clinical-summary.png
│       └── physician-review.png
│
└── README.md
```

---

## Screenshots

### Home

<p align="center">
  <img src="./assets/screenshots/home.png" width="50%" alt="Home screen">
</p>

### Health Assessment

<p align="center">
  <img src="./assets/screenshots/assessment.png" width="50%" alt="Health assessment screen">
</p>

### Medical Document Upload

<p align="center">
  <img src="./assets/screenshots/document-upload.png" width="50%" alt="Medical document upload">
</p>

### Clinical Summary

<p align="center">
  <img src="./assets/screenshots/clinical-summary.png" width="50%" alt="Clinical summary">
</p>

### Physician Review

<p align="center">
  <img src="./assets/screenshots/physician-review.png" width="50%" alt="Physician review">
</p>

---

## Screenshots

<table>
<tr>
<td align="center">
<strong>Home</strong><br><br>
<img src="./assets/screenshots/home.png" width="65%" alt="Home screen">
</td>

<td align="center">
<strong>Health Assessment</strong><br><br>
<img src="./assets/screenshots/assessment.png" width="65%" alt="Health assessment screen">
</td>
</tr>

<tr>
<td align="center">
<strong>Medical Document Upload</strong><br><br>
<img src="./assets/screenshots/document-upload.png" width="65%" alt="Medical document upload">
</td>

<td align="center">
<strong>Clinical Summary</strong><br><br>
<img src="./assets/screenshots/clinical-summary.png" width="65%" alt="Clinical summary">
</td>
</tr>

<tr>
<td align="center" colspan="2">
<strong>Physician Review</strong><br><br>
<img src="./assets/screenshots/physician-review.png" width="50%" alt="Physician review">
</td>
</tr>
</table>

---

## Production Roadmap

```mermaid
timeline
    title RoG-उपाttam Roadmap

    Prototype : Frontend workflow
              : Bilingual interface
              : Voice input
              : Safety screening
              : Structured summary

    Phase 2 : Backend API
            : Database
            : Authentication
            : Secure document storage

    Phase 3 : Intelligence
            : OCR
            : Document extraction
            : AI-assisted summarization

    Phase 4 : Healthcare Integration
            : ABHA
            : ABDM
            : HIS / EMR
            : FHIR R4

    Phase 5 : Deployment
            : Physician dashboard
            : Hospital integration
            : Production security
```

The prototype already exposes planned interoperability areas including ABHA, HIS, EMR and FHIR R4.

---

## Live Demo

<p align="center">

### [Open RoG-उपाttam →](https://ayushgautamcodes.github.io/SIH-2026/)

</p>

---

## Important

> **RoG-उपाttam is not a diagnostic system.**

It is a clinical history-assistance prototype intended to organize patient-reported information for healthcare-professional review.

A qualified healthcare professional remains responsible for diagnosis and treatment decisions.

---

<p align="center">

**Built for Smart India Hackathon 2026**

</p>
