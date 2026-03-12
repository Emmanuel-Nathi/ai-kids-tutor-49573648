// Multi-curriculum context provider for Cambridge, CAPS, and IEB

interface CurriculumMap {
  [grade: string]: {
    phase: string;
    subjects: Record<string, string[]>;
  };
}

// ─── Cambridge International Curriculum ───
const cambridgeMap: CurriculumMap = {
  "1": { phase: "Key Stage 1", subjects: { math: ["Number Bonds", "Part-Whole Model", "Place Value to 20", "Addition & Subtraction within 20"], english: ["Phonics", "CVC Words", "Simple Sentences", "Reading Comprehension"], science: ["Living Things", "Materials", "Seasons"], general: ["Cambridge Learner Attributes: Inquirers"] } },
  "2": { phase: "Key Stage 1", subjects: { math: ["Place Value to 100", "Multiplication Concepts", "Fractions (halves/quarters)", "Measurement"], english: ["Sentence Structure", "Punctuation", "Story Writing", "Comprehension"], science: ["Plants", "Animals", "Light & Dark"], general: ["Cambridge Learner Attributes: Thinkers"] } },
  "3": { phase: "Lower Key Stage 2", subjects: { math: ["Place Value to 1000", "Written Addition/Subtraction", "Fractions", "Time", "Data Handling"], english: ["Grammar & Punctuation", "Paragraphs", "Poetry", "Non-fiction Writing"], science: ["Rocks & Soils", "Forces & Magnets", "Light", "Plants"], general: ["Cambridge Learner Attributes: Communicators"] } },
  "4": { phase: "Lower Key Stage 2", subjects: { math: ["Multiplication Tables", "Decimals", "Area & Perimeter", "Angles"], english: ["Expanded Noun Phrases", "Fronted Adverbials", "Narrative Writing"], science: ["Sound", "Electricity", "Digestive System", "States of Matter"], general: ["Cambridge Learner Attributes: Collaborators"] } },
  "5": { phase: "Upper Key Stage 2", subjects: { math: ["Long Division", "Fractions/Decimals/Percentages", "Volume", "Coordinates"], english: ["Relative Clauses", "Cohesive Devices", "Persuasive Writing"], science: ["Forces", "Earth & Space", "Life Cycles", "Properties of Materials"], general: ["Cambridge Learner Attributes: Reflective"] } },
  "6": { phase: "Upper Key Stage 2", subjects: { math: ["Ratio & Proportion", "Algebra Introduction", "Statistics", "Geometry"], english: ["Formal/Informal Writing", "Active/Passive Voice", "Debate & Discussion"], science: ["Classification", "Circuits", "Evolution", "Light"], general: ["Cambridge Checkpoint Preparation"] } },
  "7": { phase: "Key Stage 3", subjects: { math: ["Algebraic Expressions", "Integers", "Sequences", "Transformations"], english: ["Literary Analysis", "Persuasive Techniques", "Shakespeare Introduction"], science: ["Cells", "Atoms & Elements", "Forces & Energy"], general: ["Cambridge Lower Secondary"] } },
  "8": { phase: "Key Stage 3", subjects: { math: ["Linear Equations", "Pythagoras Introduction", "Probability", "Constructions"], english: ["Analytical Writing", "Poetry Analysis", "Media Texts"], science: ["Periodic Table", "Reproduction", "Waves", "Chemical Reactions"], general: ["Cambridge Lower Secondary"] } },
  "9": { phase: "Key Stage 3", subjects: { math: ["Simultaneous Equations", "Trigonometry Basics", "Standard Form", "Inequalities"], english: ["Critical Analysis", "Comparative Writing", "Speech Writing"], science: ["Genetics", "Electromagnetism", "Rate of Reaction"], general: ["Cambridge Checkpoint Exams"] } },
  "10": { phase: "Key Stage 4 (IGCSE)", subjects: { math: ["Quadratics", "Circle Theorems", "Vectors", "Functions"], english: ["IGCSE Literature", "Directed Writing", "Argumentative Essays"], science: ["IGCSE Biology/Chemistry/Physics Syllabi"], general: ["IGCSE Exam Preparation"] } },
  "11": { phase: "Key Stage 4 (IGCSE)", subjects: { math: ["Calculus Introduction", "Advanced Probability", "Matrices"], english: ["Coursework Preparation", "Unseen Poetry", "Critical Commentary"], science: ["Extended IGCSE Content", "Practical Skills"], general: ["IGCSE Final Exams"] } },
  "12": { phase: "Key Stage 5 (AS/A Level)", subjects: { math: ["Pure Mathematics", "Statistics & Mechanics", "Further Maths"], english: ["A Level Literature", "Comparative Studies", "Independent Research"], science: ["A Level Biology/Chemistry/Physics"], general: ["University Preparation"] } },
};

