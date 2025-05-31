import { useParams } from "react-router-dom";

function PostsPage() {
  const { category } = useParams();

  return (
    <div>
      <h2>Posts in Category: {category}</h2>
      {/* Later you'll fetch or filter your posts based on this category */}
    </div>
  );
}

export default PostsPage;
