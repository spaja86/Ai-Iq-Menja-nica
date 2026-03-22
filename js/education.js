/* =========================================================
   Ai IQ Menjačnica — Education Page (education.js)
   ========================================================= */
(function () {
  'use strict';

  /* -------------------------------------------------------
     Quiz Data
  ------------------------------------------------------- */
  const quizData = [
    {
      q: 'Šta je Bitcoin?',
      options: ['Digitalna valuta zasnovana na blockchain tehnologiji','Vrsta bankovne kartice','Platforma za e-mail','Program za antivirus'],
      correct: 0,
      explanation: 'Bitcoin je prva i najpoznatija kriptovaluta, kreirana 2009. od strane anonimnog programera pod imenom Satoshi Nakamoto.'
    },
    {
      q: 'Šta znači termin "HODL"?',
      options: ['Hold On for Dear Life — strategija držanja kriptovalute','Vrsta kripto protokola','Naziv crypto berze','Brzina transakcije'],
      correct: 0,
      explanation: 'HODL nastao je od greške u kucanju reči "HOLD" i danas znači dugoročno zadržavanje kriptovaluta bez prodaje.'
    },
    {
      q: 'Koliko ukupno Bitcoin-a može biti kreiran?',
      options: ['21 milion','100 milion','50 milion','Neograničeno'],
      correct: 0,
      explanation: 'Bitcoin ima fiksan maksimalni supply od 21 miliona BTC, što ga čini deflacionarnom valutom.'
    },
    {
      q: 'Šta je blockchain?',
      options: ['Distribuirana baza podataka u obliku lanca blokova','Centralizovana berza','Vrsta kriptovalute','Digitalni novčanik'],
      correct: 0,
      explanation: 'Blockchain je tehnologija distribuiranog registra koja bilježi transakcije u nepromjenjivim blokovima.'
    },
    {
      q: 'Šta je DeFi?',
      options: ['Decentralizovane finansije — finansijske usluge na blockchainu','Digitalna fiat valuta','Depozitna fiksna investicija','Devizni fond indeksa'],
      correct: 0,
      explanation: 'DeFi (Decentralized Finance) su finansijske aplikacije izgrađene na blockchainima koje eliminišu posrednike.'
    },
    {
      q: 'Šta je NFT?',
      options: ['Non-Fungible Token — jedinstveni digitalni token','New Financial Transaction','Network Fee Token','Null Fund Transfer'],
      correct: 0,
      explanation: 'NFT je jedinstveni digitalni sertifikat vlasništva koji se ne može zameniti, čuvan na blockchainu.'
    },
    {
      q: 'Šta je Ethereum gas fee?',
      options: ['Naknada za računarsku snagu potrebnu za transakcije','Gorivo za rudarenje Bitcoin-a','Provizija berze','Porez na kriptovalute'],
      correct: 0,
      explanation: 'Gas fee je naknada plaćena rudarima/validatorima za obradu transakcija na Ethereum mreži.'
    },
    {
      q: 'Šta je staking?',
      options: ['Zaključavanje kriptovaluta radi validacije mreže i dobijanja nagrada','Brza kupovina i prodaja','Vrsta kriptovalute','Tip pametnog ugovora'],
      correct: 0,
      explanation: 'Staking podrazumijeva zaključavanje kriptovaluta u wallet kako bi se podržala blockchain mreža i za uzvrat dobijale nagrade.'
    }
  ];

  /* -------------------------------------------------------
     Quiz State
  ------------------------------------------------------- */
  const quizState = {
    current: 0,
    score: 0,
    answered: false,
    finished: false,
  };

  /* -------------------------------------------------------
     Render Quiz Question
  ------------------------------------------------------- */
  function renderQuestion() {
    const container = document.getElementById('quiz-container');
    if (!container) return;

    if (quizState.finished) {
      renderScore(container);
      return;
    }

    const q = quizData[quizState.current];
    container.innerHTML = '';

    // Progress
    const progress = document.createElement('div');
    progress.style.cssText = 'margin-bottom:20px';
    const progLabel = document.createElement('div');
    progLabel.style.cssText = 'display:flex;justify-content:space-between;margin-bottom:8px;font-size:0.85rem;color:var(--color-muted)';
    const leftLabel = document.createElement('span');
    leftLabel.textContent = `Pitanje ${quizState.current + 1} od ${quizData.length}`;
    const scoreLabel = document.createElement('span');
    scoreLabel.textContent = `Poeni: ${quizState.score}`;
    progLabel.appendChild(leftLabel);
    progLabel.appendChild(scoreLabel);
    const progBar = document.createElement('div');
    progBar.style.cssText = 'height:4px;background:var(--border);border-radius:2px;overflow:hidden';
    const progFill = document.createElement('div');
    progFill.style.cssText = `height:100%;background:var(--color-green);border-radius:2px;width:${((quizState.current) / quizData.length * 100)}%;transition:width 0.4s ease`;
    progBar.appendChild(progFill);
    progress.appendChild(progLabel);
    progress.appendChild(progBar);
    container.appendChild(progress);

    // Question text
    const qEl = document.createElement('h3');
    qEl.style.cssText = 'color:#fff;margin-bottom:24px;font-size:1.1rem;line-height:1.5';
    qEl.textContent = q.q;
    container.appendChild(qEl);

    // Options
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.style.cssText = 'width:100%;text-align:left;padding:14px 18px;margin-bottom:10px;background:var(--bg-secondary);border:1.5px solid var(--border);border-radius:10px;color:var(--color-text);font-size:0.95rem;cursor:pointer;transition:all 0.2s ease;display:block';
      btn.textContent = (i === 0 ? 'A' : i === 1 ? 'B' : i === 2 ? 'C' : 'D') + ') ' + opt;

      btn.addEventListener('mouseenter', () => {
        if (!quizState.answered) btn.style.borderColor = 'var(--color-green)';
      });
      btn.addEventListener('mouseleave', () => {
        if (!quizState.answered) btn.style.borderColor = 'var(--border)';
      });

      btn.addEventListener('click', () => {
        if (quizState.answered) return;
        quizState.answered = true;
        const correct = i === q.correct;
        if (correct) quizState.score++;

        // Color options
        const allBtns = container.querySelectorAll('button[data-option]');
        allBtns.forEach((b, j) => {
          if (j === q.correct) {
            b.style.borderColor = 'var(--color-green)';
            b.style.background  = 'rgba(0,255,136,0.1)';
            b.style.color       = 'var(--color-green)';
          } else if (j === i && !correct) {
            b.style.borderColor = 'var(--color-red)';
            b.style.background  = 'rgba(255,71,87,0.1)';
            b.style.color       = 'var(--color-red)';
          }
        });

        // Show explanation
        const exp = document.createElement('div');
        exp.style.cssText = 'margin-top:16px;padding:14px 18px;background:var(--bg-card);border:1px solid var(--border);border-radius:10px;font-size:0.88rem;color:var(--color-muted)';
        const expTitle = document.createElement('strong');
        expTitle.style.color = '#fff';
        expTitle.textContent = correct ? '✅ Tačno! ' : '❌ Netačno. ';
        exp.appendChild(expTitle);
        exp.appendChild(document.createTextNode(q.explanation));
        container.appendChild(exp);

        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn btn-primary';
        nextBtn.style.marginTop = '20px';
        nextBtn.style.width = '100%';
        nextBtn.textContent = quizState.current + 1 < quizData.length ? 'Sledeće pitanje →' : 'Pogledaj rezultat';
        nextBtn.addEventListener('click', () => {
          quizState.current++;
          quizState.answered = false;
          if (quizState.current >= quizData.length) quizState.finished = true;
          renderQuestion();
        });
        container.appendChild(nextBtn);
      });

      btn.dataset.option = i;
      container.appendChild(btn);
    });
  }

  function renderScore(container) {
    container.innerHTML = '';
    const pct = Math.round((quizState.score / quizData.length) * 100);
    let grade, color;
    if (pct >= 80) { grade = '🏆 Odlično!'; color = 'var(--color-green)'; }
    else if (pct >= 60) { grade = '👍 Dobro!'; color = 'var(--color-gold)'; }
    else { grade = '📚 Vežbaj više!'; color = 'var(--color-red)'; }

    const div = document.createElement('div');
    div.style.cssText = 'text-align:center;padding:30px 0';
    div.innerHTML = `
      <div style="font-size:4rem;margin-bottom:16px">${pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📚'}</div>
      <h2 style="color:#fff;margin-bottom:8px">${grade}</h2>
      <div style="font-size:3rem;font-weight:800;color:${color};margin:16px 0">${quizState.score}/${quizData.length}</div>
      <p style="color:var(--color-muted);margin-bottom:24px">Osvojio si ${pct}% poena u kripto kvizu!</p>
    `;
    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn btn-primary';
    resetBtn.textContent = '🔄 Ponovi kviz';
    resetBtn.addEventListener('click', () => {
      quizState.current = 0;
      quizState.score = 0;
      quizState.answered = false;
      quizState.finished = false;
      renderQuestion();
    });
    div.appendChild(resetBtn);
    container.appendChild(div);
  }

  /* -------------------------------------------------------
     Glossary Search
  ------------------------------------------------------- */
  function initGlossary() {
    const search = document.getElementById('glossary-search');
    if (!search) return;

    search.addEventListener('input', () => {
      const q = search.value.toLowerCase().trim();
      document.querySelectorAll('.glossary-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  /* -------------------------------------------------------
     Article accordions
  ------------------------------------------------------- */
  function initAccordions() {
    document.querySelectorAll('.accordion-header').forEach(header => {
      header.addEventListener('click', () => {
        const body = header.nextElementSibling;
        const icon = header.querySelector('.acc-icon');
        const open = body.style.display === 'block';
        body.style.display = open ? 'none' : 'block';
        if (icon) icon.textContent = open ? '▼' : '▲';
      });
    });
  }

  /* -------------------------------------------------------
     Init
  ------------------------------------------------------- */
  function init() {
    renderQuestion();
    initGlossary();
    initAccordions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
