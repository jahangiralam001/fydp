const sQuestion = require("../models/postQuestion");
const multer = require('multer');
const bcrypt = require('bcrypt');

 

const getRandomQuestion = async (req, res) => {
    try {
        // Count only documents where 'is_answered' is not 1
        const count = await sQuestion.countDocuments({ is_answered: { $ne: 1 } });

        // If there are no unanswered questions, handle this case
        if (count === 0) {
            res.status(404).render('error', { message: 'No unanswered questions available' });
            return;
        }

        const randomIndex = Math.floor(Math.random() * count);
        const randomQuestion = await sQuestion.findOne({ is_answered: { $ne: 1 } }).skip(randomIndex);

        if (randomQuestion) {
            res.render('seeQuestion', { Squestion: randomQuestion });
        } else {
            res.status(404).render('error', { message: 'Question not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'Server error' });
    }
};



const submitAnswer = async (req, res) => {
    try {
        const questionId = req.body.questionId;
        const textAnswer = req.body.textAnswer;
        const fileData = req.file ? req.file.buffer.toString('base64') : null;
        const contentType = req.file ? req.file.mimetype : null;
        
        console.log("Session data: ", req.session);
const userId = await req.session.user_id;
console.log("User ID: ", userId);

        // Find the question document by ID and update it
        const updateResponse = await sQuestion.findByIdAndUpdate(questionId, {
            $set: {
                answer: textAnswer,
                answer_file: {
                    data: fileData,
                    contentType: contentType,
                },
                is_answered: 1,
                answered_by: userId
            }
        }, { new: true }); 

        // Log the response from the database
        console.log("Database Update Response:", updateResponse.answered_by);

        res.redirect('/expert/seeQuestion'); // Redirect after successful submission
    } catch (error) {
        console.error("MongoDB Error:", error);
        res.status(500).send("Error submitting answer");
    }
};











module.exports = {
    getRandomQuestion,
    submitAnswer
};


