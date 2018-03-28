var express = require('express');
var router = express.Router();
const mysql  = require('mysql')
const xbase = require('../clases/xbase')
var CryptoJS = require("crypto-js")
var AES = require("crypto-js/aes")

/*
xinflogin {
	
}
xinfcarrito {
	cantitems:
}
*/

function inflogincerrado(mReq,callback){	
	var minflogin = {
	    login: '',
	    nombres: 'Entrar',
	    clave: '',
	    acycinckpw: xbase.encriptacion.secreto
    }
	var minfcarrito = {
		items: 0,
		nombre: "Repuestos"
	}
    minflogin = JSON.stringify( minflogin )
    minfcarrito = JSON.stringify( minfcarrito )
	return callback( minflogin,minfcarrito )
}

function inflogin(mReq,callback){
	var minfcarrito = {items: 0,nombre: "Repuestos" }
	var mLogin = ''
	var minflogin = {
	    login: '',
	    nombres: 'Entrar',
	    clave: '',
	    acycinckpw: xbase.encriptacion.secreto
    }

	if ( typeof(mReq.session.login) != "undefined" ) {
		mLogin = mReq.session.login
		minflogin = {
	        login: mReq.session.login,
	        nombres: '',
	        clave: mReq.session.pw,
	        acycinckpw: xbase.encriptacion.secreto }
    }

	if ( mLogin != '') {
		tablaUsuarios(mReq,function(tabla){
			minflogin.nombres = tabla.nombres
		    minflogin = JSON.stringify( minflogin )
		    minfcarrito = JSON.stringify( minfcarrito )
		    cantItems(mReq,function(carrito){
	    		minfcarrito = JSON.stringify( carrito )
				return callback( minflogin,minfcarrito )
			})
		})
	} else {
	    minflogin = JSON.stringify( minflogin )
	    minfcarrito = JSON.stringify( minfcarrito )
		return callback( minflogin,minfcarrito)
	}
}
function tablaUsuarios(mReq,callback){ // esta funcion retorna informacion de la tabla Usuarios
	if ( typeof(mReq.session.login) != "undefined" ) {
		mLogin = mReq.session.login
 		var bytes  = CryptoJS.AES.decrypt(mLogin, xbase.encriptacion.secreto)
		mLogin = bytes.toString(CryptoJS.enc.Utf8)  

		var mS = "select id,nombres from usuarios where login='" + mLogin + "'"
		var conn = mysql.createConnection( xbase.db )
    	conn.connect()
    	conn.query(mS,function (error, results, fields) {
			if ( results.length > 0 ) {
				return callback( {id:results[0].id,nombres:results[0].nombres } )
			} else {
				return callback( {id:0,nombres:''} )
			}
		})
    	conn.end()
	} else {
		return callback( {id:0,nombres:''} )
	}
}

function cantItems(mReq,callback){ // Retorna informacion de los Items del carrito
	var mS = ''
	if ( typeof(mReq.session.login) != "undefined" ) {
		tablaUsuarios(mReq,function( usuario ){
			if ( usuario.id == 0 ){
				return callback( {items: 0, nombre: "Repuestos"} )
			} else {
				mS += "select sum(cantidad) as items from detalles "
				mS += "inner join carrito on detalles.idcarrito=carrito.id "
				mS += "where carrito.estatus='Abierto' and carrito.idusuario=" + usuario.id
				var conn = mysql.createConnection( xbase.db )
    			conn.connect()
    			conn.query(mS,function (error, results, fields) {
    				if ( !error ) {
	    				if ( results[0].items == null){
	    					return callback( {items: 0, nombre: "Repuestos"} )
						} else {
	    					return callback( {items: results[0].items, nombre: "Repuestos"})
	    				}
	    			} else {
						return callback( {items: 0, nombre: "Repuestos"} )
    				}
				})
				conn.end()
			}
		})
	} else {
		return callback( {items: 0, nombre: "Repuestos"} )
	}	
}

module.exports = {inflogin,inflogincerrado,tablaUsuarios,cantItems}
