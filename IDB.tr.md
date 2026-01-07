# Technical Report



## 1. Overview & Purpose



FosterFledging was created to support young adults (18–24) who are transitioning out of foster care and often face the challenges of living on their own without a strong safety net. The platform brings together affordable housing options, free or low-cost counseling, and reputable organizations dedicated to their success. 



By making these critical resources easily accessible and tailored to each person’s eligibility and needs, FosterFledging aims to ease the challenging transition to adulthood. 



---



## 2. User Stories



### Phase I 



1. Context: Our end user is a young adult aging out of foster care. They need a website that helps them find affordable housing, counseling services, and trusted organizations in one place. The goal is to make it easy for them to access resources and engage with the community.



    - User Story: As a visitor, I want to browse housing options filtered by location, rent, and eligibility so that I can find affordable housing near me. 



    - Reply: Out of scope. Will be implemented in phase 3. Estimated Time: 7-10 hours. For filtering, we need to set up data sources, write up the logic, integrate the UI, test, and polish. 



2. Context: Our end user is a young adult aging out of foster care. They need a website that helps them find affordable housing, counseling services, and trusted organizations in one place. The goal is to make it easy for them to access resources and engage with the community.



    - User Story: As a visitor, I want to filter counseling services by specialization, language, and cost so that I can find care that meets my needs.



    - Reply: Out of scope. It will be implemented in phase 3. Estimated Time: 7-10 hours. For filtering, we need to set up data sources, write up the logic, integrate the UI, test, and polish. 



3. Context: Our end user is a young adult aging out of foster care. They need a website that helps them find affordable housing, counseling services, and trusted organizations in one place. The goal is to make it easy for them to access resources and engage with the community.



    - User Story: As a visitor, I want to filter counseling services by specialization, language, and cost so that I can find care that meets my needs.



    - Reply: Out of scope. It will be implemented in phase 3. Estimated Time: 7-10 hours. For filtering, we need to set up data sources, write up the logic, integrate the UI, test, and polish. 



4. Context: Our end user is a young adult aging out of foster care. They need a website that helps them find affordable housing, counseling services, and trusted organizations in one place. The goal is to make it easy for them to access resources and engage with the community.



    - User Story: As a visitor, I want to view organizations with information about mission, region, and volunteer opportunities so I can contribute effectively.



    - Reply: Out of scope. Will be implemented in phase 2. Estimated Time: 6-10 hours. We need to update fields for mission, region, and volunteer opportunities. We also need to update the UI, test, and polish the code. 



5. Context: We are the Customer team for FosterFledging. We want a website that helps young adults aging out of foster care find housing, counseling, and trusted organizations. The site should be interactive, easy to navigate, and provide actionable resources tailored to each user’s eligibility and needs.



    - User Story: As a visitor, I want answers to key questions so I can make informed decisions quickly. Users should be able to answer: “Where can I live next month that fits my budget and eligibility?”, “Which low/no-cost counselors offer trauma-informed care in my language?”, and “Which vetted organizations are most active and how can I volunteer or donate effectively?” Filters and sorting should help dynamically generate answers.



    - Reply: Out of scope. Will be implemented in phase 3. Estimated Time: 7-10 hours. For filtering, we need to set up data sources, write up the logic, integrate the UI, test, and polish. 

---

### Phase II

1. User Story: As a user, I want a polished frontend with a landing page, navigation bar, and model pages, So that I can easily access housing, counseling, and organization resources. 
    - Reply: Implemented.
2. User Story: As a user, I want to see a list of all counseling services from the backend API, So that I can browse providers that match my needs.
    - Reply: Implemented.
3. User Story: As a user, I want to view detailed information about a single housing resource, So that I can understand its features before contacting the organization. 
    - Reply:  Implemented.
4. User Story: As a user, I want to see which housing options, counseling services, and organizations are connected,So that I can understand who manages or sponsors each resource and find all related support in one place. 
    - Reply:  Implemented.
5. User Story: As a user, I want to see a list of all housing resources from the backend API, So that I can browse available housing options. 
    - Reply:  Implemented.

---

### Phase III

1. User Story: As a young adult transitioning out of foster care,
I want to receive a curated list of housing and counseling options that match my eligibility and location preferences, so that I can quickly find realistic and accessible support options.
    - Reply:  Implemented to some extent.  
2. User Story: As a user seeking trustworthy nonprofits, I want to see ProPublica nonprofit ratings and charity statuses displayed on organization profiles, so that I can make confident decisions about where to volunteer or donate.
    - Reply: Out of scope. We decided to stick to Google Maps API for our data. Maybe will implement in the future. It would take a couple of days to scrape the data and add it to the instance pages.
