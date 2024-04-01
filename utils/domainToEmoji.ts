export default function domainToEmoji(urlDomain: string) {
  if (urlDomain.includes("github.io")) {
    return "👾 ";
  }
  if (urlDomain.includes("substack.com")) {
    return "👨‍💻 ";
  }
  if (urlDomain.includes(".edu")) {
    return "🔬 ";
  }

  let emoji = "";
  switch (urlDomain.replaceAll("www.", "")) {
    case "boredzo.org":
    case "fabiensanglard.net":
    case "fsturmat.net":
    case "spakhm.com":
    case "justine.lol": {
      emoji = "👨‍💻 ";
      break;
    }
    case "acs.org":
    case "pubs.acs.org":
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
