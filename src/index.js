const express = require('express');

const app = express();

app.use(express.json());

app.post('/account', (request, response) => {
  const cpf = request.body.cpf;
});

app.listen(3333)