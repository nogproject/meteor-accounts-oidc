Oidc = {};

function createServiceRegistrationFunction(service) {
  return function(query) {
    var debug = false;
    var token = getToken(service, query);

    var accessToken = token.access_token;
    var expiresAt = (+new Date) + (1000 * parseInt(token.expires_in, 10));

    var userinfo = getUserInfo(service, accessToken);
    if (debug) console.log('XXX: userinfo:', userinfo);

    var serviceData = {};
    serviceData.id = userinfo.id || userinfo.sub;
    serviceData.username = userinfo.username || userinfo.preferred_username;
    serviceData.accessToken = OAuth.sealSecret(accessToken);
    serviceData.expiresAt = expiresAt;
    serviceData.email = userinfo.email;

    var tokenContent = getTokenContent(token.id_token);
    if(tokenContent) {
      var fields = _.pick(tokenContent, getConfiguration(service).idTokenWhitelistFields);
      _.extend(serviceData, fields);
    }

    if (token.refresh_token)
      serviceData.refreshToken = token.refresh_token;
    if (debug) console.log('XXX: serviceData:', serviceData);

    var profile = {};
    profile.name = userinfo.name;
    profile.email = userinfo.email;
    if (debug) console.log('XXX: profile:', profile);

    return {
      serviceData: serviceData,
      options: { profile: profile }
    };
  };
};

var userAgent = "Meteor";
if (Meteor.release) {
  userAgent += "/" + Meteor.release;
}

function getToken(service, query) {
  var debug = false;
  var config = getConfiguration(service);
  var serverTokenEndpoint = config.serverUrl + config.tokenEndpoint;
  var response;

  try {
    response = HTTP.post(
      serverTokenEndpoint,
      {
        headers: {
          Accept: 'application/json',
          "User-Agent": userAgent
        },
        params: {
          code:           query.code,
          client_id:      config.clientId,
          client_secret:  OAuth.openSecret(config.secret),
          redirect_uri:   OAuth._redirectUri(service, config),
          grant_type:     'authorization_code',
          state:          query.state
        }
      }
    );
  } catch (err) {
    throw _.extend(new Error("Failed to get token from " + service + " " + serverTokenEndpoint + ": " + err.message),
                   {response: err.response});
  }
  if (response.data.error) {
    // if the http response was a json object with an error attribute
    throw new Error("Failed to complete handshake with " + service + " " + serverTokenEndpoint + ": " + response.data.error);
  } else {
    if (debug) console.log('XXX: getToken response: ', response.data);
    return response.data;
  }
};

function getUserInfo(service, accessToken) {
  var debug = false;
  var config = getConfiguration(service);
  var serverUserinfoEndpoint = config.serverUrl + config.userinfoEndpoint;
  var response;
  try {
    response = HTTP.get(
      serverUserinfoEndpoint,
      {
        headers: {
          "User-Agent": userAgent,
          "Authorization": "Bearer " + accessToken
        }
      }
    );
  } catch (err) {
    throw _.extend(new Error("Failed to fetch userinfo from " + service + " " + serverUserinfoEndpoint + ": " + err.message),
                   {response: err.response});
  }
  if (debug) console.log('XXX: getUserInfo response: ', response.data);
  return response.data;
};

function getConfiguration(service) {
  var config = ServiceConfiguration.configurations.findOne({ service: service });
  if (!config) {
    throw new ServiceConfiguration.ConfigError('Service ' + service + ' not configured.');
  }
  return config;
};

function getTokenContent(token) {
  var content = null;
  if (token) {
    try {
      var parts = token.split('.');
      var header = JSON.parse(new Buffer(parts[0], 'base64').toString());
      content = JSON.parse(new Buffer(parts[1], 'base64').toString());
      var signature = new Buffer(parts[2], 'base64');
      var signed = parts[0] + '.' + parts[1];
    } catch (err) {
      this.content = {
        exp: 0
      };
    }
  }
  return content;
};

Oidc.registerServer = function registerServer(idp) {
  Oidc[idp] = {};
  OAuth.registerService(idp, 2, null, createServiceRegistrationFunction(idp));

  Oidc[idp].retrieveCredential = function retrieveCredential(credentialToken, credentialSecret) {
    return OAuth.retrieveCredential(credentialToken, credentialSecret);
  };
};
