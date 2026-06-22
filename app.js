// ==========================================================================
// STATE MANAGEMENT & CONSTANTS
// ==========================================================================
let quizData = [];         // Raw data from JSON
let activeQuestions = [];  // Questions filtered and prepared for current quiz session
let currentIndex = 0;      // Current question index
let selectedOptionKey = null; // Key of the currently selected option (e.g., 'A', 'B')
let userChoices = [];      // Array to store user's selected keys
let timerInterval = null;  // Interval ID for the stopwatch
let secondsElapsed = 0;    // Duration of active quiz session
let quizMode = 'all';      // 'all' (mix all) or 'student' (filter by student)

// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');

// Configuration Elements
const modeButtons = document.querySelectorAll('.mode-btn');
const configAllMode = document.getElementById('config-all-mode');
const configStudentMode = document.getElementById('config-student-mode');
const questionCountSelect = document.getElementById('question-count');
const studentSelect = document.getElementById('student-select');
const startBtn = document.getElementById('start-btn');

// Quiz Screen Elements
const timerDisplay = document.getElementById('timer-display');
const progressText = document.getElementById('progress-text');
const progressPercentage = document.getElementById('progress-percentage');
const progressBarFill = document.getElementById('progress-bar-fill');
const questionAuthor = document.getElementById('question-author');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');
const quitBtn = document.getElementById('quit-btn');

// Result Screen Elements
const scoreCircle = document.getElementById('score-circle');
const scoreText = document.getElementById('score-text');
const feedbackTitle = document.getElementById('feedback-title');
const feedbackDesc = document.getElementById('feedback-desc');
const statCorrect = document.getElementById('stat-correct');
const statIncorrect = document.getElementById('stat-incorrect');
const statTime = document.getElementById('stat-time');
const restartBtn = document.getElementById('restart-btn');
const wrongAnswersList = document.getElementById('wrong-answers-list');
const wrongAnswersCountDesc = document.getElementById('wrong-answers-count-desc');

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    loadQuizData();
    setupEventListeners();
});

// Load quiz data from JSON
async function loadQuizData() {
    try {
        const response = await fetch('daftarsoal.json');
        if (!response.ok) {
            throw new Error(`Gagal memuat file JSON (Status: ${response.status})`);
        }
        quizData = await response.json();
        populateStudentSelect();
        startBtn.disabled = false;
    } catch (error) {
        console.error('Error fetching quiz data:', error);
        alert('Gagal mengambil data kuis. Pastikan server web aktif (tidak membuka langsung file index.html dari file:// protocol) dan silakan muat ulang halaman.\n\nDetail error: ' + error.message);
        
        // Show fallback text on student selector
        studentSelect.innerHTML = '<option value="" disabled>Error memuat data</option>';
        startBtn.disabled = true;
    }
}

// Populate student selection dropdown
function populateStudentSelect() {
    studentSelect.innerHTML = '<option value="" disabled selected>Pilih nama mahasiswa...</option>';
    
    // Sort students alphabetically
    const sortedData = [...quizData].sort((a, b) => a.nama_mahasiswa.localeCompare(b.nama_mahasiswa));
    
    sortedData.forEach(student => {
        const option = document.createElement('option');
        option.value = student.nama_mahasiswa;
        option.textContent = `${student.nama_mahasiswa} (${student.soal_list.length} Soal)`;
        studentSelect.appendChild(option);
    });
}

// ==========================================================================
// EVENT LISTENERS
// ==========================================================================
function setupEventListeners() {
    // Mode Buttons
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            quizMode = btn.dataset.mode;
            if (quizMode === 'all') {
                configAllMode.classList.add('active');
                configStudentMode.classList.remove('active');
            } else {
                configAllMode.classList.remove('active');
                configStudentMode.classList.add('active');
            }
        });
    });

    // Start Quiz Button
    startBtn.addEventListener('click', startQuiz);

    // Options Navigation & Quit
    nextBtn.addEventListener('click', nextQuestion);
    quitBtn.addEventListener('click', confirmQuit);

    // Restart Quiz Button
    restartBtn.addEventListener('click', () => {
        switchScreen(resultScreen, welcomeScreen);
    });
}

// Helper to switch screens with fading effect
function switchScreen(fromScreen, toScreen) {
    fromScreen.classList.remove('active');
    setTimeout(() => {
        fromScreen.style.display = 'none';
        toScreen.style.display = 'block';
        setTimeout(() => {
            toScreen.classList.add('active');
        }, 50);
    }, 300);
}

