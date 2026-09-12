import type { Content } from "./types";

/* ==================================================================================
   — CONTENT —  Everything a visitor reads lives here. Edit ONLY this file.
   Placeholders are marked [EDIT]. Replace them with the truth — do not ship invented
   achievements, and delete any item you cannot back up.
   ================================================================================== */
export const CONTENT: Content = {
  name: "Areej Nawaz",
  role: "Computer Science student",
  tagline: "Translating rigorous computational logic into striking visual experiences.",
  heroTagline: "Come for the portfolio, stay for the questionable design decisions.",

  links: {
    github: "https://github.com/areejBug",
    linkedin: "https://www.linkedin.com/in/areej-nawaz-6407a034a/",
    email: "areejn.2006@gmail.com",
  },

  /* --- ABOUT --- */
  aboutIntro: [
    "a Computer Science undergraduate at FAST-NUCES who believes that true computational enlightenment usually requires surviving a few segmentation faults along the way.",
  ],
  sysSpecs: [
    [
      "Core Disciplines",
      "Advanced Object-Oriented Programming, Systems Architecture, and Computational Mathematics.",
    ],
    [
      "The Laboratory",
      "Visual Studio for surgical debugging, and Git for orchestrating collaborative codebases (and gracefully untangling the inevitable merge conflicts).",
    ],
    [
      "Active Directives",
      "Engineering autonomous AI diagnostic tools, designing hierarchical database structures from scratch, and deploying retro-inspired digital portfolios via Vercel.",
    ],
  ],

  /* --- PROJECTS: the heart of the portfolio. folder drives the Explorer tree. --- */
  projects: [
    {
      id: "sehat-ai",
      name: "Sehat AI: Autonomous Health Agent",
      folder: "AUTONOMOUS_AGENTS",
      quote:
        "Why doom-scroll WebMD when you can just talk to an autonomous agent that translates your symptoms?",
      description:
        "An AI-driven healthcare diagnostic tool developed during a collaborative hackathon. Engineered with functional project logic to ingest raw audio, execute speech-to-text conversion, and seamlessly translate the input. The system queries medical datasets to generate comprehensive disease details. Built with robust API integrations and fully optimized for local deployment.",
      featured: true,
      repo: "",
      video: "/videos/Sehat.webm",
      shots: [],
    },
    {
      id: "master-of-whisperers",
      name: "Master of Whisperers: Unweaving the Audio",
      folder: "COMPUTATIONAL_ENGINES",
      quote: "Why rely on magic when you can build a Fast Fourier Transform from scratch?",
      description:
        'A custom Digital Signal Processing (DSP) engine built to intercept and manipulate raw .wav byte streams. Features a custom math engine utilizing the Cooley-Tukey Radix-2 algorithm to convert time-domain audio into the frequency domain. Includes complex frequency isolation (low, high, and band-pass filtering), track mixing, and hard splicing—all engineered entirely without standard libraries.',
      featured: false,
      repo: "https://github.com/areejBug/MasterOfWhispers",
      video: "/videos/Master_Of_Whispers.mp4",
      shots: [],
    },
    {
      id: "suparco-legacy",
      name: "SUPARCO Legacy: The Dancing Satellites",
      folder: "COMPUTATIONAL_ENGINES",
      quote: "Reverse-engineering a lost 2014 orbital tracking system using only math and ASCII.",
      description:
        "A 3D-to-2D projection engine built to visualize Pakistan Navigation Satellite System constellations. Utilizing Bresenham's line algorithm from 1965 and perspective mathematics to render spatial orbital data directly onto a terminal plane.",
      featured: true,
      repo: "https://github.com/areejBug/SuparcoLegacy",
      video: "/videos/Suparco_Legacy.mp4",
      shots: [],
    },
    {
      id: "hollywood-archive",
      name: "Hollywood Archive: The Custom Vault",
      folder: "POINTER_MECHANICS",
      quote:
        "A database so interconnected, recasting a lead actor requires a manual structural rebalancing.",
      description:
        'A high-performance, custom-built hierarchical database architecture replacing standard structures with dynamic "Conductor" and "Ledger" Vaults. Manages a complex, mutual web of raw pointers between Actors and Movies. Enforces strict relational integrity, memory compaction, and asymmetric rival-conflict detection on the fly.',
      featured: false,
      repo: "https://github.com/areejBug/HollywoodArchive",
      video: "/videos/Hollywood_Archive.mp4",
      shots: [],
    },
    {
      id: "memory-archivist",
      name: "Memory Archivist: Pointers, Pain, and Persistence",
      folder: "POINTER_MECHANICS",
      quote: "A version control system where the array indexing operator [] is strictly forbidden.",
      description:
        "A robust string manipulation engine and dual-layer version control system built entirely on pointer arithmetic. Features time-traveling undo states, persistent file logging, and manual garbage collection to ensure zero memory leaks.",
      featured: true,
      repo: "https://github.com/areejBug/MemoryArchivist",
      video: "/videos/Memory_Archive.mp4",
      shots: [],
    },
    {
      id: "aethelgard-simulator",
      name: "Aethelgard Simulator: Deterministic Destiny",
      folder: "OOP_ARCHITECTURES",
      quote:
        "Simulating a continent's political collapse while manually resolving diamond inheritance problems.",
      description:
        "A massive, deterministic geopolitical and combat simulation engine built strictly without the Standard Template Library (STL) or virtual functions. Demonstrates absolute mastery over raw dynamic memory management, deep inheritance hierarchies, static binding, and resolving complex multi-lineage architectural ambiguities.",
      featured: false,
      repo: "https://github.com/areejBug/AethalgardSimulator",
      video: "/videos/Aethelgard_Simulator.mp4",
      shots: [],
    },
    {
      id: "pcb-management-system",
      name: "PCB Management System: Data-Driven Cricket",
      folder: "OOP_ARCHITECTURES",
      quote:
        "Fixing the national team's batting order using overloaded operators and composite scoring algorithms.",
      description:
        "A comprehensive simulation and management engine for the ICC T20 World Cup 2026. Features dynamic .csv data parsing, a rigorous constraint-based squad selection system, and an automated pre-match training scheduler that algorithmically balances player form, fatigue ceilings, and mentorship bonuses.",
      featured: false,
      repo: "https://github.com/areejBug/PCBManagementSystem",
      video: "/videos/PCB_Management_System.mp4",
      shots: [],
    },
  ],

  skills: [
    ["Programming", ["C++", "Python", "Algorithms", "Problem Solving"]],
    ["Systems & Logic", ["Pointers", "DMA", "Recursion", "OOP", "Data Structures"]],
    ["Data", ["Pandas", "Network Analysis", "Data Processing"]],
    ["Creative Development", ["UI Design", "Interactive Experiences", "Visual Concepts"]],
    ["Web", ["HTML", "CSS", "JavaScript"]],
  ],
};
