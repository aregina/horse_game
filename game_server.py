from aiohttp import web
import socketio
import os

SCORE = 0
USERS_NUMBER = 0

"""
    How to deploy changes:
    1. commit all changes to local git repository
    2. git push heroku master
    3. heroku ps:scale web=1
    4. heroku open or open https://vast-citadel-39030.herokuapp.com/
    5. if you need to check logs - use "heroku logs" command

    TODO:
    1. Collective score
    2. Number of users
    3. Start screen with "Join" button
    4. Finish screen
    5. 1-2-3-GO!

"""

PORT = int(os.environ.get('PORT'))

sio = socketio.AsyncServer()
app = web.Application()
sio.attach(app)

async def index(request):
    """Serve the client-side application."""
    with open('game/index.html') as f:
        return web.Response(text=f.read(), content_type='text/html')

@sio.on('connect')
async def connect(sid, environ):
    global USERS_NUMBER
    global SCORE
    USERS_NUMBER += 1
    await sio.emit('users_number', {'data': USERS_NUMBER, 'score': SCORE})
    print('user {} connected'.format(sid))


@sio.on('score_update')
async def score_update(sid, message):
    print('message', message)
    global SCORE
    if message['data'] == 'increment':
        SCORE += 1
    elif message['data'] == 'decrement':
        SCORE -= 1
    await sio.emit('score', {'data': SCORE})

# @sio.on('chat message')
# async def message(sid, data):
#     print("message ", data)
#     await sio.emit('reply', room=sid)

@sio.on('disconnect')
async def disconnect(sid):
    global USERS_NUMBER
    USERS_NUMBER -= 1
    await sio.emit('users_number', {'data': USERS_NUMBER})
    print('user {} disconnected'.format(sid))

app.router.add_static('/assets', 'game/assets')
app.router.add_static('/game', 'game')
app.router.add_get('/', index)

if __name__ == '__main__':
    web.run_app(app, port=PORT)

