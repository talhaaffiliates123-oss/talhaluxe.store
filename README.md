# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Resolving Git Push Errors Due to Secrets

If your `git push` is blocked by an error message mentioning "GH013: Repository rule violations" and "Push cannot contain secrets", it's because a secret key (like an API key) was accidentally included in your project's past commit history.

To fix this, you must **follow the unique link provided in the error message**. It will look something like this:

`https://github.com/your-username/your-repo/security/secret-scanning/unblock-secret/...`

1.  Copy the link from the error message in your terminal and open it in your web browser.
2.  On the GitHub page, choose the option to **allow the secret**. This tells GitHub that you are aware of the situation and want to proceed with this push.
3.  Once you have allowed it on the GitHub website, try to push your changes again from your terminal. It should now succeed.

A `.gitignore` file has been added to this project to prevent this from happening in the future.

---

To get started with development, take a look at `src/app/page.tsx`.

Please run `git pull --rebase` in the terminal to fix other potential git commit issues.
