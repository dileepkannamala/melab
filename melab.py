#! /usr/bin/python

__author__="dileep"
__date__ ="$22 Jul, 2015 1:58:24 PM$"

import web
import json
import datetime

web.config.debug = True
from  hashlib import md5
global context
db = web.database(dbn='mysql', db='mltdb', user='mltdb', pw='mltdb@123')
today = datetime.date.today()



urls = ('/','index', 
		'/login','login',
		'/home','home',
		'/logout','logout', 
		'/newreg','newreg',
	    '/getnewpatientid','getnewpatientid',
		'/register','register',
		'/testreq','testreq',
		'/getpatientdata/(.+)','getpatientdata',
		'/searchform','searchform',
		'/getallpatientdata','getallpatientdata',
		'/saverequest','saverequest',
		'/editresult','editresult',
		'/getbillsnotfilled','getbillsnotfilled',
		'/showbillform/(.+)','showbillform',
		'/saveresults','saveresults',
		'/gettestname/(.+)','gettestname',
		'/addconftests','addconftests',
		'/usermanagement','usermanagement',
		'/getbillsfor/(.+)','getbillsfor',
		'/getbill/(.+)','getbill',
        '/delbill/(.+)','delbill',
        '/getalltests','getalltests',
        '/gettestsforgroup/(.+)','gettestsforgroup',
        '/dailyreport','dailyreport',
        '/reportgen','reportgen',
        '/changepassword','changepassword',
        '/newuser','newuser',
        '/canceluser','canceluser',
        '/getsubsubtests/(.+)','getsubsubtests',
        '/addcategory','addcategory'
        
		
	   )
app = web.application( urls, globals())
if web.config.get('_session') is None:
    session = web.session.Session(app, web.session.DiskStore('sessions'))
    web.config._session = session
else:
    session = web.config._session
    
render = web.template.render('views/', globals={'context': session})


class index:
    def GET(self):
        d = {"loggedin":False,"username":""}
        return render.index(d)

class login:
    def POST(self):
        
        userdata = web.input()
        username = userdata.username
        userpass = userdata.passwd
        vars = dict( username=username, userpass=userpass)
        user = db.select('USERS', where = "username = $username", vars = vars )
        user=list(user)
        curdate = str(today.strftime('%Y-%m-%d'))
        if  len(user) > 0 and username == user[0]["username"] and md5(userpass).hexdigest() == user[0]["passwd"]:
            d = {"loggedin":True,"username":username, "today":curdate}
            session.userdata = d
            msg = "User " + username + " logged in at " + curdate 
            db.insert("LOGS",message = msg)
            
            return render.index(d)
        else:
            d = {"loggedin":False,"username":""}
            return render.index(d)
        
class logout:
    def GET(self):
        d = session.get('userdata',{"loggedin":False,"username":""})
        curdate = str(today.strftime('%Y-%m-%d'))
        msg = "User " + d["username"] + " logged out at " + curdate 
        db.insert("LOGS",message = msg)
        session.kill()
        raise web.seeother("/")
        

class home:
    def GET(self):
        d = session.get('userdata',{"loggedin":False,"username":""})
        return render.home(d)
    

class newreg:
    def GET(self):
        d = session.get('userdata',{"loggedin":False,"username":""})
        return render.newreg(d)
        

class register:
    def POST(self):
        d = session.get('userdata',{"loggedin":False,"username":""})
        fd = web.input()
        #print formdata
        sequence_id = db.insert('PATIENT', PCODE = fd["pcode"], PNAME = fd["pname"], ADDRESS = fd["address"], PPHONE=fd["pphone"], AGE = fd["age"], SEX = fd["sex"], REF_DR_NAME=fd["refdrname"],DATE_ADM = fd["doa"] )
        
        msg = "New Patient added by " + d["username"]
        db.insert("LOGS",message = msg)
        raise web.seeother("/home","_parent")
	
class getnewpatientid:
	def POST(self):
		lpid = db.query("SELECT MAX(PCODE) as ID FROM PATIENT")
		lpid = list(lpid)
		#print lpid[0]['ID']
		#
		_xtmp = int( lpid[0]['ID'] )
		_xtmp += 1
		#print json.dumps( _xtmp )
		return json.dumps( _xtmp )
		
class getpatientdata:
    def GET(self,pcode):
        pdata = db.query("SELECT PCODE,PNAME, PPHONE, ADDRESS, REF_DR_NAME, AGE, SEX  FROM PATIENT WHERE PCODE = '%s'" % pcode )
        #print json.dumps(pdata[0])
        pdata = list(pdata)
        #print pdata[0]
        return json.dumps( pdata[0])
        