// ─── CAPS (South African National Curriculum) ───
const capsMap: CurriculumMap = {
  "1": { phase: "Foundation Phase", subjects: { math: ["Number Concepts 1-20", "Patterns", "Space & Shape", "Measurement"], english: ["Home Language Literacy", "Phonemic Awareness", "Emergent Reading"], science: ["Beginning Knowledge: Natural Sciences"], general: ["Life Skills", "Life Orientation"], life_orientation: ["Health & Safety", "Social Responsibility"], natural_sciences: ["Planet Earth", "Living Things"] } },
  "2": { phase: "Foundation Phase", subjects: { math: ["Number Concepts 1-99", "Addition & Subtraction", "Money", "Time"], english: ["Reading & Viewing", "Writing & Presenting", "Handwriting"], science: ["Natural Sciences & Technology"], general: ["Life Skills"], life_orientation: ["Physical Development", "Creative Arts"], natural_sciences: ["Matter & Materials", "Energy & Change"] } },
  "3": { phase: "Foundation Phase", subjects: { math: ["Number Concepts 1-999", "Multiplication", "Division", "Common Fractions"], english: ["Language Structures", "Creative Writing", "Oral Communication"], science: ["Natural Sciences & Technology"], general: ["Life Skills", "End of Foundation Phase Assessment"], life_orientation: ["Personal & Social Well-being"], natural_sciences: ["Life & Living", "Matter & Materials"] } },
  "4": { phase: "Intermediate Phase", subjects: { math: ["Whole Numbers to 10 000", "Common Fractions", "Decimal Fractions", "Capacity/Volume"], english: ["FAL: First Additional Language Skills", "Reading Strategies", "Grammar & Spelling"], science: ["Natural Sciences & Technology: Formal Introduction"], general: ["Social Sciences (History & Geography)"], life_orientation: ["Development of Self", "Health & Environmental Responsibility"], natural_sciences: ["Living & Non-living Things", "Energy & Change", "Planet Earth & Beyond"] } },
  "5": { phase: "Intermediate Phase", subjects: { math: ["Whole Numbers to 100 000", "Percentages", "Area", "Data Handling"], english: ["Comprehension", "Transactional Writing", "Visual Literacy"], science: ["Scientific Process Skills", "Ecosystems"], general: ["Social Sciences", "Economic & Management Sciences"], life_orientation: ["Constitutional Rights", "Study Skills"], natural_sciences: ["Biodiversity", "Processing Materials", "Forces"] } },
  "6": { phase: "Intermediate Phase", subjects: { math: ["Whole Numbers to 9-digit", "Ratio & Rate", "Transformation Geometry"], english: ["Literature Study", "Language Conventions", "Oral Presentations"], science: ["Natural Sciences & Technology: Consolidation"], general: ["ANA Preparation", "Social Sciences"], life_orientation: ["Peer Pressure", "Goal Setting"], natural_sciences: ["Photosynthesis", "Electric Circuits", "The Solar System"] } },
  "7": { phase: "Senior Phase", subjects: { math: ["Integers", "Algebraic Expressions", "Geometry of 2D Shapes", "Probability"], english: ["Literary Genres", "Essay Writing", "Comprehension & Summary"], science: ["Natural Sciences (Formal)"], general: ["Economic & Management Sciences", "Technology"], life_orientation: ["Self-image & Media", "Human Rights"], natural_sciences: ["Biodiversity", "Properties of Materials", "Acids & Bases"] } },
  "8": { phase: "Senior Phase", subjects: { math: ["Algebraic Equations", "Theorem of Pythagoras", "Functions & Relationships"], english: ["Transactional Texts", "Poetry", "Critical Language Awareness"], science: ["Particle Model of Matter", "Chemical Reactions"], general: ["Social Sciences", "Arts & Culture"], life_orientation: ["Substance Abuse", "Career Awareness"], natural_sciences: ["Reactions in Everyday Life", "Light & Sound"] } },
  "9": { phase: "Senior Phase", subjects: { math: ["Number Patterns", "Geometry of 3D Shapes", "Surface Area & Volume", "Data Handling"], english: ["Film Study", "Creative & Transactional Writing", "Debate"], science: ["Systems in the Human Body", "Forces & Energy"], general: ["GET Exit Level Assessment"], life_orientation: ["Democracy & Citizenship", "Study Skills for FET"], natural_sciences: ["Electric Cells & Circuits", "Compounds", "Earth & Beyond"] } },
  "10": { phase: "FET Phase", subjects: { math: ["Functions (Linear, Quadratic, Hyperbola)", "Euclidean Geometry", "Trigonometry", "Statistics"], english: ["Literature: Novel, Poetry, Drama", "Transactional Writing", "Visual Literacy"], science: ["Physical Sciences: Mechanics, Waves", "Life Sciences: Chemistry of Life"], general: ["Accounting", "Business Studies", "Geography"], life_orientation: ["Development of Self in Society", "Career & Career Choices"], natural_sciences: ["Covered under Physical Sciences & Life Sciences"] } },
  "11": { phase: "FET Phase", subjects: { math: ["Quadratic Functions", "Financial Maths", "Measurement", "Probability"], english: ["Comparative Essay", "Contextual Questions", "Oral Assessment"], science: ["Physical Sciences: Electricity, Chemical Change", "Life Sciences: Animal Nutrition, Gaseous Exchange"], general: ["PAT Projects", "Controlled Tests"], life_orientation: ["Responsible Citizenship", "Environmental Issues"], natural_sciences: ["Covered under Physical Sciences & Life Sciences"] } },
  "12": { phase: "FET Phase (Matric)", subjects: { math: ["Differential Calculus", "Sequences & Series", "Counting & Probability"], english: ["NSC Exam Preparation", "Paper 1, 2, 3 Practice"], science: ["Physical Sciences: Organic Chemistry, Electrochemistry", "Life Sciences: DNA, Evolution, Human Impact"], general: ["NSC Final Exams", "Matric Preparation"], life_orientation: ["Plans for Post-school Life", "Physical Fitness Programme"], natural_sciences: ["Covered under Physical Sciences & Life Sciences"] } },
};

