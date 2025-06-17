//import the necessary aws sdk modules for ses
const {SESClient, SendEmailCommand} = require('@aws-sdk/client-ses');
const { send } = require('express/lib/response');

///Load the environment variables from the .env file
require('dotenv').config();

//initialize the SES client using the environment variables

const client = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Function to generate the simple HTML content for welcome email
const generateOtpEmailHTML = (otp) =>{
    return `
        <html>
            <body>
                <h1>Welcome to ${process.env.APP_NAME}</h1>
                <p>Your One-Time password (OTP) for email verification is: </p>
                <h2 style="color: blue;">${otp}</h2>
                <p>Please enter this OTP to verify your email address. This code is valid for the next 10 minutes</p>
                <p>If you did not request this, Please ignore this email or contact our support team immediately</p>
                <p>Thank you for joining us!</p>
            </body>
        </html>
    `;
};

//Function to send welcome email to the provided email address

const sendOtpEmail=async(email,otp)=>{
    //Define the parameters for the SES email message
    const params = {
        Source : process.env.EMAIL_FROM, // Sender's email address
        ReplayToAddresses: [process.env.EMAIL_TO], // Reply-to email address

        //Destination
        Destination: {
           ToAddresses: [email], // Recipient's email address
        },
        Message:{
            Body:{
                Html:{
                    Charset:"UTF-8", // Ensure the email is in UTF-8 format
                    Data:generateOtpEmailHTML(otp), // Call the function to generate HTML content

                },
            },
            Subject: {
                Charset: "UTF-8", // Ensure the subject is in UTF-8 format
                Data: `Test Email verification`, // Subject of the email
            },
        }
    };
    //create a new SendEmailCommand with the defined above
    const command = new SendEmailCommand(params);
    try {
        //send the email using the SES client and response
        const data = await client.send(command);
        return data;
    } catch (error) {
        console.log("Error sending email:", error);
        throw error;
    }
};

module.exports = sendOtpEmail;