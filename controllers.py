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
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from py4web.utils.url_signer import URLSigner
from py4web.utils.form import Form, FormStyleBulma
from .common import Field
from pydal.validators import *


url_signer = URLSigner(session)


@unauthenticated("index", "index.html")
def index():
    user = auth.get_user()
    message = T("Hello {first_name}".format(**user) if user else "Hello")
    return dict(message=message)

@action("lyrics")
@action.uses(db, "lyrics.html")
def lyrics():
    bands = db(db.band.name).select()
    return dict(bands=bands)
    
@unauthenticated("about", "about.html")
def about():
    return dict()
    
@action("profile")
@action.uses(db, auth.user, "profile.html")
def profile():
    user = auth.get_user()
    print(user)
    db.profile.update_or_insert(user_id = user["id"])
    profile = db(db.profile.user_id == user["id"]).select().first()
    return dict(user=user, profile=profile)
    
@action("edit_profile", method=["GET", "POST"])
@action.uses(db, session, auth.user, "form.html")
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
@action.uses(db, session, auth.user, 'form.html')
def add_band():
    form = Form(db.band, csrf_session=session, formstyle=FormStyleBulma)
    if form.accepted:
        redirect(URL('index'))
    return dict(form=form)
    
#info pages use band/ablum/song names in URL for easy access
@action('band/<band_name>')
@action.uses(db, 'band.html')
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
@action.uses(db, session, auth.user, 'form.html')
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
@action.uses(db, 'album.html')
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
@action.uses(db, session, auth.user, 'form.html')
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
    
@action('song/<song_name>')
@action.uses(db, 'song.html')
def song(song_name=None):
    assert song_name is not None
    n = song_name.replace('_',' ')
    song = db(db.song.name.like(n, case_sensitive=False)).select().first()
    if song is None:
        redirect(URL('index'))
    band = db(db.band.id == song.band_id).select().first()
    album = db(db.album.id == song.album_id).select().first()
    return dict(song=song, album=album, band=band)