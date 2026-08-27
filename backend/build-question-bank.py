import zipfile
import xml.etree.ElementTree as ET
import json
import os

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

l4_list = [
    {
        'id': 'q4-1',
        'level': 4,
        'question': 'In Bingo Auction Arena, if an initial bid is 400 coins and the final winning bid is 5,200 coins, what is the minimum question level unlocked based on the bid delta (Δ)?',
        'options': ['Level 4', 'Level 3', 'Level 2', 'Level 5'],
        'correctAnswer': 'Level 4'
    },
    {
        'id': 'q4-2',
        'level': 4,
        'question': 'On a 5×5 Bingo board containing distinct numbers 1 to 25, how many total unique winning lines (rows, columns, and full diagonals) exist?',
        'options': ['12 lines', '10 lines', '14 lines', '16 lines'],
        'correctAnswer': '12 lines'
    },
    {
        'id': 'q4-3',
        'level': 4,
        'question': 'If a team starts with 50,000 coins, places a successful Level 4 bid with a final bid of 7,500 coins and receives a 3,500 coins bonus, what is their updated coin balance?',
        'options': ['46,000 coins', '42,500 coins', '43,000 coins', '44,500 coins'],
        'correctAnswer': '46,000 coins'
    },
    {
        'id': 'q4-4',
        'level': 4,
        'question': 'A team bids 2,400 coins but answers incorrectly. If their starting balance before this round was 2,000 coins, what is their new balance and status?',
        'options': ['-400 coins (Temporary Halt)', '0 coins (Active)', '-100 coins (Eliminated)', '+200 coins (Active)'],
        'correctAnswer': '-400 coins (Temporary Halt)'
    },
    {
        'id': 'q4-5',
        'level': 4,
        'question': 'According to the official rules, how many bonus coins are deposited into every team\'s account after every 5 rounds to maintain competitive auction liquidity?',
        'options': ['250 coins', '500 coins', '100 coins', '1,000 coins'],
        'correctAnswer': '250 coins'
    },
    {
        'id': 'q4-6',
        'level': 4,
        'question': 'If a 5×5 Bingo card has 4 numbers marked in row 3 and 4 numbers marked in column 2, and cell (3, 2) is the common intersection, what is the minimum number of additional numbers required to complete at least one line?',
        'options': ['1 number', '2 numbers', '3 numbers', '4 numbers'],
        'correctAnswer': '1 number'
    },
    {
        'id': 'q4-7',
        'level': 4,
        'question': 'Which question tier in Bingo Auction Arena consists of offline math-dares and tricky puzzles presented on the projector PPT?',
        'options': ['Level 5', 'Level 4', 'Level 3', 'Level 2'],
        'correctAnswer': 'Level 5'
    },
    {
        'id': 'q4-8',
        'level': 4,
        'question': 'In a 5×5 grid with numbers 1 to 25, how many total cells belong to at least one of the two main diagonals?',
        'options': ['9 cells', '10 cells', '8 cells', '12 cells'],
        'correctAnswer': '9 cells'
    },
    {
        'id': 'q4-9',
        'level': 4,
        'question': 'If an auction delta (Final Bid - Initial Bid) is exactly 1,900 coins, which levels of questions is the winning team eligible to choose from?',
        'options': ['Levels 2, 3, 4, 5', 'Levels 1, 2, 3, 4, 5', 'Levels 3, 4, 5 only', 'Level 2 only'],
        'correctAnswer': 'Levels 2, 3, 4, 5'
    },
    {
        'id': 'q4-10',
        'level': 4,
        'question': 'A team is currently at -180 coins. After 2 consecutive 250-coin influx bonuses from the host, what is the team\'s new coin balance and can they bid again?',
        'options': ['+320 coins, Yes', '+500 coins, Yes', '+70 coins, No', '-180 coins, No'],
        'correctAnswer': '+320 coins, Yes'
    },
    {
        'id': 'q4-11',
        'level': 4,
        'question': 'What is the probability that a randomly drawn number from 1 to 25 is an odd prime number?',
        'options': ['8/25', '9/25', '7/25', '10/25'],
        'correctAnswer': '8/25'
    },
    {
        'id': 'q4-12',
        'level': 4,
        'question': 'In Bingo Auction Arena, if a team answers a Level 3 question correctly, how many bonus points/coins are awarded to their score?',
        'options': ['60 points (2,000 coins)', '40 points (1,000 coins)', '80 points (3,500 coins)', '20 points (500 coins)'],
        'correctAnswer': '60 points (2,000 coins)'
    },
    {
        'id': 'q4-13',
        'level': 4,
        'question': 'If a team chooses Level 4, what is the allotted timer duration on the participant dashboard to submit the answer?',
        'options': ['90 seconds', '60 seconds', '45 seconds', '30 seconds'],
        'correctAnswer': '90 seconds'
    },
    {
        'id': 'q4-14',
        'level': 4,
        'question': 'In a 5×5 matrix with 25 distinct numbers, how many corner cells belong to the perimeter?',
        'options': ['4 corners', '2 corners', '8 corners', '6 corners'],
        'correctAnswer': '4 corners'
    },
    {
        'id': 'q4-15',
        'level': 4,
        'question': 'If a team has 45,000 coins and places 5 consecutive unsuccessful bids of 9,000 coins, what will be their final balance?',
        'options': ['0 coins', '5,000 coins', '-9,000 coins', '-4,500 coins'],
        'correctAnswer': '0 coins'
    },
    {
        'id': 'q4-16',
        'level': 4,
        'question': 'Under the official event guidelines, who are the two primary student event coordinators for Bingo Auction Arena?',
        'options': ['G Keshav Harshavardhan & Gineeth', 'Aarav & Siddharth', 'Rohan & Ananya', 'Keshav & Vikram'],
        'correctAnswer': 'G Keshav Harshavardhan & Gineeth'
    },
    {
        'id': 'q4-17',
        'level': 4,
        'question': 'What is the sum of all numbers from 1 to 25 on a full Bingo board?',
        'options': ['325', '300', '350', '275'],
        'correctAnswer': '325'
    },
    {
        'id': 'q4-18',
        'level': 4,
        'question': 'In modular arithmetic, what is the value of (25! + 1) mod 23?',
        'options': ['1', '0', '22', '2'],
        'correctAnswer': '1'
    },
    {
        'id': 'q4-19',
        'level': 4,
        'question': 'If a team has 4 numbers marked on row 1 of their 5×5 card, what is the probability that the next randomly generated number (from 20 remaining numbers) completes their row?',
        'options': ['1/20', '1/5', '1/4', '1/25'],
        'correctAnswer': '1/20'
    },
    {
        'id': 'q4-20',
        'level': 4,
        'question': 'If the delta between the winning final bid and initial starting bid exceeds 9,000 coins (e.g. Δ = 9,500), what level choice is unlocked for the team?',
        'options': ['Level 5 only', 'Level 4 and 5', 'Levels 3, 4, 5', 'All Levels'],
        'correctAnswer': 'Level 5 only'
    },
    {
        'id': 'q4-21',
        'level': 4,
        'question': 'In how many ways can 5 distinct numbers be ordered along any single diagonal of a 5×5 Bingo board?',
        'options': ['120 ways', '24 ways', '720 ways', '60 ways'],
        'correctAnswer': '120 ways'
    },
    {
        'id': 'q4-22',
        'level': 4,
        'question': 'If a team wins a bid with Δ = 3,000 coins, which difficulty range does this bid delta fall under?',
        'options': ['Level 3 (1901 - 4000)', 'Level 2 (801 - 1900)', 'Level 4 (4001 - 9000)', 'Level 1 (0 - 800)'],
        'correctAnswer': 'Level 3 (1901 - 4000)'
    },
    {
        'id': 'q4-23',
        'level': 4,
        'question': 'Out of 25 numbers (12 even, 13 odd), if 10 numbers have been claimed including 5 evens, what is the probability that the next drawn number is even?',
        'options': ['7/15', '1/2', '8/15', '2/5'],
        'correctAnswer': '7/15'
    },
    {
        'id': 'q4-24',
        'level': 4,
        'question': 'According to the official guidelines, how many student volunteers manage the digital tracking system and assist with paddle spotting?',
        'options': ['4 Student Volunteers', '2 Student Volunteers', '6 Student Volunteers', '8 Student Volunteers'],
        'correctAnswer': '4 Student Volunteers'
    },
    {
        'id': 'q4-25',
        'level': 4,
        'question': 'What is the average bonus coin reward if a team equally chooses Level 1 (500), Level 2 (1000), Level 3 (2000), and Level 4 (3500) and solves each correctly?',
        'options': ['1,750 coins', '1,500 coins', '2,000 coins', '1,850 coins'],
        'correctAnswer': '1,750 coins'
    }
]

