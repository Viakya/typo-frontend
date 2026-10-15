
<script setup lang="ts">
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
</script>

<template>
  <main class="landing">
    <nav class="navbar">
      <RouterLink to="/" class="brand">
        <span class="brand-icon">⌨</span>
        Typing Practice
      </RouterLink>

      <div class="nav-actions">
        <RouterLink
          v-if="auth.user"
          to="/tests"
          class="nav-link"
        >
          My Tests
        </RouterLink>

        <RouterLink
          v-else
          to="/login"
          class="nav-link"
        >
          Sign in
        </RouterLink>
      </div>
    </nav>

    <section class="hero">
      <div class="hero-content">
        <div class="eyebrow">
          <span class="status-dot"></span>
          YOUR PRACTICE STARTS HERE
        </div>

        <h1>
          Every keystroke
          <span>takes you closer.</span>
        </h1>

        <p class="description">
          Improve your typing speed, build accuracy, and prepare
          for competitive and government examinations with
          structured typing practice.
        </p>

        <div class="hero-actions">
          <RouterLink to="/tests" class="primary-button">
            Start Practicing
            <span aria-hidden="true">→</span>
          </RouterLink>

          <RouterLink to="/login" class="secondary-button">
            Sign in to your account
          </RouterLink>
        </div>

        <div class="benefits">
          <div class="benefit">
            <span class="benefit-icon">⌁</span>
            <div>
              <strong>Build speed</strong>
              <span>Improve your WPM</span>
            </div>
          </div>

          <div class="benefit">
            <span class="benefit-icon">✓</span>
            <div>
              <strong>Improve accuracy</strong>
              <span>Make every word count</span>
            </div>
          </div>

          <div class="benefit">
            <span class="benefit-icon">◷</span>
            <div>
              <strong>Practice for exams</strong>
              <span>Work against the clock</span>
            </div>
          </div>
        </div>
      </div>

      <div class="visual">
        <div class="visual-glow"></div>

        <div class="practice-card">
          <div class="card-top">
            <div>
              <span class="card-label">YOUR NEXT SESSION</span>
              <h2>Ready to practice?</h2>
            </div>
            <span class="keyboard-icon">⌨</span>
          </div>

          <div class="typing-preview">
            <span class="typed">Success comes through</span>
            <span class="remaining">consistent effort and</span>
            <span class="remaining">daily practice.</span>
            <span class="cursor"></span>
          </div>

          <div class="card-footer">
            <span><span class="green-dot"></span> Focus on accuracy</span>
            <span>One test at a time</span>
          </div>
        </div>

        <div class="floating-note note-top">
          <span class="note-icon">↗</span>
          <div>
            <strong>Keep improving</strong>
            <span>Practice makes progress</span>
          </div>
        </div>

        <div class="floating-note note-bottom">
          <span class="note-icon accuracy-icon">✓</span>
          <div>
            <strong>Accuracy matters</strong>
            <span>Every character counts</span>
          </div>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="section-heading">
        <span>YOUR PRACTICE TOOLKIT</span>
        <h2>Everything starts with practice.</h2>
        <p>Build the skills you need, one session at a time.</p>
      </div>

      <div class="feature-grid">
        <article class="feature-card">
          <div class="feature-icon blue">⌨</div>
          <h3>Timed typing tests</h3>
          <p>
            Practice with timed passages designed to help you
            get comfortable typing under exam conditions.
          </p>
        </article>

        <article class="feature-card">
          <div class="feature-icon purple">◎</div>
          <h3>Speed and accuracy</h3>
          <p>
            Review your results after each attempt and identify
            where you can improve.
          </p>
        </article>

        <article class="feature-card">
          <div class="feature-icon orange">↗</div>
          <h3>Track your progress</h3>
          <p>
            Revisit your previous attempts and keep working
            towards your personal best.
          </p>
        </article>
      </div>
    </section>

    <section class="bottom-cta">
      <div>
        <span class="cta-label">YOUR NEXT STEP</span>
        <h2>Ready to put your skills to the test?</h2>
        <p>Choose a test and start practising today.</p>
      </div>

      <RouterLink to="/tests" class="primary-button">
        Explore Tests <span aria-hidden="true">→</span>
      </RouterLink>
    </section>

    <footer>
      <RouterLink to="/" class="footer-brand">Typing Practice</RouterLink>
      <span>Practice consistently. Improve confidently.</span>
    </footer>
  </main>
