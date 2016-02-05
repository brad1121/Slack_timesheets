var mysql = require('mysql');

var db_pass = "";
var db_user = "";
var db_db = "";

var pool = mysql.createPool({
	connectionLimit : 25,
	host	: "192.254.232.133",
	user	: db_user,
	password: db_pass,
	database:db_db,
	debug: false
});

function db(req,res){
	pool.getConnection(function(error,connection){
		if(error){
			connection.release();
			res.json({"code" : 100, "status" : "Error in connection database"});
			return;
		};

		if(req.request == "insert"){
			 var theQuery = connection.query("INSERT INTO time_logs SET ?",req.query,function(err,result){
            connection.release();
            if(!err) {
            	console.log("DB response");
            	console.log(result);
                res(true);
            }else{
            	res.json(err)
            }          
        });
			 console.log(theQuery.sql); 
		}else if(req.request == 'select'){
			var export_file = "/home1/stan4/public_html/ts/"+req.query.user+"-"+req.query.date_logged+".csv";
			var theQuery = connection.query("SELECT * FROM time_logs WHERE user = ? AND date_logged >= ?;",
				[req.query.user,req.query.date_logged],function(err,rows){
				if(!err){
					//fs.renameSync(export_file,'/home1/stan4/public_html/ts/'+req.query.user+"-"+req.query.date_logged+".csv"); 
					if(rows.length < 1){
						res("No results found");
					}
					var csv = '"User","MYOB_Name","Payroll Category","Job Number","Client","Description","Hours Spent"\r\n';
					for(i=0;i<rows.length;i++){
						csv += '"'+rows[i]['user']+'","'+rows[i]['myob_name']+'","'+rows[i]['Payroll_category']+'","'+rows[i]['job_number']+'","'+rows[i]['client']+'","'+rows[i]['description']+'","'+rows[i]['time_spent']+'"\r\n';
					}
					
					res(csv);
				}else{
					console.log(err);
					res(false)
				}
			});
			console.log(theQuery.sql); 
		}

	});

}
module.exports = db;
