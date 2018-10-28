let router = require('express').Router(),
    helpers = require('../helpers/question');

router.route('/')
    .get(helpers.getAllQuestion)
    .post(helpers.createQuestion);

router.route("/:questionID")
    .put(helpers.updateQuestion);

module.exports = router;