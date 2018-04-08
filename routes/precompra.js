var express = require('express')
var router = express.Router()
var infcarritoyusuario = require('../clases/infcarritoyusuario')
const mysql  = require('mysql')
const xbase = require('../clases/xbase')

function itemsPrecompra(midUsuario,callback){
    var mS = ""
    mS += "select "
    mS += "detalles.cantidad,detalles.precio,detalles.fecha,detalles.id as iddetalle,"
    mS += "detalles.cantidad * detalles.precio as monto,"
    mS += "repuestos.nombre,repuestos.codigo "
    mS += "from detalles "
    mS += "join repuestos on repuestos.id=detalles.idarticulo "
    mS += "join carrito on carrito.id=detalles.idcarrito "
    mS += "where carrito.estatus='Abierto' and idusuario=" + midUsuario
    var conn = mysql.createConnection( xbase.db )
    conn.connect()
    conn.query(mS,function (error, results, fields) {
        return callback( results )
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
    infcarritoyusuario.tablaUsuarios(req,function( usuario ){
        if ( usuario.id != 0 ) {
            infcarritoyusuario.inflogin(req,function( minflogin,minfcarrito ){
                itemsPrecompra(usuario.id,function(items){
                    res.status(200).render('precompras',{
                        xinflogin: minflogin,
                        xinfcarrito: minfcarrito,
                        xprecompra: JSON.stringify( items )
                    })
                })
            })
        } else {
            res.redirect('/sinsesion')
        }
    })
})
router.post('/precompraeliminaritem',function(req, res, next) {
    var conn = mysql.createConnection( xbase.db )
    var mS = "delete from detalles where id=" + req.body.xiddetalle
    infcarritoyusuario.tablaUsuarios(req,function( usuario ){
        if ( usuario.id != 0 ) {
            conn.connect()
            conn.query(mS,function (error, results, fields) {
                if( error ) {
                    res.status(200).send("error")
                } else {    
                    infcarritoyusuario.cantItems(req,function( mCarrito ){
                        itemsPrecompra(usuario.id,function(data){
                            data.unshift(mCarrito)
                            res.status(200).send(data)
                        })
                    })
                }
            })
            conn.end()
        } else {
            res.status(200).send("sin sesion")
        }
    })
})



module.exports = router