class getallpatientdata:
    def GET(self):
        pdata = db.query("SELECT PCODE as recid, PCODE,PNAME, PPHONE, ADDRESS, REF_DR_NAME, AGE, SEX  FROM PATIENT")
        #print json.dumps(pdata[0])
        pdata = list(pdata)
        
        return json.dumps( pdata)
	
class testreq:
    def GET(self):
        d = session.get('userdata',{"loggedin":False,"username":""})
        #opts = db.query("SELECT s.TESTCODE,s.STESTNAME,s.SUBTSTCODE,AGAIN,amt,ss.SSCODE,ss.SSTESTNAME FROM SUBTEST s LEFT OUTER JOIN SUBSUBTEST  ss on ss.SUBTSTCODE = s.SUBTSTCODE")
        opts = db.query("SELECT s.TESTCODE,s.STESTNAME,s.SUBTSTCODE,AGAIN,amt, stid FROM SUBTEST s ORDER BY s.STESTNAME ASC")
        opts = list(opts)
        pats = db.query("SELECT PCODE, PNAME, ADDRESS,PPHONE, AGE, SEX, REF_DR_NAME FROM PATIENT ORDER BY PCODE DESC");
        pats = list(pats)
        d["options"] = opts
        d["patients"] = pats
        
        return render.testrequest(d)
        
class saverequest:
    def POST(self):
        
        treq = web.input()
        d = session.get('userdata',{"loggedin":False,"username":""})
        #print treq["pcode"], treq["billdate"], treq["billdata"]
        if int(treq["billid"]) == 0:
            billno = db.insert('BILLS',pcode=treq["pcode"],billdate=treq["billdate"], billdata = treq["billdata"],billenteredby= d["username"], valuesaved='N' )
            msg = "Bill No:"+ str(billno) +" Entered by "  + d["username"]
            db.insert("LOGS",message = msg)
        else:
            billno = treq["billid"]
            tvid   = db.update( 'BILLS',where='billid = $billno', vars = locals(),pcode=treq["pcode"],billdate=treq["billdate"], billdata = treq["billdata"],billenteredby= d["username"], valuesaved='N')
            msg = "Bill No:"+ str(billno) +" Updated by "  + d["username"]
            db.insert("LOGS",message = msg)
        return json.dumps({'billno':billno})

class saveresults:
    def POST(self):
        tres = web.input()
        #for x in tres.values():
		#	print x
			
        d = session.get('userdata',{"loggedin":False,"username":""} )
        billid = tres["billid"]
        if d["existingbill"] == False:
            tvid = db.insert('TESTVALUES',pcode=tres["pcode"],billid=tres["billid"], enteredby=d["username"],testdata=tres["testdata"])
            msg = "Bill No:"+ str(billid) +"Results First Entered by "  + d["username"]
            db.insert("LOGS",message = msg)
        else:
            tvid = db.update('TESTVALUES',where='billid = $billid', vars = locals(), pcode=tres["pcode"],billid=tres["billid"], enteredby=d["username"],testdata=tres["testdata"])
            msg = "Bill No:"+ str(billid) +" Results Updated by "  + d["username"]
            db.insert("LOGS",message = msg)
			
        return "Ok"
		

class editresult:
    def GET(self):
        
        d = session.get('userdata',{"loggedin":False,"username":""})
         
        return render.editrequest(d)

class getbillsnotfilled:
    def GET(self):
        d = session.get('userdata',{"loggedin":False,"username":""})
        
        # WHERE b.valuesaved = 'N'  -- Use this where clause when billalready saved need not be included in editing.
        sqlx = """
            SELECT billid as recid, DATE_FORMAT(b.billdate,'%Y-%m-%d') as billdate,b.billid,b.pcode,p.pname,p.SEX, p.AGE, p.REF_DR_NAME 
            FROM  BILLS  b
                  INNER JOIN  PATIENT p ON p.pcode = b.pcode
             
            ORDER BY  b.billdate  DESC 
        """
        bills = db.query(sqlx)
        bills = list(bills)		
        #print json.dumps(bills)
        return json.dumps( bills )

class getbillsfor:
    def GET(self,pcode):
        d = session.get('userdata',{"loggedin":False,"username":""})
        
        # WHERE b.valuesaved = 'N'  -- Use this where clause when billalready saved need not be included in editing.
        sqlx = """
            SELECT billid as recid, DATE_FORMAT(b.billdate,'%%Y-%%m-%%d') as billdate,b.billid,b.pcode,p.pname,p.SEX, p.AGE, p.REF_DR_NAME 
            FROM  BILLS  b
                  INNER JOIN  PATIENT p ON p.pcode = b.pcode
            WHERE p.pcode = %s 
            ORDER BY  b.billdate  DESC 
        """ % ( pcode )
        bills = db.query(sqlx)
        bills = list(bills)		
        #print json.dumps(bills)
        return json.dumps( bills )
