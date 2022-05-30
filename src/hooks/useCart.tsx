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
      const productStock = await api.get(`stock/${productId}`).then(response =>response.data )
      const product = await api.get(`products/${productId}`).then(response =>response.data )

      if(!productId){
        return
      }
      if(!productInCart){
        if(productStock.amount >1){
          const newCart = [...cart, {...product, amount:1}]
          setCart(newCart)
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
          return
        }
      }
      if(productInCart && productStock.amount > productInCart.amount){
        const newCart = cart.map(item => item.id === productId 
          ? {...item, amount: Number(item.amount) +1} 
        : item)
        setCart(newCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
        return
      }else{
        toast.error('Quantidade solicitada fora de estoque')
      }
    } catch {
      // TODO
      toast.error('Erro na adição do produto')
    }
  };
  
  const removeProduct = (productId: number) => {
    try {
      // TODO
      // console.log('remove',productId)
      const productExist = cart.some(item=> item.id === productId)
      if(!productExist){
        toast.error("Erro na remoção do produto")
        return
      }
      const newCart = cart.filter(item => item.id !== productId)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
      setCart(newCart)
    } catch {
      // TODO
      toast.error("Erro na remoção do produto")
    }
  };
  
  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      const productExist = cart.find(item=> item.id === productId)
      if(!productExist){
        toast.error("Erro na alteração de quantidade do produto")
        return
      }
      const productStock = await api.get(`stock/${productId}`).then(response =>response.data )
      if(amount > productStock.amount){
        toast.error('Quantidade solicitada fora de estoque')
        return
      }
      if(amount < 1){
        toast.error('Erro na alteração de quantidade do produto');
        return
      }


      const newCart = cart.map(item =>item.id === productId?{
        ...item, amount:amount
      }:item)
      setCart(newCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
      } catch {
        // TODO
        toast.error('erro ao adicionar')
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
