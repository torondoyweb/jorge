var express = require('express');
var router = express.Router();
const mysql  = require('mysql')
const xbase = require('../clases/xbase')
var fs = require('fs')
var path = require("path")
var infcarritoyusuario = require('../clases/infcarritoyusuario')
var multer  = require('multer') // Para subir imagenes

var mPathImagenes = path.join(__dirname, '../public/images/repuestos')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, mPathImagenes)
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
      //cb(null, file.fieldname + '-' + Date.now()+'.jpg')
    }
})
var upload = multer({ storage: storage }).single('ximagen')

router.post('/categoriaagregar', function(req, res, next) {
	var mS = "insert into categorias (nombre) values ('" + req.body.xnombrecat + "')"
	var conn = mysql.createConnection( xbase.db )
	conn.connect()
	conn.query(mS,function (error, results, fields) {
      if ( error ) {
      	res.send("error")
    	} else {
			 res.send("Guardado")
    	}
	})
	conn.end()
})

router.post('/categoriasaveedit', function(req, res, next) {
  var mS = "update categorias set nombre='" + req.body.xnombrecat + "' where id=" + req.body.xidcat
  var conn = mysql.createConnection( xbase.db )
  conn.connect()
  conn.query(mS,function (error, results, fields) {
      if ( error ) {
        res.send("error")
      } else {
       res.send("Guardado")
      }
  })
  conn.end()
})

router.get('/categorias', function(req, res, next) {
    infcarritoyusuario.inflogin(req,function( minflogin,minfcarrito ){
        res.status(200).render('administracion/categorias',{ xinflogin:minflogin, xinfcarrito:minfcarrito  })
    })
})

router.get('/categoriaslist', function(req, res, next) {
  var mS = "select id,nombre from categorias order by nombre"
  var conn = mysql.createConnection( xbase.db )
  conn.connect()
  conn.query(mS,function (error, results, fields) {
      res.status(200).send(results)
  })
  conn.end()
})

router.post('/categoriaborrar', function(req, res, next) {
  var mS = "delete from categorias where id=" + req.body.xidcat
  var conn = mysql.createConnection( xbase.db )
  conn.connect()
  conn.query(mS,function (error, results, fields) {
      if ( error ) {
        res.send("error")
      } else {
       res.send("Borrado")
      }
  })
  conn.end()
})

router.get('/repuestos', function(req, res, next) {
    infcarritoyusuario.inflogin(req,function( minflogin,minfcarrito ){
        res.status(200).render('administracion/repuestos',{ xinflogin:minflogin, xinfcarrito:minfcarrito  })
    })
})

router.get('/repuestoslist',function(req, res, next) {
  var mS = "select id,codigo,nombre,descripcion,disponible,existencia,precio,'' as imagen from repuestos"
  if ( req.query.xidcat != 0 ) {
      mS = "select id,codigo,nombre,descripcion,disponible,existencia,precio from repuestos "
      mS += "where idcat=" + req.query.xidcat
  }
  mS +=" order by " + req.query.xorden
  var mPath = path.join(__dirname, '../public/images/repuestos')
  var conn = mysql.createConnection( xbase.db )
  conn.connect()
  conn.query(mS,function (error, results, fields) {
      fs.readdir(mPath, function(err, items) {
          for (var i=0; i<results.length; i++) {
              if (items.indexOf(results[i].codigo+".jpg") > -1) { // Se verifica si tiene Imagen y se agrega
                  results[i].imagen = results[i].codigo+".jpg"
              }
          }
          res.status(200).send(results)
      })
  })
  conn.end()
})

router.get('/repuestosagregar', function(req, res, next) {
      res.status(200).render('administracion/repuestosagregar')
})

router.post('/repuestosgrabarnuevo', function(req, res, next) {
  var mS = ""
  if (req.body.xid == 0) { // Nuevo
      mS += "insert repuestos (codigo,nombre,descripcion,existencia,precio,disponible,idcat) values ("
      mS += "'" + req.body.xcod.trim() + "','" + req.body.xnom.trim() + "','" + req.body.xdes.trim() + "',"
      mS += req.body.xexi + ","
      mS += req.body.xprecio + ","
      mS += "'" + req.body.xdisp + "',"
      mS += req.body.xidcat 
      mS += ")"  
  }
  if (req.body.xid != 0) { // Usado
      mS += "update repuestos set "
      mS += "nombre='" +req.body.xnom.trim() + "',"
      mS += "descripcion='" +req.body.xdes.trim() + "',"
      mS += "existencia=" +req.body.xexi + ","
      mS += "precio=" +req.body.xprecio + ","
      mS += "disponible='" +req.body.xdisp + "',"
      mS += "idcat=" +req.body.xidcat
      mS += " where id=" + req.body.xid
  }
  
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
          res.send("Guardado")
      }
  })
  conn.end()
})

router.get('/repuestosunosolo',function(req, res, next) {
  var mS = "select codigo,repuestos.nombre,descripcion,disponible,existencia,precio,idcat,"
      mS += "categorias.nombre as nombrecat "
      mS += "from repuestos "
      mS += "left join categorias on categorias.id=repuestos.idcat "
      mS += "where repuestos.id=" + req.query.xid
  var conn = mysql.createConnection( xbase.db )
  conn.connect()
  conn.query(mS,function (error, results, fields) {
      res.status(200).send(results)
  })
  conn.end()
})

router.post('/repuestoseliminar', function(req, res, next) {
    var mS = "delete from repuestos where id=" + req.body.xid
    var conn = mysql.createConnection( xbase.db )
    conn.connect()
    conn.query(mS,function (error, results, fields) {
        if ( error ) {
            res.send("error")
        }
        if (!error){
            res.send("Eliminado")
        }
    })
    conn.end()
})
router.get('/subirimagenes', function(req, res, next) {
    infcarritoyusuario.inflogin(req,function( minflogin,minfcarrito ){
        res.status(200).render('administracion/subirimagenes',{ xinflogin:minflogin, xinfcarrito:minfcarrito  })
    })
})
router.post('/grabarimagen', function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            res.send(false)
        }
         if (!err) {
            res.send(true)
        }
    })
})
router.get('/basededatos', function (req, res) {
    var mS = "show tables from jorge"
    var conn = mysql.createConnection( xbase.db )
    conn.connect()
    conn.query(mS,function (error, results, fields) {
        if ( error ) {
            res.send("error")
        }
        if (!error){
            infcarritoyusuario.inflogin(req,function( minflogin,minfcarrito ){
                res.status(200).render('administracion/basededatos',{ 
                      xinflogin:minflogin,
                      xinfcarrito:minfcarrito,
                      xbasededatos: xbase.db.database,
                      xlisttablas: JSON.stringify( results )
                })
            })
        }
    })
    conn.end()  
})

module.exports = router