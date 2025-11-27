// 1. Hàm phụ trợ: Lấy tên key dựa trên người đang đăng nhập
const getCartKey = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            // Nếu đã đăng nhập, lưu vào giỏ riêng: ví dụ 'cart_admin', 'cart_teonv'
            return `cart_${user.username}`; 
        } catch (e) {
            return 'cart_guest';
        }
    }
    // Nếu chưa đăng nhập, lưu vào giỏ khách vãng lai
    return 'cart_guest';
};

// 2. Các hàm chính (Đã sửa để dùng Dynamic Key)

export const getCart = () => {
    const key = getCartKey(); // <--- Lấy key động
    const cart = localStorage.getItem(key);
    return cart ? JSON.parse(cart) : [];
};

export const addToCart = (product) => {
    const key = getCartKey(); // <--- Lấy key động
    let cart = getCart(); // Hàm này đã tự lấy đúng key rồi
    
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    // Lưu vào đúng key của người đó
    localStorage.setItem(key, JSON.stringify(cart));
    
    window.dispatchEvent(new Event('storage'));
};

export const updateQuantity = (productId, newQuantity) => {
    const key = getCartKey();
    let cart = getCart();
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity = newQuantity;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== productId);
        }
    }
    
    localStorage.setItem(key, JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
};

export const removeFromCart = (productId) => {
    const key = getCartKey();
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem(key, JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
};

export const clearCart = () => {
    const key = getCartKey();
    localStorage.removeItem(key);
    window.dispatchEvent(new Event('storage'));
};