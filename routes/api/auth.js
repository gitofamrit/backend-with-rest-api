const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jsonwt = require("jsonwebtoken");
const passport = require("passport");
const passportjwt = require("passport-jwt");
const key = require("../../setup/myurl").secret;

//Import Developer Schema(Model)
const Developer = require("../../models/Developer");

//@type     POST
//@route    api/auth/register
//@desc     For developer registration
//@access   PUBLIC
router.post("/register", (req, res) => {
  Developer.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        return res.json({ error: "This email already exists." });
      } else {
        const newDev = new Developer({
          name: req.body.name,
          email: req.body.email,
          gender: req.body.gender
        });
        newDev.profilepic =
          newDev.gender == "female"
            ? "https://static.wixstatic.com/media/f1cbe1_2862d8d1d18f4274804cc893877ebfb6~mv2.png"
            : "https://static.thenounproject.com/png/27703-200.png";
        bcrypt.genSalt(10, (err, salt) => {
          if (err) {
            console.log(err);
            throw err;
          }
          bcrypt.hash(req.body.password, salt, (err, hash) => {
            if (err) {
              console.log(err);
              throw err;
            }
            newDev.password = hash;
            newDev
              .save()
              .then(dev => res.json(dev))
              .catch(err => console.log(err));
          });
        });
      }
    })
    .catch(err => console.log(err));
});

//@type     POST
//@route    api/auth/login
//@desc     For developer login
//@access   PUBLIC
router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  Developer.findOne({ email: email })
    .then(user => {
      if (user) {
        bcrypt
          .compare(password, user.password)
          .then(isCorrect => {
            if (isCorrect) {
              const payload = {
                id: user.id,
                email: user.email
              };
              jsonwt.sign(payload, key, { expiresIn: "1hr" }, (err, token) => {
                if (err) {
                  console.log(err);
                  throw err;
                }
                res.json({ error: false, token: "Bearer " + token });
              });
            } else {
              res.json({ error: "Password is wrong." });
            }
          })
          .catch(err => console.log(err));
      } else {
        return res.json({ error: "User not found!" });
      }
    })
    .catch(err => console.log(err));
});

//@type     GET
//@route    api/auth/profile
//@desc     For developer profile information
//@access   PRIVATE
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      gender: req.user.gender,
      profilepic: req.user.profilepic
    });
  }
);

module.exports = router;
