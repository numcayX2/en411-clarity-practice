export interface MultipleChoiceQuestion {
  id: string;
  number: number;
  question: string;
  options: { label: string; text: string }[];
  correctAnswer: string; // 'A' | 'B' | 'C' | 'D'
  explanation: string;
  evidenceParagraph?: number;
  evidenceQuote?: string;
}

export interface TrueFalseQuestion {
  id: string;
  number: number;
  statement: string;
  correctAnswer: 'TRUE' | 'FALSE';
  explanation: string;
  evidenceQuote: string;
}

export interface ClozeItem {
  id: number;
  correctWord: string;
  acceptedWords: string[];
  hint: string;
  explanation: string;
}

export interface VocabCard {
  id: string;
  word: string;
  partOfSpeech: string;
  phonetic: string;
  definition: string;
  thaiMeaning: string;
  example: string;
  activityRef: string;
}

// Activity 1: Marie Curie Data
export const activity1Data = {
  title: "Activity 1: Read the story and choose the best answer.",
  readingTitle: "The Life and Work of Marie Curie",
  paragraphs: [
    {
      id: 1,
      text: "Marie Curie is one of the most famous women scientists in history. She was born Maria Sklodowska in Poland in 1867. She became well known for her groundbreaking research on radioactivity and was awarded two Nobel Prizes. In 1903, she shared the Nobel Prize in Physics with her husband, Pierre Curie, and Henri Becquerel. In 1911, she received the Nobel Prize in Chemistry on her own. She was the first woman ever to win a Nobel Prize."
    },
    {
      id: 2,
      text: "From an early age, Marie showed remarkable intelligence and an excellent memory. At the age of sixteen, she received a gold medal for completing her secondary education. However, her father lost his savings because of poor investments, so Marie had to work as a teacher. She used the money she earned to support her sister Bronia’s medical studies in Paris. In return, Bronia promised to help Marie pursue her own education later."
    },
    {
      id: 3,
      text: "In 1891, Bronia kept this promise, and Marie moved to Paris to study at the Sorbonne, now part of the University of Paris. She devoted herself to her studies, often working late into the night. Because she had very little money, she survived on a simple diet of bread, butter, and tea. Despite these difficult living conditions, she performed exceptionally well in her examinations. In 1893, she achieved the highest result in the physical sciences examination. The following year, she came second in the mathematical sciences examination. It was not until the spring of 1894 that she met Pierre Curie, who would later become her husband and research partner."
    }
  ],
  questions: [
    {
      id: "act1_q1",
      number: 1,
      question: "What is Marie Curie famous for?",
      options: [
        { label: "A", text: "Discovering gravity" },
        { label: "B", text: "Her research on radioactivity" },
        { label: "C", text: "Inventing the telephone" },
        { label: "D", text: "Studying human anatomy" }
      ],
      correctAnswer: "B",
      explanation: "Paragraph 1 explicitly mentions: 'She became well known for her groundbreaking research on radioactivity and was awarded two Nobel Prizes.'",
      evidenceParagraph: 1,
      evidenceQuote: "She became well known for her groundbreaking research on radioactivity and was awarded two Nobel Prizes."
    },
    {
      id: "act1_q2",
      number: 2,
      question: "How many Nobel Prizes did Marie Curie receive?",
      options: [
        { label: "A", text: "One" },
        { label: "B", text: "Two" },
        { label: "C", text: "Three" },
        { label: "D", text: "Four" }
      ],
      correctAnswer: "B",
      explanation: "Marie Curie received two Nobel Prizes: the 1903 Nobel Prize in Physics (shared with Pierre Curie & Henri Becquerel) and the 1911 Nobel Prize in Chemistry (on her own).",
      evidenceParagraph: 1,
      evidenceQuote: "In 1903, she shared the Nobel Prize in Physics with her husband, Pierre Curie, and Henri Becquerel. In 1911, she received the Nobel Prize in Chemistry on her own."
    },
    {
      id: "act1_q3",
      number: 3,
      question: "Why did Marie have to work as a teacher?",
      options: [
        { label: "A", text: "She disliked science" },
        { label: "B", text: "She wanted to travel" },
        { label: "C", text: "Her father lost his savings" },
        { label: "D", text: "Her sister asked her to work" }
      ],
      correctAnswer: "C",
      explanation: "Paragraph 2 states: 'However, her father lost his savings because of poor investments, so Marie had to work as a teacher.'",
      evidenceParagraph: 2,
      evidenceQuote: "However, her father lost his savings because of poor investments, so Marie had to work as a teacher."
    },
    {
      id: "act1_q4",
      number: 4,
      question: "How did Marie help her sister Bronia?",
      options: [
        { label: "A", text: "She paid for her medical studies" },
        { label: "B", text: "She found her a job in Poland" },
        { label: "C", text: "She taught her mathematics" },
        { label: "D", text: "She gave her a house in Paris" }
      ],
      correctAnswer: "A",
      explanation: "Paragraph 2 states: 'She used the money she earned to support her sister Bronia’s medical studies in Paris.'",
      evidenceParagraph: 2,
      evidenceQuote: "She used the money she earned to support her sister Bronia’s medical studies in Paris."
    },
    {
      id: "act1_q5",
      number: 5,
      question: "Where did Marie go to study in 1891?",
      options: [
        { label: "A", text: "Oxford University" },
        { label: "B", text: "The University of Warsaw" },
        { label: "C", text: "The Sorbonne in Paris" },
        { label: "D", text: "Cambridge University" }
      ],
      correctAnswer: "C",
      explanation: "Paragraph 3 states: 'In 1891, Bronia kept this promise, and Marie moved to Paris to study at the Sorbonne, now part of the University of Paris.'",
      evidenceParagraph: 3,
      evidenceQuote: "In 1891, Bronia kept this promise, and Marie moved to Paris to study at the Sorbonne, now part of the University of Paris."
    },
    {
      id: "act1_q6",
      number: 6,
      question: "What does the passage suggest about Marie’s character?",
      options: [
        { label: "A", text: "She was lazy and careless" },
        { label: "B", text: "She was determined and hardworking" },
        { label: "C", text: "She was wealthy and privileged" },
        { label: "D", text: "She was uninterested in education" }
      ],
      correctAnswer: "B",
      explanation: "Marie worked late into the night, supported her sister, persevered through poverty on bread and tea, and achieved top results, showing she was determined and hardworking.",
      evidenceParagraph: 3,
      evidenceQuote: "She devoted herself to her studies, often working late into the night... Despite these difficult living conditions, she performed exceptionally well in her examinations."
    },
    {
      id: "act1_q7",
      number: 7,
      question: "In which year did Marie Curie win the Nobel Prize in Chemistry?",
      options: [
        { label: "A", text: "1893" },
        { label: "B", text: "1903" },
        { label: "C", text: "1911" },
        { label: "D", employment: "1891", text: "1891" }
      ],
      correctAnswer: "C",
      explanation: "Paragraph 1 clearly states: 'In 1911, she received the Nobel Prize in Chemistry on her own.' (In 1903 she won Physics; 1893 was her physical sciences exam).",
      evidenceParagraph: 1,
      evidenceQuote: "In 1911, she received the Nobel Prize in Chemistry on her own."
    },
    {
      id: "act1_q8",
      number: 8,
      question: "What does the word “remarkable” in paragraph 2 mean?",
      options: [
        { label: "A", text: "Ordinary" },
        { label: "B", text: "Impressive" },
        { label: "C", text: "Unusual in a negative way" },
        { label: "D", text: "Unimportant" }
      ],
      correctAnswer: "B",
      explanation: "'Remarkable' describes something striking, extraordinary, or impressive ('remarkable intelligence and an excellent memory').",
      evidenceParagraph: 2,
      evidenceQuote: "From an early age, Marie showed remarkable intelligence and an excellent memory."
    },
    {
      id: "act1_q9",
      number: 9,
      question: "Why did Marie often work far into the night?",
      options: [
        { label: "A", text: "She had to earn extra money." },
        { label: "B", text: "She wanted to meet Pierre Curie." },
        { label: "C", text: "She was dedicated to her studies." },
        { label: "D", text: "She could not sleep at night." }
      ],
      correctAnswer: "C",
      explanation: "Paragraph 3 says: 'She devoted herself to her studies, often working late into the night.' 'Devoted' means deeply dedicated.",
      evidenceParagraph: 3,
      evidenceQuote: "She devoted herself to her studies, often working late into the night."
    },
    {
      id: "act1_q10",
      number: 10,
      question: "What can we infer about Marie Curie from her early life?",
      options: [
        { label: "A", text: "She gave up easily when facing difficulties." },
        { label: "B", text: "She depended entirely on her family’s wealth." },
        { label: "C", text: "She valued education and was willing to make sacrifices for it." },
        { label: "D", text: "She preferred teaching to studying science." }
      ],
      correctAnswer: "C",
      explanation: "Marie sacrificed her own education first to fund Bronia's studies, then endured poverty and harsh living conditions in Paris solely to pursue knowledge, proving she deeply valued education and made sacrifices for it.",
      evidenceParagraph: 2,
      evidenceQuote: "She used the money she earned to support her sister Bronia’s medical studies in Paris. In return, Bronia promised to help Marie pursue her own education later."
    }
  ] as MultipleChoiceQuestion[]
};

