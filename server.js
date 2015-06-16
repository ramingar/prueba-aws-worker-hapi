var fs = require('fs');
var config = fs.readFileSync('app_config.json', 'utf8');
config = JSON.parse(config);


var AWS = require('aws-sdk'),
  sqs = {},
  Hapi = require('hapi'),
  server = new Hapi.Server();

//server.connection({ host: 'localhost', port: '3000' });
server.connection({ port: config.PORT });

/* **** FUNCIONES SQS ********************** */
function sendSqsMessage(queue, message) {
  'use strict';

  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: config.AWS_REGION
  });

  //sqs = new AWS.SQS(paramsCola);
  sqs = new AWS.SQS();

  /*
  var mensajeBody = {
    "to": "rminguet@gmail.com",
    "from": "rminguet@gmail.com",
    "cuerpo": "este es el cuerpo",
    "asunto": "este es el asunto"
  };
  */

  console.log('*********************1');

  console.log('---->' + message);
  server.log('info', message);

  console.log('*********************2');

  var params = {
    //MessageBody: '{"name":"' + sender + '"}',
    MessageBody: message,
    QueueUrl: 'https://sqs.' + config.AWS_REGION + '.amazonaws.com/921644418190/' + queue,
    DelaySeconds: 0
  };

  console.log('*********************3');

  sqs.sendMessage(params, function (err, data) {
    if (err) {
      server.log('ERROR!!', err.stack);
    } else {
      server.log('info', 'YAY!!, mensaje enviado a ' + queue + '!');
    }
  });
  console.log('*********************4');
}
/* **** END: FUNCIONES SQS ***************** */

/* **** RUTAS ****************************** */
server.route({
  method: 'GET',
  path: '/',
  handler: function (request, response) {
    response('HoooOOOooolaaaAAAaaa sueeeEEEeeelooOOOooo!\n');
  }
});

server.route({
  method: 'GET',
  path: '/{name}',
  handler: function (request, response) {
    sendSqsMessage(
      encodeURIComponent(request.params.name),
      request.payload
    );
    response('Your message ' + encodeURIComponent(request.params.name) + ' has been sent to queue!');
  }
});
/* **** END: RUTAS ************************** */

/* **** MONITORES *************************** */
// lista de reporters en los que saldra el resultado de la monitorizacion
var options = {
  opsInterval: 1000,
  reporters: [{
    reporter: require('good-console'),
    events: { log: '*', response: '*' }
  }]
};

// registro los eventos a los que escucho
server.register({ register: require('good'), options: options }, function (err) {
  if (err) {
    console.error(err); // error al tratar de cargar el plugin Good
  } else {
    server.start(function () {
      server.log('info', 'Servidor escuchando en: ' + server.info.uri);
    });
  }

});
/* **** END: MONITORES *********************** */