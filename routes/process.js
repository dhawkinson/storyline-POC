'use strict';

//  node modules
const express      = require('express');
const app          = express();
const router       = express.Router();
const fs           = require('fs');
const config       = require('config');

//  local modules
//  SQL Models
const Sequelize     = require('sequelize');
const Learner       = require('../db/models').Learner;
const Course        = require('../db/models').Course;
const CourseDetail  = require('../db/models').CourseDetail;
const Outcome       = require('../db/models').Outcome;
const OutcomeDetail = require('../db/models').OutcomeDetail;

const Op            = Sequelize.Op;

//  services
const outcomeIds    = require('../services/idsList');

//  initialize general variables

const uriProtocol = config.get('json.protocol');
//  the following two variables are not used in development env because we are using protocol = file:
//  they are kept in anticipation of moving to test and production where the protocol may be changed to http: or https:
//const uriHost     = config.get('json.host');
//const uriPort     = config.get('json.port');
const uriPath     = config.get('json.path');
const url         = `${uriProtocol}//${uriPath}/`;
const idsID       = 'ids.json';

/*==================================================
    define functions pertaining to PARSING and writing jsonData
==================================================*/
/*==================================================
    parse and write Learners
==================================================*/
const processLearner = async (jsonData) => {   
    //  parse learner
    let data = { 
        name: jsonData.strLearnerName,
        email: jsonData.strLearnerEmail
    };

    //  write learner
    const [learner, created] = await Learner.findOrCreate({ 
        where: { 
            email: {
                [Op.eq]: data.email 
            }
        },
        defaults: {
            name: data.name, 
            email: data.email
        }
    });
    if ( !created ) {
        console.log(`Learner ${learner.email} already exists, no need to write`);
    } else {
        console.log(`Learner ${learner.email} written`);
    }
}

/*==================================================
    parse and write Courses
==================================================*/
const processCourse = async (jsonData) => {
    //  parse course
    let data = {
        number: jsonData.strQuizId,
        title: jsonData.strQuizName,
        itemCount: jsonData.nQuestionCount,
        passScore: jsonData.nPassingScore,
        maxScore: jsonData.nMaxScore,
        minScore: jsonData.nMinScore
    };
    
    // write course
    const [course, created] = await Course.findOrCreate({ 
        where: { 
            number: {
                [Op.eq]: data.number 
            } 
        }, 
        defaults: {
            number: data.number,
            title: data.title, 
            itemCount: data.itemCount,
            passScore: data.passScore,
            maxScore: data.maxScore,
            minScore: data.minScore
        }
    });
    if ( created ) {
        console.log(`Course ${course.number} written`);
        //  parse courseDetails 
        let questions = jsonData.aQuestions;
        questions.forEach((question) => {
            processCourseDetails(jsonData, question);
        });
    } else {
        console.log(`Course ${course.number} already exists, no need to write`);
    }
}
/*==================================================
    parse and write CourseDetails
==================================================*/
async function processCourseDetails(jsonData, question) {
    let data = {
        courseNumber: jsonData.strQuizId,
        lineNumber: question.nQuestionNumber,
        description: question.strDescription,
        correctResponse: question.strCorrectResponse,
        weight: question.nWeight,
        points: question.nPoints
    };
    //  write courseDetails
    const [courseDetail, created] = await CourseDetail.findOrCreate({ 
        where: { 
            courseNumber: {
                [Op.eq]: data.courseNumber
            },
            lineNumber: {
                [Op.eq]: data.lineNumber
            }
         }, 
        defaults: {
            courseNumber: data.courseNumber,
            lineNumber: data.lineNumber, 
            description: data.description,
            correctResponse: data.correctResponse,
            weight: data.weight,
            points: data.points
        }
    });
    if ( created ) {
        console.log(`CourseDetail ${courseDetail.courseNumber} line ${courseDetail.lineNumber} written`);
    } else {
        console.log(`CourseDetail ${courseDetail.courseNumber} line ${courseDetail.lineNumber} found, not written`);
    }
}

