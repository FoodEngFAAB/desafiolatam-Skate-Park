/*
*********************

Instalar dependencias

npm init -y  
npm i --save axios
npm i --save bootstrap
npm i --save express
npm i --save express-fileupload
npm i --save express-handlebars
npm i --save jquery
npm i --save jsonwebtoken
npm i --save path
npm i --save pg

Iniciar node index.js

*********************
*/


//Importar dependencias
const express = require("express")
const { engine } = require('express-handlebars')
const expressFileUpload = require('express-fileupload')
const jwt = require('jsonwebtoken')
const path = require('path')

const app = express()

const secretKey = "159qwe@"
const { userGet, userStUpdate, userInsert, userUpdate, userDelete, userShow } = require('./consultas')

//Restringe tipo de archivos a subir
const permitFile = ['.gif', '.png', '.jpg', '.jpeg']

//Disponibiliza el puerto
const port = 3000
app.listen(port, () => console.log(`Servidor Inicializado en puerto: ${port}`))

//Middlewares. Disponibiliza para el cliente la ruta /public, /css, /bootstrap, /jquery y 7axios para acceder a las carpetas
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

//Directorios y extensiones de trabajo
app.use(express.static(__dirname + '/public'))
app.use('/css', express.static(__dirname + '/public/css'))
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'))
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'))
app.use('/axios', express.static(__dirname + '/node_modules/axios/dist'))

//Middlewares y Objeto de Configuración; propiedades de Express FileUpload
app.use(expressFileUpload({
    //Establece en 5MB el tamaño máximo del archivo a subir
    limits: { fileSize: 5000000 },
    abortOnLimit: true,
    responseOnLimit: 'El tamaño del archivo es superior al límite permitido (5 MB).',
}))

//Método engine para definir objeto de configuración handlebars
app.engine('hbs',
    engine({
        defaultLayout: 'main',
        layoutsDir: __dirname + '/views/mainLayout',
        extname: '.hbs',
        helpers: {
            fixInde: function (valor) {
                return parseInt(valor) + 1
            }
        }
    })
)
app.set('view engine', 'hbs')
app.set('views', './views/layouts')

//Creación y dispoibilización de rutas
//Ruta al Homepage
app.get('/', (req, res) => {
    res.render('index')
})

//Ruta al RegisterPage
app.get('/registro', (req, res) => {
    res.render('Registro')
})

//Ruta al LoginPage
app.get('/login', (req, res) => {
    res.render('Login')
})

//Ruta al LoginAuthentication
app.post('/autenticar', async (req, res) => {
    const { email, password } = req.body
    const user = await userShow(email, password)

    if (email === '' || password === '') {
        res.status(401).send('<script>alert("Intente nuevamente. Debe llenar todos los campos."); window.location.href = "/login"; </script>')
    } else {
        if (user) {
            if (user.estado === true) {
                const token = jwt.sign({exp: Math.floor(Date.now() / 1000) + 180, data: user, }, secretKey)
                res.redirect(`/Datos?token=${token}`)
            } else {
                res.status(401).send(`<script>alert("Usuario 'En revisión'. No se puede acceder a la cuenta'."); window.location.href = "/login"; </script>`)
            }
        } else {
            res.status(404).send('<script>alert("Usuario no existe o  contraseña incorrecta."); window.location.href = "/login"; </script>');
        }
    }
})

//Ruta al DataUser Validation
app.get('/admin', async (req, res) => {
    try {
        const usuarios = await userGet()
        console.log(usuarios)
        res.render('Admin', { usuarios })
    } catch (error) {
        console.log(`Validación de usuario. Error externo de try catch: ${error.message}`)
        console.log(`Validación de usuario. Error código: ${error.code}`)
        console.log(`Validación de usuario. Detalle del error: ${error.detail}`)
        console.log(`Validación de usuario. Tabla originaria del error: ${error.table}`)
        console.log(`Validación de usuario. Restricción violada en el campo: ${error.constraint}`)
    }
})

//Ruta al ShowRegisteredUserArray
app.get('/usuarios', async (req, res) => {
    const respuesta = await userGet()
    res.status(200).send(respuesta)
})

//Ruta al UserEdition
app.put('/usuarios', async (req, res) => {
    const { id, estado } = req.body
    try {
        const usuarios = await userStUpdate(id, estado)
        res.status(200).send(JSON.stringify(usuarios))
    } catch (error) {
        console.log(`Edición de usuario. Error externo de try catch: ${error.message}`)
        console.log(`Edición de usuario. Error código: ${error.code}`)
        console.log(`Edición de usuario. Detalle del error: ${error.detail}`)
        console.log(`Edición de usuario. Tabla originaria del error: ${error.table}`)
        console.log(`Edición de usuario. Restricción violada en el campo: ${error.constraint}`)
    }
})

