/**
 * AI Scams Prototype — Interactive chip selection + multi-screen navigation
 */
document.addEventListener('DOMContentLoaded', () => {

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

  // ── Navigation state ──
  let currentScreen = 1, s2Ready = false, s3Ready = false, s4Ready = false, s5Ready = false, s6Ready = false, s7Ready = false, transitioning = false;

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
    } else if (backward) {
      if (currentScreen === 7 && s7Ready) { transitioning = true; reverseToScreen6(); }
      else if (currentScreen === 6 && s6Ready) { transitioning = true; reverseToScreen5(); }
      else if (currentScreen === 5 && s5Ready) { transitioning = true; reverseToScreen4(); }
      else if (currentScreen === 4 && s4Ready) { transitioning = true; reverseToScreen3(); }
      else if (currentScreen === 3 && s3Ready) { transitioning = true; reverseToScreen2(); }
    }
  });

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

  // ── Keyboard a11y ──
  allChips.forEach(chip => {
    chip.setAttribute('role', 'button');
    chip.setAttribute('tabindex', '0');
    chip.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chip.click(); }
    });
  });

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
