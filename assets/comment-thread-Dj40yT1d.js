var e=`import { CommentThread, type CommentAuthor, type ThreadComment } from "@/registry/components/comment-thread/comment-thread";
import { avatar } from "@/lib/media";
import { Stack } from "./_kit";

const emma: CommentAuthor = { id: "emma", name: "Emma Collins", avatar: avatar("emma-collins") };
const marcus: CommentAuthor = { id: "marcus", name: "Marcus Johnson", avatar: avatar("marcus-johnson") };
const jasmine: CommentAuthor = { id: "jasmine", name: "Jasmine Brooks", avatar: avatar("jasmine-brooks") };
const me: CommentAuthor = { id: "olivia", name: "Olivia Bennett", avatar: avatar("olivia-bennett") };

const comments: ThreadComment[] = [
  {
    id: "c1", author: emma, createdAt: "3h",
    body: "The headline wraps onto three lines at tablet width. Can we shorten it?",
    reactions: [{ emoji: "👀", users: ["marcus", "jasmine"] }],
    replies: [
      { id: "c2", author: marcus, createdAt: "2h", body: "Agreed. What about \\"Ship interfaces people remember\\"?", reactions: [{ emoji: "👍", users: ["emma", "olivia"] }] },
      { id: "c3", author: jasmine, createdAt: "1h", body: "Works for me. @Emma Collins can you confirm it fits the brand voice?" },
    ],
  },
  { id: "c4", author: marcus, createdAt: "35m", body: "I also bumped the subheading contrast to meet AA." },
];

export default function CommentThreadDemo() {
  return (
    <Stack width={520}>
      <CommentThread defaultComments={comments} currentUser={me} people={[emma, marcus, jasmine, me]} title="Hero headline" />
    </Stack>
  );
}
`;export{e as default};