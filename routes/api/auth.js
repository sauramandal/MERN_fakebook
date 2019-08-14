const express = require('express');
const User = require('../../models/User');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');

router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);

    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/* @route POST api/users
   @desc  Authenticate User and get token
   @access PUBLIC
*/
router.post('/', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters')
        .exists()
], async(req, res) => { 
    
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body; 

    try {
        let user = await User.findOne({ email });
        
        if(!user) {
            return  res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        
        if(!isMatch) {
            return  res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
        }
        //create payload and use jwt sign
        const payload = {
            user: {
                id: user.id
            }
        }
        jwt.sign(
            payload, 
            config.get('jwtSecret'),
            { expiresIn: 360000 },  
            (err, token) => {
                if(err) throw err;
                res.send({token});
            });            
    } catch(err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;