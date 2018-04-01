var express = require('express')
var router = express.Router()
var infcarritoyusuario = require('../clases/infcarritoyusuario')
const mysql  = require('mysql')
const xbase = require('../clases/xbase')

router.get('/catalogo',function(req, res, next) {
	infcarritoyusuario.inflogin(req,function( minflogin,minfcarrito ){
        res.status(200).render('catalogo',{ xinflogin:minflogin, xinfcarrito:minfcarrito  })
    })
})
router.get('/catlistrepuestos',function(req, res, next) {
    var mS = "select id,codigo,nombre,descripcion,disponible,existencia,precio "
    mS += "from repuestos order by codigo"
    var conn = mysql.createConnection( xbase.db )
    conn.connect()
    conn.query(mS,function (error, results, fields) {
        res.status(200).send(results)
    })
    conn.end()   
})
router.post('/catalogoagregar',function(req, res, next) {
    var mIdart = req.body.xidart
    var mCant = req.body.xcant
    infcarritoyusuario.tablaUsuarios(req,function( usuario ){
        if ( usuario.id != 0 ) {
            var mS="select id from carrito where estatus='Abierto' and idusuario="+usuario.id 
            var conn = mysql.createConnection( xbase.db )
            conn.connect()
            conn.query(mS,function (error, results, fields) {
                if ( results.length == 0 ){ // El usuario NO tiene un carrito Abierto **
                    console.log("No tiene")
                    mS = "insert into carrito (idusuario) values (" + usuario.id + ")"
                    var conn1 = mysql.createConnection( xbase.db )
                    conn1.connect()
                    conn1.query(mS,function (error, results, fields) {
                        mS="select id from carrito where estatus='Abierto' and idusuario="+usuario.id
                        var conn2 = mysql.createConnection( xbase.db )
                        conn2.connect()
                        conn2.query(mS,function (error, results, fields) {
                            var mIdcarrito = 0
                            if ( error ){
                                res.status(200).send("error")
                            } else {
                                if ( results.length > 0 ){
                                    mIdcarrito=results[0].id
                                }
                                if ( mIdcarrito == 0 ) {
                                    res.status(200).send("error")
                                } else {
                                    insertarArticulo(req,mIdcarrito,mIdart,mCant,function(callback){
                                        res.status(200).send(callback) //Retorna error o carrito
                                    })
                                }
                            }
                        })
                        conn2.end()
                    })
                    conn1.end()
                } else { // El usuario tiene un carrito Abierto **
                    var mIdcarrito = results[0].id
                    insertarArticulo(req,mIdcarrito,mIdart,mCant,function(callback){
                        res.status(200).send(callback) //Retorna error o carrito
                    })
                }
            })
            conn.end()
        } else {
            console.log( "Sin sesion en catalogo: /catalogoagregar")
            res.status(200).send("sin sesion")
        }           
    })
})
function insertarArticulo(mReq,mIdcarrito,mIdart,mCant,callback){
    var mS = "select precio from repuestos where id=" + mIdart
    var conn = mysql.createConnection( xbase.db )
    conn.connect()
    conn.query(mS,function (error, results, fields) {
        var mPrecio = 0
        if ( error ) {
            return callback( "error" )
        } else {
            if ( results.length > 0 ){
                mPrecio=results[0].precio
            }
            if ( mPrecio == 0 ) {
                return callback( "error" )
            }    
            if ( mPrecio > 0 ){
                mS = ''
                mS += "insert into detalles (idcarrito,cantidad,precio,"
                mS += "idarticulo) values (" 
                mS += mIdcarrito + ","
                mS += mCant + ","
                mS += mPrecio + ","
                mS += mIdart
                mS += ")"
                var conn1 = mysql.createConnection( xbase.db )
                conn1.connect()
                conn1.query(mS,function (error, results, fields) {
                    if ( error ) {
                        return callback( "error" )
                    } else {
                         infcarritoyusuario.cantItems(mReq,function( carrito ){
                            return callback( carrito )
                        })
                    }
                })
                conn1.end()
            }
        }
    })
    conn.end()
}
router.get('/verificarcompra',function(req, res, next) {
    infcarritoyusuario.tablaUsuarios(req,function( usuario ){
        if ( usuario.id != 0 ) {
            var mS = ""
            mS += "select count(*) as precompras from detalles "
            mS += "join carrito on carrito.id=detalles.idcarrito "
            mS += "where carrito.estatus='Abierto' and carrito.idusuario="+usuario.id
            var conn = mysql.createConnection( xbase.db )
            conn.connect()
            conn.query(mS,function (error, results, fields) {
                if ( error ){
                    res.status(200).send("error")
                } else {
                    if ( results[0].precompras > 0 ){
                        res.status(200).send("success")
                    } else {
                        res.status(200).send("nada")
                    }
                }
            })
            conn.end()
        } else {
            console.log( "Sin sesion en catalogo: /verificarcompra")
            res.status(200).send("sin sesion")
        }
    })
})
router.get('/precompras',function(req, res, next) {
    var mS = ""
    mS += "select "
    mS += "detalles.cantidad,detalles.precio,detalles.fecha,detalles.id as iddetalle,"
    mS += "detalles.cantidad * detalles.precio as monto,"
    mS += "repuestos.nombre,repuestos.codigo "
    mS += "from detalles "
    mS += "join repuestos on repuestos.id=detalles.idarticulo "
    mS += "join carrito on carrito.id=detalles.idcarrito "
    mS += "where carrito.estatus='Abierto' and idusuario="

    infcarritoyusuario.tablaUsuarios(req,function( usuario ){
        mS += usuario.id
        if ( usuario.id != 0 ) {
            var conn = mysql.createConnection( xbase.db )
            conn.connect()
            conn.query(mS,function (error, results, fields) {            
                infcarritoyusuario.inflogin(req,function( minflogin,minfcarrito ){
                    res.status(200).render('precompras',{
                        xinflogin: minflogin,
                        xinfcarrito: minfcarrito,
                        xprecompra: JSON.stringify( results )
                    })
                })
            })
            conn.end()
        } else {
            res.redirect('/sinsesion')
        }
    })
})
module.exports = router