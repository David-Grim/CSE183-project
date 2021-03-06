"""
This file defines actions, i.e. functions the URLs are mapped into
The @action(path) decorator exposed the function at URL:

    http://127.0.0.1:8000/{app_name}/{path}

If app_name == '_default' then simply

    http://127.0.0.1:8000/{path}

If path == 'index' it can be omitted:

    http://127.0.0.1:8000/

The path follows the bottlepy syntax.

@action.uses('generic.html')  indicates that the action uses the generic.html template
@action.uses(session)         indicates that the action uses the session
@action.uses(db)              indicates that the action uses the db
@action.uses(T)               indicates that the action uses the i18n & pluralization
@action.uses(auth.user)       indicates that the action requires a logged in user
@action.uses(auth)            indicates that the action requires the auth object

session, db, T, auth, and tempates are examples of Fixtures.
Warning: Fixtures MUST be declared with @action.uses({fixtures}) else your app will result in undefined behavior
"""

from py4web import action, request, abort, redirect, URL
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash, Field
from py4web.utils.url_signer import URLSigner
from .models import get_user_email, get_user_username, get_user_id, get_time
from py4web.utils.form import Form, FormStyleBulma
from pydal.validators import *
import bisect

url_signer = URLSigner(session)

@action('index')
@action.uses(db, auth.user, 'index.html')
def index():
    user = auth.get_user()
    db.profile.update_or_insert(user_id = user["id"]) #creates empty profile on first login
    songs = db(db.song.name).select(orderby=~db.song.time_added)
    #need to somehow pull the band name here as well
    user = auth.get_user()
    message = T("Hello {first_name}".format(**user) if user else "Hello")
    return dict(message=message, songs = songs, band = band)

@action("lyrics")
@action.uses(db, auth.user,"lyrics.html")
def lyrics():
    bands = db(db.band.name).select(orderby=db.band.name)
    songs = db(db.song.name).select()
    return dict(bands = bands,
                songs = songs,
                search_url = URL('search', signer=url_signer))
    
@action("about")
@action.uses(db, auth.user, "about.html")
def about():
    return dict()

@action("profile")
@action.uses(db, auth.user, "profile.html")
def profile():
    username = get_user_username()
    redirect(URL('profile',username))

@action("profile/<profile_username>")
@action.uses(db, auth.user, "profile.html")
def profile(profile_username=None):
    user = auth.get_user()
    if profile_username is None:
        profile_owner = user
    else:
        profile_owner = db(db.auth_user.username == profile_username).select().first()
    assert profile_owner is not None
    profile = db(db.profile.user_id == profile_owner["id"]).select().first()
    profile.username = profile_username
    comments = db(db.comment.user_id == profile_owner["id"]).select()
    return dict(username=user["username"], profile=profile, comments = comments, signer=url_signer)
    
@action("edit_profile", method=["GET", "POST"])
@action.uses(db, session, auth.user, url_signer.verify(), "profile_form.html")
def edit_profile():
    user = auth.get_user()
    db.profile.update_or_insert(user_id = user["id"])
    profile = db.profile[user["id"]]
    form = Form([
        Field('avatar', type='upload'),
        Field('bio', type='text')],
        csrf_session=session, formstyle=FormStyleBulma)
    if form.accepted:
        db(db.profile.user_id == user["id"]).validate_and_update(
            avatar = form.vars['avatar'],
            bio = form.vars['bio']
            )
        redirect(URL('profile'))
    return dict(profile=profile, form=form)

@action('add_band', method=["GET", "POST"])
@action.uses(db, session, auth.user, 'band_form.html')
def add_band():
    form = Form(db.band, csrf_session=session, formstyle=FormStyleBulma)
    if form.accepted:
        redirect(URL('lyrics'))
    return dict(form=form)
    
