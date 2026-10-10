const products = [
    {id:1, name:'Куртка с капюшоном', category:'jackets', price:42900, image:'jacket.jpg', look:'jacket-look.jpg', sizes:['S','M','L','XL'], description:'Свободный силуэт, графитовый оттенок и выразительные детали.'},
    {id:2, name:'Джинсовая куртка', category:'jackets', price:39900, image:'denim-jacket.jpg', sizes:['S','M','L','XL'], description:'Голубой деним и лаконичный крой для повседневных образов.'},
    {id:3, name:'Кожаная куртка CK', category:'jackets', price:64900, image:'leather-jacket.jpg', sizes:['S','M','L','XL'], description:'Чёрная куртка на молнии. Акцентная вещь для твоей коллекции.'},
    {id:4, name:'Джинсы из голубого денима', category:'jeans', price:32900, image:'jeans.jpg', sizes:['26','28','30','32','34'], description:'Свободная посадка, светлый деним и потёртые детали.'},
    {id:5, name:'Камуфляжные джинсы', category:'jeans', price:36900, image:'camo-jeans.jpg', look:'camo-look.jpg', sizes:['26','28','30','32','34'], description:'Широкий силуэт и камуфляжный принт, вдохновлённый сценическими образами.'},
    {id:6, name:'Футболка CK', category:'tshirts', price:18900, image:'tshirt.jpg', sizes:['XS','S','M','L','XL'], description:'Чёрная футболка с небольшим логотипом. Простая основа любимого образа.'},
    {id:7, name:'GOLDEN — альбом', category:'albums', price:24900, image:'album.jpg', sizes:['SHINE','SOLID','SUBSTANCE'], description:'Первый сольный альбом Jungkook. Выбери издание для своей коллекции.'},
    {id:8, name:'Кольцо Graff', category:'accessories', price:12900, image:'ring.jpg', sizes:['16','17','18','19'], description:'Геометричные линии и золотистый оттенок. Цена указана для макета каталога.'},
    {id:9, name:'Браслет Graff', category:'accessories', price:19900, image:'bracelet.webp', sizes:['Единый'], description:'Тонкий браслет с геометричным узором. Цена указана для макета каталога.'}
];

const categories = {jackets:'Куртки', jeans:'Джинсы', tshirts:'Футболки', albums:'Альбомы', accessories:'Аксессуары'};
const productList = document.querySelector('#products');
const productDialog = document.querySelector('#product-dialog');
const cartDialog = document.querySelector('#cart-dialog');
const imagePath = '/static/img/';
let currentProduct = null;
let cart = [];
let lastFocus = null;
let messageTimer;

try {
    const saved = JSON.parse(localStorage.getItem('jkcollection-cart') || '[]');
    if (Array.isArray(saved)) {
        cart = saved.filter(function(item){
            const product = products.find(product => product.id === item?.id);
            return product && product.sizes.includes(item.size) && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99;
        }).slice(0,100);
    }
} catch(error) {
    cart = [];
}

function price(value){
    return new Intl.NumberFormat('ru-RU').format(value) + ' ₸';
}

function showMessage(text){
    const message = document.querySelector('#cart-message');
    message.textContent = text;
    message.classList.add('show');
    clearTimeout(messageTimer);
    messageTimer = setTimeout(function(){ message.classList.remove('show'); }, 2600);
}

function saveCart(){
    try {
        localStorage.setItem('jkcollection-cart', JSON.stringify(cart));
    } catch(error) {
        showMessage('Браузер не разрешает сохранение. Корзина доступна до обновления страницы.');
    }
    updateCartCount();
}

function updateCartCount(){
    const count = cart.reduce((total,item) => total + item.quantity, 0);
    document.querySelectorAll('.cart-count, .cart-total-count').forEach(function(item){
        item.textContent = '(' + count + ')';
    });
}

function openDialog(dialog){
    if (!document.querySelector('dialog[open]')) lastFocus = document.activeElement;
    document.querySelectorAll('dialog[open]').forEach(function(item){ item.close(); });
    dialog.showModal();
    document.body.classList.add('dialog-open');
}

function closeDialog(dialog){
    dialog.close();
}

document.querySelectorAll('dialog').forEach(function(dialog){
    dialog.querySelectorAll('[data-close]').forEach(function(button){
        button.addEventListener('click', function(){ closeDialog(dialog); });
    });
    dialog.addEventListener('click', function(event){
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog);
    });
    dialog.addEventListener('close', function(){
        if (!document.querySelector('dialog[open]')) {
            document.body.classList.remove('dialog-open');
            if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
        }
    });
});

function showProduct(id){
    currentProduct = products.find(product => product.id === id);
    if (!currentProduct) return;
    document.querySelector('#product-title').textContent = currentProduct.name;
    document.querySelector('#product-price').textContent = price(currentProduct.price);
    document.querySelector('#product-description').textContent = currentProduct.description;
    document.querySelector('#product-category').textContent = categories[currentProduct.category];
    document.querySelector('#product-image').src = imagePath + currentProduct.image;
    document.querySelector('#product-image').alt = currentProduct.name;
    document.querySelector('#size-label').textContent = currentProduct.category === 'albums' ? 'Издание' : 'Размер';
    document.querySelector('#product-sizes').innerHTML = currentProduct.sizes.map(function(size,index){
        return '<label class="size-option"><input type="radio" name="product-size" value="' + size + '" ' + (index === 0 ? 'checked' : '') + '><span>' + size + '</span></label>';
    }).join('');
    openDialog(productDialog);
}

