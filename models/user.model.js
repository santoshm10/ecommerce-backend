const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    userAvatarUrl: {
        type: String
    },
    age: {
        type: Number,
        
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: [6, 'Password must be at least 6 characters long']
    },
    phoneNumber: {
        type: Number,
        trim: true
        
    },
    address: [{
        type: String,
        
    }]
},
{ timestamps: true }
)

const User = mongoose.model("User", userSchema)

module.exports = User