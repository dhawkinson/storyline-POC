'use strict';

//  library modules
const express   = require('express');
const rtProcess = express.Router();
const request   = require('request');
const rpn       = require('request-promise-native');

//  local modules
const Learner       = require('../db/models').Learner;
const Course        = require('../db/models').Course;
const Outcome       = require('../db/models').Outcome;
const OutcomeDetail = require('../db/models').OutcomeDetail;
const Log           = require('../db/models').Log;

//  initialize general variables
let baseURL = 'http://localhost:3000/static/quizdata/';
let keysID = 'keys.json';
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
//  GET the list of keys to JSON data files (returns a promise)
const getKeysJson = async () => {
    const options = {
        method: 'GET',
        uri: baseURL + keysID,
        headers: { 'User-Agent': 'Request-Promise' },
        json: true // Automatically parses the JSON string in the response
    };
    return (await rpn(options)).keys;
};

//  PUT an empty array to jsonKeysList (prevents reprocessing of JSON data)
const putKeysJson = async () => {
        //  this is the opening put back of an empty keys.json file
        //  putting this file back empty at the start of the run prevents
        //  double processing of JsonData files because there is an empty list of keys
        //  therefore nothing can be selected for processing
        //  @ EOJ, keys.json will be updated with any keys that may have failed to process
        const options = {
            method: 'PUT',
            uri: baseURL + keysID,
            resolveWithFullResponse: true,
            body: {
                keys: []
            },
            json: true // Automatically stringifies the body to JSON
        };
        return (await rpn(options)).req.Request.body;
};

//  EOJ push keysFailed onto keys.json then put it back out
const putKeysFailed = async (keysFailed) => {
    //  this function will execute at EOJ, only if there are failed Outcome Keys
    //  those keys will be pushed back on to the keys array to be reprocessed after troubleshooting the log
    const options = {
        method: 'GET',
        uri: baseURL + keysID,
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true // Automatically parses the JSON string in the response
    };
    rpn(options)
    .then((keys) => {
        keysFailed.forEach(courseID => {
        keys.push(courseID);
        })
    })
    .then((keys) => {
        const options = {
            method: 'PUT',
            uri: baseURL + keysID,
            resolveWithFullResponse: true,
            body: {
                keys: keys
            },
            json: true // Automatically stringifies the body to JSON
        };
        return (rpn(options)).req.Request.body;
    })
    .catch((err) => {
        console.log(err.statusCode, err.error);
        console.log(err)
    });
}

//  GET each JSON file item
const getJsonData = async (courseID) => {
    let jsonData;
    const options = {
        method: 'GET',
        uri: baseURL + courseID,
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true // Automatically parses the JSON string in the response
    };

    try {
        jsonData = await rpn(options);
    } catch (e) {
        console.log(e);
    }

    return jsonData;
    /*const options = {
        method: 'GET',
        uri: baseURL + courseID,
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true // Automatically parses the JSON string in the response
    };

    await rpn(options)
        .then((res) => {
            return Promise.resolve(jsonData = res.body);
        })
        .catch(() => {
            Promise.reject(err);
        });*/
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

/*==================================================
    end of function definitions
==================================================*/

/*==================================================
    process the JSON
==================================================*/
module.exports = (rtProcess) => {
    rtProcess.get('/process', async (req, res) => {

        const jsonKeysList = await (getKeysJson());
        console.log("GET json keys", jsonKeysList);
        try {
            const keys = await (putKeysJson());
            console.log("PUT empty keys", keys);
        } catch(err) {
            console.log('Error',err.statusCode, err.name);
        }

        //  loop on the keys (courseID) -- get and parse JSON, then write SQL
        jsonKeysList.forEach(courseID => {
            console.log(courseID);
            //getJsonData(courseID);

            /*parseLearner();
            parseCourse();
            parseOutcome();
            parseOutcomeDetails();*/

            /*==================================================
                All data has been gathered -- now write it
            ==================================================*/

            /*log = [];
            writeLearnerSQL();
            writeCourseSQL();
            writeOutcomeSQL();
            writeLogSQL();*/
            
        });
        //  this routine kicks in if any Outcome transactions fail to commit.
        //  the outcome key if written back the Keys list for reprocessing
        //  after troubleshooting the problems
        //  hopefully this never happens
        if ( keysFailed ) {
            putKeysFailed(keysFailed);
        }

        res.render("process");
    }); // end of process route
};  //  end of module exports