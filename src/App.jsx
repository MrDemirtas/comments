import { AttachSvg, BoldSvg, DissLikeSvg, EmojiSvg, ImageSvg, ItalicSvg, LikeSvg, OrderSvg, ReplySvg, UnderLineSvg } from "./Svg";
import { useEffect, useRef, useState } from "react";

import { marked } from "marked";

export default function App() {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    async function getData() {
      const response = await fetch("/data/data.json").then((x) => x.json());
      setComments(response);
    }
    getData();
  }, []);

  return (
    <div className="container">
      <AddComment setComments={setComments} />
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
          <UserComments key={x.id} {...x} />
        ))}
      </div>
    </div>
  );
}

function AddComment({ setComments }) {
  const textAreaRef = useRef(null);
  const [text, setText] = useState("");

  function addTextStyle(type) {
    
    function convertMdSyntax(selectedText) {
      const textStyles = {
        strong: `**${selectedText}**`,
        italic: `_${selectedText}_`,
        underline: `<u>${selectedText}</u>`
      }
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
  };

  function handleOnSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formObj = Object.fromEntries(formData);
    const newCommentObj = {
      id: crypto.randomUUID(),
      name: "Furkan Demirtaş",
      time: "now",
      comment: formObj.comment,
      likes: 0,
      dislikes: 0,
      replies: [],
    };
    setComments((comments) => [newCommentObj, ...comments]);
    e.target.reset();
  }

  return (
    <div className="add-comment-content">
      <form onSubmit={handleOnSubmit}>
        <textarea ref={textAreaRef} required name="comment" value={text} onChange={(e) => setText(e.target.value)} rows="2" placeholder="add comment..."></textarea>
        <div className="comment-interactions">
          <div className="text-interactions">
            <button type="button" onClick={() => addTextStyle("strong")}>
              <BoldSvg />
            </button>
            <button type="button" onClick={() => addTextStyle("italic")}>
              <ItalicSvg />
            </button>
            <button type="button" onClick={() => addTextStyle("underline")}>
              <UnderLineSvg />
            </button>
          </div>
          <div className="visual-interactions">
            <button type="button">
              <AttachSvg />
            </button>
            <button type="button">
              <ImageSvg />
            </button>
            <button type="button">
              <EmojiSvg />
            </button>
          </div>
        </div>
        <button className="comment-btn">Comment</button>
      </form>
    </div>
  );
}

function UserComments({ id, name, time, comment, likes, dislikes, replies }) {
  return (
    <ul className="user-comments-body">
      <li className="comment">
        <img src="https://avatars.githubusercontent.com/u/178329206?v=4" />
        <div className="comment-data">
          <div className="user-data">
            <strong>{name}</strong>
            <span>{time}</span>
          </div>
          <div className="user-comment" dangerouslySetInnerHTML={{ __html: marked.parse(comment) }}  />
          <div className="comment-interactions">
            <div className="comment-like-content">
              <button>
                <LikeSvg width="18px" /> {likes}
              </button>
              <button>
                <DissLikeSvg width="18px" /> {dislikes}
              </button>
            </div>
            <button>
              <ReplySvg width="18px" />
              Reply
            </button>
          </div>
          {replies.length !== 0 && (
            <ul className="user-comments-body">
              {replies.map((x) => (
                <UserCommentReplies key={x.id} {...x} replyToId={id} />
              ))}
            </ul>
          )}
        </div>
      </li>
    </ul>
  );
}

function UserCommentReplies({ id, name, time, comment, likes, dislikes, replyToId }) {
  return (
    <li className="comment">
      <img src="https://avatars.githubusercontent.com/u/178329206?v=4" />
      <div className="comment-data">
        <div className="user-data">
          <strong>{name}</strong>
          <span>{time}</span>
        </div>
        <p className="user-comment">{comment}</p>
        <div className="comment-interactions">
          <div className="comment-like-content">
            <button>
              <LikeSvg width="18px" /> {likes}
            </button>
            <button>
              <DissLikeSvg width="18px" /> {dislikes}
            </button>
          </div>
          <button>
            <ReplySvg width="18px" />
            Reply
          </button>
        </div>
      </div>
    </li>
  );
}
