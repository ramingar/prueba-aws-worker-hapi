/**
 * Created by rafael on 07/06/15.
 */
// TODO: refactorizar codigo y usar variables en archivos de configuracion

var AWS = require('aws-sdk'),
  awsRegion = 'us-west-2',
  sqs = {},
  Hapi = require('hapi'),
  server = new Hapi.Server();

//server.connection({ host: 'localhost', port: '3000' });
server.connection({ port: '8081' });

/* **** FUNCIONES SQS ********************** */
function sendSqsMessage(sender) {
  'use strict';

  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: awsRegion
  });

  /*
  var paramsCola = {
    endpoint: "/enviar_email"
  }
  */

  //sqs = new AWS.SQS(paramsCola);
  sqs = new AWS.SQS();

  var mensajeBody = {
    "to": "rminguet@gmail.com",
    "from": "rminguet@gmail.com",
    "cuerpo": "este es el cuerpo",
    "asunto": "este es el asunto"
  };

  var params = {
    //MessageBody: '{"name":"' + sender + '"}',
    MessageBody: mensajeBody,
    QueueUrl: 'https://sqs.us-west-2.amazonaws.com/921644418190/cola_prueba',
    DelaySeconds: 0
  };

  sqs.sendMessage(params, function (err, data) {
    if (err) {
      console.log(err, err.stack);
    } else {
      console.log('YAY!!, mensaje enviado por ' + sender + '!');
    }
  });
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
    sendSqsMessage(encodeURIComponent(request.params.name));
    response('Your message ' + encodeURIComponent(request.params.name) +
        ' has been sent to queue!');
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
  }
  /* mas reporters... */
  /*, {
    reporter: require('good-file'),
    events: { ops: '*' },
    config: './test/fixtures/awesome_log'
  }, {
    reporter: 'good-http',
    events: { error: '*' },
    config: {
      endpoint: 'http://prod.logs:3000',
      wreck: {
        headers: { 'x-api-key' : 12345 }
      }
    }
  }*/
  ]
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