3. User Story: As a user exploring counseling options, I want to know if providers offer free telehealth or accept Medicaid, so that I can find affordable care options suited to my needs.
    - Reply: Information regaring the counseling instances is kept minimal. If you want to see data about a certain counseling option, please look at each website. 
4. User Story: As a community member who wants to give back, I want to browse volunteer or donation opportunities from local organizations, so that I can contribute my time or money effectively. Users can filter organizations by volunteer roles or donation needs. Integration with organization’s donation pages or volunteer sign-up forms. Display social media activity feeds to boost engagement.
    - Reply: Out of Scope. This is to in depth of a filter for our current data set. Our job is to only provide the most important information, and then you can see certain options by going to the volunteer website or checking out the email. 
5. User Story: As a user reviewing multiple options, I want to save and share housing or counseling resources to revisit later, so that I can compare options and share them with mentors or friends. Criteria: Logged-in users can bookmark and view saved items. Shareable link for each resource card. Visual indicator for bookmarked items.
    - Reply: Out of scope. This is a good idea, but it is out of scope for this phase. We can implement this in Phase 4.


---



## 3. Architecture



### 3.1 Frontend Summary



#### Phase I 

- Static HTML5 is used to define the structure of the pages. Vanilla JavaScript for DOM updates and API calls. Bootstrap 5 is used as a CSS Framework.

- How the UI interacts with the API:

    - Currently, the API is not implemented, but pages will eventually get resource data via fetch calls returning JSON.



#### Phase II

- React and JS used as a GUI framework. Served directly to AWS.

- Docker is used for containerization.

- Dockerfile summary:

    - Build Stage: Uses node:22-alpine as a lightweight build environment. Install dependencies using npm ci. Generates production-ready assets using npm run. 

    - Runtime Stage: Uses nginx:alpine as a minimal web server. Copies built files into the nginx default root. Exposes port 80 and starts nginx.

- Interaction with backend: uses HTTP endpoints. Fetches dynamic data via RESTful API calls to the Flask backend.

- The frontend is decoupled from backend implementation details (only cares about the API response format)

- Because it’s containerized in Nginx, it can be deployed anywhere that runs Docker, including AWS ECS



- Pagination:

    - The frontend implements pagination by fetching a fixed number of counseling resources (cardsPerPage = 9) from the backend API for the current page. When a user clicks a page number, the app requests that page via a query parameter (page[number]), updates the displayed cards, and dynamically renders the pagination controls based on the total number of resources returned by the API (apiData.meta.total). This approach minimizes data loaded at once and allows smooth navigation through potentially large datasets.

#### Phase III

- Moved static html files completly over to using React. 
- Added search bars on relevant pages.    

#### Phase IV
- Moved completely over to React.
- Seaching and filtering is fully implemented.
- Added visualizations using Recharts.

### 3.2 Backend Summary



#### Phase I 

- The API framework is designed with Postman. Currently, there are only 2 GET endpoints per model.

- API Currently in design stage (not implemented).



#### Phase II

- Docker is used for containerization

    - Dockerfile summary:

    - Uses python:3.11 environment

    - Establishes the working directory to be /app

    - copies requirements.txt

        - Key libraries: Flask (v≥2.2), SQLAlchemy (v≥2.0) and Flask-SQLAlchemy (v≥3.0) for ORM and database integration, Flask-Restless-NG (v≥3.0.0) for REST API generation, PyMySQL (v≥1.1.0) as the MySQL connector, Flask-Cors (v≥4.0.0) to handle cross-origin requests, and cryptography (v≥41.0.0) for secure operations.

    - Exposes port 5000

    - runs flask app

- Description of flask app:

    - Backend Flask app implements 6 GET endpoints (The 3 GET by id endpoints done manually)

    - 3 Association tables

        - housing_state - contains state id and housing id

        - organization_state - contains state id and organization id

        - counseling_state - contains state id and counseling id

        - Models described in 4.1. 

    - For each GET by id endpoint for each model:

        - Get states (the IDs of the US states resided by that model)

        - Using states, query other models for related resources. 

        - Add those 2 new fields with the other ones.

- setup_db.py

    - Idempotent

    - Script that simply fills association tables

    - Only needs to run 1 time, and then new data must be dumped into .sql file in /db and imported into the server. Run inside the container.

