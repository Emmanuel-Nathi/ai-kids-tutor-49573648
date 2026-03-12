// Cambridge International Curriculum context by grade and subject

interface SubjectContext {
  terminology: string[];
  topics: string[];
  approach: string;
}

interface GradeContext {
  level: string;
  maths: SubjectContext;
  english: SubjectContext;
  science: SubjectContext;
  ict: SubjectContext;
  general: SubjectContext;
}

const curriculumMap: Record<string, GradeContext> = {
  "1": {
    level: "Primary (Stage 1)",
    maths: {
      terminology: ["Number Bonds", "Part-Whole Model", "Tens Frame", "Number Line", "More Than / Less Than"],
      topics: ["Counting to 100", "Addition within 20", "Subtraction within 20", "Shapes (2D)", "Comparing lengths"],
      approach: "Use concrete objects and pictures. Focus on counting, grouping, and simple patterns.",
    },
    english: {
      terminology: ["Phonics", "CVC Words", "Blending", "Segmenting", "High-Frequency Words"],
      topics: ["Letter sounds", "Simple sentences", "Capital letters and full stops", "Listening comprehension"],
      approach: "Sound out words together. Encourage reading aloud. Praise attempts at writing.",
    },
    science: {
      terminology: ["Living Things", "Materials", "Senses", "Observe", "Describe"],
      topics: ["Plants and animals", "Everyday materials", "Using our senses", "Seasons"],
      approach: "Connect to what the child sees every day. Ask 'What do you notice?' questions.",
    },
    ict: {
      terminology: ["Keyboard", "Mouse", "Screen", "Click", "Program"],
      topics: ["Using a computer", "Simple instructions", "Following sequences"],
      approach: "Keep it playful. Relate to games and simple step-by-step instructions.",
    },
    general: {
      terminology: ["Community", "Family", "Environment", "Respect", "Curiosity"],
      topics: ["Myself and others", "My school", "My neighbourhood"],
      approach: "Encourage reflection on personal experiences. Build communication skills.",
    },
  },
  "2": {
    level: "Primary (Stage 2)",
    maths: {
      terminology: ["Number Bonds to 20", "Place Value", "Tens and Ones", "Number Sentences", "Halving", "Doubling"],
      topics: ["Addition/subtraction within 100", "Multiplication (2, 5, 10 times tables)", "Fractions (halves, quarters)", "Time (hours, half hours)", "2D and 3D shapes"],
      approach: "Use part-whole models and bar models. Encourage mental calculation strategies.",
    },
    english: {
      terminology: ["Noun", "Verb", "Adjective", "Sentence", "Question Mark", "Exclamation Mark"],
      topics: ["Writing simple stories", "Reading comprehension", "Handwriting", "Expanded noun phrases"],
      approach: "Guide creative expression. Ask about characters and settings in stories.",
    },
    science: {
      terminology: ["Habitat", "Life Cycle", "Waterproof", "Rigid", "Flexible"],
      topics: ["Living things and habitats", "Properties of materials", "Basic forces (push/pull)"],
      approach: "Hands-on thinking. 'What would happen if...?' questions.",
    },
    ict: {
      terminology: ["Algorithm", "Sequence", "Debug", "Input", "Output"],
      topics: ["Simple algorithms", "Creating sequences", "Using software tools"],
      approach: "Think of algorithms as recipes. Step-by-step problem solving.",
    },
    general: {
      terminology: ["Culture", "Tradition", "Responsibility", "Cooperation"],
      topics: ["Communities around the world", "Taking care of our environment"],
      approach: "Compare and contrast different ways of life. Build empathy.",
    },
  },
  "3": {
    level: "Primary (Stage 3)",
    maths: {
      terminology: ["Column Addition", "Column Subtraction", "Array", "Commutative", "Remainder"],
      topics: ["3, 4, 6, 8 times tables", "Written methods for +/-", "Fractions on number line", "Perimeter", "Right angles"],
      approach: "Transition from concrete to pictorial. Use arrays for multiplication.",
    },
    english: {
      terminology: ["Paragraph", "Conjunction", "Adverb", "Preposition", "Inverted Commas"],
      topics: ["Story writing with structure", "Non-fiction texts", "Grammar and punctuation", "Poetry"],
      approach: "Focus on text structure. Guide planning before writing.",
    },
    science: {
      terminology: ["Evaporation", "Condensation", "Skeleton", "Muscle", "Nutrition"],
      topics: ["States of matter basics", "Human body", "Plants and growth", "Light and shadow"],
      approach: "Encourage predictions and simple experiments in thinking.",
    },
    ict: {
      terminology: ["Loop", "Repeat", "Variable", "Data", "Search"],
      topics: ["Repetition in programs", "Collecting data", "Presenting information"],
      approach: "Introduce the idea of efficiency — why loops save time.",
    },
    general: {
      terminology: ["Perspective", "Global", "Sustainability", "Research"],
      topics: ["Water and its importance", "Different perspectives on issues"],
      approach: "Start building research skills. Ask children to consider multiple viewpoints.",
    },
  },
  "4": {
    level: "Primary (Stage 4)",
    maths: {
      terminology: ["Factor", "Multiple", "Equivalent Fractions", "Decimal", "Area"],
      topics: ["All times tables to 12×12", "Equivalent fractions", "Decimals (tenths, hundredths)", "Area and perimeter", "Coordinates"],
      approach: "Link fractions and decimals. Use visual models like fraction walls.",
    },
    english: {
      terminology: ["Clause", "Subordinate Clause", "Fronted Adverbial", "Apostrophe", "Determiner"],
      topics: ["Narrative writing", "Persuasive writing", "Comprehension strategies", "Spelling patterns"],
      approach: "Analyse author's choices. Guide structured writing with clear paragraphs.",
    },
    science: {
      terminology: ["Circuit", "Conductor", "Insulator", "Solid", "Liquid", "Gas", "Digestive System"],
      topics: ["Electricity basics", "States of matter", "Sound", "Teeth and digestion"],
      approach: "Classify and group. Use diagrams to explain processes.",
    },
    ict: {
      terminology: ["Selection", "Condition", "IF-THEN", "Spreadsheet", "Formula"],
      topics: ["Selection in programming", "Using spreadsheets", "Internet safety"],
      approach: "Introduce decision-making in code. Connect to real-life choices.",
    },
    general: {
      terminology: ["Evidence", "Argument", "Impact", "Wellbeing"],
      topics: ["Migration and movement", "Health and wellbeing globally"],
      approach: "Build argumentation skills. Use evidence to support opinions.",
    },
  },
  "5": {
    level: "Primary (Stage 5)",
    maths: {
      terminology: ["Prime Number", "Square Number", "Mixed Number", "Improper Fraction", "Volume", "Translation", "Reflection"],
      topics: ["Prime numbers", "Fractions (add, subtract, multiply)", "Percentages", "Volume", "Angles", "Negative numbers"],
      approach: "Move toward abstract thinking. Encourage multiple solution strategies.",
    },
    english: {
      terminology: ["Relative Clause", "Modal Verb", "Parenthesis", "Cohesion", "Formality"],
      topics: ["Balanced arguments", "Formal/informal writing", "Advanced comprehension", "Figurative language"],
      approach: "Discuss authorial intent. Guide editing and redrafting.",
    },
    science: {
      terminology: ["Force", "Gravity", "Friction", "Air Resistance", "Reversible", "Irreversible", "Puberty"],
      topics: ["Forces and mechanisms", "Properties of materials", "Earth and space", "Life cycles and reproduction"],
      approach: "Design fair tests. Explain cause and effect relationships.",
    },
    ict: {
      terminology: ["Function", "Procedure", "Database", "Record", "Field", "Query"],
      topics: ["Procedures in programming", "Databases", "Digital communication safety"],
      approach: "Break complex problems into sub-problems. Introduce abstraction.",
    },
    general: {
      terminology: ["Bias", "Reliability", "Consequence", "Ethical"],
      topics: ["Trade and economics", "Digital citizenship", "Environmental responsibility"],
      approach: "Critical thinking about sources. Evaluate consequences of actions.",
    },
  },
  "6": {
    level: "Primary (Stage 6)",
    maths: {
      terminology: ["Ratio", "Proportion", "Order of Operations", "Algebra", "Mean", "Pie Chart"],
      topics: ["Ratio and proportion", "Simple algebra", "Statistics (mean, pie charts)", "Geometry (nets, angles)", "Problem solving"],
      approach: "Prepare for secondary. Multi-step problems. Algebraic thinking.",
    },
    english: {
      terminology: ["Active Voice", "Passive Voice", "Subjunctive", "Synonym", "Antonym", "Inference"],
      topics: ["Extended writing across genres", "Critical reading", "Grammar revision", "Speaking and listening"],
      approach: "Refine voice and style. Prepare for checkpoint assessments.",
    },
    science: {
      terminology: ["Classification", "Micro-organism", "Photosynthesis", "Voltage", "Resistance"],
      topics: ["Classification of organisms", "Electricity (voltage, resistance)", "Light (reflection, refraction)", "Evolution basics"],
      approach: "Scientific enquiry methods. Plan investigations. Draw conclusions from data.",
    },
    ict: {
      terminology: ["Algorithm Efficiency", "Decomposition", "Abstraction", "Binary"],
      topics: ["Complex algorithms", "Binary representation", "Web design basics", "Cyber security"],
      approach: "Computational thinking. Decompose complex problems systematically.",
    },
    general: {
      terminology: ["Democracy", "Human Rights", "Globalisation", "Interdependence"],
      topics: ["Global challenges", "Rights and responsibilities", "Preparing for secondary school"],
      approach: "Independent research projects. Present findings with evidence.",
    },
  },
  "7": {
    level: "Lower Secondary (Stage 7)",
    maths: {
      terminology: ["Algebraic Expression", "Linear Equation", "Integer", "Rational Number", "Probability", "Transformation"],
      topics: ["Integers and place value", "Expressions and formulae", "Fractions/decimals/percentages", "Geometry (transformations)", "Probability", "Sequences"],
      approach: "Formal algebraic notation. Link topics together. Justify reasoning.",
    },
    english: {
      terminology: ["Protagonist", "Antagonist", "Narrative Voice", "Rhetoric", "Register", "Connotation"],
      topics: ["Analysing fiction and non-fiction", "Creative writing", "Transactional writing", "Speaking skills"],
      approach: "Close reading techniques. PEE (Point, Evidence, Explain) paragraphs.",
    },
    science: {
      terminology: ["Cell", "Tissue", "Organ", "Element", "Compound", "Mixture", "Energy Transfer"],
      topics: ["Cells and organisms", "Matter and materials", "Energy and forces", "Earth and space"],
      approach: "Link structure to function. Use scientific method explicitly.",
    },
    ict: {
      terminology: ["Pseudocode", "Flowchart", "String", "Integer", "Boolean", "Array"],
      topics: ["Programming fundamentals", "Data types", "Flowcharts and pseudocode", "Networks basics"],
      approach: "Write pseudocode before coding. Trace through algorithms step by step.",
    },
    general: {
      terminology: ["Stakeholder", "Sustainability", "Development", "Cultural Diversity"],
      topics: ["Demographic change", "Sustainability challenges", "Cultural identity"],
      approach: "Research-based learning. Multiple perspectives on global issues.",
    },
  },
  "8": {
    level: "Lower Secondary (Stage 8)",
    maths: {
      terminology: ["Simultaneous Equations", "Quadratic", "Pythagoras", "Trigonometry Basics", "Standard Form", "Compound Interest"],
      topics: ["Linear equations", "Graphs of functions", "Pythagoras' theorem intro", "Compound measures", "Statistical diagrams", "Constructions"],
      approach: "Build fluency with algebra. Connect geometry to real-world problems.",
    },
    english: {
      terminology: ["Theme", "Motif", "Dramatic Irony", "Soliloquy", "Stanza", "Imagery"],
      topics: ["Shakespeare introduction", "Poetry analysis", "Discursive writing", "Media texts"],
      approach: "Explore themes across texts. Develop analytical writing skills.",
    },
    science: {
      terminology: ["Photosynthesis", "Respiration", "Periodic Table", "Chemical Reaction", "Wave", "Frequency"],
      topics: ["Photosynthesis and respiration", "Periodic table", "Chemical reactions", "Waves and sound", "Forces and motion"],
      approach: "Quantitative science. Calculate and interpret data. Lab skills.",
    },
    ict: {
      terminology: ["Iteration", "Nested Loop", "Subroutine", "Parameter", "Validation", "SQL"],
      topics: ["Iteration and selection", "Subroutines", "Databases and SQL", "Cyber security"],
      approach: "Modular programming. Testing and debugging systematically.",
    },
    general: {
      terminology: ["Correlation", "Causation", "Ethics", "Policy"],
      topics: ["Conflict and peace", "Technology and ethics", "Water security"],
      approach: "Distinguish correlation from causation. Evidence-based arguments.",
    },
  },
  "9": {
    level: "Lower Secondary (Stage 9)",
    maths: {
      terminology: ["Inequality", "Quadratic Expression", "Trigonometric Ratio", "Cumulative Frequency", "Upper/Lower Bound"],
      topics: ["Quadratic expressions", "Trigonometry", "Cumulative frequency", "Bounds", "Direct/inverse proportion", "Vectors intro"],
      approach: "IGCSE preparation. Problem-solving across topic areas. Past paper technique.",
    },
    english: {
      terminology: ["Allegory", "Satire", "Pathetic Fallacy", "Unreliable Narrator", "Thesis Statement"],
      topics: ["Extended literary analysis", "Argumentative essays", "IGCSE text types", "Comparative analysis"],
      approach: "Structured essay writing. Thesis-driven arguments. Exam technique.",
    },
    science: {
      terminology: ["Mole", "Atomic Structure", "Covalent Bond", "Ecosystem", "Natural Selection", "Electromagnetic Spectrum"],
      topics: ["Atomic structure", "Bonding", "Ecosystems", "Genetics basics", "Electromagnetic spectrum", "Energy resources"],
      approach: "IGCSE foundations. Link theory to applications. Practice calculations.",
    },
    ict: {
      terminology: ["Object-Oriented", "Class", "Method", "Inheritance", "Encryption", "Protocol"],
      topics: ["OOP concepts", "Advanced data structures", "Network protocols", "Ethical computing"],
      approach: "Design before code. Use OOP principles. Consider ethical implications.",
    },
    general: {
      terminology: ["Geopolitics", "Economic Inequality", "Media Literacy", "Critical Analysis"],
      topics: ["Global economics", "Media and information literacy", "Individual project preparation"],
      approach: "Independent research. Critical evaluation of sources. Present balanced views.",
    },
  },
  "10": {
    level: "Upper Secondary (IGCSE Year 1)",
    maths: {
      terminology: ["Quadratic Formula", "Completing the Square", "Sine Rule", "Cosine Rule", "Histogram", "Differentiation"],
      topics: ["Quadratic equations", "Trigonometry (sine/cosine rules)", "Circle theorems", "Probability", "Statistics", "Functions"],
      approach: "IGCSE exam focus. Past paper practice. Show full working for marks.",
    },
    english: {
      terminology: ["Writer's Craft", "Discourse Markers", "Juxtaposition", "Ambiguity", "Audience Awareness"],
      topics: ["IGCSE Literature set texts", "Directed writing", "Composition", "Summary and note-making"],
      approach: "Exam technique: time management, question decoding, PEA/PEEL paragraphs.",
    },
    science: {
      terminology: ["Rate of Reaction", "Equilibrium", "Hormones", "Homeostasis", "Momentum", "Radioactivity"],
      topics: ["Rates of reaction", "Organic chemistry intro", "Hormones and homeostasis", "Electricity", "Nuclear physics"],
      approach: "IGCSE specification coverage. Command word understanding. Extended response practice.",
    },
    ict: {
      terminology: ["Normalisation", "Entity Relationship", "TCP/IP", "Fetch-Execute Cycle", "Logic Gate"],
      topics: ["Database design", "Computer architecture", "Networking", "Web development"],
      approach: "Theory and practical balance. Past paper questions. Diagram skills.",
    },
    general: {
      terminology: ["Research Methodology", "Primary Source", "Secondary Source", "Hypothesis"],
      topics: ["Individual research project", "Cross-cultural studies", "Global perspectives coursework"],
      approach: "Coursework methodology. Harvard referencing. Structured research.",
    },
  },
  "11": {
    level: "Upper Secondary (IGCSE Year 2)",
    maths: {
      terminology: ["Matrix", "Set Notation", "Venn Diagram", "Upper Bound", "Lower Bound", "Vector Geometry"],
      topics: ["Matrices", "Sets and Venn diagrams", "Advanced probability", "Calculus intro", "IGCSE revision"],
      approach: "Exam readiness. Timed practice. Common mistake awareness. Grade boundary targets.",
    },
    english: {
      terminology: ["Critical Essay", "Textual Analysis", "Authorial Purpose", "Stylistic Choices"],
      topics: ["IGCSE exam preparation", "Unseen text analysis", "Extended writing under timed conditions"],
      approach: "Final exam preparation. Focus on weak areas. Model answers analysis.",
    },
    science: {
      terminology: ["Electrolysis", "Genetic Engineering", "Half-life", "Electromagnetic Induction"],
      topics: ["IGCSE revision across all topics", "Practical skills assessment", "Extended experimental investigations"],
      approach: "Revision strategies. Topic-by-topic consolidation. Exam question practice.",
    },
    ict: {
      terminology: ["System Life Cycle", "Testing Strategy", "Trace Table", "Big O Notation"],
      topics: ["System design", "Testing", "IGCSE practical preparation", "Pre-AS level concepts"],
      approach: "Complete projects. Systematic testing. Prepare for AS Level transition.",
    },
    general: {
      terminology: ["Synthesis", "Evaluation", "Recommendation", "Reflection"],
      topics: ["Team project", "Global perspectives exam preparation", "Portfolio completion"],
      approach: "Synthesise learning. Reflective practice. Exam preparation.",
    },
  },
  "12": {
    level: "Upper Secondary (AS/A Level Year 1)",
    maths: {
      terminology: ["Differentiation", "Integration", "Complex Numbers", "Binomial Theorem", "Normal Distribution"],
      topics: ["Pure mathematics", "Statistics", "Mechanics", "Further mathematics topics"],
      approach: "University preparation. Rigorous mathematical proof. Extended problem solving.",
    },
    english: {
      terminology: ["Literary Criticism", "Post-colonial", "Feminist Reading", "Contextual Analysis"],
      topics: ["AS Level Literature", "Language analysis", "Comparative essays", "Coursework"],
      approach: "Critical theory introduction. Independent analysis. Academic writing.",
    },
    science: {
      terminology: ["Enthalpy", "Entropy", "Action Potential", "Quantum", "Field Theory"],
      topics: ["AS Level content across sciences", "Practical endorsement", "Research skills"],
      approach: "University-level thinking. Independent research. Scientific paper reading.",
    },
    ict: {
      terminology: ["Recursion", "Stack", "Queue", "Hashing", "Sorting Algorithm", "Computational Complexity"],
      topics: ["AS Level Computer Science", "Advanced programming", "Theory of computation"],
      approach: "Abstract thinking. Algorithm analysis. Prepare for university CS.",
    },
    general: {
      terminology: ["Epistemology", "Paradigm", "Interdisciplinary", "Metacognition"],
      topics: ["Global Perspectives AS", "Research report", "Presentation skills"],
      approach: "Academic rigour. Cross-disciplinary connections. Self-directed learning.",
    },
  },
};

export function getCurriculumContext(grade: string, subject: string): string {
  const gradeCtx = curriculumMap[grade];
  if (!gradeCtx) return "";

  const subjectKey = subject.toLowerCase() as keyof Omit<GradeContext, "level">;
  const subjectCtx = gradeCtx[subjectKey] || gradeCtx.general;
  if (!subjectCtx || typeof subjectCtx === "string") return "";

  const ctx = subjectCtx as SubjectContext;

  return `
CURRICULUM CONTEXT — ${gradeCtx.level} (Year ${grade}), Subject: ${subject.toUpperCase()}

KEY TERMINOLOGY the child should learn and you should use naturally:
${ctx.terminology.join(", ")}

TOPICS at this level:
${ctx.topics.join(", ")}

TEACHING APPROACH for this level:
${ctx.approach}

IMPORTANT: Use the terminology listed above when explaining concepts. If the child uses simpler terms, acknowledge them but gently introduce the correct Cambridge terminology. Always stay within the scope of topics appropriate for Year ${grade}.`;
}
