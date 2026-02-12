/**
 * AI Scams Prototype — Screen 1: Bio Input
 * Interactive chip selection with animations
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── State ──
  const state = {
    age: null,
    sex: null,
    occupation: null,
    have: new Set()
  };

  // ── Elements ──
  const continueBtn = document.getElementById('continue-btn');

  // ── Stagger chip entrance animations ──
  const allChips = document.querySelectorAll('.chip');
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
  document.querySelectorAll('.bio-group').forEach(group => {
    const groupName = group.dataset.group;
    const chips = group.querySelectorAll('.chip');

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const value = chip.dataset.value;

        // If already selected, deselect
        if (state[groupName] === value) {
          state[groupName] = null;
          chip.classList.remove('selected');
        } else {
          // Deselect previous
          chips.forEach(c => c.classList.remove('selected'));
          // Select new
          state[groupName] = value;
          chip.classList.add('selected');

          // Pulse feedback (class-based, no animation override)
          chip.classList.add('just-selected');
          requestAnimationFrame(() => {
            chip.classList.add('pulse-out');
          });
          setTimeout(() => {
            chip.classList.remove('just-selected', 'pulse-out');
          }, 450);
        }

        updateContinueButton();
        updateClipboard();
      });
    });
  });

  // ── Multi-select group (Do you have?) ──
  const haveChips = document.querySelectorAll('[data-group="have"] .chip');
  haveChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const value = chip.dataset.value;

      if (state.have.has(value)) {
        state.have.delete(value);
        chip.classList.remove('selected');
      } else {
        state.have.add(value);
        chip.classList.add('selected');

        // Pulse feedback (class-based, no animation override)
        chip.classList.add('just-selected');
        requestAnimationFrame(() => {
          chip.classList.add('pulse-out');
        });
        setTimeout(() => {
          chip.classList.remove('just-selected', 'pulse-out');
        }, 450);
      }

      updateContinueButton();
      updateClipboard();
    });
  });

  // ── Continue button state ──
  function updateContinueButton() {
    const hasAge = state.age !== null;
    const hasSex = state.sex !== null;
    const hasOccupation = state.occupation !== null;
    const hasAnyDetail = state.have.size > 0;

    // Enable if at least age and one "have" item is selected
    const ready = hasAge && hasSex && hasOccupation && hasAnyDetail;

    continueBtn.disabled = !ready;
  }

  // ── Clipboard visual feedback ──
  function updateClipboard() {
    const clipboard = document.querySelector('.clipboard');
    const totalSelections = 
      (state.age ? 1 : 0) + 
      (state.sex ? 1 : 0) + 
      (state.occupation ? 1 : 0) + 
      state.have.size;

    // Subtle scale based on how many items are filled
    const scale = 1 + Math.min(totalSelections * 0.008, 0.08);
    clipboard.style.transform = `rotate(-15deg) scale(${scale})`;
  }

  // ── Continue button click ──
  continueBtn.addEventListener('click', () => {
    if (continueBtn.disabled) return;

    console.log('User profile:', {
      age: state.age,
      sex: state.sex,
      occupation: state.occupation,
      have: [...state.have]
    });

    // Transition out animation
    const screen1 = document.getElementById('screen-1');
    const sections = document.querySelectorAll('#screen-1 .section, #screen-1 .continue-wrapper');
    sections.forEach(el => {
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      el.style.opacity = '0';
      el.style.transform = 'translateX(-40px)';
    });

    const clipboardWrapper = document.querySelector('.clipboard-wrapper');
    clipboardWrapper.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    clipboardWrapper.style.opacity = '0';
    clipboardWrapper.style.transform = 'translateX(80px)';

    // After screen 1 fades out → show screen 2 with BAM
    setTimeout(() => {
      screen1.classList.add('screen-hidden');

      const screen2 = document.getElementById('screen-2');
      screen2.classList.remove('screen-hidden');
      screen2.classList.add('screen-visible');

      // Trigger screen shake
      screen2.classList.add('shake');

      // Stagger the bam animations
      // 1. Center devil emoji — immediate
      setTimeout(() => {
        document.querySelector('.center-devil').classList.add('animate');
      }, 100);

      // 2. Main text — after emoji lands
      setTimeout(() => {
        document.querySelector('.pwned-text').classList.add('animate');
      }, 400);

      // 3. Background emojis — scatter in
      setTimeout(() => {
        document.querySelectorAll('.emoji').forEach(e => e.classList.add('animate'));
      }, 600);

      // 4. Link — fade in last
      setTimeout(() => {
        document.querySelector('.pwned-link').classList.add('animate');
      }, 900);

      // 5. Auto-advance to Screen 3 after 5 seconds
      setTimeout(() => {
        transitionToScreen3(screen2);
      }, 5000);

    }, 600);
  });

  // ── Screen 2 → Screen 3 transition ──
  function transitionToScreen3(screen2) {
    // Fade out screen 2
    const s2Elements = screen2.querySelectorAll('.center-devil, .pwned-text, .pwned-link, .emoji');
    s2Elements.forEach(el => {
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      el.style.opacity = '0';
      el.style.transform = 'scale(0.9)';
    });

    setTimeout(() => {
      screen2.classList.add('screen-hidden');
      screen2.classList.remove('screen-visible');

      const screen3 = document.getElementById('screen-3');
      screen3.classList.remove('screen-hidden');
      screen3.classList.add('screen-visible');

      // Stagger screen 3 entrance animations
      setTimeout(() => {
        document.querySelector('.s3-pills').classList.add('animate');
      }, 100);

      setTimeout(() => {
        document.querySelector('.s3-left').classList.add('animate');
      }, 200);

      setTimeout(() => {
        document.querySelector('.s3-right').classList.add('animate');
      }, 350);
    }, 600);
  }

  // ── Keyboard accessibility ──
  allChips.forEach(chip => {
    chip.setAttribute('role', 'button');
    chip.setAttribute('tabindex', '0');
    chip.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        chip.click();
      }
    });
  });
});
