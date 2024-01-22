const sQuestion = require("../models/postQuestion");
const bcrypt = require('bcrypt');

 

const getRandomQuestion = async (req, res) => {
    try {
        const count = await sQuestion.countDocuments();
        const randomIndex = Math.floor(Math.random() * count);
        const randomQuestion = await sQuestion.findOne().skip(randomIndex);

        if (randomQuestion) {
            res.render('seeQuestion', { Squestion: randomQuestion }); // Render the page with the fetched question
        } else {
            res.status(404).render('error', { message: 'Question not found' }); // Render an error page or handle as needed
        }
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'Server error' }); // Render an error page or handle as needed
    }
};

module.exports = {
    getRandomQuestion,
};


