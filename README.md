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
email              |     | TEXT | 50  |  X  |         |user email                      |
| password         |     | TEXT | 50  |  X  |         |encrypted                       |
| name             |     | TEXT | 50  |  X  |         |user name|

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
| title             |     | TEXT | 50  |  X  |         |course title|
type              |     | TEXT | 10  |     |         |type of course (TBD)                      |
| source         |     | TEXT | 50  |     |         |author or supplier of the course|
|pubYear                |     | TEXT  |     |  X  |         |Year the course was published                 |
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
| pointMax             |     | INT |     |  X  |         |maximum points possible for the outcome|
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