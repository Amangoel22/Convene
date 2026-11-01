// Purpose: LandingPage introduces Convene with animated product storytelling.
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Check,
  ClipboardList,
  Clock3,
  FileText,
  PackageCheck,
  Radio,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ConveneMark } from "@/components/brand/ConveneMark";
import { ThemePicker } from "@/components/ui/ThemePicker";
import { useAppStore } from "@/store/useAppStore";
import "@/styles/landing.css";

const rise = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const activityFeed = [
  {
    icon: Check,
    title: "Stage check completed",
    detail: "Just now",
    team: "Production team",
    teamDetail: "Schedule updated live",
  },
  {
    icon: ClipboardList,
    title: "Crew task assigned",
    detail: "A moment ago",
    team: "Guest experience",
    teamDetail: "6 members coordinated",
  },
  {
    icon: PackageCheck,
    title: "Equipment count confirmed",
    detail: "A moment ago",
    team: "Logistics team",
    teamDetail: "Inventory is up to date",
  },
];

const whatWeDoFeatures = [
  {
    icon: CalendarDays,
    number: "01",
    title: "Shape the schedule",
    body: "Build a run of show that stays connected to the live event timeline.",
    detail:
      "Give every stage a clear time, venue, and handoff. When plans change, the whole crew sees the current run of show.",
  },
  {
    icon: Users,
    number: "02",
    title: "Bring teams together",
    body: "Organize people, responsibilities, and shifts in one shared space.",
    detail:
      "Create teams, connect members to their accounts, and make ownership visible before event day begins.",
  },
  {
    icon: ClipboardList,
    number: "03",
    title: "Move work forward",
    body: "Assign tasks, track progress, and surface issues while there is time to act.",
    detail:
      "Keep tasks, duties, and reported issues in context so the right work reaches the right people.",
  },
];

const capabilityGroups = [
  {
    icon: CalendarDays,
    title: "Plan the day",
    subtitle: "Schedule · Venues",
    description:
      "Build a run of show with stage times, locations, and live progress.",
  },
  {
    icon: Users,
    title: "Coordinate people",
    subtitle: "Teams · Duties",
    description: "Organize crews, assign shift roles, and keep handoffs clear.",
  },
  {
    icon: ClipboardList,
    title: "Move work",
    subtitle: "Tasks · Issues",
    description:
      "Give work an owner, track its status, and resolve blockers together.",
  },
  {
    icon: PackageCheck,
    title: "Manage resources",
    subtitle: "Inventory · Files",
    description:
      "Keep equipment counts and event documents close to the teams that need them.",
  },
];

const orbitFeatures = [
  { icon: CalendarDays, label: "SCHEDULE", position: "node-a" },
  { icon: Users, label: "PEOPLE", position: "node-b" },
  { icon: ClipboardList, label: "TASKS", position: "node-c" },
  { icon: ShieldCheck, label: "OVERSIGHT", position: "node-d" },
  { icon: PackageCheck, label: "INVENTORY", position: "node-e" },
  { icon: FileText, label: "RESOURCES", position: "node-f" },
  { icon: Radio, label: "DUTIES", position: "node-g" },
  { icon: Clock3, label: "TIMELINE", position: "node-h" },
];

