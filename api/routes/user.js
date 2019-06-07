const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // used for encrypting passwords
const jwt = require('jsonwebtoken'); // JSON web token

const User = require('../models/user'); // require the user model

router.post('/signup', (req, res, next) => { // for adding a new user
        User.find({email: req.body.email})
        .exec()
        .then(user => {
            if(user.length >= 1) { // if a user already exisits
                return res.status(422).json({
                    message: 'Email exists'
                });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => { // 10 is the number of salting rounds - adds random charaacters before hashing
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });
                        user
                            .save() // saves the user in the database
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: 'User created'
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                });
                            });
                    }
                });
            }
        });
});

router.post('/login', (req, res, next) => {
    User.find({ email:  req.body.email })
    .exec()
    .then(user => {
        if(user.length < 1) {   // if the find function returns an array with no user in it (array should only ever return one user if there is a match as no duplicate emails are allowed)
            return res.status(401).json({
                message: 'Auth failed' // Do not mention that email does not exist, can make it easier for people to identify users of the system
            });
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if (err) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }
            if (result) {   // if username and password are correct
                const token = jwt.sign({
                    email: user[0].email,
                    userId: user[0]._id
                },
                process.env.JWT_KEY,
                {
                    expiresIn: "1h"
                });
                return res.status(200).json({
                    message: 'Auth successful',
                    token : token
                });
            }
            return res.status(401).json({   // if we reach this point, the password was incorrect
                message: 'Auth failed'
            });
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    })
});

router.delete('/:userId', (req, res, next) => {
    User.remove({_id: req.params.userId})
    .exec() // will return callback
    .then(result => {
        res.status(200).json({
            message: 'User deleted'
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router;