const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String
    },
    role:{
        required: true,
        type: Array,
    },
    email: {
        required: true,
        unique: true,
        type: String,
    },
    password: {
        required: true,
        type: String,
    },
    gender: {
        required: false,
        type: String
    },
    college: {
        required: true,
        type: String
    },
    phoneNumber: {
        required: true,
        type: Number
    },
    verified: {
        required: true,
        type: Boolean
    },
    dob: {
        required: true,
        type: String
    },
    event_partcipated: {
        required: true,
        type: Array,
    },
    intrests: {
        required: true,
        type: Array,
    },
    events_hosted: {
        required: true,
        type: Array,
    }
})

module.exports = mongoose.model('Data', dataSchema)
