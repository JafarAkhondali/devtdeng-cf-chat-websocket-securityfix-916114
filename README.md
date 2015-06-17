# cf-chat-websocket
This is NodeJS + Cloud Foundry + Redis + WebSocket chatroom.

## Start
```
cf create-service rediscloud 25mb redis
cf create-service cloudamqp lemur rabbitmq
cf push
```

## Access
```
https://cf-chat-websocket-${random-word}.cfapps.io
```

## TODO
- RabbitMQ as Message Queue
- Redis for persistent data
- Mulitple chatroom
- Push Notification
- iOS Client App