- /db

    - Contains .sql dump

    - Contains preliminary data_scraping script.

        - Currently scrapes from Google Maps API only. 

#### Phase III

- changes to app.py
  - Added search_all endpoint
  - Added advanced querying
    - apply_query_options:
      - Filtering
        - Adds specific filtering for state, keyword, and type features.
        - Normal filtering of attributesincludes a simple contains check.
      - Sorting
        - Sorts attributes in descending and ascending order. 
      - Searching
        - Simple searching, Google-like to an extent. 
    - serialize_mode:
      - Will automatically serialize the entire model

#### Phase IV
- Added some logic to compute_matches in app.py 

### 3.3 Deployment, Hosting, and Toolchain



#### Phase I – Layout Hosting on AWS

- Only the `/layout` folder is deployed to AWS.

- CI/CD workflow via `/gitlab-ci.yml`:

  - Validates repository state using Git.

  - Uploads site files and triggers CloudFront cache invalidation on the main branch.

- Makefile:

  - Automates common tasks like git push/pull.

  - Used to run unit tests, build assets, etc.

- Git:

  - Version control.

  - Drives CI/CD pipeline.

- Deployment workflow:

  - Containerization using Docker 

  - Run Makefile commands to test/build components.

  - Commit changes and push to the repository to trigger automatic CI/CD deployment.



#### Phase II – Full Stack Containerized Deployment

- Hosting backend, frontend, and database using AWS ECS.

  - RDS MySQL instance for the database.

- Docker:

  - Containerizes backend, frontend, and database.

  - Docker Compose manages multi-container builds and runs.

- GitLab CI/CD:

  - Pipeline runs all tests from Postman using Newman.

  - Also runs frontend and backend tests.

  - Makefile continues to streamline development tasks.

- Testing tools

  - Postman + Newman

  - Unittest Backend Unit Tests

  - Mocha Frontend Unit Tests

  - Selenium GUI Acceptance Tests

- Grammarly

- PlantUML

- Flask used for app implementation

- MySQL for the database

### 3.4 Current Repository Layout 



#### Phase I



```text

/ (root)

├─ layout/               

│  ├─ images                        # Member photos

│  ├─ model_counseling              # Counseling model

│  │   ├─ images                    # Counseling model images

│  │   ├─ counseling_search.html # Counseling model search page

│  │   ├─ instance_c1.html          # Counseling model instance 1

│  │   ├─ instance_c2.html          # Counseling model instance 2

│  │   └─ instance_c2.html          # Counseling model instance 3

│  ├─ model_housing                 # Housing model

│  │   ├─ images                    # Housing model images

│  │   ├─ housing_search.html       # Housing model search page

│  │   ├─ instance_h1.html          # Housing model instance 1

│  │   ├─ instance_h2.html          # Housing model instance 2

│  │   └─ instance_h3.html          # Housing model instance 3

│  ├─ model_organizations           # Organizations model

│  │   ├─ images                    # Organizations model images

│  │   ├─ organizations_search.html # Organizations model search page

│  │   ├─ instance_o1.html          # Organizations model instance 1

│  │   ├─ instance_o2.html          # Organizations model instance 2

│  │   └─ instance_o3.html          # Organizations model instance 3

│  ├─ about_page.html               # About page

│  ├─ about.js              

│  ├─ index.html                    # Bootstrap

├─ .gitignore                       # gitignore

├─ .gitlab-ci.yml                   # CI/CD pipeline for deployment

├─ IDB.ai.md                        # AI report

├─ IDB.tr.md                        # Technical report

├─ MakeFile                         # Make file

├─ README.md                        # Project overview

```

#### Phase II



- Only explaining necessary files and additions.



```text

/ (root)

├─ backend/                         

│  ├─ db/                           # Datascraping and .sql file

│  ├─ app.py                        # Endpoint Implementation

│  ├─ Dockerfile                    

│  ├─ requirements.txt              

│  ├─ setup_db.py                   

├─ frontend/                        

│  ├─ public/                        # Static files served directly

│  ├─ src/                           # React source code and components

│  ├─ Dockerfile                    

│  ├─ index.html                     # React frontend entrypoint

│  ├─ package.json                   # Frontend dependencies

├─ layout/                          

│  ├─ about_page/                   

│  │  └─ images/                    

│  ├─ model_counseling/             

│  ├─ model_housing/                

│  ├─ model_organizations/          

├─ .gitignore                       

├─ .gitlab-ci.yml                   

├─ postman/                         

├─ .env                             

├─ docker-compose.yml               

├─ IDB.ai.md                        

├─ IDB.tr.md                        

├─ README.md                        

```

