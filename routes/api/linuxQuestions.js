const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Importing Schema for Linux Questions
const LinuxQuestion = require("../../models/LinuxQuestion");

//Routes

//@type     GET
//@route    api/linux/questions
//@desc     For getting all linux based questions.
//@access   PUBLIC
router.get("/", (req, res) => {
  LinuxQuestion.find()
    .then(questions => {
      if (questions.length === 0) {
        return res.json({ error: "No questions found based on linux." });
      }
      res.json(questions);
    })
    .catch(err => console.log(err));
});

//@type     POST
//@route    api/linux/questions
//@desc     For posting linux based questions.
//@access   PRIVATE
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let linuxQuestion = {};
    if (req.body.description) linuxQuestion.description = req.body.description;
    if (req.body.code) linuxQuestion.code = req.body.code;
    if (req.body.error) linuxQuestion.error = req.body.error;
    linuxQuestion.user = req.user.id;
    let newLinuxQuestion = new LinuxQuestion(linuxQuestion);

    newLinuxQuestion
      .save()
      .then(newQuestion => res.json(newQuestion))
      .catch(err => console.log(err));
  }
);

//@type     DELETE
//@route    api/linux/questions/:question_id
//@desc     For deleting linux based questions using the question_id passed through parameter.
//@access   PRIVATE
router.delete(
  "/:question_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    LinuxQuestion.findById(req.params.question_id)
      .then(question => {
        if (!question) {
          return res.json({ error: "Question not found." });
        } else {
          if (String(question.user) == String(req.user.id)) {
            LinuxQuestion.findByIdAndRemove(req.params.question_id)
              .then(() =>
                res.json({
                  error: false,
                  success: "Question deleted successfully!"
                })
              )
              .catch(err => console.log(err));
          } else {
            res.json({
              error: `You are not allowed to delete others question.`
            });
          }
        }
      })
      .catch(err => console.log(err));
  }
);

//@type     POST
//@route    api/linux/questions/:question_id/love
//@desc     For posting love on linux based questions using question_id passed through parameter.
//@access   PRIVATE
router.post(
  "/:question_id/love",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    LinuxQuestion.findById(req.params.question_id)
      .then(question => {
        if (!question) {
          return res.json({
            error: `Your love can't be posted, since the question is not found`
          });
        } else {
          let lovedIndex = question.lovedby
            .map(love => String(love.user))
            .indexOf(String(req.user.id));
          //If already posted love
          if (lovedIndex !== -1) {
            question.lovedby.splice(lovedIndex, 1);
          }
          //If the question is not posted love
          else {
            question.lovedby.unshift({ user: req.user.id });
          }
          question
            .save()
            .then(savedQuestionWithLove => res.json(savedQuestionWithLove))
            .catch(err => console.log(err));
        }
      })
      .catch(err => console.log(err));
  }
);

//@type     POST
//@route    api/linux/questions/:question_id/answers/
//@desc     For posting answers on linux based questions using question_id passed through parameter.
//@access   PRIVATE
router.post(
  "/:question_id/answers/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    LinuxQuestion.findById(req.params.question_id)
      .then(question => {
        let newAnswer = {
          user: req.user.id,
          comment: req.body.comment
        };
        question.answers.unshift(newAnswer);
        question
          .save()
          .then(answeredQuestion => res.json(answeredQuestion))
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  }
);

//@type     DELETE
//@route    api/linux/questions/:question_id/answers/:answer_id
//@desc     For deleting answers on linux based questions using question_id & answer_id passed through parameter.
//@access   PRIVATE
router.delete(
  "/:question_id/answers/:answer_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    LinuxQuestion.findById(req.params.question_id)
      .then(question => {
        let answerIndex = question.answers
          .map(item => String(item._id))
          .indexOf(String(req.params.answer_id));

        if (answerIndex == -1) {
          res.json({ error: "Answer not found!" });
        } else {
          if (
            String(question.answers[answerIndex].user) == String(req.user.id)
          ) {
            question.answers.splice(answerIndex, 1);

            question
              .save()
              .then(questionWithDeletedAnswer => {
                res.json({ success: "Answer deleted successfully" });
              })
              .catch(err => console.log(err));
          } else {
            res.json({
              error: `You are not allowed to delete other user's answers.`
            });
          }
        }
      })
      .catch(err => console.log(err));
  }
);

//@type     POST
//@route    api/linux/questions/:question_id/answers/:answer_id/love
//@desc     For posting love on answers for linux based questions using question_id & answer_id passed through parameter.
//@access   PRIVATE
router.post(
  "/:question_id/answers/:answer_id/love",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    LinuxQuestion.findById(req.params.question_id)
      .then(question => {
        if (!question) {
          return res.json({
            error: `Your love can't be posted, since the question is not found`
          });
        }
        let answerIndex = question.answers
          .map(answer => String(answer._id))
          .indexOf(String(req.params.answer_id));

        if (answerIndex == -1) {
          return res.json({ error: "Answer not found!" });
        } else {
          let lovedIndex = question.answers[answerIndex].lovedby
            .map(love => String(love.user))
            .indexOf(String(req.user.id));
          //If already posted love
          if (lovedIndex != -1) {
            question.answers[answerIndex].lovedby.splice(lovedIndex, 1);
          }
          //If the question is not posted love
          else {
            question.answers[answerIndex].lovedby.unshift({
              user: req.user.id
            });
          }
        }
        question
          .save()
          .then(savedQuestionWithLove => res.json(savedQuestionWithLove))
          .catch(err => console.log(err));
      })

      .catch(err => console.log(err));
  }
);

module.exports = router;
