Slack = require('slack-client');
database = require('./database');
var private_detail = require('./details');
var slackToken = private_detail.slackToken;// Add a bot at https://my.slack.com/services/new/bot and copy the token here.
var autoReconnect = true //# Automatically reconnect after an error response from Slack.
var autoMark = true //# Automatically mark each message as read after it is processed.

var slack;
slack = new Slack(slackToken, autoReconnect, autoMark);


slack.on('open', function() {
	var channel, channels, group, groups, id, messages, unreads;
  channels = [];
  groups = [];
  unreads = slack.getUnreadCount();
  channels = (function() {
    var ref, results;
    ref = slack.channels;
    results = [];
    for (id in ref) {
      channel = ref[id];
      if (channel.is_member) {
        results.push("#" + channel.name);
      }
    }
    return results;
  })();
  groups = (function() {
    var ref, results;
    ref = slack.groups;
    results = [];
    for (id in ref) {
      group = ref[id];
      if (group.is_open && !group.is_archived) {
        results.push(group.name);
      }
    }
    return results;
  })();
  console.log("Welcome to Slack. You are @" + slack.self.name + " of " + slack.team.name);
  console.log('You are in: ' + channels.join(', '));
  console.log('As well as: ' + groups.join(', '));
  messages = unreads === 1 ? 'message' : 'messages';

  //Process unread messages

  return console.log("You have " + unreads + " unread " + messages);
});

slack.on('message', function(message) {
  var channel, channelError, channelName, errors, response, text, textError, ts, type, typeError, user, userName;
  channel = slack.getChannelGroupOrDMByID(message.channel);
  user = slack.getUserByID(message.user);
  var response = '';
  type = message.type, ts = message.ts, text = message.text;
  channelName = (channel != null ? channel.is_channel : void 0) ? '#' : '';
  channelName = channelName + (channel ? channel.name : 'UNKNOWN_CHANNEL');
  userName = (user != null ? user.name : void 0) != null ? user.name : "UNKNOWN_USER";

  console.log("Received: " + type + " " + channelName + " " + userName + " " + ts + " \"" + text + "\"");
  if (type === 'message' && (text != null) && (channel != null)) {
   var job_prams = text.split("/");
   	if(text.charAt(0) === "#"){
   		console.log("Logging a job");
   		var jobsName = "Jobs"+user.real_name.split(" ")[1];
   		if(job_prams.length < 4){
   			response = "You dont have the required number of fields (4)";
   			channel.send(response);
   			 return console.log("@" + slack.self.name + " responded with \"" + response + "\"");
   		}else{
   			var send_to_db = {	request:'insert',
   								query: {user:userName,
   										job_number: job_prams[0],
   										client: job_prams[1],
   										description: job_prams[2],
   										time_spent: job_prams[3],
   										myob_name: jobsName
   										}
   								}
   				if(job_prams[4] !== undefined){
   					 var regEx = /^\d{4}-\d{2}-\d{2}$/;
  						if(job_prams[4].match(regEx) != null){
   							send_to_db.query.date_logged = job_prams[4];
   						}else{
   							response = "Date format was invalid";
   							channel.send(response);
   			 				return console.log("@" + slack.self.name + " responded with \"" + response + "\"");
   						}
   				}
   				console.log("sending the following to database");
   				console.log(send_to_db);
   			database(send_to_db,function(dbresponse){
   				console.log(dbresponse);
   					if(dbresponse){
   						response = "Job Logged";
   					}else{
   						response = "Error logging job";
   					}
   					channel.send(response);
   					 return console.log("@" + slack.self.name + " responded with \"" + response + "\"");
   				});
   			}
   			
   	}else if(text.substring(0,8) == "--export"){
   		var send_to_db = {	request:'select',
   								query: {user:job_prams[1],
   										date_logged: job_prams[2],   										
   										}
   								}
   				console.log("sending the following to database");
   				console.log(send_to_db);
   			database(send_to_db,function(dbresponse){
   				console.log(dbresponse);
   					if(dbresponse){
   						response = dbresponse;
   					}else{
   						response = "Error getting data";
   					}
   					channel.send(response);
   					 return console.log("@" + slack.self.name + " responded with \"" + response + "\"");
   				});
   	}else if(text == "--help"){
   		response = "My job is to log your jobs.\n To log a new job please send it to me in the following format \n";
   		response += "#jobnumber/client name/job description/minutes spent on job \n";
   		response += "Example: #2016-001/Some Client/Working on concept art/230 \n";
   		response += "If you need to set a date other than today. Add /date after the time \n";
   		response += "Example: #2016-001/Some Client/Working on concept art/230/2016-01-20 \n\n";

   		response += "To export records, use the following format \n";
   		response += "--export/user/date to collect from \n";
   		response += "Example: --export/fred/2016-01-20 \n";
   		response += "Date format must be in the following format YYYY-MM-DD \n\n";

   		response += "To convert hours to min use 'convert hours X' Where X is the number of hours \n\n";
   		channel.send(response);
   		 return console.log("@" + slack.self.name + " responded with \"" + response + "\"");
   	}else if(text.indexOf('convert hours') > -1){
   		var hours = text.split(" ")[2];
   		console.log("hours "+hours);
   		response = Math.round(hours*60);
   		channel.send(response+" min");
   		return console.log("@" + slack.self.name + " responded with \"" + response + "\"");
   	}else if(text.indexOf('@timepal') > -1){
   		response = "Not sure what you want of me, For help type '--help'";
   		channel.send(response);
   		 return console.log("@" + slack.self.name + " responded with \"" + response + "\"");
   	}
    
    
   
  } else {
    typeError = type !== 'message' ? "unexpected type " + type + "." : null;
    textError = text == null ? 'text was undefined.' : null;
    channelError = channel == null ? 'channel was undefined.' : null;
    errors = [typeError, textError, channelError].filter(function(element) {
      return element !== null;
    }).join(' ');
    return console.log("@" + slack.self.name + " could not respond. " + errors);
  }
});

slack.on('error', function(err) {
  return console.error("Error", err);
});

slack.login();

module.exports = slack;