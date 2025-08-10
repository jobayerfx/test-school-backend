// demo-questions.js
// Run: node demo-questions.js (or npx ts-node demo-questions.js if TS model)
// Uses MONGO_URI env var or defaults to test_schools

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb+srv://root:password_123@cluster0.h8pjzno.mongodb.net/test_schools?retryWrites=true&w=majority&appName=Cluster0';

// 22 competencies × 6 levels = 132 questions
const competencies = [
  'Critical Thinking', 'Problem Solving', 'Communication Skills', 'Collaboration & Teamwork',
  'Creativity & Innovation', 'Adaptability', 'Time Management', 'Self-Motivation',
  'Decision Making', 'Emotional Intelligence', 'Leadership Skills', 'Digital Literacy',
  'Numeracy Skills', 'Literacy & Comprehension', 'Analytical Reasoning', 'Attention to Detail',
  'Research Skills', 'Conflict Resolution', 'Learning Agility', 'Goal Setting',
  'Resilience & Stress Management', 'Ethics & Integrity'
];

const levelNames = {
  1: 'A1',
  2: 'A2',
  3: 'B1',
  4: 'B2',
  5: 'C1',
  6: 'C2',
};

function generateQuestions() {
  const questions: any[] = [];

  competencies.forEach((competency) => {
    for (let numericLevel = 1; numericLevel <= 6; numericLevel++) {
      const levelName = levelNames[numericLevel as keyof typeof levelNames];

      questions.push({
        competency,
        level: levelName,
        questionText: `(${competency} — Level ${levelName}) Which option best represents ${competency.toLowerCase()} at this level?`,
        options: [
          `An example of ${competency.toLowerCase()} at Level ${levelName}`,
          'An unrelated action',
          'A weak/basic example',
          'A clearly incorrect statement'
        ],
        correctAnswer: 0 // matches schema field
      });
    }
  });

  return questions;
}


(async function seed() {
  console.log('Connecting to MongoDB at', MONGO_URI);
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }

  let QuestionModel;
  const modelPath = path.join(__dirname, 'src', 'models', 'question.model.ts')

  console.log('Found existing model file:', modelPath);

  if (!QuestionModel) {
    const schema = new mongoose.Schema({
      competency: { type: String, required: true },
      level: { type: String, required: true },
      questionText: { type: String, required: true },
      options: { type: [String], required: true },
      correctAnswer: { type: Number, required: true },
      createdAt: { type: Date, default: Date.now }
    });
    QuestionModel = mongoose.models.Question || mongoose.model('Question', schema);
  }

  const questions = generateQuestions();
  console.log(`Prepared ${questions.length} questions.`);

  try {
    await QuestionModel.deleteMany({ competency: { $in: competencies } });
    console.log('🗑 Cleared existing matching questions.');
    const inserted = await QuestionModel.insertMany(questions);
    console.log(`✅ Inserted ${inserted.length} questions successfully.`);
  } catch (err) {
    console.error('❌ Error inserting questions:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected. Seeder complete.');
    process.exit(0);
  }
})();
