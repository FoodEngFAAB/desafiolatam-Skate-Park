//Impotar dependencias...
const { Pool } = require('pg');

//... y acceso a base de datos
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: 'JBJFourier1768@',
    database: 'skatepark',
    port: 5432,
})

//Mostrar datos de usuarios
const userGet = async () => {
    const consulta = {
        text: 'SELECT id, foto, nombre, agnos_experiencia, especialidad, estado FROM skater ORDER BY id',
        values: []
    }
    try {
        const result = await pool.query(consulta)
        return result.rows
    } catch (error) {
        return error
    }
}

//Insertar datos de usuario
const userInsert = async (email, nombre, password, experiencia, especialidad, foto) => {
    const consulta = {
        text: 'INSERT INTO skater (email, nombre, password, agnos_experiencia, especialidad, foto, estado) VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING *',
        values: [email, nombre, password, experiencia, especialidad, foto]
    }
    try {
        const result = await pool.query(consulta)
        return result.rows[0]
    } catch (error) {
        console.log(error)
    }
}

//Mofificar datos de usuario
const userUpdate = async (email, nombre, password, experiencia, especialidad) => {
    const consulta = {
        text: 'UPDATE skater SET nombre = $2, password = $3, agnos_experiencia = $4, especialidad = $5 WHERE email = $1',
        values: [email, nombre, password, experiencia, especialidad]
    }
    try {
        const result = await pool.query(consulta)
        return result.rowCount
    } catch (error) {
        console.log(error)
    }
}

//Actualiza registro de usuarios
const userStUpdate = async (id, estado) => {
    const consulta = {
        text: "UPDATE skater SET estado=$2 WHERE id=$1 RETURNING *",
        values: [id, estado]
    }
    try {
        const result = await pool.query(consulta)
        return result.rows[0]
    } catch (error) {
        console.log(error)
    }
}

//Eliminar usuario
const userDelete = async (id) => {
    const consulta = {
        text: 'DELETE FROM skater WHERE id = $1',
        values: [id]
    }
    try {
        const result = await pool.query(consulta)
        return result.rowCount
    } catch (error) {
        return error
    }
}

//Muestra consulta de usarios
const userShow = async (email, password) => {
    const consulta = {
        text: 'SELECT id, email, nombre, password, agnos_experiencia, especialidad, foto, estado FROM skater WHERE email=$1 AND password=$2',
        values: [email, password]
    }
    try {
        const result = await pool.query(consulta)
        return result.rows[0]
    } catch (error) {
        console.log(error)
    }
}

module.exports = { userGet, userStUpdate, userInsert, userUpdate, userDelete, userShow }