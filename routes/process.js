'use strict';

//  library modules
const express   = require('express');
const rtProcess = express.Router();
const XHR       = require('xmlhttprequest');
//const $         = require("jquery");

//  local modules
const Learner       = require('../db/models').Learner;
const Course        = require('../db/models').Course;
const Outcome       = require('../db/models').Outcome;
const OutcomeDetail = require('../db/models').OutcomeDetail;
const Log           = require('../db/models').Log;

//  initialize general variables
let baseURL = 'http://localhost:3000/quizzes/'; //  this is the development value only
let keysID = 'keys';
let jsonKeysList;
let courseID;
let jsonData;
let keysFailed;
//  initialize objects that hold SQL rows
let learner;
let course;
let outcome;
let outcomeDet;
let learnerExists;
let courseExists;
let outcomeExists;
//  initialize log
let log;
let logDate = Date.now();

/*==================================================
    define functions
==================================================*/
//  get the list of keys to JSON data files
function loadJsonKeys() {
    let xhr = new XHR();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) { // XMLHttpRequest is finished successfully
            jsonKeysList = JSON.parse(this.xhr.responseText);
        }
    };

    xhr.open("GET", baseURL + keysID, true);
    xhr.send();

    return jsonKeysList;
}

//  reset the list of keys to an empty array (prevents reprocessing of JSON data)
function putEmptyJsonKeys() {
    let xhr = new XHR();

    xhr.open("PUT", baseURL + keysID, true);
    xhr.send({});
}

//  load each JSON file item
function loadJsonData(courseID) {
    let xhr = new XHR();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) { // XMLHttpRequest is finished successfully
            jsonData = JSON.parse(this.xhr.responseText);
        }
    };

    xhr.open("GET", baseURL + courseID, true);
    xhr.send();

    return jsonData;
}

//  parse out the Learner data
function parseLearner() {
    learner = {
        name: jsonData.strLearnerName,
        email: jsonData.strLearnerEmail
    };

    Learner.findOne({
        where: {
            name: learner.name,
            email: learner.email
        }
        .then(() => {
            learnerExists = true;
        })
        .catch(() => {
            learnerExists = false;
        })
    });
    return learner;
}

//  parse out the Course data
function parseCourse() {
    course = {
        number: jsonData.strQuizId,
        title: jsonData.strQuizName,
        itemCount: jsonData.nQuestionCount,
        passScore: jsonData.nPassingScore,
        maxScore: jsonData.nMaxScore,
        minScore: jsonData.nMinScore
    };

    Course.findAll({
        where: {
            number: course.number,
            title: course.title
        }
        .then(() => {
            courseExists = true;
        })
        .catch(() => {
            courseExists = false;
        })
    });
    return course;
}

//  parse out the Outcome data
function parseOutcome() {
    outcome = {
        course: jsonData.strQuizId,
        learner: jsonData.strLearnerName,
        email: jsonData.strLearnerEmail,
        date: jsonData.dtmFinished,
        status: jsonData.strStatus,
        pointScore: jsonData.nPtScore
    };

    outcome.findAll({
        where: {
            course: outcome.course,
            learner: outcome.learner,
            date: outcome.date
        }
        .then(() => {
            outcomeExists = true;
        })
        .catch(() => {
            outcomeExists = false;
        })
    });
    return outcome;
}

//  parse out the Outcome Details data -- one item for each question on a quiz
function parseOutcomeDetails() {
    outcomeDet = [];
    for (let j = 0; j < jsonData.aQuestions.length; j++) {
        outcomeDet[j] = {
            lineNumber: jsonData.aQuestions[j].nQuestionNumber,
            description: jsonData.aQuestions[j].strDescription,
            correctResponse: jsonData.aQuestions[j].strCorrectResponse,
            status: jsonData.aQuestions[j].strStatus,
            learnerResponse: jsonData.aQuestions[j].strUserResponse,
            weight: jsonData.aQuestions[j].nWeight,
            points: jsonData.aQuestions[j].nPoints
        };
    }
    return outcomeDet;
}

//  if the Learner exists it's OK, the learner has had a previous outcome -- no need to write Learner out again
function writeLearnerSQL() {
    if (!learnerExists) {
        Learner.create(learner)
            .then(() => {
                log.push(`Learner ${learner.name} ${learner.email} was written`);
            }).catch(error => {
                // if there is a validation error
                if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
                    log.push(`Learner ${learner.name} ${learner.email} not written because of validation error`);
                } else {
                    log.push(`Learner ${learner.name} ${learner.email} not written because of server error`);
                }
            });
    } else {
        log.push(`Learner ${learner.name} ${learner.email} not written -- already exists, not an error`);
    }
}

