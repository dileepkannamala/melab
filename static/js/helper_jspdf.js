var billid;
       
Date.prototype.yyyymmdd = function() {         
									
			var yyyy = this.getFullYear().toString();                                    
			var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based         
			var dd  = this.getDate().toString();             
								
			return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
};  
		
		Number.prototype.pad = function(size) {
			var s = String(this);
			while (s.length < (size || 2)) {s = "0" + s;}
			return s;
		}
        
		function getNewPatientId()
		{
			var pcode = $("#pcode").val()
			//alert("I am here "+ pcode);
            
            function callback(data)
            {
                //alert( 'call back got ' + data);
                $("#pcode").val( data );
                
            }
            
            function  wrapper(callback)
            {
			   
                $.ajax({
                    type: "POST",
                    url: "/getnewpatientid",
                    dataType: "json",
                    async:false,
				    data: "",
                    contentType: "application/json; charset=utf-8",
                    success: callback
                });
			    
            }   
            wrapper(callback);
            jQuery.ajaxSetup({async:true});
		}
		
		var details ;
        function loadPatientData()
		{
			
			var pid = $("#pcode").val();
			
			jQuery.ajaxSetup({async:false});
            $.get( '/getpatientdata/'+pid,{pcode:pid},function(data,status) {
				                //alert(status);
								if ( status == "success" ){
									details = data ;
									
								}
								
									
								}, "json" );
            jQuery.ajaxSetup({async:true});
            //alert('inside functions'+details);
            var  detailshtml = "<pre>";
            detailshtml  += 'Patient Name   : ' + details["PNAME"] + '<br/>';
            detailshtml  += 'Address        : ' + details["ADDRESS"] + '<br/>';
            detailshtml  += 'Phone          : ' + details["PPHONE"] + '<br/>';
            detailshtml  += 'Referenced Dr. : ' + details["REF_DR_NAME"] + '<br/>';
            detailshtml  += '</pre>';
            document.getElementById("pdetails").innerHTML = "<h4>" + detailshtml + "</h4>";
		}
		
		
		function loadPData()
		{
			jQuery.ajaxSetup({async:false});
            $.get( '/getallpatientdata',function(data,status) {
				                //alert(status);
								if ( status == "success" ){
									details = data ;
									
								}
								
									
								}, "json" );
            jQuery.ajaxSetup({async:true});
            w2ui['patientgrid'].add( details );
		}
		var bills;
		function loadBillData()
		{
			jQuery.ajaxSetup({async:false});
            $.get( '/getbillsnotfilled',function(data,status) {
				                //alert(status);
								if ( status == "success" ){
									bills = data ;
									
								}
								
									
								}, "json" );
            jQuery.ajaxSetup({async:true});
            
            w2ui['billgrid'].add( bills );
            billid = w2ui['billgrid'].get(returnIndex=true)[0];
            
		}
		
		var billform;
		function loadBillForm(bid)
		{
			var xd = w2ui['billgrid'].get (bid );
			
			//alert('Loading Bill ID:'+bid);
			billid = bid;
			jQuery.ajaxSetup({async:false});
            $.get( '/showbillform/'+bid, function(data,status) {
				                //alert(status);
								if ( status == "success" ){
									billform = data ;
									
								}
								
									
								}, "json" );
            jQuery.ajaxSetup({async:true});
            
            
            w2ui['resultpanel'].records = billform;
            w2ui['resultpanel'].refresh();
            
            
		}
		
		function addToCart()
		{
			var seltest = document.getElementById("tests").value;
			var row = seltest.split("|");
			var rec = { recid: row[0], SUBTSTCODE: row[0], STESTNAME: row[3], amt: row[2] };
			
			w2ui['testcart'].add( rec );
		
		}
		function checkTestRequest(  ) 
		{
			var pdata 	=   w2ui['patientgrid'].get ( w2ui['patientgrid'].getSelection() );
			var ptests	= w2ui['testcart'].records;
			var billdate = $("#billdate").val();
			while (billdate == "")
			{
            				billdate = prompt("Enter Bill Date (YYYY-MM-DD format):",new Date().yyyymmdd() );
			}
			//var billdatestr = billdate.yyyymmdd();
			//alert('Bill Date'+billdatestr);
			var billno = document.getElementById("billid").value;
			
            jQuery.ajaxSetup({async:false});
            //$('#savebtn').event.preventDefault();
            //console.log(pdata);
            var data = {'pcode':pdata["PCODE"],'billdate':billdate,'billdata':JSON.stringify(ptests), 'billid': billno};
            $.post('/saverequest',data, function (data, status ){
                if (status == "success" )
				            {
								billno = data["billno"];
								$('#billid').val( billno );
								alert('Bill Generated and Bill No Is: '+billno);
							}
					   }, "json"
                     
                );
              
			
			
			
		}
		function Popup(data) 
		{
			var mywindow = window.open('', 'Cash Bill', 'height=600,width=900');
			mywindow.document.write('<html><head><title>Doctor\'s Medi Lab, Inchakkattu Bldg, Puthuppally</title>');
			mywindow.document.write('<link rel="stylesheet" href="/static/css/ddiag.css" type="text/css" />');
			mywindow.document.write('</head><body >');
			mywindow.document.write(data);
			mywindow.document.write('</body></html>');

			mywindow.document.close(); // necessary for IE >= 10
			mywindow.focus(); // necessary for IE >= 10

			mywindow.print();
			mywindow.close();

            return true;
		}
        function PopupReport(data) 
		{
			var mywindow = window.open('', 'Report', 'height=600,width=900');
			mywindow.document.write('<html><head><title>Doctor\'s Medi Lab, Inchakkattu Bldg, Puthuppally</title>');
			mywindow.document.write('<link rel="stylesheet" href="/static/css/ddiag.css" type="text/css" />');
			mywindow.document.write('</head><body >');
			mywindow.document.write(data);
			mywindow.document.write('</body></html>');

			mywindow.document.close(); // necessary for IE >= 10
			mywindow.focus(); // necessary for IE >= 10

			mywindow.print();
			mywindow.close();

            return true;
		}


		function saveResults()
		{
			
			w2ui['resultpanel'].mergeChanges();
			
			
			//var billid = w2ui['billgrid'].getSelection();
			
			alert('Bill Saved for Bill ID:'+billid);
			var pcode  = w2ui['billgrid'].get( billid )["pcode"];
			var testdata = w2ui['resultpanel'].records;
			
			var data = {'pcode':pcode,'billid':billid,'testdata':JSON.stringify(testdata)};
			  $.post('/saveresults',data, function (data, status ){
				            if (status == "success" )
				            {
								
								alert('Test results saved');
							}
					   }, "json"
                     
                );
			
			
			
		}
		


		var a = ['','one ','two ','three ','four ', 'five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
		var b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];

		function inWords (num) {
			if ((num = num.toString()).length > 9) return 'overflow';
			n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
			if (!n) return; var str = '';
			str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
			str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
			str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
			str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
			str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only ' : 'only';
			return str.toTitleCase();
		}
		
		String.prototype.toTitleCase = function() {
			  var i, j, str, lowers, uppers;
			  str = this.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			  });

			  // Certain minor words should be left lowercase unless 
			  // they are the first or last words in the string
			  lowers = ['A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'As', 'At', 
			  'By', 'For', 'From', 'In', 'Into', 'Near', 'Of', 'On', 'Onto', 'To', 'With'];
			  for (i = 0, j = lowers.length; i < j; i++)
				str = str.replace(new RegExp('\\s' + lowers[i] + '\\s', 'g'), 
				  function(txt) {
					return txt.toLowerCase();
				  });

			  // Certain words such as initialisms or acronyms should be left uppercase
			  uppers = ['Id', 'Tv'];
			  for (i = 0, j = uppers.length; i < j; i++)
				str = str.replace(new RegExp('\\b' + uppers[i] + '\\b', 'g'), 
				  uppers[i].toUpperCase());

			  return str;
		}
		
		function compareTests(a, b)
		{
			if ( a["SUBTSTCODE"].substring(0,2) < b["SUBTSTCODE"].substring(0,2) ) return -1;
			if ( a["SUBTSTCODE"].substring(0,2) > b["SUBTSTCODE"].substring(0,2) ) return 1;
			if ( a["SUBTSTCODE"].substring(0,2) == b["SUBTSTCODE"].substring(0,2) ) return 0;
		}
		
		function printResults()
		{
			
			pdata = w2ui['billgrid'].get ( w2ui['billgrid'].getSelection() );
			tdata = w2ui['resultpanel'].records;
			tdata = tdata.sort(compareTests);
			var section = 1;
			var pageNo = 1;
		    var rowHeight = 200;	
			var oldsec  = "00";
			var imgData = 'data:image/jpeg;base64,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';
			var doc = new jsPDF('portrait');
			doc.setFont("courier");
			doc.setFontSize(12);
			doc.addImage(imgData, 'JPEG', 15, 40, 180, 160);
			doc.text(10,20, "Hello world");
			
			doc.save("result.pdf");

		}
		
	
		function testEditForm()
		{
			$("#contentpane").html("Test Edit Form");
		}
		
		function addSubtests()
		{
			var x =   $('input[name="again"]:checked').val();
			//alert ( '' + x );
			if ( x=='Y' )
			{
				//alert('here');
				var prehtml = document.getElementById('sstestpanel').innerHTML;
				prehtml += "Sub Test Name <input type=text name=sstname /> Normal Value <input type=text name=norv /> Unit <input type=text name=unit><br/>";
				$('#sstestpanel').html( prehtml );
			}
			else
			{
				$('sstestpanels').html('');
				//alert('Hai');
			}
			
				 
		}
		
		function patientBills( pid )
		{
			//var pid = w2ui['patientgrid'].records[ w2ui['patientgrid'].getSelection() ]["PCODE"] ;
			//alert('' + pid);
			jQuery.ajaxSetup({async:false});
            $.get( '/getbillsfor/'+pid,function(data,status) {
				                //alert(status);
								if ( status == "success" ){
									bills = data ;
									
								}
								
									
								}, "json" );
            jQuery.ajaxSetup({async:true});
            return JSON.stringify(bills);
            
		}
		var billform;
		function loadBill( billid )
		{
			//alert( ' Loading.. bill : ' + billid) ;
			jQuery.ajaxSetup({async:false});
            $.get( '/getbill/'+billid, function(data,status) {
				                //alert(status);
								if ( status == "success" ){
									billform = data ;
									
								}
								
									
								}, "json" );
            //alert(billform);
            jQuery.ajaxSetup({async:true});
            
            
            w2alert ('Load Bill:'+ billid) ;
            //alert(window.frames['innerframe'].w2ui);
            window.frames['innerframe'].document.getElementById("billid").value = billid;
            window.frames['innerframe'].w2ui['testcart'].records = billform;
            window.frames['innerframe'].w2ui['testcart'].refresh();
			$("#billid", window.frames['innerframes']).val(billid);
            
			
		}
		
		function printBill( from )
		{
            
            var billno = document.getElementById("billid").value;
			var billdate;
            billno = parseInt( billno );
			
            var ptests;
		
			
            if ( from == 'lab'){
                var pdata 	=   w2ui['billgrid'].get ( w2ui['billgrid'].getSelection() );
                //console.log(pdata);
                //alert('From lab ' + billno);
                jQuery.ajaxSetup({async:false});
                $.get( '/getbill/'+billno.toString(), function(data,status) {
				                //alert(status);
								if ( status == "success" ){
									ptests = data ;
									
								}
								
									
								}, "json" );
                jQuery.ajaxSetup({async:true});
				console.log(pdata);
				billno = pdata["billid"];
				$("#billid").val(billno);
				billdate = pdata["billdate"];
				}
            else {
                var pdata 	=   w2ui['patientgrid'].get ( w2ui['patientgrid'].getSelection() );
                var ptests	=   w2ui['testcart'].records;
				
				var dt = getLastBillNo( (billno == undefined)? 0: billno );
				billno = dt;
				//alert('Bill No:'+billno);
				$("#billid").val(billno);
				billdate = $("#billdate").val();
            }
			
			
			while (billdate == "")
			{
				billdate = prompt("Enter Bill Date (YYYY-MM-DD format):",new Date().yyyymmdd() );
			}
			//var billdatestr = billdate.yyyymmdd();
			//alert('Bill Date'+billdatestr);
			
			/*  jQuery.ajaxSetup({async:false});
			  //$('#savebtn').event.preventDefault();
              
			  var data = {'pcode':pdata["PCODE"],'billdate':billdate,'billdata':JSON.stringify(ptests), 'billid': billno};
			  $.post('/saverequest',data, function (data, status ){
				            if (status == "success" )
				            {
								billno = data["billno"];
								alert('Bill Generated and Bill No Is: '+billno);
							}
					   }, "json"
                     
                );
            */  
			console.log(billdate);
			var bdate   = billdate.substring(8,10)+"-"+billdate.substring(5,7)+"-"+billdate.substring(0,4)
			
			var billheader = "<table width='800px' ><tr><td colspan=2 align='center'><h2>Doctor's Medi Lab, Inchakkattu Bldg.,Puthuppally<br/>Contact: 9447570451,      0481-2353271</h2><br/><h3>Cash/Credit Bill</h3></td></tr>";
			billheader += "<tr><td colspan=2 align='center'></td></tr>"
			billheader += "<tr><td width=60%></td><td width='40%' align='right'> Date:" + bdate + "</td></tr>";
		    
			billheader += "<tr><td colspan=2><hr/></td></tr>";		
			var xpname = (pdata["pname"] == undefined)? pdata["PNAME"]: pdata["pname"];
			var xpcode = (pdata["pcode"] == undefined)? pdata["PCODE"]:pdata["pcode"];
			billheader += "<tr><td>Patient Name: "+ xpname.toUpperCase() + "(ID:"+ xpcode +") "+" Age : " + pdata["AGE"] + " Sex: " + pdata["SEX"] + "</td><td align='right'>" +"Bill No:"+billno.pad(6) + "</td></tr>";
			billheader += "<tr><td align='left'>Ref. Doctor's Name: Dr."+ pdata["REF_DR_NAME"].toUpperCase()+"</td><td>" + " </td></tr>";
			billheader += "<tr><td colspan=2><hr/></td></tr>";
			billheader += "</table>";
			billheader += "<table width='800px' id='billtable'><tr><td width='60%' align='center'><b>Test Name</b></td><td width='40%' align='center'><b>Amount</b></td></tr>";
			billheader += "<tbody>";
			var tot = 0.00;
			for ( t in ptests)
			{
				
				 billheader += "<tr><td style='padding-left:40px'>"+ptests[t]["STESTNAME"] +"</td><td align='right' style='padding-right:40px;'>"+ ptests[t]["amt"] + "</td></tr>";
				 tot +=  parseInt( ptests[t]["amt"] );
			}
			
			//billheader += "<tr><td colspan=2><hr/></td></tr>";
			billheader += "<tr><td colspan=2><h4 align='right' style='padding-right:40px;'>TOTAL : " + tot.toString() + "</h4><br/><h4 align='right'>( Rs "+inWords(tot)+" )<br/>Received with Thanks<br/><br/><br/>Cashier</h4></td></tr>";
			billheader += "</tbody></table>";
			
			Popup(billheader);
			
		}
		function deleteBill()
		{
                var billno = document.getElementById("billid").value;
                var res;
                billno = parseInt( billno );
                jQuery.ajaxSetup({async:false});
                $.get( '/delbill/'+billno.toString(), function(data,status) {
				                //alert(status);
								if ( status == "success" ){
									res = data ;
									
								}
								
									
								}, "json" );
                jQuery.ajaxSetup({async:true});
                w2ui['testcart'].records = [];
                w2ui['testcart'].refresh();
                var pdata 	=   w2ui['patientgrid'].get ( w2ui['patientgrid'].getSelection() );
                bills = patientBills( pdata["PCODE"] );
                     //alert(bills);
                bills = JSON.parse(bills);
                
                detailshtml = "<h6 class='billhistory'>Bill History</h6><b>"+pdata["PNAME"]+"</b><br/><b>Patient ID:"+ pdata["PCODE"] +"</b>";
                detailshtml += "<font size=2><ul>";
                for( var i = 0; i < bills.length; i++ )
				{
				    detailshtml += '<li></li><a href="javascript: loadBill(' + bills[i]["billid"] +');"> '+ bills[i]["billdate"] +' </a></li>';
				}
				detailshtml += "</ul></font>";
					 
                $('#helpbar', window.parent.document).html(detailshtml)  ;
               
			
		}
		
			