// ─── IEB (Independent Examinations Board — South Africa) ───
const iebMap: CurriculumMap = {
  "1": { phase: "Foundation Phase", subjects: { math: ["Number Sense", "Patterns", "Shape & Space", "Measurement", "Data Handling"], english: ["Literacy: Phonics & Sight Words", "Creative Expression", "Listening & Speaking"], science: ["Natural Sciences & Technology Exploration"], general: ["Life Skills", "Inquiry-Based Learning"] } },
  "2": { phase: "Foundation Phase", subjects: { math: ["Number Concepts to 100", "Problem Solving Strategies", "Spatial Reasoning"], english: ["Independent Reading", "Writing Process", "Oral Presentations"], science: ["Observing & Recording", "Living & Non-living"], general: ["Creative Arts", "Critical Thinking Introduction"] } },
  "3": { phase: "Foundation Phase", subjects: { math: ["Number Concepts to 1000", "Fractions", "Multiplication & Division", "Symmetry"], english: ["Comprehension Strategies", "Creative & Factual Writing", "Phonics Mastery"], science: ["Simple Investigations", "Materials & Change"], general: ["Foundation Phase Exit Assessment"] } },
  "4": { phase: "Intermediate Phase", subjects: { math: ["Advanced Problem Solving", "Fractions & Decimals", "Geometry", "Data Analysis"], english: ["Analytical Reading", "Structured Writing", "Grammar in Context"], science: ["Scientific Method", "Living Systems"], general: ["Project-Based Inquiry", "Thinking Skills"] } },
  "5": { phase: "Intermediate Phase", subjects: { math: ["Ratio", "Percentages", "Algebraic Thinking", "Transformations"], english: ["Genre Study", "Argumentative Writing", "Research Skills"], science: ["Ecosystems", "Energy", "Earth Science"], general: ["Independent Research Projects", "Higher-Order Thinking"] } },
  "6": { phase: "Intermediate Phase", subjects: { math: ["Pre-Algebra", "Advanced Geometry", "Statistics & Probability"], english: ["Critical Literacy", "Multi-modal Texts", "Debating"], science: ["Chemical & Physical Change", "Forces"], general: ["IEB Common Assessment", "Analytical Skills"] } },
  "7": { phase: "Senior Phase", subjects: { math: ["Integers & Algebra", "Euclidean Geometry Foundations", "Functions"], english: ["Literary Analysis", "Essay Writing", "Media Studies"], science: ["Particle Theory", "Chemical Reactions", "Biodiversity"], general: ["Research Methodology", "Critical Analysis"] } },
  "8": { phase: "Senior Phase", subjects: { math: ["Equations & Inequalities", "Geometry Proofs", "Data & Probability"], english: ["Comparative Analysis", "Poetry & Prose Study", "Oral Skills"], science: ["Human Body Systems", "Electricity", "Ecology"], general: ["Extended Projects", "Analytical Thinking"] } },
  "9": { phase: "Senior Phase", subjects: { math: ["Advanced Algebra", "Trigonometry Introduction", "3D Geometry"], english: ["Film & Visual Texts", "Creative Portfolio", "Critical Evaluation"], science: ["Chemical Bonding", "Energy Transfer", "Genetics Intro"], general: ["IEB Senior Phase Exit Assessment"] } },
  "10": { phase: "FET Phase", subjects: { math: ["Functions & Graphs", "Analytical Geometry", "Trigonometry", "Statistics"], english: ["IEB Literature Paper", "Transactional & Essay Writing", "Oral Assessment"], science: ["Physical Sciences: Mechanics", "Life Sciences: Molecules to Organs"], general: ["Inquiry-Based Learning", "IEB Analytical Exam Style"] } },
  "11": { phase: "FET Phase", subjects: { math: ["Quadratic Theory", "Financial Maths", "Measurement & Probability"], english: ["Comparative Literary Essay", "Critical Analysis", "Language in Context"], science: ["Physical Sciences: Waves & Electricity", "Life Sciences: Animal Systems"], general: ["Research Task (IEB Requirement)", "PAT Projects"] } },
  "12": { phase: "FET Phase (Matric — IEB)", subjects: { math: ["Calculus", "Sequences & Series", "Counting Principles"], english: ["IEB Paper 1, 2, 3 Exam Prep", "Unseen Poetry", "Visual Literacy"], science: ["Physical Sciences: Organic Chemistry, Electrochem", "Life Sciences: Evolution, Genetics, Human Impact"], general: ["IEB Final Exams", "Distinction-level Analytical Prep"] } },
};

