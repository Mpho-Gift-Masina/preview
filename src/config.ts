/**
 * Web3Forms access key. Orders submitted on the site are emailed to the
 * address this key was created for (get one free at https://web3forms.com).
 * Set it in a `.env` file as VITE_WEB3FORMS_KEY, or in your host's
 * environment variables. The key is safe to expose in the browser.
 */
export const WEB3FORMS_KEY: string = import.meta.env.VITE_WEB3FORMS_KEY ?? '';

export const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
