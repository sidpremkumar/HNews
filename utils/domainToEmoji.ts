export default function domainToEmoji(urlDomain: string) {
  if (urlDomain.includes("github.io")) {
    return "👾 ";
  }

  let emoji = "";
  switch (urlDomain.replaceAll("www.", "")) {
    case "universetoday.com": {
      emoji = "🔬 ";
      break;
    }
    case "washingtonpost.com":
    case "nymag.com":
    case "nytimes.com":
    case "theguardian.com":
    case "theatlantic.com": {
      emoji = "📰 ";
      break;
    }
    case "youtube.com": {
      emoji = "📹 ";
      break;
    }
    case "npmjs.com":
    case "github.com": {
      emoji = "👾 ";
      break;
    }
    default: {
    }
  }

  return emoji;
}