#class getbill:
#    def GET(self,billid):
#		sqlx = """ SELECT billdata FROM BILLS WHERE billid = %s """ % ( billid )
#		bills = db.query( sqlx )
#		bills = list(bills)
		
#		return json.dumps( bills[0]["billdata"] )

	
        
class showbillform:
    def GET(self,bid):
        d = session.get('userdata',{"loggedin":False,"username":""})
        d["existingbill"] = False
        sqlx = """
             SELECT COUNT(*) as CNT FROM TESTVALUES WHERE billid = %s
        """ % ( bid )
        bdata = db.query( sqlx )
        bdata = list(bdata)
        #print bdata
        if bdata[0]['CNT'] != 0:
            sqlx  = """
			    SELECT billid,pcode, testdata FROM TESTVALUES WHERE billid = %s 
            """ % ( bid )
            bdata = db.query( sqlx )
            bdata = list(bdata)
            objs  = bdata
            
            dobjslist = json.loads( objs[0]["testdata" ])
            d["existingbill"] = True
        else:
        
            sqlx = """
				  SELECT billdata FROM BILLS WHERE billid = %s
			""" % ( bid )
            bdata = db.query(sqlx)
            bdata = list(bdata)
            objs =  bdata[0] 
            objslist = json.loads( objs["billdata"] )
            d["existingbill"] = False
			#TestCode, TestName, Subtestcode, SubtestName, Normal Value, Unit, ActualVal
            sqlx = """
				  SELECT CASE s.AGAIN
							 WHEN  'Y'  THEN ss.SSCODE
							 WHEN  'N'  AND IFNULL(ss.SSCODE,'') = '' THEN s.SUBTSTCODE
							 ELSE  s.SUBTSTCODE
							   
						 END as recid,s.SUBTSTCODE, s.STESTNAME, IFNULL(ss.SSCODE,'') as SSCODE, IFNULL(ss.SSTESTNAME,'') as SSTESTNAME, 
						 CASE s.AGAIN
							 WHEN  'Y'  THEN ss.NOR_VALUE  
							 WHEN  'N'  THEN s.NOR_VALUE
							 ELSE   s.NOR_VALUE
						 END as NOR_VALUE,
						 IFNULL(ss.UNIT,'') as UNIT, '' as ACT_VAL
				  FROM SUBTEST s 
						   LEFT OUTER JOIN SUBSUBTEST ss ON ss.SUBTSTCODE = s.SUBTSTCODE 
				  WHERE s.SUBTSTCODE = '%s' 
            """
		
            dobjslist = []
            for i in objslist:
			    ddata = db.query( sqlx % i["SUBTSTCODE"] )
			    for x in  list(ddata):
				    dobjslist.append( x )
		
        print json.dumps( dobjslist)
               
        return json.dumps( dobjslist  )


class gettestname:
    def GET(self,tcode):
        sqlx = """ SELECT m.TESTNAME FROM MAINTEST m
                   INNER JOIN SUBTEST s ON m.mtid = s.TESTCODE
                   WHERE s.SUBTSTCODE = %d
                   GROUP BY m.mtid
        
        """ % ( int(tcode) )
        tname = db.query(sqlx)
        tname = list(tname)
        return json.dumps( tname )
        
class searchform:
	def GET(self):
		d = session.get('userdata',{"loggedin":False,"username":""})
		return render.searchform(d)

class addconftests:
    def GET(self):
        d = session.get('userdata',{"loggedin":False,"username":""})
        categs = db.query("SELECT mtid as recid, mtid,testname FROM MAINTEST");
        categs = list(categs)
        d["categories"] = categs
              
        subtests = db.query("SELECT stid as recid,STESTNAME,SDESCR,NOR_VALUE,SUBTSTCODE,AGAIN,amt,stid FROM SUBTEST");
        subtests = list(subtests)
        #subtests = [1,2,3,4,5]
        d["subtests"] =  subtests 
               
        return render.addconftests( d )

class getalltests:
    def GET(self):
        d = session.get('userdata',{"loggedin":False,"username":""})
        subtests = db.query("SELECT stid as recid,STESTNAME,SDESCR,NOR_VALUE,SUBTSTCODE,AGAIN,amt,stid FROM SUBTEST");
        subtests = list(subtests)
        return json.dumps ( subtests  )

class gettestsforgroup:
    def GET(self, group):
        d = session.get('userdata',{"loggedin":False,"username":""})
        subtests = db.query("SELECT SUBTSTCODE as recid,STESTNAME,SDESCR,NOR_VALUE,SUBTSTCODE,AGAIN,amt FROM SUBTEST WHERE TESTCODE=%s" % ( group) );
        subtests = list(subtests)
        return json.dumps ( subtests  )
        
        
        
        
    