const curriculumMaps: Record<string, CurriculumMap> = {
  cambridge: cambridgeMap,
  caps: capsMap,
  ieb: iebMap,
};

// ─── Language Support ───
const languageTerms: Record<string, Record<string, Record<string, string>>> = {
  afrikaans: {
    math: { addition: "optel", subtraction: "aftrek", multiplication: "vermenigvuldiging", division: "deling", fraction: "breuk", equation: "vergelyking", geometry: "meetkunde", algebra: "algebra", number: "getal", pattern: "patroon" },
    english: { reading: "lees", writing: "skryf", grammar: "grammatika", comprehension: "begrip", vocabulary: "woordeskat", paragraph: "paragraaf", sentence: "sin" },
    science: { experiment: "eksperiment", observation: "waarneming", hypothesis: "hipotese", energy: "energie", force: "krag", matter: "materie", cell: "sel", ecosystem: "ekosisteem" },
    general: { learning: "leer", study: "studeer", question: "vraag", answer: "antwoord", test: "toets", homework: "huiswerk" },
  },
  isizulu: {
    math: { addition: "ukuhlanganisa", subtraction: "ukususa", multiplication: "ukuphindaphinda", division: "ukuhlukanisa", fraction: "ingxenye", number: "inombolo", pattern: "iphethini" },
    english: { reading: "ukufunda", writing: "ukubhala", grammar: "uhlelo lolimi", comprehension: "ukuqonda", vocabulary: "amagama", sentence: "umusho" },
    science: { experiment: "umfanekiso", observation: "ukubuka", energy: "amandla", force: "umfutho", matter: "into", cell: "iseli" },
    general: { learning: "ukufunda", study: "ukutadisha", question: "umbuzo", answer: "impendulo", test: "isivivinyo", homework: "umsebenzi wasekhaya" },
  },
};

