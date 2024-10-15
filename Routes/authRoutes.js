const app= require('express');
const { sesiones,  cerrarsesion, insertarUsuarios }=require("../Controllers/authControllers");
const{ cargalogin, cargarRegister }= require('../Controllers/CargaControllers')
const router=app.Router();

router.post("/login",sesiones);
router.post('/register',insertarUsuarios)
router.get('/',cargalogin)
router.get('/register',cargarRegister)
router.get('/logout',cerrarsesion)
module.exports= router