const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const ApiError = require("../Utils/apiError");
const jwt = require("jsonwebtoken");
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "A user must have a name"],
    maxlength: 50,
    minlength: 3,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "A user must have an email"],
    validate: [validator.isEmail, "Please enter a valid email"],
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "A user must have password"],
    select: false,
    minlength: [8, "password must be at least 8 characters"],
  },
  passwordConfirmation: {
    type: String,
    required: [true, "A user must have a password confirmation"],
    validate: {
      validator: function (el) {
        return this.password === el;
      },
      message: "Password does not match",
    },
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  active: {
    type: Boolean,
    default: true,
  },
  passwordChangedAt: {
    type: Date,
    select: false,
  },
  passwordResetToken: String,
  passwordResetTokenExpiresAt: Date,
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirmation = undefined;
});
userSchema.pre("save", function () {
  if (this.isModified("password") && !this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
});
userSchema.pre(/^find/, function () {
  this.find({ active: { $ne: false } });
});

userSchema.methods.checkPassword = async function (currentPassword) {
  return await bcrypt.compare(currentPassword, this.password);
};
userSchema.methods.signToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN,
  });
};
userSchema.methods.passwordChange = function (tokenTimeStamp) {
  if (this.passwordChangedAt) {
    const passwordChangetimeStamp = parseInt(
      this.passwordChangedAt.getDate() / 1000,
      10,
    );
    return tokenTimeStamp < passwordChangetimeStamp;
  }
  return false;
};
userSchema.methods.createPasswordResetToken = async function () {
  const resetToken = await crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetTokenExpiresAt = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
userSchema.methods.resetPassword = function (password, passwordConfirmation) {
  ((this.password = password),
    (this.passwordConfirmation = passwordConfirmation),
    (this.passwordResetToken = undefined),
    (this.passwordResetTokenExpiresAt = undefined));
};
module.exports = mongoose.model("User", userSchema);