var htmlEnDeCode = (function() {
    var charToEntityRegex,
        entityToCharRegex,
        charToEntity,
        entityToChar;

    function resetCharacterEntities() {
        charToEntity = {};
        entityToChar = {};
        // add the default set
        addCharacterEntities({
            '&amp;'     :   '&',
            '&gt;'      :   '>',
            '&lt;'      :   '<',
            '&quot;'    :   '"',
            '&#39;'     :   "'"
        });
    }

    function addCharacterEntities(newEntities) {
        var charKeys = [],
            entityKeys = [],
            key, echar;
        for (key in newEntities) {
            echar = newEntities[key];
            entityToChar[key] = echar;
            charToEntity[echar] = key;
            charKeys.push(echar);
            entityKeys.push(key);
        }
        charToEntityRegex = new RegExp('(' + charKeys.join('|') + ')', 'g');
        entityToCharRegex = new RegExp('(' + entityKeys.join('|') + '|&#[0-9]{1,5};' + ')', 'g');
    }

    function htmlEncode(value){
        var htmlEncodeReplaceFn = function(match, capture) {
            return charToEntity[capture];
        };

        return (!value) ? value : String(value).replace(charToEntityRegex, htmlEncodeReplaceFn);
    }

    function htmlDecode(value) {
        var htmlDecodeReplaceFn = function(match, capture) {
            return (capture in entityToChar) ? entityToChar[capture] : String.fromCharCode(parseInt(capture.substr(2), 10));
        };

        return (!value) ? value : String(value).replace(entityToCharRegex, htmlDecodeReplaceFn);
    }

    resetCharacterEntities();

    return {
        htmlEncode: htmlEncode,
        htmlDecode: htmlDecode
    };
})();

