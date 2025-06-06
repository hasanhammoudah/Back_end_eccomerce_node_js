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
            validate: (value)=> {
                const result =  /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
                return result.test(value);
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
});


const User = mongoose.model('User', userSchema);
module.exports = User;