// Activity 2: Situation Analysis Data
export const activity2Data = {
  title: "Activity 2: Read the situation and choose the best answer.",
  situation: "A student meets with Mr. Dan to ask about joining the work-study program to earn money and pay off student loans. The student wants to work 20 hours a week, but Mr. Dan advises starting with 10 hours a week because working too much could affect the student’s grades and scholarship. He approves the student to work 10 hours a week and tells them to take the signed form to the job center to find a suitable position. They can discuss increasing the working hours later.",
  statements: [
    {
      id: "act2_s1",
      number: 1,
      statement: "The student is concerned about paying off student loans after graduation.",
      correctAnswer: "TRUE",
      explanation: "TRUE: The passage mentions the student wants to join the program specifically to 'earn money and pay off student loans', which is a primary concern for college students.",
      evidenceQuote: "A student meets with Mr. Dan to ask about joining the work-study program to earn money and pay off student loans."
    },
    {
      id: "act2_s2",
      number: 2,
      statement: "Mr. Dan immediately approves the student's request to work 20 hours a week.",
      correctAnswer: "FALSE",
      explanation: "FALSE: Mr. Dan does NOT approve 20 hours; he explicitly advises starting with 10 hours and only approves 10 hours a week.",
      evidenceQuote: "The student wants to work 20 hours a week, but Mr. Dan advises starting with 10 hours a week... He approves the student to work 10 hours a week..."
    },
    {
      id: "act2_s3",
      number: 3,
      statement: "The student is a freshman with a full class schedule.",
      correctAnswer: "FALSE",
      explanation: "FALSE: The text never specifies the student's academic year (freshman) or whether they have a full class schedule. It is unsupported by the passage.",
      evidenceQuote: "A student meets with Mr. Dan to ask about joining the work-study program..."
    },
    {
      id: "act2_s4",
      number: 4,
      statement: "Working too many hours could put the student's scholarship at risk.",
      correctAnswer: "TRUE",
      explanation: "TRUE: Mr. Dan warns that 'working too much could affect the student’s grades and scholarship', which means the scholarship would be in jeopardy.",
      evidenceQuote: "...because working too much could affect the student’s grades and scholarship."
    },
    {
      id: "act2_s5",
      number: 5,
      statement: "The student must take the signed form to the library.",
      correctAnswer: "FALSE",
      explanation: "FALSE: Mr. Dan tells the student to take the signed form to the 'job center', not the library.",
      evidenceQuote: "...and tells them to take the signed form to the job center to find a suitable position."
    },
    {
      id: "act2_s6",
      number: 6,
      statement: "The work-study program offers both 10-hour and 20-hour work schedules per week.",
      correctAnswer: "FALSE",
      explanation: "FALSE: The text does not say the program officially offers rigid 10-hour and 20-hour package schedules; 20 was the student's personal request, and 10 was Dan's customized recommendation with hours adjustable later.",
      evidenceQuote: "The student wants to work 20 hours a week, but Mr. Dan advises starting with 10 hours a week... They can discuss increasing the working hours later."
    },
    {
      id: "act2_s7",
      number: 7,
      statement: "Mr. Dan believes that the student is not a hard worker.",
      correctAnswer: "FALSE",
      explanation: "FALSE: Mr. Dan's advice is strictly protective of the student's academic standing and scholarship; he never doubts or questions the student's diligence.",
      evidenceQuote: "...Mr. Dan advises starting with 10 hours a week because working too much could affect the student’s grades and scholarship."
    },
    {
      id: "act2_s8",
      number: 8,
      statement: "The student agrees that losing the scholarship could lead to more debt.",
      correctAnswer: "FALSE",
      explanation: "FALSE: The passage does not mention the student's response or any explicit agreement regarding losing the scholarship and debt.",
      evidenceQuote: "A student meets with Mr. Dan to ask about joining the work-study program..."
    },
    {
      id: "act2_s9",
      number: 9,
      statement: "This is a work-study program provided by a university.",
      correctAnswer: "TRUE",
      explanation: "TRUE: Work-study programs tied to student loans, academic grades, scholarships, and campus job centers are university-provided programs.",
      evidenceQuote: "A student meets with Mr. Dan to ask about joining the work-study program to earn money and pay off student loans... affect the student’s grades and scholarship... job center..."
    },
    {
      id: "act2_s10",
      number: 10,
      statement: "Mr. Dan agrees to reconsider the student's working hours after they have worked for a while.",
      correctAnswer: "TRUE",
      explanation: "TRUE: The passage concludes: 'They can discuss increasing the working hours later.'",
      evidenceQuote: "They can discuss increasing the working hours later."
    }
  ] as TrueFalseQuestion[]
};

