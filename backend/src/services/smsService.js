
const axios = require('axios');

const sendOTP = async (phoneNumber, otp) => {
  const message = `${otp} is your otp for login \nRegards, Pointers Insurance Brokers`;
  const template = encodeURIComponent(message);
 
  const url = `${process.env.SMS_API_URL}?token=${process.env.SMS_TOKEN}&user_id=${process.env.SMS_USER_ID}&route=TR&template_id=15484&sender_id=POIBRO&language=EN&template=${template}&contact_numbers=${phoneNumber}`;
 
  try {
    console.log(`Sending OTP to ${phoneNumber}: ${otp}`);
    await axios.get(url);
    console.log(`SMS sent successfully to ${phoneNumber}`);
    return true;
  } catch (error) {
    console.error('SMS Error:', error.message);
    return false;
  }
};

module.exports = {
  sendOTP
};