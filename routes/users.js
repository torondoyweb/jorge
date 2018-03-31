var express = require('express');
var router = express.Router();
var cookieSession = require('cookie-session')
const mysql  = require('mysql')
const xbase = require('../clases/xbase')
var CryptoJS = require("crypto-js")
var AES = require("crypto-js/aes")
var infcarritoyusuario = require('../clases/infcarritoyusuario')
var nodemailer = require('nodemailer')

router.get('/usuarioregistro', function(req, res, next) {
    infcarritoyusuario.inflogin(req,function( minflogin,minfcarrito ){
        res.status(200).render('usuarioregistro',{xinflogin:minflogin, xinfcarrito:minfcarrito})
    })
})
router.post('/usuarioregistroguardar', function(req, res, next) {
    var mS = "insert usuarios (login,nombres,clave) values ('"
    mS += req.body.xlogin + "','"
    mS += req.body.xnom + "','"
    mS += req.body.xpw + "'"
    mS += ")"
    var conn = mysql.createConnection( xbase.db )
    conn.connect()
    conn.query(mS,function (error, results, fields) {
        if ( error ) {
            if (error.errno = 1062) {
                res.send("1062") //Duplicate key
            } else {
                res.send("error")
            }
        }
        if (!error){
            //Bienvenida(req.body.xlogin)
            res.send("Guardado")
        }
    })
    conn.end()
})
function Bienvenida(mCorreo){
    var transporter = nodemailer.createTransport(xbase.correo)
    var mailOptions = {
        from: xbase.correofrom.from,
        to: mCorreo,
        subject: 'Repuesta desde torondoyweb',
        html: xbase.html.cabecera + xbase.html.cuerpo + xbase.html.pie
    }
    transporter.sendMail(mailOptions, function(error, info){})
}
router.post('/usuarioentrar', function(req, res, next) {
    var bytes  = CryptoJS.AES.decrypt(req.body.xlogin, xbase.encriptacion.secreto)
    var mLogin = bytes.toString(CryptoJS.enc.Utf8)  

    bytes  = CryptoJS.AES.decrypt(req.body.xpw, xbase.encriptacion.secreto)
    var mPw = bytes.toString(CryptoJS.enc.Utf8)  

    var mS = "select nombres,clave from usuarios where login='" + mLogin + "'"

    var conn = mysql.createConnection( xbase.db )
    conn.connect()
    conn.query(mS,function (error, results, fields) {
        if ( error ) {
            req.session = null
            res.send("error")
        }
        if (!error){
            if ( results.length > 0 ) {
                bytes  = CryptoJS.AES.decrypt(results[0].clave, xbase.encriptacion.secreto)
                var mClave = bytes.toString(CryptoJS.enc.Utf8)  
                if ( mPw == mClave ) {
                    req.session.login = req.body.xlogin
                    req.session.pw = results[0].clave
                    infcarritoyusuario.inflogin(req,function( minflogin,minfcarrito ){
                        minflogin = JSON.parse(minflogin)
                        minfcarrito = JSON.parse(minfcarrito)
                        var mCyU = {
                            nomusuario: minflogin.nombres,
                            items: minfcarrito.items,
                            nombre: minfcarrito.nombre
                        }
                        res.send( mCyU )
                    })
                } else{
                    req.session = null
                    res.send("error")
                }
            } else {
                req.session = null
                res.send("error")
            }
        }
    })
    conn.end()
})
router.get('/admusuarios', function(req, res, next) {
    infcarritoyusuario.inflogin(req,function( minflogin,minfcarrito ){
        res.status(200).render('administracion/admusuarios',{ xinflogin:minflogin, xinfcarrito:minfcarrito  })
    })
})
router.get('/usrlist', function(req, res, next) {
    var mS = "select id,login,nombres,clave,tipo from usuarios order by nombres"
    var conn = mysql.createConnection( xbase.db )
    conn.connect()
    conn.query(mS,function (error, results, fields) {
        res.status(200).send(results)
    })
    conn.end()      
})
router.get('/usreliminar', function(req, res, next) {
    var mS = "delete from usuarios where id=" + req.query.xid
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
router.post('/enviarclave', function(req, res, next) {
    var bytes  = CryptoJS.AES.decrypt(req.body.xlogin, xbase.encriptacion.secreto)
    var mLogin = bytes.toString(CryptoJS.enc.Utf8)  
    var mS = "select nombres,clave from usuarios where login='" + mLogin + "'"
    var conn = mysql.createConnection( xbase.db )
    conn.connect()
    conn.query(mS,function (error, results, fields) {
        if (!error && results.length > 0 ){
            bytes  = CryptoJS.AES.decrypt(results[0].clave, xbase.encriptacion.secreto)
            var mPw = bytes.toString(CryptoJS.enc.Utf8)  
            var mR = ''
            mR += '<td align="center">'
            mR += '<p align="justify" style="color: #005dab; text-decoration: none; '
            mR += 'font-size: 25px;'
            mR += 'line-height: 1.2; font-weight: normal; font-family: "Lato","Helvetica Neue",'
            mR += 'Helvetica,Arial,sans-serif; text-align: left;">'
            mR += 'Hola <b>' + results[0].nombres + '</b> '
            mR += 'gracias por utilizar nuestros servicios tu clave es: '
            mR += '</p>'
            mR += '<p style="color:green;font-size: 30px; line-height: 1.2;">'
            mR += mPw
            mR += '</p>'
            mR += '</td>'




            var transporter = nodemailer.createTransport( xbase.correo )
            var mailOptions = {
                from: xbase.correofrom.from,
                to: mLogin,
                subject: 'Repuesta desde torondoyweb recordatorio de clave',
                html: xbase.html.cabecera + mR + xbase.html.pie
            }
            transporter.sendMail(mailOptions, function(error, info){})
        }
    })
    conn.end()
})
router.get('/sinsesion', function(req, res, next) {
    infcarritoyusuario.inflogin(req,function( minflogin,minfcarrito ){
        res.status(200).render('sinsesion',{xinflogin: minflogin,xinfcarrito: minfcarrito})
    })
})
module.exports = router;
