/* ════════════════════════════════════════════════════════════════════
 *  AI SCAMS PROTOTYPE — SCRIPT
 *  ────────────────────────────────────────────────────────────────────
 *  Interactive chip selection + multi-screen narrative navigation.
 *
 *  Table of Contents
 *  ────────────────────────────────────────────────────────────────────
 *    SETUP        — viewport scaling, $/$$ helpers, state, common helpers
 *    SCREEN 1     — chip entrance, single/multi selection, Continue → S2
 *    NAV CORE     — scroll/transition state + wheel router
 *    SCREEN 2→33  — PWNED → Data Harvesting
 *    SCREEN 3→34  — horizontal scroll to profile card
 *    SCREEN 4→35  — victim card flies into Synthesis mind-map
 *    SHARED       — stripAnimate, scammer persona generator
 *    SCREEN 5→36  — Synthesis detail w/ scammer card
 *    SCREEN 6→37  — Contact established
 *    SCREEN 7→38  — Emotional triggers + 30s timer
 *    SCREEN 8→39  — Auto-advance to "phone call lasts 30s"
 *    REVERSE NAV  — paired reverse transitions for back-scrolling
 *    PERSONA GEN  — victim names, cities, IDs, bios for Screen 4
 *
 *  Naming convention
 *    transitionToScreenN()  forward navigation handler
 *    reverseToScreenN()     back navigation handler
 *    populate*()            DOM data injection (called before show)
 * ════════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  /* ════ SETUP — viewport, helpers, state ════ */

  // ── Viewport scaling ──
  function scaleViewport() {
    const vp = document.querySelector('.viewport');
    if (!vp) return;
    const scaleX = window.innerWidth / 1920;
    const scaleY = window.innerHeight / 1080;
    const scale = Math.min(scaleX, scaleY);
    vp.style.transform = `scale(${scale})`;
    // Center the viewport
    const scaledW = 1920 * scale;
    const scaledH = 1080 * scale;
    vp.style.left = ((window.innerWidth - scaledW) / 2) + 'px';
    vp.style.top = ((window.innerHeight - scaledH) / 2) + 'px';
    vp.style.marginLeft = '0';
    vp.style.marginTop = '0';
  }
  scaleViewport();
  window.addEventListener('resize', scaleViewport);

  const state = { age: null, sex: null, occupation: null, have: new Set() };
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);
  const continueBtn = $('#continue-btn');
  const clipboard = $('.clipboard');

  // ── Helpers ──
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const randDigits = n => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');

  function pulse(chip) {
    chip.classList.add('just-selected');
    requestAnimationFrame(() => chip.classList.add('pulse-out'));
    setTimeout(() => chip.classList.remove('just-selected', 'pulse-out'), 450);
  }

  function fadeOut(els, dir = 'X', dist = -40) {
    els.forEach(el => {
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      el.style.opacity = '0';
      el.style.transform = `translate${dir}(${dist}px)`;
    });
  }

  /* ════ SCREEN 1 — chip selection + Continue ════ */

  // ── Stagger chip entrance ──
  const allChips = $$('.chip');
  allChips.forEach((chip, i) => {
    chip.classList.add('entering');
    chip.style.animationDelay = `${0.3 + i * 0.03}s`;
    chip.addEventListener('animationend', function onEnter(e) {
      if (e.animationName === 'chipEnter') {
        chip.classList.remove('entering');
        chip.style.animationDelay = '';
        chip.removeEventListener('animationend', onEnter);
      }
    });
  });

  // ── Single-select groups (Age, Sex, Occupation) ──
  $$('.bio-group').forEach(group => {
    const key = group.dataset.group;
    const chips = group.querySelectorAll('.chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.dataset.value;
        if (state[key] === val) {
          state[key] = null;
          chip.classList.remove('selected');
        } else {
          chips.forEach(c => c.classList.remove('selected'));
          state[key] = val;
          chip.classList.add('selected');
          pulse(chip);
        }
        updateUI();
      });
    });
  });

  // ── Multi-select group (Do you have?) ──
  $$('[data-group="have"] .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const val = chip.dataset.value;
      if (state.have.has(val)) {
        state.have.delete(val);
        chip.classList.remove('selected');
      } else {
        state.have.add(val);
        chip.classList.add('selected');
        pulse(chip);
      }
      updateUI();
    });
  });

  // ── UI updates ──
  function updateUI() {
    continueBtn.disabled = !(state.age && state.sex && state.occupation && state.have.size);
    const total = (state.age ? 1 : 0) + (state.sex ? 1 : 0) + (state.occupation ? 1 : 0) + state.have.size;
    clipboard.style.transform = `rotate(-15deg) scale(${1 + Math.min(total * 0.008, 0.08)})`;
  }

  // ── Continue → Screen 2 ──
  continueBtn.addEventListener('click', () => {
    if (continueBtn.disabled) return;

    fadeOut($$('#screen-1 .section, #screen-1 .continue-wrapper'));
    fadeOut([$('.clipboard-wrapper')], 'X', 80);

    setTimeout(() => {
      const screen1 = $('#screen-1');
      const screen2 = $('#screen-2');
      screen1.classList.add('screen-hidden');
      screen2.classList.remove('screen-hidden');
      screen2.classList.add('screen-visible', 'shake');

      setTimeout(() => $('.center-devil').classList.add('animate'), 100);
      setTimeout(() => $('.pwned-text').classList.add('animate'), 400);
      setTimeout(() => $$('.emoji').forEach(e => e.classList.add('animate')), 600);
      setTimeout(() => $('.pwned-link').classList.add('animate'), 900);
      setTimeout(() => {
        $('#s2-scroll-hint').classList.add('animate');
        currentScreen = 2;
        s2Ready = true;
      }, 1500);
    }, 600);
  });

  /* ════ NAV CORE — transition state + wheel router ════ */

  // ── Navigation state ──
  let currentScreen = 1, s2Ready = false, s3Ready = false, s4Ready = false, s5Ready = false, s6Ready = false, s7Ready = false, s8Ready = false, s9Ready = false, s10Ready = false, s11Ready = false, s12Ready = false, s13Ready = false, s14Ready = false, transitioning = false;
  let chosenTactic = 'authority'; // stored when populating scammer card

  document.addEventListener('wheel', (e) => {
    if (transitioning) return;
    const forward = e.deltaY > 0;
    const backward = e.deltaY < 0;

    if (forward) {
      if (currentScreen === 2 && s2Ready) { transitioning = true; transitionToScreen3(); }
      else if (currentScreen === 3 && s3Ready) { transitioning = true; scrollToScreen4(); }
      else if (currentScreen === 4 && s4Ready) { transitioning = true; transitionToScreen5(); }
      else if (currentScreen === 5 && s5Ready) { transitioning = true; transitionToScreen6(); }
      else if (currentScreen === 6 && s6Ready) { transitioning = true; transitionToScreen7(); }
      else if (currentScreen === 7 && s7Ready) { transitioning = true; transitionToScreen8(); }
      else if (currentScreen === 8 && s8Ready && s8ReturnedFromS9) { transitioning = true; transitionToScreen9(); }
      else if (currentScreen === 9 && s9Ready) { transitioning = true; transitionToScreen10(); }
      else if (currentScreen === 10 && s10Ready) { transitioning = true; transitionToScreen11(); }
      else if (currentScreen === 11 && s11Ready) { transitioning = true; transitionToScreen12(); }
      else if (currentScreen === 12 && s12Ready) { transitioning = true; transitionToScreen13(); }
      else if (currentScreen === 13 && s13Ready) { transitioning = true; transitionToScreen14(); }
    } else if (backward) {
      if (currentScreen === 14 && s14Ready) { transitioning = true; reverseToScreen13(); }
      else if (currentScreen === 13 && s13Ready) { transitioning = true; reverseToScreen12(); }
      else if (currentScreen === 12 && s12Ready) { transitioning = true; reverseToScreen11(); }
      else if (currentScreen === 11 && s11Ready) { transitioning = true; reverseToScreen10(); }
      else if (currentScreen === 10 && s10Ready) { transitioning = true; reverseToScreen9(); }
      else if (currentScreen === 9 && s9Ready) { transitioning = true; reverseToScreen8(); }
      else if (currentScreen === 8 && s8Ready) { transitioning = true; reverseToScreen7(); }
      else if (currentScreen === 7 && s7Ready) { transitioning = true; reverseToScreen6(); }
      else if (currentScreen === 6 && s6Ready) { transitioning = true; reverseToScreen5(); }
      else if (currentScreen === 5 && s5Ready) { transitioning = true; reverseToScreen4(); }
      else if (currentScreen === 4 && s4Ready) { transitioning = true; reverseToScreen3(); }
      else if (currentScreen === 3 && s3Ready) { transitioning = true; reverseToScreen2(); }
    }
  });

  /* ════ SCREEN 2 → SCREEN 3 (PWNED → Data Harvesting) ════ */

  // ── Screen 2 → 3 ──
  function transitionToScreen3() {
    const screen2 = $('#screen-2');
    fadeOut(screen2.querySelectorAll('.center-devil, .pwned-text, .pwned-link, .emoji, .scroll-hint'));
    $$('#screen-2 .center-devil, #screen-2 .pwned-text, #screen-2 .pwned-link, #screen-2 .emoji, #screen-2 .scroll-hint')
      .forEach(el => { el.style.transform = 'scale(0.9)'; });

    setTimeout(() => {
      screen2.classList.add('screen-hidden');
      screen2.classList.remove('screen-visible');

      const container = $('#scroll-container-3-4');
      container.classList.remove('screen-hidden');
      container.classList.add('screen-visible');
      $('#screen-3').classList.remove('screen-hidden');
      $('#screen-4').classList.remove('screen-hidden');

      setTimeout(() => $('.s3-pills').classList.add('animate'), 100);
      setTimeout(() => $('.s3-left').classList.add('animate'), 200);
      setTimeout(() => $('.s3-right').classList.add('animate'), 350);
      setTimeout(() => {
        $('#s3-scroll-hint').classList.add('animate');
        currentScreen = 3;
        s3Ready = true;
        transitioning = false;
      }, 1200);
    }, 600);
  }

  /* ════ SCREEN 3 → SCREEN 4 (horizontal scroll to profile card) ════ */

  // ── Screen 3 → 4 (horizontal scroll) ──
  function scrollToScreen4() {
    populatePersona();
    const hint = $('#s3-scroll-hint');
    hint.style.transition = 'opacity 0.3s ease';
    hint.style.opacity = '0';

    $('#scroll-container-3-4').classList.add('scrolled');

    setTimeout(() => {
      $('.s4-profile-card').classList.add('animate');
      $('.s4-id-card').classList.add('animate');
      $('#s4-scroll-hint').classList.add('animate');
      currentScreen = 4;
      s4Ready = true;
      transitioning = false;
    }, 1000);
  }

  /* ════ SCREEN 4 → SCREEN 5 (victim card flies into Synthesis) ════ */

  // ── Screen 4 → 5 ──
  function transitionToScreen5() {
    // Fade out scroll hint + tilted ID card only
    const s4Hint = $('#s4-scroll-hint');
    s4Hint.style.transition = 'opacity 0.3s ease';
    s4Hint.style.opacity = '0';
    fadeOut($$('#screen-4 .s4-id-card'));

    // Populate victim card data before showing
    populateVictimCard();

    // Show Screen 5 immediately on top (it's position: absolute)
    const screen5 = $('#screen-5');
    screen5.classList.remove('screen-hidden');
    screen5.classList.add('screen-visible');

    // Start victim card flying from S4 card position to bottom-left
    setTimeout(() => {
      $('.s5-victim-label').classList.add('animate');
      $('#s5-victim-card').classList.add('animate');
    }, 100);

    // After card starts moving, hide the scroll-container behind
    setTimeout(() => {
      const container = $('#scroll-container-3-4');
      container.classList.add('screen-hidden');
      container.classList.remove('screen-visible');
    }, 300);

    // Scammer slides in
    setTimeout(() => {
      $('.s5-pills').classList.add('animate');
      $('.s5-center').classList.add('animate');
    }, 600);

    // Lines appear
    setTimeout(() => {
      $('.s5-lines').classList.add('animate');
    }, 1000);

    // Tactics animate in (staggered via CSS delays)
    setTimeout(() => {
      $$('.s5-tactic').forEach(t => t.classList.add('animate'));
    }, 1100);

    // Scroll hint last
    setTimeout(() => {
      $('#s5-scroll-hint').classList.add('animate');
      currentScreen = 5;
      s5Ready = true;
      transitioning = false;
    }, 1900);
  }

  // ── Populate mini victim card on Screen 5 ──
  function populateVictimCard() {
    const sex = state.sex || 'male';
    $('#s5-victim-avatar-img').src = sex === 'female' ? 'assets/woman-red-hair.png' : 'assets/man-red-hair.png';
    $('#s5-victim-name').textContent = $('#s4-name').textContent;

    // Copy details as stacked lines
    const details = $('#s5-victim-details');
    details.innerHTML = '';
    const s4Details = $('#s4-details').querySelectorAll('span');
    s4Details.forEach(span => {
      const p = document.createElement('p');
      p.textContent = span.textContent;
      p.style.margin = '0';
      details.appendChild(p);
    });

    // Copy IDs
    const ids = $('#s5-victim-ids');
    ids.innerHTML = '';
    const s4Ids = $('#s4-ids').querySelectorAll('span');
    s4Ids.forEach(span => {
      const p = document.createElement('p');
      p.textContent = span.textContent;
      p.style.margin = '0';
      ids.appendChild(p);
    });
  }

  /* ════ SHARED — stripAnimate helper + scammer persona generator ════ */

  // ── Helper: strip animate class from all children ──
  function stripAnimate(selector) {
    $$(selector).forEach(el => {
      el.classList.remove('animate');
      el.style.transition = '';
      el.style.opacity = '';
      el.style.transform = '';
    });
  }

  // ── Scammer persona generator ──
  // Picks the best-fit tactic from S5's 4 cards based on victim info
  const SCAMMER_PERSONAS = {
    authority: {
      names: ['Inspector Shinde saheb', 'Deputy Commissioner Mehta', 'Officer Kulkarni', 'Inspector Yadav', 'Superintendent Patil'],
      details: (city) => {
        const dept = pick(['Narcotics Branch', 'Cyber Cell', 'Economic Offences Wing', 'Crime Branch']);
        const org = pick(['City Police', 'State Police', 'Central Bureau']);
        return [`43 M`, dept, org, city];
      }
    },
    distress: {
      names: ['Dr. Raghav Sharma', 'Advocate Patel', 'Cousin Ravi', 'Sister Meera', 'Aunt Sunita'],
      details: (city) => {
        const role = pick(['Emergency Ward', 'Accident Victim', 'Stranded Traveller', 'Hospital Critical Care']);
        const org = pick(['City Hospital', 'Apollo Hospital', 'Max Hospital', 'Relief Camp']);
        return [`38 M`, role, org, city];
      }
    },
    affinity: {
      names: ['Nisha Kapoor', 'Raj Malhotra', 'Aryan Investments', 'TradeGuru Ankit', 'Angel Priya'],
      details: (city) => {
        const role = pick(['Certified Financial Advisor', 'Investment Strategist', 'Relationship Counselor', 'Freelance Recruiter']);
        const org = pick(['WealthMax Corp', 'TrustFund Group', 'GoldenTree Capital', 'ConnectPro Solutions']);
        return [`32 M`, role, org, city];
      }
    },
    hijack: {
      names: ['Your Manager – Suresh', 'CEO – Rajesh Gupta', 'Friend – Amit', 'Brother – Sanjay', 'HR – Neha'],
      details: (city) => {
        const role = pick(['Urgent Request', 'Emergency Transfer', 'OTP Verification Needed', 'Account Locked Alert']);
        const org = pick(['Your Company', 'Head Office', 'Personal Contact', 'Known Network']);
        return [`45 M`, role, org, city];
      }
    }
  };

  function pickScamTactic() {
    const occ = state.occupation || 'salaried';
    const age = state.age || '25-34';
    // Parse age bucket midpoint
    let ageNum = 30;
    if (age === '<18') ageNum = 16;
    else if (age === '>65') ageNum = 68;
    else { const [lo, hi] = age.split('-').map(Number); ageNum = (lo + hi) / 2; }

    // Weight-based selection
    if (occ === 'salaried' && ageNum >= 35) return 'authority';
    if (occ === 'salaried') return pick(['authority', 'hijack']);
    if (occ === 'un-employed') return pick(['affinity', 'distress']);
    if (occ === 'self-employed') return pick(['affinity', 'authority']);
    if (occ === 'student' && ageNum < 22) return pick(['affinity', 'distress']);
    if (ageNum >= 55) return pick(['authority', 'hijack']);
    return pick(['authority', 'distress', 'affinity', 'hijack']);
  }

  function populateScammerCard() {
    const tactic = pickScamTactic();
    chosenTactic = tactic;
    const persona = SCAMMER_PERSONAS[tactic];
    const name = pick(persona.names);

    // Get victim's city from S4 for matched location
    const s4DetailEls = $('#s4-details').querySelectorAll('span');
    const victimCity = s4DetailEls.length >= 4 ? s4DetailEls[3].textContent : 'Mumbai, MH';

    const details = persona.details(victimCity);

    $('#s6-scammer-name').textContent = name;
    const detailsEl = $('#s6-scammer-details');
    detailsEl.innerHTML = '';
    details.forEach(d => {
      const p = document.createElement('p');
      p.textContent = d;
      p.style.margin = '0';
      detailsEl.appendChild(p);
    });
  }

  function populateS6VictimCard() {
    const sex = state.sex || 'male';
    $('#s6-victim-avatar-img').src = sex === 'female' ? 'assets/woman-red-hair.png' : 'assets/man-red-hair.png';
    $('#s6-victim-name').textContent = $('#s4-name').textContent;

    const details = $('#s6-victim-details');
    details.innerHTML = '';
    $('#s4-details').querySelectorAll('span').forEach(span => {
      const p = document.createElement('p');
      p.textContent = span.textContent;
      p.style.margin = '0';
      details.appendChild(p);
    });

    const ids = $('#s6-victim-ids');
    ids.innerHTML = '';
    $('#s4-ids').querySelectorAll('span').forEach(span => {
      const p = document.createElement('p');
      p.textContent = span.textContent;
      p.style.margin = '0';
      ids.appendChild(p);
    });
  }

  /* ════ SCREEN 5 → SCREEN 6 (Synthesis detail w/ scammer card) ════ */

  // ── Screen 5 → 6 ──
  function transitionToScreen6() {
    // Fade out S5 unique elements (tactics, lines, center scammer)
    const s5Hint = $('#s5-scroll-hint');
    s5Hint.style.transition = 'opacity 0.3s ease';
    s5Hint.style.opacity = '0';
    fadeOut($$('#screen-5 .s5-tactic, #screen-5 .s5-lines, #screen-5 .s5-center'), 'Y', 30);

    // Populate scammer card + victim card
    populateScammerCard();
    populateS6VictimCard();

    setTimeout(() => {
      // Hide S5, show S6
      const screen5 = $('#screen-5');
      screen5.classList.add('screen-hidden');
      screen5.classList.remove('screen-visible');

      const screen6 = $('#screen-6');
      screen6.classList.remove('screen-hidden');
      screen6.classList.add('screen-visible');

      // Shared elements appear immediately (pills, victim)
      setTimeout(() => {
        $('.s6-pills').classList.add('animate');
        $('.s6-victim-label').classList.add('animate');
        $('#s6-victim-card').classList.add('animate');
      }, 50);

      // Scammer card slides in from top
      setTimeout(() => {
        $('.s6-scammer-label').classList.add('animate');
        $('#s6-scammer-card').classList.add('animate');
      }, 200);

      // Description slides in from left
      setTimeout(() => {
        $('.s6-left').classList.add('animate');
      }, 400);

      // AI card + emojis slide in from right
      setTimeout(() => {
        $('.s6-right').classList.add('animate');
      }, 600);

      // Scroll hint last
      setTimeout(() => {
        $('#s6-scroll-hint').classList.add('animate');
        currentScreen = 6;
        s6Ready = true;
        transitioning = false;
      }, 1500);
    }, 500);
  }

  /* ════ SCREEN 6 → SCREEN 5 (reverse) ════ */

  // ── Screen 6 → 5 (reverse) ──
  function reverseToScreen5() {
    fadeOut($$('#screen-6 .s6-scammer-label, #screen-6 .s6-scammer-card, #screen-6 .s6-left, #screen-6 .s6-right, #screen-6 .s6-pills, #screen-6 .s6-victim-label, #screen-6 .s6-victim-card, #screen-6 .scroll-hint'), 'Y', 30);

    setTimeout(() => {
      const screen6 = $('#screen-6');
      screen6.classList.add('screen-hidden');
      screen6.classList.remove('screen-visible');
      stripAnimate('#screen-6 .s6-scammer-label, #screen-6 #s6-scammer-card, #screen-6 .s6-left, #screen-6 .s6-right, #screen-6 .s6-pills, #screen-6 .s6-victim-label, #screen-6 #s6-victim-card, #screen-6 .scroll-hint');

      // Restore S5
      const screen5 = $('#screen-5');
      screen5.classList.remove('screen-hidden');
      screen5.classList.add('screen-visible');

      // Restore S5 animated elements
      $$('#screen-5 .s5-tactic, #screen-5 .s5-lines, #screen-5 .s5-center').forEach(el => {
        el.style.opacity = '';
        el.style.transform = '';
        el.style.transition = '';
        el.classList.add('animate');
      });
      $('.s5-pills').classList.add('animate');
      $('.s5-victim-label').classList.add('animate');
      $('#s5-victim-card').classList.add('animate');
      $('#s5-scroll-hint').style.opacity = '';
      $('#s5-scroll-hint').classList.add('animate');

      currentScreen = 5;
      s6Ready = false;
      transitioning = false;
    }, 500);
  }

  /* ════ SCREEN 6 → SCREEN 7 (Contact established) ════ */

  // ── Screen 6 → 7 (Contact established) ──
  function transitionToScreen7() {
    // Fade out all S6 content
    const s6Hint = $('#s6-scroll-hint');
    s6Hint.style.transition = 'opacity 0.3s ease';
    s6Hint.style.opacity = '0';
    fadeOut($$('#screen-6 .s6-scammer-label, #screen-6 .s6-scammer-card, #screen-6 .s6-pills, #screen-6 .s6-left, #screen-6 .s6-right, #screen-6 .s6-victim-label, #screen-6 .s6-victim-card'), 'Y', 30);

    setTimeout(() => {
      // Hide S6
      const screen6 = $('#screen-6');
      screen6.classList.add('screen-hidden');
      screen6.classList.remove('screen-visible');

      // Show S7
      const screen7 = $('#screen-7');
      screen7.classList.remove('screen-hidden');
      screen7.classList.add('screen-visible');

      // Phase 1: Scammer slides in from left (trying to contact)
      setTimeout(() => {
        $('.s7-scammer-figure').classList.add('animate');
      }, 100);

      // Phase 2: Dots appear (attempting connection)
      setTimeout(() => {
        $('.s7-dots').classList.add('animate');
      }, 600);

      // Phase 3: Victim slides in from right (contact reaching)
      setTimeout(() => {
        $('.s7-victim-figure').classList.add('animate');
      }, 1200);

      // Phase 4: Dots start pulsing (connection established)
      setTimeout(() => {
        const dots = $('.s7-dots');
        dots.classList.remove('animate');
        dots.classList.add('connected');
      }, 2000);

      // Phase 5: "Contact established." text bams in
      setTimeout(() => {
        $('.s7-text').classList.add('animate');
      }, 2200);

      // Phase 6: Modes appear
      setTimeout(() => {
        $('.s7-modes').classList.add('animate');
      }, 2800);

      // Phase 7: Scroll hint last
      setTimeout(() => {
        $('#s7-scroll-hint').classList.add('animate');
        currentScreen = 7;
        s7Ready = true;
        transitioning = false;
      }, 3400);
    }, 500);
  }

  /* ════ SCREEN 7 → SCREEN 6 (reverse) ════ */

  // ── Screen 7 → 6 (reverse) ──
  function reverseToScreen6() {
    fadeOut($$('#screen-7 .s7-scammer-figure, #screen-7 .s7-dots, #screen-7 .s7-victim-figure, #screen-7 .s7-text, #screen-7 .s7-modes, #screen-7 .scroll-hint'), 'Y', 30);

    setTimeout(() => {
      const screen7 = $('#screen-7');
      screen7.classList.add('screen-hidden');
      screen7.classList.remove('screen-visible');

      // Reset S7 elements
      $$('#screen-7 .s7-scammer-figure, #screen-7 .s7-dots, #screen-7 .s7-victim-figure, #screen-7 .s7-text, #screen-7 .s7-modes, #screen-7 .scroll-hint').forEach(el => {
        el.classList.remove('animate', 'connected');
        el.style.transition = '';
        el.style.opacity = '';
        el.style.transform = '';
      });

      // Restore S6
      const screen6 = $('#screen-6');
      screen6.classList.remove('screen-hidden');
      screen6.classList.add('screen-visible');

      // Restore S6 animated elements
      $$('#screen-6 .s6-scammer-label, #screen-6 #s6-scammer-card, #screen-6 .s6-left, #screen-6 .s6-right, #screen-6 .s6-pills, #screen-6 .s6-victim-label, #screen-6 #s6-victim-card').forEach(el => {
        el.style.opacity = '';
        el.style.transform = '';
        el.style.transition = '';
        el.classList.add('animate');
      });
      $('#s6-scroll-hint').style.opacity = '';
      $('#s6-scroll-hint').classList.add('animate');

      currentScreen = 6;
      s7Ready = false;
      transitioning = false;
    }, 500);
  }

  /* ════ REVERSE NAV CLUSTER — S5→4, S4→3, S3→2 (contiguous block) ════ */

  // ── Screen 5 → 4 (reverse) ──
  function reverseToScreen4() {
    fadeOut($$('#screen-5 .s5-pills, #screen-5 .s5-center, #screen-5 .s5-lines, #screen-5 .s5-tactic, #screen-5 .s5-victim-label, #screen-5 .s5-victim-card, #screen-5 .scroll-hint'), 'Y', 30);

    setTimeout(() => {
      const screen5 = $('#screen-5');
      screen5.classList.add('screen-hidden');
      screen5.classList.remove('screen-visible');
      stripAnimate('#screen-5 .s5-pills, #screen-5 .s5-center, #screen-5 .s5-lines, #screen-5 .s5-tactic, #screen-5 .s5-victim-label, #screen-5 #s5-victim-card, #screen-5 .scroll-hint');

      // Restore scroll-container with screen 4 visible
      const container = $('#scroll-container-3-4');
      container.classList.remove('screen-hidden');
      container.classList.add('screen-visible');

      // Re-show S4 elements
      $('.s4-profile-card').style.opacity = '1';
      $('.s4-profile-card').style.transform = '';
      $('.s4-id-card').style.opacity = '1';
      $('.s4-id-card').style.transform = '';
      $('#s4-scroll-hint').style.opacity = '';
      $('#s4-scroll-hint').classList.add('animate');

      currentScreen = 4;
      s5Ready = false;
      transitioning = false;
    }, 500);
  }

  // ── Screen 4 → 3 (reverse horizontal scroll) ──
  function reverseToScreen3() {
    $('#s4-scroll-hint').style.transition = 'opacity 0.3s ease';
    $('#s4-scroll-hint').style.opacity = '0';

    $('#scroll-container-3-4').classList.remove('scrolled');

    setTimeout(() => {
      // Restore S3 scroll hint
      $('#s3-scroll-hint').style.opacity = '';
      $('#s3-scroll-hint').classList.add('animate');
      currentScreen = 3;
      s4Ready = false;
      transitioning = false;
    }, 1000);
  }

  // ── Screen 3 → 2 (reverse) ──
  function reverseToScreen2() {
    fadeOut($$('#screen-3 .s3-pills, #screen-3 .s3-left, #screen-3 .s3-right, #screen-3 .scroll-hint'), 'Y', 30);

    setTimeout(() => {
      const container = $('#scroll-container-3-4');
      container.classList.add('screen-hidden');
      container.classList.remove('screen-visible');
      stripAnimate('#screen-3 .s3-pills, #screen-3 .s3-left, #screen-3 .s3-right, #screen-3 .scroll-hint');

      // Show screen 2 again
      const screen2 = $('#screen-2');
      screen2.classList.remove('screen-hidden');
      screen2.classList.add('screen-visible');

      // Restore S2 elements
      $$('#screen-2 .center-devil, #screen-2 .pwned-text, #screen-2 .pwned-link, #screen-2 .emoji, #screen-2 .scroll-hint').forEach(el => {
        el.style.opacity = '';
        el.style.transform = '';
      });
      $('#s2-scroll-hint').classList.add('animate');

      currentScreen = 2;
      s3Ready = false;
      transitioning = false;
    }, 500);
  }

  /* ════ SCREEN 7 → SCREEN 8 (Emotional triggers + 30s timer) ════ */

  // ── Screen 7 → 8 (Emotional triggers) ──
  const TACTIC_LABELS = {
    authority: 'Authority Fabrication',
    distress: 'Distress Manipulation',
    affinity: 'Affinity Exploitation',
    hijack: 'Identity Hijacking'
  };

  function populateS8Cards() {
    // Copy scammer card data from S6
    const s6Name = $('#s6-scammer-name');
    if (s6Name) $('#s8-scammer-name').textContent = s6Name.textContent;
    const s6Det = $('#s6-scammer-details');
    if (s6Det) $('#s8-scammer-details').innerHTML = s6Det.innerHTML;

    // Tactic pill
    $('#s8-tactic-pill').textContent = TACTIC_LABELS[chosenTactic] || 'Authority Fabrication';

    // Victim card
    const sex = state.sex || 'male';
    $('#s8-victim-avatar-img').src = sex === 'female' ? 'assets/woman-red-hair.png' : 'assets/man-red-hair.png';
    $('#s8-victim-name').textContent = $('#s4-name').textContent;

    const details = $('#s8-victim-details');
    details.innerHTML = '';
    $('#s4-details').querySelectorAll('span').forEach(span => {
      const p = document.createElement('p');
      p.textContent = span.textContent;
      p.style.margin = '0';
      details.appendChild(p);
    });

    const ids = $('#s8-victim-ids');
    ids.innerHTML = '';
    $('#s4-ids').querySelectorAll('span').forEach(span => {
      const p = document.createElement('p');
      p.textContent = span.textContent;
      p.style.margin = '0';
      ids.appendChild(p);
    });
  }

  let s8TimerInterval = null;
  let s8Elapsed = 0;
  let s8ReturnedFromS9 = false;

  function transitionToScreen8() {
    s8ReturnedFromS9 = false;

    // Fade out S7 elements
    fadeOut($$('#screen-7 .s7-scammer-figure, #screen-7 .s7-dots, #screen-7 .s7-victim-figure, #screen-7 .s7-text, #screen-7 .s7-modes, #screen-7 .scroll-hint'), 'Y', 30);

    // Populate S8 cards
    populateS8Cards();

    setTimeout(() => {
      // Hide S7
      const screen7 = $('#screen-7');
      screen7.classList.add('screen-hidden');
      screen7.classList.remove('screen-visible');

      // Show S8
      const screen8 = $('#screen-8');
      screen8.classList.remove('screen-hidden');
      screen8.classList.add('screen-visible');

      // Trigger cascade animation
      screen8.classList.add('s8-animate');

      // Stagger the tactic cards
      setTimeout(() => {
        $$('.s8-tactic-card').forEach((card, i) => {
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, i * 120);
        });
      }, 900);

      // Stagger emojis
      setTimeout(() => {
        $$('#screen-8 .s8-emo').forEach((emo, i) => {
          setTimeout(() => {
            emo.style.opacity = '1';
          }, i * 80);
        });
      }, 700);

      // Start timer only after animations settle (~2s)
      setTimeout(() => {
        s8Elapsed = 0;
        const timerEl = $('#s8-timer');
        const progressEl = $('.s8-time-progress');
        const clockEl = $('#s8-clock');
        timerEl.textContent = '0';
        progressEl.style.width = '0';
        clockEl.style.left = '0px';
        clockEl.classList.remove('times-up');

        if (s8TimerInterval) clearInterval(s8TimerInterval);
        s8TimerInterval = setInterval(() => {
          s8Elapsed++;
          timerEl.textContent = `${s8Elapsed}`;
          // Progress bar: 442px over 30 fake-seconds (10 real seconds)
          const pct = Math.min(s8Elapsed / 30, 1);
          progressEl.style.width = (442 * pct) + 'px';
          // Clock drifts with the progress bar (425px at full width)
          clockEl.style.left = (425 * pct) + 'px';

          // At 30 fake-seconds: play times-up animation, then auto-transition
          if (s8Elapsed >= 30) {
            clearInterval(s8TimerInterval);
            s8TimerInterval = null;
            clockEl.classList.add('times-up');
            // Wait for animation to finish, then auto-advance (only if not returned from S9)
            setTimeout(() => {
              if (!transitioning && currentScreen === 8 && !s8ReturnedFromS9) {
                transitioning = true;
                transitionToScreen9();
              }
            }, 1200);
          }
        }, 333);
      }, 2000);

      // Scroll hint + ready
      setTimeout(() => {
        $('#s8-scroll-hint').classList.add('animate');
        currentScreen = 8;
        s8Ready = true;
        transitioning = false;
      }, 2000);
    }, 500);
  }

  // ── Screen 8 → 7 (reverse) ──
  function reverseToScreen7() {
    // Stop timer
    if (s8TimerInterval) { clearInterval(s8TimerInterval); s8TimerInterval = null; }

    fadeOut($$('#screen-8 .s8-scammer-row, #screen-8 .s8-isolation-lines, #screen-8 .s8-isolation-label, #screen-8 .s8-pills, #screen-8 .s8-step-content, #screen-8 .s8-tactics-row, #screen-8 .s8-time-bar, #screen-8 .s8-victim-row, #screen-8 .scroll-hint'), 'Y', 30);

    // Also fade emojis
    $$('#screen-8 .s8-emo').forEach(emo => {
      emo.style.transition = 'opacity 0.5s ease';
      emo.style.opacity = '0';
    });

    setTimeout(() => {
      const screen8 = $('#screen-8');
      screen8.classList.add('screen-hidden');
      screen8.classList.remove('screen-visible');
      screen8.classList.remove('s8-animate');

      // Reset all S8 elements
      $$('#screen-8 .s8-scammer-row, #screen-8 .s8-isolation-lines, #screen-8 .s8-isolation-label, #screen-8 .s8-pills, #screen-8 .s8-step-content, #screen-8 .s8-tactics-row, #screen-8 .s8-time-bar, #screen-8 .s8-victim-row, #screen-8 .scroll-hint').forEach(el => {
        el.style.transition = '';
        el.style.opacity = '';
        el.style.transform = '';
      });

      // Reset tactic cards
      $$('.s8-tactic-card').forEach(card => {
        card.style.opacity = '';
        card.style.transform = '';
      });

      // Reset emojis
      $$('#screen-8 .s8-emo').forEach(emo => {
        emo.style.transition = '';
        emo.style.opacity = '';
      });

      // Reset timer & clock
      $('#s8-timer').textContent = '0';
      $('.s8-time-progress').style.width = '0';
      $('#s8-clock').style.left = '0px';
      $('#s8-clock').classList.remove('times-up');
      s8Elapsed = 0;
      s8ReturnedFromS9 = false;

      // Restore S7
      const screen7 = $('#screen-7');
      screen7.classList.remove('screen-hidden');
      screen7.classList.add('screen-visible');

      // Re-animate S7 elements
      $$('#screen-7 .s7-scammer-figure, #screen-7 .s7-dots, #screen-7 .s7-victim-figure, #screen-7 .s7-text, #screen-7 .s7-modes').forEach(el => {
        el.style.opacity = '';
        el.style.transform = '';
        el.style.transition = '';
        el.classList.add('animate');
      });
      $('.s7-dots').classList.add('connected');
      $('#s7-scroll-hint').style.opacity = '';
      $('#s7-scroll-hint').classList.add('animate');

      currentScreen = 7;
      s8Ready = false;
      transitioning = false;
    }, 500);
  }

  /* ════ SCREEN 8 → SCREEN 9 (auto-advance at 30s) + Back button ════ */

  // ── Screen 8 → 9 (auto at 30s) ──
  function transitionToScreen9() {
    // Stop timer
    if (s8TimerInterval) { clearInterval(s8TimerInterval); s8TimerInterval = null; }

    // Fade out all S8 elements
    fadeOut($$('#screen-8 .s8-scammer-row, #screen-8 .s8-isolation-lines, #screen-8 .s8-isolation-label, #screen-8 .s8-pills, #screen-8 .s8-step-content, #screen-8 .s8-tactics-row, #screen-8 .s8-time-bar, #screen-8 .s8-victim-row, #screen-8 .scroll-hint'), 'Y', 30);

    $$('#screen-8 .s8-emo').forEach(emo => {
      emo.style.transition = 'opacity 0.5s ease';
      emo.style.opacity = '0';
    });

    setTimeout(() => {
      const screen8 = $('#screen-8');
      screen8.classList.add('screen-hidden');
      screen8.classList.remove('screen-visible');
      screen8.classList.remove('s8-animate');

      // Show S9
      const screen9 = $('#screen-9');
      screen9.classList.remove('screen-hidden');
      screen9.classList.add('screen-visible');
      screen9.classList.add('s9-animate');

      // Scroll hint + ready
      setTimeout(() => {
        $('#s9-scroll-hint').classList.add('animate');
        currentScreen = 9;
        s9Ready = true;
        s8Ready = false;
        transitioning = false;
      }, 1200);
    }, 600);
  }

  // ── Screen 9 → 8 (back) ──
  function reverseToScreen8() {
    fadeOut($$('#screen-9 .s9-headline, #screen-9 .s9-body, #screen-9 .s9-time-bar, #screen-9 .scroll-hint, #screen-9 .s9-back-btn'), 'Y', 30);

    setTimeout(() => {
      const screen9 = $('#screen-9');
      screen9.classList.add('screen-hidden');
      screen9.classList.remove('screen-visible');
      screen9.classList.remove('s9-animate');

      // Reset S9 elements for next visit
      $$('#screen-9 .s9-headline, #screen-9 .s9-body, #screen-9 .s9-time-bar, #screen-9 .scroll-hint, #screen-9 .s9-back-btn').forEach(el => {
        el.style.transition = '';
        el.style.opacity = '';
        el.style.transform = '';
      });

      // Restore S8 — fade elements back in without re-running the build animation
      const screen8 = $('#screen-8');
      screen8.classList.remove('screen-hidden');
      screen8.classList.add('screen-visible');

      // Fade all S8 elements back in
      const s8Els = $$('#screen-8 .s8-scammer-row, #screen-8 .s8-isolation-lines, #screen-8 .s8-isolation-label, #screen-8 .s8-pills, #screen-8 .s8-step-content, #screen-8 .s8-tactics-row, #screen-8 .s8-time-bar, #screen-8 .s8-victim-row, #screen-8 .scroll-hint');
      s8Els.forEach(el => {
        el.style.transition = 'opacity 0.4s ease';
        el.style.opacity = '1';
        el.style.transform = '';
      });
      $$('#screen-8 .s8-emo').forEach(emo => {
        emo.style.transition = 'opacity 0.4s ease';
        emo.style.opacity = '1';
      });
      $$('.s8-tactic-card').forEach(card => {
        card.style.transition = 'opacity 0.4s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });

      // Keep time bar frozen at 30 sec
      $('#s8-timer').textContent = '30';
      $('.s8-time-progress').style.width = '442px';
      $('#s8-clock').style.left = '425px';

      // Mark as returned — timer won't auto-advance; user scrolls forward
      s8ReturnedFromS9 = true;

      setTimeout(() => {
        $('#s8-scroll-hint').classList.add('animate');
        currentScreen = 8;
        s8Ready = true;
        s9Ready = false;
        transitioning = false;
      }, 500);
    }, 500);
  }

  // ── Back button for S9 ──
  $('#s9-back-btn').addEventListener('click', () => {
    if (transitioning) return;
    transitioning = true;
    reverseToScreen8();
  });

  /* ════════════════════════════════════════════════════
   *  Helper: copy scammer + victim cards to any screen prefix
   * ════════════════════════════════════════════════════ */
  function populateCallCards(prefix) {
    const s6Name = $('#s6-scammer-name');
    if (s6Name) $(`#${prefix}-scammer-name`).textContent = s6Name.textContent;
    const s6Det = $('#s6-scammer-details');
    if (s6Det) $(`#${prefix}-scammer-details`).innerHTML = s6Det.innerHTML;

    $(`#${prefix}-tactic-pill`).textContent = TACTIC_LABELS[chosenTactic] || 'Authority Fabrication';

    const sex = state.sex || 'male';
    $(`#${prefix}-victim-avatar-img`).src = sex === 'female' ? 'assets/woman-red-hair.png' : 'assets/man-red-hair.png';
    $(`#${prefix}-victim-name`).textContent = $('#s4-name').textContent;

    const details = $(`#${prefix}-victim-details`);
    details.innerHTML = '';
    $('#s4-details').querySelectorAll('span').forEach(span => {
      const p = document.createElement('p'); p.textContent = span.textContent; p.style.margin = '0'; details.appendChild(p);
    });

    const ids = $(`#${prefix}-victim-ids`);
    ids.innerHTML = '';
    $('#s4-ids').querySelectorAll('span').forEach(span => {
      const p = document.createElement('p'); p.textContent = span.textContent; p.style.margin = '0'; ids.appendChild(p);
    });
  }

  /* ════════════════════════════════════════════════════
   *  SCREEN 9 → SCREEN 10
   * ════════════════════════════════════════════════════ */
  function transitionToScreen10() {
    populateCallCards('s10');

    const s9 = $('#screen-9');
    fadeOut(s9.querySelectorAll('.s9-headline, .s9-body, .s9-time-bar-wrap, .s9-back-btn, .scroll-hint'));

    setTimeout(() => {
      s9.classList.add('screen-hidden'); s9.classList.remove('screen-visible');

      const s10 = $('#screen-10');
      s10.classList.remove('screen-hidden'); s10.classList.add('screen-visible');
      s10.classList.add('s10-animate');

      // Stagger emotion emojis
      setTimeout(() => {
        $$('#screen-10 .s10-emo').forEach((emo, i) => {
          setTimeout(() => { emo.style.transition = 'opacity 0.4s ease'; emo.style.opacity = '1'; }, i * 70);
        });
      }, 400);

      setTimeout(() => {
        $('#s10-scroll-hint').classList.add('animate');
        currentScreen = 10; s10Ready = true; transitioning = false;
      }, 1000);
    }, 600);
  }

  function reverseToScreen9() {
    const s10 = $('#screen-10');
    fadeOut($$('#screen-10 .s10-step-header, #screen-10 .s10-emo, #screen-10 .s10-goal-text, #screen-10 .s10-ai-card, #screen-10 .s10-robot, #screen-10 .s10-alien, #screen-10 .s10-time-bar, #screen-10 .scroll-hint'));

    setTimeout(() => {
      s10.classList.add('screen-hidden'); s10.classList.remove('screen-visible');
      s10.classList.remove('s10-animate');
      $$('#screen-10 .s10-emo').forEach(emo => { emo.style.opacity = '0'; emo.style.transition = ''; });

      const s9 = $('#screen-9');
      s9.classList.remove('screen-hidden'); s9.classList.add('screen-visible');
      s9.classList.add('s9-animate');

      setTimeout(() => {
        currentScreen = 9; s9Ready = true; s10Ready = false; transitioning = false;
      }, 600);
    }, 500);
  }

  /* ════════════════════════════════════════════════════
   *  SCREEN 10 → SCREEN 11
   * ════════════════════════════════════════════════════ */
  function transitionToScreen11() {
    const s10 = $('#screen-10');
    fadeOut($$('#screen-10 .s10-step-header, #screen-10 .s10-emo, #screen-10 .s10-goal-text, #screen-10 .s10-ai-card, #screen-10 .s10-robot, #screen-10 .s10-alien, #screen-10 .s10-time-bar, #screen-10 .scroll-hint'));

    setTimeout(() => {
      s10.classList.add('screen-hidden'); s10.classList.remove('screen-visible');

      const s11 = $('#screen-11');
      s11.classList.remove('screen-hidden'); s11.classList.add('screen-visible');
      s11.classList.add('s11-animate');

      // Dot-4 pops in at ~1.76s — start blinking cursor shortly after
      setTimeout(() => { $('#s11-dot-4').classList.add('s11-dot-blinking'); }, 1800);

      setTimeout(() => {
        $('#s11-scroll-hint').classList.add('animate');
        currentScreen = 11; s11Ready = true; transitioning = false;
      }, 1950);
    }, 500);
  }

  function reverseToScreen10() {
    const s11 = $('#screen-11');
    s11.classList.add('screen-hidden'); s11.classList.remove('screen-visible');
    s11.classList.remove('s11-animate');
    $('#s11-dot-4').classList.remove('s11-dot-blinking');
    $('.s11-center').style.opacity = '';

    populateCallCards('s10');
    const s10 = $('#screen-10');
    s10.classList.remove('screen-hidden'); s10.classList.add('screen-visible');
    s10.classList.add('s10-animate');
    $$('#screen-10 .s10-emo').forEach((emo, i) => {
      setTimeout(() => { emo.style.transition = 'opacity 0.4s ease'; emo.style.opacity = '1'; }, i * 50);
    });
    setTimeout(() => {
      currentScreen = 10; s10Ready = true; s11Ready = false; transitioning = false;
    }, 600);
  }

  /* ════════════════════════════════════════════════════
   *  SCREEN 11 → SCREEN 12
   * ════════════════════════════════════════════════════ */
  function transitionToScreen12() {
    populateCallCards('s12');

    const s11 = $('#screen-11');
    fadeOut([$('.s11-center')]);

    setTimeout(() => {
      s11.classList.add('screen-hidden'); s11.classList.remove('screen-visible');

      const s12 = $('#screen-12');
      s12.classList.remove('screen-hidden'); s12.classList.add('screen-visible');
      s12.classList.add('s12-animate');

      setTimeout(() => {
        $('#s12-scroll-hint').classList.add('animate');
        currentScreen = 12; s12Ready = true; transitioning = false;
      }, 900);
    }, 500);
  }

  function reverseToScreen11() {
    const s12 = $('#screen-12');
    fadeOut($$('#screen-12 .s12-step-header, #screen-12 .s12-money, #screen-12 .s12-emotion-pill, #screen-12 .s12-time-bar, #screen-12 .scroll-hint'));

    setTimeout(() => {
      s12.classList.add('screen-hidden'); s12.classList.remove('screen-visible');
      s12.classList.remove('s12-animate');

      const s11 = $('#screen-11');
      // Reset animation state before re-triggering
      $('#s11-dot-4').classList.remove('s11-dot-blinking');
      s11.classList.remove('s11-animate');
      $('.s11-center').style.opacity = '';
      void s11.offsetHeight; // force reflow so animations restart cleanly
      s11.classList.remove('screen-hidden'); s11.classList.add('screen-visible');
      s11.classList.add('s11-animate');

      // Restart blinking cursor after dot-4 pops in
      setTimeout(() => { $('#s11-dot-4').classList.add('s11-dot-blinking'); }, 1800);

      setTimeout(() => {
        currentScreen = 11; s11Ready = true; s12Ready = false; transitioning = false;
      }, 1950);
    }, 500);
  }

  /* ════════════════════════════════════════════════════
   *  SCREEN 12 → SCREEN 13
   * ════════════════════════════════════════════════════ */
  function transitionToScreen13() {
    populateCallCards('s13');

    const s12 = $('#screen-12');
    // Fade out everything EXCEPT money — it stays visible for the cross-screen fly illusion
    fadeOut($$('#screen-12 .s12-step-header, #screen-12 .s12-emotion-pill, #screen-12 .s12-time-bar, #screen-12 .scroll-hint'));

    setTimeout(() => {
      s12.classList.add('screen-hidden'); s12.classList.remove('screen-visible');

      const s13 = $('#screen-13');
      s13.classList.remove('screen-hidden'); s13.classList.add('screen-visible');
      s13.classList.add('s13-animate');

      // Cross-screen money: appear at S12 money position, then fly+shrink to S13 corner
      const moneyEl = document.querySelector('.s13-money-small');
      moneyEl.style.cssText = 'position:absolute; left:1015px; top:408px; width:214px; height:214px; opacity:1; transform:rotate(-75deg) scaleY(-1); transition:none; object-fit:contain;';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        moneyEl.style.transition = 'left 0.8s cubic-bezier(0.4,0,0.2,1), top 0.8s cubic-bezier(0.4,0,0.2,1), width 0.8s cubic-bezier(0.4,0,0.2,1), height 0.8s cubic-bezier(0.4,0,0.2,1)';
        moneyEl.style.left   = '1190px';
        moneyEl.style.top    = '16px';
        moneyEl.style.width  = '135px';
        moneyEl.style.height = '135px';
      }));

      setTimeout(() => {
        moneyEl.style.transition = '';
        $('#s13-scroll-hint').classList.add('animate');
        currentScreen = 13; s13Ready = true; transitioning = false;
      }, 950);
    }, 500);
  }

  function reverseToScreen12() {
    const s13 = $('#screen-13');
    fadeOut($$('#screen-13 .s13-step-content, #screen-13 .s13-ai-card, #screen-13 .s13-robot, #screen-13 .s13-alien, #screen-13 .s13-money-small, #screen-13 .s13-emotion-pill, #screen-13 .s13-time-bar, #screen-13 .scroll-hint'));

    setTimeout(() => {
      s13.classList.add('screen-hidden'); s13.classList.remove('screen-visible');
      s13.classList.remove('s13-animate');
      // Clear inline styles set by cross-screen money animation
      document.querySelector('.s13-money-small').style.cssText = '';

      populateCallCards('s12');
      const s12 = $('#screen-12');
      s12.classList.remove('screen-hidden'); s12.classList.add('screen-visible');
      s12.classList.add('s12-animate');

      setTimeout(() => {
        currentScreen = 12; s12Ready = true; s13Ready = false; transitioning = false;
      }, 700);
    }, 500);
  }

  /* ════════════════════════════════════════════════════
   *  SCREEN 13 → SCREEN 14
   * ════════════════════════════════════════════════════ */
  function transitionToScreen14() {
    const s13 = $('#screen-13');
    fadeOut($$('#screen-13 .s13-step-content, #screen-13 .s13-ai-card, #screen-13 .s13-robot, #screen-13 .s13-alien, #screen-13 .s13-money-small, #screen-13 .s13-emotion-pill, #screen-13 .s13-time-bar, #screen-13 .scroll-hint'));

    setTimeout(() => {
      s13.classList.add('screen-hidden'); s13.classList.remove('screen-visible');

      const s14 = $('#screen-14');
      s14.classList.remove('screen-hidden'); s14.classList.add('screen-visible');
      s14.classList.add('s14-animate');

      setTimeout(() => {
        $('#s14-scroll-hint').classList.add('animate');
        currentScreen = 14; s14Ready = true; transitioning = false;
      }, 1000);
    }, 500);
  }

  function reverseToScreen13() {
    const s14 = $('#screen-14');
    fadeOut([$('.s14-ghost'), $('.s14-step-block')]);

    setTimeout(() => {
      s14.classList.add('screen-hidden'); s14.classList.remove('screen-visible');
      s14.classList.remove('s14-animate');
      $('.s14-ghost').style.opacity = '0';
      $('.s14-step-block').style.opacity = '0';

      populateCallCards('s13');
      const s13 = $('#screen-13');
      // Reset any inline styles left by the cross-screen forward animation
      document.querySelector('.s13-money-small').style.cssText = '';
      s13.classList.remove('screen-hidden'); s13.classList.add('screen-visible');
      s13.classList.add('s13-animate');
      // Money is handled in JS (removed from s13-animate CSS block) — fade it in
      setTimeout(() => {
        const m = document.querySelector('.s13-money-small');
        m.style.transition = 'opacity 0.4s ease';
        m.style.opacity = '1';
        m.style.transform = 'rotate(-75deg) scaleY(-1)';
      }, 200);

      setTimeout(() => {
        currentScreen = 13; s13Ready = true; s14Ready = false; transitioning = false;
      }, 700);
    }, 500);
  }

  // ── Keyboard a11y ──
  allChips.forEach(chip => {
    chip.setAttribute('role', 'button');
    chip.setAttribute('tabindex', '0');
    chip.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chip.click(); }
    });
  });

  /* ════ PERSONA GEN — victim data for Screen 4 (names, cities, IDs, bios) ════ */

  // ── Persona Generator ──
  const NAMES = {
    male: ['Aarav', 'Rohan', 'Vikram', 'Chandu', 'Rahul', 'Arjun', 'Karan', 'Nikhil'],
    female: ['Priya', 'Ananya', 'Sneha', 'Kavya', 'Meera', 'Isha', 'Pooja', 'Riya'],
    'non-binary': ['Alex', 'Sam', 'Noor', 'Kiran', 'Arya', 'Reese', 'Jaya', 'Pari']
  };
  const CITIES = ['Mumbai, MH', 'Delhi, DL', 'Bangalore, KA', 'Nagpur, MH', 'Pune, MH', 'Hyderabad, TS', 'Chennai, TN', 'Kolkata, WB', 'Jaipur, RJ', 'Lucknow, UP'];

  function populatePersona() {
    const sex = state.sex || 'male', age = state.age || '25-34', occ = state.occupation || 'salaried';
    const randPAN = () => Array.from({ length: 5 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]).join('') + randDigits(4) + 'A';

    // Age
    let ageNum;
    if (age === '<18') ageNum = 16;
    else if (age === '>65') ageNum = 68;
    else { const [lo, hi] = age.split('-').map(Number); ageNum = lo + Math.floor(Math.random() * (hi - lo + 1)); }

    const name = pick(NAMES[sex] || NAMES.male);
    const city = pick(CITIES);
    const mob = '9' + randDigits(9);
    const sexLabel = sex === 'male' ? 'M' : sex === 'female' ? 'F' : 'NB';
    const marital = ageNum < 22 ? 'Unmarried' : pick(['Married', 'Unmarried']);

    // Populate DOM
    $('#s4-name').textContent = name;
    $('#s4-avatar-img').src = sex === 'female' ? 'assets/woman-red-hair.png' : 'assets/man-red-hair.png';

    const details = $('#s4-details');
    details.innerHTML = '';
    [`${ageNum} ${sexLabel}`, marital, occ.charAt(0).toUpperCase() + occ.slice(1).replace('-', ' '), city]
      .forEach(t => { const s = document.createElement('span'); s.textContent = t; details.appendChild(s); });

    // IDs
    const ids = $('#s4-ids');
    ids.innerHTML = '';
    const idMap = {
      'mobile-number': `Mob no. \u2013 ${mob}`,
      'aadhar-number': `Aadhar \u2013 ${randDigits(12)}`,
      'pan-number': `PAN \u2013 ${randPAN()}`,
      'bank-account': `BANK \u2013 ${pick(['ICICI', 'SBI', 'HDFC', 'Axis', 'Kotak'])}`,
      'demat-account': `Demat \u2013 ${pick(['Zerodha', 'Groww', 'Upstox'])}`,
      'passport': `Passport \u2013 J${randDigits(7)}`,
      'instagram': `IG \u2013 @${name.toLowerCase()}${randDigits(2)}`,
      'facebook': `FB \u2013 ${name} ${pick(['Kumar', 'Sharma', 'Singh', 'Patel', 'Rao'])}`,
      'whatsapp': `WhatsApp \u2013 ${mob}`,
      'gmail': `Gmail \u2013 ${name.toLowerCase()}${randDigits(3)}@gmail.com`,
      'telegram': `Telegram \u2013 @${name.toLowerCase()}_${randDigits(2)}`
    };
    [...state.have].forEach(key => {
      if (idMap[key]) { const s = document.createElement('span'); s.textContent = idMap[key]; ids.appendChild(s); }
    });

    // Bio
    const bios = {
      student: `${name} spends hours scrolling through flashy ads and unbelievable offers with wide, trusting eyes. Believes messages that start with \u201cCongratulations!\u201d are surely meant just for them. When strangers text about lucky draws or secret investment tips, every word is read with complete seriousness. In their digital world of bright banners and bold promises, their hopeful heart always clicks first and thinks later.`,
      salaried: `${name} juggles work emails and personal messages on the same phone. After a long day, a convincing \u201curgent bank alert\u201d feels real enough to click. Trusts official-looking logos and doesn\u2019t question links from \u201cHR\u201d or \u201cIT support.\u201d The fatigue of a 9-to-5 makes every shortcut seem like a blessing\u2014and every scam seem genuine.`,
      'un-employed': `${name} spends hours online, scrolling through flashy ads and unbelievable offers with wide, trusting eyes. Believes messages that start with \u201cCongratulations!\u201d are surely meant just for them. When strangers text about lucky draws or secret investment tips, every word is read with complete seriousness. Assumes everyone means well. Their hopeful heart always clicks first and thinks later.`,
      'self-employed': `${name} is always looking for the next big opportunity. An email promising \u201c10x returns\u201d or a WhatsApp group with \u201cexclusive investment tips\u201d feels like insider knowledge. Trusts people who talk business and moves fast without verifying. The hustle mindset makes them the perfect target for scams dressed as opportunities.`
    };
    $('#s4-bio').textContent = bios[occ] || bios.student;
  }
});