questions.extend(l4_list)

print(f'Total Questions processed: {len(questions)}')

header_code = """/**
 * Question Bank categorized by Level (1 to 4)
 * - Level 1: 50 Questions from Excel Sheet 1 (Fundamental Math)
 * - Level 2: 50 Questions from Excel Sheet 2 (Logical & Analytical Math)
 * - Level 3: 50 Questions from Excel Sheet 3 (Advanced Logical & Speed Math)
 * - Level 4: 25 Questions from Event Rules, Game Theory & Mathematical Calculations
 * - Level 5: Handled offline via Projector PPT (Dares & Complex Puzzles)
 */

export const LEVEL_CONFIG = {
  1: { timerSeconds: 30, bonusCoins: 500, label: 'Level 1 (Fundamental)' },
  2: { timerSeconds: 45, bonusCoins: 1000, label: 'Level 2 (Logical & Analytical)' },
  3: { timerSeconds: 60, bonusCoins: 2000, label: 'Level 3 (Advanced Puzzles)' },
  4: { timerSeconds: 90, bonusCoins: 3500, label: 'Level 4 (Game Theory & Mastery)' },
  5: { timerSeconds: 0, bonusCoins: 5000, label: 'Level 5 (Dare & Puzzle PPT)' }
};

export const INITIAL_QUESTIONS = """

footer_code = """;

// Set of question IDs currently halted in the cycle
const haltedQuestionIds = new Set();

/**
 * Gets a random question for the specified level.
 * Implements temporary halt logic: once a question is picked, it is halted.
 * If all questions of that level are halted, halts for that level are reset.
 */
export function getNextQuestionForLevel(level) {
  const targetLevel = Number(level);
  if (targetLevel === 5) {
    return {
      level: 5,
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
 * Calculates eligible level choices based on bid difference
 * Difference = Final Bid - Initial Bid
 */
export function getEligibleLevels(initialBid, finalBid) {
  const delta = Math.max(0, Number(finalBid) - Number(initialBid));

  if (delta <= 800) {
    return [1, 2, 3, 4, 5];
  } else if (delta <= 1900) {
    return [2, 3, 4, 5];
  } else if (delta <= 4000) {
    return [3, 4, 5];
  } else if (delta <= 9000) {
    return [4, 5];
  } else {
    return [5];
  }
}
"""

final_js = header_code + json.dumps(questions, indent=2, ensure_ascii=False) + footer_code

with open('backend/src/data/questionBank.js', 'w', encoding='utf-8') as f:
    f.write(final_js)

print('Generated backend/src/data/questionBank.js successfully!')
