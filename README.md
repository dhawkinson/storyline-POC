## Storyline POC

A proof of concept project whose purpose is to:
* Login and authenticate App Users
* Accept a JSON file from a Storyline Course, upon completion of the course
* Parse the JSON Object
  * Create SQL Table rows for multiple tables
  * Populate the SQL tables
* Logout the user

### Database Schema
#### Table - User (Authorized users of the App)
| Column           | UID | Type | Len | Req | Default | Description                     |
|------------------|-----|------|-----|-----|---------|--------------------------------|
|ID                |  X  | INT  |     |  X  |         |Generated value                 |
username              |     | TEXT | 50  |  X  |         |user email                      |
| password         |     | TEXT | 50  |  X  |         |encrypted                       |
| fulName             |     | TEXT | 50  |  X  |         |user full name|

#### Table - Learner (Takers of Courses)
| Column           | UID | Type | Len | Req | Default | Description                     |
|------------------|-----|------|-----|-----|---------|--------------------------------|
|ID                |  X  | INT  |     |  X  |         |Generated value                 |
| name             |     | TEXT | 50  |  X  |         |learner name|
email              |     | TEXT | 50  |  X  |         |learner email                      |

#### Table - Course (Courses or Learning Opportunities)
| Column           | UID | Type | Len | Req | Default | Description                     |
|------------------|-----|------|-----|-----|---------|--------------------------------|
|ID                |  X  | INT  |     |  X  |         |Generated value                 |
| courseNumber     |     | TEXT |     |  X  |         | course identifier                      |
| title             |     | TEXT | 50  |  X  |         |course title|                     |
| itemCount             |     | INT |     |  X  |         |number of questions in the course|
passScore              |     | INT  |     |     |         |number correct to pass|
| maxScore         |     | INT |     |     |         |maximum score recorded for the course|
| minScore         |     | INT |     |     |         |minimum score recorded for the course|
#### Table - Outcome (Courses or Learning Opportunity Outcomes - Summary)
| Column           | UID | Type | Len | Req | Default | Description                     |
|------------------|-----|------|-----|-----|---------|--------------------------------|
| ID               |  X  | INT  |     |  X  |         | Generated value|
|date              |     | DATE |     |  X  |         |date the course was completed                 |
| status             |     | INT |     |  X  |         |status of the outcome|
| pointScore             |     | INT |     |  X  |         |score of the outcome|
#### Table - Outcome_Details (Courses or Learning Opportunity Outcomes - Details)
| Column           | UID | Type | Len | Req | Default | Description                     |
|------------------|-----|------|-----|-----|---------|--------------------------------|
|ID                |  X  | INT  |     |  X  |         | Generated value|
|line_number                     |     | INT  |     |  X  |         |course line number|
| description|     | TEXT |     |  X  |         |text of the question|
| correctResponse             |     | TEXT |     |  X  |         |the correct answer|
| status             |     | INT |     |  X  |         |status of the question|
| learnerResponse             |     | TEXT |     |  X  |         |the learner's answer|
| weight             |     | INT |     |  X  |    1    |the weight given to the question|
| points             |     | INT |     |  X  |         |points awarded on the question|

### Processing Logic Narrative
We use a 3rd party product to create instructional opportunities and outcomes. The product is a GUI application that is reminiscent of building a Powerpoint presentation, with an interactive capability for the student learner to respond to embedded questions and supply answers to the questions. The reponses may be pretty flexible, depending on the nature of the questions: They may be boolean in nature (T/F), or they may accept numeric answers or string values. They may accept radio button selections for multiple choice responses. 

Upon completion of design and deployment of an instructional opportunity, it becomes a fully operational, standalone JavaScript application that carries both the questions and answers in memory until completion of an instance of interacting with the exam. At that point, the results of the exam are published to the learner via a certificate of completion, which can be printed or stored electronically. However there is currently no way for us to capture the details of the outcome. We only can capture the end result. There is however the ability to include on the final page of the exam a user-written routine of the user's choice.

We have devised a way to capture the details of the learning outcomes so we may perform analytics that will help us understand the effectiveness of our learning programs.

