# RoG-उपाttam — Clinical History Assistant

> A patient-friendly clinical history assistant designed to help patients prepare structured health information before meeting a doctor.

<p align="center">

**Live Demo:**
https://ayushgautamcodes.github.io/SIH-2026/

</p>

---

## Overview

**RoG-उपाttam** is a web-based clinical history assistant that guides patients through a structured health-intake process before a medical consultation.

Instead of requiring patients to remember and explain their entire medical history manually, the application guides them through concern-specific questions and organizes their responses into a structured clinical summary for physician review.

The prototype supports:

* Guided health assessments
* Voice-based and touch-based responses
* English and Hindi interfaces
* Medical document upload
* Deterministic red-flag screening
* Structured clinical summaries
* Physician review and verification
* Optional AYUSH history collection
* Accessibility preferences
* Planned health-record interoperability

The current implementation is intentionally **frontend-only** and keeps application state in browser memory.

---

## Problem

Patients often have difficulty communicating their symptoms, previous medical history, medications, and relevant documents clearly during a consultation.

This can lead to:

* Incomplete patient histories
* Important symptoms being overlooked
* Time-consuming history-taking
* Difficulty for elderly or low-literacy patients
* Communication barriers for patients who cannot comfortably speak
* Unstructured medical documents and previous reports

RoG-उपाttam attempts to address this by collecting information in a guided and accessible interface and presenting the result as a structured clinical history.

---

## Solution

The application follows a simple patient-to-physician workflow:

```text
Patient
   │
   ▼
Consent
   │
   ▼
Select Health Concern
   │
   ▼
Adaptive Clinical Questions
   │
   ├── Voice Input
   ├── Touch Input
   └── Text Input
   │
   ▼
Medical Document Upload
   │
   ▼
Safety / Red-Flag Screening
   │
   ▼
Structured Clinical Summary
   │
   ▼
Physician Review & Verification
```

The interface explicitly positions the generated information as clinical history rather than a diagnosis, with final clinical decisions remaining with a qualified healthcare professional.

---

## Key Features

### 1. Guided Clinical Assessment

Patients first select their primary concern and are presented with a concern-specific question flow.

The application uses an adaptive clinical question bank where each concern has its own set of questions.

The implemented prototype includes concerns such as:

* Fever
* Headache
* Abdominal pain
* Chest pain
* Cough / breathing difficulty
* Child-related concerns
* Other health concerns

Each concern can collect information such as duration, severity, location, associated symptoms, previous history, and other clinically relevant responses.

---

### 2. Voice Input

RoG-उपाttam uses the browser's native **Web Speech API** for voice interaction.

The application:

* Detects browser speech-recognition support
* Starts and stops microphone input
* Converts speech into text
* Supports English and Hindi input
* Handles microphone permission errors
* Falls back to touch/text input when voice is unavailable

The prototype uses `en-IN` and `hi-IN` speech recognition locales. No backend or API key is required for the voice functionality.

---

### 3. Bilingual Interface

The interface currently supports:

**English**

**Hindi / हिंदी**

All major UI strings are maintained through a centralized translation structure, allowing the interface to switch language without changing the underlying workflow.

---

### 4. Medical Document Upload

Patients can upload previous medical documents such as:

* Prescriptions
* Laboratory reports
* Discharge summaries
* Other medical documents

Supported prototype formats:

```text
JPG
PNG
PDF
```

Maximum file size:

```text
10 MB
```

The current document-analysis functionality is a **prototype simulation**. The uploaded file is read locally using `FileReader`, after which a sample extraction result is displayed rather than performing real OCR or document AI processing.

---

### 5. Safety / Red-Flag Screening

The application contains transparent, deterministic safety rules designed to surface combinations of symptoms that may require prompt medical attention.

Examples include:

```text
Severe chest pain
        +
Difficulty breathing
```

and:

```text
Sudden severe headache
        +
Vision problems
```

