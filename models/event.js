const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    eventName: {
        required: true,
        type: String,
    },
    eventDescription:{
        required: true,
        type: String,
    },
    eventEmail: {
        required: true,
        unique: true,
        type: String,
    },
    createdBy: {
        required: true,
        type: String,
    },
    createdAt: {
        required: true,
        type: String,
    },
    expiresBy: {
        required: true,
        type: String,
    },
    duration: {
        required: true,
        type: Number,
    },
    posterImg: {
        required: true,
        type: String,
    },
    hostedBy: {
        required: true,
        type: String,
    },
    eventPhoneNumber: {
        required: true,
        type: Number,
    },
    category: {
        required: true,
        type: String,
    },
    tags: {
        required: true,
        type: Array,
    },
    partcipants: {
        required: true,
        type: Array,
    },
    event_random_code: {
        required: true,
        type: String,
    }
})

module.exports = mongoose.model('Event', dataSchema)