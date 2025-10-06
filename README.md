Members
    DJUVALLE ANTOINEY BUENAVENTE
    LIM, JOSHUA EMMANUEL SESE
    LUIS ANTONIO ROA
    MARY NICOLE SERRA

Feature
    Flight search with origin, destination, and schedule filters
    Seat selection and meal/baggage options
    Reservation creation, modification, and cancellation
    User login/register with profile management
    Admin pages for flight and user management
    REST API for onoine checkin

Tech Stack
    Front-end   ~HTML, CSS, JavaScript, Bootstrpa, jQuery
    Back-end    ~Node.js, Expres, Handlebars
    Database:   ~MongoDB
    Testing:    ~Jest
    Auth:       ~Bcrypt + express-session

Project Structure
    /public     ~static assets(HTML, CSS, JS)
        /images
            
    /docs       ~please only push to dev branch 
        /notes.md   #dev notes
        /tasks.md   #lists of assignment per person
        /sources.md #list of sources
    
    CHANGELOGS.md   #please look here to see changes
    README.md       #main project document 

MileStone 1: Frontend UI design
Milestone 2: Backend CRUD integration
Milestone 3: Security, testing, REST API

Installation + Run instructions
    ~need top put instructions on how to run

Branch Structure
    Main
        ~stable version only ; Only push once coordinated with groupmates to prevent conflicts
    Dev
        ~active dev branch   ; merge here first for testing purposes
    Docs
        ~Internal doc updates; for /docs folder only

    feat-search-ui
        ~flight search page + form results layout 

    feat-booking-form
        ~reservation form+ optional packages

    feat-reservations-list
        ~Display booked reservations.
    
    feat-admin-management
        ~user management ui
    
    feat-flight-management
        ~flight management ui