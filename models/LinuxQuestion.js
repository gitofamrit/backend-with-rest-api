const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LinuxQuestionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true
  },
  description: {
    type: String,
    required: true,
    default: ""
  },
  code: {
    type: String
  },
  error: {
    type: String,
    required: true
  },
  lovedby: [
    {
      user: {
        type: Schema.Types.ObjectId
      }
    }
  ],
  answers: [
    {
      user: {
        type: Schema.Types.ObjectId
      },
      comment: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      },
      lovedby: [
        {
          user: {
            type: Schema.Types.ObjectId
          }
        }
      ]
    }
  ]
});

module.exports = LinuxQuestion = mongoose.model(
  "mylinuxquestion",
  LinuxQuestionSchema
);
