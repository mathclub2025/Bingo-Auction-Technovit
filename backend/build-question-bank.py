import zipfile
import xml.etree.ElementTree as ET
import json

def parse_xlsx(filename):
    with zipfile.ZipFile(filename) as z:
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            ss_tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
            for si in ss_tree.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
                text = ''.join(t.text for t in si.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t') if t.text)
                shared_strings.append(text)

        wb_tree = ET.fromstring(z.read('xl/workbook.xml'))
        sheets = []
        for s in wb_tree.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheet'):
            sheets.append((s.attrib['name'], s.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id', '')))

        rels_tree = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
        rels = {r.attrib['Id']: r.attrib['Target'] for r in rels_tree.findall('{http://schemas.openxmlformats.org/package/2006/relationships}Relationship')}

        results = {}
        for name, r_id in sheets:
            target = rels.get(r_id, '')
            path = 'xl/' + target if not target.startswith('xl/') else target
            if path in z.namelist():
                st_tree = ET.fromstring(z.read(path))
                rows = []
                for row in st_tree.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
                    row_data = []
                    for c in row.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                        val_el = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                        val = val_el.text if val_el is not None else ''
                        if c.attrib.get('t') == 's' and val != '':
                            val = shared_strings[int(val)]
                        row_data.append(val.strip())
                    if any(row_data):
                        rows.append(row_data)
                results[name] = rows
        return results

sheets = parse_xlsx('Bingo_Auction_Arena_MCQs_3_Levels.xlsx')

l1_rows = sheets['Level 1'][1:]
l2_rows = sheets['Level 2'][1:]
l3_rows = sheets['Level 3'][1:]

questions = []

for idx, r in enumerate(l1_rows, start=1):
    q_text = r[1]
    opts = [r[2], r[3], r[4], r[5]]
    ans = r[6]
    questions.append({
        'id': f'q1-{idx}',
        'level': 1,
        'question': q_text,
        'options': opts,
        'correctAnswer': ans
    })

for idx, r in enumerate(l2_rows, start=1):
    q_text = r[1]
    opts = [r[2], r[3], r[4], r[5]]
    ans = r[6]
    questions.append({
        'id': f'q2-{idx}',
        'level': 2,
        'question': q_text,
        'options': opts,
        'correctAnswer': ans
    })

for idx, r in enumerate(l3_rows, start=1):
    q_text = r[1]
    opts = [r[2], r[3], r[4], r[5]]
    ans = r[6]
    questions.append({
        'id': f'q3-{idx}',
        'level': 3,
        'question': q_text,
        'options': opts,
        'correctAnswer': ans
    })

print(f'Total MCQ Questions: {len(questions)} (L1: {len(l1_rows)}, L2: {len(l2_rows)}, L3: {len(l3_rows)})')

header_code = """/**
 * Question Bank categorized by Level (1 to 4)
 * - Level 1: 50 Questions from Excel Sheet 1 (Fundamental Math, 30s timer, +500 Coins)
 * - Level 2: 50 Questions from Excel Sheet 2 (Logical & Analytical Math, 45s timer, +1000 Coins)
 * - Level 3: 50 Questions from Excel Sheet 3 (Advanced Logical & Speed Math, 60s timer, +2000 Coins)
 * - Level 4: Offline Projector PPT Round (Dares & Complex Puzzles, Offline Host Settlement, +5000 Coins)
 */

export const LEVEL_CONFIG = {
  1: { timerSeconds: 30, bonusCoins: 500, label: 'Level 1 (Fundamental)' },
  2: { timerSeconds: 45, bonusCoins: 1000, label: 'Level 2 (Logical & Analytical)' },
  3: { timerSeconds: 60, bonusCoins: 2000, label: 'Level 3 (Advanced Puzzles)' },
  4: { timerSeconds: 0, bonusCoins: 5000, label: 'Level 4 (Dare & Puzzle PPT)' }
};

export const INITIAL_QUESTIONS = """

footer_code = """;

// Set of question IDs currently halted in the cycle
const haltedQuestionIds = new Set();

/**
 * Gets a random question for the specified level.
 * Level 4 is the PPT round.
 * Levels 1, 2, 3 pick from the Excel question pool with temporary halt logic.
 */
export function getNextQuestionForLevel(level) {
  const targetLevel = Number(level);
  if (targetLevel === 4) {
    return {
      level: 4,
      isPPT: true,
      message: 'Please refer the ppt question displayed'
    };
  }

  const levelQuestions = INITIAL_QUESTIONS.filter(q => q.level === targetLevel);
  if (levelQuestions.length === 0) return null;

  let availableQuestions = levelQuestions.filter(q => !haltedQuestionIds.has(q.id));

  // If all questions at this level are halted, reset halts for this level
  if (availableQuestions.length === 0) {
    levelQuestions.forEach(q => haltedQuestionIds.delete(q.id));
    availableQuestions = levelQuestions;
  }

  // Pick random question from available list
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  const selectedQuestion = availableQuestions[randomIndex];

  // Mark as temporarily halted
  haltedQuestionIds.add(selectedQuestion.id);

  // If total halted reaches total pool size, reset all halts
  if (haltedQuestionIds.size >= INITIAL_QUESTIONS.length) {
    haltedQuestionIds.clear();
  }

  const config = LEVEL_CONFIG[targetLevel] || LEVEL_CONFIG[1];

  return {
    id: selectedQuestion.id,
    level: selectedQuestion.level,
    question: selectedQuestion.question,
    options: selectedQuestion.options,
    timerSeconds: config.timerSeconds,
    bonusCoins: config.bonusCoins
  };
}

/**
 * Validates a submitted answer against question bank
 */
export function verifyAnswer(questionId, selectedOption) {
  const question = INITIAL_QUESTIONS.find(q => q.id === questionId);
  if (!question) return false;
  return String(selectedOption).trim() === String(question.correctAnswer).trim();
}

/**
 * Calculates eligible level choices based on bid difference:
 * - 0 - 3000: [1, 2, 3] (Level 4 deactivated)
 * - 3001 - 7000: [2, 3] (Level 4 deactivated)
 * - 7001 - 9500: [3] (Level 4 deactivated)
 * - > 9500: Random number R in [9500, 11500].
 *   If delta > R: [4] (Level 4 ONLY activated).
 *   If delta <= R: [3] (Level 4 deactivated, Level 3 offered).
 */
export function getEligibleLevels(initialBid, finalBid) {
  const delta = Math.max(0, Number(finalBid) - Number(initialBid));

  if (delta <= 3000) {
    return [1, 2, 3];
  } else if (delta <= 7000) {
    return [2, 3];
  } else if (delta <= 9500) {
    return [3];
  } else {
    // Generate random threshold between 9500 and 11500
    const randomThreshold = Math.floor(Math.random() * (11500 - 9500 + 1)) + 9500;
    if (delta > randomThreshold) {
      // Level 4 only activated!
      return [4];
    } else {
      // Deactivated Level 4, fallback to Level 3
      return [3];
    }
  }
}
"""

final_js = header_code + json.dumps(questions, indent=2, ensure_ascii=False) + footer_code

with open('backend/src/data/questionBank.js', 'w', encoding='utf-8') as f:
    f.write(final_js)

print('Generated backend/src/data/questionBank.js with 4-level logic successfully!')
