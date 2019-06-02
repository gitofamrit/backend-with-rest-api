const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let QuestionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "mydeveloper"
  },
  textone: {
    type: String,
    required: true
  },
  texttwo: {
    type: String
  },
  name: {
    type: String,
    required: true
  },
  upvotes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "mydeveloper"
      }
    }
  ],
  answers: [
    {
      answer: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      },
      name: {
        type: String
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: "mydeveloper"
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Question = mongoose.model("myquestions", QuestionSchema);
