let router = require('express').Router(),
    helper = require('../helpers/question'),
    db     = require('../models');

router.route('/')
    .get(helper.getAllQuestion)
    .post(helper.createQuestion);

module.exports = router;