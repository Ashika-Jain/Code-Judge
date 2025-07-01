const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const axios = require('axios');

// Compiler service URL (will be set via environment variable)
const COMPILER_SERVICE_URL = process.env.COMPILER_SERVICE_URL || 'http://localhost:5001';

// Submit code
exports.submitCode = async (req, res) => {
  try {
    const { problemId, code, language, input } = req.body;
    const userId = req.user.id;

    // Get problem details
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Create submission
    const submission = new Submission({
      problemId,
      userId,
      code,
      language,
      totalTestCases: problem.testCases.length
    });

    // Save submission
    await submission.save();

    // Process submission
    try {
      // If custom input is provided, run only with that input
      if (input && input.trim() !== "") {
        const response = await axios.post(`${COMPILER_SERVICE_URL}/run`, {
          code,
          language,
          input
        });
        
        return res.json({ 
          customInput: input, 
          output: response.data.output 
        });
      }

      // Otherwise, run all test cases
      let passedCases = 0;
      let failed = false;
      
      for (const testCase of problem.testCases) {
        try {
          const response = await axios.post(`${COMPILER_SERVICE_URL}/run`, {
            code,
            language,
            input: testCase.input
          });
          
          const output = response.data.output;
          console.log('Test case input:', testCase.input);
          console.log('Expected output:', testCase.output);
          console.log('Actual output:', output);
          console.log('Comparison:', output.trim() === testCase.output.trim());
          
          if (output.trim() === testCase.output.trim()) {
            passedCases++;
          } else {
            submission.status = 'wrong_answer';
            submission.testCasesPassed = passedCases;
            await submission.save();
            return res.json(submission);
          }
        } catch (error) {
          submission.status = 'runtime_error';
          submission.errorMessage = error.response?.data?.error || error.message;
          await submission.save();
          return res.json(submission);
        }
      }

      // Update submission status
      submission.testCasesPassed = passedCases;
      submission.status = 'accepted';
      await submission.save();

      res.json(submission);
    } catch (error) {
      submission.status = 'compilation_error';
      submission.errorMessage = error.response?.data?.error || error.message;
      await submission.save();
      res.status(400).json({ message: error.response?.data?.error || error.message });
    }
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ message: 'Error processing submission' });
  }
};

// Get user's submissions
exports.getUserSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.user.id })
      .populate('problemId', 'title')
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submissions' });
  }
};

// Get problem submissions
exports.getProblemSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ problemId: req.params.problemId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submissions' });
  }
}; 