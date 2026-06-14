const express = require('express')
const router = express.Router()
const adminname = "admin"
const adminpass = "admin"

router.post('/adminlogin', (req, res) => {
    const { username, password } = req.body
    if (adminname === username && adminpass === password) {
        res.send('success')
    }
    else {
        res.status(400).send({message:"Invalid credentials"})
    }
})
module.exports = router