// Activity 3: Cloze Fill-in-the-Blank with Word Bank
export const activity3Data = {
  title: "Activity 3: Look at the picture and choose the best answer.",
  wordBank: ["transportation", "destination", "can be seen", "numerous", "some", "cyclists"],
  imageSrc: "/activity3-street.jpg",
  imageCaption: "Crowded Asian street scene with cyclists, motor vehicles, traditional architecture, and distant modern high-rises.",
  paragraphTemplate: [
    { text: "The picture depicts a crowded street in an Asian country, with 1). " },
    { blankId: 1 },
    { text: " bicycles and motor vehicles sharing the road. This indicates that the area experiences heavy traffic. 2). " },
    { blankId: 2 },
    { text: " cyclists have baskets attached to their bicycles, suggesting that cycling is a common means of 3). " },
    { blankId: 3 },
    { text: ". However, the traffic situation appears somewhat chaotic. 4). " },
    { blankId: 4 },
    { text: " are riding on both sides of the center line and are moving in the same direction. Moreover, there appear to be no designated lanes for bicycles or motorcycles, because different types of transportation are sharing the road without clear separation. Based on the surrounding architecture, the area may be a popular tourist 5). " },
    { blankId: 5 },
    { text: " or shopping district. Two tall buildings 6). " },
    { blankId: 6 },
    { text: " in the distance, suggesting that the area may also be a commercial or business center." }
  ],
  clozeItems: [
    {
      id: 1,
      correctWord: "numerous",
      acceptedWords: ["numerous", "Numerous"],
      hint: "An adjective / quantifier meaning 'many' or 'a large number of'. Fits before 'bicycles and motor vehicles'.",
      explanation: "'Numerous' means many or existing in large numbers. '...with numerous bicycles and motor vehicles sharing the road.'"
    },
    {
      id: 2,
      correctWord: "some",
      acceptedWords: ["some", "Some"],
      hint: "A determiner indicating an unspecified amount or part of a group (not all). Capitalized at sentence start.",
      explanation: "'Some' indicates a portion of the cyclists ('Some cyclists have baskets attached...')."
    },
    {
      id: 3,
      correctWord: "transportation",
      acceptedWords: ["transportation", "Transportation"],
      hint: "A noun referring to vehicles or systems for moving people or goods from one place to another.",
      explanation: "'Means of transportation' is a fixed collocation meaning vehicles/methods used for travel."
    },
    {
      id: 4,
      correctWord: "cyclists",
      acceptedWords: ["cyclists", "Cyclists"],
      hint: "Plural noun referring to people who ride bicycles. Capitalized at sentence start.",
      explanation: "'Cyclists' is the subject of the verb phrase 'are riding on both sides of the center line'."
    },
    {
      id: 5,
      correctWord: "destination",
      acceptedWords: ["destination", "Destination"],
      hint: "A noun meaning a place people travel to or visit ('tourist destination').",
      explanation: "'Tourist destination' is a standard English collocation meaning a place attractive to visitors."
    },
    {
      id: 6,
      correctWord: "can be seen",
      acceptedWords: ["can be seen", "Can be seen"],
      hint: "A passive modal verb phrase meaning 'are visible' in the background.",
      explanation: "'Two tall buildings can be seen in the distance' is a passive construction denoting visibility."
    }
  ] as ClozeItem[]
};

