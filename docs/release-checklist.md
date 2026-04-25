# LeaseQA V2 Release Checklist

Use this checklist before calling a client-facing release ready.

## Home and Navigation

- Open `/`
- Confirm the primary actions to `/ai-review` and `/qa`
- Confirm public navigation works on desktop and mobile

## Auth

- Register a fresh tenant account
- Confirm registration lands in an authenticated state
- Refresh and confirm the session survives
- Log out and confirm the session clears
- Log in with an existing account and confirm refresh still restores the session

## AI Review

- Open `/ai-review` as a guest and confirm the page loads
- Paste a clause and confirm the first answer returns immediately
- Confirm the answer is short, structured, and citation-backed
- Upload a `PDF` and confirm a session is created
- Upload a `DOCX` and confirm a session is created
- Ask a follow-up question and confirm the response attaches the expected source support

## Account, Activity, and Notifications

- Log in as a tenant and open `/account`
- Confirm recent activity shows real entries, not placeholders
- Trigger an inbound answer notification and confirm the header bell shows an unread item
- Open the notification and confirm it marks as read and navigates to the correct page

## Community Q&A

- Create a post in `/qa`
- Confirm the post detail view loads
- Add an answer
- Add a root follow-up discussion
- Add a nested reply
- Refresh and confirm discussion threads persist

## Admin and Moderation

- Log in as an admin and open `/qa/manage`
- Create, edit, and delete a section
- Change a user role or verification state in the admin UI
- Open a post detail page and confirm moderation controls render
- Toggle post status and pinning

## Deployment Sanity

- Confirm the public client URL loads: `https://leaseqa-client.vercel.app`
- Confirm the server health check loads: `https://leaseqa-server.onrender.com/api/health`
- Confirm client and server `main` are at the intended commits

## Documentation

- Review [README.md](/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/README.md)
- Review [product-prd.md](/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/docs/product-prd.md)
- Review [architecture.md](/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/docs/architecture.md)
- Review [api-design.md](/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/docs/api-design.md)
- Review [leaseqa-server/README.md](/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/README.md) if backend behavior
  changed