// Reveals landing content as it enters the viewport.
function Reveal({ children, className = "", delay = 0 }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={rise}
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

// Renders Convene's public, theme-aware product landing page.
export function LandingPage() {
  const themePalette = useAppStore((state) => state.themePalette);
  const reduceMotion = useReducedMotion();
  const [activityIndex, setActivityIndex] = useState(0);
  const [activityPosition, setActivityPosition] = useState(0);
  const [teamPosition, setTeamPosition] = useState(3);
  const [activeFeature, setActiveFeature] = useState(-1);
  const [activeCapability, setActiveCapability] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [stepsVisible, setStepsVisible] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const stepsSectionRef = useRef(null);
  const activity = activityFeed[activityIndex];
  const ActivityIcon = activity.icon;
  const CapabilityIcon = capabilityGroups[activeCapability].icon;

  // Applies the single Convene visual system while the landing page is outside the app shell.
  useEffect(() => {
    document.documentElement.dataset.theme = "convene";
    document.documentElement.dataset.convenePalette = themePalette;
  }, [themePalette]);

  // Reveals the navbar when scrolling upward and hides it while scrolling down.
  useEffect(() => {
    let previousScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 24 || currentScrollY < previousScrollY - 2) {
        setNavVisible(true);
      } else if (currentScrollY > previousScrollY + 2) {
        setNavVisible(false);
      }
      previousScrollY = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Randomly rotates live activity and popup placement to animate the dashboard preview.
  useEffect(() => {
    if (reduceMotion) return undefined;
    const timer = window.setInterval(
      () => {
        setActivityIndex(
          (index) =>
            (index +
              1 +
              Math.floor(Math.random() * (activityFeed.length - 1))) %
            activityFeed.length,
        );
        const nextActivityPosition = Math.floor(Math.random() * 4);
        setActivityPosition(nextActivityPosition);
        const teamOptions = [0, 1, 2, 3].filter(
          (position) => position !== nextActivityPosition,
        );
        setTeamPosition(
          teamOptions[Math.floor(Math.random() * teamOptions.length)],
        );
      },
      2500 + Math.floor(Math.random() * 1800),
    );
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  // Starts the ordered step animation only while its section is on screen.
  useEffect(() => {
    const section = stepsSectionRef.current;
    if (!section) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setStepsVisible(entry.isIntersecting);
        if (entry.isIntersecting) setActiveStep(0);
      },
      { threshold: 0.2 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Advances one step at a time only while the process rail is visible.
  useEffect(() => {
    if (reduceMotion || !stepsVisible) return undefined;
    const timer = window.setInterval(
      () => setActiveStep((step) => (step + 1) % 3),
      1550,
    );
    return () => window.clearInterval(timer);
  }, [reduceMotion, stepsVisible]);

  return (
    <main className="landing-page">
      {/* Landing navigation. */}
      <header
        className={`landing-nav ${navVisible ? "is-visible" : "is-hidden"}`}
      >
        <a className="landing-brand" href="#top" aria-label="Convene home">
          <span className="landing-brand-mark">
            <ConveneMark />
          </span>
          <span>convene</span>
        </a>
        <nav className="landing-nav-links" aria-label="Main navigation">
          <a href="#platform">Platform</a>
          <a href="#how-it-works">How it works</a>
          <a href="#teams">For teams</a>
          <a href="#why-us">Why Convene</a>
        </nav>
        <div className="landing-nav-actions">
          <ThemePicker compact className="theme-picker-landing" />
          <Link className="landing-login-link" to="/login">
            Log in
          </Link>
          <Link className="landing-nav-cta" to="/login">
            Explore <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {/* Hero: event operations preview and primary sign-in path. */}
      <section className="landing-hero" id="top">
        <div className="landing-orb landing-orb-one" aria-hidden="true" />
        <div className="landing-orb landing-orb-two" aria-hidden="true" />
        <motion.div
          className="landing-hero-copy"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="landing-eyebrow">A CLEARER WAY TO RUN EVENTS</span>
          <h1 className="landing-title">
            Bring every
            <br />
            <span>moving part</span>
            <br />
            together.
          </h1>
          <p className="landing-hero-subtitle">
            Convene gives your team one clear view of the people, plans, and
            progress behind a great event.
          </p>
          <div className="landing-hero-actions">
            <Link to="/login" className="landing-primary-button">
              Explore Convene <ArrowRight size={17} />
            </Link>
            <a href="#platform" className="landing-text-button">
              See how it works <ArrowDown size={15} />
            </a>
          </div>
          <div className="landing-hero-note">
            <span className="landing-note-line" /> Built for the moments when
            everything has to come together.
          </div>
        </motion.div>

        <motion.div
          className="landing-product-visual"
          initial={reduceMotion ? false : { opacity: 0, x: 35, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          aria-label="Illustration of the Convene event operations dashboard"
        >
          <div className="landing-visual-glow" />
          <div className="landing-dashboard-card">
            <div className="landing-dash-top">
              <div className="landing-dash-brand">
                <span className="landing-mini-mark">
                  <ConveneMark size={12} />
                </span>{" "}
                Convene <span className="landing-dash-separator">/</span> Event
                overview
              </div>
              <span className="landing-dash-live">
                <i /> IN PROGRESS
              </span>
            </div>
            <div className="landing-dash-title-row">
              <div>
                <span className="landing-dash-kicker">
                  YOUR EVENT, AT A GLANCE
                </span>
                <h2>Event overview</h2>
                <p>People, plans, and progress in one place.</p>
              </div>
              <div className="landing-dash-date">
                <CalendarDays size={15} />
                <span>
                  EVENT DAY<small>LIVE SCHEDULE</small>
                </span>
              </div>
            </div>
            <div className="landing-stat-grid">
              <div className="landing-stat">
                <span>TEAM MEMBERS</span>
                <strong>24</strong>
                <small>
                  <Users size={12} /> across 5 teams
                </small>
              </div>
              <div className="landing-stat">
                <span>OPEN TASKS</span>
                <strong>{18 - activityIndex}</strong>
                <small>
                  <ClipboardList size={12} /> work in motion
                </small>
              </div>
              <div className="landing-stat landing-stat-accent">
                <span>SCHEDULE</span>
                <strong>{72 + activityIndex * 6}%</strong>
                <small>
                  <span className="landing-stat-progress">
                    <i style={{ width: `${72 + activityIndex * 6}%` }} />
                  </span>{" "}
                  on track
                </small>
              </div>
            </div>
            <div className="landing-timeline">
              <div className="landing-timeline-heading">
                <span>EVENT FLOW</span>
                <span>RUN OF SHOW</span>
              </div>
              <div className={`landing-timeline-track stage-${activityIndex}`}>
                <i className="is-done">
                  <Check size={10} />
                </i>
                <span className="is-past" />
                <i className="is-live">
                  <b />
                </i>
                <span />
                <i className={activityIndex > 0 ? "is-done" : ""}>
                  {activityIndex > 0 && <Check size={10} />}
                </i>
                <span />
                <i />
              </div>
              <div className="landing-timeline-labels">
                <span>Check-in</span>
                <span>Opening</span>
                <span>Sessions</span>
                <span>Finale</span>
              </div>
            </div>
            <div className="landing-dash-footer">
              <span>
                <span className="landing-avatar">A</span>
                <b>Team is on track</b>
              </span>
              <span className="landing-footer-pulse">
                <Zap size={12} /> Live overview
              </span>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activityIndex}-${activityPosition}`}
              className={`landing-float-card landing-float-task float-position-${activityPosition}`}
              initial={
                reduceMotion
                  ? false
                  : { opacity: 0, y: 14, scale: 0.9, rotate: -3 }
              }
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={
                reduceMotion
                  ? undefined
                  : { opacity: 0, y: -12, scale: 0.94, rotate: 2 }
              }
              transition={{ type: "spring", stiffness: 220, damping: 19 }}
            >
              <span className="landing-float-check">
                <ActivityIcon size={13} />
              </span>
              <span>
                <b>{activity.title}</b>
                <small>{activity.detail}</small>
              </span>
            </motion.div>
          </AnimatePresence>
          <motion.div
            className={`landing-float-card landing-float-team float-position-${teamPosition}`}
            animate={reduceMotion ? {} : { y: [0, 7, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4,
            }}
          >
            <span className="landing-float-users">
              <Users size={15} />
            </span>
            <span>
              <b>{activity.team}</b>
              <small>{activity.teamDetail}</small>
            </span>
          </motion.div>
        </motion.div>
        <a className="landing-scroll-cue" href="#platform">
          <span>SCROLL TO EXPLORE</span>
          <span className="landing-scroll-line" />
        </a>
      </section>

      {/* Section 01: Convene's core event-coordination story. */}
      <section className="landing-section landing-what" id="platform">
        <div className="landing-section-index">
          <b>01</b>
          <span>WHAT WE DO</span>
        </div>
        <div className="landing-section-main">
          <Reveal className="landing-section-intro-block">
            <p className="landing-section-kicker">
              ONE EVENT. ONE SHARED PICTURE.
            </p>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                className="landing-feature-copy"
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                <h2 className="landing-section-title">
                  {activeFeature < 0 ? (
                    <>
                      The plan is only
                      <br />
                      <span>the beginning.</span>
                    </>
                  ) : (
                    <>
                      {whatWeDoFeatures[activeFeature].title
                        .split(" ")
                        .slice(0, -1)
                        .join(" ")}
                      <br />
                      <span>
                        {whatWeDoFeatures[activeFeature].title
                          .split(" ")
                          .at(-1)}
                        .
                      </span>
                    </>
                  )}
                </h2>
                <p className="landing-section-intro">
                  {activeFeature < 0
                    ? "Convene turns a busy event into coordinated work. People know what is happening, teams know what comes next, and organizers can see the whole operation at a glance."
                    : whatWeDoFeatures[activeFeature].body}
                </p>
                <p className="landing-section-detail">
                  {activeFeature < 0
                    ? "From the first schedule draft to the last equipment check, every moving part has a home—and every update reaches the people who need it."
                    : whatWeDoFeatures[activeFeature].detail}
                </p>
              </motion.div>
            </AnimatePresence>
          </Reveal>
          <div className="landing-feature-showcase">
            <div className="landing-feature-grid">
              {whatWeDoFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={feature.number}
                    role="button"
                    tabIndex={0}
                    aria-pressed={activeFeature === index}
                    className={`landing-feature-card feature-float-${index} ${activeFeature === index ? "is-active" : ""}`}
                    onMouseEnter={() => setActiveFeature(index)}
                    onMouseLeave={() => setActiveFeature(-1)}
                    onFocus={() => setActiveFeature(index)}
                    onBlur={() => setActiveFeature(-1)}
                    onClick={() => setActiveFeature(index)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setActiveFeature(index);
                      }
                    }}
                  >
                    <div className="landing-feature-top">
                      <span>{feature.number}</span>
                      <Icon size={24} />
                    </div>
                    <h3>{feature.title}</h3>
                    <span className="landing-feature-arrow">
                      <ArrowRight size={16} />
                    </span>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Section 02: platform capabilities grouped by event workflow. */}
      <section
        className="landing-section landing-capabilities"
        id="capabilities"
      >
        <div className="landing-section-index">
          <b>02</b>
          <span>THE PLATFORM</span>
        </div>
        <div className="landing-section-main">
          <Reveal className="landing-section-intro-block">
            <p className="landing-section-kicker">
              ONE WORKSPACE, FROM SETUP TO WRAP-UP
            </p>
            <h2 className="landing-section-title">
              Everything your event <br />
              <span>needs to run.</span>
            </h2>
            <p className="landing-section-intro">
              The practical tools behind a smooth event, connected so your team
              does not have to stitch the operation together themselves.
            </p>
          </Reveal>
          <div className="landing-capability-showcase">
            <div className="landing-capability-stage">
              <div className="landing-capability-radar" aria-hidden="true">
                <i />
                <i />
                <i />
                <span>
                  <CapabilityIcon size={26} />
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCapability}
                  className="landing-capability-detail"
                  initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, x: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <span className="landing-stage-count">
                    CAPABILITY 0{activeCapability + 1}
                  </span>
                  <h3>{capabilityGroups[activeCapability].title}</h3>
                  <p>{capabilityGroups[activeCapability].description}</p>
                  <strong>{capabilityGroups[activeCapability].subtitle}</strong>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="landing-capability-grid">
              {capabilityGroups.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={feature.title}
                    role="button"
                    tabIndex={0}
                    aria-pressed={activeCapability === index}
                    className={`landing-capability ${activeCapability === index ? "is-active" : ""}`}
                    onMouseEnter={() => setActiveCapability(index)}
                    onFocus={() => setActiveCapability(index)}
                    onClick={() => setActiveCapability(index)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setActiveCapability(index);
                      }
                    }}
                  >
                    <span className="landing-capability-icon">
                      <Icon size={18} />
                    </span>
                    <span className="landing-capability-subtitle">
                      {feature.subtitle}
                    </span>
                    <h3>{feature.title}</h3>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Section 03: animated path from setup through event day. */}
      <section
        ref={stepsSectionRef}
        className="landing-section landing-how"
        id="how-it-works"
      >
        <div className="landing-section-index">
          <b>03</b>
          <span>HOW IT WORKS</span>
        </div>
        <div className="landing-section-main">
          <Reveal>
            <p className="landing-section-kicker">
              FROM A PLAN TO A TEAM IN MOTION
            </p>
            <h2 className="landing-section-title">
              A clear path
              <br />
              <span>through event day.</span>
            </h2>
            <p className="landing-section-intro">
              Set the structure once. Keep everyone aligned as the day unfolds.
            </p>
          </Reveal>
          <div
            className={`landing-steps active-step-${activeStep}`}
            style={{ "--step-progress": `${(activeStep / 2) * 100}%` }}
          >
            {[
              {
                number: "01",
                title: "Set the stage",
                text: "Add event details, venues, teams, and the schedule.",
              },
              {
                number: "02",
                title: "Give work an owner",
                text: "Assign duties and tasks to the people doing the work.",
              },
              {
                number: "03",
                title: "Run it together",
                text: "Follow progress, resolve issues, and keep the event moving.",
              },
            ].map((step, index) => (
              <Reveal key={step.number} delay={index * 0.12}>
                <article
                  className={`landing-step ${activeStep === index ? "is-active" : ""} ${index < activeStep ? "is-complete" : ""}`}
                >
                  <span className="landing-step-number">
                    {index < activeStep ? <Check size={16} /> : step.number}
                  </span>
                  <span className="landing-step-dot" />
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                  <span className="landing-step-progress">
                    <i />
                  </span>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Section 04: how Convene supports organizers, leads, and crew members. */}
      <section className="landing-team-band" id="teams">
        <div className="landing-section-index">
          <b>04</b>
          <span>FOR TEAMS</span>
        </div>
        <Reveal className="landing-team-copy">
          <p className="landing-section-kicker">MADE FOR THE WHOLE CREW</p>
          <h2>
            One event.
            <br />
            <span>Every team.</span>
          </h2>
          <p>
            Organizers get the overview. Team leads get a clear handoff. Members
            get the next thing they need to do. Everyone works from the same
            plan.
          </p>
          <Link to="/login" className="landing-inline-link">
            Bring your team into sync <ArrowRight size={16} />
          </Link>
        </Reveal>
        <Reveal className="landing-role-stack" delay={0.12}>
          {[
            {
              icon: ShieldCheck,
              role: "Organizers",
              text: "See the whole operation",
            },
            {
              icon: Users,
              role: "Team leads",
              text: "Coordinate people and shifts",
            },
            {
              icon: ClipboardList,
              role: "Crew members",
              text: "Know what is next",
            },
          ].map(({ icon: Icon, role, text }, i) => (
            <div className="landing-role-card" key={role}>
              <span className={`landing-role-icon role-${i}`}>
                <Icon size={17} />
              </span>
              <span>
                <b>{role}</b>
                <small>{text}</small>
              </span>
              <Check size={15} className="landing-role-check" />
            </div>
          ))}
        </Reveal>
      </section>

      {/* Section 05: benefits and animated connected-work orbit. */}
      <section className="landing-section landing-why" id="why-us">
        <div className="landing-section-index">
          <b>05</b>
          <span>WHY CONVENE</span>
        </div>
        <div className="landing-why-content">
          <Reveal className="landing-why-copy">
            <p className="landing-section-kicker">CALM IN THE COMPLEXITY</p>
            <h2 className="landing-section-title">
              Less chasing.
              <br />
              <span>More doing.</span>
            </h2>
            <p className="landing-section-intro">
              When plans change, the whole team should be able to move with
              them. Convene keeps the details close, the handoffs clear, and the
              people doing the work in the loop.
            </p>
            <p className="landing-why-extra">
              A change to the schedule should not live in one chat. A task
              should not disappear into a spreadsheet. Convene keeps the context
              connected, so decisions turn into action.
            </p>
            <ul className="landing-proof-list">
              <li>
                <Check size={15} /> One live source of truth for the event
              </li>
              <li>
                <Check size={15} /> Clear ownership across teams and tasks
              </li>
              <li>
                <Check size={15} /> Issues surfaced with context, not noise
              </li>
            </ul>
          </Reveal>
          <Reveal className="landing-why-visual" delay={0.12}>
            <div className="landing-orbit orbit-a" />
            <div className="landing-orbit orbit-b" />
            <div className="landing-why-core">
              <span>
                <ConveneMark size={30} />
              </span>
              <b>
                One team.
                <br />
                In sync.
              </b>
            </div>
            <div className="landing-orbit-contents">
              {orbitFeatures.map(({ icon: Icon, label, position }) => (
                <div className={`landing-orbit-item ${position}`} key={label}>
                  <div className="landing-orbit-item-inner">
                    <span className="landing-orbit-node">
                      <Icon size={17} />
                    </span>
                    <span className="landing-orbit-label">{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Closing call to action. */}
      <section className="landing-closing">
        <Reveal className="landing-closing-inner">
          <span className="landing-section-kicker">
            READY WHEN YOUR TEAM IS
          </span>
          <h2>
            Make the moving parts
            <br />
            <span>move together.</span>
          </h2>
          <p>Give your next event a clearer way to run.</p>
          <Link to="/login" className="landing-primary-button">
            Explore Convene <ArrowRight size={17} />
          </Link>
        </Reveal>
        <div className="landing-closing-mark" aria-hidden="true">
          C
        </div>
      </section>

      {/* Footer brand and return-to-top link. */}
      <footer className="landing-footer">
        <a className="landing-brand" href="#top">
          <span className="landing-brand-mark">
            <ConveneMark size={17} />
          </span>
          <span>convene</span>
        </a>
        <span>Thoughtfully coordinated events.</span>
        <a href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}