#### Phase III

```
├───backend
│   ├───db
│   └───__pycache__
├───frontend
│   ├───node_modules
│   ├───public
│   └───src
│       ├───assets
│       ├───components
│       └───pages
│           ├───CounselingPage
│           ├───HousingPage
│           └───OrganizationsPage
├───layout
│   └───assets
├───old_layout
│   ├───about_page
│   │   └───images
│   ├───model_counseling
│   │   └───images
│   ├───model_housing
│   └───model_organizations
├───postman
└───tests
```



### 3.5 Current Website Architecture

- Splash page contains relevant information

- Models will generate instances superficially using pagination.

  - If an instance is clicked, then a details page will generate. 

- About page contains team info and our message.

#### Phase III
- Added search bars in relevant pages.


#### Phase IV
- Search bars
- Visualization Pages

### 3.6 Testing

- Using Newman + Postman for API tests. Simple tests for now.

- Using Pytest for backend endpoint tests. 

- Using Jest testing framework for Frontend unit tests.

- Using Unittest and Selenium for Frontend acceptance tests.

#### Pasee III

- Completed the aforementioned unit tests.
- Added tests for search_all endpoint.

---



## 4. API Documentation

👉 [API Documentation](https://documenter.getpostman.com/view/48800265/2sB3QDwD34)

### Pasee III
See documentation for information on query parameters^

### 4.1 Models & Endpoints



#### For all Models (Housing, Counseling, and Organization resource)

- Endpoints:

    - Get All.

    - Get specific by ID.

- Attributes:

    - id – primary key, integer

    - place_id – string, unique identifier

    - name – string, required

    - address – string

    - lat – float, latitude

    - lng – float, longitude

    - rating – float

    - types – JSON, list of types

    - category – string, required

    - keyword – string

    - phone – string

    - website – string

    - photo_url – text

    - state – string

    - source – string

    - retrieved_at – datetime, defaults to current UTC time

    - states – relationship via association table to multiple State entries

    - in_state_resources: dictionary of lists (Get by ID specific)

#### Pasee III

##### Global Search All Endpoint

    - See API documentation on information of use 
    - Added 'Google Like' searching
    - Used in search bars
    - Can specify model (counseling, organizations, housing).

#### State Model

- Represents a U.S. state with a unique ID and name; used to associate resources with one or more states. Enabling queries for all resources within a given state.


##### Association tables: 

- housing_state, counseling_state, and organization_state are many-to-many join tables linking Housing, Counseling, and Organizations entries to multiple states (by id). 


### 5. Challenges Faced



#### Phase I 

- For this project, the main undertaking for most of us was understanding new concepts. These included interacting with the gitlab api, learning new languages, and using Postman. Overcoming these challenges included: Using AI searches to conceptually clarify and give suggestions for debugging;  Reading on how certain tools and services like AWS and Postman worked.

- One challenge I faced was the lack of sufficient data from the sites we had identified in our project proposal. To address this, I supplemented our sources with additional sites, including https://findtreatment.gov/state-agencies and https://www.usajobs.gov/search/results/?l=Texas



#### Phase II

- Getting Started. Realized about halfway through week 1 that we cannot continue with a lot of development until we get the backend/database working. This led to all of us starting late.

- This phase was a lot of work, and we all had to learn new technologies and tools like Docker, AWS, and React. It was a lot of moving parts that had to be put together in such a way to get a functional project.

- Fixing stuff we messed up ;-;.

- Updating things we already had.

- We had to use a resubmit.

- Trying to use Postman

#### Pasee III

 - Figuring out how to dynamically update the about page with react.
 - Implementing searching, sorting, and filtering required more knowledge about how SQLAlchemy worked. 



### 6. Roadmap



#### Phase I 

- API will be implemented so resources can be fetched dynamically.

- Data Storage Plan: Either use MySQL or PostgreSQL for database management.

- Backend Server: Use Python, Flask, Docker 

- Frontend Server: Use JS and React for the frontend server.

- Create a UML using PlantUML

- Unit tests for RESTful API, JS, and Python code.



#### Phase II

- Refining and adding more tests (unit, acceptance, Postman).

- Create a DB diagram

- Refine data of instances (and add more instances)

- Create an in-range resources attribute or add an in-range search

- Refine API and Website

- Add filtering, sorting, and searching

- Google-like searching 

#### Pasee III

- Making our code looked pretty
- Implement standing user stories.

#### Phase IV
- Finish this project and this class. Very fun project!