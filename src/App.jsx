import { AttachSvg, BoldSvg, DissLikeSvg, EmojiSvg, ImageSvg, ItalicSvg, LikeSvg, OrderSvg, ReplySvg, UnderLineSvg } from "./Svg";
import { useEffect, useRef, useState } from "react";

import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import { marked } from "marked";

export default function App() {
  const dialogRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentReplyId, setCommentReplyId] = useState(null);
  
  useEffect(() => {
    async function getData() {
      const response = await fetch("/data/data.json").then((x) => x.json());
      setComments(response);
    }
    if (localStorage.commentsData) {
      setComments(JSON.parse(localStorage.getItem("commentsData")));
    }else{
      getData();
    }

    if (localStorage.currentUser) {
      setCurrentUser(JSON.parse(localStorage.getItem("currentUser")));
    }else{
      setCurrentUser({
        userId: 1,
        name: "Furkan Demirtaş",
        likes: [],
        dislikes: [],
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("commentsData", JSON.stringify(comments));
  }, [comments])

  useEffect(() => {
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
  }, [currentUser])

  function handleLikeBtn({ id, replyId = false }) {
    if (currentUser.likes.includes(id)) {
      currentUser.likes = currentUser.likes.filter((x) => x !== id);
      setCurrentUser({ ...currentUser });
      if (!replyId) {
        comments.find((x) => x.id === id).likes--;
      } else {
        comments.find((x) => x.id === replyId).replies.find((x) => x.id === id).likes--;
      }
      setComments([...comments]);
    } else {
      currentUser.likes = [...currentUser.likes, id];
      setCurrentUser({ ...currentUser });

      let thisComment = null;
      if (!replyId) {
        thisComment = comments[comments.findIndex((x) => x.id === id)];
      } else {
        thisComment = comments[comments.findIndex((x) => x.id === replyId)].replies;
        thisComment = thisComment[thisComment.findIndex((x) => x.id === id)];
      }

      if (currentUser.dislikes.includes(id)) {
        thisComment.dislikes--;
        currentUser.dislikes = currentUser.dislikes.filter((x) => x !== id);
        setCurrentUser({ ...currentUser });
      }

      thisComment.likes++;
      setComments([...comments]);
    }
  }

  function handleDisLikeBtn({ id, replyId = false }) {
    if (currentUser.dislikes.includes(id)) {
      currentUser.dislikes = currentUser.dislikes.filter((x) => x !== id);
      setCurrentUser({ ...currentUser });
      if (!replyId) {
        comments.find((x) => x.id === id).dislikes--;
      } else {
        comments.find((x) => x.id === replyId).replies.find((x) => x.id === id).dislikes--;
      }
      setComments([...comments]);
    } else {
      currentUser.dislikes = [...currentUser.dislikes, id];
      setCurrentUser({ ...currentUser });

      let thisComment = null;
      if (!replyId) {
        thisComment = comments[comments.findIndex((x) => x.id === id)];
      } else {
        thisComment = comments[comments.findIndex((x) => x.id === replyId)].replies;
        thisComment = thisComment[thisComment.findIndex((x) => x.id === id)];
      }

      if (currentUser.likes.includes(id)) {
        thisComment.likes--;
        currentUser.likes = currentUser.likes.filter((x) => x !== id);
        setCurrentUser({ ...currentUser });
      }

      thisComment.dislikes++;
      setComments([...comments]);
    }
  }

  return (
    <div className="container">
      <AddComment setComments={setComments} currentUser={currentUser} />
      <hr />
      <div className="user-comments-content">
        <div className="user-comments-header">
          <h3>Comments</h3>
          <div className="order-comments">
            <OrderSvg />
            <select>
              <option value="Most recent">Most recent</option>
            </select>
          </div>
        </div>
        {comments.map((x) => (
          <UserComments 
            key={x.id} 
            {...x} 
            currentUser={currentUser} 
            setCurrentUser={setCurrentUser} 
            setComments={setComments}
            handleLikeBtn={handleLikeBtn} 
            handleDisLikeBtn={handleDisLikeBtn}
            setCommentReplyId={setCommentReplyId}
          />
        ))}
      </div>
      {commentReplyId !== null && 
        <ReplyModal 
          dialogRef={dialogRef}
          replyId={commentReplyId}
          setComments={setComments}
          setCommentReplyId={setCommentReplyId}
          currentUser={currentUser}
        />}
    </div>
  );
}

function AddComment({ setComments, currentUser }) {
  const textAreaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [openEmoji, setOpenEmoji] = useState(false);
  const [text, setText] = useState(""); 
  const [imageBase64, setImageBase64] = useState(null); 

  function addTextStyle(type) {
    function convertMdSyntax(selectedText) {
      const textStyles = {
        strong: `**${selectedText}**`,
        italic: `_${selectedText}_`,
        underline: `<u>${selectedText}</u>`,
      };
      return textStyles[type];
    }

    const textarea = textAreaRef.current;
    const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);

    if (selectedText) {
      const beforeText = textarea.value.substring(0, textarea.selectionStart);
      const afterText = textarea.value.substring(textarea.selectionEnd);
      const newText = beforeText + convertMdSyntax(selectedText) + afterText;
      setText(newText);
    }
  }

  function handleOnSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formObj = Object.fromEntries(formData);
    
    const newCommentObj = {
      id: crypto.randomUUID(),
      name: currentUser.name,
      time: "now",
      comment: formObj.comment,
      likes: 0,
      dislikes: 0,
      replies: [],
    };

    if (formObj.img.name.trim() !== "" && formObj.img.size !== 0) {
      newCommentObj.img = imageBase64;
    }

    setComments((comments) => [newCommentObj, ...comments]);
    setText("");
    fileInputRef.current.value = "";
    setImageBase64(null);
    setOpenEmoji(false);
  }

  function handleAddImg(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const base64String = event.target.result;
        setImageBase64(base64String);
      };
      reader.readAsDataURL(file);
    }else{
      setImageBase64(null);
    }
  }

  function handleRemoveImage() {
    fileInputRef.current.value = "";
    setImageBase64(null);
  }

  return (
    <div className="add-comment-content">
      <form onSubmit={handleOnSubmit}>
        <textarea ref={textAreaRef} required name="comment" value={text} onChange={(e) => setText(e.target.value)} rows="2" placeholder="add comment..."></textarea>
        {imageBase64 && (
          <div className="uploadImageContent">
            <img className="uploadImage" src={imageBase64} />
            <button type="button" onClick={handleRemoveImage}>❌</button>
          </div>
        )}
        <div className="comment-interactions">
          <div className="text-interactions">
            <button type="button" onClick={() => addTextStyle("strong")}>
              <BoldSvg width="18px" height="18px" />
            </button>
            <button type="button" onClick={() => addTextStyle("italic")}>
              <ItalicSvg width="18px" height="18px" />
            </button>
            <button type="button" onClick={() => addTextStyle("underline")}>
              <UnderLineSvg width="18px" height="18px" />
            </button>
          </div>
          <div className="visual-interactions">
            <button type="button">
              <AttachSvg width="18px" height="18px" />
            </button>
            <label className="addImageInput">
              <input ref={fileInputRef} type="file" name="img" accept=".jpeg, .jpg, .png" onChange ={handleAddImg} />
              <ImageSvg width="18px" height="18px" />
            </label>
            <div className="emojiPicker">
              <button type="button" className="emojiBtn" onClick={() => setOpenEmoji(!openEmoji)}>
                <EmojiSvg width="18px" height="18px" fillColor={openEmoji ? "#e9540a" : "#5e5e5e"} />
              </button>
              {openEmoji && 
                <Picker 
                  data={data} 
                  onEmojiSelect={(emoji) => setText(() => text + emoji.native)}
                  locale={"tr"}
                  theme={"light"}
                />}
            </div>
          </div>
        </div>
        <button type="submit" className="comment-btn">Submit</button>
      </form>
    </div>
  );
}

