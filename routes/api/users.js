const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

/* @route POST api/users
   @desc  REGISTER USER
   @access PUBLIC
*/
router.post('/', [
    check('name', 'Name is required')
        .not()
        .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters')
        .isLength({ min: 6 })
], async(req, res) => { 
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    let user = await user.findOne({ email });
    
    if(user) {
        res.status(400).json({ errors: [{ msg: 'User already exists' }] });
    }
    const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
    });

    user = new User({
        name,
        email,
        avatar,
        password
    });

    const salt = await bcrypt.getSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();


    res.send('User route'); 
});

module.exports = router;