//Ruta al UserRegister
app.post('/registrar', async (req, res) => {

    const { email, nombre, password, password2, experiencia, especialidad } = req.body
    const { foto } = req.files
    const { name } = foto
    const extension = path.extname(name)

    if (password !== password2) {
        res.status(401).send('<script>alert("Las contraseñas deben ser inguales."); window.location.href = "/registro"; </script>')
    } else {
        try {
            await userInsert(email, nombre, password, experiencia, especialidad, name)
                .then(() => {
                    if (!req.files) {
                        return res.status(400).send('La imagen no ha sido cargada.')
                    }
                    if (!permitFile.includes(extension)) {
                        return res.status(403).send('El formato del archivo no es válido. Ingrese una imagen en formato gif, png, jpg o jpeg.')
                    }
                    foto.mv(`${__dirname}/public/uploads/${name}`, (err) => {
                        if (err) {
                            return res.status(500).send(err);
                        }
                    })
                    res.status(200).send('<script>alert("Se ha registrado exitosamente."); window.location.href = "/"; </script>')
                })
        } catch (error) {
            console.log(`Registro de usuario. Error externo de try catch: ${error.message}`)
            console.log(`Registro de usuario. Error código: ${error.code}`)
            console.log(`Registro de usuario. Detalle del error: ${error.detail}`)
            console.log(`Registro de usuario. Tabla originaria del error: ${error.table}`)
            console.log(`Registro de usuario. Restricción violada en el campo: ${error.constraint}`)
        }
    }
})

//Ruta al DataUserInsert
app.get('/datos', (req, res) => {
    let { token } = req.query
    jwt.verify(token, secretKey, (err, skater) => {
        const { data } = skater
        if (err) {
            res.status(401).json({
                error: "401 Unauthorized",
                message: err.message,
            })
        } else {
            console.log('Datos del (de la) Skater', skater)
            res.render('Datos', data)
        }
    })
})

//Ruta al DataUserRender
app.get('/datos_usuario', async (req, res) => {
    const respuesta = await userGet()
    res.send(respuesta)
})

//Ruta al DataUserUpdate
app.post('/actualizar', async (req, res) => {
    let { email, nombre, password, password2, experiencia, especialidad } = req.body
    if (password !== password2) {
        res.status(401).send('<script>alert("Las contraseñas deben coincidir. Inténtelo nuevamente."); window.location.href = "/Login"; </script>')
    } else {
        try {
            await userUpdate(email, nombre, password, experiencia, especialidad)
            res.send('<script>alert("Los datos del usuario han sido actualizados exitosamente."); window.location.href = "/"; </script>')
        } catch (error) {
            console.log(`Actualización de usuario. Error externo de try catch: ${error.message}`)
            console.log(`Actualización de usuario. Error código: ${error.code}`)
            console.log(`Actualización de usuario. Detalle del error: ${error.detail}`)
            console.log(`Actualización de usuario. Tabla originaria del error: ${error.table}`)
            console.log(`Actualización de usuario. Restricción violada en el campo: ${error.constraint}`)
        }
    }
})

//Ruta al UserDelete
app.post('/eliminar', async (req, res) => {
    try {
        const { id } = req.query
        await userDelete(id)
        res.send('<script>alert("La cuenta ha sido eliminada exitosamente."); window.location.href = "/"; </script>')
    } catch (error) {
        console.log(`Eliminación de usuario. Error externo de try catch: ${error.message}`)
        console.log(`Eliminación de usuario. Error código: ${error.code}`)
        console.log(`Eliminación de usuario. Detalle del error: ${error.detail}`)
        console.log(`Eliminación de usuario. Tabla originaria del error: ${error.table}`)
        console.log(`Eliminación de usuario. Restricción violada en el campo: ${error.constraint}`)    }
})

/*
*********************
Iniciar node index.js

P Á G I N A   D E   I N I C I O
http://localhost:3000/
Vuelve a página de inicio al presionar Skate Park

I N I C I A R   S E S I Ó N
Presionar link "Iniciar sesión"
http://localhost:3000/Login
Ingresar email
Ingresar password
Presionar Ingresar
Continúa sólo si usuario existe y está en estado "Aprobado"
Cambios permitidos:
    Todos excepto fotograf+ia e email (presiona Actualizar)
    Eliminar cuenta

R E G I S T R O   D E   U S U A R I O
Presionar link "Registrar"
Ingresar todos los campos
Fotografía debe ser menor a 5MB

M O D O   A D M I N I S T R A D O R:
http://localhost:3000/Admin
Seleccionar o deseleccionar casilla Estado

*********************
*/

