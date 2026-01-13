import BlogPostForm from '@/components/admin/blog/blog-post-form';

export default function NewBlogPostPage() {
  return (
    <div>
      <div className="mb-6">
          <h1 className="text-3xl font-bold">Add New Blog Post</h1>
          <p className="text-muted-foreground">Fill in the details below to add a new post to your blog.</p>
        </div>
      <BlogPostForm />
    </div>
  );
}