The rules do **not** diagnose the patient. They generate an informational alert recommending appropriate medical attention.

The safety engine is intentionally deterministic and transparent rather than being a black-box prediction system.

---

### 6. Structured Clinical Summary

Patient responses are organized into a structured clinical history that can be reviewed by a physician.

The summary can include:

* Chief complaint
* Patient responses
* Clinical question-and-answer groups
* Uploaded medical documents
* Safety alerts
* Clinical guidance

The summary generation logic is based on the selected concern and collected patient responses.

---

### 7. Physician Review

The workflow does not treat the generated summary as a final medical decision.

The physician can review the collected information and mark the history as:

* Verified
* Reviewed

The application explicitly states that patient-reported clinical information should be reviewed and verified by the treating physician.

---

### 8. AYUSH History

An optional AYUSH section collects:

* Dashavidha Pariksha parameters
* Ahara-Vihara history

This section is intended to provide additional structured information to an AYUSH physician. The prototype does not generate an AYUSH diagnosis or treatment recommendation.

---

### 9. Accessibility

The interface includes accessibility-oriented controls including:

* Large text
* High contrast
* Touch-only interaction
* Audio question support
* Large touch targets

These controls are particularly intended to improve usability for elderly, low-literacy, and non-speaking users.

---

## System Architecture

The current prototype is intentionally lightweight:

```text
┌────────────────────────────────────────────┐
│              RoG-उपाttam UI                │
├────────────────────────────────────────────┤
│                                            │
│  Patient Input                             │
│  ├── Touch                                 │
│  ├── Text                                  │
│  └── Voice / Web Speech API                │
│                                            │
│                 ↓                          │
│                                            │
│  Clinical Question Bank                    │
│                                            │
│                 ↓                          │
│                                            │
│  Patient Answers                           │
│                                            │
│          ┌───────────────┐                 │
│          │ Safety Rules  │                 │
│          └───────┬───────┘                 │
│                  │                         │
│                  ▼                         │
│        Structured Summary                  │
│                  │                         │
│                  ▼                         │
│          Physician Review                  │
│                                            │
└────────────────────────────────────────────┘
```

The prototype currently keeps state in memory and does not use a backend database or server-side processing.

---

## Technology Stack

### Frontend

* **HTML5**
* **CSS3**
* **Vanilla JavaScript**

The HTML application uses a single `#app` container and loads the CSS and JavaScript directly.

### Browser APIs

* **Web Speech API** — voice input
* **FileReader API** — local document reading

### Fonts

* Inter
* Noto Sans Devanagari

The UI uses a healthcare-oriented teal/slate visual system with responsive layouts, rounded cards, large interaction targets, and accessibility states.

---

## Project Structure

```text
SIH-2026/
│
├── index.html
├── script.js
├── style.css
└── README.md
```

### `index.html`

Provides the base application shell and loads the frontend assets.

### `script.js`

Contains:

* Application state
* English/Hindi translations
* Clinical question bank
* AYUSH parameters
* Navigation
* Voice input
* Document upload handling
* Red-flag rules
* Summary generation
* UI rendering
* Event handlers

### `style.css`

Contains:

* Design tokens
* Typography
* Layout system
* Buttons
* Cards
* Alerts
* Question interfaces
* Voice interface
* Responsive behavior
* Accessibility styles

---

## Running Locally

Clone the repository:

```bash
git clone https://github.com/ayushgautamcodes/SIH-2026.git
```

Move into the project:

```bash
cd SIH-2026
```

Because the current application is a static frontend, it can be opened directly in a browser.

For a better local development environment, use a simple static server such as VS Code Live Server.

Example:

```bash
npx serve .
```

Then open the local URL shown by the server.

---

## Example Workflow

### Step 1 — Patient enters the application

The patient is presented with an introduction and consent screen.

### Step 2 — Select language

The patient can switch between English and Hindi.

### Step 3 — Select a concern

For example:

```text
Chest Pain
```

### Step 4 — Answer guided questions

The patient can answer through:

```text
Voice
Touch
Text
```

### Step 5 — Add previous medical information

The patient may upload a previous medical document.

### Step 6 — Safety screening

Deterministic rules evaluate selected responses for predefined red-flag combinations.

### Step 7 — Generate clinical history

Responses are organized into a structured clinical summary.

### Step 8 — Physician review

The clinician reviews and verifies the information before making clinical decisions.

This overall workflow is represented directly in the prototype's architecture and physician-review flow.

---

## Current Prototype Limitations

This repository represents a **frontend prototype**, not a production medical system.

### Document Analysis

Uploaded documents currently use simulated extraction rather than production OCR/document intelligence.

### Data Persistence

Application state exists only in memory during the current session.

There is currently no:

* Database
* User account system
* Server-side persistence
* Long-term patient record storage

### Backend

There is currently no backend API.

### AI / LLM Processing

The current implementation does not rely on an LLM for clinical reasoning.

### Hospital Directory

Nearby medical facilities shown by the prototype are demonstration data. A production implementation would connect to a live hospital directory or maps service.

---

## Planned Production Architecture

The prototype is structured so that production components can be introduced later:

```text
                    ┌─────────────────┐
                    │   Web / Mobile  │
                    │     Client      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Backend API   │
                    └────────┬────────┘
                             │
             ┌───────────────┼───────────────┐
             ▼               ▼               ▼
        Clinical DB      OCR / AI       Safety Engine
             │               │               │
             └───────────────┼───────────────┘
                             ▼
                     Clinical Summary
                             │
                             ▼
                     Physician Portal
                             │
                             ▼
                  Health Record Integration
```

The current project already identifies future integration points around **ABHA, Hospital Information Systems, EMR and FHIR R4**. FHIR R4 structured history is represented as ready in the prototype, while the other integrations are marked as planned.

---

## Future Enhancements

Potential production extensions include:

* Backend REST APIs
* Secure patient authentication
* Database-backed medical records
* Real OCR for prescriptions and reports
* Medical document classification
* Multilingual speech recognition
* More comprehensive clinical question banks
* Hospital and emergency-location APIs
* Physician dashboard
* ABHA/ABDM integration
* FHIR-based health-record exchange
* Audit logs
* Role-based access control
* Encryption at rest and in transit
* Consent and data-retention management
* Production-grade clinical validation
* AI-assisted summarization with appropriate clinical safeguards

The prototype itself identifies backend, secure health-record integration, and advanced AI/OCR capabilities as future production components.

---

## Safety Disclaimer

**RoG-उपाttam is a clinical history-assistance prototype, not a diagnostic system.**

The application collects patient-reported information, organizes it into a structured history, and applies predefined safety-screening rules.

It does not replace:

* A doctor
* A qualified healthcare professional
* Clinical examination
* Medical diagnosis
* Emergency medical care

All clinical decisions must be made by an appropriately qualified healthcare professional.

---

## Project Status

```text
Frontend Prototype        ✅
Responsive UI             ✅
English / Hindi           ✅
Guided Assessment         ✅
Voice Input               ✅
Touch / Text Input        ✅
Safety Screening          ✅
Clinical Summary          ✅
Physician Review          ✅
AYUSH History             ✅
Document Upload           ✅
Real OCR                  ⏳
Backend                   ⏳
Database                  ⏳
ABHA / ABDM Integration   ⏳
FHIR Production Flow      ⏳
AI / LLM Layer            ⏳
```

---

## Demo

**Live application:**

https://ayushgautamcodes.github.io/SIH-2026/

---

## Team / Hackathon

Developed as a **Smart India Hackathon 2026** project prototype.

**Project:** RoG-उपाttam — Clinical History Assistant

---

## License

This project is currently provided as a prototype for demonstration and development purposes.

Add a project-specific open-source license here when the repository is ready for public distribution.
