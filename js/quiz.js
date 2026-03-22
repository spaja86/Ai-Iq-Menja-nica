/* ===================================================
   Ai Iq Menjačnica — quiz.js
   Educational crypto quiz
   =================================================== */

(function () {
  'use strict';

  var questions = [
    {
      question: 'Kada je Bitcoin kreiran?',
      options: ['2007', '2009', '2011', '2013'],
      correct: 1,
      explanation: 'Bitcoin je kreirao Satoshi Nakamoto 2009. godine. Whitepaper je objavljen oktobra 2008.'
    },
    {
      question: 'Ko je kreator Bitcoina?',
      options: ['Vitalik Buterin', 'Satoshi Nakamoto', 'Elon Musk', 'Hal Finney'],
      correct: 1,
      explanation: 'Satoshi Nakamoto je pseudonim kreatora Bitcoina. Njegovo pravo identitet ostaje nepoznat.'
    },
    {
      question: 'Koja je maksimalna ukupna količina Bitcoina?',
      options: ['10 miliona', '21 milion', '100 miliona', 'Neograničeno'],
      correct: 1,
      explanation: 'Bitcoin ima fiksnu ponudu od tačno 21 milion BTC. Ovo ga čini deficionarnom imovinom.'
    },
    {
      question: 'Šta je "blockchain"?',
      options: [
        'Centralizovana baza podataka',
        'Softver za mining',
        'Distribuirana, nepromenjiva knjiga transakcija',
        'Vrsta kriptografskog novčanika'
      ],
      correct: 2,
      explanation: 'Blockchain je distribuirana knjiga (ledger) u kojoj su transakcije grupisane u blokove koji su kriptografski povezani.'
    },
    {
      question: 'Ko je kreirao Ethereum?',
      options: ['Satoshi Nakamoto', 'Charlie Lee', 'Vitalik Buterin', 'Roger Ver'],
      correct: 2,
      explanation: 'Vitalik Buterin je predložio Ethereum 2013. godine, a mreža je pokrenuta jula 2015.'
    },
    {
      question: 'Šta je DeFi?',
      options: [
        'Digital Finance Instrument',
        'Decentralized Finance — finansijske usluge bez posrednika',
        'Defense Finance International',
        'Direktna finansijska integracija'
      ],
      correct: 1,
      explanation: 'DeFi (Decentralized Finance) su finansijske usluge na blockchain-u koje funkcionišu bez banaka ili posrednika.'
    },
    {
      question: 'Šta je "halvening" (halving) kod Bitcoina?',
      options: [
        'Podela Bitcoin mreže na dva dela',
        'Prepolovljavanje nagrade za mining svakih ~4 godine',
        'Smanjenje transakcione naknade',
        'Ažuriranje Bitcoin protokola'
      ],
      correct: 1,
      explanation: 'Svakih ~210,000 blokova (otprilike 4 godine), nagrada za mining se prepolovljuje. Ovo usporava inflaciju BTC-a.'
    },
    {
      question: 'Šta je "private key" (privatni ključ) u kriptovalutama?',
      options: [
        'Lozinka za exchange platformu',
        'Tajni broj koji dokazuje vlasništvo nad kriptovalutom',
        'Adresa crypto novčanika',
        'Kod za dvofaktornu autentifikaciju'
      ],
      correct: 1,
      explanation: 'Privatni ključ je tajni kriptografski broj koji vam omogućava pristup i kontrolu nad vašim kriptovalutama. Nikad ga ne delite!'
    }
  ];

  var currentQ    = 0;
  var score       = 0;
  var answered    = false;

  /* ---------- DOM refs ---------- */
  var container = document.getElementById('quizContainer');

  function renderQuestion() {
    if (!container) return;
    if (currentQ >= questions.length) { renderResult(); return; }

    var q   = questions[currentQ];
    var pct = ((currentQ) / questions.length * 100).toFixed(0);

    var html =
      '<div class="quiz-progress">' +
        '<div class="progress-bar-track"><div class="progress-bar-fill" id="quizBar" style="width:' + pct + '%"></div></div>' +
        '<span class="muted" style="font-size:0.8rem;white-space:nowrap">' + (currentQ + 1) + ' / ' + questions.length + '</span>' +
      '</div>' +
      '<p class="quiz-question">' + q.question + '</p>' +
      '<div class="quiz-options" id="quizOptions">';

    q.options.forEach(function (opt, i) {
      html += '<button class="quiz-option" data-index="' + i + '">' + opt + '</button>';
    });

    html += '</div>' +
      '<div class="quiz-feedback" id="quizFeedback"></div>' +
      '<div class="quiz-nav">' +
        '<button class="btn-primary" id="quizNext" style="display:none">Sledeće pitanje →</button>' +
      '</div>';

    container.innerHTML = html;
    answered = false;

    // Bind option clicks
    document.querySelectorAll('.quiz-option').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (answered) return;
        answered = true;
        var chosen = parseInt(btn.dataset.index);
        var correct = q.correct;

        document.querySelectorAll('.quiz-option').forEach(function (b) {
          b.disabled = true;
          if (parseInt(b.dataset.index) === correct) b.classList.add('correct');
        });

        var fb = document.getElementById('quizFeedback');
        if (chosen === correct) {
          score++;
          btn.classList.add('correct');
          fb.textContent = '✅ Tačno! ' + q.explanation;
          fb.className = 'quiz-feedback correct';
        } else {
          btn.classList.add('wrong');
          fb.textContent = '❌ Netačno. ' + q.explanation;
          fb.className = 'quiz-feedback wrong';
        }

        var nextBtn = document.getElementById('quizNext');
        if (nextBtn) nextBtn.style.display = '';
      });
    });

    var nextBtn = document.getElementById('quizNext');
    if (nextBtn) {
      nextBtn.textContent = currentQ + 1 < questions.length ? 'Sledeće pitanje →' : 'Vidi rezultat';
      nextBtn.addEventListener('click', function () {
        currentQ++;
        renderQuestion();
      });
    }
  }

  function renderResult() {
    if (!container) return;
    var pct = Math.round(score / questions.length * 100);
    var msg = pct >= 80 ? '🏆 Odlično! Ti si kripto ekspert!' :
              pct >= 60 ? '👍 Dobro! Nastavi da učiš.' :
              '📚 Ima prostora za napredak. Pročitaj naše edukativne materijale!';

    container.innerHTML =
      '<div class="quiz-result">' +
        '<div class="quiz-score">' + score + ' / ' + questions.length + '</div>' +
        '<p style="font-size:1.1rem;font-weight:600;color:#fff;margin-bottom:8px">' + pct + '% tačnih odgovora</p>' +
        '<p>' + msg + '</p>' +
        '<button class="btn-primary" id="quizRestart" style="margin-top:20px;padding:12px 32px">🔄 Ponovi kviz</button>' +
      '</div>';

    document.getElementById('quizRestart').addEventListener('click', function () {
      currentQ = 0;
      score    = 0;
      renderQuestion();
    });
  }

  /* ---------- BOOT ---------- */
  function init() {
    if (!container) return;
    renderQuestion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
