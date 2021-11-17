import { createContext, useEffect, useState } from "react";
import { ErrorAlert, SuccessAlert } from "../../Components/Alerts";
import api from "../../Services";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [userID] = useState(()=>{
    const current = localStorage.getItem("userId") || "";
    return parseInt(current)
  })
  const [cartList, setCartList] = useState([]);
  
  // const getCartList = (usrID) => {
  useEffect(()=>{
    if (userID !== "") {
      api
        .get(`users/${userID}?_embed=userCart`)
        .then((res) => {
          setCartList(res.data.userCart);
        })
        .catch((err) => console.log(err));
    }
  },[userID, cartList])
  // };
  const findRepeated = (id) =>{
    const idList = JSON.parse(localStorage.getItem("idList")) || [];

    if(!idList.includes(id)){
      idList.push(id)
    }
    else{
      return true
    }

    localStorage.setItem("idList",JSON.stringify([...idList]))
    return false
  }

  const removeIDLocal = (id) => {
    const idList = JSON.parse(localStorage.getItem("idList")) || [];

   const newList = idList.filter((item)=> item !== id);
   localStorage.setItem("idList",JSON.stringify([...newList]))
  }

  const addToCart = (newPdt, usrToken) => {
    const isRepeated = findRepeated(newPdt.productsId);
    if(!isRepeated){
      api
        .post("userCart", newPdt, {
          headers: {
            Authorization: `Bearer ${usrToken}`,
          },
        })
        .then((res) => SuccessAlert("Adicionado", "top-right"))
        .catch((err) =>
          ErrorAlert("Não foi possível adicionar o produto", "top-right")
        );
    }
    else{
      ErrorAlert("Produto já adicionado", "top-right")
    }
  };

  const removeFromCart = (pdtID, usrToken) => {
    
    api
      .delete(`userCart/${pdtID}`, {
        headers: {
          Authorization: `Bearer ${usrToken}`,
        },
      })
      .then((res) => SuccessAlert("Removido", "top-right"))
      .catch(() =>
        ErrorAlert("Não foi possível remover o produto", "top-right")
      );
  };

  return (
    <CartContext.Provider
      value={{
        removeIDLocal,
        cartList,
        addToCart,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};