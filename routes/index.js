var express = require('express');
var router = express.Router();
var infcarritoyusuario = require('../clases/infcarritoyusuario')
const xbase = require('../clases/xbase')
var CryptoJS = require("crypto-js")
var AES = require("crypto-js/aes")

router.get('/', function(req, res, next) {
    infcarritoyusuario.inflogin(req,function( minflogin,minfcarrito ){
        res.status(200).render('index',{ xinflogin:minflogin, xinfcarrito:minfcarrito  })
        //res.status(200).render('ejemplosdeconfirmacion')
    })
   
    //res.status(200).render('catalogo',{ layout: false })
 })
router.get('/cerrarcesion', function(req, res, next) {
    req.session = null
    infcarritoyusuario.inflogincerrado(req,function( minflogin,minfcarrito ){
        res.status(200).render('index',{ xinflogin:minflogin, xinfcarrito:minfcarrito  })
    })
}) 



module.exports = router;
