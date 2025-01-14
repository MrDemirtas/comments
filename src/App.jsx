import { AttachSvg, BoldSvg, EmojiSvg, ImageSvg, ItalicSvg, LikeSvg, UnderLineSvg } from "./Svg";
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
      <AddComment />
    </div>
  );
}

function AddComment() {
  return (
    <div className="add-comment-content">
      <form>
        <textarea name="comment" rows="2" placeholder="add comment..."></textarea>
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
