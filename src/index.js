const express = require('express');
const { v4: uuidV4 } = require('uuid');

const app = express();

app.use(express.json());

const customers = [];

//Middleware
function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find(customer => customer.cpf === cpf);

  if(!customer) { 
    return response.status(400).json({error: 'Customer not found!'}); 
  }

  request.customer = customer;

  next();
}

//Routes
app.post('/account', (request, response) => {
  const { cpf, name } = request.body;

  const customerAlredyExists = customers.some(
    customer => customer.cpf === cpf
  );

  if(customerAlredyExists) { 
    return response.status(400).json({error: 'Constumer already exists!'});
  };

  customers.push({
    cpf,
    name,
    id: uuidV4(),
    statement: [],
  });

  response.status(201).send();
});

app.get('/statement', verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;

  return response.status(200).json(customer.statement);
});


//Server
app.listen(3333)