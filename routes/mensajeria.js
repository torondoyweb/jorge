var express = require('express')
var router = express.Router()
var infcarritoyusuario = require('../clases/infcarritoyusuario')
const mysql  = require('mysql')
const xbase = require('../clases/xbase')
var CryptoJS = require("crypto-js")
var AES = require("crypto-js/aes")
var nodemailer = require('nodemailer')

router.get('/contactanos', function(req, res, next) {
    infcarritoyusuario.inflogin(req,function( minflogin,minfcarrito ){
        res.status(200).render('contactanos',{ xinflogin:minflogin, xinfcarrito:minfcarrito  })
    })
})
router.post('/contactanosguardar', function(req, res, next) {
	var mIdUsuario = 0
	var mLogin = '' // Hay que ver el id del usuario si es que inicio session
	if ( typeof(req.session.login) != "undefined" ) {
		var bytes  = CryptoJS.AES.decrypt(req.session.login, xbase.encriptacion.secreto)
    	mLogin = bytes.toString(CryptoJS.enc.Utf8)  
	}
	var mS = "select id from usuarios where login='" + mLogin + "'"
    var conn = mysql.createConnection( xbase.db )
    conn.connect()
    conn.query(mS,function (error, results, fields) {
    	if ( results.length > 0 ) {
    		mIdUsuario = results[0].id
		}
	    mS = "insert mensajes (nombres,mensaje,correo,estado,idusuario) values ('"
	    mS += req.body.xnombres + "','"
	    mS += req.body.xmsg + "','"
		mS += req.body.xemail + "',"
		mS += "'Creado',"
		mS += mIdUsuario
	    mS += ")"
	    var conn2 = mysql.createConnection( xbase.db )
	    conn2.connect()
	    conn2.query(mS,function (error, results, fields) {
	        if ( error ) {
	            res.send("error")
	        }
	        if (!error){
	    		res.status(200).send('Guardado')
	        }
	    })
	    conn2.end()
    })
    conn.end()    	
})
router.get('/mensajeria', function(req, res, next) {
    infcarritoyusuario.inflogin(req,function( minflogin,minfcarrito ){
        res.status(200).render('administracion/mensajeria',{ xinflogin:minflogin, xinfcarrito:minfcarrito  })
    })
})
router.get('/mensajerialist', function(req, res, next) {
  	var mS = "select id,nombres,fecha,mensaje,correo,estado,msgrepuesta from mensajes "
  	if ( req.query.xwhere ){
  		mS += "where " + req.query.xwhere
  	}
    var conn = mysql.createConnection( xbase.db )
    conn.connect()
    conn.query(mS,function (error, results, fields) {
		res.status(200).send(results)
    })
    conn.end()    	
})
router.get('/mensajeriagetrepuesta', function(req, res, next) {
  	var mS = "select correo,msgrepuesta from mensajes where id=" + req.query.xid
    var conn = mysql.createConnection( xbase.db )
    conn.connect()
    conn.query(mS,function (error, results, fields) {
    	if ( error ) {
            res.send("error")
        }
        if (!error){
    		res.status(200).send(results)
        }
    })
    conn.end()    	
})
router.post('/mensajeriaenviar', function(req, res, next) {
	var transporter = nodemailer.createTransport({
	  service: 'gmail',
	  auth: {
	    user: xbase.correo.user,
	    pass: xbase.correo.pass
	  }
	})
    var mR = ''
    mR += '<td align="center">'
    mR += '<p align="justify" style="color: #005dab; text-decoration: none; font-size: 25px;'
    mR += 'line-height: 1.2; font-weight: normal; font-family: "Lato","Helvetica Neue",'
    mR += 'Helvetica,Arial,sans-serif; text-align: left;">'
    mR += req.body.xrpta
    mR += '</p>'
    mR += '</td>'
	var mailOptions = {
        from: 'torondoyweb@gmail.com',
        to: req.body.xcorreo,
        subject: 'Repuesta desde torondoyweb',
        html: xbase.html.cabecera + mR  + xbase.html.pie
	}
  	var mS = "update mensajes set msgrepuesta='" + req.body.xrpta + "' "
  	mS += "where id=" + req.body.xidmsg
  	var conn = mysql.createConnection( xbase.db )
    conn.connect()
    conn.query(mS,function (error, results, fields) {
    	if ( error ) {
            res.send("error")
        }
        if (!error){
			transporter.sendMail(mailOptions, function(error, info){
  			  if (error) {
    				res.send("error envio")
			  }
			  if (!error) {
    				res.send("Enviado")
    				guardarStatus(req.body.xidmsg)
			  }
			})
    	}
	})
	conn.end()  
})
function guardarStatus(mId){
  	var connx = mysql.createConnection( xbase.db )
    connx.connect()
    var mS = "update mensajes set estado='Enviado' where id=" + mId
    connx.query(mS,function (error, results, fields) {
	})	
	connx.end()
}
router.get('/mensajerirtpaeliminar', function(req, res, next) {
  	var mS = "delete from mensajes where id=" + req.query.xid
    var conn = mysql.createConnection( xbase.db )
    conn.connect()
    conn.query(mS,function (error, results, fields) {
    	if ( error ) {
            res.send("error")
        }
        if (!error){
    		res.status(200).send("Eliminado")
        }
    })
    conn.end()    	
})

module.exports = router;

