import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      // console.log(cart)
      const productInCart = cart.find(product => product.id === productId)
      const stock = await api.get(`stock/${productId}`).then(response =>response.data )
      const product = await api.get(`products/${productId}`).then(response =>response.data )

      if(!productInCart){
        if(stock.amount >1){
          setCart([...cart, {...product, amount:1}])
          return
        }
      }
      if(productInCart && stock.amount > productInCart.amount){
        const newCart = cart.map(item => item.id === productId 
          ? {...item, amount: Number(item.amount) +1} 
        : item)
        setCart(newCart)
      }
    } catch {
      // TODO
    }
  };
  
  const removeProduct = (productId: number) => {
    try {
      // TODO
      console.log('remove',productId)
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      const {data} = await api.get('stock')
      console.log(data)

    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
