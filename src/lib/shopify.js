const endpoint = import.meta.env.VITE_SHOPIFY_API_ENDPOINT;
const token    = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;

export async function shopify(query, variables = {}) {
  if (!endpoint || !token) {
    throw new Error("Missing VITE_SHOPIFY_API_ENDPOINT or VITE_SHOPIFY_STOREFRONT_TOKEN");
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });

  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } 
  catch { throw new Error(`Non-JSON response (${res.status}): ${text.slice(0,180)}`); }

  if (!res.ok || json.errors) {
    console.error("Shopify errors:", json.errors || json);
    throw new Error(json.errors?.[0]?.message || `HTTP ${res.status}`);
  }
  return json.data;
}