#info pages use band/ablum/song names in URL for easy access
@action('band/<band_name>')
@action.uses(db, auth.user, 'band.html')
def band(band_name=None):
    assert band_name is not None
    n = band_name.replace('_',' ')
    band = db(db.band.name.like(n, case_sensitive=False)).select().first()
    albums = db(db.album.band_id == band.id).select()
    songs = db(db.song.band_id == band.id).select()
    band = db(db.band.name == band_name).select().first()
    if band is None:
        redirect(URL('index'))
    return dict(band=band, albums=albums, songs=songs)

#form pages use relevant IDs in url for precision
@action('add_album/<band_id:int>', method=["GET", "POST"])
@action.uses(db, session, auth.user, 'album_form.html')
def add_album(band_id=None):
    assert band_id is not None
    form = Form([
        Field('name', requires=IS_NOT_EMPTY()), 
        Field('image', type='upload'), 
        Field('date', type='date', requires=IS_DATE())], 
        csrf_session=session, formstyle=FormStyleBulma)
    if form.accepted:
        db.album.insert(
            band_id = band_id,
            name = form.vars['name'],
            image = form.vars['image'],
            date = form.vars['date']
        )
        redirect(URL('band/', db.band[band_id].name))
    return dict(form=form)
    
@action('album/<album_name>')
@action.uses(db, auth.user, 'album.html')
def album(album_name=None):
    assert album_name is not None
    n = album_name.replace('_',' ')
    album = db(db.album.name.like(n, case_sensitive=False)).select().first()
    if album is None:
        redirect(URL('index'))
    band = db(db.band.id == album.band_id).select().first()
    songs = db(db.song.album_id == album.id).select()
    return dict(album=album, band=band, songs=songs)
    #return dict()
    
@action('add_song/<band_id:int>/<album_id:int>', method=["GET", "POST"])
@action.uses(db, session, auth.user, 'song_form.html')
def add_song(band_id=None, album_id=None):
    assert band_id is not None
    assert album_id is not None
    form = Form([
        Field('name', requires=IS_NOT_EMPTY()), 
        Field('lyrics', type='text', requires=IS_NOT_EMPTY())], 
        csrf_session=session, formstyle=FormStyleBulma)
    if form.accepted:
        db.song.insert(
            band_id = band_id,
            album_id = album_id,
            name = form.vars['name'],
            lines = form.vars['lyrics'].split('\r\n')
        )
        redirect(URL('album/', db.album[album_id].name))
    return dict(form=form)
    
@action('song/<song_id>')
@action.uses(db, auth.user,'song.html')
def song(song_id=None):
    email = get_user_email()
    name = auth.current_user.get('first_name') + " " + auth.current_user.get("last_name")
    user_id = get_user_id();
    assert song_id is not None

    #assert song_name is not None
    #n = song_name.replace('_',' ')
    #song = db(db.song.name.like(n, case_sensitive = False)).select().first()
    #if song is None:
        #redirect(URL('index'))
    song = db(db.song.id == song_id).select().first()
    band = db(db.band.id == song.band_id).select().first()
    album = db(db.album.id == song.album_id).select().first()
    return dict(song=song,
                album=album,
                band=band,
                load_posts_url = URL('load_posts', signer=url_signer),
                add_post_url = URL('add_post', signer=url_signer),
                delete_post_url = URL('delete_post', signer=url_signer),
                vote_post_url = URL('vote_post', signer=url_signer),
                user_email = email,
                username = name,
                user_id = user_id,
                )

# Search function for search bar in lyrics section.
#---TO BE COMPLETED----

@action('search')
@action.uses()
def search():
    q = request.params.get("q").lower()
    results = []
    
    #search songs
    song_rows = db(db.song.name.lower().like('%'+q+'%')).select()
    for song in song_rows:
        results.append({
            "name": song.name,
            "url": URL('song/', song.id)
        })
        
    #search albums
    album_rows = db(db.album.name.lower().like('%'+q+'%')).select()
    for album in album_rows:
        results.append({
            "name": album.name,
            "url": URL('album/', album.name)
        })
        
    #search bands
    band_rows = db(db.band.name.lower().like('%'+q+'%')).select()
    for band in band_rows:
        results.append({
            "name": band.name,
            "url": URL('band/', band.name)
        })
        
    #results = [q]
    #results = [q + ":" + str(uuid.uuid1()) for _ in range(random.randint(2, 6))]
    return dict(results = results)