// Confirm Quit Handler
function confirmQuit() {
    if (confirm('Apakah Anda yakin ingin keluar dari kuis? Seluruh kemajuan Anda saat ini akan hilang.')) {
        stopTimer();
        switchScreen(quizScreen, welcomeScreen);
    }
}



// ==========================================================================
// QUIZ ENGINE
// ==========================================================================
function startQuiz() {
    activeQuestions = [];
    userChoices = [];
    currentIndex = 0;
    secondsElapsed = 0;
    selectedOptionKey = null;

    if (quizMode === 'all') {
        // Flatten all questions with student info
        quizData.forEach(student => {
            student.soal_list.forEach(soal => {
                activeQuestions.push({
                    ...soal,
                    mahasiswa_pembuat: student.nama_mahasiswa
                });
            });
        });


        // Limit question count
        const countLimit = questionCountSelect.value;
        if (countLimit !== 'all') {
            const limit = parseInt(countLimit, 10);
            activeQuestions = activeQuestions.slice(0, limit);
        }

    } else if (quizMode === 'student') {
        const selectedStudent = studentSelect.value;
        if (!selectedStudent) {
            alert('Silakan pilih salah satu mahasiswa terlebih dahulu!');
            return;
        }

        const studentObj = quizData.find(s => s.nama_mahasiswa === selectedStudent);
        if (studentObj) {
            studentObj.soal_list.forEach(soal => {
                activeQuestions.push({
                    ...soal,
                    mahasiswa_pembuat: studentObj.nama_mahasiswa
                });
            });
        }

    }

    if (activeQuestions.length === 0) {
        alert('Tidak ada soal yang tersedia untuk kuis ini.');
        return;
    }

    // Switch screen to Quiz view
    switchScreen(welcomeScreen, quizScreen);
    
    // Start stopwatch timer
    startTimer();
    
    // Render first question
    renderQuestion();
}

