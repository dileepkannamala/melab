var billid;
var discount = 0;       
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
            //w2alert( bills[0]["recid"] );
            w2ui['billgrid'].add( bills );
			w2ui['billgrid'].refresh();
			
            billid = bills[0]["recid"];
			w2ui['billgrid'].select( billid );
			
			$("#billid", window.frames['innerframes']).val(billid);
			$("#discount", window.frames['innerframes']).val(discount);
			
            
		}
		
		var billform;
		function loadBillForm(bid)
		{
			var xd = w2ui['billgrid'].get( bid );
			
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
			jQuery.ajaxSetup({async:false});
			if ( bid != "0") 
			{
				
				$.get( '/getbilldiscount/'+bid, function(data,status) {
									//alert(status);
									if ( status == "success" ){
										discount = data ;
										
									}
									
										
									}, "json" );
				//alert(billform);
				
			}
			else  discount = 0;
			jQuery.ajaxSetup({async:true});
			//w2alert('Loading Bill: '+billid);
			
            $("#billid", window.frames['innerframes']).val(billid);
	        $("#discount", window.frames['innerframes']).val(xd["discount"]);
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
			w2ui['testcart'].mergeChanges();
			var ptests	= w2ui['testcart'].records;
			var billdate = $("#billdate").val();
			while (billdate == "")
			{
            				billdate = prompt("Enter Bill Date (YYYY-MM-DD format):",new Date().yyyymmdd() );
			}
			//var billdatestr = billdate.yyyymmdd();
			//alert('Bill Date'+billdatestr);
			var billno = document.getElementById("billid").value;
			var discount = document.getElementById("discount").value;
			
            jQuery.ajaxSetup({async:false});
            //$('#savebtn').event.preventDefault();
            //console.log(pdata);
            var data = {'pcode':pdata["PCODE"],'billdate':billdate,'billdata':JSON.stringify(ptests), 'billid': billno,'discount':discount};
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
		function PopupResult(head,body, footer) 
		{
			var rmywindow = window.open('', 'Result Report', 'height=900,width=900');
			rmywindow.document.onload = function() {
					alert("Print Result");
			
					rmywindow.print();
			}
			rmywindow.document.write(head);
			rmywindow.document.write(body);
			rmywindow.document.write(footer);
			rmywindow.focus();
            //alert( head + body + footer );
			rmywindow.document.close(); // necessary for IE >= 10
			
			 // necessary for IE >= 10
			
			//rmywindow.close();
			//mywindow.close();
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
			//if ( a["SUBTSTCODE"].substring(0,2) < b["SUBTSTCODE"].substring(0,2) ) return -1;
			//if ( a["SUBTSTCODE"].substring(0,2) > b["SUBTSTCODE"].substring(0,2) ) return 1;
			//if ( a["SUBTSTCODE"].substring(0,2) == b["SUBTSTCODE"].substring(0,2) ) return 0;
			if (  a["SUBTSTCODE"].substring(0,2) <  b["SUBTSTCODE"].substring(0,2) ) return -1;
			if (  a["SUBTSTCODE"].substring(0,2) >  b["SUBTSTCODE"].substring(0,2) ) return 1;
			if (  a["SUBTSTCODE"].substring(0,2) == b["SUBTSTCODE"].substring(0,2) )
			{   
			     if ( a["SSCODE"] == b["SSCODE"] ) return 0;
				 if ( a["SSCODE"] < b["SSCODE"] ) return -1;
				 if ( a["SSCODE"] > b["SSCODE"] ) return 1;
			}
		}
		function isSpecialTests( tdata )
		{
		    var splTest = false;
			var cnt = 0;
			$.each( tdata, function(x) { 
				           var sec;
						   if ( tdata[x]["SUBTSTCODE"] == '0307' ||
						        tdata[x]["SUBTSTCODE"] == '0312' ||
								tdata[x]["SUBTSTCODE"] == '0313' ||
								tdata[x]["SUBTSTCODE"] == '0314' ||
								tdata[x]["SUBTSTCODE"] == '0315' 
						       )
						    {
							   splTest = true;
							   
						   }
						   else {  cnt = cnt + 1; }
						}
				   );
			if ( cnt > 0 ) { splTest = false; }  
			return splTest;
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
			
			var hhtml  = '<script src="/static/js/jquery.min.js" type="text/javascript"></script>';
                hhtml += '<script type="text/javascript" src="/static/js/w2ui-1.4.3.min.js"></script>';
                hhtml += '<script type="text/javascript" src="/static/js/helper.js"></script>';
                hhtml += '<script type="text/javascript" src="/static/js/jquery-ui.js"></script>';
                hhtml += '<script type="text/javascript" src="/static/js/jspdf.js"></script>';
                hhtml += '<script type="text/javascript" src="/static/js/libs/Deflate/adler32cs.js"></script>';
                hhtml += '<script type="text/javascript" src="/static/js/libs/FileSaver.js/FileSaver.js"></script>';
                hhtml += '<script type="text/javascript" src="/static/js/libs/Blob.js/BlobBuilder.js"></script>';
                hhtml += '<script type="text/javascript" src="/static/js/jspdf.plugin.addimage.js"></script>';
                hhtml += '<script type="text/javascript" src="/static/js/jspdf.plugin.standard_fonts_metrics.js"></script>';
                hhtml += '<script type="text/javascript" src="/static/js/jspdf.plugin.split_text_to_size.js"></script>';
                hhtml += '<script type="text/javascript" src="/static/js/jspdf.plugin.from_html.js"></script>';
			
			//var res1 = str.substring(8,10);
			//var res2 = str.substring(5,7);
			//var res3 = str.substring(0,4);
			//<link rel='stylesheet' href='/static/css/result.css'  media='all' />
			//<link rel='stylesheet' href='/static/css/result.css'  media='print' />
			var bdate   = pdata["billdate"].substring(8,10)+"-"+pdata["billdate"].substring(5,7)+"-"+pdata["billdate"].substring(0,4)
			var res_header = "<html><head><link rel='stylesheet' href='/static/css/result.css'  media='all' />"+hhtml+"</head><body onLoad='javascript:window.print();' align='top'><div id='page-content'>";
			var res_body   = "<img src='/static/images/ddcwords.png' style='float:left;padding-top:0px'><h5> Doctor's Medi Lab, Inchakkattu Bldg., Puthuppally<br/> Contact: 9048498111, 0481-2353271</h5><br/><hr/>";
			var res_footer = "";
            //var res_body = "<img vspace=100px />";
			res_body      += "<table><tr><td>Patient Name</td><td>:" + pdata["pname"].toUpperCase() +  "</td></tr>";
			res_body      += "<tr><td>Age</td><td>:"+ pdata["AGE"] + "</td></tr>";
			res_body      += "<tr><td>Sex</td><td>:" + pdata["SEX"] + "</td></tr>";
			var doctorname = (pdata["REF_DR_NAME"].length >0)? " Dr." + pdata["REF_DR_NAME"].toUpperCase(): "" ;
			res_body      += "<tr><td>Doctor</td><td>:"+ doctorname + "</td></tr>";
			res_body      += "</table>";
			res_body      += "<h5 align='right'>Date:"+ bdate +"</h5>";
			res_body      += "<hr/>";
			res_body      += "<table width='100%' border='0' cellpadding='0' cellspacing='0'>";
			if ( isSpecialTests(tdata) == false )
				res_body      += "<tr><th width='50%'>Test</th><th width='30%'>Normal Value</th><th width='20%' align='center'>Actual Value</th></tr>";
			else
			    res_body      += "<tr><th width='50%'>Test</th><th width='30%'> </th><th width='20%' align='center'>Result</th></tr>";

			res_body      += "<tr><td colspan='3'><hr/></td></tr>";
			$.each( tdata, function(x) { 
				        var sec;
				        if (oldsec != tdata[x]["recid"].substring(0,2) )
				        {
							var tid = tdata[x]["recid"].substring(0,2)
							jQuery.ajaxSetup({async:false});
							$.get( '/gettestname/'+tid, function(data,status) {
				                //alert(status);
								if ( status == "success" ){
									
									sec=data ;
									
									
									
								}
								
									
								}, "json" );
							res_body += "<tr><td colspan=3 align='left' style='padding-top:5px;padding-bottom:2px'><b><font size=3>" + sec[0].TESTNAME + "</font></b></td></tr>";
							//res_body += "<tr><th width='50%'>Test</th><th width='30%' align='center' >Actual Value</th><th width='20%' align='center'>Normal Value</th></tr>";
							//section += 1;
							oldsec = tdata[x]["recid"].substring(0,2);
							jQuery.ajaxSetup({async:true});
							rowHeight += 40;
						}
						res_body += "<tr style='height:25px'><font size=2><td align='left' style='padding-left:20px'>";
						//res_body += ( tdata[x]["SSTESTNAME"].length > 0) ? tdata[x]["SSTESTNAME"].toTitleCase() :  tdata[x]["STESTNAME"].toTitleCase(); 
						res_body += ( tdata[x]["SSTESTNAME"].length > 0) ? tdata[x]["SSTESTNAME"] :  tdata[x]["STESTNAME"]; 
						//+ tdata[x]["UNIT"]+
						res_body += "</td><td align='center'>"+ tdata[x]["NOR_VALUE"].split(",").join("<br/>")  +"</td><td align='center'><b>"+ tdata[x]["ACT_VAL"] +" </b></td></font size=2></tr>"; 
						rowHeight += 30;
						if ( rowHeight > 850 ) {
							
							// Page break creation 
							res_body += "</table><hr/><p align='right'>Page: "+ pageNo + " (Contd..)<div class='page-break'></div></div>";
							//var wnd = window.open("");
							//wnd.document.body.innerHTML='';
							//wnd.document.write(res_header + res_body + res_footer);
							
							
							   // Adding header for next table
							    //res_body       = "<div><img vspace=100px />";
								//res_body      += "</div></page>"
								res_body      += "<div id='page-content'><img src='/static/images/ddcwords.png' style='float:left'><h5> Doctor's Medi Lab, Inchakkattu Bldg., Puthuppally<br/> Contact: 9048498111,      0481-2353271</h5><br/><hr/>";
								res_body      += "<table><tr><td>Patient Name</td><td>:" + pdata["pname"] + "</td></tr>";
								res_body      += "<tr><td>Age</td><td>:"+ pdata["AGE"] + "</td></tr>";
								res_body      += "<tr><td>Sex</td><td>:" + pdata["SEX"] + "</td></tr>";
								
								res_body      += "<tr><td>Doctor</td><td>: Dr. "+ pdata["REF_DR_NAME"]+ "</td></tr>";
								res_body      += "</table>";
								res_body      += "<h5 align='right'>Date:"+ pdata["billdate"]+"</h5>";
								res_body      += "<hr/>";
								res_body      += "<table width='100%' border='0' cellpadding='0' cellspacing='0'>";
								res_body      += "<tr><th width='50%'>Test</th><th width='30%'>Normal Value</th><th width='20%' align='center'>Actual Value</th></tr>";
								res_body      += "<tr><td colspan='3'><hr/></td></tr>";
								pageNo        += 1;   
								rowHeight      = 200;
												
						}
					} 
				  ); 
			//res_body += 
			
            disclaimer = "<div id='page-footer'><br/><p align='right'>LAB TECHNOLOGIST</p><font size=1><i>This report(s) shall not be reproduced except in full, relate on to the sample collected and is/are for the information and interpretation of qualified medical consultant only</i></font> <font size=2><p align='right'>Page: "+ pageNo + "</p></font></div>";
            //disclaimer = "<address>"  + disclaimer + "</address>";
			//"<img vspace=" + (650-rowHeight)+"px />"
			res_body      += "</table><hr/></div>"+ disclaimer +"";
			var res_footer = "</body></html>";
			
			//var wnd = window.open("");
			//wnd.document.body.innerHTML='';
			
			//wnd.document.write(res_header + res_body + res_footer);
			//while ( wnd.document.readyState == 4 );
			PopupResult( res_header, res_body, res_footer);
			//wnd.document.focus();
			//wnd.document.print();
			//wnd.document.close();
			//
			//alert('Pages '+pageNo + ' to Print');
			
			
			/*
			var doc = new jsPDF('p','pt','A4');          
			var elementHandler = {
				'#ignorePDF': function (element, renderer) {
			    return true;
			    }
			};
			var source = res_header + res_body + res_footer;
			
			doc.fromHTML(
				source,
				15,
				15,
				{
					'width': 900,'elementHandlers': elementHandler
				});
            setTimeout(function(){ alert("Hello"); }, 3000);
			doc.save("report.pdf");
			
			doc.autoPrint("result.pdf");
			*/

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
			
			jQuery.ajaxSetup({async:false});
            $.get( '/getbilldiscount/'+billid, function(data,status) {
				                //alert(status);
								if ( status == "success" ){
									discount = data ;
									
								}
								
									
								}, "json" );
            //alert(billform);
            jQuery.ajaxSetup({async:true});
            
            
            // w2alert ('Load Bill:'+ billid) ;
            //alert(window.frames['innerframe'].w2ui);
            window.frames['innerframe'].document.getElementById("billid").value = billid;
            window.frames['innerframe'].w2ui['testcart'].records = billform;
            window.frames['innerframe'].w2ui['testcart'].refresh();
			$("#billid", window.frames['innerframes']).val(billid);
			
			
			window.frames['innerframe'].document.getElementById("discount").value = discount;
			
			//console.log( discount );
			//w2alert("Discount " + discount );
			
            
			
		}
		
		function printBill( from )
		{
            
            var billno = $("#billid", window.frames['innerframes']).val();
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
				discount = $("#discount").val();
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
			//console.log(billdate);
			var bdate   = billdate.substring(8,10)+"-"+billdate.substring(5,7)+"-"+billdate.substring(0,4)
			
			var billheader = "<table width='800px' ><tr><td colspan=2 align='center'><h2>Doctor's Medi Lab, Inchakkattu Bldg.,Puthuppally<br/>Contact: 9048498111,      0481-2353271</h2><br/><h3>Cash/Credit Bill</h3></td></tr>";
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
			billheader += "";
			
			billheader += "<tr><td colspan=2><h4 align='right' style='padding-right:40px;'>TOTAL.................: " + tot.toString() + "</h4>";
			if ( discount > 0 )
			{
			     billheader += "<h4 align='right' style='padding-right:40px;'>DISCOUNT..............:" + discount.toString() + "</h4>";
			     tot = tot - discount;
			     billheader += "<h4 align='right' style='padding-right:40px;'>NET AMOUNT............:" + tot.toString() + "</h4>";
			}
			billheader += "<h4 align='right' style='padding-right:40px;'>( Rs "+inWords(tot)+" )<br/>Received with Thanks<br/><br/><br/>Cashier</h4></td></tr>";
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
        report_html    += "<tr><td colspan=5><h2>Cash collection report on : " + fromdt + "</h2></td></tr>";
    }
    else {
        report_html    += "<tr><td colspan=5><h2>Cash collection report from : " + fromdt + " to : " + todt + "</h2></td></tr>";
    }
    report_html  += "<tr><td colspan=5><hr/>";
    var tot_amt = 0;
	var dscnt_tot = 0;
    var slno = 1;
    
    report_html += "<tr>";
    report_html += "<td>SlNo</td><td>BillNo</td><td>Patient Name</td><td align='right'>Discount</td><td align='right'>Amount</td>";
    report_html += "</tr>";
    report_html  += "<tr><td colspan=5><hr/>"; 
    var dscnt = 0;
    for( x in bills ){
	    dscnt = bills[x]["discount"];
		dscnt_tot += parseInt(dscnt);
        //alert( bills[x]["billid"] );
		var billid =  bills[x]["billid"];
		var pname  = bills[x]["pname"];
		
        var bamt = totalBill( bills[x]["billdata"] );
		
		// bills[x]["billid"]
        report_html += "<tr>";
        report_html += "<td>"+slno.toString() +"</td><td>" + billid + "</td><td>" +  pname + "</td><td align='right'>"+dscnt+"</td><td align='right'>" + bamt.toString() + "</td>";
        report_html += "</tr>";
        slno += 1;
        
        tot_amt +=  bamt;
  
    }
    report_html  += "<tr><td colspan=5><hr/>";    
    
    report_html += "<tr><td colspan=3><h2>TOTAL AS ON "+todt +  "</h2></td><td align='right'><h2>Discount: "  + dscnt_tot + "</h2></td><td align='right'><h2>"  + tot_amt + "</h2></td></tr>";
	tot_amt = tot_amt - dscnt_tot;
	report_html += "<tr><td colspan=5 align=right><h2>Total Cash after discount : " +tot_amt+ "</h2></td></tr>";
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
