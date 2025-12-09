// 1. Lấy key giỏ hàng động theo user
const getCartKey = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            return `cart_${user.username}`;
        } catch {
            return 'cart_guest';
        }
    }
    return 'cart_guest';
};

// 2. Hàm getCart AN TOÀN 100% (KHÔNG BAO GIỜ LỖI .map)
export const getCart = () => {
    const key = getCartKey();
    const raw = localStorage.getItem(key);

    try {
        const cart = JSON.parse(raw);
        return Array.isArray(cart) ? cart : [];
    } catch {
        return [];
    }
};

// 3. Add to cart
export const addToCart = (product) => {
    const key = getCartKey();
    let cart = getCart();

    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem(key, JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
};

// 4. Update quantity
export const updateQuantity = (productId, newQuantity) => {
    const key = getCartKey();
    let cart = getCart();

    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity = newQuantity;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== productId);
        }
    }

    localStorage.setItem(key, JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
};

// 5. Remove item
export const removeFromCart = (productId) => {
    const key = getCartKey();
    let cart = getCart().filter(item => item.id !== productId);
    localStorage.setItem(key, JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
};

// 6. Clear cart
export const clearCart = () => {
    const key = getCartKey();
    localStorage.removeItem(key);
    window.dispatchEvent(new Event('storage'));
};
