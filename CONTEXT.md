# CONTEXT.md - Project Overview: BI Quiz Portal

## 📌 About The Project

**BI Quiz Portal** is a web-based interactive quiz application built to test and reinforce understanding of **Business Intelligence (BI)** concepts. It serves as an exam preparation portal (UAS Business Intelligence) based on questions compiled from class **RIB 6B**.

---

## 🚀 Key Features

1. **Dual Quiz Modes**:
   - 🌐 **Mix All Questions (`Campur Semua Soal`)**: Randomizes questions across the entire dataset. Users can choose question counts (10, 20, 50, or all).
   - 👤 **Filter by Student (`Pilih per Mahasiswa`)**: Practice questions compiled by a specific student creator.

2. **Interactive Quiz Experience**:
   - **Real-time Stopwatch**: Tracks total time spent during the quiz session.
   - **Progress Tracking**: Dynamic progress bar and question counter (`Question X of Y`).
   - **Question Author Attribution**: Displays which student created the current question.

3. **Results & Comprehensive Review**:
   - **Performance Score Card**: Visual score representation with percentage and contextual feedback.
   - **Session Statistics**: Displays correct answers count, incorrect answers count, and total duration.
   - **Detailed Answer Explanations**: Lists all incorrectly answered questions along with the correct key and detailed explanations (`penjelasan`).

4. **Modern UI/UX Design**:
   - **Monochrome Minimalist Aesthetic**: Dark theme (Zinc palette) with glassmorphism visual hierarchy.
   - **Fully Responsive**: Optimized for both mobile devices and desktop screens.
   - **Typography**: Powered by Google Fonts (`Inter` for body & UI, `Outfit` for display headings).

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Native HTML5, Vanilla CSS3 (Custom design system with CSS Variables), ES6 JavaScript.
- **Data Source**: `daftarsoal.json` (Structured JSON containing student creators, questions, multiple-choice options, correct keys, and explanations).
- **Branding Assets**:
  - `biquiz.svg`: Main brand header logo with typography.
  - `biquize-logo-only.svg`: Favicon icon for browser tab.
- **Deployment**: Docker support via `Dockerfile`.

---

## 📂 File Structure

```text
Quiz/
├── index.html              # Main Single-Page Application (SPA) structure
├── style.css               # Design system, CSS variables & responsive layout
├── app.js                  # State management, quiz engine logic & DOM updates
├── daftarsoal.json         # Bank of BI UAS questions & answers
├── biquiz.svg              # Brand header logo
├── biquize-logo-only.svg   # Favicon logo icon
├── Dockerfile              # Container configuration
├── CONTEXT.md              # Project context & documentation
└── README.md               # Quick start guide
```

---

## 💻 Running Locally

Since `app.js` fetches `daftarsoal.json` asynchronously, run the project using a local HTTP server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js npx
npx serve .
```
Then open `http://localhost:8000` in your web browser.
