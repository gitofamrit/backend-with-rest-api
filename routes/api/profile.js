const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Always REMEMBER - PRIVATE route's session data is stored in req.user

//Importing Models
const Developer = require("../../models/Developer");
const Profile = require("../../models/Profile");

//Mongoose configuration to use findOneAndRemove()
mongoose.set("useFindAndModify", false);

//@type     GET
//@route    api/profile
//@desc     For retrieving developer profile information
//@access   PRIVATE
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (!profile) {
          return res.json({ error: "Profile not found" });
        } else {
          res.json(profile);
        }
      })
      .catch(err => console.log(err));
  }
);

//@type     POST
//@route    api/profile
//@desc     For SAVING/UPDATING the developer's profile information
//@access   PRIVATE
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    var profileInfo = {};
    profileInfo.user = req.user.id;
    if (req.body.website) profileInfo.website = req.body.website;
    if (req.body.username) profileInfo.username = req.body.username;
    if (req.body.portfolio) profileInfo.portfolio = req.body.portfolio;
    if (req.body.country) profileInfo.country = req.body.country;
    if (typeof req.body.languages !== undefined) {
      profileInfo.languages = req.body.languages.split(", ");
    }
    profileInfo.social = {};
    if (req.body.youtube) profileInfo.social.youtube = req.body.youtube;
    if (req.body.linkedin) profileInfo.social.linkedin = req.body.linkedin;
    if (req.body.facebook) profileInfo.social.facebook = req.body.facebook;

    //Save the data in database
    console.log(req.user.id);

    Profile.findOne({ user: req.user.id })
      .then(userProfile => {
        if (userProfile) {
          //If the user updates username
          if (profileInfo.username) {
            //Checking DB whether a profile with the new username already exists.
            Profile.findOne({ username: profileInfo.username })
              .then(existingProfileWithUsername => {
                //existingProfileWithUsername is the profile with the username
                if (existingProfileWithUsername) {
                  return res.json({ error: "Username already taken." });
                }
              })
              .catch(err => console.log(err));
          }
          Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileInfo },
            { new: true }
          )
            .then(updatedProfile => {
              //Adding another property updated as true to give response
              updatedProfile.updated = true;
              res.json(updatedProfile);
            })
            .catch(err => console.log(err));
        } else {
          Profile.findOne({ username: profileInfo.username })
            .then(existingProfile => {
              //If the username is already taken by someone
              if (existingProfile) {
                res.json({ error: "Username already taken." });
              }
              //If the username is not taken and unique
              else {
                let newProfile = new Profile(profileInfo);
                newProfile
                  .save()
                  .then(savedProfile => {
                    savedProfile.firstTime = true;
                    res.json(savedProfile);
                  })
                  .catch(err => console.log(err));
              }
            })
            .catch(err => console.log(err));
        }
      })
      .catch(err => console.log(err));
  }
);

//@type     GET
//@route    api/profile/user/:username
//@desc     route to get developer profile based on USERNAME which is variable.
//@access   PUBLIC
router.get("/user/:username", (req, res) => {
  Profile.findOne({ username: req.params.username })
    .populate("user", ["name", "profilepic"])
    .then(profile => {
      if (!profile) {
        return res.json({ error: "Profile not found." });
      }
      res.json(profile);
    })
    .catch(err => console.log(err));
});

//Assignment Route

//@type     GET
//@route    api/profile/id/:id
//@desc     route to get developer profile based on ID
//@access   PUBLIC
router.get("/id/:id", (req, res) => {
  Profile.findById(req.params.id)
    .populate("user", ["name", "profilepic"])
    .then(profile => {
      if (!profile) {
        return res.json({ error: "Profile not found." });
      }
      res.json(profile);
    })
    .catch(err => console.log(err));
});

//@type     GET
//@route    api/profile/find/everyone
//@desc     route to get developer profile based on ID
//@access   PUBLIC
router.get("/find/everyone", (req, res) => {
  Profile.find()
    .populate("user", ["name", "profilepic"])
    .then(profiles => {
      if (!profiles) {
        return res.json({ error: "No Profile was found in the database." });
      }
      res.json(profiles);
    })
    .catch(err => console.log(err));
});

//@type     DELETE
//@route    api/profile
//@desc     For DELETING the developer's account permanently from profile & auth DB
//@access   PRIVATE
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id })
      .then(() => {
        Developer.findOneAndRemove({ _id: req.user.id })
          .then(() => {
            res.json({ success: "Your account was deleted successfully!" });
          })
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  }
);

//@type     POST
//@route    api/profile/workrole
//@desc     For SAVING/UPDATING the developer's work role information
//@access   PRIVATE
router.post(
  "/workrole",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        //If the profile is not found.(Assignment)
        if (!profile) {
          return res.json({ error: "Profile not found" });
        }
        //If the profile is found.
        else {
          Profile.findOne({ user: req.user.id })
            .then(userProfile => {
              let workRole = {};
              if (req.body.role) workRole.role = req.body.role;
              if (req.body.company) workRole.company = req.body.company;
              if (req.body.current) workRole.current = req.body.current;
              if (req.body.country) workRole.country = req.body.country;
              if (req.body.from) workRole.from = req.body.from;
              if (req.body.to) workRole.to = req.body.to;
              if (req.body.details) workRole.details = req.body.details;

              userProfile.workrole.push(workRole);

              userProfile
                .save()
                .then(savedWorkRole => res.json(savedWorkRole))
                .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
        }
      })
      .catch(err => console.log(err));
  }
);

//@type     DELETE
//@route    api/profile/workrole/:workrole_id
//@desc     For DELETING the developer's work role information based on workrole id params variable
//@access   PRIVATE
router.delete(
  "/workrole/:workrole_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        //If the profile is not found.(Assignment)
        if (!profile) {
          return res.json({ error: "Profile not found" });
        }
        //If the profile is found.
        else {
          const wannaRemoveIndex = profile.workrole //Contains [{id: 1, data: ...}, {id: 2, data:...}]
            .map(item => item.id) //Returns a list of id's of each workrole object. Contains [1, 2]
            .indexOf(req.params.workrole_id); //Returns the index of the workrole object that needs to be deleted

          //If the workrole is found
          if (wannaRemoveIndex !== -1) {
            profile.workrole.splice(wannaRemoveIndex, 1); //Removes the workrole object from the profile.

            profile
              .save()
              .then(savedProfile => res.json(savedProfile))
              .catch(err => console.log(err));
          }
          //If the workrole is not found
          else {
            res.json({ error: "No work role found in this id!" });
          }
        }
      })
      .catch(err => console.log(err));
  }
);

module.exports = router;
