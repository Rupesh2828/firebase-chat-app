import { useAuth } from "@/context/authContext";
import { useChatContext } from "@/context/chatContext";
import { db } from "@/firebase/firebase";
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import React from "react";
import ClickAwayListener from "react-click-away-listener";

const ChatMenu = ({ showMenu, setShowMenu }) => {
  const { currentUser } = useAuth();
  const { data, users, chats , dispatch, setSelectedChat} = useChatContext();

  const handleClickAway = () => {
    setShowMenu(false);
  };

  //
  const isUserBlocked = users[currentUser.uid]?.blockedUsers?.find(
    (u) => u === data.user.uid
  );

  const IamBlocked = users[data.user.uid]?.blockedUsers?.find(
    (u) => u === currentUser.uid
  );

  const handleBlock = async (action) => {
    if (action === "block") {
      await updateDoc(doc(db, "users", currentUser.uid), {
        blockedUsers: arrayUnion(data.user.uid),
      });
    }

    if (action === "unblock") {
      await updateDoc(doc(db, "users", currentUser.uid), {
        blockedUsers: arrayRemove(data.user.uid),
      });
    }
  };

  const handleDelete = async () => {

    try {
      const chatRef = doc(db, "chats", data.chatId);
      const chatDoc = await getDoc(chatRef);
      
      const updatedMessages = chatDoc?.data()?.messages?.map((m)=> {
        //if we find the deletechatinfo and currentuser id is true that means that msg will not be shown 
        m.deleteChatInfo = {
          ...m.deleteChatInfo,
          [currentUser.uid] : true
        }

        return m;
      });

      await updateDoc(chatRef, {
        messages:updatedMessages
      })

      await updateDoc(doc(db, "userChats", currentUser.uid), {
        //by chatDeleted key if we delete all chat then that particular user will also be deleted
        [data.chatId + ".chatDeleted"] : true
      })
      
      //accessing all chats but not the selected one.
      const filteredChats = Object.entries(chats || {})
      .filter(([id,chat])=> 
      id !== data.chatId)
      .sort((a,b)=> b[1].date -a[1].date);

      if(filteredChats.length > 0) {
        setSelectedChat(filteredChats?.[0]?.[1]?.userInfo)
        dispatch({
          type : "CHANGE_USER",
          payload : filteredChats?.[0]?.[1]?.userInfo  //at 0-> its users chat id at 1-> its info of user
        })

      } else {
        dispatch({type : "EMPTY"})
      }
      
    } catch (error) {
      console.error(error)
      
    }
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div className="w-[200px] absolute top-[70px] right-5 bg-c0 z-10 rounded-md overflow-hidden">
        <ul className="flex flex-col py-2 ">
          {!IamBlocked && (
            <li
              className="flex items-center py-3 px-5 hover:bg-black cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleBlock(isUserBlocked ? "unblock" : "block");
              }}
            >
              {isUserBlocked ? "Unblock" : "Block user"}
            </li>
          )}

          <li
            className="flex items-center py-3 px-5 hover:bg-black cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
              setShowMenu(false)
            }}
          >
            Delete Chat
          </li>
        </ul>
      </div>
    </ClickAwayListener>
  );
};

export default ChatMenu;