function UserComments({ id, name, time, comment, img, likes, dislikes, replies, currentUser, handleLikeBtn, handleDisLikeBtn, setCommentReplyId }) {  
  return (
    <ul className="user-comments-body">
      <li className="comment">
        <a href="#">
          <img src="https://avatars.githubusercontent.com/u/178329206?v=4" />
        </a>
        <div className="comment-data">
          <div className="user-data">
            <strong>
              <a href="#">{name}</a>
            </strong>
            <span>{time}</span>
          </div>
          <div className="user-comment-content">
            <p className="user-comment" dangerouslySetInnerHTML={{ __html: marked.parse(comment) }} />
            {img && <img src={img} />}
          </div>
          <div className="comment-interactions">
            <div className="comment-like-content">
              <button onClick={() => handleLikeBtn({ id: id })}>
                <LikeSvg width="18px" height="18px" fillColor={currentUser.likes.includes(id) ? "#e9540a" : "#5e5e5e"} />
                {likes}
              </button>
              <button onClick={() => handleDisLikeBtn({ id: id })}>
                <DissLikeSvg width="18px" height="18px" fillColor={currentUser.dislikes.includes(id) ? "#e9540a" : "#5e5e5e"} />
                {dislikes}
              </button>
            </div>
            <button onClick={() => setCommentReplyId(id)}>
              <ReplySvg width="18px" height="18px" />
              Reply
            </button>
          </div>
          {replies.length !== 0 && (
            <ul className="user-comments-body">
              {replies.map((x) => (
                <UserCommentReplies 
                  key={x.id} 
                  {...x} 
                  replyToId={id} 
                  currentUser={currentUser} 
                  handleLikeBtn={handleLikeBtn} 
                  handleDisLikeBtn={handleDisLikeBtn}
                  setCommentReplyId={setCommentReplyId}
                />
              ))}
            </ul>
          )}
        </div>
      </li>
    </ul>
  );
}