function loadTests(event)
{
      //replace(/&quot;/g,'"')
   var testcode = event.target.value;
   var res;
   jQuery.ajaxSetup({async:false});
   $.get( '/gettestsforgroup/'+testcode.toString(), function(data,status) {
            //alert(status);
            if ( status == "success" ){
            	res = data ;
			}
          }, "json" );
    jQuery.ajaxSetup({async:true});
    w2ui['grid1'].records =   res ;
    w2ui['grid1'].refresh();
        
   
}

function showReport()
{
    var fromdt = document.getElementById('fromdt').value;
    var todt   = document.getElementById('todt').value;
    //w2alert( 'From ' + fromdt + ' To ' + todt );
    var bills = [];
    jQuery.ajaxSetup({async:false});
    $.post( '/reportgen',{"fromdt":fromdt,"todt":todt}, function( data, status ) {
        if ( status == "success" ) {
            //
            bills = data;
        }
    },"json");
    jQuery.ajaxSetup({async:true});
   
    var report_html = "<table width='800px' >";
    if ( fromdt == todt ){
        report_html    += "<tr><td colspan=4><h2>Cash collection report on : " + fromdt + "</h2></td></tr>";
    }
    else {
        report_html    += "<tr><td colspan=4><h2>Cash collection report from : " + fromdt + " to : " + todt + "</h2></td></tr>";
    }
    report_html  += "<tr><td colspan=4><hr/>";
    var tot_amt = 0;
    var slno = 1;
    
    report_html += "<tr>";
    report_html += "<td>SlNo</td><td>BillNo</td><td>Patient Name</td><td align='right'>Amount</td>";
    report_html += "</tr>";
    report_html  += "<tr><td colspan=4><hr/>"; 
    
    for( x in bills ){
        //alert( bills[x]["billid"] );
		var billid =  bills[x]["billid"];
		var pname  = bills[x]["pname"];
		
        var bamt = totalBill( bills[x]["billdata"] );
		// bills[x]["billid"]
        report_html += "<tr>";
        report_html += "<td>"+slno.toString() +"</td><td>" + billid + "</td><td>" +  pname + "</td><td align='right'>" + bamt.toString() + "</td>";
        report_html += "</tr>";
        slno += 1;
        
        tot_amt +=  bamt;
  
    }
    report_html  += "<tr><td colspan=4><hr/>";    
    
    report_html += "<tr><td colspan=3><h2>TOTAL AS ON "+todt +  "</h2></td><td align='right'><h2>"  + tot_amt + "</h2></td></tr>";
    report_html += "</table>";
    PopupReport( report_html);
	
}

