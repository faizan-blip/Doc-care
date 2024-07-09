require('dotenv').config()
const client = require('twilio')(process.env.ACC_SSID, process.env.AUTH_TOKEN);
exports.resetmessage = async(link,mobile)=>{
   try{
    const messageBody = `
    We received a request to reset your password. If you didn't make this request, you can ignore this message.
    To reset your password, click the link below or copy and paste the URL into your browser:
    ${link}
    Please note: This link will expire in 15 minutes.
    Thank you for using Doc-care!
          `;
    
    client.messages
    .create({
        body: messageBody,
        to: `+91${mobile}`,
        from: `+13862294888`, 
     })
    .then((message) => console.log(message.sid))
    .catch((error) => console.error('Error sending message:', error));
   }catch(error){
    console.error('Error:', error);
   }
}