



module.exports = function(app) {
    app.get('/hello/:pubukprn/Course/:kisCourseId/:kisMode', function (req, res, next) {
      //res.send('Hello World!');
      request({
          url: "https://data.unistats.ac.uk/api/v3/KIS/Institution/" + req.params.pubukprn + "/Course/" + req.params.kisCourseId + "/" + req.params.kisMode + ".json"
              ///Institution/{pubukprn}/Course/{kisCourseId}/{kisMode}.{format}
              ///hello/:pubukprn/Course/:kisCourseId/:kisMode

          , headers: {
              "Authorization": authenticationHeader
          }
      }, function (error, response, body) {
          console.log(body);
          res.send(body);
      });
      //next();
  });
};
