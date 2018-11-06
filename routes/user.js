let router  = require('express').Router(),
	helper = require('../helpers/user');

router.route('/')
	.get(helper.getAllUser)
	.post(helper.createUser);

router.route('/:userID')
	.put(helper.updateUser);

module.exports = router;