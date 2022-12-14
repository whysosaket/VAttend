// Using enviroment variables to save data from being published online
require('dotenv').config();

const expess = require('express');
const router = expess.Router();
const User = require("../models/User");
const { body, validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');
const md5 = require('md5');

const JWT_SECRET = process.env.JWT_SECRET;

/*

╭━━━╮╱╱╱╱╱╭╮╱╱╱╱╱╭╮
┃╭━╮┃╱╱╱╱╭╯╰╮╱╱╱╭╯┃
┃╰━╯┣━━┳╮┣╮╭╋━━╮╰╮┃
┃╭╮╭┫╭╮┃┃┃┃┃┃┃━┫╱┃┃
┃┃┃╰┫╰╯┃╰╯┃╰┫┃━┫╭╯╰╮
╰╯╰━┻━━┻━━┻━┻━━╯╰━━╯

*/

// Creating a user using POST: (/api/auth/createuser) , Doesn't require auth (or no login required);
router.route('/createuser')
.post([
    body('name', 'Enter a valid name').isLength({min: 3}),
    body('password').isLength({min: 6}),
    body('employee_id').isLength({min: 4})
],fetchuser, async (req, res)=>{
    let success = false;

    // Checking if requester is a admin/authoised or not
    const requester = await User.findById(req.user.id, 'admin name')
    if(!requester.admin) {
        return res.status(400).json({success, error: "No Access!!!"});
    }

    
    // Validating if email/password/name is acceptable
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({success, errors: errors.array()});
    }

    // checking if employee id is 10 digits long and it contains only digits
    if(req.body.employee_id.length != 10 || !req.body.employee_id.match(/^[0-9]+$/)){
        return res.status(400).json({success, error: "Employee ID must be 10 digits long! and it must contain only digits"});
    }

    // Saving req data into a variable
    let data = req.body;

    try{
    // Checking if user already exists
    let user = await User.findOne({employee_id: data.employee_id});
    if(user){
        res.status(400).json({success, error: 'Sorry, a user with this employee id already exists!'});
        return null;
    }

    // Using bcrypt to generate a secured password

    // Crating a salt from bcrypt
    const securedPassword = await bcrypt.hash(data.password.toString(), 10);

    // Make the name's first letter capital of every word
    data.name = data.name.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});

    // Creating the user
    user = await User.create({
        name: data.name,
        password: securedPassword,
        employee_id: data.employee_id,
        admin: data.admin
    })

    const returnData = {
        user: {
            id: user.id
        }
    }
    success = true;
    res.json({success, info: 'Account Created Successfully!!'});
    } catch(error){
        console.log(error);
        res.json({error: 'Something Went Wrong!'});
    }
});

/*


╭━━━╮╱╱╱╱╱╭╮╱╱╱╱╭━━━╮
┃╭━╮┃╱╱╱╱╭╯╰╮╱╱╱┃╭━╮┃
┃╰━╯┣━━┳╮┣╮╭╋━━╮╰╯╭╯┃
┃╭╮╭┫╭╮┃┃┃┃┃┃┃━┫╭━╯╭╯
┃┃┃╰┫╰╯┃╰╯┃╰┫┃━┫┃┃╰━╮
╰╯╰━┻━━┻━━┻━┻━━╯╰━━━╯

*/

// Authenticate a user using POST: (/api/auth/login) , Doesn't require auth (or no login required);

router.route('/login')
.post([
    body('employee_id', 'Enter a employeeID').exists(),
    body('password', 'Password cannot be blank').exists()
], async (req, res)=>{
    // Validating if employeeid/password/name is acceptable
    const errors = validationResult(req);
    let success = false;

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {employee_id, password} = req.body;
    

    try{
        let user = await User.findOne({employee_id}).exec();

        if(!user){
            return res.status(400).json({error: "Please, login with correct credentials"});
        }

        const passwordCompare =  await bcrypt.compare(password.toString(), user.password);
        if(!passwordCompare){
            return res.status(400).json({error: "Please, login with correct credentials"})
        }

        const payload = {
            user: {
                id: user.id
            }
        }

        const authtoken = jwt.sign(payload, JWT_SECRET);
        const devicetoken = md5(user.employee_id)+Math.random();
        success = true;
        res.json({success, authtoken, devicetoken});

    }catch(error){
        console.log(error);
        res.json({error: 'Something Went Wrong!'});
    }

})



module.exports = router;