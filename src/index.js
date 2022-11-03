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

//Service
function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if(operation.type === 'credit') {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);

  return balance;
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

app.post('/deposit', verifyIfExistsAccountCPF, (request, response) => {
  const { description, amount } = request.body;

  const { customer } = request;

  const systemOperations = {
    description, 
    amount,
    createdAt: new Date(),
    type: 'credit',
  }

  customer.statement.push(systemOperations);

  return response.status(200).json();
});

app.post('/withdraw', verifyIfExistsAccountCPF, (request, response) => {
  const { amount } = request.body;
  const { customer } = request;

  const balance = getBalance(customer.statement);

  if(balance < amount) {
    return response.status(400).json({error: 'Inssufficient found!'});
  }

  const systemOperations = {
    amount,
    createdAt: new Date(),
    type: 'debit',
  }

  customer.statement.push(systemOperations);

  return response.status(201).send();
});

app.get('/statement/date', verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  const { date } = request.query;

  const dateFormat = new Date(date + " 00:00");
  const statement = customer.statement.filter(
    (statement) => 
    statement.createdAt.toDateString() === new Date(dateFormat).toDateString()
  );

  return response.json(statement);
});

app.put('/account', verifyIfExistsAccountCPF, (request, response) => {
  const { name } = request.body;
  const { customer } = request;

  customer.name = name;

  return response.status(201).send();
});

app.get('/account', verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;

  return response.json(customer);
});

app.delete('/account', verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;

  customers.splice(customer, 1);

  return response.status(204).send();
});

app.get('/balance', verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;

  const balance = getBalance(customer.statement);

  return response.json(balance);
});

//Server
app.listen(3335);