// Timer Implementation
function startTimer() {
    timerDisplay.textContent = '00:00';
    timerInterval = setInterval(() => {
        secondsElapsed++;
        const minutes = Math.floor(secondsElapsed / 60);
        const seconds = secondsElapsed % 60;
        const formattedMin = String(minutes).padStart(2, '0');
        const formattedSec = String(seconds).padStart(2, '0');
        timerDisplay.textContent = `${formattedMin}:${formattedSec}`;
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Render Active Question
function renderQuestion() {
    nextBtn.disabled = true;
    selectedOptionKey = null;
    
    const question = activeQuestions[currentIndex];

    // Update Progress
    const totalQuestions = activeQuestions.length;
    const progressNum = currentIndex + 1;
    const percentage = Math.round((progressNum / totalQuestions) * 100);
    
    progressText.textContent = `Soal ${progressNum} dari ${totalQuestions}`;
    progressPercentage.textContent = `${percentage}%`;
    progressBarFill.style.width = `${percentage}%`;

    // Populate Question Details
    questionAuthor.textContent = `Oleh: ${question.mahasiswa_pembuat || 'Sistem'}`;
    questionText.textContent = question.pertanyaan;

    // Populate Choices
    optionsContainer.innerHTML = '';
    
    // Convert pilihan object to key-value array: [{key: 'A', text: '...'}, ...]
    const optionsList = Object.entries(question.pilihan).map(([key, text]) => {
        return { key, text };
    });


    // Render option cards
    optionsList.forEach(opt => {
        const optionCard = document.createElement('button');
        optionCard.className = 'option-card';
        optionCard.type = 'button';
        optionCard.innerHTML = `
            <span class="option-badge">${opt.key}</span>
            <span class="option-text"></span>
        `;
        
        // Use textContent for text safety
        optionCard.querySelector('.option-text').textContent = opt.text;

        optionCard.addEventListener('click', () => {
            // Remove selection class from all option cards
            document.querySelectorAll('.option-card').forEach(card => {
                card.classList.remove('selected');
            });
            // Mark current selection
            optionCard.classList.add('selected');
            selectedOptionKey = opt.key;
            nextBtn.disabled = false;
        });

        optionsContainer.appendChild(optionCard);
    });
}

// Proceed to next question or show results
function nextQuestion() {
    // Record selection
    userChoices.push(selectedOptionKey);
    
    currentIndex++;
    if (currentIndex < activeQuestions.length) {
        renderQuestion();
    } else {
        showResults();
    }
}

// ==========================================================================
// RESULTS ENGINE
// ==========================================================================
function showResults() {
    stopTimer();

    let correctCount = 0;
    const incorrectQuestions = [];

    activeQuestions.forEach((question, idx) => {
        const userChoice = userChoices[idx];
        if (userChoice === question.jawaban_benar) {
            correctCount++;
        } else {
            incorrectQuestions.push({
                questionNumber: idx + 1,
                questionText: question.pertanyaan,
                creator: question.mahasiswa_pembuat,
                userChoice: userChoice,
                userChoiceText: question.pilihan[userChoice] || 'Tidak dijawab',
                correctChoice: question.jawaban_benar,
                correctChoiceText: question.pilihan[question.jawaban_benar] || '-',
                explanation: question.penjelasan
            });
        }
    });

    const totalQuestions = activeQuestions.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    // Update Result Score Circle
    scoreText.textContent = `${scorePercentage}%`;
    
    // Circumference of path is exactly 100
    scoreCircle.style.strokeDasharray = `${scorePercentage}, 100`;
    
    // Set circle color based on score grade
    scoreCircle.classList.remove('low', 'medium', 'high');
    if (scorePercentage < 50) {
        scoreCircle.classList.add('low');
        feedbackTitle.textContent = 'Coba Lagi!';
        feedbackDesc.textContent = 'Tetap semangat, perbaiki pemahaman Anda dengan mempelajari penjelasan di bawah.';
    } else if (scorePercentage < 80) {
        scoreCircle.classList.add('medium');
        feedbackTitle.textContent = 'Kerja Bagus!';
        feedbackDesc.textContent = 'Anda memiliki pemahaman dasar yang baik. Tinjau kesalahan Anda untuk skor maksimal.';
    } else {
        scoreCircle.classList.add('high');
        feedbackTitle.textContent = 'Luar Biasa!';
        feedbackDesc.textContent = 'Selamat! Anda menguasai materi Business Intelligence dengan sangat baik.';
    }

    // Set stats summaries
    statCorrect.textContent = correctCount;
    statIncorrect.textContent = totalQuestions - correctCount;

    // Time elapsed display
    const minutes = Math.floor(secondsElapsed / 60);
    const seconds = secondsElapsed % 60;
    statTime.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Populate Wrong Answers Review
    wrongAnswersList.innerHTML = '';
    
    if (incorrectQuestions.length === 0) {
        wrongAnswersCountDesc.textContent = 'Semua jawaban Anda benar! Pertahankan terus prestasi ini.';
        
        // Show Celebratory Empty State
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-icon">🏆</div>
            <h3>Sempurna!</h3>
            <p>Tidak ada jawaban yang salah untuk ditinjau. Anda menjawab semua ${totalQuestions} pertanyaan dengan benar!</p>
        `;
        wrongAnswersList.appendChild(emptyState);
    } else {
        wrongAnswersCountDesc.textContent = `Menampilkan ${incorrectQuestions.length} pertanyaan yang Anda jawab salah`;

        incorrectQuestions.forEach(item => {
            const card = document.createElement('div');
            card.className = 'wrong-card';
            
            // Generate review card markup
            card.innerHTML = `
                <div class="wrong-card-header">
                    <span class="wrong-num-badge">Soal ${item.questionNumber}</span>
                    <span class="author-badge">Oleh: ${item.creator || '-'}</span>
                </div>
                <div class="question-title"></div>
                <div class="answers-compare">
                    <div class="answer-panel user-answer">
                        <span class="label">Pilihan Anda</span>
                        <strong class="choice-tag">Pilihan ${item.userChoice}</strong>
                        <span class="choice-text"></span>
                    </div>
                    <div class="answer-panel correct-answer">
                        <span class="label">Jawaban Benar</span>
                        <strong class="choice-tag">Pilihan ${item.correctChoice}</strong>
                        <span class="choice-text"></span>
                    </div>
                </div>
                <div class="explanation-block">
                    <strong>Penjelasan:</strong>
                    <div class="explanation-text"></div>
                </div>
            `;

            // Prevent XSS using textContent for text injections
            card.querySelector('.question-title').textContent = item.questionText;
            card.querySelector('.user-answer .choice-text').textContent = item.userChoiceText;
            card.querySelector('.correct-answer .choice-text').textContent = item.correctChoiceText;
            card.querySelector('.explanation-text').textContent = item.explanation;

            wrongAnswersList.appendChild(card);
        });
    }

    // Switch screen to Result view
    switchScreen(quizScreen, resultScreen);
}
