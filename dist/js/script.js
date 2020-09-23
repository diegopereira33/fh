var hasContent = false;
var ordersEl = document.getElementById('orders');
var orderDetailEl = document.getElementById('orderDetail');
var noContentEl = document.getElementById('noContent');
var notSelectedEl = document.getElementById('notSelected');
var orders = [ ];

function getOrders() {
  ordersEl.innerHTML = '';

  var request = new XMLHttpRequest();
  request.open('GET', '../../infra/data.json', true);
  request.onload = function() {
    if(request.status === 200) {
      orders = JSON.parse(this.response);
      if(orders.length > 0) {
        orders.forEach(function(order) {
          appendOrdersList(order);
          updateBindings();
        });
        hasContent = true;
        toggleNoContentBlock();
        notSelectedEl.style.display = 'block';
      } else {
        hasContent = false;
        toggleNoContentBlock();
      }
    } else {
      console.log('Ocorreu um erro: ' + request.statusText);
    }
  };
  request.send();
}

function clearOrders() {
  ordersEl.innerHTML = '';
  hasContent = false;
  toggleNoContentBlock();
}

function appendOrdersList(orderObj) {
  ordersEl.style.display = 'block';
  ordersEl.insertAdjacentHTML('beforeend', `
  <li class="list-group-item item" data-orderid="${orderObj.id}">
      <h2 class="item__title">#${orderObj.id}</h2>
      <small class="item__subtitle">Cliente: ${orderObj.client.fullname}</h2>
    </li>
    `);
}

function updateBindings() {
  var listItems = document.querySelectorAll('.item');
  for(var i = 0; i < listItems.length; i++) {
    listItems[i].addEventListener('click', function(e) {
      appendOrderDetails(e.currentTarget.dataset.orderid);
    });
  }
}

function toggleNoContentBlock() {
  if(hasContent) {
    noContentEl.style.display = 'none';
  } else {
    noContentEl.style.display = 'block';
  }
}

function appendOrderDetails(orderId) {
  orderDetailEl.innerHTML = '';
  notSelectedEl.style.display = 'none';
  orderDetailEl.style.display = 'block';
  var order = {};
  for(var i = 0; i < orders.length; i++) {
    if(orders[i].id == orderId) {
      order = orders[i];
      orderDetailEl.insertAdjacentHTML('beforeend', `
        <div class="card-header">Pedido #${order.id}</div>
        <div class="card-body">
          <div class="order">
            <div class="row">
              <div class="col-md-2 order__client">
                <ul>
                  <li>Cliente:</li>
                  <li>CPF/CNPJ:</li>
                  <li>Endereço:</li>
                </ul>
              </div>
              <div class="col-md-10 order__details">
                <ul>
                  <li>${order.client.fullname}</li>
                  <li>${order.client.document}</li>
                  <li>${order.client.address.street}, ${order.client.address.number}</li>
                </ul>
              </div>
            </div>
            <div class="row">
              <div class="col-md-12 order__table">
                <table class="table table-borderless">
                  <thead>
                    <tr>
                      <th scope="col">Produto</th>
                      <th scope="col">Descrição</th>
                      <th scope="col">Quantidade</th>
                      <th scope="col">Unidade</th>
                      <th scope="col">Preço</th>
                      <th scope="col">Total</th>
                    </tr>
                  </thead>
                  <tbody id="productsTable">
                    
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      `);
    }
  }

  var orderTotal = 0;
  var productsTableEl = document.getElementById('productsTable');

  for(var j = 0; j < order.products.length; j++) {
    var price = order.products[j].unityPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 , style: 'currency', currency: 'BRL' });
    var itemTotal = order.products[j].unityPrice * order.products[j].quantity;
    var itemTotalStr = itemTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 , style: 'currency', currency: 'BRL' });
    orderTotal = orderTotal + itemTotal;
    productsTableEl.insertAdjacentHTML('beforeend', `
      <tr>
        <td>${order.products[j].code}</td>
        <td>${order.products[j].description}</td>
        <td>${order.products[j].quantity}</td>
        <td>${order.products[j].unityType}</td>
        <td>${price}</td>
        <td>${itemTotalStr}</td>
      </tr>
    `);
  }

  productsTableEl.insertAdjacentHTML('beforeend', `
    <tr>
      <td></td>
      <th>Total</th>
      <td></td>
      <td></td>
      <td></td>
      <th>${orderTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 , style: 'currency', currency: 'BRL' })}</th>
    </tr>
  `);
}