The purpose of this API is to accomplish two things:
1.	Capture JSON data from the course and write it to the API with a unique ID.
2.	Read the JSON files on the API, parse them and convert them to SQL data, saved to the API.

We use a 3rd party product to create instructional opportunities and outcomes. The product is a GUI application that is reminiscent of building a Powerpoint presentation, with an interactive capability for the student learner to respond to embedded questions and supply answers to the questions. The reponses may be pretty flexible, depending on the nature of the questions: They may be boolean in nature (T/F), or they may accept numeric answers or string values. They may accept radio button selections for multiple choice responses. 

Upon completion of design and deployment of an instructional opportunity, it becomes a fully operational, standalone JavaScript application that carries both the questions/correct answers and learner answers in memory until completion of an instance of interacting with the exam. At that point, the results of the exam are published to the learner via a certificate of completion, which can be printed or stored electronically. However there is currently no way for us to capture the details of the outcome. We only can capture the end result. We do however, have the ability to include on the final page of the exam a custom, user-written routine that may be invoked upon completion of the exam.

We have devised a way to capture the details of the learning outcomes so we may perform analytics that will help us understand the effectiveness of our learning programs.

#####The purpose of this API is to accomplish two things:
<ol>
<li>Capture JSON data from the course and write it to the API with a unique ID.
<li>Read the JSON files on the API, parse them and convert them to SQL data, saved to the API.
</ol>

####Processing summary

#####At Completion of a Course

First, on the client side, upon completion of an exam we want to exploit the ability to include a user-written module that captures the (already known) JSON-formatted details of the exam and simply write out 1 JSON file to the API with the results of the exam for each instance of the completion of an exam. 

The data includes all of the identifying data points to track:
<ul>
<li>the student/learner, 
<li>the course, 
<li>the date of completion, 
<li>the questions on the course, 
<li>the correct answers to the questions, 
<li>and the user answers to the questions, in a single JSON object.
</ul>

Along with the exam record, we will update a stored array on the API with the keys to the JSON exam records being written.

 
#####At Will

Second piece of the app is initiated, at will, by the users in the Instructional Design Department. It has a simple GUI, the only function of which is to fire off a process that operates on the server side in the background and accomplishes the following steps:
<ol>
<li>Read the ‘ids.json' file to capture the array holding the keys contained in the batch of individual JSON files with the results of the learning outcomes (exams) to be processed in the current run.
<li>Write out the ‘ids.json' file as an empty array. This will accomplish two things. First, it prevents the same outcome from being processed more than once. Second, it provides a clean starting point for the next batch of outcomes.
<li>For each JSON record in the batch, parse out the following data sets:
<ul>
<li>1 Learner/Student
<li>1 Course
<li>1 Outcome (intersection of Learner/Course/Completion as of a date
<ul>
<li>1 Header
<li>n Details (one for each question on the Course
</ul>
</ul>
<li>For each Learner/Course/Outcome intersection, write the following:
<ul>
<li> 1 Learner SQL Row
<li> 1 Course SQL Row
<li> 1 Outcome as a transaction:
<ul>
<li>1 Outcome SQL Row
<li>n OutcomeDetail SQL Rows
<li>(must be written as a set with rollback for failure)
</ul>
<li>1 or more SQL Log rows describing the transaction success
<li>If the Outcome is successfully written, destroy the JSON data file to prevent reprocessing. If unsuccessful, preserve the JSON data file for reprocessing and push the failed id to an array.
</ul>
</ul>
<li>Conditional: If any Outcomes fail to file as a transaction set (are rolled back), the following will take place. The ‘ids.json' file will be read. Any ids that failed will be pushed back onto the array so they may be reprocessed. The ‘ids.json' file will be written back to the API and the JSON data file associated with the id will be preserved for reprocessing. 
<li>The processing window will be rendered with a progress indicator. Then the app will end.
</ul>
</ul>

#####Troubleshooting

The Log records can be Interpretted to find the problems that need to be addressed, prior to the next running of the batch. There is no requirement for any more stringent rules for data integrity. The assumption is that volumes and timings of updates does not warrant it.