class getbill:
    def GET(self,bid):
        d = session.get('userdata',{"loggedin":False,"username":""})
        sqlx = """
				  SELECT billdata FROM BILLS WHERE billid = %s
			""" % ( bid )
        bdata = db.query(sqlx)
        bdata = list(bdata)
        objs =  bdata[0] 
        objslist = json.loads( objs["billdata"] )
        d["existingbill"] = True
        #print objslist
        return json.dumps(objslist)
    
class  delbill:
    def GET(self,bid):
        d = session.get('userdata',{"loggedin":False,"username":""})
        sqlx = """
				  DELETE FROM BILLS  WHERE billid = %s
			""" % ( bid )
        db.query(sqlx)
        sqlx = """
                  DELETE FROM TESTVALUES WHERE billid = %s
               """ % ( bid )
        db.query(sqlx)
        return bid
        

class usermanagement:
	def GET(self):
		d = session.get('userdata',{"loggedin":False,"username":""})
		return render.usermanagement(d)		

class dailyreport:
    def GET(self):
        d = session.get('userdata',{"loggedin":False,"username":""})
        return render.dailyreport(d)
class reportgen:
    def POST(self):
        d = session.get('userdata',{"loggedin":False,"username":""})
        frm = web.input()
        sqlx = """
                    SELECT b.billid as billid , b.billdate as billdate, p.pcode as pcode, p.pname as pname,  b.billdata as billdata, 
                    b.billenteredby as billenteredby
                    FROM BILLS b
                    INNER JOIN PATIENT p on p.pcode = b.pcode
                    WHERE b.billdate BETWEEN  '%s'  AND '%s'
                """ % ( frm["fromdt"], frm["todt"] )
        bills = db.query( sqlx )
        bills = list(bills)
        msg = "Cash Report Generated by "  + d["username"]
        db.insert("LOGS",message = msg)
        return json.dumps(bills, default=default)
class changepassword:
    def POST(self):
        d = session.get('userdata',{"loggedin":False,"username":""})
        frm = web.input()
        sqlx = """
                UPDATE USERS SET passwd = MD5('%s') WHERE username = '%s'
               """ % (  frm["newpass"], frm["username"])
        db.query (sqlx)
        msg = "Password Updated by "  + d["username"]
        db.insert("LOGS",message = msg)
        return None

class newuser:
    def POST(self):
        d = session.get('userdata',{"loggedin":False,"username":""})
        frm = web.input()
        db.insert("USERS", username= frm["username"], passwd = md5(frm["newpass"]).hexdigest(), type=frm["typ"], expired='N')
        msg = "New User :" + frm["username"] + " added by "  + d["username"]
        db.insert("LOGS",message = msg)
        return None
    
class canceluser:
    def POST(self):
        d = session.get('userdata',{"loggedin":False,"username":""})
        frm = web.input()
        sqlx = """
                UPDATE USERS SET expired = 'Y' WHERE username = '%s'
               """ % (   frm["username"])
        db.query (sqlx)
        msg = "User: "+ frm["username"] +" Cancelled by "  + d["username"]
        db.insert("LOGS",message = msg)
        return None
    
        
    
def default(o):
    if type(o) is datetime.date or type(o) is datetime.datetime:
        return o.isoformat()
        
class getsubsubtests:
    def GET(self,scode):
        
        sqlx = """
               SELECT SSCODE as recid, TESTCODE, SUBTSTCODE, UNIT, SSCODE, SSTESTNAME, NOR_VALUE FROM SUBSUBTEST
               WHERE  SUBTSTCODE = %d 
               """ % ( int(scode) )
        print sqlx
        sstests = db.query ( sqlx )
        sstests = list( sstests )
        return json.dumps( sstests )

class addcategory:
    def POST(self):
        d = session.get('userdata',{"loggedin":False,"username":""})
        frm = web.input()
        catg = frm["category"]
        descr = frm["descr"]
        catg = catg.strip().upper()
        entries = db.select("MAINTEST", where="TESTNAME=$catg",vars = locals() )
        
        if len(entries) == 0:
            max_id = db.query("SELECT MAX(mtid) as mtid FROM MAINTEST")
            next_mtid = max_id[0]["mtid"] + 1
            print next_mtid
            db.insert("MAINTEST",mtid=next_mtid,TESTNAME=catg,TESTCODE=next_mtid ,DESCR=descr)
            msg = " Category added by "  + d["username"]
            db.insert("LOGS",message = msg)
            
            
        return render.home( d ) 
        
    
 
if __name__ == "__main__":
    app.run()