function totalBill( billdata )
{
    var xamt = 0;
    billdata = JSON.parse( billdata );
    for ( x in billdata )
    {
        
        xamt += parseInt( billdata[x]["amt"] );
    }
    return xamt;
}



function changePassword()
{
    var uname = document.getElementById("cuname").value;
    var pass1 = document.getElementById("pass1").value;
    var pass2 = document.getElementById("pass2").value;
    var cpass2 = document.getElementById("cpass2").value;
    
    if ( pass2 == cpass2 ) {
        if ( pass1 == pass2 ) {
            w2alert("New password should not be same as old password");
        }
        else {
            
            $.post( '/changepassword',{"username":uname, "newpass":pass2 }, function(data, status ) {
               if ( status == "success" ) w2alert("Password Changed Successfully");
            },"json");
            
        }
        
    }
    else {
        w2alert("New password not matching...");
    }
    
}

function cancelUser()
{
    var uname = document.getElementById("cuname").value;
    $.post( '/canceluser',{"username":uname}, function(data, status ) {
               if ( status == "success" ) w2alert("User Status Changed Successfully");
            },"json");
}


function newUserRegister()
{
     var uname = document.getElementById("nuname").value;
     var pass1 = document.getElementById("npass1").value;
     var pass2 = document.getElementById("cnpass1").value;
     var typ   = document.getElementById("typ").value;
    
     if ( pass1 == pass2 ){
         $.post( '/newuser',{"username":uname, "newpass":pass1,"typ":typ }, function(data, status ) {
               if ( status == "success" ) w2alert("User Added Successfully");
            },"json");
            
         
     } else {
         w2alert("Password not matching...");
     }
    
         
}

function getLastBillNo(bid)
{ 
	var res;
    jQuery.ajaxSetup({async:false});
	$.get( '/getlastbillno/'+bid, function(data,status) {
	    //alert(status);
		if ( status == "success" ){
			res = data ;
		}
	}, "json" );
    jQuery.ajaxSetup({async:true});
	//alert( res );
	console.log( res );
	return res["billno"];
	
	
}