</template>

<style scoped>
.landing {
  --blue: #2457ed;
  --ink: #17233e;
  --muted: #68758c;
  color: var(--ink);
  background: #fff;
  min-height: 100vh;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
}

.navbar {
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 max(6%, calc((100% - 1180px) / 2));
  border-bottom: 1px solid #edf0f5;
}

.brand,
.footer-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--ink);
  text-decoration: none;
  font-weight: 800;
  font-size: 19px;
}

.brand-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  color: white;
  background: var(--blue);
  border-radius: 11px;
  font-size: 22px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-link {
  text-decoration: none;
  color: #3e4b63;
  font-size: 14px;
  font-weight: 600;
}

.hero {
  max-width: 1180px;
  margin: 0 auto;
  padding: 92px 24px 100px;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  align-items: center;
  gap: 56px;
}

.eyebrow,
.cta-label {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: 11px;
  letter-spacing: 1.6px;
  font-weight: 800;
  color: var(--blue);
}

.status-dot,
.green-dot {
  width: 8px;
  height: 8px;
  background: #20b981;
  border-radius: 50%;
  display: inline-block;
}

.hero h1 {
  font-size: clamp(42px, 5vw, 66px);
  letter-spacing: -3px;
  line-height: 1.1;
  margin: 25px 0 20px;
  font-weight: 850;
}

.hero h1 span {
  display: block;
  color: var(--blue);
}

.description {
  max-width: 510px;
  color: var(--muted);
  font-size: 16px;
  line-height: 1.9;
}

.hero-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 30px;
}

.primary-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 18px;
  background: var(--blue);
  color: white;
  text-decoration: none;
  border-radius: 9px;
  padding: 15px 21px;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 7px 18px #2457ed2b;
  transition: transform 0.2s, background 0.2s;
}

.primary-button:hover {
  transform: translateY(-2px);
  background: #1746d4;
}

.secondary-button {
  color: #42506a;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
}

.benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: 45px;
  padding-top: 25px;
  border-top: 1px solid #e9edf4;
}

.benefit {
  display: flex;
  align-items: center;
  gap: 10px;
}

.benefit-icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  background: #edf2ff;
  color: var(--blue);
  border-radius: 9px;
  font-weight: 800;
  font-size: 17px;
}

.benefit div,
.floating-note div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.benefit strong {
  font-size: 12px;
}

.benefit div span {
  color: var(--muted);
  font-size: 10px;
}

.visual {
  position: relative;
  min-height: 380px;
  display: grid;
  place-items: center;
}

.visual-glow {
  position: absolute;
  width: 340px;
  height: 340px;
  background: #eaf0ff;
  border-radius: 50%;
  filter: blur(3px);
}

.practice-card {
  position: relative;
  z-index: 1;
  width: min(100%, 410px);
  padding: 28px;
  background: white;
  border: 1px solid #e4e9f2;
  border-radius: 18px;
  box-shadow: 0 24px 70px #24395c17;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-label {
  font-size: 10px;
  letter-spacing: 1.1px;
  font-weight: 800;
  color: #7e8aa1;
}

.card-top h2 {
  margin: 9px 0 0;
  font-size: 22px;
  letter-spacing: -0.7px;
}

.keyboard-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #edf2ff;
  color: var(--blue);
  font-size: 26px;
}

.typing-preview {
  position: relative;
  margin-top: 30px;
  padding: 22px;
  border-radius: 12px;
  background: #f7f9fd;
  border: 1px solid #edf0f6;
  font-size: 17px;
  line-height: 2;
}

.typed,
.remaining {
  display: block;
}

.typed {
  color: #253653;
  font-weight: 650;
}

.remaining {
  color: #a1abc0;
}

.cursor {
  position: absolute;
  top: 64px;
  left: 22px;
  width: 2px;
  height: 21px;
  background: var(--blue);
  opacity: 0.75;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 22px;
  font-size: 10px;
  color: #758198;
}

.card-footer > span:first-child {
  display: flex;
  align-items: center;
  gap: 7px;
}

.card-footer .green-dot {
  width: 7px;
  height: 7px;
}

