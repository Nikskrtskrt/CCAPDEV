Initial Setup
    ~Clone repo
        git clone https://github.com/Nikskrtskrt/CCAPDEV.git
        cd CCAPDEV
    ~Check branches
        git branch -a
        ~you should see
            main
            dev #always work on dev branch unless you're doing docs or individual feature branches!
            docs
            feat-search-ui
            feat-booking-form
            feat-reservations-list
            feat-admin-management
            feat-flight-management

Workflow
    ~selecting branch
        git checkout <branch-name>
    ~updating local branch
        git pull origin <branch_name>
    ~pushing latest commit
        git add. 
        git commit -m "short clean message"
        git push origin <branch_name>

    #please make sure to save your changes into your own branch before pulling the dev server
    #also remember to update the changelogs.md everytime you push 

    ~FOR DOCS BRANCH ONLY
        git checkout docs
        git pull origin docs #please update your local repository before making changes
        git add docs/
        git commit -m "update notes"
        git push origin docs

    Recommended every work session
        git checkout dev
        git pull origin dev             #update dev
        git checkout feat-search-ui     
        git merge dev                   #merge new dev updates into your branch

Additional Formatting notes
    ~default html file naming convention (i.e lowercase and use hyphens(-) instead of space(example. main-page.html))
    ~when using custom colors please set them in :root of globals.css to ensure consistent color coding

Subject for change
    ~

New elements and how to use them
    ~ to add new background add background container inside <body> before elements
     <!-- background image containers -->
    <div class="background-container">
        <div class="panel left"></div>
        <div class="panel center"></div>
        <div class="panel right"></div>
    </div>
    ~ to add new slide in and slide out animations, just add to css of object
    transform: translateY(0);
    animation-duration: 1.5s;
    animation-name: slide-up; or slide-down