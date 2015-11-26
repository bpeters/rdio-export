var express = require('express');
var app = express();

var config = require('config');

var rdioConfig = {
  clientId: process.env.RDIO_ID || config.get('Rdio').clientId,
  clientSecret: process.env.RDIO_SECRET || config.get('Rdio').clientSecret,
}

var Rdio = require('rdio')({
  rdio: rdioConfig
});

var rdio = new Rdio(/* tokens, config*/);

app.get('/', function (req, res) {
  res.send('<a href="/auth">Login here</a>');
});

app.get('/auth', function (req, res) {
  if (!req.query.code) {
    return res.redirect('https://www.rdio.com/oauth2/authorize?response_type=code&client_id='+rdioConfig.clientId+'&redirect_uri=http://localhost:3000/auth');
  }

  rdio.getAccessToken({
    code: req.query.code,
    redirect: 'http://localhost:3000/auth'
  }, function(err) {
    if (err) {
      return res.send(err);
    }

    res.redirect('/user');
  });
});

app.get('/user', function (req, res) {
  rdio.request({
    method: 'currentUser'
  }, function(err, response) {
    if (err) {
      return res.send(err);
    }
    res.send('<a href="/favorites">Favorites</a></br><a href="/playlists">Playlists</a>');
  });
});

app.get('/favorites', function (req, res) {
  rdio.request({
    method: 'getFavorites',
    start: 0,
    count: 100000,
  }, function(err, response) {
    if (err) {
      return res.send(err);
    }

    res.send(response);
  });
});

app.get('/playlists', function (req, res) {
  rdio.request({
    method: 'getPlaylists',
    extras: ['tracks']
  }, function(err, response) {
    if (err) {
      return res.send(err);
    }

    res.send(response);
  });
});

app.get('/lastPlayed', function (req, res) {
  rdio.getClientToken(function(err) {
    if (err) {
      return res.send(err);
    }

    rdio.request({
      method: 'findUser',
      vanityName: 'BrennenPeters',
      extras: 'lastSongPlayed'
    }, false, function(err, response) {
      if (err) {
        return res.send(err);
      }

      res.send(response);
    });
  });
});

var server = app.listen(3000, function () {
  var port = server.address().port;

  console.log('Example app listening at http://localhost:%s', port);
});