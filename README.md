# accounts-oidc

[OpenID Connect](https://openid.net/connect/) login handler for [Meteor](https://www.meteor.com/)

This is a fork from <https://github.com/switch-ch/meteor-accounts-oidc>.


## API

On the server side, configure an OIDC service as follows:

```
ServiceConfiguration.configurations.upsert({
  service: 'myoidc'
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
});

Oidc.registerServer('myoidc');
Oidc.registerOidcService('myoidc');
```

On the client side, configure an OIDC service as follows:

```
Oidc.registerClient('myoidc');
Oidc.registerOidcService('myoidc');
```

Keep in mind to use a service name, that capitalizes well.