export function getCurriculumContext(
  grade: string,
  subject: string,
  curriculum: string = "cambridge",
  preferredLanguage: string = "english"
): string {
  const map = curriculumMaps[curriculum] || curriculumMaps.cambridge;
  const gradeData = map[grade];
  if (!gradeData) return "";

  const curriculumLabel = curriculum === "cambridge" ? "Cambridge International" : curriculum === "caps" ? "CAPS (South African National)" : "IEB (South African Independent)";
  const phaseLabel = gradeData.phase;
  const subjectTopics = gradeData.subjects[subject] || gradeData.subjects["general"] || [];

  let context = `CURRICULUM: ${curriculumLabel}\nPHASE: ${phaseLabel} — Grade/Year ${grade}\n`;

  if (curriculum === "cambridge") {
    context += `Use Cambridge "Key Stage" terminology. Focus on problem-solving and inquiry-based learning.\n`;
  } else if (curriculum === "caps") {
    context += `Use CAPS "Phase" terminology (Foundation, Intermediate, Senior, FET). Follow structured sequential learning. Include South African context and examples where possible.\n`;
    if (gradeData.subjects["life_orientation"]) {
      context += `Life Orientation topics for this grade: ${gradeData.subjects["life_orientation"].join(", ")}.\n`;
    }
    if (gradeData.subjects["natural_sciences"]) {
      context += `Natural Sciences topics: ${gradeData.subjects["natural_sciences"].join(", ")}.\n`;
    }
  } else if (curriculum === "ieb") {
    context += `Use IEB "Phase" terminology. Prioritize higher-order thinking, analytical reasoning, and project-based inquiry. Prepare for IEB-style analytical exam questions.\n`;
  }

  context += `RELEVANT TOPICS for ${subject}: ${subjectTopics.join(", ")}.\n`;
  context += `Guide the student using age-appropriate language for Grade ${grade} (${phaseLabel}).`;

  if (preferredLanguage !== "english" && languageTerms[preferredLanguage]) {
    const terms = languageTerms[preferredLanguage][subject] || languageTerms[preferredLanguage]["general"] || {};
    const termsList = Object.entries(terms).map(([en, tr]) => `${en} = ${tr}`).join(", ");
    context += `\n\nLANGUAGE SUPPORT (${preferredLanguage}): When helpful, provide key terms in ${preferredLanguage} alongside English. Key translations: ${termsList}.`;
  }

  return context;
}
