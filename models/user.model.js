const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
},{versionKey:false});

const UserModel = mongoose.model("Users", UserSchema);

module.exports = { UserModel };
