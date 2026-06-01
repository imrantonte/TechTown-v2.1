import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-toastify';

export const useCartStore = create(
    persist(
        (set, get) => ({
            cart: [],

            // Add item to cart or increase quantity if it already exists
            addToCart: (product) => {
                const cart = get().cart;
                const existingItem = cart.find(item => item._id === product._id);

                if (existingItem) {
                    // Check stock limit before adding more
                    if (existingItem.quantity >= product.stock) {
                        toast.error(`Only ${product.stock} items in stock!`);
                        return;
                    }
                    
                    set({
                        cart: cart.map(item => 
                            item._id === product._id 
                                ? { ...item, quantity: item.quantity + 1 } 
                                : item
                        )
                    });
                } else {
                    if (product.stock < 1) {
                        toast.error('This product is out of stock.');
                        return;
                    }
                    set({ cart: [...cart, { ...product, quantity: 1 }] });
                }
                toast.success(`${product.name} added to cart!`);
            },

            // Decrease quantity or remove if it hits 0
            decreaseQuantity: (productId) => {
                const cart = get().cart;
                const existingItem = cart.find(item => item._id === productId);

                if (existingItem?.quantity > 1) {
                    set({
                        cart: cart.map(item => 
                            item._id === productId 
                                ? { ...item, quantity: item.quantity - 1 } 
                                : item
                        )
                    });
                } else {
                    // If quantity is 1 and they press '-', remove it completely
                    set({ cart: cart.filter(item => item._id !== productId) });
                }
            },

            updateQuantity: (productId, qty) => {
                const cart = get().cart;
                const existingItem = cart.find(item => item._id === productId);

                if (existingItem) {
                    if (qty > existingItem.stock) {
                        toast.error(`Only ${existingItem.stock} items in stock!`);
                        qty = existingItem.stock; 
                    }
                    
                    if (qty < 1) qty = 1;

                    set({
                        cart: cart.map(item => 
                            item._id === productId 
                                ? { ...item, quantity: qty } 
                                : item
                        )
                    });
                }
            },

            // Remove a specific item completely
            removeFromCart: (productId) => {
                set({ cart: get().cart.filter(item => item._id !== productId) });
            },

            // Empty the entire cart (used after successful checkout)
            clearCart: () => set({ cart: [] }),

            // Calculate total number of items for the Navbar badge
            getCartCount: () => {
                return get().cart.reduce((total, item) => total + item.quantity, 0);
            },
            
            // Calculate total price
            getCartTotal: () => {
                return get().cart.reduce((total, item) => total + (item.price * item.quantity), 0);
            }
        }),
        {
            name: 'techtown-cart-storage', // The key used in localStorage
        }
    )
);