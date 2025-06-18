const mongoose = require('mongoose');
const authRouter = require('../routes/auth');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        validator: {
            validate: function(value) {
                return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(value);

            },
            message: props => `${props.value} is not a valid email address!`
        }

    },
    state: {
        type: String,
        default: "",

    },
    city: {
        type: String,
      
        default: "",
    },
    locality: {
        type: String,
       
        default: "",
    },

    password: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: (value) => {
               //check if the password is at least 8 characters long
                return value.length >= 8;
            },
            message: props => `${props.value} is not a valid password!`
        }
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    refreshToken: {
        type: String,
        default: null,
      },
      
});


const User = mongoose.model('User', userSchema);
module.exports = User;