//  if the Course exists it's OK, the Course has been a part of a previous outcome -- no need to write Course out again
function writeCourseSQL() {
    if (!courseExists) {
        Course.create(course)
            .then(() => {
                log.push(`Course ${course.number} ${course.title} was written`);
            }).catch(error => {
                // if there is a validation error
                if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
                    log.push(`Course ${course.number} ${course.title} not written because of validation error`);
                } else {
                    log.push(`Course ${course.number} ${course.title} not written because of server error`);
                }
            });
    } else {
        log.push(`Course ${course.number} ${course.title} not written -- already exists, not an error`);
    }
}

//  if the Outcome exists -- it shouldn't. This is an error to be troubleshot.
//  handled as a transaction Outcome with 1 to many OutcomeDetails -- they all write or they rollback
function writeOutcomeSQL() {
    if (!outcomeExists) {

        return sequelize.transaction(function (t) {

            // chain all your queries here. make sure you return them.
            return Outcome.create({
                course: outcome.course,
                learner: outcome.learner,
                date: outcome.date,
                status: outcome.status,
                pointScore: outcome.pointScore
            }, {
                transaction: t
            }).then(function (outcome) {
                for (let d = 0; d < outcomeDet.length; d++) {
                    return outcome.setOutcomeDetail({
                        lineNumber: outcomeDet[d].lineNumber,
                        description: outcomeDet[d].description,
                        correctResponse: outcomeDet[d].correctResponse,
                        status: outcomeDet[d].status,
                        learnerResponse: outcomeDet[d].learnerResponse,
                        weight: outcomeDet[d].weight,
                        points: outcomeDet[d].points
                    }, {
                        transaction: t
                    });
                }
            });
        }).then(function (res) {
            // Transaction has been committed
            res = `Outcome ${outcome.course} ${outcome.learner} ${outcome.date} was written, transaction committed`;
            log.push(res);
            //  destroy JSON file
            $.ajax({
                url: baseURL + keysID,
                type: 'DELETE',
                success: function (res) {
                    res = `JSON file ${keysID} removed from ${baseURL}`;
                    log.push(res);
                }
            });
        }).catch(function (err) {
            // Transaction has been rolled back
            err = `Outcome ${outcome.course} ${outcome.learner} ${outcome.date} not written because of line validation or server error, transaction rolled back`;
            log.push(err);
            keysFailed.push(courseID);
        });
    }
}

//  write processing log
function writeLogSQL() {
    for ( let l = 0; l < log.length; l++ ) {
        let logItem = {
            date: logDate,
            course: courseID,
            learner: learner.name,
            seq: l,
            logMessage: log[l]
        };
        Log.create(logItem)
            .then(() => {
                return;
            });
    }
}

function appendJsonKeys() {
    let xhr = new XHR();
    jsonKeysList = {
        keys: []
    };
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) { // XMLHttpRequest is finished successfully
            jsonKeysList = JSON.parse(this.xhr.responseText);
        }
    };

    xhr.open("GET", baseURL + keysID, true);
    xhr.send();

    jsonKeysList.push(keysFailed);

    xhr = new XHR();

    xhr.open("PUT", baseURL + keysID, true);
    xhr.send(jsonKeysList);

    return;
}

/*==================================================
    end of function definitions
==================================================*/


/* GET processing route. */
module.exports = (rtProcess) => {
    rtProcess.get('/process', function (req, res, next) {
        res.render('process');

        loadJsonKeys(); //  get list of JSON file keys from API

        putEmptyJsonKeys(); //  reset the file keys List

        //  loop on the keys -- get and parse JSON, then write SQL
        for ( let i =0; i < jsonKeysList.keys.length; i++ ) {
            courseID = jsonKeysList.keys[i];
            loadJsonData(courseID);

            parseLearner();
            parseCourse();
            parseOutcome();
            parseOutcomeDetails();

            /*==================================================
                All data has been gathered -- now write it
            ==================================================*/

            log = [];
            writeLearnerSQL();
            writeCourseSQL();
            writeOutcomeSQL();
            writeLogSQL();
        }
        //  this routine kicks in if any Outcome transactions fail to commit.
        //  the outcome key if written back the Keys list for reprocessing
        //  after troubleshooting the problems
        //  hopefully this never happens
        if ( keysFailed ) {
            appendJsonKeys();
        }
    }); // end of process route
};  //  end of module exports