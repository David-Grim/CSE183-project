# NoFilter

Introduction

   This project makes use of the py4web library and html/css/js to create a stunning music discussion website. 
   You can find more details about this project, watch a demo, and play with it yourself by reading below.

Demo

   link to demo video: https://drive.google.com/file/d/14kF18WLpcU1GK-Jm6KwJ2rjBh0iigIO7/view?usp=sharing
   (should be viewable to all in UCSC domain)

**Play With It Yourself**

  **->** {https://20210604t160017-dot-proverbial-will-315715.uk.r.appspot.com/} **<-**

    NOTE: The website is not fully functional. So far all we were able to get done is the initial hosting steps. Due to time constraints
    and the overall challenge associated with hosting the website on Google we were unable to get the hosted site to a fully functional state.
    Given these challenges we didn't want to affect the overall experience our website gives. The contents of the github repo are fully functional
    and operate as intended.


Prerequisites

    - Computer with internet access
    - A modern-web browser like Brave , Chrome , Firefox etc
    
Getting Started

    1. Fork this repository 

    2. Clone your forked repository to your local system 

    git clone https://github.com/David-Grim/CSE183-project.git

    Or Download and extract the zip file.

Running

    python3 -m pip install py4web --user
    py4web setup apps
    cp <project location> apps/
    py4web run apps
    
    Then just navigate to the local host and your project, for example: http://127.0.0.1:8000/CSE183-project

Built With

    HTML - Standard markup language
    Bulma.CSS - CSS, or style sheet framework, used for smooth frontend web design
    JavaScript - High-level, interpreted programming language used for web design
	Python 3 - Object oriented programming language, used for backend web design
    py4web -  Web framework for rapid development of efficient database driven web applications.
    
 Implementation
 
   Ali - created the login screen, added information to the about us section, created the pink 
   glowing text effect, fixed glitch on login screen that was showing sections, made sure colors 
   matched between sections, changed text to a more aesthetic look, fixed scrolling glitch, fixed 
   blue highlight box when users are selecting pages, added sound effect gifs, changed mouse 
   pointer, created readme
   
   David - Initial planning of the website. Created the GitHub repository. Created the initial 
   layout for other group members to expound on. Implemented initial versions of user comments 
   and search bar, to be later fine tuned by Mark. Implemented string matching for the search 
   bar. Added comment history section in the user profile page. Planned overall logistics of project. 
   Made the demonstration video.
   
   Mark - Created the database, band, album, and song pages. Worked heavily on user comments, 
   created the vue components that display lyric annotations/comment trees and the controller 
   logic that supports the comment trees. Assisted with search bar and user profiles. Made some 
   minor html changes to most pages to make the appearance of the website feel consistent.
   
   Juan - Initial profile page design, generic html forms, overall touch-ups on most .py and 
   .html files such as reworking controller functions to suit the given needs, minor syntax refining, proofreader

Authors

    Ali Malik
    David Grim
    Mark Krause
    Juan Mendez
	
Write-up

	Project: Music Review and Discussion, aka “No Filter”

Our web application project, a music review and discussion site that we dubbed "No Filter", is a 
website that allows users to discuss music, specifically song lyrics. 

Visually, our site maintains a bright, neon space that users will notice immediately. Our site’s 
backdrop is ever shifting between a dark cyan to a medium magenta color, keeping the site lively.
This was accomplished by creating a linear animated gradient that runs in an infintie 15sec loop, and by changing the background position.
As well as the backdrop, our floating mouse
also takes up a fuzzy pink color. This was done by setting the style of the body to a mouse cursor that links to the image from a url.

Upon entering the site, users will be prompted to sign in or sign up, a simple process that requires an email 
address for the user creation. The login functionality was made through the use of the provided auth_user db.

After signing up, the user will be returned to the sign in screen, where they can log in. Once 
logged in, the user will enter the home page of No Filter. There, the user is shown any recent 
song lyrics that were added. The user may select any of the songs there and begin discussion 
immediately, or browse through the three other tabs: Lyrics, About Us, and Profile. Navigating 
through these tabs was made possible by a tab bar controller with the text being a link to that specific tab.
Selecting Lyrics will send users to the Lyrics page, where they may browse all bands/albums/songs currently in
our database. The search bar on this page will offer autofill selections for text typed inside. One of our more
daunting tasks, the search bar was implemented by querying the various database tables, and matching the strings the
user inputs with the results from the database tables. If a band/album/song is not in our database, users are allowed
to add the given musical piece to our database. Users are specifically not allowed to edit preexisting entries to the
database as to not sabotage the work of another user. That task would be given to the admins or moderators.

The database consists of 6 tables: (in addition to py4web_session, auth_user, and auth_user_tag_groups)
    db.profile
        This table has a one-to-one relationship with auth_user by way of a user_id reference. 
        It contains information about a user that is meant to be customizable and publicly displayed.
    db.band
        This table has a one-to-many relationship with both db.album and db.song.
        It contains information about a band such as name, an image, and a bio.
        Band entries are created using a form accessible by clicking the "Add New Band" button 
        on the lyrics page.
    db.album
        This table has a many-to-one relationship with bands and a one-to-many relationship with songs. 
        It contains information about an album such as name, album artwork, and release date.
        Entries are created using a form accessible by clicking the "Add an Album" button on any band page. 
    db.song
        This table has a many-to-one relationship with both bands and albums. 
        It contains information about a song such as name and lyrics.
        Song entries are created by clicking the "Add a Song" button on an album page. 
    db.comment
        This table has a many-to-one relationship with both auth_users and songs. Comments also 
        have a many-to-one relationship with other comments in that they store a single reference to the comment 
        they are a reply to (if they are a reply) and one comment can have many replies to it. Comments by 
        users on a song page when they click on a line, click "+ Comment" or by clicking on the "reply" text 
        of another comment.
        Comments contain information intended to be public such as their text, datetime posted, and score. 
        It also contains some non-reference fields like "top_level" and "line_number" which keep track of 
        whether or not they are the beginning of threads and which line of lyrics they are directed at. 
    db.thumbs
        This table contains up-votes and down-votes made by users on comments. It has a many-to-one
        relationship with both users and comments. Thumbs are created or modified when a user 
        clicks an up or down arrow on a comment and are used to determine the 'score' field 
        of that comment.

To add a band, users will click the green “Add New Band” button, bringing them to the Add Band page. 
Users must enter a name and photo for the newly added band, with the band bio being optional. Adding 
a photo was implemented using a field of type upload. After submitting, users may click on a band’s 
name and be sent to the band’s page, where they can click on the green “Add an Album” button. Users 
who click on this will be sent to the Add Album page, where they can add an album from that band to 
the database. To be added, an album will require an album title and a release date, with the album cover 
art being optional. Once added, users may add a song to the given album. Selecting the album for a 
song will bring the user to the album’s page, which contains album information. To add a song, 
click the green  “Add a Song” button. There the user can add the name of the song and the song’s 
lyrics. The added song can be viewed on the song page, accessible from: the album page, a search, 
or the recently added section on the index page. The song page is where discussion discussion takes 
place and makes heavy use of interactive javascript.

When a user visits a song page, the controller queries the information pertaining to that song, 
its album, and its artist from the database. This information, along with four links relating to 
comment actions are passed to song.html in a dict. song.html displays the relevant data using YATL.

song.html also loads the js/comments.js file containing a vue instance. On initialization,
the vue instance makes an axios get request for the comments associated with the song. The 
controller queries all top level comments directed at a line of lyrics for that song and then 
recursively queries all comments that are a reply to a comment it has already queried. A list of 
lists of comments is generated that contains all comments that have been made on that song page 
in a format that reflects the structure in which they should be displayed. This list of lists is 
called 'annotations' and is returned to the vue object where it is interpreted as an array of arrays
of objects.

song.html uses YATL to loop through the lines of the song and then initializes LyricLineComponents 
by passing it the line text, a javascript reference to the appropriate sub-array of the annotations array,
and lyric line number. LyricLineComponent is a vue component within the vue app of js/comments.js 
that displays the line, highlights it if there are comments, and when clicked it displays 
all of that line's comments as well as a button that allows the user to make a new (top_level)comment. 
In order to display its comments, the LyricLineComponent loops through the array, comment_arr, that 
has been passed into it and initializes a CommentComponent for all comments in the array.

CommentComponent is another vue component that is also a child component of the vue app in 
js/comments.js. It takes a reference to a comment, a reference to that comment's parent comment 
(or null if it is not a reply), and a depth integer which is initialized to 0 by the LyricLineComponent
or depth+1 if it is initialized recursively by another CommentComponent.

CommentComponent displays the relevant information of the comment, such as author name, comment text, 
vote count, and user avatar. At the end of a CommentComponent's html template, it recursively initializes more 
CommentComponents for each object in its 'posts' array, which contains all of the comments that 
are replies to its own comment. This component also contains methods for replying to comments, 
deleting comments, and voting. All methods that use axios to communicate with the controller are 
methods of app, and so CommentComponent and LyricComponent call those methods when they need to do this.

Moving on, the About Us tab offers information about the site, including contact info. 

Clicking on Profile will bring users to their profile page, showing their name, avatar icon, 
and bio. This page contains an “Edit Profile” button, which will allow the user to edit one’s 
avatar and bio. Profile functionality was implemented to give the user a unique profile they can edit
freely to better reflect themselves. A comment history feature was added to allow the user (and any other
visiting their profile) to view what comments that user has made, complete with a link to the specific
song the comment was made.

Users navigating through song lyrics will be able to click on the lyrics themselves, where they 
will be prompted to add comments on these if they so choose. The heart of our website’s discussion 
functionality lay here. Clicking on lyrics will create a drop-down post section, where one may 
comment on the lyrics. After posting the comment, the comment will be available to view by all 
other users on the site, along with a reply functionality, the user’s avatar and name, and an 
up-vote/down-vote system, allowing users to interact with one another. Replies to a comment can 
also be replied to, as well as up-voted/down-voted.

As well as the main interactivity our website offers, we also use URL signing and INSERT EXPLANATION HERE 
for our site’s security.

There were, unfortunately, a few bugs we were unable to fix with the encroaching deadlines. As 
previously explained, we encountered numerous errors on hosting the site. As such, the site is 
only accessible through the git repository for the time being. Ideally we would have more time 
to fix such issues.One problem that may frustrate potential users occurs in the profile editing 
section. When editing a profile, our files overwrite whatever is placed (and what isn’t placed) 
in the profile. For example, if you were to edit your profile to add a new avatar icon and saved 
the changes, your bio would be deleted, since you did not edit the bio as well, and vice versa.

There were certain ideas we brainstormed as well that did not make the cut due to time constraints 
and logical complexity. If given more time for such a project, a huge addition we would have made
is to change the homepage to display trending song lyrics instead of mere recent song lyrics. 
This, however, would present a much larger challenge, as we soon learned that creating a 
“trending” function similar to sites such as Twitter requires extensive knowledge of machine 
learning and artificial intelligence.


