var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {

    //type email and password here
    user: 'youremail@gmail.com',
    pass: 'password'
  }
});

var mailOptions = {
  from: 'youremail@gmail.com',
  to: 'aakashjaj11@gmail.com',
  subject: 'Your Voucher Generated',
  text: 'Hi, Congrats You got a coupon'
};

function sendmail(){
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}
module.exports=sendmail;