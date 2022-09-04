const express = require("express");
const Event = require("../models/event");
const User = require("../models/user");
const router = express.Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");

const smtpTransport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "find.roomy.otp@gmail.com",
    pass: "tvffezplxkojfxux",
  },
  tls: {
    rejectUnauthorized: false,
  },
});
const sendVerificationMail = (mail, code) => {
  const mailOptions = {
    from: "find.roomy.otp@gmail.com",
    to: mail,
    subject: "Verify Email",
    text: `Your Code is ${code}`,
  };
  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log(error);
    } else {
      console.log("mail sent");
    }
  });
};
const sendVerificationMail1 = (mail, subject, context) => {
  const mailOptions = {
    from: "find.roomy.otp@gmail.com",
    to: mail,
    subject: subject,
    text: context,
  };
  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log(error);
    } else {
      console.log("mail sent");
    }
  });
};
router.post("/new", (req, res) => {
  //console.log(req.body);
  bcrypt
    .hash(req.body.password, 10)
    .then((hashedPassword) => {
      // create a new user instance and collect the data
      const random_code =
        new Date().getTime().toString(36) + Math.random().toString(36).slice(2);
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        role: [req.body.role],
        gender: req.body.gender,
        college: req.body.college,
        phoneNumber: req.body.phoneNumber,
        verified: false,
        dob: req.body.dob,
        event_partcipated: [],
        intrests: [],
        events_hosted: [],
        user_random_code: random_code,
      });
      var mailCode = Buffer.from(`${req.body.email}::${random_code}`).toString(
        "base64"
      );
      // save the new user
      user
        .save()
        // return success if the new user is added to the database successfully
        .then((result) => {
          sendVerificationMail(req.body.email, mailCode);
          res.status(201).send({
            code: "USER_CREATED",
            message: "User Created Successfully",
            result,
          });
        })
        // catch erroe if the new user wasn't added successfully to the database
        .catch((error) => {
          res.status(500).send({
            code: "USER_NOT_CREATED",
            message: "Error creating user",
            error,
          });
        });
    })
    // catch error if the password hash isn't successful
    .catch((e) => {
      res.status(500).send({
        message: "Password was not hashed successfully",
        e,
      });
    });
});
router.get("/email", async (req, res) => {
  try {
    const data = await User.find();
    var arr = [];
    for (i = 0; i < data.length; i++) {
      arr.push(data[i]["email"]);
    }
    for (i = 0; i < arr.length; i++) {
      sendVerificationMail1(arr[i], req.query.subject, req.query.context);
    }
    res.json(arr);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/verify", async (req, res) => {
  if (req.query.code) {
    const specialCode = Buffer.from(req.query.code, "base64").toString("ascii");
    const mailAndCode = specialCode.split("::");
    console.log(mailAndCode[0], mailAndCode[1]);
    const data = await User.findOne({ email: mailAndCode[0] });
    if (
      data.email == mailAndCode[0] &&
      data.user_random_code == mailAndCode[1]
    ) {
      const result = await User.findOneAndUpdate(
        { email: mailAndCode[0] },
        { verified: "true" },
        { upsert: false }
      );
      //console.log(result);
      res.status(200).send({
        code: "USER_VERIFIED",
        message: "USER VERIFIED",
      });
    } else {
      res.status(400).send({
        code: "WRONG_CODE",
        message: "Wrong Code",
      });
    }
  } else {
    res.status(400).send({
      code: "CODE_NOT_FOUND",
      message: "PLEASE PROVIDE A VALID CODE.",
    });
  }
});

router.get("/details/:id", async (req, res) => {
  try {
    const data = await User.findOne({ _id: req.params.id });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/find/:id", async (req, res) => {
  try {
    const data = await User.findOne({ _id: req.params.id });
    var listOfObjects = [];
    for (i = 0; i < data.event_partcipated.length; i++) {
      const data1 = await Event.findById(data.event_partcipated[i]);
      listOfObjects.push({ event_participated: data1 });
    }
    const data2 = await Event.findOne({
      createdBy: data.user_random_code,
    });
    listOfObjects.push({ event_hosted: data2 });
    res.json(listOfObjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/me", auth, async (req, res) => {
  try {
    const data = await User.findOne({ _id: req.user.userId });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/login", async (req, res) => {
  console.log(req.body);
  User.findOne({ email: req.body.email })

    // if email exists
    .then((user) => {
      // compare the password entered and the hashed password found
      bcrypt
        .compare(req.body.password, user.password)

        // if the passwords match
        .then((passwordCheck) => {
          // check if password matches
          if (!passwordCheck) {
            return res.status(400).send({
              message: "Passwords does not match",
              error,
            });
          }

          //   create JWT token
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
              userName: user.name,
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );

          //   return success response
          res.status(200).send({
            token,
          });
        })
        // catch error if password do not match
        .catch((error) => {
          res.status(400).send({
            message: "Passwords does not match",
            error,
          });
        });
    })
    // catch error if email does not exist
    .catch((e) => {
      res.status(404).send({
        message: "Email not found",
        e,
      });
    });
});
module.exports = router;