function UserCommentReplies({ id, name, time, comment, img, likes, dislikes, replyToId, currentUser, handleLikeBtn, handleDisLikeBtn, setCommentReplyId }) {
  return (
    <li className="comment">
      <img src="https://avatars.githubusercontent.com/u/178329206?v=4" />
      <div className="comment-data">
        <div className="user-data">
          <strong>{name}</strong>
          <span>{time}</span>
        </div>
        <div className="user-comment-content">
          <p className="user-comment" dangerouslySetInnerHTML={{ __html: marked.parse(comment) }} />
          {img && <img src={img} />}
        </div>
        <div className="comment-interactions">
          <div className="comment-like-content">
            <button onClick={() => handleLikeBtn({ id: id, replyId: replyToId })}>
              <LikeSvg width="18px" height="18px" fillColor={currentUser.likes.includes(id) ? "#e9540a" : "#5e5e5e"} />
              {likes}
            </button>
            <button onClick={() => handleDisLikeBtn({ id: id, replyId: replyToId })}>
              <DissLikeSvg width="18px" height="18px" fillColor={currentUser.dislikes.includes(id) ? "#e9540a" : "#5e5e5e"} />
              {dislikes}
            </button>
          </div>
          <button onClick={() => setCommentReplyId(replyToId)}>
            <ReplySvg width="18px" height="18px" />
            Reply
          </button>
        </div>
      </div>
    </li>
  );
}

function ReplyModal({dialogRef, replyId, setComments, setCommentReplyId, currentUser}) {
  const textAreaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [text, setText] = useState("");
  const [openEmoji, setOpenEmoji] = useState("");
  const [imageBase64, setImageBase64] = useState(null); 

  function handleOnSubmit(e) {
    const formData = new FormData(e.target);
    const formObj = Object.fromEntries(formData);
    const newReplyObj = {
      id: crypto.randomUUID(),
      name: currentUser.name,
      time: "now",
      comment: formObj.comment,
      likes: 0,
      dislikes: 0,
    }

    if (formObj.img.name.trim() !== "" && formObj.img.size !== 0) {
      newReplyObj.img = imageBase64;
    }

    setComments(comments => {
      comments[comments.findIndex(x => x.id === replyId)].replies.push(newReplyObj);
      return [...comments];
    })
    fileInputRef.current.value = "";
    setImageBase64(null);
    setCommentReplyId(null)
  }

  function addTextStyle(type) {
    function convertMdSyntax(selectedText) {
      const textStyles = {
        strong: `**${selectedText}**`,
        italic: `_${selectedText}_`,
        underline: `<u>${selectedText}</u>`,
      };
      return textStyles[type];
    }

    const textarea = textAreaRef.current;
    const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);

    if (selectedText) {
      const beforeText = textarea.value.substring(0, textarea.selectionStart);
      const afterText = textarea.value.substring(textarea.selectionEnd);
      const newText = beforeText + convertMdSyntax(selectedText) + afterText;
      setText(newText);
    }
  }

  function handleAddImg(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const base64String = event.target.result;
        setImageBase64(base64String);
      };
      reader.readAsDataURL(file);
    }else{
      setImageBase64(null);
    }
  }

  function handleRemoveImage() {
    fileInputRef.current.value = "";
    setImageBase64(null);
  }

  return (
    <dialog className="replyDialog" ref={dialogRef}>
      <div className="add-comment-content">
        <form onSubmit={handleOnSubmit}>
          <textarea ref={textAreaRef} required name="comment" value={text} onChange={(e) => setText(e.target.value)} rows="2" placeholder="add comment..."></textarea>
          {imageBase64 && (
            <div className="uploadImageContent">
              <img className="uploadImage" src={imageBase64} />
              <button type="button" onClick={handleRemoveImage}>❌</button>
            </div>
          )}
          <div className="comment-interactions">
            <div className="text-interactions">
              <button type="button" onClick={() => addTextStyle("strong")}>
                <BoldSvg width="18px" height="18px" />
              </button>
              <button type="button" onClick={() => addTextStyle("italic")}>
                <ItalicSvg width="18px" height="18px" />
              </button>
              <button type="button" onClick={() => addTextStyle("underline")}>
                <UnderLineSvg width="18px" height="18px" />
              </button>
            </div>
            <div className="visual-interactions">
              <button type="button">
                <AttachSvg width="18px" height="18px" />
              </button>
              <label className="addImageInput">
                <input ref={fileInputRef} type="file" name="img" accept=".jpeg, .jpg, .png" onChange ={handleAddImg} />
                <ImageSvg width="18px" height="18px" />
              </label>
              <div className="emojiPicker">
                <button type="button" className="emojiBtn" onClick={() => setOpenEmoji(!openEmoji)}>
                  <EmojiSvg width="18px" height="18px" fillColor={openEmoji ? "#e9540a" : "#5e5e5e"} />
                </button>
                {openEmoji && 
                  <Picker 
                    data={data} 
                    onEmojiSelect={(emoji) => setText(() => text + emoji.native)}
                    locale={"tr"}
                    theme={"light"}
                  />}
              </div>
            </div>
          </div>
          <div className="btn-group">
            <button type="button" className="cancel-btn" onClick={() => setCommentReplyId(null)}>Cancel</button>
            <button type="submit" className="comment-btn">Submit</button>
          </div>
        </form>
      </div>
    </dialog>
  )
}