.floating-note {
  position: absolute;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 13px 16px;
  background: white;
  border: 1px solid #e9edf4;
  border-radius: 12px;
  box-shadow: 0 12px 35px #24395c12;
}

.note-top {
  top: 13px;
  right: -6px;
}

.note-bottom {
  bottom: 15px;
  left: -20px;
}

.note-icon {
  display: grid;
  place-items: center;
  width: 35px;
  height: 35px;
  border-radius: 10px;
  background: #edf2ff;
  color: var(--blue);
  font-size: 21px;
  font-weight: 800;
}

.accuracy-icon {
  color: #0d9b68;
  background: #e6f8f0;
}

.floating-note strong {
  font-size: 12px;
}

.floating-note div span {
  font-size: 10px;
  color: var(--muted);
}

.features {
  background: #f7f9fd;
  padding: 80px 24px 90px;
}

.section-heading {
  text-align: center;
  max-width: 620px;
  margin: 0 auto 42px;
}

.section-heading > span {
  color: var(--blue);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.section-heading h2 {
  margin: 15px 0 12px;
  font-size: clamp(27px, 4vw, 37px);
  letter-spacing: -1.3px;
}

.section-heading p,
.feature-card p {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.8;
}

.feature-grid {
  max-width: 1080px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.feature-card {
  padding: 28px;
  background: white;
  border: 1px solid #e9edf4;
  border-radius: 14px;
}

.feature-icon {
  display: grid;
  place-items: center;
  width: 45px;
  height: 45px;
  border-radius: 12px;
  font-size: 22px;
  font-weight: 800;
}

.feature-icon.blue {
  color: #2457ed;
  background: #edf2ff;
}

.feature-icon.purple {
  color: #8051df;
  background: #f2edff;
}

.feature-icon.orange {
  color: #c77a20;
  background: #fff4e5;
}

.feature-card h3 {
  margin: 22px 0 10px;
  font-size: 17px;
}

.feature-card p {
  margin-bottom: 0;
}

.bottom-cta {
  max-width: 1080px;
  margin: 75px auto;
  padding: 35px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border-radius: 16px;
  background: #f0f4ff;
}

.bottom-cta h2 {
  margin: 12px 0 8px;
  font-size: clamp(22px, 3vw, 29px);
  letter-spacing: -0.8px;
}

.bottom-cta p {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
}

footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 25px max(6%, calc((100% - 1080px) / 2));
  border-top: 1px solid #edf0f5;
}

.footer-brand {
  font-size: 14px;
}

footer > span {
  color: var(--muted);
  font-size: 12px;
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
    gap: 45px;
    padding-top: 65px;
  }

  .hero-content {
    max-width: 650px;
  }

  .visual {
    max-width: 560px;
    width: 100%;
    margin: 0 auto;
  }

  .feature-grid {
    grid-template-columns: 1fr;
    max-width: 560px;
  }

  .bottom-cta {
    margin: 55px 24px;
  }
}

@media (max-width: 520px) {
  .navbar {
    height: 65px;
    padding: 0 18px;
  }

  .brand {
    font-size: 16px;
  }

  .hero {
    padding: 52px 20px 65px;
  }

  .hero h1 {
    font-size: 43px;
    letter-spacing: -2px;
  }

  .description {
    font-size: 14px;
  }

  .hero-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .secondary-button {
    padding: 8px 0;
  }

  .benefits {
    flex-direction: column;
    gap: 18px;
  }

  .visual {
    min-height: 320px;
  }

  .visual-glow {
    width: 270px;
    height: 270px;
  }

  .practice-card {
    padding: 19px;
  }

  .card-top h2 {
    font-size: 19px;
  }

  .typing-preview {
    padding: 16px;
    font-size: 14px;
  }

  .cursor {
    left: 16px;
    top: 57px;
  }

  .note-top {
    right: -4px;
    top: -12px;
  }

  .note-bottom {
    left: -4px;
    bottom: -12px;
  }

  .floating-note {
    padding: 9px 11px;
  }

  .features {
    padding: 60px 20px;
  }

  .bottom-cta {
    margin: 35px 20px;
    padding: 25px;
    align-items: flex-start;
    flex-direction: column;
  }

  footer {
    padding: 22px 20px;
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
