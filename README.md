# NoFilter

Introduction

   This project makes use of the py4web library and html/css/js to create a stunning music discussion website. You can find more details about this project, watch a demo, and play with it yourself by reading below.

Demo

   {demo goes heere}
    
**Play With It Yourself**

  **->** {website link goes here} **<-**

Prerequisites

    - Computer with internet access
    - A modern-web browser like Brave , Chrome , Firefox etc
    
Getting Started

    1. Fork this repository 

    2. Clone your forked repository to your local system 

    git clone https://github.com/<your-username>/CSE183-project.git

    Or Download and extract the zip file.

Running

    python3 -m pip install py4web --user
    py4web setup apps
    cp <project location> apps/
    py4web run apps
    
    Then just naviage to the local host and your project, for example: http://127.0.0.1:8000/CSE183-project

Built With

    HTML - Standard markup language
    Bulma.CSS - CSS, or style sheet framework, used for smooth frontend web design
    JavaScript - High-level, interpreted programming language used for web design
	Python 3 - Object oriented programmign language, used for backend web design
    
    py4web -  Web framework for rapid development of efficient database driven web applications.
    
 Implementation
 
   Ali - created the login screen, added information to the about us section, created the pink glowing text effect, fixed glitch on login screen that was showing sections, made sure colors matched between sections, changed text to a more asthetic look, fixed scrolling glitch, fixed blue highlight wbox when users are selecting pages, added sound effec gifs, changed mouse pointer, created readme
   David -
   Mark -
   Juan - initial profile page design, generic html forms, overall touchups on most .py and .html files, minor syntax refining, proofreader
Authors

    Ali Malik
    David Grim
    Mark Krause
    Juan Mendez
	
Write-up

	Project: Music Review and Discussion, aka “No Filter”

Our web application project, a music review and discussion site that we dubbed No Filter, is a 
website that allows users to discuss music, specifically song lyrics. 

Visually, our site maintains a bright, neon space that users will notice immediately. Our site’s 
backdrop is ever shifting between a dark cyan to a medium magenta color, keeping the site lively.
This was accomplished by INSERT EXPLANATION HERE. As well as the backdrop, our floati
ng mouse also takes up a fuzzy pink color. This was done by INSERT EXPLANATION HERE. 

Upon entering the site, users will be prompted to sign in or sign up, a simple process that requires an email 
address for the user creation. The login functionality was made through the use of INSERT EXPLANATION. 

After signing up the user will be returned to the sign in screen, where they can log in. Once 
logged in, the user will enter the home page of No Filter. There, the user is shown any recent 
song lyrics that were added. The user may select any of the songs there and begin discussion 
immediately, or browse through the three other tabs, Lyrics, About Us, and Profile. Navigating 
through these tabs was made possible by EXPLANATION HERE.  Selecting Lyrics will send users to 
the Lyrics page, where they may browse all bands/albums/songs currently on our database. The 
search bar on this page will offer autofill selections for text typed inside. One of our more 
daunting tasks, the search bar was implemented INSERT EXPLANATION. If a band/album/song is not 
in our database, users are allowed to add the given musical piece to our database. User-database 
interactivity was implemented through INSERT EXPLANATION HERE. To add a band, users will click 
the green “Add New Band” button, bringing them to the Add Band page. Users must enter a name and 
photo for the newly added band, with the band bio being optional. Adding a photo was implemented 
using INSERT EXPLANATION HERE. After submitting, users may click on a band’s name and be sent to 
the band’s page, where they can click on the green “Add an Album” button. Users who click on this
will be sent to the Add Album page, where they can add an album from that band to the database. 
To be added, an album will require an album title and a release date, with the album cover art 
being optional. Once added, users may add a song to the given album. Selecting the album for a 
song will bring the user to the album’s page, which contains album information. To add a song, 
click the green  “Add a Song” button. There the user can add the name of the song and the song’s 
lyrics. These three pages are linked together through python logic, bringing the user’s info and 
current database along with it. INSERT FURTHER EXPLANATION IF NEED BE. Note that at any time 
users can exit these pages by clicking back on their browser or clicking on the tabs above. 

Moving on, the About Us tab offers information about the site, including contact info. 

Clicking on Profile will bring users to their profile page, showing their name, avatar icon, 
and bio. This page contains an “Edit Profile” button, which will allow the user to edit one’s 
avatar and bio. Profile functionality was implemented similar to adding bands and albums, and INSERT EXPLANATION. 

Users navigating through song lyrics will be able to click on the lyrics themselves, where they 
will be prompted to add comments on these if they so choose. The heart of our website’s discussion 
functionality lay here. Clicking on lyrics will create a drop-down post section, where one may 
comment on the lyrics. After posting the comment, the comment will be available to view by all 
other users on the site, along with a reply functionality, the user’s avatar and name, and an 
up-vote/down-vote system, allowing users to interact with one another. Replies to a comment can 
also be replied to, as well as up-voted/down-voted. Creating such a task functioned similar to a 
homework assignment we were given, INSERT EXPLANATION HERE.

As well as the main interactivity our website offers, we also use URL signing and INSERT EXPLANATION HERE 
for our site’s security.

There were, unfortunately, a few bugs we were unable to fix with the encroaching deadlines. One 
that may frustrate potential users occurs in the profile editing section. When editing a profile, 
our files overwrite whatever is placed (and what isn’t placed) in the profile. For example, if you 
were to edit your profile to add a new avatar icon and saved the changes, your bio would be deleted,
since you did not edit the bio as well, and vice versa.

There were certain ideas we brainstormed as well that did not make the cut due to time constraints 
and logical complexity. If given more time for such a project, a huge addition we would have made
is to change the homepage to display trending song lyrics instead of mere recent song lyrics. 
This, however, would present a much larger challenge, as we soon learned that creating a 
“trending” function similar to sites such as Twitter requires extensive knowledge of machine 
learning and artificial intelligence. INSERT OTHER IDEAS IF Y’ALL WANT