// Activity 4: Business Email Reading
export const activity4Data = {
  title: "Activity 4: Read the email and answer the questions",
  email: {
    senderCompany: "Greenfield Chocolate Factory",
    address: "125 Maple Avenue, Vancouver, Canada V6B 2W9",
    date: "October 10th, 2026",
    recipient: "Dear Ms. Wilson,",
    subject: "ANNIVERSARY SALE AND LUCKY DRAW",
    paragraphs: [
      "As a valued customer, we are delighted to inform you about our upcoming anniversary sale in celebration of our company’s 50th anniversary. We would like you to be among the first to learn about this special event.",
      "The prices of all chocolates, candies, and snack products will be reduced by 40% from October 15th to October 31st, 2026.",
      "As part of our annual tradition, we are offering our customers a chance to win a special prize. This year, the grand prize is a three-night stay on Phuket Island, Thailand. The lucky winner will also receive three complimentary luxury dinners and a guided island tour.",
      "To enter the lucky draw, please purchase a raffle ticket for $15. All proceeds will be donated to local children's charities and educational foundations. Tickets are available through our official Facebook page and website.",
      "Thank you for your continued support. We look forward to welcoming you to our anniversary celebration and sharing this special occasion with you."
    ],
    closing: "Best regards,",
    signoffName: "Emily Greenfield",
    signoffTitle: "Marketing Director",
    signoffCompany: "Greenfield Chocolate Factory"
  },
  summaryBox: "Summary: Greenfield Chocolate Factory sends a letter to inform its valued customers about a special sale celebrating the company’s 50th anniversary. From October 15th to 31st, 2026, customers can enjoy a 40% discount on chocolates, candies, and snacks. The company also offers a lucky draw with a three-night stay on Phuket Island as the grand prize. Money from raffle ticket sales will be donated to children’s charities and educational foundations.",
  questions: [
    {
      id: "act4_q1",
      number: 1,
      question: "Why is Greenfield Chocolate Factory organizing the special sale?",
      options: [
        { label: "A", text: "To introduce a new chocolate product" },
        { label: "B", text: "To celebrate the company's 50th anniversary" },
        { label: "C", text: "To attract new employees" },
        { label: "D", text: "To open a new factory" }
      ],
      correctAnswer: "B",
      explanation: "Paragraph 1 states: '...in celebration of our company’s 50th anniversary.'",
      evidenceParagraph: 1,
      evidenceQuote: "in celebration of our company’s 50th anniversary."
    },
    {
      id: "act4_q2",
      number: 2,
      question: "How much will the prices of the products be reduced?",
      options: [
        { label: "A", text: "15%" },
        { label: "B", text: "30%" },
        { label: "C", text: "40%" },
        { label: "D", text: "50%" }
      ],
      correctAnswer: "C",
      explanation: "Paragraph 2 states: 'The prices of all chocolates, candies, and snack products will be reduced by 40%...'",
      evidenceParagraph: 2,
      evidenceQuote: "The prices of all chocolates, candies, and snack products will be reduced by 40% from October 15th to October 31st, 2026."
    },
    {
      id: "act4_q3",
      number: 3,
      question: "When will the anniversary sale take place?",
      options: [
        { label: "A", text: "October 1st–10th, 2026" },
        { label: "B", text: "October 10th–15th, 2026" },
        { label: "C", text: "October 15th–31st, 2026" },
        { label: "D", text: "October 20th–November 10th, 2026" }
      ],
      correctAnswer: "C",
      explanation: "Paragraph 2 states: '...from October 15th to October 31st, 2026.'",
      evidenceParagraph: 2,
      evidenceQuote: "from October 15th to October 31st, 2026."
    },
    {
      id: "act4_q4",
      number: 4,
      question: "What is the grand prize for the lucky draw?",
      options: [
        { label: "A", text: "A five-night stay in Vancouver" },
        { label: "B", text: "A three-night stay on Phuket Island" },
        { label: "C", text: "A free trip to Chiang Mai" },
        { label: "D", text: "A one-week stay in Canada" }
      ],
      correctAnswer: "B",
      explanation: "Paragraph 3 states: 'This year, the grand prize is a three-night stay on Phuket Island, Thailand.'",
      evidenceParagraph: 3,
      evidenceQuote: "This year, the grand prize is a three-night stay on Phuket Island, Thailand. The lucky winner will also receive three complimentary luxury dinners and a guided island tour."
    },
    {
      id: "act4_q5",
      number: 5,
      question: "What will the money from the raffle tickets be used for?",
      options: [
        { label: "A", text: "Building a new factory" },
        { label: "B", text: "Organizing the anniversary party" },
        { label: "C", text: "Buying new chocolate-making machines" },
        { label: "D", text: "Supporting children's charities and educational foundations" }
      ],
      correctAnswer: "D",
      explanation: "Paragraph 4 states: 'All proceeds will be donated to local children's charities and educational foundations.'",
      evidenceParagraph: 4,
      evidenceQuote: "All proceeds will be donated to local children's charities and educational foundations."
    },
    {
      id: "act4_q6",
      number: 6,
      question: "How can customers purchase raffle tickets?",
      options: [
        { label: "A", text: "Through the company's Facebook page and website" },
        { label: "B", text: "Only at the factory" },
        { label: "C", text: "By contacting the company's employees by phone" },
        { label: "D", text: "At local shopping malls only" }
      ],
      correctAnswer: "A",
      explanation: "Paragraph 4 states: 'Tickets are available through our official Facebook page and website.'",
      evidenceParagraph: 4,
      evidenceQuote: "Tickets are available through our official Facebook page and website."
    }
  ] as MultipleChoiceQuestion[]
};

