/**
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

export const INITIAL_QUESTIONS = [
  {
    "id": "q1-1",
    "level": 1,
    "question": "Start with 20, multiply by 3, subtract 10, and divide by 2. What is the final number?",
    "options": [
      "25",
      "35",
      "20",
      "30"
    ],
    "correctAnswer": "25"
  },
  {
    "id": "q1-2",
    "level": 1,
    "question": "What is 15 × 12 - 30?",
    "options": [
      "150",
      "160",
      "120",
      "180"
    ],
    "correctAnswer": "150"
  },
  {
    "id": "q1-3",
    "level": 1,
    "question": "What is the next number in the pattern: 4, 9, 16, 25, 36, ___?",
    "options": [
      "48",
      "42",
      "49",
      "56"
    ],
    "correctAnswer": "49"
  },
  {
    "id": "q1-4",
    "level": 1,
    "question": "Which of the following numbers does NOT belong: 17, 23, 29, 33, 41?",
    "options": [
      "39",
      "33",
      "17",
      "31"
    ],
    "correctAnswer": "33"
  },
  {
    "id": "q1-5",
    "level": 1,
    "question": "How many minutes are there in 2.5 hours?",
    "options": [
      "180 minutes",
      "135 minutes",
      "150 minutes",
      "120 minutes"
    ],
    "correctAnswer": "150 minutes"
  },
  {
    "id": "q1-6",
    "level": 1,
    "question": "Take 50, add 22, divide by 8, and multiply by 9. What is the final result?",
    "options": [
      "90",
      "79",
      "72",
      "81"
    ],
    "correctAnswer": "81"
  },
  {
    "id": "q1-7",
    "level": 1,
    "question": "Calculate 25% of 240.",
    "options": [
      "50",
      "80",
      "60",
      "40"
    ],
    "correctAnswer": "60"
  },
  {
    "id": "q1-8",
    "level": 1,
    "question": "Find the missing number in the sequence: 3, 7, 15, 31, ___?",
    "options": [
      "62",
      "64",
      "31",
      "63"
    ],
    "correctAnswer": "63"
  },
  {
    "id": "q1-9",
    "level": 1,
    "question": "How many centimeters are equal to 4.5 meters?",
    "options": [
      "450 cm",
      "405 cm",
      "540 cm",
      "45 cm"
    ],
    "correctAnswer": "450 cm"
  },
  {
    "id": "q1-10",
    "level": 1,
    "question": "Which number is the odd one out: 8, 27, 64, 100, 125?",
    "options": [
      "64",
      "100",
      "216",
      "125"
    ],
    "correctAnswer": "100"
  },
  {
    "id": "q1-11",
    "level": 1,
    "question": "A shopkeeper has ₹100. He spends ₹37 and then receives ₹15. How much money does he have now?",
    "options": [
      "₹78",
      "₹82",
      "₹72",
      "₹68"
    ],
    "correctAnswer": "₹78"
  },
  {
    "id": "q1-12",
    "level": 1,
    "question": "A shop has 60 chocolates. It sells 18 in the morning and then sells twice as many in the afternoon. How many chocolates are left?",
    "options": [
      "12",
      "18",
      "6",
      "24"
    ],
    "correctAnswer": "6"
  },
  {
    "id": "q1-13",
    "level": 1,
    "question": "Which number should replace the question mark? 4, 7, 13, 22, 34, ?",
    "options": [
      "47",
      "46",
      "51",
      "49"
    ],
    "correctAnswer": "49"
  },
  {
    "id": "q1-14",
    "level": 1,
    "question": "A class has 30 students. One-third of them are absent. Of the students present, 5 leave early. How many students remain?",
    "options": [
      "15",
      "25",
      "30",
      "20"
    ],
    "correctAnswer": "15"
  },
  {
    "id": "q1-15",
    "level": 1,
    "question": "A water tank contains 3 litres of water. If 750 ml is used, how much water remains?",
    "options": [
      "2.35 L",
      "2.15 L",
      "2.50 L",
      "2.25 L"
    ],
    "correctAnswer": "2.25 L"
  },
  {
    "id": "q1-16",
    "level": 1,
    "question": "There are 6 rows in a classroom, with 5 students in each row. If 4 students are absent, how many students are present?",
    "options": [
      "24",
      "26",
      "30",
      "25"
    ],
    "correctAnswer": "26"
  },
  {
    "id": "q1-17",
    "level": 1,
    "question": "Take 16, double it, subtract 8, and divide by 4. What do you get?",
    "options": [
      "7",
      "5",
      "6",
      "4"
    ],
    "correctAnswer": "6"
  },
  {
    "id": "q1-18",
    "level": 1,
    "question": "Start with 7. Add 5, multiply the result by 3, and subtract 6.",
    "options": [
      "36",
      "24",
      "30",
      "42"
    ],
    "correctAnswer": "30"
  },
  {
    "id": "q1-19",
    "level": 1,
    "question": "A basketball player scores 4 three-pointers and 5 two-pointers. How many points does the player score?",
    "options": [
      "21",
      "20",
      "23",
      "22"
    ],
    "correctAnswer": "22"
  },
  {
    "id": "q1-20",
    "level": 1,
    "question": "A movie lasts 1 hour 45 minutes. How many minutes is that?",
    "options": [
      "100",
      "105",
      "95",
      "115"
    ],
    "correctAnswer": "105"
  },
  {
    "id": "q1-21",
    "level": 1,
    "question": "What is the value of 42 ÷ 6 + 27 × 3?",
    "options": [
      "88",
      "90",
      "86",
      "84"
    ],
    "correctAnswer": "88"
  },
  {
    "id": "q1-22",
    "level": 1,
    "question": "What is the sum of 45% of 60 and 75% of 12?",
    "options": [
      "36",
      "32",
      "38",
      "34"
    ],
    "correctAnswer": "36"
  },
  {
    "id": "q1-23",
    "level": 1,
    "question": "Find the next number in the sequence: 256, 64, 16, ?",
    "options": [
      "2",
      "6",
      "8",
      "4"
    ],
    "correctAnswer": "4"
  },
  {
    "id": "q1-24",
    "level": 1,
    "question": "Find the next number in the sequence: 1, 8, 15, ?",
    "options": [
      "20",
      "23",
      "21",
      "22"
    ],
    "correctAnswer": "22"
  },
  {
    "id": "q1-25",
    "level": 1,
    "question": "Find the odd one out: 2, 5, 8, 13, 19",
    "options": [
      "13",
      "5",
      "2",
      "8"
    ],
    "correctAnswer": "8"
  },
  {
    "id": "q1-26",
    "level": 1,
    "question": "Find the odd one out: 4, 16, 25, 27, 49",
    "options": [
      "16",
      "27",
      "25",
      "49"
    ],
    "correctAnswer": "27"
  },
  {
    "id": "q1-27",
    "level": 1,
    "question": "Start with 40. Subtract 4, divide the result by 9, add 1, and then multiply by 5. What is the final number?",
    "options": [
      "25",
      "20",
      "30",
      "35"
    ],
    "correctAnswer": "25"
  },
  {
    "id": "q1-28",
    "level": 1,
    "question": "Start with 9. Multiply by 3, add 6 to the result, and then multiply by 4. What is the final number?",
    "options": [
      "120",
      "144",
      "132",
      "126"
    ],
    "correctAnswer": "132"
  },
  {
    "id": "q1-29",
    "level": 1,
    "question": "How many decimetres are there in 3.5 kilometres?",
    "options": [
      "350 dm",
      "35,000 dm",
      "350,000 dm",
      "3,500 dm"
    ],
    "correctAnswer": "35,000 dm"
  },
  {
    "id": "q1-30",
    "level": 1,
    "question": "How many seconds are there in 5 minutes 20 seconds?",
    "options": [
      "320 seconds",
      "350 seconds",
      "300 seconds",
      "310 seconds"
    ],
    "correctAnswer": "320 seconds"
  },
  {
    "id": "q1-31",
    "level": 1,
    "question": "What is 97 × 8 + 8?",
    "options": [
      "792",
      "800",
      "776",
      "784"
    ],
    "correctAnswer": "784"
  },
  {
    "id": "q1-32",
    "level": 1,
    "question": "Find the missing term: 3, 6, 11, 18, 27, ___?",
    "options": [
      "40",
      "36",
      "38",
      "37"
    ],
    "correctAnswer": "38"
  },
  {
    "id": "q1-33",
    "level": 1,
    "question": "A pump drains water at 4 liters per second. How many liters drain in 90 seconds?",
    "options": [
      "320 liters",
      "450 liters",
      "270 liters",
      "360 liters"
    ],
    "correctAnswer": "360 liters"
  },
  {
    "id": "q1-34",
    "level": 1,
    "question": "Spot the mismatch: 8, 27, 64, 125, 215, 343.",
    "options": [
      "215",
      "214",
      "216",
      "225"
    ],
    "correctAnswer": "215"
  },
  {
    "id": "q1-35",
    "level": 1,
    "question": "Start with 50, double it, subtract 30, halve the result, then add 15. What do you get?",
    "options": [
      "35",
      "45",
      "50",
      "55"
    ],
    "correctAnswer": "50"
  },
  {
    "id": "q1-36",
    "level": 1,
    "question": "Find the missing term: 2, 6, 12, 20, 30, ___?",
    "options": [
      "42",
      "36",
      "48",
      "40"
    ],
    "correctAnswer": "42"
  },
  {
    "id": "q1-37",
    "level": 1,
    "question": "A car is moving at 45 m/s. What is its speed in km/h?",
    "options": [
      "150 km/h",
      "180 km/h",
      "135 km/h",
      "162 km/h"
    ],
    "correctAnswer": "162 km/h"
  },
  {
    "id": "q1-38",
    "level": 1,
    "question": "Calculate 45 × 45 using mental math.",
    "options": [
      "2125",
      "2045",
      "2005",
      "2025"
    ],
    "correctAnswer": "2025"
  },
  {
    "id": "q1-39",
    "level": 1,
    "question": "Take 81, find its square root, multiply by 6, subtract 4, then divide by 2. What is the result?",
    "options": [
      "20",
      "25",
      "30",
      "24"
    ],
    "correctAnswer": "25"
  },
  {
    "id": "q1-40",
    "level": 1,
    "question": "Spot the mismatch: (5, 25), (6, 36), (7, 50), (8, 64).",
    "options": [
      "(7, 50)",
      "(7,49)",
      "(6,36)",
      "(8,64)"
    ],
    "correctAnswer": "(7, 50)"
  },
  {
    "id": "q1-41",
    "level": 1,
    "question": "A motor has a power rating of 2 horsepower (hp). What is its power approximately in watts?",
    "options": [
      "2,000 W",
      "746 W",
      "2,238 W",
      "1,492 W"
    ],
    "correctAnswer": "1,492 W"
  },
  {
    "id": "q1-42",
    "level": 1,
    "question": "The temperature is 25°C. What is the equivalent temperature in Fahrenheit?",
    "options": [
      "82°F",
      "77°F",
      "72°F",
      "68°F"
    ],
    "correctAnswer": "77°F"
  },
  {
    "id": "q1-43",
    "level": 1,
    "question": "What is the next number in the sequence? 3, 6, 12, 24, ?",
    "options": [
      "54",
      "48",
      "36",
      "42"
    ],
    "correctAnswer": "48"
  },
  {
    "id": "q1-44",
    "level": 1,
    "question": "What is the next number in the sequence? 14, 21, 28, 35, ?",
    "options": [
      "41",
      "40",
      "43",
      "42"
    ],
    "correctAnswer": "42"
  },
  {
    "id": "q1-45",
    "level": 1,
    "question": "evaluate the expression: 52 – 10 ÷ 5 + 23",
    "options": [
      "31",
      "11",
      "none of the above",
      "17"
    ],
    "correctAnswer": "31"
  },
  {
    "id": "q1-46",
    "level": 1,
    "question": "Start with 729 take root of it subtract 2 from it divide by 5 add 10 subtract 15 from it",
    "options": [
      "0",
      "-15",
      "none of the above",
      "15"
    ],
    "correctAnswer": "0"
  },
  {
    "id": "q1-47",
    "level": 1,
    "question": "What is the value of: 48 / 6 + 7*3 – 5",
    "options": [
      "24",
      "22",
      "25",
      "26"
    ],
    "correctAnswer": "24"
  },
  {
    "id": "q1-48",
    "level": 1,
    "question": "calculate 106 * 347",
    "options": [
      "37842",
      "None of these",
      "35782",
      "36782"
    ],
    "correctAnswer": "36782"
  },
  {
    "id": "q1-49",
    "level": 1,
    "question": "Which number is the odd one out?",
    "options": [
      "16",
      "36",
      "25",
      "48"
    ],
    "correctAnswer": "48"
  },
  {
    "id": "q1-50",
    "level": 1,
    "question": "Find the odd one out",
    "options": [
      "21",
      "35",
      "77",
      "51"
    ],
    "correctAnswer": "51"
  },
  {
    "id": "q2-1",
    "level": 2,
    "question": "If yesterday was two days before Monday, what day of the week is tomorrow?",
    "options": [
      "Sunday",
      "Tuesday",
      "Monday",
      "Wednesday"
    ],
    "correctAnswer": "Monday"
  },
  {
    "id": "q2-2",
    "level": 2,
    "question": "A person walks 5 km North, turns right and walks 3 km, then turns right again and walks 5 km. How far and in which direction is the person from the starting point?",
    "options": [
      "3 km West",
      "3 km East",
      "5 km West",
      "5 km East"
    ],
    "correctAnswer": "3 km East"
  },
  {
    "id": "q2-3",
    "level": 2,
    "question": "On a standard 6-sided die, opposite faces sum to 7. If the top face shows 4 and the front face shows 2, what is the product of the bottom face and the back face?",
    "options": [
      "18",
      "12",
      "15",
      "16"
    ],
    "correctAnswer": "15"
  },
  {
    "id": "q2-4",
    "level": 2,
    "question": "In the cryptarithm AA + B = 75 (where AA is a two-digit number with identical digits and B is a single digit), what is the value of A + B?",
    "options": [
      "14",
      "12",
      "16",
      "15"
    ],
    "correctAnswer": "15"
  },
  {
    "id": "q2-5",
    "level": 2,
    "question": "A farmer has 17 sheep and all but 9 run away. How many sheep are left?",
    "options": [
      "9 sheep",
      "17 sheep",
      "8 sheep",
      "0 sheep"
    ],
    "correctAnswer": "9 sheep"
  },
  {
    "id": "q2-6",
    "level": 2,
    "question": "If 4 days after tomorrow is Saturday, what day of the week was 3 days before yesterday?",
    "options": [
      "Saturday",
      "Wednesday",
      "Friday",
      "Thursday"
    ],
    "correctAnswer": "Thursday"
  },
  {
    "id": "q2-7",
    "level": 2,
    "question": "Facing South, Rahul turns 90° clockwise, then turns 180° counter-clockwise. Which direction is he facing now?",
    "options": [
      "North",
      "East",
      "West",
      "South"
    ],
    "correctAnswer": "East"
  },
  {
    "id": "q2-8",
    "level": 2,
    "question": "Two standard 6-sided dice are rolled together. What is the minimum possible sum of their bottom faces?",
    "options": [
      "2",
      "4",
      "3",
      "6"
    ],
    "correctAnswer": "2"
  },
  {
    "id": "q2-9",
    "level": 2,
    "question": "In the cryptarithm X5 + Y = 42 (where X and Y are single digits), what is X × Y?",
    "options": [
      "18",
      "24",
      "21",
      "14"
    ],
    "correctAnswer": "21"
  },
  {
    "id": "q2-10",
    "level": 2,
    "question": "In the cryptarithm X5 + Y = 42 (where X and Y are single digits), what is X × Y?",
    "options": [
      "The train is powered by diesel.",
      "Electric trains do not produce smoke.",
      "The train burns smokeless fuel.",
      "Electric trains produce smoke."
    ],
    "correctAnswer": "Electric trains do not produce smoke."
  },
  {
    "id": "q2-11",
    "level": 2,
    "question": "I am an odd number. Take away one letter from my name, and I become even. What number am I?",
    "options": [
      "Seven",
      "Five",
      "Nine",
      "Three"
    ],
    "correctAnswer": "Seven"
  },
  {
    "id": "q2-12",
    "level": 2,
    "question": "If 3 cats catch 3 mice in 3 minutes, how many cats are needed to catch 9 mice in 3 minutes, assuming they all work at the same rate?",
    "options": [
      "12",
      "9",
      "6",
      "3"
    ],
    "correctAnswer": "9"
  },
  {
    "id": "q2-13",
    "level": 2,
    "question": "Using A = 1, B = 2, ..., Z = 26, what is the value of MATH?",
    "options": [
      "38",
      "44",
      "40",
      "42"
    ],
    "correctAnswer": "42"
  },
  {
    "id": "q2-14",
    "level": 2,
    "question": "If CAT = 24 using A=1, B=2, ..., Z=26, what is BAT?",
    "options": [
      "25",
      "23",
      "21",
      "27"
    ],
    "correctAnswer": "23"
  },
  {
    "id": "q2-15",
    "level": 2,
    "question": "Two opposite faces of a standard die are 2 and 5. Which number cannot share an edge with 2?",
    "options": [
      "5",
      "1",
      "4",
      "3"
    ],
    "correctAnswer": "5"
  },
  {
    "id": "q2-16",
    "level": 2,
    "question": "A standard die is rolled twice. The first roll is 3 and the second roll is 5. What is the product of the numbers shown?",
    "options": [
      "8",
      "18",
      "15",
      "12"
    ],
    "correctAnswer": "15"
  },
  {
    "id": "q2-17",
    "level": 2,
    "question": "A competition is held three days after Friday. On which day is it held?",
    "options": [
      "Monday",
      "Wednesday",
      "Tuesday",
      "Sunday"
    ],
    "correctAnswer": "Monday"
  },
  {
    "id": "q2-18",
    "level": 2,
    "question": "If January 1 is a Monday, what day of the week is January 8?",
    "options": [
      "Tuesday",
      "Wednesday",
      "Sunday",
      "Monday"
    ],
    "correctAnswer": "Monday"
  },
  {
    "id": "q2-19",
    "level": 2,
    "question": "A person walks 6 m east, then 6 m south, and then 6 m west. Where is the person relative to the starting point?",
    "options": [
      "6 m north",
      "6 m south",
      "12 m east",
      "At the starting point"
    ],
    "correctAnswer": "6 m south"
  },
  {
    "id": "q2-20",
    "level": 2,
    "question": "Neha faces West. She turns left, then turns left again. Which direction is she facing?",
    "options": [
      "West",
      "South",
      "East",
      "North"
    ],
    "correctAnswer": "East"
  },
  {
    "id": "q2-21",
    "level": 2,
    "question": "What has a face and two hands but no arms or legs?",
    "options": [
      "A clock",
      "A thermometer",
      "A compass",
      "A sundial"
    ],
    "correctAnswer": "A clock"
  },
  {
    "id": "q2-22",
    "level": 2,
    "question": "What has words but never speaks?",
    "options": [
      "A radio",
      "A podcast",
      "A book",
      "An audiobook"
    ],
    "correctAnswer": "A book"
  },
  {
    "id": "q2-23",
    "level": 2,
    "question": "If the two-digit number AB satisfies AB × 11 = 132, what is A + B?",
    "options": [
      "5",
      "3",
      "4",
      "2"
    ],
    "correctAnswer": "3"
  },
  {
    "id": "q2-24",
    "level": 2,
    "question": "If the two-digit numbers 1B and 1A satisfy 1B + 1A = 26, where A and B are non-zero digits and B > A, what is the largest possible value of B/A?",
    "options": [
      "2",
      "5",
      "4",
      "3"
    ],
    "correctAnswer": "5"
  },
  {
    "id": "q2-25",
    "level": 2,
    "question": "On a standard six-faced die, opposite faces always add up to 7. If the top face shows 1, which number is on the bottom face?",
    "options": [
      "2",
      "6",
      "5",
      "4"
    ],
    "correctAnswer": "6"
  },
  {
    "id": "q2-26",
    "level": 2,
    "question": "In one position of a die, the visible faces are 1, 2, and 3. In another position, the visible faces are 1, 2, and 5. Which pair of numbers is visible together and adjacent in both positions?",
    "options": [
      "2 and 5",
      "1 and 3",
      "3 and 5",
      "1 and 2"
    ],
    "correctAnswer": "1 and 2"
  },
  {
    "id": "q2-27",
    "level": 2,
    "question": "If today is Tuesday, what day will it be 10 days from today?",
    "options": [
      "Thursday",
      "Saturday",
      "Friday",
      "Sunday"
    ],
    "correctAnswer": "Friday"
  },
  {
    "id": "q2-28",
    "level": 2,
    "question": "If yesterday was Wednesday, what day will it be three days after tomorrow?",
    "options": [
      "Sunday",
      "Monday",
      "Wednesday",
      "Tuesday"
    ],
    "correctAnswer": "Monday"
  },
  {
    "id": "q2-29",
    "level": 2,
    "question": "Manoj is facing North. He turns 90° to his left and walks 24 metres. He then turns 90° to his right and walks 10 metres. How far is he from his starting point, and in which direction?",
    "options": [
      "34 metres, North-West",
      "24 metres, North-West",
      "26 metres, North-East",
      "26 metres, North-West"
    ],
    "correctAnswer": "26 metres, North-West"
  },
  {
    "id": "q2-30",
    "level": 2,
    "question": "Arjun is facing North-East. He turns 90° to his right and walks 20 metres. He then turns 180° to his left and walks 23 metres. Finally, he turns 90° to his right and walks 4 metres. How far is he from his starting point?",
    "options": [
      "5 metres",
      "7 metres",
      "3 metres",
      "4 metres"
    ],
    "correctAnswer": "5 metres"
  },
  {
    "id": "q2-31",
    "level": 2,
    "question": "On a standard die (opposite faces sum to 7), the top face shows 2, and the front face shows 6. What is the sum of the bottom and back faces?",
    "options": [
      "6",
      "5",
      "8",
      "7"
    ],
    "correctAnswer": "6"
  },
  {
    "id": "q2-32",
    "level": 2,
    "question": "If today is Sunday, what day of the week was it 45 days ago?",
    "options": [
      "Tuesday",
      "Thursday",
      "Friday",
      "Wednesday"
    ],
    "correctAnswer": "Thursday"
  },
  {
    "id": "q2-33",
    "level": 2,
    "question": "A man walks 6 m South, turns left and walks 6 m, then turns 90° left again and walks 6 m. In which direction is he from his starting point?",
    "options": [
      "South",
      "East",
      "North",
      "West"
    ],
    "correctAnswer": "East"
  },
  {
    "id": "q2-34",
    "level": 2,
    "question": "You have two ropes; each burns unevenly but takes exactly 1 hour to burn end to end. How can you measure exactly 45 minutes?",
    "options": [
      "Light one rope at one end and the other at both ends, then switch after 30 minutes",
      "Light one rope at both ends and the other rope at one end at the same time",
      "Light both ropes at both ends and wait",
      "Light one rope at one end and wait 45 minutes"
    ],
    "correctAnswer": "Light one rope at both ends and the other rope at one end at the same time"
  },
  {
    "id": "q2-35",
    "level": 2,
    "question": "In the cryptarithm XY × Y = ZZZ (X, Y, Z distinct non-zero digits), what is the value of Z?",
    "options": [
      "2",
      "7",
      "1",
      "3"
    ],
    "correctAnswer": "1"
  },
  {
    "id": "q2-36",
    "level": 2,
    "question": "Facing North, a person turns 225° clockwise, then 45° counter-clockwise. Which direction do they now face?",
    "options": [
      "North",
      "West",
      "East",
      "South"
    ],
    "correctAnswer": "South"
  },
  {
    "id": "q2-37",
    "level": 2,
    "question": "A man looking at a photograph says: \"Brothers and sisters I have none, but this man's father is my father's son.\" Whose photograph is he looking at?",
    "options": [
      "Himself",
      "His brother",
      "His father",
      "His own son"
    ],
    "correctAnswer": "His own son"
  },
  {
    "id": "q2-38",
    "level": 2,
    "question": "Two fair dice are rolled together. What is the probability that their sum equals 8?",
    "options": [
      "5/36",
      "1/6",
      "1/9",
      "1/12"
    ],
    "correctAnswer": "5/36"
  },
  {
    "id": "q2-39",
    "level": 2,
    "question": "In the cryptarithm AB + AB = CD, where B = 6, D = 2, and A, B, C, D are distinct digits, what is the value of A?",
    "options": [
      "6",
      "3",
      "4",
      "5"
    ],
    "correctAnswer": "4"
  },
  {
    "id": "q2-40",
    "level": 2,
    "question": "A recurring meeting is held every 9 days, starting on a Monday. On what day of the week does the 10th meeting fall?",
    "options": [
      "Thursday",
      "Saturday",
      "Friday",
      "Monday"
    ],
    "correctAnswer": "Friday"
  },
  {
    "id": "q2-41",
    "level": 2,
    "question": "A man looks at a photograph and says: \"Brothers and sisters, I have none. But that man's father is my father's son.\" Who is the man in the photograph?",
    "options": [
      "Himself",
      "His brother",
      "His son",
      "His father"
    ],
    "correctAnswer": "His son"
  },
  {
    "id": "q2-42",
    "level": 2,
    "question": "Three friends pay ₹30 for a room, ₹10 each. Later, the hotel manager realizes the room should have cost ₹25, so he gives ₹5 to the bellboy to return. The bellboy keeps ₹2 and gives each friend ₹1. So each friend effectively paid ₹9: The bellboy kept ₹2: Where did the missing ₹1 go?",
    "options": [
      "There is no missing ₹1",
      "It was accidentally lost",
      "The manager kept it",
      "The bellboy stole it"
    ],
    "correctAnswer": "There is no missing ₹1"
  },
  {
    "id": "q2-43",
    "level": 2,
    "question": "If A and B represent different digits, find A + B",
    "options": [
      "9",
      "10",
      "7",
      "8"
    ],
    "correctAnswer": "10"
  },
  {
    "id": "q2-44",
    "level": 2,
    "question": "If A and B represent different digits, find A * B:",
    "options": [
      "49",
      "35",
      "28",
      "42"
    ],
    "correctAnswer": "35"
  },
  {
    "id": "q2-45",
    "level": 2,
    "question": "Initially: 1 is on top 2 is facing you 3 is on the right The die is then rotated as follows: 1.     The right face moves to the top. 2.     The die is then rotated so that the front face moves to the top. Which number is facing you after both rotations?",
    "options": [
      "5",
      "2",
      "1",
      "4"
    ],
    "correctAnswer": "5"
  },
  {
    "id": "q2-46",
    "level": 2,
    "question": "You are outside a closed room. Outside the room are three switches. Inside the room is one light bulb. Only one switch controls the bulb. You may manipulate the switches however you want, but you may enter the room only once. How can you determine which switch controls the bulb?",
    "options": [
      "Turn on two switches, wait, then enter",
      "It is impossible",
      "Turn on all three switches and enter",
      "Turn on one switch, wait, turn it off, turn on another, then enter"
    ],
    "correctAnswer": "Turn on one switch, wait, turn it off, turn on another, then enter"
  },
  {
    "id": "q2-47",
    "level": 2,
    "question": "Turn on Switch 1 briefly, turn it off, turn on Switch 2, then enter—the lit bulb is Switch 2, warm bulb is Switch 1, and cold bulb is Switch 3. 7. If yesterday was Friday, what day will it be 4 days after tomorrow?",
    "options": [
      "Wednesday",
      "Tuesday",
      "Thursday",
      "Friday"
    ],
    "correctAnswer": "Thursday"
  },
  {
    "id": "q2-48",
    "level": 2,
    "question": "What day of the week is February 1 if January 1 is Monday?",
    "options": [
      "Thursday",
      "Friday",
      "Tuesday",
      "Wednesday"
    ],
    "correctAnswer": "Thursday"
  },
  {
    "id": "q2-49",
    "level": 2,
    "question": "Rahul walks 10 m north, then turns right and walks 5 m. He then turns right again and walks 10 m, followed by a left turn and walks 3 m. Which direction is Rahul facing now?",
    "options": [
      "South",
      "East",
      "North",
      "West"
    ],
    "correctAnswer": "East"
  },
  {
    "id": "q2-50",
    "level": 2,
    "question": "A person walks 6 m north, then 8 m east, then 6 m south, and finally 3 m west. Where is the person relative to their starting point?",
    "options": [
      "11 m West",
      "5 m East",
      "5 m West",
      "11 m East"
    ],
    "correctAnswer": "5 m East"
  },
  {
    "id": "q3-1",
    "level": 3,
    "question": "In 4 years, a brother will be twice as old as he was 5 years ago. How old is he today?",
    "options": [
      "14 years old",
      "12 years old",
      "15 years old",
      "16 years old"
    ],
    "correctAnswer": "14 years old"
  },
  {
    "id": "q3-2",
    "level": 3,
    "question": "A car travels 60 miles at 30 mph, and then another 60 miles at 60 mph. What is the average speed of the car for the entire 120-mile trip?",
    "options": [
      "45 mph",
      "30 mph",
      "50 mph",
      "40 mph"
    ],
    "correctAnswer": "40 mph"
  },
  {
    "id": "q3-3",
    "level": 3,
    "question": "Two standard 6-sided dice are rolled. What is the probability of getting a sum of 8?",
    "options": [
      "1/9",
      "1/6",
      "5/36",
      "1/12"
    ],
    "correctAnswer": "5/36"
  },
  {
    "id": "q3-4",
    "level": 3,
    "question": "Person A says: 'At least one of us is a Liar' (a Liar always lies, a Truth-teller always tells the truth). What are Person A and Person B?",
    "options": [
      "A is a Truth-teller, B is a Liar",
      "A is a Liar, B is a Truth-teller",
      "Both are Truth-tellers",
      "Both are Liars"
    ],
    "correctAnswer": "A is a Truth-teller, B is a Liar"
  },
  {
    "id": "q3-5",
    "level": 3,
    "question": "A cube painted red on all outer surfaces is cut into 27 smaller equal cubes (3×3×3). How many smaller cubes have exactly 2 red faces?",
    "options": [
      "12 cubes",
      "16 cubes",
      "8 cubes",
      "24 cubes"
    ],
    "correctAnswer": "12 cubes"
  },
  {
    "id": "q3-6",
    "level": 3,
    "question": "A mother is currently 3 times as old as her daughter. In 12 years, the mother will be twice as old as her daughter. How old is the daughter now?",
    "options": [
      "16 years old",
      "14 years old",
      "12 years old",
      "10 years old"
    ],
    "correctAnswer": "12 years old"
  },
  {
    "id": "q3-7",
    "level": 3,
    "question": "A train 100 meters long passes a streetlight completely in 5 seconds. What is the speed of the train in km/h?",
    "options": [
      "18 km/h",
      "72 km/h",
      "36 km/h",
      "60 km/h"
    ],
    "correctAnswer": "72 km/h"
  },
  {
    "id": "q3-8",
    "level": 3,
    "question": "A bag contains 3 red balls, 4 blue balls, and 5 green balls. If one ball is drawn at random, what is the probability that it is NOT blue?",
    "options": [
      "3/4",
      "5/12",
      "1/3",
      "2/3"
    ],
    "correctAnswer": "2/3"
  },
  {
    "id": "q3-9",
    "level": 3,
    "question": "Alex says: 'Both of us are Knaves' (Knights always tell the truth, Knaves always lie). What are Alex and Bob?",
    "options": [
      "Both are Knights",
      "Both are Knaves",
      "Alex is a Knave, Bob is a Knight",
      "Alex is a Knight, Bob is a Knave"
    ],
    "correctAnswer": "Alex is a Knave, Bob is a Knight"
  },
  {
    "id": "q3-10",
    "level": 3,
    "question": "How many total triangles of all sizes are contained in a standard 5-pointed star (pentagram)?",
    "options": [
      "8 triangles",
      "5 triangles",
      "12 triangles",
      "10 triangles"
    ],
    "correctAnswer": "10 triangles"
  },
  {
    "id": "q3-11",
    "level": 3,
    "question": "A box contains 5 green, 3 yellow, and 2 red balls. If one ball is picked randomly, what is the probability that it is not red?",
    "options": [
      "1/5",
      "9/10",
      "3/5",
      "4/5"
    ],
    "correctAnswer": "4/5"
  },
  {
    "id": "q3-12",
    "level": 3,
    "question": "A fair coin is tossed three times. What is the probability of getting at least one head?",
    "options": [
      "1/8",
      "3/8",
      "7/8",
      "5/8"
    ],
    "correctAnswer": "7/8"
  },
  {
    "id": "q3-13",
    "level": 3,
    "question": "A father and son have a total age of 56 years. The father is three times as old as the son. How old is the father?",
    "options": [
      "40 years",
      "42 years",
      "44 years",
      "38 years"
    ],
    "correctAnswer": "42 years"
  },
  {
    "id": "q3-14",
    "level": 3,
    "question": "A mother is 5 times as old as her daughter. After 8 years, the mother will be 3 times as old as her daughter. How old is the daughter now?",
    "options": [
      "5 years",
      "6 years",
      "8 years",
      "4 years"
    ],
    "correctAnswer": "8 years"
  },
  {
    "id": "q3-15",
    "level": 3,
    "question": "A large cube is made up of 3 × 3 × 3 smaller cubes. How many smaller cubes are completely hidden inside and have no face exposed?",
    "options": [
      "1",
      "0",
      "6",
      "8"
    ],
    "correctAnswer": "1"
  },
  {
    "id": "q3-16",
    "level": 3,
    "question": "A square paper is folded exactly once in half. A single hole is punched through both layers. When the paper is completely unfolded, how many holes will there be?",
    "options": [
      "2",
      "4",
      "3",
      "1"
    ],
    "correctAnswer": "2"
  },
  {
    "id": "q3-17",
    "level": 3,
    "question": "A bus travels at 45 km/h. How much time does it need to cover 15 km?",
    "options": [
      "15 minutes",
      "30 minutes",
      "20 minutes",
      "25 minutes"
    ],
    "correctAnswer": "20 minutes"
  },
  {
    "id": "q3-18",
    "level": 3,
    "question": "Two cyclists start from the same point in opposite directions. One travels at 12 km/h and the other at 8 km/h. How far apart will they be after 30 minutes?",
    "options": [
      "10 km",
      "12 km",
      "20 km",
      "8 km"
    ],
    "correctAnswer": "10 km"
  },
  {
    "id": "q3-19",
    "level": 3,
    "question": "Three people — A, B, and C — are either truth-tellers or liars. A says: “B is a liar.” B says: “C is a liar.” C says: “A and B are of different types.” Who is the only truth-teller?",
    "options": [
      "B",
      "A",
      "C",
      "None"
    ],
    "correctAnswer": "B"
  },
  {
    "id": "q3-20",
    "level": 3,
    "question": "A and B are either truth-tellers or liars. A says: “B is a liar.”\nB says: “We are both truth-tellers.” Who is telling the truth?",
    "options": [
      "Neither A nor B",
      "Only A",
      "Both A and B",
      "Only B"
    ],
    "correctAnswer": "Only A"
  },
  {
    "id": "q3-21",
    "level": 3,
    "question": "Two fair dice are rolled simultaneously. What is the probability that their sum is 10?",
    "options": [
      "1/9",
      "1/12",
      "1/6",
      "1/18"
    ],
    "correctAnswer": "1/12"
  },
  {
    "id": "q3-22",
    "level": 3,
    "question": "Three fair coins are tossed together. What is the probability of getting exactly two heads?",
    "options": [
      "3/8",
      "1/4",
      "1/2",
      "5/8"
    ],
    "correctAnswer": "3/8"
  },
  {
    "id": "q3-23",
    "level": 3,
    "question": "A father is currently four times as old as his son. After 20 years, he will be twice as old as his son. What is the father's present age?",
    "options": [
      "44 years",
      "40 years",
      "30 years",
      "36 years"
    ],
    "correctAnswer": "40 years"
  },
  {
    "id": "q3-24",
    "level": 3,
    "question": "Five years ago, Divya was twice as old as her younger brother Bhaskar. Seven years from now, the sum of their ages will be 30 years. What is Bhaskar's present age?",
    "options": [
      "6 years",
      "7 years",
      "8 years",
      "5 years"
    ],
    "correctAnswer": "7 years"
  },
  {
    "id": "q3-25",
    "level": 3,
    "question": "A cube is painted on all six faces and then cut into 64 identical smaller cubes. How many of the smaller cubes have paint on exactly two faces?",
    "options": [
      "20",
      "24",
      "16",
      "32"
    ],
    "correctAnswer": "24"
  },
  {
    "id": "q3-26",
    "level": 3,
    "question": "A cuboid measuring 12 cm × 8 cm × 4 cm is cut into the largest possible identical cubes without any material being left over. How many cubes are formed?",
    "options": [
      "6",
      "8",
      "12",
      "4"
    ],
    "correctAnswer": "6"
  },
  {
    "id": "q3-27",
    "level": 3,
    "question": "A train is 180 metres long and travels at 72 km/h. How many seconds will it take to completely pass a stationary signal pole?",
    "options": [
      "10 seconds",
      "8 seconds",
      "9 seconds",
      "7 seconds"
    ],
    "correctAnswer": "9 seconds"
  },
  {
    "id": "q3-28",
    "level": 3,
    "question": "A cyclist travels 14 kilometres 400 metres at a constant speed of 27 km/h. How many minutes does the journey take?",
    "options": [
      "30 minutes",
      "36 minutes",
      "28 minutes",
      "32 minutes"
    ],
    "correctAnswer": "32 minutes"
  },
  {
    "id": "q3-29",
    "level": 3,
    "question": "Who is the truth-teller?",
    "options": [
      "A and B",
      "Only A",
      "Only B",
      "Only C"
    ],
    "correctAnswer": "Only B"
  },
  {
    "id": "q3-30",
    "level": 3,
    "question": "Who is the truth-teller?",
    "options": [
      "Only A",
      "Only C",
      "Only B",
      "B and C"
    ],
    "correctAnswer": "Only B"
  },
  {
    "id": "q3-31",
    "level": 3,
    "question": "A 180-meter-long train crosses a signal pole in 12 seconds. What is the train's speed in km/h?",
    "options": [
      "45 km/h",
      "54 km/h",
      "72 km/h",
      "60 km/h"
    ],
    "correctAnswer": "54 km/h"
  },
  {
    "id": "q3-32",
    "level": 3,
    "question": "R says, \"S always lies.\" S says, \"R and I are both liars.\" If each person is either always truthful or always lying, what are R and S?",
    "options": [
      "Both are Truth-tellers",
      "Both are Liars",
      "R is a Truth-teller, S is a Liar",
      "R is a Liar, S is a Truth-teller"
    ],
    "correctAnswer": "R is a Truth-teller, S is a Liar"
  },
  {
    "id": "q3-33",
    "level": 3,
    "question": "A man is 5 times as old as his daughter today. In 12 years, he will be 3 times as old as her. What is the man's current age?",
    "options": [
      "48 years old",
      "54 years old",
      "60 years old",
      "72 years old"
    ],
    "correctAnswer": "60 years old"
  },
  {
    "id": "q3-34",
    "level": 3,
    "question": "A cube with 6-unit sides is painted blue on every face and cut into 1×1×1 cubes. How many small cubes have exactly one painted face?",
    "options": [
      "80 cubes",
      "96 cubes",
      "120 cubes",
      "100 cubes"
    ],
    "correctAnswer": "96 cubes"
  },
  {
    "id": "q3-35",
    "level": 3,
    "question": "A box holds 3 green, 4 yellow, and 5 pink balls. One ball is drawn at random. What is the probability it is NOT pink?",
    "options": [
      "5/12",
      "1/2",
      "2/3",
      "7/12"
    ],
    "correctAnswer": "7/12"
  },
  {
    "id": "q3-36",
    "level": 3,
    "question": "A says, \"Both of us are the same type.\" B says, \"We are of different types.\" If each is either a Knight (always truthful) or a Knave (always lying), what are A and B?",
    "options": [
      "A is a Knight, B is a Knave",
      "A is a Knave, B is a Knight",
      "Both are Knaves",
      "Both are Knights"
    ],
    "correctAnswer": "A is a Knave, B is a Knight"
  },
  {
    "id": "q3-37",
    "level": 3,
    "question": "How many diagonals does a regular decagon (a 10-sided polygon) have?",
    "options": [
      "30 diagonals",
      "36 diagonals",
      "28 diagonals",
      "35 diagonals"
    ],
    "correctAnswer": "35 diagonals"
  },
  {
    "id": "q3-38",
    "level": 3,
    "question": "The combined age of a father and son is 48. Six years ago, the father was 5 times as old as the son. What is the son's current age?",
    "options": [
      "12 years old",
      "14 years old",
      "10 years old",
      "16 years old"
    ],
    "correctAnswer": "12 years old"
  },
  {
    "id": "q3-39",
    "level": 3,
    "question": "A committee of 3 people is chosen at random from a group of 5 men and 4 women. What is the probability that all 3 chosen are men?",
    "options": [
      "1/9",
      "5/42",
      "1/6",
      "5/36"
    ],
    "correctAnswer": "5/42"
  },
  {
    "id": "q3-40",
    "level": 3,
    "question": "Two cyclists start from the same point at the same time — one riding North at 12 km/h and the other riding East at 16 km/h. How far apart are they after 2.5 hours?",
    "options": [
      "50 km",
      "52 km",
      "40 km",
      "48 km"
    ],
    "correctAnswer": "50 km"
  },
  {
    "id": "q3-41",
    "level": 3,
    "question": "A father is 4 times as old as his son today. In 6 years, the father will be twice as old as his son. How old is the son today?",
    "options": [
      "8 years",
      "6 years",
      "3 years",
      "4 years"
    ],
    "correctAnswer": "3 years"
  },
  {
    "id": "q3-42",
    "level": 3,
    "question": "A mother is 24 years older than her daughter. In 4 years, the mother will be 3 times as old as her daughter. How old is the daughter today?",
    "options": [
      "8 years",
      "10 years",
      "6 years",
      "12 years"
    ],
    "correctAnswer": "8 years"
  },
  {
    "id": "q3-43",
    "level": 3,
    "question": "Two fair six-sided dice are rolled simultaneously. What is the probability that the sum is 9?",
    "options": [
      "1/18",
      "1/8",
      "1/9",
      "3/36"
    ],
    "correctAnswer": "1/9"
  },
  {
    "id": "q3-44",
    "level": 3,
    "question": "A bag contains 5 red, 4 blue, and 3 green balls. Two balls are drawn without replacement. What is the probability that both balls are of the same color?",
    "options": [
      "17/66",
      "7/22",
      "5/22",
      "19/66"
    ],
    "correctAnswer": "19/66"
  },
  {
    "id": "q3-45",
    "level": 3,
    "question": "A cube has A on the top, B on the front, and C on the right. The cube is rotated so that: 1.     The right face moves to the top. 2.     The cube is then rotated so that the front face moves to the right. Which letter is now on the front?",
    "options": [
      "A",
      "Cannot be determined",
      "B",
      "C"
    ],
    "correctAnswer": "A"
  },
  {
    "id": "q3-46",
    "level": 3,
    "question": "A cube has numbers 1, 2, 3, 4, 5, 6 on its six faces. In one position: 1 is on top 2 is in front 3 is on the right The cube is rotated so that: 1.     The right face moves to the top. 2.     The front face moves to the right. 3.     The cube is then rotated so that the bottom face moves to the front. Which number is now on the top?",
    "options": [
      "3",
      "6",
      "2",
      "1"
    ],
    "correctAnswer": "3"
  },
  {
    "id": "q3-47",
    "level": 3,
    "question": "A car travels 60 km at 30 km/h and then another 60 km at 60 km/h. What is the car's average speed for the entire journey?",
    "options": [
      "48 km/h",
      "45 km/h",
      "36 km/h",
      "40 km/h"
    ],
    "correctAnswer": "40 km/h"
  },
  {
    "id": "q3-48",
    "level": 3,
    "question": "A train travels at 60 km/h. Another train starts from the same station 30 minutes later at 90 km/h, travelling in the same direction. How long will the second train take to catch the first?",
    "options": [
      "60 minutes",
      "45 minutes",
      "90 minutes",
      "30 minutes"
    ],
    "correctAnswer": "60 minutes"
  },
  {
    "id": "q3-49",
    "level": 3,
    "question": "A passenger sitting in a train A moving at 90 km/h observes another train B moving in the opposite direction for 8 seconds. If train B travels at 54 km/h, what is the length of train B?",
    "options": [
      "200 m",
      "320 m",
      "80 m",
      "120 m"
    ],
    "correctAnswer": "320 m"
  },
  {
    "id": "q3-50",
    "level": 3,
    "question": "The Three Suspects Three suspects — A, B, and C — are questioned about who stole a diamond. Each person is either a truth-teller (always tells the truth) or a liar (always lies). They say: A: \"B is lying.\" B: \"C is lying.\" C: \"A and B are both lying.\" Who is telling the truth?",
    "options": [
      "Only A",
      "A and C",
      "Only B",
      "Only C"
    ],
    "correctAnswer": "Only B"
  }
];

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
