import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "@/app/lib/api/client";

export async function fetchFolders() {
  return apiGet("/folders");
}

export async function createFolder(payload: {
  name: string;
  displayName: string;
  description?: string;
  color?: string;
}) {
  return apiPost("/folders", payload);
}

export async function updateFolder(_id: string, payload: {
  name?: string;
  displayName?: string;
  description?: string;
  color?: string;
}) {
  return apiPut(`/folders/${_id}`, payload);
}

export async function deleteFolder(_id: string) {
  return apiDelete(`/folders/${_id}`);
}

export async function fetchPosts(params: { folder?: string; search?: string }) {
  return apiGet("/posts", { params });
}

export async function fetchPostById(postId: string) {
  return apiGet(`/posts/${postId}`);
}

export async function createPost(payload: {
  summary: string;
  details: string;
  folders: string[];
  postType?: string;
  audience?: string;
  urgency?: string;
  isAnonymous?: boolean;
}) {
  return apiPost("/posts", payload);
}

export async function updatePost(postId: string, payload: any) {
  return apiPut(`/posts/${postId}`, payload);
}

export async function deletePost(postId: string) {
  return apiDelete(`/posts/${postId}`);
}

export async function uploadPostAttachments(postId: string, files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  return apiPost(`/posts/${postId}/attachments`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function createAnswer(payload: { postId: string; content: string; answerType: string }) {
  return apiPost("/answers", payload);
}

export async function updateAnswer(answerId: string, payload: any) {
  return apiPut(`/answers/${answerId}`, payload);
}

export async function deleteAnswer(answerId: string) {
  return apiDelete(`/answers/${answerId}`);
}

export async function createDiscussion(payload: { postId: string; parentId?: string | null; content: string }) {
  return apiPost("/discussions", payload);
}

export async function updateDiscussion(discussionId: string, payload: any) {
  return apiPatch(`/discussions/${discussionId}`, payload);
}

export async function deleteDiscussion(discussionId: string) {
  return apiDelete(`/discussions/${discussionId}`);
}

export async function togglePinPost(postId: string, isPinned: boolean) {
  return apiPatch(`/posts/${postId}/pin`, { isPinned });
}

export async function fetchStats() {
  return apiGet("/stats/overview");
}

export async function fetchAllUsers() {
  return apiGet("/users");
}

export async function updateUserRole(userId: string, role: string) {
  return apiPatch(`/users/${userId}/role`, { role });
}

export async function verifyLawyer(userId: string) {
  return apiPatch(`/users/${userId}/verify-lawyer`);
}

export async function banUser(userId: string, banned: boolean) {
  return apiPatch(`/users/${userId}/ban`, { banned });
}

export async function deleteUser(userId: string) {
  return apiDelete(`/users/${userId}`);
}
