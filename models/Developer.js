const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DeveloperSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  profilepic: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now()
  },
  gender: {
    type: String,
    required: true
  }
});

module.exports = Developer = mongoose.model("mydeveloper", DeveloperSchema);
