const EVENT_TYPES = {
  CLASS: "class",
  EXAM: "exam",
  QUIZ: "quiz",
  ASSIGNMENT: "assignment",
  LAB: "lab",
  OTHER: "other",
};

const analyzeEventType = (event) => {
  const summary = event.summary?.toLowerCase() || "";
  const description = event.description?.toLowerCase() || "";
  const location = event.location?.toLowerCase() || "";

  // Patterns for different event types
  const patterns = {
    exam: /(exam|final|midterm)/i,
    quiz: /(quiz|test|assessment)/i,
    assignment: /(assignment|homework|project|report|paper|due|deadline)/i,
    lab: /(lab|laboratory|practical)/i,
    class:
      /([A-Z]{2,4})\s*[-]?\s*(\d{3,4}[A-Z]?)|lecture|seminar|class|course/i,
  };

  // Check time pattern for regular classes
  const timePattern = /^(M|T|W|R|F|MW|TR|MWF)\s+\d{1,2}:\d{2}/i;

  // Calculate scores for each type
  let scores = {
    [EVENT_TYPES.CLASS]: 0,
    [EVENT_TYPES.EXAM]: 0,
    [EVENT_TYPES.QUIZ]: 0,
    [EVENT_TYPES.ASSIGNMENT]: 0,
    [EVENT_TYPES.LAB]: 0,
  };

  // Score for class
  if (patterns.class.test(summary)) scores[EVENT_TYPES.CLASS] += 5;
  if (timePattern.test(summary)) scores[EVENT_TYPES.CLASS] += 3;
  if (event.recurrence) scores[EVENT_TYPES.CLASS] += 3;
  if (location && /(hall|room|building)/i.test(location))
    scores[EVENT_TYPES.CLASS] += 2;

  // Score for exam
  if (patterns.exam.test(summary)) scores[EVENT_TYPES.EXAM] += 5;
  if (patterns.exam.test(description)) scores[EVENT_TYPES.EXAM] += 3;
  if (!event.recurrence) scores[EVENT_TYPES.EXAM] += 2; // Exams are usually one-time events

  // Score for quiz
  if (patterns.quiz.test(summary)) scores[EVENT_TYPES.QUIZ] += 5;
  if (patterns.quiz.test(description)) scores[EVENT_TYPES.QUIZ] += 3;
  if (!event.recurrence) scores[EVENT_TYPES.QUIZ] += 2;

  // Score for assignment
  if (patterns.assignment.test(summary)) scores[EVENT_TYPES.ASSIGNMENT] += 5;
  if (patterns.assignment.test(description))
    scores[EVENT_TYPES.ASSIGNMENT] += 3;
  if (/due|deadline/i.test(summary)) scores[EVENT_TYPES.ASSIGNMENT] += 2;

  // Score for lab
  if (patterns.lab.test(summary)) scores[EVENT_TYPES.LAB] += 5;
  if (patterns.lab.test(description)) scores[EVENT_TYPES.LAB] += 3;
  if (patterns.lab.test(location)) scores[EVENT_TYPES.LAB] += 2;

  // Find the type with highest score
  let maxScore = 0;
  let eventType = EVENT_TYPES.OTHER;

  Object.entries(scores).forEach(([type, score]) => {
    if (score > maxScore) {
      maxScore = score;
      eventType = type;
    }
  });

  return {
    type: eventType,
    confidence: Math.min((maxScore / 10) * 100, 100),
  };
};

export { EVENT_TYPES, analyzeEventType };
