import { textOnly } from '@lens-protocol/metadata';
import {
  type CreatePostRequest,
  evmAddress,
  postId,
  useCreatePost,
  usePost,
} from '@lens-protocol/react';
import { handleOperationWith } from '@lens-protocol/react/viem';
import { useEffect, useState } from 'react';
import { useWalletClient } from 'wagmi';

export function App() {
  const { data: wallet } = useWalletClient();
  const {
    execute,
    loading,
    data: post,
  } = useCreatePost({ handler: handleOperationWith(wallet) });

  // Search params post viewing
  const [viewingPostId, setViewingPostId] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('postId');
    if (postId) {
      setViewingPostId(postId);
    }
  }, []);

  // Always call the hook, but with a valid or empty postId
  const { data: fetchedPost, loading: fetchingPost } = usePost({
    post: postId(viewingPostId || ''),
  });

  // Only use the data if we actually have a viewingPostId
  const shouldShowFetchedPost = viewingPostId && fetchedPost;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const content = formData.get('content') as string;
    const actionAddress = formData.get('actionAddress') as string;
    const shouldAttachAction = formData.get('attachAction') === 'on';

    const metadata = textOnly({
      content,
    });

    // Prepare the post request
    const postRequest: CreatePostRequest = {
      contentUri: `data:application/json,${JSON.stringify(metadata)}`,
    };

    // Attach custom action if requested
    if (shouldAttachAction && actionAddress) {
      postRequest.actions = [
        {
          unknown: {
            address: evmAddress(actionAddress),
          },
        },
      ];
    }

    const result = await execute(postRequest);

    if (result.isErr()) {
      alert(result.error.message);
    } else {
      // Update URL search params to view the created post
      const url = new URL(window.location.href);
      url.searchParams.set('postId', result.value.slug);
      window.history.pushState({}, '', url);
      setViewingPostId(result.value.slug);
    }
  };

  return (
    <div>
      <h1>Post Example</h1>

      {/* Show fetched post if viewing from URL hash */}
      {viewingPostId && (
        <article>
          <h2>Viewing Post: {viewingPostId}</h2>
          {viewingPostId && fetchingPost && <p>Loading post...</p>}
          {shouldShowFetchedPost && (
            <div>
              <p>
                <strong>Author:</strong>{' '}
                {fetchedPost.author.username?.value ||
                  fetchedPost.author.address}
              </p>
              <p>
                <strong>Created:</strong> {fetchedPost.timestamp.toString()}
              </p>
              {fetchedPost.__typename === 'Post' && (
                <>
                  <p>
                    <strong>Content:</strong>{' '}
                    {fetchedPost.metadata.__typename === 'TextOnlyMetadata' &&
                      fetchedPost.metadata.content}
                  </p>
                  {fetchedPost.actions.length > 0 && (
                    <p>
                      <strong>Actions:</strong> {fetchedPost.actions.length}{' '}
                      custom action(s) attached
                    </p>
                  )}
                </>
              )}
              {fetchedPost.__typename === 'Repost' && (
                <p>
                  <strong>Type:</strong> This is a repost
                </p>
              )}
            </div>
          )}
          <button
            type='button'
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.delete('postId');
              window.history.pushState({}, '', url);
              setViewingPostId(null);
            }}
          >
            Back to Create Post
          </button>
        </article>
      )}

      {/* Show creation success message */}
      {post && (
        <article>
          <h2>Post Created Successfully!</h2>
          <p>Slug: {post.slug}</p>
          <p>Created At: {post.timestamp.toString()}</p>
          <p>
            Content:{' '}
            {post.metadata.__typename === 'TextOnlyMetadata' &&
              post.metadata.content}
          </p>
          <button
            type='button'
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set('postId', post.slug);
              window.history.pushState({}, '', url);
              setViewingPostId(post.slug);
            }}
          >
            View Post
          </button>
        </article>
      )}
      <form onSubmit={onSubmit}>
        <label>
          Content:
          <textarea name='content' required />
        </label>
        <label>
          <input type='checkbox' name='attachAction' defaultChecked />
          Attach Custom Action
        </label>
        <label>
          Action Address:
          <input
            type='text'
            name='actionAddress'
            defaultValue='0x0C47385aA1E5244C8f894534a83223171f866907'
          />
        </label>
        <button type='submit' disabled={loading}>
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
}