/*==================================================
    parse and write Outcomes
==================================================*/
const processOutcome = async (jsonData, outcomeId, failedOutcomes) => {
    //  parse outcome
    let data = {
        course: jsonData.strQuizId,
        learnerEmail: jsonData.strLearnerEmail,
        date: jsonData.dtmFinished,
        status: jsonData.strStatus,
        pointScore: jsonData.nPtScore,
        pointMax: jsonData.nMaxScore,
        pointMin: jsonData.nMinScore
    };
    
    // write outcome
    const [outcome, created] = await Outcome.findOrCreate({ 
        where: { 
            course: {
                [Op.eq]: data.course
            },
            learnerEmail: {
                [Op.eq]: data.learnerEmail
            },
            date: {
                [Op.eq]: data.date
            } 
        }, 
        defaults: {
            course: data.course,
            learnerEmail: data.learnerEmail, 
            date: data.date,
            status: data.status,
            pointScore: data.pointScore,
            pointMax: data.pointMax,
            pointMin: data.pointMin
        }
    });
    if ( created ) {
        console.log(`Outcome ${outcome.course} ${outcome.learnerEmail} ${outcome.date} written`);
        //  parse outcomeDetails 
        let questions = jsonData.aQuestions;
        questions.forEach((question) => {
            processOutcomeDetails(jsonData, question, outcomeId, failedOutcomes);
        });
    } else {
        console.log(`Outcome ${outcome.course} ${outcome.learnerEmail} ${outcome.date} already exists, this is an error`);
    }
}
/*==================================================
    parse and write OutcomeDetails
==================================================*/
async function processOutcomeDetails(jsonData, question, outcomeId, failedOutcomes) {
    let data = {
        courseNumber: jsonData.strQuizId,
        learnerEmail: jsonData.strLearnerEmail,
        outcomeDate: jsonData.dtmFinished,
        lineNumber: question.nQuestionNumber,
        status: question.strStatus,
        learnerResponse: question.strUserResponse
    };
    //  write outcomeDetails
    const [outcomeDetail, created] = await OutcomeDetail.findOrCreate({ 
        where: { 
            courseNumber: {
                [Op.eq]: data.courseNumber
            },
            learnerEmail: {
                [Op.eq]: data.learnerEmail
            },
            outcomeDate: {
                [Op.eq]: data.date
            },
            lineNumber: {
                [Op.eq]: data.lineNumber
            } 
        }, 
        defaults: {
            courseNumber: data.courseNumber,
            learnerEmail: data.learnerEmail,
            outcomeDate: data.outcomeDate,
            lineNumber: data.lineNumber, 
            status: data.status,
            learnerResponse: data.learnerResponse
        }
    });
    if ( created ) {
        console.log(`OutcomeDetail ${outcomeDetail.course} ${outcomeDetail.learnerEmail} ${outcomeDetail.outcomeDate} ${outcomeDetail.lineNumber} written`);
    } else {
        failedOutcomes.push(outcomeId);
    }
}
/*==================================================
    end of function definitions
==================================================*/
/*==================================================
    processing route
==================================================*/

router.get('/', (req, res) => {
    //  iterate on outcomes
    let failedOutcomes = [];
    outcomeIds.forEach((outcomeId) => {
        let jsonData;
        let uri = new URL(`${url}${outcomeId}`);
        jsonData = JSON.parse(fs.readFileSync(uri));
        processLearner(jsonData);
        processCourse(jsonData);
        processOutcome(jsonData, outcomeId, failedOutcomes);
    });
    if ( failedOutcomes.length ) {
        let uri = `${url}${idsID}`;
        let dataIn  = fs.readFileSync(uri);
        let idsList = JSON.parse(dataIn).ids;
        idsList = idsList.concat(failedOutcomes);
        idsList = JSON.stringify({"ids": idsList});
        fs.writeFileSync(uri, idsList);
    }
    res.render("process");  //  install a progress bar of some sort
}); // end of router GET

module.exports = router;