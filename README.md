# cf-chat-websocket
This is NodeJS + Cloud Foundry + Redis + WebSocket chatroom.

## Start
```
cf create-service rediscloud 25mb redis
cf push
```

## Access
```
https://cf-chat-websocket-${random-word}.cfapps.io
```
