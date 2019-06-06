const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // used for encrypting passwords

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