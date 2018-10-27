'use strict';

//  library modules
const express   = require('express');
const rtProcess = express.Router();

//  local modules
const Learner       = require('../models').Learner;
const Course        = require('../models').Course;
const Outcome       = require('../models').Outcome;
const OutcomeDetail = require('../models').OutcomeDetail;

/* GET home page. */
module.exports = (rtProcess) => {
    rtProcess.get('/process', function (req, res, next) {
        res.render('process');
        /*==================================================
            PROCESS THE OUTCOMES

            Loop through the URL looking for instances of the JSON Outcomes files
                0.  Get the JSON file key else goto 5
                1.  Get the next JSON outcomes file
                2.  Using the arrays, populate rows from each Table (Courses, Learners, Outcomes, OutcomeDetails)
                3.  Test success of row population (Outcomes)
                4. goto 0
                5. STOP -- push keys of failed population step onto JSON keys file
        ==================================================*/
        //  at the end point of the API there two types of objects
        //      1. an object with the id of 'keys' - with an array of unprocessed keys for courses taken
        //      2. 0 to many objects of course outcomes with IDs = the values in 'keys'
        //
        //  get list of keys from API
        let baseURL = 'http://localhost:3000/quizzes/';    //  this is the development value only
        let keysID = 'keys';
        let keysFailed = [];
        //  initialize log
        let log = [];
        let logDate = Date.now();
        $.getJSON({
            url: baseURL,
            data: `id=${keysID}&lang=en-us&format=json&jsoncallback=?`,
            success: function (keysFeed) {
                /*==================================================
                    Data Integrity Step -- In order to assure the ongoing integrity of the JSON pieces of the app

                    Premise:
                        * We have just captured the list of JSON file keys that exist AT THIS MOMENT
                        * We now write back a null Keys file to assure that anything that comes in
                          while this step is executing will be considered for the next run
                        * In case any file fails during this run, we will append that key to the new Keys file we are now writing

                    This should ensure nothing gets processed twice and everything get processed once
                ==================================================*/
                $.ajax({
                    type: 'PUT', // Use POST with X-HTTP-Method-Override or a straight PUT if appropriate.
                    dataType: 'json', // Set datatype - affects Accept header
                    url: baseURL+keysID,
                    headers: { "Content-Type": "application/json" }, // X-HTTP-Method-Override set to PUT.
                    data: '{"keys": []}'
                });
                /*==================================================
                    keys list has been retrieved -- process it 
                        (loop through it for each key in list)
                        
                ==================================================*/
                for (let i = 0; i < keysFeed.length; i++) {
                    let courseID = keysFeed[i];
                    $.getJSON({
                        url: baseURL,
                        data: `id=${courseID}&lang=en-us&format=json&jsoncallback=?`,
                        success:function(outcomeJson) {
                            /*==================================================
                                outcome json object retrieved--process it(parse it)
                                    initialize
                                    build learner
                                    build course
                                    build outcome
                                    build outcome details
                                    find or write learner
                                    find or write course
                                    transaction (commit or rollback)
                                        find or write outcome
                                        write outcome details
                            ==================================================*/
                            //  initialize objects that hold SQL rows
                            let learner = {};
                            let course = {};
                            let outcome = {};
                            let learnerExists = false;
                            let courseExists = false;
                            let outcomeExists = false;
                            //  build learner then test for presence in db
                            //  if present mark as true
                            learner = {
                                name:outcomeJson.strLearnerName,
                                email:outcomeJson.strLearnerEmail
                            };

                            Learner.findAll({
                                where: {
                                    name: learner.name,
                                    email: learner.email
                                }
                                .then(learner => {
                                    learnerExists = true;
                                })
                            });
                            //  build course then test for presence in db
                            //  if present mark as true
                            course = {
                                number:outcomeJson.strQuizId,
                                title:outcomeJson.strQuizName,
                                itemCount:outcomeJson.nQuestionCount,
                                passScore:outcomeJson.nPassingScore,
                                maxScore:outcomeJson.nMaxScore,
                                minScore:outcomeJson.nMinScore
                            };

                            Course.findAll({
                                where: {
                                    number: course.number,
                                    title: course.title
                                }
                                .then(course => {
                                    courseExists = true;
                                })
                            });
                            //  build outcome then test for presence in db
                            //  if present mark as true
                            outcome = {
                                course: outcomeJson.strQuizId,
                                learner: outcomeJson.strLearnerName,
                                date:outcomeJson.dtmFinished,
                                status:outcomeJson.strStatus,
                                pointScore:outcomeJson.nPtScore
                            };

                            outcome.findAll({
                                where: {
                                    course: outcome.course,
                                    learner: outcome.learner,
                                    date: outcome.date
                                }
                                .then(outcome => {
                                    outcomeExists = true;
                                })
                            });
                            //  build outcome details -- loop on questions
                            let outcomeDet = [];
                            for (let j = 0; j < outcomeJson.aQuestions.length; j++) {
                                outcomeDet[j] = {
                                    lineNumber: outcomeJson.aQuestions[j].nQuestionNumber,
                                    description: outcomeJson.aQuestions[j].strDescription,
                                    correctResponse: outcomeJson.aQuestions[j].strCorrectResponse,
                                    status: outcomeJson.aQuestions[j].strStatus,
                                    learnerResponse: outcomeJson.aQuestions[j].strUserResponse,
                                    weight: outcomeJson.aQuestions[j].nWeight,
                                    points: outcomeJson.aQuestions[j].nPoints
                                };
                            }
                            /*==================================================
                                All data has been gathered -- now write it
                                if it has not been found in the SQL db
                            ==================================================*/

                            //  if the learner exists it's because of a previous Outcome
                            if ( !learnerExists ) {
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

                            //  if the course exists it's because of a previous Outcome
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

                            //  outcomes should never pre-exist
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
                        },
                        dataType:'jsonp'
                    }); //  end of GET individual outcome (one record from the keys list)
                }   //  end of the keys loop
                //  if there are any failedKeys, push them onto keys list
                if ( keysFailed ) {
                    $.getJSON({
                        url: baseURL,
                        data: `id=${keysID}&lang=en-us&format=json&jsoncallback=?`,
                        success: function (keysList) {
                            keysList.Push(keysFailed);
                            $.ajax({
                                type: 'PUT', // Use POST with X-HTTP-Method-Override or a straight PUT if appropriate.
                                dataType: 'json', // Set datatype - affects Accept header
                                url: baseURL + 'keys',
                                headers: { "Content-Type": "application/json"}, // X-HTTP-Method-Override set to PUT.
                                data: `{"keys": ${keysList}}`
                            });
                        }
                    });
                }
            },
            dataType:'jsonp'
        }); //  end of GET 'keys'
    }); //  end of process route
};  //  end of module exports