// Vocabulary Flashcards Database
export const vocabularyList: VocabCard[] = [
  {
    id: "v1",
    word: "Groundbreaking",
    partOfSpeech: "adjective",
    phonetic: "/ˈɡraʊndˌbreɪkɪŋ/",
    definition: "Innovative; pioneering; introducing new ideas or methods.",
    thaiMeaning: "ที่บุกเบิก, ที่แปลกใหม่และสร้างประวัติศาสตร์",
    example: "Marie Curie became famous for her groundbreaking research on radioactivity.",
    activityRef: "Activity 1"
  },
  {
    id: "v2",
    word: "Radioactivity",
    partOfSpeech: "noun",
    phonetic: "/ˌreɪdioʊækˈtɪvəti/",
    definition: "The release of radiation by the decay of atomic nuclei.",
    thaiMeaning: "กัมมันตภาพรังสี",
    example: "Her research on radioactivity transformed nuclear physics.",
    activityRef: "Activity 1"
  },
  {
    id: "v3",
    word: "Remarkable",
    partOfSpeech: "adjective",
    phonetic: "/rɪˈmɑːrkəbl/",
    definition: "Worthy of attention; extraordinary, striking or impressive.",
    thaiMeaning: "ยอดเยี่ยม, น่าทึ่ง, โดดเด่น",
    example: "Marie showed remarkable intelligence and an excellent memory from childhood.",
    activityRef: "Activity 1"
  },
  {
    id: "v4",
    word: "Sacrifice",
    partOfSpeech: "noun / verb",
    phonetic: "/ˈsækrɪfaɪs/",
    definition: "An act of giving up something valued for the sake of something more important.",
    thaiMeaning: "การเสียสละ, เสียสละเพื่อเป้าหมาย",
    example: "She made great sacrifices to ensure both she and her sister could graduate.",
    activityRef: "Activity 1"
  },
  {
    id: "v5",
    word: "Devoted",
    partOfSpeech: "adjective",
    phonetic: "/dɪˈvoʊtɪd/",
    definition: "Very loving or loyal; giving all or a large part of one's time or resources to a cause.",
    thaiMeaning: "อุทิศตน, ทุ่มเทอย่างยิ่ง",
    example: "She devoted herself completely to her physical and mathematical studies.",
    activityRef: "Activity 1"
  },
  {
    id: "v6",
    word: "Work-study program",
    partOfSpeech: "compound noun",
    phonetic: "/ˈwɜːrk ˌstʌdi ˈproʊɡræm/",
    definition: "A college program that provides students with part-time jobs to help pay educational expenses.",
    thaiMeaning: "โครงการทำงานเพื่อการศึกษา (งานพาร์ตไทม์ในสถาบันการศึกษา)",
    example: "The work-study program helps students pay off tuition loans without quitting classes.",
    activityRef: "Activity 2"
  },
  {
    id: "v7",
    word: "Scholarship",
    partOfSpeech: "noun",
    phonetic: "/ˈskɑːlərʃɪp/",
    definition: "A grant or payment made to support a student's education, awarded based on achievement or criteria.",
    thaiMeaning: "ทุนการศึกษา",
    example: "Working more than 20 hours could drop your GPA and put your scholarship at risk.",
    activityRef: "Activity 2"
  },
  {
    id: "v8",
    word: "Debt",
    partOfSpeech: "noun",
    phonetic: "/dɛt/",
    definition: "A sum of money that is owed or due.",
    thaiMeaning: "หนี้สิน",
    example: "Taking part-time shifts reduces the total debt accumulated during college.",
    activityRef: "Activity 2"
  },
  {
    id: "v9",
    word: "Chaotic",
    partOfSpeech: "adjective",
    phonetic: "/keɪˈɑːtɪk/",
    definition: "In a state of complete confusion and disorder.",
    thaiMeaning: "วุ่นวาย, ไร้ระเบียบ",
    example: "The traffic situation on the avenue appears chaotic with mixed vehicles.",
    activityRef: "Activity 3"
  },
  {
    id: "v10",
    word: "Designated",
    partOfSpeech: "adjective",
    phonetic: "/ˈdɛzɪɡneɪtɪd/",
    definition: "Officially assigned or specified for a particular purpose.",
    thaiMeaning: "ที่กำหนดไว้โดยเฉพาะ",
    example: "There were no designated bicycle lanes on the busy road.",
    activityRef: "Activity 3"
  },
  {
    id: "v11",
    word: "Destination",
    partOfSpeech: "noun",
    phonetic: "/ˌdɛstəˈneɪʃn/",
    definition: "The place to which someone or something is going or being sent.",
    thaiMeaning: "จุดหมายปลายทาง, แหล่งท่องเที่ยว",
    example: "The historic temple district is a renowned tourist destination.",
    activityRef: "Activity 3"
  },
  {
    id: "v12",
    word: "Numerous",
    partOfSpeech: "adjective",
    phonetic: "/ˈnuːmərəs/",
    definition: "Great in number; many.",
    thaiMeaning: "มากมาย, หลากหลายจำนวนมาก",
    example: "Numerous cyclists and motorists share the narrow boulevard.",
    activityRef: "Activity 3"
  },
  {
    id: "v13",
    word: "Complimentary",
    partOfSpeech: "adjective",
    phonetic: "/ˌkɑːmplɪˈmɛntri/",
    definition: "Given or provided free of charge.",
    thaiMeaning: "ให้ฟรี, ไม่เสียค่าใช้จ่าย (เพื่ออภินันทนาการ)",
    example: "The lucky winner will enjoy three complimentary luxury dinners.",
    activityRef: "Activity 4"
  },
  {
    id: "v14",
    word: "Proceeds",
    partOfSpeech: "plural noun",
    phonetic: "/ˈproʊsiːdz/",
    definition: "Money obtained from an event or activity, often earmarked for charity.",
    thaiMeaning: "รายได้จากการจัดงานหรือการขาย (เพื่อการกุศล)",
    example: "All proceeds from ticket sales will be donated to children's foundations.",
    activityRef: "Activity 4"
  },
  {
    id: "v15",
    word: "Raffle ticket",
    partOfSpeech: "compound noun",
    phonetic: "/ˈræfəl ˈtɪkɪt/",
    definition: "A numbered ticket purchased to participate in a lottery for prizes.",
    thaiMeaning: "ตั๋วชิงโชค / สลากการกุศล",
    example: "Buy a $15 raffle ticket to enter the Phuket holiday sweepstakes.",
    activityRef: "Activity 4"
  }
];
