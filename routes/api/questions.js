const express = require("express");
const router = express.Router();
const passport = require("passport");
const mongoose = require("mongoose");

//Import Developer Schema(Model)
const Developer = require("../../models/Developer");
const Question = require("../../models/Question");
const Profile = require("../../models/Profile");

//@type     POST
//@route    api/questions
//@desc     For posting questions.
//@access   PRIVATE
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let newQuestion = {};
    newQuestion.user = req.user.id;
    if (req.body.textone) newQuestion.textone = req.body.textone;
    if (req.body.texttwo) newQuestion.texttwo = req.body.texttwo;
    if (req.body.name) newQuestion.name = req.body.name;

    let question = new Question(newQuestion);

    question
      .save()
      .then(savedQuestion => res.json(savedQuestion))
      .catch(err => console.log(err));
  }
);

//@type     DELETE
//@route    api/questions/:question_id
//@desc     For deleting questions based on question id - /:question_id
//@access   PRIVATE
router.delete(
  "/:question_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Question.findById(req.params.question_id)
      .then(question => {
        //If question is not found
        if (!question) {
          res.json({ error: "Question is not found." });
        }
        //If the user id and the question user(owner) id doesn't match
        else if (String(question.user) !== String(req.user.id)) {
          res.json({
            error: `You are not allowed to delete other's question.`
          });
        } else {
          Question.findByIdAndRemove(req.params.question_id)
            .then(() => {
              res.json({
                error: false,
                success: "Question deleted successfully!"
              });
            })
            .catch(err => console.log(err));
        }
      })
      .catch(err => console.log(err));
  }
);

//@type     DELETE
//@route    api/questions/delete/all
//@desc     For deleting all the questions of the user
//@access   PRIVATE
router.delete(
  "/delete/all",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Question.find({ user: req.user.id })
      .then(questions => {
        if (questions.length == 0) {
          return res.json({ error: `There's no question to delete.` });
        }
        let question_ids = questions.map(item => item._id);
        question_ids.forEach(id => {
          Question.findByIdAndRemove(id)
            .then(() => {
              Question.findById(id)
                .then(question => {
                  if (question) {
                    return res.json({
                      error: `Problem in deleting this question(id: ${id})`
                    });
                  }
                })
                .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
        });
        res.json({
          error: false,
          success: "All the questions are deleted successfully!"
        });
      })
      .catch(err => console.log(err));
  }
);

//@type     GET
//@route    api/questions
//@desc     For getting all the questions that is posted by every developers.
//@access   PUBLIC
router.get("/", (req, res) => {
  Question.find()
    .sort({ date: -1 })
    .then(questions => {
      res.json(questions);
    })
    .catch(err => console.log(err));
});

//@type     GET
//@route    api/questions/mine
//@desc     For getting questions that is posted by that developer
//@access   PRIVATE
router.get(
  "/mine",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Question.find({ user: req.user.id })
      .then(questions => {
        res.json(questions);
      })
      .catch(err => console.log(err));
  }
);

//@type     POST
//@route    api/questions/answers/:question_id
//@desc     For posting answers for a question with the id - question_id
//@access   PRIVATE
router.post(
  "/answers/:question_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Question.findById(req.params.question_id)
      .then(question => {
        //If the question is not found
        if (!question) {
          res.json({ error: "No question found!" });
        }
        //If the question is found
        else {
          let answerObject = {};
          answerObject.answer = req.body.answer;
          answerObject.name = req.user.name;
          answerObject.user = req.user.id;

          //Use unshift() or push() to push the answer object to the answer array
          question.answers.unshift(answerObject);

          question
            .save()
            .then(savedQuestionWithAnswer => res.json(savedQuestionWithAnswer))
            .catch(err => console.log(err));
        }
      })
      .catch(err => console.log(err));
  }
);

//@type     DELETE
//@route    api/questions/answers/:question_id/delete/:answer_id
//@desc     For deleting answers for a question with the id - answer_id
//@access   PRIVATE
router.delete(
  "/answers/:question_id/delete/:answer_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Question.findById(req.params.question_id)
      .then(question => {
        let answersByUsers = question.answers.map(item => {
          return { _id: item._id, user: item.user };
        });
        // The answersByUsers now will have an array of object of id and userid.
        // Now find the index of the answer_id(passed through params) in the answersByUsers
        // Then verify whether the answer is posted by that user by comparing user id.
        // And the proceeding to delete.

        let deleteIndex = answersByUsers
          .map(item => String(item._id))
          .indexOf(String(req.params.answer_id));
        //If the answer is not found, deleteIndex will be -1.

        //If the answer is found
        if (deleteIndex != -1) {
          //Comparing whether the user has the permission to delete by checking whether the user id matches
          if (answersByUsers[deleteIndex].user == req.user.id) {
            //Thus the answer is posted by the user is verified and ready to be deleted.
            question.answers.splice(deleteIndex, 1);

            question
              .save()
              .then(savedQuestionWithDeletedAnswer =>
                res.json(savedQuestionWithDeletedAnswer)
              )
              .catch(err => console.log(err));
          }
        }
        //If the answer with answer_id is not found.(Probably if multiple delete requests comes for same answer_id, this else part will be executed.)
        else {
          res.json({ error: "Answer not found" });
        }
      })
      .catch(err => console.log(err));
  }
);

//@type     POST
//@route    api/questions/upvote/:question_id
//@desc     For upvoting a question based on the id - question_id
//@access   PRIVATE
router.post(
  "/upvote/:question_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Question.findById(req.params.question_id)
      .then(question => {
        if (!question) {
          return res.json({ error: "Question not found" });
        }
        let totalUpvotes = question.upvotes;
        // let upvoted = totalUpvotes.map(item => {
        //     if (String(item.user) == String(req.user.id)) {
        //         return true;
        //     }else{
        //         return false;
        //     }
        // })
        let upvotedIndex = totalUpvotes
          .map(item => String(item.user))
          .indexOf(String(req.user.id));

        //If the user didn't upvoted - upvotedIndex --> -1
        if (upvotedIndex == -1) {
          //Then upvote
          let upvote = {
            user: req.user.id
          };
          question.upvotes.unshift(upvote);
          question
            .save()
            .then(savedQuestionWithUpvote =>
              res.json({ upvoted: true, error: false })
            )
            .catch(err => console.log(err));
        }
        //If the user already Upvoted
        else {
          //Remove the upvote - Like the LIKE BUTTON in facebook, where when you like a post again, the LIKE gets removed
          question.upvotes.splice(upvotedIndex, 1);
          question
            .save()
            .then(savedQuestionWithUpvote =>
              res.json({ upvoted: false, error: false })
            )
            .catch(err => console.log(err));
        }
      })
      .catch(err => console.log(err));
  }
);

module.exports = router;
