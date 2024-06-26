export default function domainToEmoji(urlDomain: string) {
  if (urlDomain.includes("github.io")) {
    return "👾 ";
  }
  if (
    urlDomain.includes("substack.com") ||
    urlDomain.includes("blogspot.com")
  ) {
    return "👨‍💻 ";
  }
  if (urlDomain.includes(".edu")) {
    return "🔬 ";
  }

  let emoji = "";
  switch (urlDomain.replaceAll("www.", "")) {
    case "en.wikipedia.org": {
      emoji = "📚 ";
      break;
    }
    case "whoishiring.com": {
      emoji = "🧑‍🔧 ";
      break;
    }
    case "boredzo.org":
    case "fabiensanglard.net":
    case "fsturmat.net":
    case "spakhm.com":
    case "justine.lol": {
      emoji = "👨‍💻 ";
      break;
    }
    case "sciencealert.com":
    case "phys.org":
    case "acs.org":
    case "pubs.acs.org":
    case "universetoday.com": {
      emoji = "🔬 ";
      break;
    }
    case "theverge.com":
    case "techcrunch.com": {
      emoji = "🖥️ ";
      break;
    }
    case "cnn.com":
    case "archive.nytimes.com":
    case "japantimes.co.jp":
    case "npr.org":
    case "text.npr.org":
    case "wsj.com":
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
    case "developer.mozilla.org":
    case "bun.sh":
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
