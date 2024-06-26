export async function getOpenGraphImageURL(
  baseURL: string
): Promise<string | undefined> {
  try {
    const openGraphResponse = await fetch(baseURL, {
      headers: {
        "Content-Type": "text/html",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36",
      },
    });
    const rawHTML = await openGraphResponse.text();

    /**
     * Regular meta tag regex
     * <meta.../>
     */
    const regex = /<meta property="og:image" content="(.*?)"[ ]*\/>/gm;
    const groups = rawHTML.matchAll(regex);
    const group1 = groups.next();
    if (group1.value && group1.value[1]) {
      return group1.value[1];
    }

    /**
     * What if they are a freak and dont close their meta tag
     * <meta...>
     */
    const regexNoClosing = /<meta property="og:image" content="(.*?)"[ ]*>/gm;
    const groupsNoClosing = rawHTML.matchAll(regexNoClosing);
    const group1NoClosing = groupsNoClosing.next();
    if (group1NoClosing.value && group1NoClosing.value[1]) {
      return group1NoClosing.value[1];
    }
    return undefined;
  } catch (err) {
    /**
     * Bit of a noisy error. Probably means I should fix it
     */
    // console.error(`Error with regex`, err);
    return undefined;
  }
}
