# accounts-oidc

[OpenID Connect](https://openid.net/connect/) login handler for [Meteor](https://www.meteor.com/)


## API

On the server side, configure an OIDC service as follows:

```
ServiceConfiguration.configurations.upsert {
  service: 'my-OIDC'
}, {
  $set: {
    clientId: 'CLIENT_ID',
    secret: 'SUPERSECURESECRET',
    serverUrl: 'http://localhost:5000',
    authorizationEndpoint: '/oidc/auth',
    loginStyle: 'redirect',
    tokenEndpoint: '/oidc/token',
    userinfoEndpoint: '/oidc/userinfo',
    requestPermissions: ['openid', 'profile', 'email', 'groups', 'offline_access'],
    idTokenWhitelistFields: ['name', 'groups', 'email']
  }
}  

Oidc.registerServer('my-OIDC')
Oidc.registerOidcService('my-OIDC')
```

On the client side, configure an OIDC service as follows:

```
Oidc.registerClient('my-OIDC')
Oidc.registerOidcService('my-OIDC')
```
