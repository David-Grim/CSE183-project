"""
This file defines the database models
"""

import datetime
from .common import db, Field, auth
from pydal.validators import *
import datetime


def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None
    
def get_user_username():
    return auth.current_user.get('username') if auth.current_user else None
    
def get_user_id():
    return auth.current_user.get('id') if auth.current_user else None

def get_time():
    return datetime.datetime.utcnow()
    


### Define your table below
#
# db.define_table('thing', Field('name'))
#
## always commit your models to avoid problems later
#
# db.commit()
#

db.define_table(
    'profile',
    Field('user_id', type='reference auth_user', unique=True),
    Field('avatar', type='upload', default='profile.avatar.defaultavatar.png'),
    Field('bio', type='text')
)
db.profile.user_id.readable = db.profile.user_id.writable = False
db.profile.id.readable = db.profile.id.writable = False

db.define_table(
    'band',
    Field('name', requires=IS_NOT_EMPTY()),
    Field('image', type='upload', requires=IS_NOT_EMPTY()),
    Field('bio', type='text'),
    Field('time_added', default = get_time())
)
db.band.id.readable = db.band.id.writable = False
db.band.time_added.readable = db.band.time_added.writable = False

db.define_table(
    'album',
    Field('band_id', type='reference band'),
    Field('name', requires=IS_NOT_EMPTY()),
    Field('image', type='upload', requires=IS_NOT_EMPTY()),
    Field('date', type='date', requires=IS_DATE()),
    Field('time_added', default = get_time())
)
db.album.id.readable = db.album.id.writable = False
db.album.band_id.readable = db.album.band_id.writable = False

db.define_table(
    'song',
    Field('band_id', type='reference band'),
    Field('album_id', type='reference album'),
    Field('name', requires=IS_NOT_EMPTY()),
    Field('lines', type='list:string'),
    Field('time_added', default = get_time())
)
db.song.id.readable = db.song.id.writable = False
db.song.band_id.readable = db.song.band_id.writable = False
db.song.album_id.readable = db.song.album_id.writable = False

db.define_table(
    'comment',
    Field('user_id', type='reference auth_user'),
    Field('song_id', type='reference song'),
    Field('comment_id', type='reference comment'), #if comment is reply, point to target of reply. else empty
    Field('top_level', type='boolean', default=True),
    Field('datetime', type='datetime', default=datetime.datetime.utcnow(), requires=IS_DATETIME()),
    Field('line_number', type='integer'),
    Field('post_text', requires=IS_NOT_EMPTY()),
    Field('user_email', default=get_user_email()),
    Field('score', type='integer', default=0)
)
db.comment.id.readable = db.comment.id.writable = False
db.comment.user_id.readable = db.comment.user_id.writable = False
db.comment.song_id.readable = db.comment.song_id.writable = False
db.comment.datetime.writable = False


db.define_table('thumbs',
                Field('user_email', default = get_user_email()),
                Field('comment_id', 'reference comment'),
                Field('rating', 'integer', default = 0)
                )


db.commit()