function renderProducts(category,sort){
    let list = products.filter(product => category === 'all' || product.category === category);
    if (sort === 'price-low') list.sort((a,b) => a.price - b.price);
    if (sort === 'price-high') list.sort((a,b) => b.price - a.price);
    productList.innerHTML = list.map(function(product){
        const look = product.look ? '<img class="product-look" src="' + imagePath + product.look + '" alt="" loading="lazy"><span class="look-mark" aria-hidden="true">JK LOOK ↗</span>' : '';
        return '<article class="product-card">' +
            '<button class="product-open" type="button" data-product="' + product.id + '" aria-label="Открыть: ' + product.name + '">' +
            '<span class="product-picture"><img src="' + imagePath + product.image + '" alt="' + product.name + '" loading="lazy">' + look + '</span></button>' +
            '<div class="product-meta"><div><h3>' + product.name + '</h3><p>' + price(product.price) + '</p></div>' +
            '<button class="product-plus" type="button" data-product="' + product.id + '" aria-label="Выбрать размер: ' + product.name + '">+</button></div></article>';
    }).join('');
    document.querySelector('#product-count').textContent = list.length + ' из ' + products.length;
    document.querySelectorAll('[data-category]').forEach(function(button){
        const selected = button.dataset.category === category;
        button.classList.toggle('active', selected);
        button.setAttribute('aria-pressed', selected);
    });
}

if (productList) {
    const params = new URLSearchParams(location.search);
    let category = params.get('category') || 'all';
    if (!(category in categories)) category = 'all';
    const sort = document.querySelector('#product-sort');
    renderProducts(category,sort.value);
    document.querySelectorAll('[data-category]').forEach(function(button){
        button.addEventListener('click',function(){
            category = button.dataset.category;
            renderProducts(category,sort.value);
            const url = new URL(location.href);
            if (category === 'all') url.searchParams.delete('category');
            else url.searchParams.set('category',category);
            history.replaceState(null,'',url);
        });
    });
    sort.addEventListener('change',function(){ renderProducts(category,sort.value); });
    productList.addEventListener('click',function(event){
        const button = event.target.closest('[data-product]');
        if (button) showProduct(Number(button.dataset.product));
    });
}

document.querySelector('#add-to-cart').addEventListener('click',function(){
    if (!currentProduct) return;
    const size = document.querySelector('input[name="product-size"]:checked')?.value;
    if (!currentProduct.sizes.includes(size)) return;
    const item = cart.find(item => item.id === currentProduct.id && item.size === size);
    if (item) item.quantity = Math.min(99,item.quantity + 1);
    else cart.push({id:currentProduct.id,size:size,quantity:1});
    saveCart();
    closeDialog(productDialog);
    showMessage('Добавлено в корзину');
});

function renderCart(){
    const container = document.querySelector('#cart-items');
    document.querySelector('#cart-summary').hidden = cart.length === 0;
    if (!cart.length) {
        container.innerHTML = '<div class="cart-empty"><p>Пока здесь пусто</p><p>Самое время найти вещь,<br>которая станет твоей.</p></div>';
        return;
    }
    container.innerHTML = cart.map(function(item,index){
        const product = products.find(product => product.id === item.id);
        return '<div class="cart-row"><img src="' + imagePath + product.image + '" alt="' + product.name + '">' +
            '<div><h3>' + product.name + '</h3><p>' + (product.category === 'albums' ? 'Издание ' : 'Размер ') + item.size + '</p><strong>' + price(product.price * item.quantity) + '</strong>' +
            '<div class="cart-row-actions"><div class="quantity">' +
            '<button type="button" data-action="minus" data-index="' + index + '" aria-label="Уменьшить количество: ' + product.name + '"' + (item.quantity === 1 ? ' disabled' : '') + '>−</button>' +
            '<span>' + item.quantity + '</span><button type="button" data-action="plus" data-index="' + index + '" aria-label="Увеличить количество: ' + product.name + '"' + (item.quantity === 99 ? ' disabled' : '') + '>+</button></div>' +
            '<button class="remove-item" type="button" data-action="remove" data-index="' + index + '">Удалить</button></div></div></div>';
    }).join('');
    const total = cart.reduce(function(total,item){
        const product = products.find(product => product.id === item.id);
        return total + product.price * item.quantity;
    },0);
    document.querySelector('#cart-total').textContent = price(total);
}

document.querySelectorAll('[data-open-cart]').forEach(function(button){
    button.addEventListener('click',function(){
        renderCart();
        openDialog(cartDialog);
    });
});

document.querySelector('#cart-items').addEventListener('click',function(event){
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const index = Number(button.dataset.index);
    const item = cart[index];
    if (!item) return;
    if (button.dataset.action === 'plus') item.quantity = Math.min(99,item.quantity + 1);
    if (button.dataset.action === 'minus') item.quantity = Math.max(1,item.quantity - 1);
    if (button.dataset.action === 'remove') cart.splice(index,1);
    saveCart();
    renderCart();
    const next = document.querySelector('[data-action="' + button.dataset.action + '"][data-index="' + index + '"]:not(:disabled)');
    if (next) next.focus();
    else cartDialog.querySelector('[data-close]').focus();
});

document.querySelectorAll('[data-password]').forEach(function(button){
    button.addEventListener('click',function(){
        const input = document.getElementById(button.dataset.password);
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        button.setAttribute('aria-pressed',show);
        button.setAttribute('aria-label',show ? 'Скрыть пароль' : 'Показать пароль');
    });
});

document.querySelectorAll('.notice-close').forEach(function(button){
    button.addEventListener('click',function(){ button.closest('.notice').remove(); });
});

const menuButton = document.querySelector('.menu-button');
menuButton.addEventListener('click',function(){
    const nav = document.querySelector('#header-nav');
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded',open);
});
updateCartCount();
