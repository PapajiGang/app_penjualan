document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');
    const cartCount = document.getElementById('cart-count');
    const toastContainer = document.getElementById('toast-container');

    // Modal produk
    const modal = document.getElementById('productModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalImage = document.getElementById('modal-image');
    const modalCategory = document.getElementById('modal-category');
    const modalProductName = document.getElementById('modal-product-name');
    const modalPrice = document.getElementById('modal-price');
    const modalDescription = document.getElementById('modal-description');
    const modalAddToCartBtn = document.getElementById('modal-add-to-cart');

    // Modal keranjang
    const cartModal = document.getElementById('cartModal');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const orderBtn = document.getElementById('orderBtn');
    const cartIcon = document.querySelector('.fa-shopping-cart');

    // Form checkout
    const checkoutForm = document.getElementById('checkout-form');
    const customerName = document.getElementById('customer-name');
    const customerPhone = document.getElementById('customer-phone');
    const customerAddress = document.getElementById('customer-address');

    // Sidebar kategori
    const categoryList = document.getElementById('category-list');
    const allCategoryBtn = document.getElementById('all-category');

    const WA_NUMBER = "62895710480899";
    let products = [], cart = [];
    let formVisible = false;

    // --- Fetch Produk ---
    async function fetchProducts() {
        loader.style.display = 'block';
        try {
            const res = await fetch('https://fakestoreapi.com/products');
            if (!res.ok) throw new Error("HTTP error");
            products = await res.json();
            displayProducts(products);
            renderCategories(); // tampilkan kategori
        } catch {
            errorMessage.classList.remove('hidden');
        } finally {
            loader.style.display = 'none';
        }
    }

    // --- Tampilkan Produk ---
    function displayProducts(list) {
        productGrid.innerHTML = '';
        list.forEach(p => {
            const card = document.createElement('div');
            card.className = 'product-card bg-white rounded-lg shadow-sm overflow-hidden flex flex-col cursor-pointer';
            card.dataset.productId = p.id;
            card.innerHTML = `
                <div class="p-4 h-48 flex items-center justify-center">
                    <img src="${p.image}" alt="${p.title}" class="max-h-full max-w-full object-contain">
                </div>
                <div class="p-4 border-t border-gray-200 flex flex-col flex-grow">
                    <span class="text-xs text-gray-500 capitalize">${p.category}</span>
                    <h3 class="text-md font-semibold text-gray-800 mt-1 flex-grow">${p.title.substring(0, 40)}...</h3>
                    <div class="mt-4 flex justify-between items-center">
                        <p class="text-lg font-bold text-blue-600">Rp ${Math.round(p.price * 15000).toLocaleString('id-ID')}</p>
                        <button class="add-to-cart-btn bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full w-9 h-9 flex items-center justify-center" data-id="${p.id}">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                    </div>
                </div>`;
            productGrid.appendChild(card);
        });
    }

    // --- Detail Produk Modal ---
    function showProductDetail(id) {
        const p = products.find(x => x.id == id);
        if (!p) return;
        modalImage.src = p.image;
        modalCategory.textContent = p.category;
        modalProductName.textContent = p.title;
        modalPrice.textContent = `Rp ${Math.round(p.price * 15000).toLocaleString('id-ID')}`;
        modalDescription.textContent = p.description;
        modalAddToCartBtn.dataset.id = p.id;
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function hideModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    // --- Keranjang ---
    function addToCart(id) {
        const p = products.find(x => x.id == id);
        if (p) { cart.push(p); updateCartCounter(); showToast(`${p.title.substring(0,20)}... ditambahkan!`); }
    }

    function updateCartCounter() { cartCount.textContent = cart.length; }

    function showToast(msg) {
        const t = document.createElement('div');
        t.className = 'toast-notification bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg';
        t.textContent = msg;
        toastContainer.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    }

    function renderCart() {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-gray-600 text-sm">Keranjang kosong.</p>';
            cartTotal.textContent = 'Rp 0';
            hideForm();
            return;
        }
        let total = 0;
        cartItemsContainer.innerHTML = cart.map((item, i) => {
            const price = Math.round(item.price * 15000);
            total += price;
            return `<div class="flex justify-between items-center border-b py-2">
                        <span class="text-sm flex-1">${item.title}</span>
                        <span class="text-blue-600 font-semibold mr-2">Rp ${price.toLocaleString('id-ID')}</span>
                        <button class="remove-btn text-red-500" data-index="${i}">❌</button>
                    </div>`;
        }).join('');
        cartTotal.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    }

    cartItemsContainer.addEventListener('click', e => {
        if (e.target.classList.contains('remove-btn')) {
            const idx = e.target.dataset.index;
            cart.splice(idx, 1);
            updateCartCounter();
            renderCart();
        }
    });

    // --- Cart Modal ---
    cartIcon.addEventListener('click', () => { 
        renderCart(); 
        cartModal.classList.remove('hidden'); 
        document.body.style.overflow = 'hidden'; 
        hideForm();
    });
    closeCartBtn.addEventListener('click', () => { cartModal.classList.add('hidden'); document.body.style.overflow = 'auto'; });
    cartModal.addEventListener('click', e => { if (e.target === cartModal) cartModal.classList.add('hidden'); });

    // --- Checkout ---
    orderBtn.addEventListener('click', () => {
        if (cart.length === 0) { showToast('Keranjang kosong!'); return; }
        if (!formVisible) { showForm(); } else { submitOrder(); }
    });

    function showForm() {
        checkoutForm.classList.remove('hidden');
        formVisible = true;
        orderBtn.textContent = 'Konfirmasi';
    }

    function hideForm() {
        checkoutForm.classList.add('hidden');
        formVisible = false;
        orderBtn.textContent = 'Isi Data';
    }

    function submitOrder() {
        const name = customerName.value.trim();
        const phone = customerPhone.value.trim();
        const address = customerAddress.value.trim();
        if (!name || !phone || !address) { showToast('Lengkapi data Anda!'); return; }

        let total = 0, msg = `Halo, saya ${name} ingin memesan:\n\n`;
        cart.forEach((item, i) => {
            const price = Math.round(item.price * 15000);
            total += price;
            msg += `${i+1}. ${item.title} - Rp ${price.toLocaleString('id-ID')}\n`;
        });
        msg += `\nTotal: Rp ${total.toLocaleString('id-ID')}\nNama: ${name}\nNo HP: ${phone}\nAlamat: ${address}`;
        window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');

        hideForm();
        cart = [];
        updateCartCounter();
        renderCart();
        customerName.value = '';
        customerPhone.value = '';
        customerAddress.value = '';
    }

    // --- Sidebar Kategori ---
    function renderCategories() {
        const categories = [...new Set(products.map(p => p.category))];
        categoryList.innerHTML = '';
        categories.forEach(cat => {
            const li = document.createElement('li');
            li.textContent = cat;
            li.className = 'cursor-pointer px-2 py-1 hover:bg-blue-100 rounded capitalize';
            li.addEventListener('click', () => filterByCategory(cat));
            categoryList.appendChild(li);
        });
    }

    function filterByCategory(category) {
        const filtered = products.filter(p => p.category === category);
        displayProducts(filtered);
    }

    allCategoryBtn.addEventListener('click', () => displayProducts(products));

    // --- Event Produk ---
    productGrid.addEventListener('click', e => {
        const addBtn = e.target.closest('.add-to-cart-btn');
        if (addBtn) { addToCart(addBtn.dataset.id); return; }

        const card = e.target.closest('.product-card');
        if (card) showProductDetail(card.dataset.productId);
    });

    modalAddToCartBtn.addEventListener('click', () => { addToCart(modalAddToCartBtn.dataset.id); hideModal(); });
    closeModalBtn.addEventListener('click', hideModal);

    // --- Init ---
    fetchProducts();
});