#--Code just for the comments section-----------

@action('load_posts')
@action.uses(url_signer.verify(), db)
def load_posts():
    song_id = id = request.params.get('song_id')
    song = db.song[song_id]
    #lyric_lines = song.lines
    #print(song_id)
    annotations = []
    
    for i in range(0, len(song.lines)):
        line_posts = db(
            (db.comment.song_id == song_id) &
            (db.comment.top_level == 'true') &
            (db.comment.line_number == i)
            ).select(orderby=~db.comment.score).as_list()
        for post in line_posts:
            configure_post(post)
            load_replies(post)
        annotations.append(line_posts)
    return dict(annotations=annotations)

@action('add_post', method = "POST")
@action.uses(url_signer.verify(), db)
def add_post():
    text = request.json.get('post_text')
    song_id = request.json.get('song_id')
    reply_id = request.json.get('reply_id')
    line_number = request.json.get('line_number')
    reply_target = db(db.comment.id == reply_id).select().first()
    comment_id = None
    top_level = True
    if reply_target is not None:
        comment_id = reply_target.id
        top_level = False
    id = db.comment.insert(
        song_id = song_id,
        comment_id = comment_id,
        top_level = top_level,
        post_text = text,
        user_email = get_user_email(),
        user_id = get_user_id(),
        datetime = get_time(),
        line_number = line_number
    )
    post = db.comment[id].as_dict()
    configure_post(post)
    return dict(post = post)

@action('delete_post', method = "POST")
@action.uses(url_signer.verify(), db)
def delete_post():
    comment_id = request.json.get('comment_id')
    post = db.comment[comment_id]
    user_email = post.user_email
    if user_email == auth.current_user.get("email") and comment_id is not None:
        db(db.comment.id == comment_id).delete()
    return "ok"

@action('vote_post', method = "POST")
@action.uses(url_signer.verify(), db)
def vote_post():
    user_email = get_user_email();
    comment_id = request.json.get('comment_id')
    rating = request.json.get('rating')
    db.thumbs.update_or_insert(
        (comment_id == db.thumbs.comment_id )&(user_email == db.thumbs.user_email),
        rating = rating,
        comment_id = comment_id,
        user_email = user_email,
    )
    upvotes = db((db.thumbs.comment_id == comment_id) &
                 (db.thumbs.rating == 1)).select().as_list()
    downvotes = db((db.thumbs.comment_id == comment_id) &
                 (db.thumbs.rating == -1)).select().as_list()
    score = (len(upvotes)-len(downvotes))
    db(db.comment.id == comment_id).update(score=score)
    return dict(upvotes=upvotes, downvotes=downvotes)

def configure_post(post):
    user = db(db.auth_user.id == post['user_id']).select().first()
    profile = db(db.profile.user_id == post['user_id']).select().first()
    avatar = profile.avatar
    author = user.username if user is not None else "Unknown"
    upvotes = db((db.thumbs.comment_id == post['id']) &
                 (db.thumbs.rating == 1)).select().as_list()
    downvotes = db((db.thumbs.comment_id == post['id']) &
                 (db.thumbs.rating == -1)).select().as_list()
    post["author"] = author
    post["avatar"] = avatar
    post["upvotes"] = upvotes
    post["downvotes"] = downvotes
    #post["thumbs"] = thumbs
    
def load_replies(post):
    replies = db(db.comment.comment_id == post['id']).select(orderby=~db.comment.score).as_list()
    post['posts'] = []
    for reply in replies:
        post['posts'].append(reply)
        configure_post(reply)
        load_replies(reply)
        


