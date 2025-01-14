import { AttachSvg, BoldSvg, DissLikeSvg, EmojiSvg, ImageSvg, ItalicSvg, LikeSvg, OrderSvg, ReplySvg, UnderLineSvg } from "./Svg";
import { useEffect, useState } from "react";

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
    setComments((comments) => [newCommentObj, ...comments ]);
    e.target.reset();
  }

  return (
    <div className="add-comment-content">
      <form onSubmit={handleOnSubmit}>
        <textarea name="comment" required rows="2" placeholder="add comment..."></textarea>
        <div className="comment-interactions">
          <div className="text-interactions">
            <button type="button">
              <BoldSvg />
            </button>
            <button type="button">
              <ItalicSvg />
            </button>
            <button type="button">
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
