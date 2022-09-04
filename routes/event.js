const express = require("express");
const Event = require("../models/event");
const User = require("../models/user");
const router = express.Router();
const auth = require("../middlewares/auth");
const axios = require("axios");
const { consumers } = require("nodemailer/lib/xoauth2");
const nodemailer = require("nodemailer");

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

router.get("/colleges", (req, res) => {
  const state = req.query.state;
  var config = {
    method: "get",
    url: `https://facilities.aicte-india.org/dashboard/pages/php/approvedinstituteserver.php?method=fetchdata&year=2021-2022&program=1&level=1&institutiontype=1&Women=1&Minority=1&state=${state}%20&course=1`,
    headers: {},
  };
  axios(config)
    .then(function (response) {
      let collegs = [];
      const collegsData = response.data;
      collegsData.forEach((element) => {
        collegs.push(element[1]);
      });
      res.send(collegs);
    })
    .catch(function (error) {
      console.log(error);
    });
  //res.send("try");
});

router.post("/new", auth, async (req, res) => {
  console.log(req.body);
  const random_code =
    new Date().getTime().toString(36) + Math.random().toString(36).slice(2);
  //console.log(req.user);
  const data = await User.findOne({ _id: req.user.userId });
  if (data) {
    const event = new Event({
      eventName: req.body.eventName,
      eventDescription: req.body.eventDescription,
      eventEmail: req.body.eventEmail,
      eventPhoneNumber: req.body.eventPhoneNumber,
      createdBy: data.user_random_code,
      createdAt: new Date(),
      expiresBy: req.body.expiresBy,
      duration: req.body.duration,
      posterImg: req.body.posterImg,
      hostedBy: req.body.hostedBy,
      category: req.body.category,
      tags: req.body.tags,
      particpants: [],
      event_random_code: random_code,
    });
    event
      .save()
      .then((result) => {
        res.status(201).send({
          code: "EVENT_CREATED",
          message: "Event Created Successfully",
          result,
        });
      })
      .catch((error) => {
        res.status(500).send({
          code: "EVENT_NOT_CREATED",
          message: "Error creating event",
          error,
        });
      });
  } else {
    res.status(404).send({
      code: "EVENT_NOT_CREATED",
      message: "user not found !!",
    });
  }
});

router.get("/all", async (req, res) => {
  try {
    const data = await Event.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/find/:random_code", async (req, res) => {
  try {
    const data = await Event.findOne({
      event_random_code: req.params.random_code,
    });
    var listOfObjects = [];
    for (i = 0; i < data.partcipants.length; i++) {
      const data1 = await User.findById(data.partcipants[i]);
      var singleObj = {};
      singleObj["email"] = data1.email;
      singleObj["name"] = data1.name;
      singleObj["college"] = data1.college;
      singleObj["number"] = data1.phoneNumber;
      listOfObjects.push(singleObj);
    }
    res.json(listOfObjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/email/:random_code", async (req, res) => {
  try {
    const data = await Event.findOne({
      event_random_code: req.params.random_code,
    });
    var arr = [];
    for (i = 0; i < data.partcipants.length; i++) {
      const data1 = await User.findById(data.partcipants[i]);
      arr.push(data1.email);
    }
    for (i = 0; i < arr.length; i++) {
      sendVerificationMail1(arr[i], req.body.subject, req.body.context);
    }
    res.json(arr);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/findbyCode/:random_code", async (req, res) => {
  try {
    const data = await Event.findOne({
      event_random_code: req.params.random_code,
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//623069fb3a32a2c59b0ef9f1

router.post("/register/:id", auth, async (req, res) => {
  //console.log(req.user);
  try {
    const data = await Event.findById(req.params.id);
    if (data.partcipants.includes(req.user.userId)) {
      res.status(400).send({
        message: "Already Registered",
      });
    } else {
      data.partcipants.push(req.user.userId);
      const result = await Event.findOneAndUpdate(
        { _id: req.params.id },
        { partcipants: data.partcipants },
        { upsert: false }
      );
      const userData = await User.findById(req.user.userId);
      userData.event_partcipated.push(req.params.id);
      const userResult = await Event.findOneAndUpdate(
        { _id: req.user.userId },
        { event_partcipated: userData.event_partcipated },
        { upsert: false }
      );
      res.status("200").send({
        message: "Registered.",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/category/:cat", async (req, res) => {
  try {
    const data = await Event.find({ category: req.params.cat });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/search", async (req, res) => {
  try {
    const data = await Event.find({
      eventName: { $regex: req.query.q, $options: "i" },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
