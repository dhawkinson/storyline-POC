'use strict';

//  node modules
const express      = require('express');
const app          = express();
const router       = express.Router();
const fs           = require('fs');
const config       = require('config');

//  local modules
//  SQL Models
const Learner       = require('../db/models').Learner;
const Course        = require('../db/models').Course;
const Outcome       = require('../db/models').Outcome;
const OutcomeDetail = require('../db/models').OutcomeDetail;
const Log           = require('../db/models').Log;

//  services
const outcomeIds    = require('../services/idsList');
//const failedKeys    = require('../services/failedIds');
console.log('require', outcomeIds);

//  initialize general variables

const uriProtocol = config.get('json.protocol');
//  not used in development env because we are using protocol = file:
//  kept in anticipation of moving to test and production
//const uriHost     = config.get('json.host');
//const uriPort     = config.get('json.port');
const uriPath     = config.get('json.path');
const url         = `${uriProtocol}//${uriPath}/`;
let outcomeID;
let failedOutcomes = [];
//  initialize objects that hold SQL rows
let learner;
let course;
let outcome;
//  initialize log
let log;
let logDate = Date.now();

/*==================================================
    EOJ, push IdsFailed onto 'ids.json' then put it back out
==================================================*/

const outcomesFailed = async (failedOutcomes) => {
    const idsID       = 'ids.json';
    const uri         = `${url}${idsID}`;

    await fs.readFile(uri, (err, data) => {
        if (err) throw err;
        idsData = JSON.parse(data);
        });
    idsData.push(failedOutcomes);
    idsData = JSON.stringify(idsData);
    /*await fs.writeFile(uri, idsData, (err) => {
        if (err) throw err;
        console.log('The ids have been updated');
        });*/
    return;
}

/*==================================================
    define functions pertaining to GETTING and PARSING jsonData
==================================================*/
//  GET each JSON file item
const getJsonData = async (url, outcomeID) => {
    let uri  = `${url}${outcomeID}`;
    await fs.readFile(uri, (err, data) => {
        if (err) throw err;
        return jsonData = JSON.parse(data);
        });
}

//  parse out the json data
function parseJsonData(learner, course, outcome, outcomeDetails, exists, failedOutcomes) {
    //  the student/learner
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
            exists.learner = true;
        })
        .catch(() => {
            exists.learner = false;
        })
    });
    // the course
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
            exists.course = true;
        })
        .catch(() => {
            exists.course = false;
        })
    });
    // outcome (header)
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
            exists.outcome = true;
        })
        .catch(() => {
            exists.outcome = false;
        })
    });
    //  outcome (details)
    outcomeDetails = [];
    for (let j = 0; j < jsonData.aQuestions.length; j++) {
        outcomeDetails[j] = {
            lineNumber: jsonData.aQuestions[j].nQuestionNumber,
            description: jsonData.aQuestions[j].strDescription,
            correctResponse: jsonData.aQuestions[j].strCorrectResponse,
            status: jsonData.aQuestions[j].strStatus,
            learnerResponse: jsonData.aQuestions[j].strUserResponse,
            weight: jsonData.aQuestions[j].nWeight,
            points: jsonData.aQuestions[j].nPoints
        };
    }
    return;
}

/*==================================================
    define functions pertaining to WRITING parsed jsonData and Log entries to SQL Tables
==================================================*/
//  if the Learner exists it's OK, the learner has had a previous outcome -- no need to write Learner out again
function writeSQLData(learner, course, outcome, outcomeDetails, exists, failedOutcomes) {
    //  learner
    if (!exists.learner) {
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
    exists.learner = false;
    //  course
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
    exists.course = false;
    //  outcome
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
            failedOutcomes.push(outcomeID);
        });
    }
    // log
    for ( let l = 0; l < log.length; l++ ) {
        let logItem = {
            date: logDate,
            course: outcomeID,
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
    processing route
==================================================*/

router.get('/', (req, res) => {
    //  will this 'fire' outcomeIds and return the list of ids
    //  iterate on outcomes
    outcomeIds.forEach((outcomeId) => {
        console.log(outcomeId);
        /*let outcomeDetails = [];
        let exists = {};
        getJsonData();
        parseJsonData(learner, course, outcome, outcomeDetails, exists);
        writeSQLData(learner, course, outcome, outcomeDetails, exists, failedOutcomes);*/
    });
    /*if ( failedOutcomes ) {
        outcomesFailed(failedOutcomes);
    }*/
    res.render("process");  //  install a progress bar of some sort
}); // end of router GET

module.exports = router;