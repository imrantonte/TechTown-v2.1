import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'react-toastify'; // <-- Brought the toast in!

export const useCartStore = create((set, get) => ({
    cart: [],
    isLoading: false,

    fetchCart: async () => {
        set({ isLoading: true });
        try {
            const res = await axios.get('/api/cart');
            set({ cart: res.data.items || [], isLoading: false });
        } catch (error) {
            console.error("Failed to fetch cart:", error);
            set({ cart: [], isLoading: false });
        }
    },

    addToCart: async (product) => {
        try {
            const payload = {
                productId: product._id,
                name: product.name,
                image: product.image,
                price: product.price,
                quantity: 1
            };
            
            const res = await axios.post('/api/cart', payload);
            set({ cart: res.data.items });
            toast.success(`${product.name} added to cart!`); // <-- TOAST RESTORED!
        } catch (error) {
            toast.error(error.response?.data?.message || "Please login to add items");
            throw error; 
        }
    },

    // Function to change item quantities
    updateQuantity: async (productId, quantity) => {
        try {
            if (quantity < 1) return; // Prevent negative quantities
            const res = await axios.put(`/api/cart/${productId}`, { quantity });
            set({ cart: res.data.items });
        } catch (error) {
            toast.error("Failed to update quantity");
        }
    },

    removeFromCart: async (productId) => {
        try {
            const res = await axios.delete(`/api/cart/${productId}`);
            set({ cart: res.data.items });
            toast.info("Item removed from cart"); // <-- TOAST RESTORED!
        } catch (error) {
            toast.error("Failed to remove item");
        }
    },

    clearCart: async () => {
        try {
            await axios.delete('/api/cart/clear');
            set({ cart: [] });
        } catch (error) {
            set({ cart: [] }); 
        }
    },

    clearLocalCart: () => {
        set({ cart: [] });
    },

    getCartTotal: () => {
        return get().cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
}));