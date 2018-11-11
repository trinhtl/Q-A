let db = require('../models');

module.exports = {
    createSession(req, res) {
        db.Session.create(req.body)
            .then(session => {
                res.json(session)
            })
            .catch(error => {
                res.send(error)
            })
    },
    getAllSession(req, res) {
        db.Session.find()
            .then(sessions => {
                res.json(sessions)
            })
            .catch(error => {
                res.send(error)
            })
    },
    getSessionByID(sessionID) {
        return db.Session.findById(sessionID)
            .then(session => {
                return session
            })
            .catch(error => {
                console.log(error);
            })
    },
    updateSession(req, res) {
        db.Session.findByIdAndUpdate(req.params.sessionID, req.body, {new: true})
            .then(session => {
                res.json(session)
            })
            .catch(error => {
                res.send(error)
            })
    }
};