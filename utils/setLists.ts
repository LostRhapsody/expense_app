import axios from 'axios';
import type { ShoppingListType } from '~/types/types';

/**
 * set's a user's lists in cache and db
 */
export default async function setLists(list:ShoppingListType) {
   const { status, data, signIn, signOut } = useAuth();
   const loggedIn = computed(() => status.value === "authenticated");
   const isOnline = useOnline();
   const key = localStorage.getItem("uuid");

   const listsString = localStorage.getItem("lists");
   let lists:ShoppingListType[] = [];

   if(listsString !== null && listsString !== undefined){
      lists = JSON.parse(listsString);
   }

   // check if the list item being passed already exists with a matching listId
   const index = lists.findIndex((item) => item.listId === list.listId);
   if(index !== -1){
      lists[index] = list;
   } else {
      // add the new list the the list array
      lists.push(list);
         }
   
localStorage.setItem("lists", JSON.stringify(lists));
   
   if(checkUUID(key) && isOnline.value && loggedIn.value){
      await axios.post("/api/grocery/setList", {
         key: key,
         list: list
      }).then(response =>{
         console.log(response.data);
      });
   }
}