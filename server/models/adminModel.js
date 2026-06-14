const mognoose = require('mongoose');
const adminSchema = new mognoose.Schema({

})
const adminModel = mognoose.model("adminData",adminSchema);
module.exports = adminModel;
