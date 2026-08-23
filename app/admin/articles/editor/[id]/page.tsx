import { ArticleEditor } from "@/components/admin/editor/ArticleEditor";

export const metadata = {
  title: "Edit story",
};

export default async function EditArticleEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ArticleEditor draftId={id} />;
}
