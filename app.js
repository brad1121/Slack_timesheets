
var slack = require('./slack_control');
var private_detail = require('./details');
var date = new Date();
var fs = require('fs');
if(date.getDay() == 3){ 
 
	var nodemailer = require('nodemailer');
	
		try{
			var file_exists = !fs.accessSync('mail.log',fs.W_OK);
		}catch (e){
			if (e.code === 'ENOENT') {
				  console.log('File not found!');
				  fs.writeFile('mail.log','', (err) => {
					  if (err) throw err;
					  console.log('Mail log created!');
					});
				} else {
				  throw e;
				}
		}
	var mail_log = fs.readFileSync('mail.log',"utf8");
	if(!mail_log || mail_log != 'mail_sent'){
				console.log("Sending Wednessday reminder email");
				var smtpConfig = {
				    host: 'smtp.gmail.com',
				    port: 465,
				    secure: true, // use SSL
				    auth: {
				        user: private_detail.smtp_email,
				        pass: private_detail.smtp_pass
				    }
				};
				var transporter = nodemailer.createTransport(smtpConfig);

				var mailOptions = {
				    from: private_detail.from_addr, // sender address
				    to:  private_detail.to_addr,// list of receivers
				    subject: private_detail.subject, // Subject line
				    text: private_detail.plain_text, // plaintext body
				    html: private_detail.html_text // html body
				};
				// send mail with defined transport object
				transporter.sendMail(mailOptions, function(error, info){
				    if(error){
				        return console.log(error);
				    }
				    console.log('Message sent: ' + info.response);
				    fs.writeFile('mail.log','mail_sent', (err) => {
					  if (err) throw err;
					  console.log('Mail sent and mail log saved!');
					});
				});
					
					
		}
				


}else if(date.getDay != 3){
	fs.writeFile('mail.log','mail_not_sent', (err) => {
					  if (err) throw err;
					  console.log('mail log cleared!');
					});
}